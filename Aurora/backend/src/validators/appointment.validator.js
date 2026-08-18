const { ValidationError, ForbiddenError } = require('../errors');
const appointmentRepository = require('../repositories/appointmentRepository');

function parseNumericId(val) {
  if (val === null || val === undefined || val === '') return null;

  const strVal = String(val);

  if (!/^\d+$/.test(strVal)) {
    return null;
  }

  return parseInt(strVal, 10);
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

function validateCompleteEdit(role, existing) {
  const ALLOWED_OVERRIDE_ROLES = ['owner', 'admin'];
  const GRACE_PERIOD_HOURS = 24;

  const isLockedStatus = ['completed', 'cancelled'].includes(existing.status);
  const isElevatedRole = ALLOWED_OVERRIDE_ROLES.includes(role?.toLowerCase());

  if (isLockedStatus && !isElevatedRole) {
    const completedTime = new Date(existing.completedAt || existing.updatedAt || existing.date).getTime();
    const currentTime = Date.now();
    const hoursSinceCompletion = (currentTime - completedTime) / (1000 * 60 * 60);

    if (hoursSinceCompletion > GRACE_PERIOD_HOURS) {
      throw new ForbiddenError(
        `Cannot update a ${existing.status} appointment older than 24 hours. Please contact an Owner or Admin.`
      );
    }
  }
}

function validateDate(dateStr, role = null) {
  if (!dateStr) {
    throw new ValidationError('Appointment date is required.');
  }

  const cleanDate = dateStr.includes('T')
    ? dateStr.split('T')[0]
    : dateStr;

  const today = new Date().toISOString().split('T')[0];

  if (cleanDate < today && role?.trim().toLowerCase() !== 'owner') {
    throw new ValidationError('Cannot schedule appointments in the past.');
  }

  return cleanDate;
}

function validatePayment(amount, paidAmount) {
  const parsedAmount = amount ? parseFloat(amount) : 0;
  const parsedPaidAmount = paidAmount ? parseFloat(paidAmount) : 0;

  if (!Number.isFinite(parsedAmount)) {
    throw new ValidationError('Invalid total amount provided.');
  }

  if (!Number.isFinite(parsedPaidAmount)) {
    throw new ValidationError('Invalid paid amount provided.');
  }

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
    'services',
    'durationMinutes'
  ];

  const attemptedUpdateFields = Object.keys(data);
  const invalidField = attemptedUpdateFields.find(field => !CUSTOMER_EDITABLE_FIELDS.includes(field));

  if (invalidField) {
    throw new ValidationError(
      `Customers are not allowed to modify the '${invalidField}' field. You can only modify: ${CUSTOMER_EDITABLE_FIELDS.join(', ')}.`
    );
  }
}

async function validateServices(tenantId, services, client) {
  if (!services || !Array.isArray(services) || services.length === 0) {
    return [];
  }

  const cleanServices = services.map((s) => {
    const serviceId = parseNumericId(s.serviceId);

    if (serviceId === null) {
      throw new ValidationError('One or more selected services have an invalid ID.');
    }

    const price = s.price !== undefined
      ? parseFloat(s.price)
      : 0;

    if (!Number.isFinite(price) || price < 0) {
      throw new ValidationError(`Invalid price provided for service ID ${serviceId}.`);
    }

    return {
      serviceId,
      price
    };
  });

  const serviceIds = cleanServices.map(s => s.serviceId);

  const isValid =
    await appointmentRepository.validateServicesBelongToTenant(
      tenantId,
      serviceIds,
      client
    );

  if (!isValid) {
    throw new ValidationError(
      'One or more selected services are invalid or inactive.'
    );
  }

  return cleanServices;
}

module.exports = {
  parseNumericId,
  validateDate,
  validatePayment,
  calculatePaymentStatus,
  validateStaff,
  validateServices,
  validateStatusTransition,
  validateAppointmentActionRole,
  validateCustomerAction,
  validateCustomerUpdate,
  validateCompleteEdit
};