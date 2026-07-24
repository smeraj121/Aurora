// routes/customerRoutes.js
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

// GET /api/customers/top
router.get("/top", async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const customers = await customerService.getTopCustomers(limit);
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

// GET /api/customers/recent
router.get("/recent", async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const customers = await customerService.getRecentCustomers(limit);
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
        if (err.message === "Customer not found") {
            res.status(404).json({
                success: false,
                message: err.message,
            });
        } else {
            res.status(500).json({
                success: false,
                message: err.message,
            });
        }
    }
});

// GET /api/customers/:id/history
router.get("/:id/history", async (req, res) => {
    try {
        const history = await customerService.getCustomerHistory(req.params.id);
        res.json({
            success: true,
            data: history,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
});

// GET /api/customers/:id/packages
router.get("/:id/packages", async (req, res) => {
    try {
        const packages = await customerService.getCustomerPackages(req.params.id);
        res.json({
            success: true,
            data: packages,
        });
    } catch (err) {
        res.status(500).json({
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
            message: "Customer created successfully",
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
            message: "Customer updated successfully",
        });
    } catch (err) {
        const status = err.message === "Customer not found" ? 404 : 400;
        res.status(status).json({
            success: false,
            message: err.message,
        });
    }
});

// DELETE /api/customers/:id
router.delete("/:id", async (req, res) => {
    try {
        await customerService.deleteCustomer(req.params.id);
        res.json({
            success: true,
            message: "Customer deleted successfully",
        });
    } catch (err) {
        const status = err.message === "Customer not found" ? 404 : 400;
        res.status(status).json({
            success: false,
            message: err.message,
        });
    }
});

router.post('/assign-package', async (req, res) => {
  try {
    const { customerId, packageId, customPrice, paymentMethod, notes, expiryDate } = req.body;
    
    const result = await customerService.assignPackageToCustomer({
      customerId,
      packageId,
      customPrice,
      paymentMethod,
      notes,
      expiryDate,
    });
    
    res.json({
      success: true,
      data: result,
      message: 'Package assigned successfully',
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

// ============================================================
// GET /api/customers/:id/packages - Get customer's packages
// ============================================================
router.get('/:id/packages', async (req, res) => {
  try {
    const includeExpired = req.query.includeExpired === 'true';
    const packages = await customerService.getCustomerPackages(
      parseInt(req.params.id),
      includeExpired
    );
    res.json({
      success: true,
      data: packages,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// ============================================================
// GET /api/customers/packages/:id - Get customer package by ID
// ============================================================
router.get('/packages/:id', async (req, res) => {
  try {
    const pkg = await customerService.getCustomerPackageById(parseInt(req.params.id));
    res.json({
      success: true,
      data: pkg,
    });
  } catch (err) {
    if (err.message === 'Customer package not found') {
      res.status(404).json({
        success: false,
        message: err.message,
      });
    } else {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
});

// ============================================================
// PUT /api/customers/packages/:id - Update customer package
// ============================================================
router.put('/packages/:id', async (req, res) => {
  try {
    const pkg = await customerService.updateCustomerPackage(
      parseInt(req.params.id),
      req.body
    );
    res.json({
      success: true,
      data: pkg,
      message: 'Package updated successfully',
    });
  } catch (err) {
    const status = err.message === 'Customer package not found' ? 404 : 400;
    res.status(status).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;