const db = require('../config/db');
const appointmentRepository = require('../repositories/appointmentRepository');
const appointmentPackageService = require('./appointmentPackageService');
const customerService = require('./customerService');
const { ValidationError, NotFoundError } = require('../errors');
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

    const initialStatus = data.status || 'scheduled';
    if (role.toLowerCase() === 'customer' && initialStatus !== 'scheduled') {
      throw new ValidationError('Customers can only create appointments with a "scheduled" status.');
    }

    const customerId = await customerService.resolveCustomer(tenantId, data, userId, client);

    if (role === 'Customer' && customerId !== userId) {
      throw new ValidationError("You can only create you appointment")
    }

    const packageId = parseNumericId(data.customerPackageId);
    if (data.isPackageAppointment && packageId) {
      await appointmentPackageService.validatePackage(tenantId, packageId, customerId, client);
      const packageServiceIds = cleanServices.map(s => s.serviceId);
      await appointmentPackageService.consumePackage(tenantId, packageId, null, packageServiceIds, client);
    }

    const fullPayment = { ...payment, ...paymentCalc };
    const payload = buildBookingPayload(data, customerId, cleanDate, fullPayment, cleanStaffId, cleanServices, initialStatus);

    // Right now we are allowing one staff to be booked multiple times in same slot. If you want to restrict that, uncomment the following block and handle overlap checks accordingly.
    // const hasOverlap = await appointmentRepository.hasStaffOverlap(
    //   tenantId,cleanStaffId,payload.date,payload.startTime,payload.endTime,null,client
    // );
    // if (hasOverlap) {
    //   throw new ConflictError('Staff is already booked for this time slot.');
    // }

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

    validateCustomerUpdate(role, userId, existing, data);
    validateCompleteEdit(role, existing);

    // Lock structural fields
    if (data.customerId && parseNumericId(data.customerId) !== existing.customerId) {
      throw new ValidationError('Cannot change customer on an existing appointment.');
    }
    if (data.customerPackageId && parseNumericId(data.customerPackageId) !== existing.customerPackageId) {
      throw new ValidationError('Cannot change package on an existing appointment.');
    }

    // Centralized status transition validation
    if (data.status && data.status !== existing.status) {
      validateStatusTransition(existing.status, data.status, role);
    }

    const cleanDate = validateDate(data.date || existing.date);
    const payment = validatePayment(
      data.amount !== undefined ? data.amount : existing.amount,
      data.paidAmount !== undefined ? data.paidAmount : existing.paidAmount
    );
    const paymentCalc = calculatePaymentStatus(payment.parsedAmount, payment.parsedPaidAmount, data.paymentStatus);
    const cleanStaffId = await validateStaff(tenantId, parseNumericId(data.staffId || existing.staffId), client);

    // If data.services is not provided, use existing services to prevent accidental deletion.
    const cleanServices = data.services !== undefined
      ? await validateServices(tenantId, data.services, client)
      : existing.services;

    const fullPayment = { ...payment, ...paymentCalc };
    const payload = buildBookingPayload(
      data,
      existing.customerId,
      cleanDate,
      fullPayment,
      cleanStaffId,
      cleanServices, // Services are replaced, not merged
      data.status || existing.status
    );

    // Right now we are allowing one staff to be booked multiple times in same slot. If you want to restrict that, uncomment the following block and handle overlap checks accordingly.
    // const hasOverlap = await appointmentRepository.hasStaffOverlap(
    //   tenantId,cleanStaffId,payload.date,payload.startTime,payload.endTime,id,client
    // );
    // if (hasOverlap) {
    //   throw new ConflictError('Staff is already booked for this time slot.');
    // }

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

function validateCompleteEdit(role, existing) {
  const ALLOWED_OVERRIDE_ROLES = ['owner', 'admin'];
  const GRACE_PERIOD_HOURS = 24;

  const isLockedStatus = ['completed', 'cancelled'].includes(existing.status);
  const isElevatedRole = ALLOWED_OVERRIDE_ROLES.includes(role?.toLowerCase());

  if (isLockedStatus && !isElevatedRole) {
    // Use completedAt, or fallback to updatedAt / appointment date
    const completedTime = new Date(existing.completedAt || existing.updatedAt || existing.date).getTime();
    const currentTime = Date.now();

    const hoursSinceCompletion = (currentTime - completedTime) / (1000 * 60 * 60);

    if (hoursSinceCompletion > GRACE_PERIOD_HOURS) {
      throw new ValidationError(
        `Cannot update a ${existing.status} appointment older than 24 hours. Please contact an Owner or Admin.`
      );
    }
  }
}

async function finishAppointment(tenantId, role, id, data = {}, userId) {
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    validateAppointmentActionRole(role);

    const appointment = await getAppointmentForAction(
      tenantId,
      id,
      client
    );

    validateStatusTransition(appointment.status, 'completed', role);

    const finalPaidAmount =
      data.paidAmount !== undefined
        ? parseFloat(data.paidAmount)
        : appointment.paidAmount;

    const payment = validatePayment(
      appointment.amount,
      finalPaidAmount
    );

    const paymentCalc = calculatePaymentStatus(
      payment.parsedAmount,
      payment.parsedPaidAmount,
      data.paymentStatus
    );

    await appointmentRepository.updateStatus(
      tenantId,
      id,
      'completed',
      userId,
      client
    );

    await appointmentRepository.updatePayment(
      tenantId,
      id,
      {
        ...payment,
        ...paymentCalc,
      },
      client
    );

    await customerService.updateStatistics(
      tenantId,
      appointment.customerId,
      client
    );

    await client.query('COMMIT');

    return {
      id,
      status: 'completed',
      paymentStatus: paymentCalc.paymentStatus,
      balanceDue: paymentCalc.balanceDue,
    };

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function cancelAppointment(
  tenantId,
  role,
  id,
  reason,
  userId
) {
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const appointment = await getAppointmentForAction(
      tenantId,
      id,
      client
    );
    validateCustomerAction(role, userId, appointment, 'cancel');
    validateStatusTransition(appointment.status, 'cancelled', role);

    // Restore package services if this appointment consumed a package.
    if (appointment.isPackageAppointment && appointment.customerPackageId) {
      const { rows } = await client.query(
        `
          SELECT service_id
          FROM appointment_services
          WHERE appointment_id = $1
            AND is_package_usage = true
        `,
        [id]
      );

      const packageServiceIds = rows.map(
        row => row.service_id
      );

      if (packageServiceIds.length > 0) {
        await appointmentPackageService.restorePackage(
          tenantId,
          appointment.customerPackageId,
          id,
          packageServiceIds,
          client
        );
      }
    }

    await appointmentRepository.updateStatus(
      tenantId,
      id,
      'cancelled',
      userId,
      client,
      reason
    );

    await customerService.updateStatistics(
      tenantId,
      appointment.customerId,
      client
    );

    await client.query('COMMIT');

    return {
      id,
      status: 'cancelled',
    };

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function getAppointmentForAction(tenantId, id, client) {
  const appointment = await appointmentRepository.getAppointmentById(tenantId, id, client);

  if (!appointment) {
    throw new NotFoundError('Appointment not found.');
  }

  return appointment;
}

function validateAppointmentActionRole(role) {
  const normalizedRole = role?.trim().toLowerCase();

  if (!['owner', 'admin', 'staff'].includes(normalizedRole)) {
    throw new ValidationError('Only admin or staff users can perform this action.');
  }

  return normalizedRole;
}

function validateCustomerAction(role, userId, appointment, action) {
  const normalizedRole = role?.trim().toLowerCase();
  if (normalizedRole === 'customer') {
    if (appointment.customerId !== userId) {
      throw new ValidationError(`You do not have permission to ${action} this appointment.`);
    }
    if (action === 'cancel' && appointment.status !== 'scheduled') {
      throw new ValidationError('Only scheduled appointments can be cancelled by a customer.');
    }
  } else {
    validateAppointmentActionRole(role);
  }
}

function validateCustomerUpdate(role, userId, existing, data) {
  const normalizedRole = role?.trim().toLowerCase();
  if (normalizedRole !== 'customer') {
    return; // This check is only for customers
  }

  if (existing.customerId !== userId) {
    throw new ValidationError('You can only update your own appointments.');
  }

  if (existing.status !== 'scheduled') {
    throw new ValidationError('Customers can only modify scheduled appointments.');
  }

  const CUSTOMER_EDITABLE_FIELDS = [
    'date',
    'startTime',
    'notes',
    'services'
    // durationMinutes is implicitly changed by services, so not listed here.
  ];

  const attemptedUpdateFields = Object.keys(data);
  const invalidField = attemptedUpdateFields.find(field => !CUSTOMER_EDITABLE_FIELDS.includes(field));

  if (invalidField) {
    throw new ValidationError(`Customers are not allowed to modify the '${invalidField}' field. You can only modify: ${CUSTOMER_EDITABLE_FIELDS.join(', ')}.`);
  }
}

function validateStatusTransition(currentStatus, newStatus, role) {
  const transitions = {
    scheduled: ['confirmed', 'cancelled', 'completed'],
    confirmed: ['cancelled', 'completed'],
    cancelled: [],
    completed: []
  };

  if (!transitions[currentStatus] || !transitions[currentStatus].includes(newStatus)) {
    throw new ValidationError(`Cannot transition appointment from '${currentStatus}' to '${newStatus}'.`);
  }
}

module.exports = {
  getAppointmentById,
  createAppointment,
  updateAppointment,
  finishAppointment,
  cancelAppointment
};