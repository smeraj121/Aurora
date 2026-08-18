const appointmentPackageRepository = require('../repositories/appointmentPackageRepository');
const customerPackageRepository = require('../repositories/customerPackageRepository');
const { NotFoundError, ValidationError } = require('../errors');

async function validatePackage(tenantId, packageId, customerId, serviceIds = [], client) {
    if (!packageId) return null;

    const pkg = await customerPackageRepository.getCustomerPackageValidationInfo(tenantId, packageId, client);

    if (!pkg) {
        throw new NotFoundError('Selected customer package does not exist.');
    }
    if (pkg.customerId !== customerId) {
        throw new ValidationError('Selected package does not belong to this customer.');
    }
    if (serviceIds.length > 0 && pkg.remainingSessions < serviceIds.length) {
        throw new ValidationError('Selected package has no remaining sessions.');
    }
    if (pkg.expiryDate && new Date(pkg.expiryDate) < new Date().setHours(0, 0, 0, 0)) {
        throw new ValidationError('Selected package has expired.');
    }

    if (serviceIds.length > 0) {
        const packageServices = new Map(pkg.services.map(service => [service.serviceId, service]));
        for (const serviceId of serviceIds) {
            const packageService = packageServices.get(serviceId);
            if (!packageService) {
                throw new ValidationError('Selected service is not included in this customer package.');
            }
            if (packageService.usedQuantity >= packageService.totalQuantity) {
                throw new ValidationError('One or more selected package services have no remaining usage.');
            }
        }
    }

    return pkg;
}

async function consumePackage(tenantId, packageId, appointmentId, serviceIds, client) {
    if (!packageId || !serviceIds || serviceIds.length === 0) return;

    const count = serviceIds.length;

    // Update total session count
    const result = await appointmentPackageRepository.consumeSessions(tenantId, packageId, count, client);
    if (!result) {
        throw new ValidationError('Failed to consume package sessions. Not enough sessions available.');
    }

    // Update per‑service usage
    const updatedServices = await appointmentPackageRepository.incrementServiceUsage(client, tenantId, packageId, serviceIds);
    if (updatedServices.length !== serviceIds.length) {
        throw new ValidationError('Failed to consume package service usage.');
    }
}

async function restorePackage(tenantId, packageId, appointmentId, serviceIds, client) {
    if (!packageId || !serviceIds || serviceIds.length === 0) return;

    const count = serviceIds.length;

    // Restore total session count
    const result = await appointmentPackageRepository.restoreSessions(tenantId, packageId, count, client);
    if (!result) {
        throw new ValidationError('Unable to restore package sessions.');
    }

    // Decrement per‑service usage
    const updatedServices = await appointmentPackageRepository.decrementServiceUsage(client, tenantId, packageId, serviceIds);
    if (updatedServices.length !== serviceIds.length) {
        throw new ValidationError('Unable to restore package service usage.');
    }
}

module.exports = {
    validatePackage,
    consumePackage,
    restorePackage
};
