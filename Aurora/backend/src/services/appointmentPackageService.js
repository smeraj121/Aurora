const appointmentPackageRepository = require('../repositories/appointmentPackageRepository');
const customerPackageRepository = require('../repositories/customerPackageRepository');
const { NotFoundError, ValidationError } = require('../errors');

async function validatePackage(tenantId, packageId, customerId, client) {
    if (!packageId) return null;

    const pkg = await customerPackageRepository.getCustomerPackageValidationInfo(tenantId, packageId);

    if (!pkg) {
        throw new NotFoundError('Selected customer package does not exist.');
    }
    if (pkg.customerId !== customerId) {
        throw new ValidationError('Selected package does not belong to this customer.');
    }
    if (pkg.remainingSessions <= 0) {
        throw new ValidationError('Selected package has no remaining sessions.');
    }
    if (pkg.expiryDate && new Date(pkg.expiryDate) < new Date().setHours(0, 0, 0, 0)) {
        throw new ValidationError('Selected package has expired.');
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
    await appointmentPackageRepository.incrementServiceUsage(client, tenantId, packageId, serviceIds);
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
    await appointmentPackageRepository.decrementServiceUsage(client, tenantId, packageId, serviceIds);
}

module.exports = {
    validatePackage,
    consumePackage,
    restorePackage
};