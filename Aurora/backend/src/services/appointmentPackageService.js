const appointmentPackageRepository = require('../repositories/appointmentPackageRepository');
const customerPackageRepository = require('../repositories/customerPackageRepository');
const { NotFoundError, ValidationError } = require('../errors');

// Validation is deliberately read-only. Consumption is performed separately in
// the appointment transaction after every requested service has passed.
async function validatePackage(tenantId, packageId, customerId, serviceIds = [], client, options = {}) {
  if (!packageId) return null;
  if (new Set(serviceIds).size !== serviceIds.length) {
    throw new ValidationError('The same service can only be selected once per appointment.');
  }

  const pkg = await customerPackageRepository.getCustomerPackageValidationInfo(tenantId, packageId, client);
  if (!pkg) throw new NotFoundError('Selected customer package does not exist.');
  if (pkg.customerId !== customerId) {
    throw new ValidationError('Selected package does not belong to this customer.');
  }
  if (!pkg.isActive) throw new ValidationError('Selected package is inactive.');
  if (pkg.expiryDate && new Date(pkg.expiryDate) < new Date().setHours(0, 0, 0, 0)) {
    throw new ValidationError('Selected package has expired.');
  }

  const packageServices = new Map(pkg.services.map(service => [service.serviceId, service]));
  const excludedServiceIds = options.excludeAppointmentId
    ? new Set(await appointmentPackageRepository.getAppointmentPackageServiceIds(
      client, tenantId, packageId, options.excludeAppointmentId
    ))
    : new Set();

  for (const serviceId of serviceIds) {
    const packageService = packageServices.get(serviceId);
    if (!packageService) {
      throw new ValidationError('Selected service is not included in this customer package.');
    }

    // An appointment contains each service once. On an edit, make only the
    // matching service already attributed to that appointment available.
    const availableQuantity = packageService.totalQuantity
      - packageService.usedQuantity
      + (excludedServiceIds.has(serviceId) ? 1 : 0);
    if (availableQuantity < 1) {
      throw new ValidationError('One or more selected package services have no remaining usage.');
    }
  }

  return pkg;
}

async function consumePackage(tenantId, packageId, appointmentId, serviceIds, client) {
  if (!packageId || !serviceIds || serviceIds.length === 0) return;
  if (new Set(serviceIds).size !== serviceIds.length) {
    throw new ValidationError('The same service can only be selected once per appointment.');
  }

  // The appointment caller owns the transaction. Reserve all requested
  // service rows first and require an exact match; any later failure rolls
  // back both this reservation and aggregate package bookkeeping.
  const updatedServices = await appointmentPackageRepository.incrementServiceUsage(
    client, tenantId, packageId, serviceIds
  );
  if (updatedServices.length !== serviceIds.length) {
    throw new ValidationError('Failed to consume package service usage.');
  }

  const result = await appointmentPackageRepository.consumeSessions(
    tenantId, packageId, serviceIds.length, client
  );
  if (!result) {
    throw new ValidationError('Failed to consume package sessions. Not enough sessions available.');
  }
}

async function restorePackage(tenantId, packageId, appointmentId, serviceIds, client) {
  if (!packageId || !serviceIds || serviceIds.length === 0) return;
  if (new Set(serviceIds).size !== serviceIds.length) {
    throw new ValidationError('The same service can only be selected once per appointment.');
  }

  const result = await appointmentPackageRepository.restoreSessions(
    tenantId, packageId, serviceIds.length, client);
  if (!result) throw new ValidationError('Unable to restore package sessions.');

  const updatedServices = await appointmentPackageRepository.decrementServiceUsage(
    client, tenantId, packageId, serviceIds
  );
  if (updatedServices.length !== serviceIds.length) {
    throw new ValidationError('Unable to restore package service usage.');
  }
}

module.exports = { validatePackage, consumePackage, restorePackage };
