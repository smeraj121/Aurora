const customerRepo = require('../repositories/customerRepository');

class CustomerService {
  async getAllCustomers(search) {
    return await customerRepo.findAll(search);
  }

  async getCustomerDetails(id) {
    const customer = await customerRepo.findByIdWithHistory(id);
    if (!customer) throw new Error('Customer not found');
    return customer;
  }

  async createCustomer(data) {
    if (!data.fullName || !data.phone) {
      throw new Error('Full Name and Phone Number are required.');
    }
    return await customerRepo.create(data);
  }

  async updateCustomer(id, data) {
    return await customerRepo.update(id, data);
  }
}

module.exports = new CustomerService();