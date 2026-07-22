const express = require('express');
const router = express.Router();
const customerService = require('../services/customerService');

// GET /api/customers?search=priya
router.get('/', async (req, res) => {
  try {
    const customers = await customerService.getAllCustomers(req.query.search);
    res.json({ success: true, data: customers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/customers?search=aditi
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = `SELECT id, full_name, phone FROM customers`;
    let params = [];

    if (search) {
      query += ` WHERE LOWER(full_name) LIKE LOWER($1) OR phone LIKE $1 LIMIT 8`;
      params.push(`%${search}%`);
    } else {
      query += ` ORDER BY full_name ASC LIMIT 20`;
    }

    const { rows } = await db.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/customers/:id
router.get('/:id', async (req, res) => {
  try {
    const customer = await customerService.getCustomerDetails(req.params.id);
    res.json({ success: true, data: customer });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
});

// POST /api/customers
router.post('/', async (req, res) => {
  try {
    const newCustomer = await customerService.createCustomer(req.body);
    res.status(201).json({ success: true, data: newCustomer });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/customers/:id
router.put('/:id', async (req, res) => {
  try {
    const updated = await customerService.updateCustomer(req.params.id, req.body);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;