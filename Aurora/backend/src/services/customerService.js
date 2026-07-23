const customerRepository = require("../repositories/customerRepository");

exports.getCustomers = async (search) => {
    return customerRepository.getCustomers(search);
};

exports.getCustomer = async (id) => {
    const customer =
        await customerRepository.getCustomerDetails(id);

    if (!customer) {
        throw new Error("Customer not found");
    }

    customer.averageTicket = Math.round(
        customer.totalSpent /
        (customer.totalVisits || 1)
    );

    customer.history =
        await customerRepository.getCustomerHistory(id);

    return customer;
};

// TODO
exports.createCustomer = async (data) => {
    return customerRepository.createCustomer(data);
};

// TODO
exports.updateCustomer = async (id, data) => {
    return customerRepository.updateCustomer(id, data);
};