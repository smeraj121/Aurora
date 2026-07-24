// routes/calendarRoutes.js
const express = require('express');
const router = express.Router();
const calendarRepo = require('../repositories/calendarRepository');

// =========================================================================
// GET /api/calendar/:id - Get appointment by ID (MUST BE BEFORE /)
// =========================================================================
router.get('/:id', async (req, res) => {
  try {
    const appointment = await calendarRepo.getAppointmentById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    res.json({
      success: true,
      data: appointment
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// =========================================================================
// GET /api/calendar?date=YYYY-MM-DD
// =========================================================================
router.get('/', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ success: false, message: 'Date parameter is required.' });
    }
    const schedule = await calendarRepo.findScheduleByDate(date);
    schedule.forEach((appointment) => {
      if (appointment.startTime) {
        const [hours, minutes] = appointment.startTime.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        appointment.startTime = `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
      }
      // Calculate balance due
      appointment.balanceDue = (appointment.amount || 0) - (appointment.paidAmount || 0);
    });
    res.json({ success: true, data: schedule });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// =========================================================================
// GET /api/calendar/packages - Get all available packages
// =========================================================================
router.get('/packages', async (req, res) => {
  try {
    const packages = await calendarRepo.getAvailablePackages();
    res.json({ success: true, data: packages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// =========================================================================
// GET /api/calendar/customer/:customerId/packages - Get customer's packages
// =========================================================================
router.get('/customer/:customerId/packages', async (req, res) => {
  try {
    const { customerId } = req.params;
    const packages = await calendarRepo.getCustomerPackages(parseInt(customerId));
    res.json({ success: true, data: packages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// =========================================================================
// GET /api/calendar/pending-payments - Get all pending payments
// =========================================================================
router.get('/pending-payments', async (req, res) => {
  try {
    const pendingPayments = await calendarRepo.getPendingPayments();
    res.json({ success: true, data: pendingPayments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// =========================================================================
// POST /api/calendar/payment - Record a payment
// =========================================================================
router.post('/payment', async (req, res) => {
  try {
    const { appointmentId, paidAmount, paymentMethod } = req.body;
    
    if (!appointmentId) {
      return res.status(400).json({ success: false, message: 'Appointment ID is required.' });
    }
    
    if (paidAmount === undefined || paidAmount === null || paidAmount < 0) {
      return res.status(400).json({ success: false, message: 'Valid paid amount is required.' });
    }

    const result = await calendarRepo.updatePayment(appointmentId, paidAmount, paymentMethod);
    res.json({ 
      success: true, 
      message: 'Payment updated successfully!',
      data: result 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// =========================================================================
// POST /api/calendar/purchase-package - Buy a package
// =========================================================================
router.post('/purchase-package', async (req, res) => {
  try {
    const { customerId, packageId, paymentMethod } = req.body;
    const result = await calendarRepo.purchasePackage(customerId, packageId, paymentMethod);
    res.json({ 
      success: true, 
      message: 'Package purchased successfully!',
      data: result 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// =========================================================================
// POST /api/calendar - Create or Update Appointment
// =========================================================================
router.post('/', async (req, res) => {
  try {
    const {
      id,
      customerId,
      customerName,
      phone,
      staffId,
      services, 
      startTime,
      durationMinutes,
      date,
      amount,
      paidAmount,
      paymentStatus,
      paymentMethod,
      notes,
      status,
      customerPackageId,
      isPackageAppointment
    } = req.body;

    if (!customerName || !customerName.trim()) {
      return res.status(400).json({ success: false, message: 'Customer name is required.' });
    }

    // Helper to safely convert IDs
    const parseNumericId = (val) => {
      if (!val) return null;
      const digits = String(val).replace(/\D/g, '');
      return digits ? parseInt(digits, 10) : null;
    };

    const cleanAppointmentId = parseNumericId(id);
    let cleanCustomerId = parseNumericId(customerId);
    const cleanStaffId = parseNumericId(staffId);
    const cleanPackageId = parseNumericId(customerPackageId);
    const parsedAmount = amount ? parseFloat(amount) : 0;
    const parsedPaidAmount = paidAmount ? parseFloat(paidAmount) : 0;
    
    const cleanPhone = phone ? phone.trim() : null;
    
    // ✅ FIX: Extract only the date part (YYYY-MM-DD)
    let appointmentDate = date;
    if (appointmentDate && appointmentDate.includes('T')) {
      appointmentDate = appointmentDate.split('T')[0];
    } else if (!appointmentDate) {
      appointmentDate = new Date().toISOString().split('T')[0];
    }

    // Parse services
    let cleanServices = [];
    if (services && Array.isArray(services)) {
      cleanServices = services.map(s => ({
        serviceId: parseNumericId(s.serviceId),
        price: s.price ? parseFloat(s.price) : 0
      })).filter(s => s.serviceId !== null);
    }

    // Determine payment status based on paid amount
    let finalPaymentStatus = paymentStatus || 'pending';
    if (parsedPaidAmount > 0 && parsedPaidAmount >= parsedAmount) {
      finalPaymentStatus = 'paid';
    } else if (parsedPaidAmount > 0) {
      finalPaymentStatus = 'partial';
    }

    // ----------------------------------------------------
    // STEP 1: Resolve / Register Customer
    // ----------------------------------------------------
    if (cleanCustomerId) {
      const existingCust = await calendarRepo.findCustomerById(cleanCustomerId);
      if (!existingCust) {
        cleanCustomerId = null;
      }
    }

    if (!cleanCustomerId) {
      if (!cleanPhone) {
        return res.status(400).json({
          success: false,
          message: 'Phone number is required for new customers.'
        });
      }

      const phoneMatch = await calendarRepo.findCustomerByPhone(cleanPhone);

      if (phoneMatch) {
        if (phoneMatch.full_name.toLowerCase() !== customerName.trim().toLowerCase()) {
          return res.status(400).json({
            success: false,
            message: `A customer (${phoneMatch.full_name}) with phone "${cleanPhone}" is already registered.`
          });
        }
        cleanCustomerId = phoneMatch.id;
      } else {
        const newCustomer = await calendarRepo.createCustomer(customerName.trim(), cleanPhone);
        cleanCustomerId = newCustomer.id;
      }
    }

    // ----------------------------------------------------
    // STEP 2: Create or Update Booking
    // ----------------------------------------------------
    const bookingPayload = {
      customerId: cleanCustomerId,
      staffId: cleanStaffId,
      services: cleanServices,
      date: appointmentDate,
      startTime: startTime || '11:00 AM',
      durationMinutes: durationMinutes ? parseInt(durationMinutes) : 30,
      amount: parsedAmount,
      paidAmount: parsedPaidAmount,
      paymentStatus: finalPaymentStatus,
      paymentMethod: paymentMethod || null,
      paymentDate: parsedPaidAmount > 0 ? new Date().toISOString() : null,
      notes: notes || '',
      status: status || 'scheduled',
      customerPackageId: cleanPackageId,
      isPackageAppointment: isPackageAppointment || false,
    };

    let savedAppointment;

    if (cleanAppointmentId) {
      savedAppointment = await calendarRepo.updateAppointment(cleanAppointmentId, bookingPayload);
    } else {
      savedAppointment = await calendarRepo.createAppointment(bookingPayload);
    }

    // Calculate balance due
    const balanceDue = parsedAmount - parsedPaidAmount;

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully!',
      id: savedAppointment.id,
      customerId: cleanCustomerId,
      paymentStatus: finalPaymentStatus,
      balanceDue: balanceDue,
      isPackageAppointment: isPackageAppointment || false
    });

  } catch (err) {
    console.error('Calendar POST Error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;