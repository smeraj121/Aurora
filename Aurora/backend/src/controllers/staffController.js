const staffService = require('../services/staffService');
const {
  createStaffSchema,
  updateStaffSchema,
} = require('../validators/staff.validator');

// ============================================================
// GET /staff - List all staff (with optional filters/pagination)
// ============================================================
async function getStaffList(req, res, next) {
  try {
    const { tenantId } = req.user;
    const { withStats, onlyActive, search, designationId, page, limit } = req.query;

    let result;
    if (withStats === 'true') {
      result = await staffService.getAllStaffWithStats(tenantId, onlyActive === 'true');
    } else if (page || limit || search || designationId) {
      result = await staffService.getStaffList(tenantId, {
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
        search,
        designationId: designationId ? parseInt(designationId, 10) : undefined,
        isActive: onlyActive !== undefined ? onlyActive === 'true' : undefined,
      });
    } else {
      result = await staffService.getAllStaff(tenantId, onlyActive === 'true');
    }

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

// ============================================================
// GET /staff/stats - Staff summary statistics
// ============================================================
async function getStaffStats(req, res, next) {
  try {
    const { tenantId } = req.user;
    const stats = await staffService.getStaffStats(tenantId);
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
}

// ============================================================
// GET /staff/top - Top performing staff
// ============================================================
async function getTopStaff(req, res, next) {
  try {
    const { tenantId } = req.user;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 5;
    const topStaff = await staffService.getTopStaff(tenantId, limit);
    res.json({ success: true, data: topStaff });
  } catch (error) {
    next(error);
  }
}

// ============================================================
// GET /staff/services - All services (dropdown options)
// ============================================================
async function getServices(req, res, next) {
  try {
    const { tenantId } = req.user;
    const services = await staffService.getAllServices(tenantId);
    res.json({ success: true, data: services });
  } catch (error) {
    next(error);
  }
}

// ============================================================
// GET /staff/designations - All designations (dropdown options)
// ============================================================
async function getDesignations(req, res, next) {
  try {
    const { tenantId } = req.user;
    const designations = await staffService.getAllDesignations(tenantId);
    res.json({ success: true, data: designations });
  } catch (error) {
    next(error);
  }
}

// ============================================================
// GET /staff/:id - Get staff by ID
// ============================================================
async function getStaffById(req, res, next) {
  try {
    const { tenantId } = req.user;
    const { id } = req.params;
    const withStats = req.query.stats === 'true';

    let staff;
    if (withStats) {
      staff = await staffService.getStaffByIdWithStats(tenantId, parseInt(id, 10));
    } else {
      staff = await staffService.getStaffById(tenantId, parseInt(id, 10));
    }

    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    res.json({ success: true, data: staff });
  } catch (error) {
    next(error);
  }
}

// ============================================================
// GET /staff/:id/schedule - Today's schedule for a staff member
// ============================================================
async function getStaffSchedule(req, res, next) {
  try {
    const { tenantId } = req.user;
    const { id } = req.params;
    const schedule = await staffService.getStaffTodaySchedule(tenantId, parseInt(id, 10));
    res.json({ success: true, data: schedule });
  } catch (error) {
    if (error.message === 'Staff member not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
}

// async function getAvailability(req,res,next){
//   try{
//     const { tenantId } = req.user;
//     const { id, date } = req.params;
//     const schedule = await staffService.getAvailableSlots(tenantId, parseInt(id, 10), date);
//     res.json({ success: true, data: schedule });
//   }
//   catch(error){
//     next(error);
//   }
// }

// ============================================================
// POST /staff - Create a new staff member
// ============================================================
async function createStaff(req, res, next) {
  try {
    const { tenantId, userId } = req.user;
    const validatedPayload = createStaffSchema ? createStaffSchema.parse(req.body) : req.body;
    const newStaff = await staffService.createStaff(tenantId, validatedPayload, userId);
    res.status(201).json({
      success: true,
      data: newStaff,
      message: 'Staff member created successfully',
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================
// PUT /staff/:id - Update an existing staff member
// ============================================================
async function updateStaff(req, res, next) {
  try {
    const { tenantId, userId } = req.user;
    const { id } = req.params;
    const validatedPayload = updateStaffSchema ? updateStaffSchema.parse(req.body) : req.body;
    const updatedStaff = await staffService.updateStaff(tenantId, parseInt(id, 10), validatedPayload, userId);
    res.json({
      success: true,
      data: updatedStaff,
      message: 'Staff member updated successfully',
    });
  } catch (error) {
    if (error.message === 'Staff member not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
}

// ============================================================
// DELETE /staff/:id - Soft delete a staff member
// ============================================================
async function deleteStaff(req, res, next) {
  try {
    const { tenantId, userId } = req.user;
    const { id } = req.params;
    await staffService.deleteStaff(tenantId, parseInt(id, 10), userId);
    res.json({ success: true, message: 'Staff member deactivated successfully' });
  } catch (error) {
    if (error.message === 'Staff member not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
}

module.exports = {
  getStaffList,
  getStaffStats,
  getTopStaff,
  getServices,
  getDesignations,
  getStaffById,
  getStaffSchedule,
  createStaff,
  updateStaff,
  deleteStaff,
};