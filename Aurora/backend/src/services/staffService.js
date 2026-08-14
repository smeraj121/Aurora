const dbPool = require('../config/db');
const staffRepo = require('../repositories/staffRepository');
const appointmentRepository = require('../repositories/appointmentRepository');
const { StaffMapper } = require('../mapper/staff.mapper');
const { ConflictError, NotFoundError, ValidationError } = require('../errors');
const TimeHelper = require('../utils/timeHelper');

// ============================================================
// CREATE STAFF
// ============================================================

async function createStaff(tenantId, payload, userId) {
  const client = await dbPool.connect();
  try {
    await client.query('BEGIN');

    // 1. Check if user exists by phone/email
    const existingUser = await staffRepo.findByPhoneOrEmail(client, tenantId, payload.phone, payload.email);
    if (existingUser) {
      throw new ConflictError('A staff member with this phone or email already exists.');
    }

    // 2. Validate designation
    const designation = await staffRepo.findDesignationById(client, tenantId, payload.designationId);
    if (!designation) {
      throw new ValidationError('Invalid designation ID provided.');
    }

    // 3. Validate services if provided
    if (payload.serviceIds?.length > 0) {
      const valid = await staffRepo.validateServiceIds(client, tenantId, payload.serviceIds);
      if (!valid) {
        throw new ValidationError('One or more selected services do not exist.');
      }
    }

    // 4. Create user record
    const user = await staffRepo.insertUser(client, tenantId, {
      fullName: payload.name,
      phone: payload.phone,
      email: payload.email,
      profileImageUrl: payload.profileImage || payload.profileImageUrl,
      systemRole: 'Staff',
      isActive: payload.isActive,
    }, userId);

    // 5. Generate employee code
    const employeeCode = await staffRepo.generateEmployeeCode(client, tenantId);

    // 6. Create staff record
    const staff = await staffRepo.insertStaff(client, tenantId, {
      userId: user.id,
      designationId: payload.designationId,
      employeeCode,
      employmentStatus: payload.employmentStatus || 'active',
      employmentType: payload.employmentType || 'full_time',
      experienceYears: payload.experienceYears || 0,
      profileImageUrl: payload.profileImage || payload.profileImageUrl || null,
      calendarColor: payload.calendarColor || null,
      commissionPercentage: payload.commissionPercentage || 0,
      isOnlineBookable: payload.isOnlineBookable !== undefined ? payload.isOnlineBookable : true,
      isActive: payload.isActive,
      startTime: TimeHelper.toDb(payload.workingHoursStart) || null,
      endTime: TimeHelper.toDb(payload.workingHoursEnd) || null,
      weeklyOff: payload.weeklyOff || null,
    });

    // 7. Insert staff services
    if (payload.serviceIds?.length > 0) {
      await staffRepo.insertStaffServices(client, tenantId, staff.id, payload.serviceIds, userId);
    }

    await client.query('COMMIT');
    return getStaffById(tenantId, staff.id);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// ============================================================
// UPDATE STAFF
// ============================================================

async function updateStaff(tenantId, staffId, payload) {
  const client = await dbPool.connect();
  try {
    await client.query('BEGIN');

    const existingStaff = await staffRepo.findStaffById(client, tenantId, staffId);
    if (!existingStaff) {
      throw new NotFoundError('Staff member not found.');
    }

    // Validate designation if provided
    if (payload.designationId) {
      const designation = await staffRepo.findDesignationById(client, tenantId, payload.designationId);
      if (!designation) throw new ValidationError('Invalid designation ID provided.');
    }

    // Validate services if provided
    if (payload.serviceIds) {
      const valid = await staffRepo.validateServiceIds(client, tenantId, payload.serviceIds);
      if (!valid) throw new ValidationError('One or more selected services are invalid.');
    }

    // Update user
    await staffRepo.updateUser(client, tenantId, existingStaff.user_id, {
      fullName: payload.fullName,
      phone: payload.phone,
      email: payload.email,
      profileImage: payload.profileImage || payload.profileImageUrl,
      isActive: payload.isActive,
    });

    // Update staff
    await staffRepo.updateStaff(client, tenantId, staffId, {
      designationId: payload.designationId,
      employmentType: payload.employmentType,
      employmentStatus: payload.employmentStatus,
      experienceYears: payload.experienceYears,
      //bio: payload.bio,
      profileImageUrl: payload.profileImage || payload.profileImageUrl,
      calendarColor: payload.calendarColor,
      commissionPercentage: payload.commissionPercentage,
      isOnlineBookable: payload.isOnlineBookable,
      status: payload.isActive,
      startTime: TimeHelper.toDb(payload.workingHoursStart) || null,
      endTime: TimeHelper.toDb(payload.workingHoursEnd) || null,
      weeklyOff: payload.weeklyOff || null,
    });

    // Update services if provided
    if (payload.serviceIds !== undefined) {
      await staffRepo.deleteStaffServices(client, tenantId, staffId);
      if (payload.serviceIds.length > 0) {
        await staffRepo.insertStaffServices(client, tenantId, staffId, payload.serviceIds);
      }
    }

    await client.query('COMMIT');
    return getStaffById(tenantId, staffId);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// ============================================================
// GET STAFF LIST (paginated with filters)
// ============================================================

async function getStaffList(tenantId, filters = {}) {
  const client = await dbPool.connect();
  try {
    const { page = 1, limit = 10, search, designationId, isActive } = filters;
    const { data, total } = await staffRepo.findAllPaginated(client, tenantId, {
      page,
      limit,
      search,
      designationId,
      isActive,
    });

    return {
      items: StaffMapper ? data.map(StaffMapper.toListDTO) : data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } finally {
    client.release();
  }
}

// ============================================================
// GET STAFF BY ID (with full details)
// ============================================================

async function getStaffById(tenantId, staffId) {
  const client = await dbPool.connect();
  try {
    const staff = await staffRepo.findStaffById(client, tenantId, staffId);
    if (!staff) {
      throw new NotFoundError('Staff member not found.');
    }

    const [services, stats] = await Promise.all([
      staffRepo.findStaffServices(client, tenantId, staffId),
      staffRepo.findStaffStats(client, tenantId, staffId),
    ]);

    const workingHours = {
      startTime: staff.start_time,
      endTime: staff.end_time,
      weeklyOff: staff.weekly_off,
    };

    return StaffMapper
      ? StaffMapper.toDetailsDTO(staff, services, workingHours, stats)
      : { ...staff, workingHours, services, stats };
  } finally {
    client.release();
  }
}

async function getAvailableSlots(tenantId, staffId, date, intervalMinutes = 30) {
  // 1. Get staff working hours for that day
  const client = await dbPool.connect();
  try {
    const staff = await staffRepo.findStaffById(client, tenantId, staffId);
    if (!staff) throw new NotFoundError('Staff not found');

    // Weekly off check
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    if (staff.weekly_off === dayOfWeek) {
      return []; // no slots on weekly off
    }

    const workStart = staff.start_time || "09:00 AM";
    const workEnd = staff.end_time || "06:00 PM";

    // Convert to minutes from midnight for easier arithmetic
    const startMinutes = TimeHelper.toDb(workStart);
    const endMinutes = TimeHelper.toDb(workEnd);

    // 2. Get existing bookings
    const bookings = await appointmentRepository.getBookedSlots(tenantId, staffId, date);

    // 3. Generate all possible slots (every intervalMinutes)
    const slots = [];
    for (let t = startMinutes; t + intervalMinutes <= endMinutes; t += intervalMinutes) {
      const startStr = TimeHelper.toDisplay(t);
      const endStr = TimeHelper.toDisplay(t + intervalMinutes);
      // Check if this slot overlaps with any booking
      const isBooked = bookings.some(b => {
        const bStart = TimeHelper.toDb(b.start_time);
        const bEnd = TimeHelper.toDb(b.end_time);
        // Overlap if new.start < b.end && new.end > b.start
        return t < bEnd && (t + intervalMinutes) > bStart;
      });
      if (!isBooked) {
        slots.push(startStr); // or { start: startStr, end: endStr }
      }
    }
    return slots;
  } finally {
    client.release();
  }
}

// ============================================================
// DELETE STAFF (soft delete)
// ============================================================

async function deleteStaff(tenantId, staffId, userId) {
  const client = await dbPool.connect();
  try {
    await client.query('BEGIN');
    const userId = await staffRepo.softDeleteStaff(client, tenantId, staffId, userId);
    if (!userId) {
      throw new NotFoundError('Staff member not found.');
    }
    await client.query('COMMIT');
    return { id: staffId, success: true };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// ============================================================
// OPTIONS: Services & Designations
// ============================================================

async function getAllServices(tenantId) {
  const client = await dbPool.connect();
  try {
    return await staffRepo.getAllServices(client, tenantId);
  } finally {
    client.release();
  }
}

async function getAllDesignations(tenantId) {
  const client = await dbPool.connect();
  try {
    return await staffRepo.getAllDesignations(client, tenantId);
  } finally {
    client.release();
  }
}

// ============================================================
// ADDITIONAL: Simple list & dashboard methods
// ============================================================

async function getAllStaff(tenantId, onlyActive = false) {
  const client = await dbPool.connect();
  try {
    return await staffRepo.getAllStaff(client, tenantId, onlyActive);
  } finally {
    client.release();
  }
}

async function getAllStaffWithStats(tenantId, onlyActive = false) {
  const client = await dbPool.connect();
  try {
    return await staffRepo.getAllStaffWithStats(client, tenantId, onlyActive);
  } finally {
    client.release();
  }
}

async function getStaffByIdWithStats(tenantId, staffId) {
  const client = await dbPool.connect();
  try {

    const staff = staffId ? await staffRepo.getStaffByIdWithStats(client, tenantId, staffId)
      :
      await staffRepo.getStaffById(client, tenantId);
    if (!staff) throw new NotFoundError('Staff member not found.');
    return staff;
  } finally {
    client.release();
  }
}

async function getStaffTodaySchedule(tenantId, staffId) {
  const client = await dbPool.connect();
  try {
    const schedule = await staffRepo.getStaffTodaySchedule(client, tenantId, staffId);
    if (!schedule) throw new NotFoundError('Staff member not found.');
    return schedule;
  } finally {
    client.release();
  }
}

async function getStaffStats(tenantId) {
  const client = await dbPool.connect();
  try {
    return await staffRepo.getStaffStats(client, tenantId);
  } finally {
    client.release();
  }
}

async function getTopStaff(tenantId, limit = 5) {
  const client = await dbPool.connect();
  try {
    return await staffRepo.getTopStaff(client, tenantId, limit);
  } finally {
    client.release();
  }
}

module.exports = {
  createStaff,
  updateStaff,
  getStaffList,
  getStaffById,
  getAvailableSlots,
  deleteStaff,
  getAllServices,
  getAllDesignations,
  getAllStaff,
  getAllStaffWithStats,
  getStaffByIdWithStats,
  getStaffTodaySchedule,
  getStaffStats,
  getTopStaff,
};