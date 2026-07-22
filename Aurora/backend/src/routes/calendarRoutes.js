const express = require('express');
const router = express.Router();
const calendarRepo = require('../repositories/calendarRepository');
//const customerRepo = require('../repositories/customerRepository');
//const db = require('../config/db');


// GET /api/calendar?date=YYYY-MM-DD
router.get('/', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ success: false, message: 'Date parameter is required.' });
    }
    const schedule = await calendarRepo.findScheduleByDate(date);
    res.json({ success: true, data: schedule });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/calendar
router.post('/', async (req, res) => {
  try {
    const {
      id,
      customerId,
      customerName,
      phone,
      staffId,
      serviceId,
      startTime,
      durationMinutes,
      duration,
      date,
      amount,
      notes,
      status
    } = req.body;

    if (!customerName || !customerName.trim()) {
      return res.status(400).json({ success: false, message: 'Customer name is required.' });
    }

    // Helper to safely convert IDs (e.g. "apt-123" -> 123)
    const parseNumericId = (val) => {
      if (!val) return null;
      const digits = String(val).replace(/\D/g, '');
      return digits ? parseInt(digits, 10) : null;
    };

    const cleanAppointmentId = parseNumericId(id);
    let cleanCustomerId = parseNumericId(customerId);
    const cleanStaffId = parseNumericId(staffId);
    const cleanServiceId = parseNumericId(serviceId);
    const parsedAmount = amount ? parseFloat(amount) : 0;
    
    // Parse duration (e.g. from durationMinutes or duration field, defaulting to 30 mins)
    const rawDuration = durationMinutes || duration;
    const parsedDuration = rawDuration ? parseInt(rawDuration, 10) : 30;
    
    const cleanPhone = phone ? phone.trim() : null;
    const appointmentDate = date || new Date().toISOString().split('T')[0];

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

      // Check if phone number is already registered
      const phoneMatch = await calendarRepo.findCustomerByPhone(cleanPhone);

      if (phoneMatch) {
        // If phone belongs to a different name, throw conflict error
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
      serviceId: cleanServiceId,
      date: appointmentDate,
      startTime: startTime || '11:00 AM',
      durationMinutes: parsedDuration,
      amount: parsedAmount,
      notes: notes || '',
      status: status || 'scheduled'
    };

    let savedAppointment;

    if (cleanAppointmentId) {
      savedAppointment = await calendarRepo.updateAppointment(cleanAppointmentId, bookingPayload);
    } else {
      savedAppointment = await calendarRepo.createAppointment(bookingPayload);
    }

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully!',
      id: savedAppointment.id,
      customerId: cleanCustomerId
    });

  } catch (err) {
    console.error('Calendar POST Error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;