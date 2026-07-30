// services/calendarService.js
const calendarRepository = require('../repositories/calendarRepository');
const { NotFoundError, ValidationError, ConflictError } = require('../errors');

// ============================================================
// GET APPOINTMENT BY ID
// ============================================================
async function getAppointmentById(tenantId, appointmentId) {
  const appointment = await calendarRepository.getAppointmentById(tenantId, appointmentId);
  if (!appointment) {
    throw new NotFoundError('Appointment not found');
  }
  return appointment;
}

// ============================================================
// GET SCHEDULE BY DATE
// ============================================================
async function getScheduleByDate(tenantId, date) {
  if (!date) {
    throw new ValidationError('Date parameter is required');
  }
  const schedule = await calendarRepository.findScheduleByDate(tenantId, date);
  schedule.forEach((appointment) => {
    appointment.balanceDue = (appointment.amount || 0) - (appointment.paidAmount || 0);
  });
  return schedule;
}

// ============================================================
// GET AVAILABLE PACKAGES
// ============================================================
async function getAvailablePackages(tenantId) {
  return calendarRepository.getAvailablePackages(tenantId);
}

// ============================================================
// GET CUSTOMER PACKAGES (by customer ID)
// ============================================================
async function getCustomerPackages(tenantId, customerId) {
  return calendarRepository.getCustomerPackages(tenantId, customerId);
}

// ============================================================
// GET PENDING PAYMENTS
// ============================================================
async function getPendingPayments(tenantId) {
  return calendarRepository.getPendingPayments(tenantId);
}

// ============================================================
// UPDATE PAYMENT
// ============================================================
async function updatePayment(tenantId, appointmentId, paidAmount, paymentMethod, userId) {
  if (!appointmentId) throw new ValidationError('Appointment ID is required');
  if (paidAmount === undefined || paidAmount === null || paidAmount < 0) {
    throw new ValidationError('Valid paid amount is required');
  }
  return calendarRepository.updatePayment(tenantId, appointmentId, paidAmount, paymentMethod, userId);
}

// ============================================================
// PURCHASE PACKAGE
// ============================================================
async function purchasePackage(tenantId, customerId, packageId, paymentMethod, userId) {
  if (!customerId || !packageId) {
    throw new ValidationError('Customer ID and Package ID are required');
  }
  return calendarRepository.purchasePackage(tenantId, customerId, packageId, paymentMethod, userId);
}

// ============================================================
// CREATE OR UPDATE APPOINTMENT
// ============================================================
async function createOrUpdateAppointment(tenantId, data, userId) {
  // Data validation
  if (!data.customerName || !data.customerName.trim()) {
    throw new ValidationError('Customer name is required');
  }

  // Helper to parse numeric IDs
  const parseNumericId = (val) => {
    if (!val) return null;
    const digits = String(val).replace(/\D/g, '');
    return digits ? parseInt(digits, 10) : null;
  };

  const cleanAppointmentId = parseNumericId(data.id);
  let cleanCustomerId = parseNumericId(data.customerId);
  const cleanStaffId = parseNumericId(data.staffId);
  const cleanPackageId = parseNumericId(data.customerPackageId);
  const parsedAmount = data.amount ? parseFloat(data.amount) : 0;
  const parsedPaidAmount = data.paidAmount ? parseFloat(data.paidAmount) : 0;
  const cleanPhone = data.phone ? data.phone.trim() : null;

  // Extract date
  let appointmentDate = data.date;
  if (appointmentDate && appointmentDate.includes('T')) {
    appointmentDate = appointmentDate.split('T')[0];
  } else if (!appointmentDate) {
    appointmentDate = new Date().toISOString().split('T')[0];
  }

  // Parse services
  let cleanServices = [];
  if (data.services && Array.isArray(data.services)) {
    cleanServices = data.services.map(s => ({
      serviceId: parseNumericId(s.serviceId),
      price: s.price ? parseFloat(s.price) : 0
    })).filter(s => s.serviceId !== null);
  }

  // Determine payment status
  let finalPaymentStatus = data.paymentStatus || 'pending';
  if (parsedPaidAmount > 0 && parsedPaidAmount >= parsedAmount) {
    finalPaymentStatus = 'paid';
  } else if (parsedPaidAmount > 0) {
    finalPaymentStatus = 'partial';
  }

  // Resolve or create customer
  if (cleanCustomerId) {
    const existingCust = await calendarRepository.findCustomerById(tenantId, cleanCustomerId);
    if (!existingCust) {
      cleanCustomerId = null;
    }
  }

  if (!cleanCustomerId) {
    if (!cleanPhone) {
      throw new ValidationError('Phone number is required for new customers.');
    }
    const phoneMatch = await calendarRepository.findCustomerByPhone(tenantId, cleanPhone);
    if (phoneMatch) {
      if (phoneMatch.full_name.toLowerCase() !== data.customerName.trim().toLowerCase()) {
        throw new ConflictError(
          `A customer (${phoneMatch.full_name}) with phone "${cleanPhone}" is already registered.`
        );
      }
      cleanCustomerId = phoneMatch.id;
    } else {
      const newCustomer = await calendarRepository.createCustomer(tenantId, data.customerName.trim(), cleanPhone, userId);
      cleanCustomerId = newCustomer.id;
    }
  }

  // Build appointment payload
  const bookingPayload = {
    customerId: cleanCustomerId,
    staffId: cleanStaffId,
    services: cleanServices,
    date: appointmentDate,
    startTime: data.startTime || '11:00 AM',
    durationMinutes: data.durationMinutes ? parseInt(data.durationMinutes) : 30,
    amount: parsedAmount,
    paidAmount: parsedPaidAmount,
    paymentStatus: finalPaymentStatus,
    paymentMethod: data.paymentMethod || null,
    paymentDate: parsedPaidAmount > 0 ? new Date().toISOString() : null,
    notes: data.notes || '',
    status: data.status || 'scheduled',
    customerPackageId: cleanPackageId,
    isPackageAppointment: data.isPackageAppointment || false,
    userId: userId
  };

  let savedAppointment;
  if (cleanAppointmentId) {
    savedAppointment = await calendarRepository.updateAppointment(tenantId, cleanAppointmentId, bookingPayload);
  } else {
    savedAppointment = await calendarRepository.createAppointment(tenantId, bookingPayload);
  }

  const balanceDue = parsedAmount - parsedPaidAmount;

  return {
    id: savedAppointment.id,
    customerId: cleanCustomerId,
    paymentStatus: finalPaymentStatus,
    balanceDue,
    isPackageAppointment: data.isPackageAppointment || false
  };
}

module.exports = {
  getAppointmentById,
  getScheduleByDate,
  getAvailablePackages,
  getCustomerPackages,
  getPendingPayments,
  updatePayment,
  purchasePackage,
  createOrUpdateAppointment,
};