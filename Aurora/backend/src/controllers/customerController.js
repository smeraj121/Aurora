const customerService = require("../services/customerService");

exports.getCustomers = async (req, res) => {
    try {
        const customers = await customerService.getCustomers(req.query.search);

        res.json({
            success: true,
            data: customers
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.getCustomer = async (req, res) => {
    try {
        const customer = await customerService.getCustomer(req.params.id);

        res.json({
            success: true,
            data: customer
        });
    } catch (err) {
        res.status(404).json({
            success: false,
            message: err.message
        });
    }
};