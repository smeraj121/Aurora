const db = require('../config/db');
const appointmentRepository = require('../repositories/appointmentRepository');
const appointmentPackageService = require('./appointmentPackageService');
const customerService = require('./customerService');
const { ValidationError, NotFoundError } = require('../errors');
const TimeHelper = require('../utils/timeHelper');


const {
  parseNumericId,
  validateDate,
  validatePayment,
  calculatePaymentStatus,
  validateStaff,
  validateServices,
  validateStatusTransition,
  validateCustomerAction,
  validateCustomerUpdate,
  validateCompleteEdit,
  validateAppointmentActionRole 
} = require('../validators/appointment.validator');

// ============================================================
// HELPER: BUILD BOOKING PAYLOAD (CORRECTED SIGNATURE)
// ============================================================
function buildBookingPayload(data, existing, customerId, cleanDate, payment, cleanStaffId, cleanServices, forcedStatus) {
  // Use data values or fallback to existing appointment
  const startTime = data.startTime !== undefined ? TimeHelper.toDb(data.startTime) : existing.startTime;
  // Optional: compute duration from services if not explicitly provided
  // (Here we rely on durationMinutes from data or existing; you may extend this)
  const duration = data.durationMinutes !== undefined ? parseInt(data.durationMinutes, 10) : existing.durationMinutes;
  const endTime = TimeHelper.toDb(TimeHelper.addMinutes(startTime, duration));

  const newPaymentDate = (data.paidAmount !== undefined && data.paidAmount > 0)
    ? new Date().toISOString()
    : existing.paymentDate;

  const isPackageAppointment = data.isPackageAppointment !== undefined
    ? data.isPackageAppointment === true || data.isPackageAppointment === 'true'
    : existing.isPackageAppointment;

  return {
    customerId,
    staffId: cleanStaffId,
    services: cleanServices,
    date: cleanDate,
    startTime,
    endTime,
    durationMinutes: duration,
    amount: payment.parsedAmount,
    paidAmount: payment.parsedPaidAmount,
    paymentStatus: payment.paymentStatus,
    paymentMethod: data.paymentMethod !== undefined ? data.paymentMethod : existing.paymentMethod,
    paymentDate: newPaymentDate,
    notes: data.notes !== undefined ? (data.notes || data.customer_notes || '') : existing.notes,
    status: forcedStatus,
    customerPackageId: data.customerPackageId !== undefined ? parseNumericId(data.customerPackageId) : existing.customerPackageId,
    isPackageAppointment
  };
}

function validateDurationMinutes(value) {
  const duration = Number(value);
  if (!Number.isInteger(duration) || duration <= 0) {
    throw new ValidationError('Appointment duration must be a positive whole number of minutes.');
  }
  return duration;
}

async function reconcilePackageUsage(tenantId, appointmentId, existing, payload, client) {
  const originalPackageServiceIds = existing.isPackageAppointment
    ? existing.services.filter(service => service.isPackage).map(service => service.serviceId)
    : [];
  const newPackageServiceIds = payload.services.map(service => service.serviceId);
  const packageChanged = existing.isPackageAppointment
    && (!payload.isPackageAppointment || payload.customerPackageId !== existing.customerPackageId);

  if (existing.isPackageAppointment && packageChanged) {
    await appointmentPackageService.restorePackage(
      tenantId,
      existing.customerPackageId,
      appointmentId,
      originalPackageServiceIds,
      client
    );
  }

  if (!payload.isPackageAppointment) return;

  if (!payload.customerPackageId) {
    throw new ValidationError('A customer package is required for a package appointment.');
  }

  if (!existing.isPackageAppointment || packageChanged) {
    await appointmentPackageService.validatePackage(
      tenantId,
      payload.customerPackageId,
      existing.customerId,
      newPackageServiceIds,
      client
    );
    await appointmentPackageService.consumePackage(
      tenantId,
      payload.customerPackageId,
      appointmentId,
      newPackageServiceIds,
      client
    );
    return;
  }

  const servicesToAdd = newPackageServiceIds.filter(serviceId => !originalPackageServiceIds.includes(serviceId));
  const servicesToRemove = originalPackageServiceIds.filter(serviceId => !newPackageServiceIds.includes(serviceId));
  await appointmentPackageService.restorePackage(
    tenantId,
    payload.customerPackageId,
    appointmentId,
    servicesToRemove,
    client
  );
  await appointmentPackageService.validatePackage(
    tenantId,
    payload.customerPackageId,
    existing.customerId,
    servicesToAdd,
    client
  );
  await appointmentPackageService.consumePackage(
    tenantId,
    payload.customerPackageId,
    appointmentId,
    servicesToAdd,
    client
  );
}

// ============================================================
// EXPOSED FUNCTIONS
// ============================================================

async function getAppointmentById(tenantId, id, role, userId) {
  const appointment = await appointmentRepository.getAppointmentById(tenantId, id);
  if (!appointment) {
    throw new NotFoundError('Appointment not found.');
  }
  if (role?.trim().toLowerCase() === 'customer' && userId !== appointment.customerId) {
    throw new ValidationError('You are not the owner of this appointment.');
  }
  return appointment;
}

async function createAppointment(tenantId, role, data, userId) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // Basic validations
    const cleanDate = validateDate(data.date);
    const payment = validatePayment(data.amount, data.paidAmount);
    const paymentCalc = calculatePaymentStatus(payment.parsedAmount, payment.parsedPaidAmount, data.paymentStatus);
    const cleanStaffId = await validateStaff(tenantId, parseNumericId(data.staffId), client);
    const cleanServices = await validateServices(tenantId, data.services, client);

    // Ensure at least one service (if business rule requires it)
    if (cleanServices.length === 0) {
      throw new ValidationError('At least one service is required.');
    }

    const initialStatus = data.status || 'scheduled';
    if (role?.toLowerCase() === 'customer' && initialStatus !== 'scheduled') {
      throw new ValidationError('Customers can only create appointments with a "scheduled" status.');
    }

    const customerId = await customerService.resolveCustomer(tenantId, data, userId, client);

    if (role?.toLowerCase() === 'customer' && customerId !== userId) {
      throw new ValidationError('You can only create your own appointments.');
    }

    const packageId = parseNumericId(data.customerPackageId);
    const isPackageAppointment = data.isPackageAppointment === true || data.isPackageAppointment === 'true';
    if (isPackageAppointment) {
      if (!packageId) {
        throw new ValidationError('A customer package is required for a package appointment.');
      }
      const packageServiceIds = cleanServices.map(s => s.serviceId);
      await appointmentPackageService.validatePackage(tenantId, packageId, customerId, packageServiceIds, client);
      await appointmentPackageService.consumePackage(tenantId, packageId, null, packageServiceIds, client);
    }

    const fullPayment = { ...payment, ...paymentCalc };
    // Pass an empty object as "existing" because there is no previous appointment
    const payload = buildBookingPayload(
      data,          // input data
      {},            // no existing appointment
      customerId,
      cleanDate,
      fullPayment,
      cleanStaffId,
      cleanServices,
      initialStatus
    );

    // Optionally check for staff overlap (commented out in original)
    // const hasOverlap = await appointmentRepository.hasStaffOverlap(...);
    // if (hasOverlap) throw new ConflictError('...');

    const appointment = await appointmentRepository.createAppointment(tenantId, payload, userId, client);
    await appointmentRepository.replaceAppointmentServices(
      tenantId,
      appointment.id,
      payload.services,
      payload.customerPackageId,
      payload.isPackageAppointment,
      client
    );

    await client.query('COMMIT');

    return {
      id: appointment.id,
      customerId,
      status: appointment.status,
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

    // First, acquire a row-level lock to prevent race conditions.
    const locked = await appointmentRepository.lockAppointmentById(tenantId, id, client);
    if (!locked) {
      throw new NotFoundError('Appointment not found.');
    }
    // Then, get the full appointment data using the same transaction.
    const existing = await appointmentRepository.getAppointmentById(tenantId, id, client);
    if (!existing) {
      throw new NotFoundError('Appointment not found.');
    }

    // Customer-specific restrictions
    validateCustomerUpdate(role, userId, existing, data);
    validateCompleteEdit(role, existing);

    // Lock structural fields – cannot be changed
    if (data.customerId && parseNumericId(data.customerId) !== existing.customerId) {
      throw new ValidationError('Cannot change customer on an existing appointment.');
    }

    // Build sanitized update data for customers (only allowed fields)
    let updateData = data;
    if (role?.toLowerCase() === 'customer') {
      const CUSTOMER_EDITABLE_FIELDS = ['date', 'startTime', 'notes', 'services', 'durationMinutes'];
      updateData = {};
      CUSTOMER_EDITABLE_FIELDS.forEach(field => {
        if (data[field] !== undefined) {
          updateData[field] = data[field];
        }
      });
      // Prevent status changes via customer update
      delete updateData.status;
    }

    // Validate status transition if status is being updated (only 'confirmed' allowed via this endpoint)
    if (updateData.status && updateData.status !== existing.status) {
      //if (updateData.status !== 'confirmed') {
        //throw new ValidationError(`To change status to '${updateData.status}', please use the dedicated endpoint.`);
      //}
      validateStatusTransition(existing.status, updateData.status, role);
    }

    // Validate date, payment, staff, services using updateData (or fallback to existing)
    const cleanDate = validateDate(updateData.date || existing.date, role);
    const payment = validatePayment(
      updateData.amount !== undefined ? updateData.amount : existing.amount,
      updateData.paidAmount !== undefined ? updateData.paidAmount : existing.paidAmount
    );
    const paymentCalc = calculatePaymentStatus(payment.parsedAmount, payment.parsedPaidAmount, updateData.paymentStatus);
    const cleanStaffId = await validateStaff(tenantId, parseNumericId(updateData.staffId || existing.staffId), client);

    // If services are being updated, validate the new list; otherwise keep existing services
    const cleanServices = updateData.services !== undefined
      ? await validateServices(tenantId, updateData.services, client)
      : existing.services;

    // Ensure services are present (if business rule requires)
    if (cleanServices.length === 0) {
      throw new ValidationError('At least one service is required.');
    }

    // Optional: compute duration from services if not explicitly provided
    // (Here we rely on durationMinutes from data or existing; you may extend this)

    const fullPayment = { ...payment, ...paymentCalc };
    const finalStatus = updateData.status || existing.status;

    const payload = buildBookingPayload(
      updateData,      // use sanitized update data
      existing,        // fallback values
      existing.customerId,
      cleanDate,
      fullPayment,
      cleanStaffId,
      cleanServices,
      finalStatus
    );

    await reconcilePackageUsage(tenantId, id, existing, payload, client);

    // Optionally check for staff overlap (exclude this appointment by passing id)
    // const hasOverlap = await appointmentRepository.hasStaffOverlap(tenantId, cleanStaffId, payload.date, payload.startTime, payload.endTime, id, client);
    // if (hasOverlap) throw new ConflictError('...');

    const appointment = await appointmentRepository.updateAppointment(tenantId, id, payload, userId, client);
    await appointmentRepository.replaceAppointmentServices(
      tenantId,
      id,
      payload.services,
      payload.customerPackageId,
      payload.isPackageAppointment,
      client
    );

    await client.query('COMMIT');

    return {
      id: appointment.id,
      customerId: existing.customerId,
      status: appointment.status,
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

async function finishAppointment(tenantId, role, id, data = {}, userId) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    validateAppointmentActionRole(role);

    // First, acquire a row-level lock to prevent race conditions.
    const locked = await appointmentRepository.lockAppointmentById(tenantId, id, client);
    if (!locked) {
      throw new NotFoundError('Appointment not found.');
    }

    const appointment = await appointmentRepository.getAppointmentById(tenantId, id, client);
    if (!appointment) {
      throw new NotFoundError('Appointment not found.');
    }

    validateStatusTransition(appointment.status, 'completed', role);

    if (data.customerId !== undefined && parseNumericId(data.customerId) !== appointment.customerId) {
      throw new ValidationError('Cannot change customer on an existing appointment.');
    }

    const cleanDate = validateDate(data.date !== undefined ? data.date : appointment.date, role);
    const payment = validatePayment(
      data.amount !== undefined ? data.amount : appointment.amount,
      data.paidAmount !== undefined ? data.paidAmount : appointment.paidAmount
    );
    const paymentCalc = calculatePaymentStatus(payment.parsedAmount, payment.parsedPaidAmount, data.paymentStatus);
    const cleanStaffId = await validateStaff(
      tenantId,
      parseNumericId(data.staffId !== undefined ? data.staffId : appointment.staffId),
      client
    );
    const cleanServices = await validateServices(
      tenantId,
      data.services !== undefined ? data.services : appointment.services,
      client
    );
    if (cleanServices.length === 0) {
      throw new ValidationError('At least one service is required.');
    }

    const finishData = {
      ...data,
      durationMinutes: validateDurationMinutes(
        data.durationMinutes !== undefined ? data.durationMinutes : appointment.durationMinutes
      ),
    };
    const payload = buildBookingPayload(
      finishData,
      appointment,
      appointment.customerId,
      cleanDate,
      { ...payment, ...paymentCalc },
      cleanStaffId,
      cleanServices,
      'completed'
    );

    await reconcilePackageUsage(tenantId, id, appointment, payload, client);
    await appointmentRepository.updateAppointment(tenantId, id, payload, userId, client);
    await appointmentRepository.replaceAppointmentServices(
      tenantId,
      id,
      payload.services,
      payload.customerPackageId,
      payload.isPackageAppointment,
      client
    );
    await customerService.updateStatistics(tenantId, appointment.customerId, client);

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

async function cancelAppointment(tenantId, role, id, reason, userId) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // First, acquire a row-level lock to prevent race conditions.
    const locked = await appointmentRepository.lockAppointmentById(tenantId, id, client);
    if (!locked) {
      throw new NotFoundError('Appointment not found.');
    }

    const appointment = await appointmentRepository.getAppointmentById(tenantId, id, client);
    if (!appointment) {
      throw new NotFoundError('Appointment not found.');
    }

    validateCustomerAction(role, userId, appointment, 'cancel');
    validateStatusTransition(appointment.status, 'cancelled', role);

    // Restore package services if this appointment consumed a package
    if (appointment.isPackageAppointment && appointment.customerPackageId) {
      const { rows } = await client.query(
        `SELECT service_id FROM appointment_services
         WHERE appointment_id = $1 AND tenant_id = $2 AND is_package_usage = true`,
        [id, tenantId]
      );
      const packageServiceIds = rows.map(row => row.service_id);
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

    await appointmentRepository.updateStatus(tenantId, id, 'cancelled', userId, client, reason);
    await customerService.updateStatistics(tenantId, appointment.customerId, client);

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
