// services/packageService.js
const packageRepository = require('../repositories/packageRepository');
const serviceRepository = require('../repositories/serviceRepository');

exports.getAllPackages = async (includeInactive = false) => {
  return packageRepository.getAllPackages(includeInactive);
};

exports.getPackageById = async (id) => {
  const pkg = await packageRepository.getPackageById(id);
  if (!pkg) {
    throw new Error('Package not found');
  }
  return pkg;
};

exports.createPackage = async (data) => {
  // Validate required fields
  if (!data.name) {
    throw new Error('Package name is required');
  }
  if (!data.totalPrice || data.totalPrice <= 0) {
    throw new Error('Valid total price is required');
  }
  if (!data.services || data.services.length === 0) {
    throw new Error('At least one service is required');
  }

  // Validate services exist
  const serviceIds = data.services.map(s => s.serviceId);
  const existingServices = await serviceRepository.getServicesByIds(serviceIds);
  
  if (existingServices.length !== serviceIds.length) {
    throw new Error('One or more services do not exist');
  }

  // Calculate total sessions
  data.totalSessions = data.services.reduce((sum, s) => sum + (s.quantity || 1), 0);

  return packageRepository.createPackage(data);
};

exports.updatePackage = async (id, data) => {
  const existing = await packageRepository.getPackageById(id);
  if (!existing) {
    throw new Error('Package not found');
  }

  // Validate services if provided
  if (data.services && data.services.length > 0) {
    const serviceIds = data.services.map(s => s.serviceId);
    const existingServices = await serviceRepository.getServicesByIds(serviceIds);
    
    if (existingServices.length !== serviceIds.length) {
      throw new Error('One or more services do not exist');
    }
  }

  return packageRepository.updatePackage(id, data);
};

exports.deletePackage = async (id) => {
  const existing = await packageRepository.getPackageById(id);
  if (!existing) {
    throw new Error('Package not found');
  }
  return packageRepository.deletePackage(id);
};

exports.getPackageStats = async () => {
  return packageRepository.getPackageStats();
};

exports.getPopularPackages = async (limit) => {
  return packageRepository.getPopularPackages(limit);
};