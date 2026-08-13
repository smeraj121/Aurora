const db = require('../config/db');
const appointmentRepository = require('../repositories/appointmentRepository');
const appointmentPackageService = require('./appointmentPackageService');
const customerService = require('./customerService');
const { ValidationError, NotFoundError } = require('../errors');
const { get } = require('../routes/calendarRoutes');
const e = require('express');
const TimeHelper = require('../utils/timeHelper');

// ============================================================
// HELPER UTILITIES & DISCRETE VALIDATORS
// ============================================================
function parseNumericId(val) {
  if (!val) return null;
  const digits = String(val).replace(/\D/g, '');
  return digits ? parseInt(digits, 10) : null;
}

function validateDate(dateStr) {
  if (!dateStr) {
    throw new ValidationError('Appointment date is required.');
  }
  let cleanDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  const today = new Date().toISOString().split('T')[0];

  if (cleanDate < today) {
    throw new ValidationError('Cannot schedule appointments in the past.');
  }
  return cleanDate;
}

function validatePayment(amount, paidAmount) {
  const parsedAmount = amount ? parseFloat(amount) : 0;
  const parsedPaidAmount = paidAmount ? parseFloat(paidAmount) : 0;

  if (parsedAmount < 0) {
    throw new ValidationError('Appointment total price cannot be negative.');
  }
  if (parsedPaidAmount < 0) {
    throw new ValidationError('Paid amount cannot be negative.');
  }
  if (parsedPaidAmount > parsedAmount) {
    throw new ValidationError('Paid amount cannot exceed the total appointment amount.');
  }

  return { parsedAmount, parsedPaidAmount };
}

function calculatePaymentStatus(parsedAmount, parsedPaidAmount, inputStatus) {
  let status = inputStatus || 'pending';
  if (parsedPaidAmount >= parsedAmount && parsedAmount > 0) {
    status = 'paid';
  } else if (parsedPaidAmount > 0) {
    status = 'partial';
  } else {
    status = 'pending';
  }

  return {
    paymentStatus: status,
    balanceDue: parsedAmount - parsedPaidAmount,
    paymentDate: parsedPaidAmount > 0 ? new Date().toISOString() : null
  };
}

async function validateStaff(tenantId, staffId, client) {
  if (!staffId) return null;
  const isValid = await appointmentRepository.validateStaffBelongsToTenant(tenantId, staffId, client);
  if (!isValid) {
    throw new ValidationError('Selected staff member is invalid or inactive.');
  }
  return staffId;
}

async function validateStatus(role, status) {
  const validStatuses = ['scheduled', 'confirmed', 'cancelled', 'completed'];
  if (!validStatuses.includes(status)) {
    throw new ValidationError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }
  // Restrict certain status changes based on user role
  else if (role.trim().toLowerCase() === 'customer' && ['confirmed', 'cancelled', 'completed'].includes(status)) {
    throw new ValidationError('Only admin/staff users can set status to scheduled, cancelled or completed.');
  }
  return status;
}

async function validateServices(tenantId, services, client) {
  if (!services || !Array.isArray(services) || services.length === 0) {
    return [];
  }

  const cleanServices = services
    .map((s) => ({
      serviceId: parseNumericId(s.serviceId),
      price: s.price ? parseFloat(s.price) : 0
    }))
    .filter((s) => s.serviceId !== null);

  const serviceIds = cleanServices.map((s) => s.serviceId);
  const isValid = await appointmentRepository.validateServicesBelongToTenant(tenantId, serviceIds, client);
  if (!isValid) {
    throw new ValidationError('One or more selected services are invalid or inactive.');
  }

  return cleanServices;
}

function buildBookingPayload(data, customerId, cleanDate, payment, cleanStaffId, cleanServices, forcedStatus) {
  var startTime = TimeHelper.toDb(data.startTime);
  var endTime = TimeHelper.toDb(TimeHelper.addMinutes(startTime, parseInt(data.durationMinutes, 10)));
  return {
    customerId,
    staffId: cleanStaffId,
    services: cleanServices,
    date: cleanDate,
    startTime: startTime,
    endTime: endTime,
    durationMinutes: parseInt(data.durationMinutes, 10),
    amount: payment.parsedAmount,
    paidAmount: payment.parsedPaidAmount,
    paymentStatus: payment.paymentStatus,
    paymentMethod: data.paymentMethod || null,
    paymentDate: payment.paymentDate,
    notes: data.notes || data.customer_notes || '',
    status: forcedStatus,
    customerPackageId: parseNumericId(data.customerPackageId),
    isPackageAppointment: Boolean(data.isPackageAppointment)
  };
}

// ============================================================
// WORKFLOW IMPLEMENTATIONS
// ============================================================

async function getAppointmentById(tenantId, id, role, userId) {
  const appointment = await appointmentRepository.getAppointmentById(tenantId, id);
  if (!appointment) {
    throw new NotFoundError('Appointment not found.');
  }
  // Implement role-based access control
  if (role.trim().toLowerCase() === 'customer' && userId !== appointment.customerId) {
    throw new ValidationError('You are not the owner of this appointment.');
  }
  return appointment;
}

async function createAppointment(tenantId, role, data, userId) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const cleanDate = validateDate(data.date);
    const payment = validatePayment(data.amount, data.paidAmount);
    const paymentCalc = calculatePaymentStatus(payment.parsedAmount, payment.parsedPaidAmount, data.paymentStatus);
    const cleanStaffId = await validateStaff(tenantId, parseNumericId(data.staffId), client);
    const cleanServices = await validateServices(tenantId, data.services, client);
    const clearStatus = await validateStatus(role, data.status);
    const customerId = await customerService.resolveCustomer(tenantId, data, userId, client);

    const packageId = parseNumericId(data.customerPackageId);
    if (data.isPackageAppointment && packageId) {
      await appointmentPackageService.validatePackage(tenantId, packageId, customerId, client);
      const packageServiceIds = cleanServices.map(s => s.serviceId);
      await appointmentPackageService.consumePackage(tenantId, packageId, null, packageServiceIds, client);
    }

    const fullPayment = { ...payment, ...paymentCalc };
    const payload = buildBookingPayload(data, customerId, cleanDate, fullPayment, cleanStaffId, cleanServices, clearStatus);

    const appointment = await appointmentRepository.createAppointment(tenantId, payload, userId, client);
    await appointmentRepository.replaceAppointmentServices(
      tenantId,
      appointment.id,
      payload.services,
      payload.customerPackageId,
      client
    );

    await client.query('COMMIT');

    return {
      id: appointment.id,
      customerId,
      status: 'scheduled',
      paymentStatus: paymentCalc.paymentStatus,
      balanceDue: paymentCalc.balanceDue
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function updateAppointment(tenantId, role, id, data, userId) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const existing = await appointmentRepository.getAppointmentById(tenantId, id, client);
    if (!existing) {
      throw new NotFoundError('Appointment not found.');
    }
    
    if (role.trim().toLowerCase() === 'customer' && userId !== existing.customerId) {
      throw new ValidationError('Only admin or staff users can update appointments.');
    }

    if (['completed', 'cancelled'].includes(existing.status)) {
      throw new ValidationError(`Cannot update an appointment that is already ${existing.status}.`);
    }

    // Lock structural fields
    if (data.customerId && parseNumericId(data.customerId) !== existing.customerId) {
      throw new ValidationError('Cannot change customer on an existing appointment.');
    }
    if (data.customerPackageId && parseNumericId(data.customerPackageId) !== existing.customerPackageId) {
      throw new ValidationError('Cannot change package on an existing appointment.');
    }

    const cleanDate = validateDate(data.date || existing.date);
    const payment = validatePayment(
      data.amount !== undefined ? data.amount : existing.amount,
      data.paidAmount !== undefined ? data.paidAmount : existing.paidAmount
    );
    const paymentCalc = calculatePaymentStatus(payment.parsedAmount, payment.parsedPaidAmount, data.paymentStatus);
    const cleanStaffId = await validateStaff(tenantId, parseNumericId(data.staffId || existing.staffId), client);
    const cleanServices = await validateServices(tenantId, data.services, client);

    const fullPayment = { ...payment, ...paymentCalc };
    const payload = buildBookingPayload(
      data,
      existing.customerId,
      cleanDate,
      fullPayment,
      cleanStaffId,
      cleanServices,
      existing.status
    );

    const appointment = await appointmentRepository.updateAppointment(tenantId, id, payload, userId, client);
    await appointmentRepository.replaceAppointmentServices(
      tenantId,
      id,
      payload.services,
      existing.customerPackageId,
      client
    );

    await client.query('COMMIT');

    return {
      id: appointment.id,
      customerId: existing.customerId,
      status: existing.status,
      paymentStatus: paymentCalc.paymentStatus,
      balanceDue: paymentCalc.balanceDue
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function finishAppointment(tenantId, role, id, data, userId) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const appointment = await appointmentRepository.getAppointmentById(tenantId, id, client);
    if (!appointment) {
      throw new NotFoundError('Appointment not found.');
    }
    if (role.trim().toLowerCase() !== 'admin' && role.trim().toLowerCase() !== 'staff') {
      throw new ValidationError('Only admin or staff users can finish appointments.');
    }
    var status = await validateStatus(role, data.status || 'completed');
    if (appointment.status === 'completed') {
      throw new ValidationError('Appointment is already completed.');
    }
    if (appointment.status === 'cancelled') {
      throw new ValidationError('Cannot finish a cancelled appointment.');
    }

    const finalPaidAmount = data && data.paidAmount !== undefined ? parseFloat(data.paidAmount) : appointment.paidAmount;
    const payment = validatePayment(appointment.amount, finalPaidAmount);
    const paymentCalc = calculatePaymentStatus(payment.parsedAmount, payment.parsedPaidAmount, data?.paymentStatus);

    await appointmentRepository.updateStatus(tenantId, id, status, userId, client);
    await appointmentRepository.updatePayment(tenantId, id, { ...payment, ...paymentCalc }, client);

    await customerService.updateStatistics(
      tenantId,
      appointment.customerId,
      payment.parsedPaidAmount,
      appointment.date,
      client
    );

    await client.query('COMMIT');

    return {
      id,
      status: 'completed',
      paymentStatus: paymentCalc.paymentStatus,
      balanceDue: paymentCalc.balanceDue
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function cancelAppointment(tenantId, id, reason, userId) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const appointment = await appointmentRepository.getAppointmentById(tenantId, id, client);
    if (!appointment) {
      throw new NotFoundError('Appointment not found.');
    }
    if (appointment.status === 'cancelled') {
      throw new ValidationError('Appointment is already cancelled.');
    }
    if (appointment.status === 'completed') {
      throw new ValidationError('Cannot cancel an appointment that has already been completed.');
    }

    if (appointment.isPackageAppointment && appointment.customerPackageId) {
      const { rows: serviceRows } = await client.query(
        `SELECT service_id FROM appointment_services WHERE appointment_id = $1 AND is_package_usage = true`,
        [id]
      );
      const packageServiceIds = serviceRows.map(r => r.service_id);
      if (packageServiceIds.length > 0) {
        await appointmentPackageService.restorePackage(tenantId, appointment.customerPackageId, id, packageServiceIds, client);
      }
    }

    await appointmentRepository.updateStatus(tenantId, id, 'cancelled', userId, client, reason);

    await client.query('COMMIT');

    return { id, status: 'cancelled' };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  getAppointmentById,
  createAppointment,
  updateAppointment,
  finishAppointment,
  cancelAppointment
};