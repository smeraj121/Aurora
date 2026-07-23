const express = require("express");
const router = express.Router();

const customerService = require("../services/customerService");

// GET /api/customers?search=priya
router.get("/", async (req, res) => {
    try {
        const customers = await customerService.getCustomers(req.query.search);

        res.json({
            success: true,
            data: customers,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
});

// GET /api/customers/:id
router.get("/:id", async (req, res) => {
    try {
        const customer = await customerService.getCustomer(req.params.id);

        res.json({
            success: true,
            data: customer,
        });
    } catch (err) {
        res.status(404).json({
            success: false,
            message: err.message,
        });
    }
});

// POST /api/customers
router.post("/", async (req, res) => {
    try {
        const customer = await customerService.createCustomer(req.body);

        res.status(201).json({
            success: true,
            data: customer,
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
});

// PUT /api/customers/:id
router.put("/:id", async (req, res) => {
    try {
        const customer = await customerService.updateCustomer(
            req.params.id,
            req.body
        );

        res.json({
            success: true,
            data: customer,
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
});

module.exports = router;