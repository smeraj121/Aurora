const tenantRepository = require('../repositories/tenantRepository');
const {
  ConflictError,
  ValidationError,
  NotFoundError
} = require('../errors');

class TenantService {

  async getAllTenants() {
    return tenantRepository.getAll();
  }

  async getTenantById(id) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new ValidationError('Invalid tenant id.');
    }

    const tenant = await tenantRepository.getById(id);

    if (!tenant) {
      throw new NotFoundError('Tenant not found.');
    }

    return tenant;
  }

  async createTenant(data) {
    const {
      name,
      slug,
      phone,
      email,
      isActive = true,
      businessTypeId
    } = data;

    if (!name?.trim()) {
      throw new ValidationError('Tenant name is required.');
    }

    if (!slug?.trim()) {
      throw new ValidationError('Tenant slug is required.');
    }

    const normalizedSlug = slug
      .trim()
      .toLowerCase();

    const existing = await tenantRepository.getBySlug(normalizedSlug);

    if (existing) {
      throw new ConflictError('A tenant with this slug already exists.');
    }

    return tenantRepository.create({
      name: name.trim(),
      slug: normalizedSlug,
      phone: phone?.trim() || null,
      email: email?.trim().toLowerCase() || null,
      business_type_id: businessTypeId,
      createdBy: 1,
      isActive
    });
  }

  async updateTenant(id, data) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new ValidationError('Invalid tenant id.');
    }

    const existing = await tenantRepository.getById(id);

    if (!existing) {
      throw new NotFoundError('Tenant not found.');
    }

    const {
      name,
      slug,
      phone,
      email,
      isActive
    } = data;

    if (!name?.trim()) {
      throw new ValidationError('Tenant name is required.');
    }

    if (!slug?.trim()) {
      throw new ValidationError('Tenant slug is required.');
    }

    const normalizedSlug = slug
      .trim()
      .toLowerCase();

    const slugOwner =
      await tenantRepository.getBySlug(normalizedSlug);

    if (slugOwner && slugOwner.id !== id) {
      throw new ConflictError(
        'A tenant with this slug already exists.'
      );
    }

    return tenantRepository.update(id, {
      name: name.trim(),
      slug: normalizedSlug,
      phone: phone?.trim() || null,
      email: email?.trim().toLowerCase() || null,
      isActive:
        typeof isActive === 'boolean'
          ? isActive
          : existing.isActive
    });
  }

  async updateTenantStatus(id, isActive) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new ValidationError('Invalid tenant id.');
    }

    if (typeof isActive !== 'boolean') {
      throw new ValidationError(
        'isActive must be a boolean.'
      );
    }

    const existing = await tenantRepository.getById(id);

    if (!existing) {
      throw new NotFoundError('Tenant not found.');
    }

    return tenantRepository.updateStatus(id, isActive);
  }
}

module.exports = new TenantService();