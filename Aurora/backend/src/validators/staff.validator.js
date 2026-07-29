const { z } = require('zod');
const { EMPLOYMENT_TYPES, STAFF_STATUS, DAYS_OF_WEEK } = require('../constants/staff.constants.js');

const phoneRegex = /^\+?[1-9]\d{1,14}$/;

const createStaffSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters'),
  email: z.string().trim().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().trim().regex(phoneRegex, 'Invalid phone number format'),
  //designationId: z.string().min(1, 'Designation is required'),
  //employmentType: z.enum(EMPLOYMENT_TYPES, { errorMap: () => ({ message: 'Invalid employment type' }) }),
  //status: z.enum([STAFF_STATUS.ACTIVE, STAFF_STATUS.INACTIVE]).default(STAFF_STATUS.ACTIVE),
  //employeeCode: z.string().trim().optional(),
  //joiningDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Joining date must be YYYY-MM-DD'),
  //workingHours: z.string().trim().min(1, 'Working hours are required'),
  //weeklyOff: z.enum(DAYS_OF_WEEK, { errorMap: () => ({ message: 'Invalid day for weekly off' }) }),
  //serviceIds: z.array(z).default([])
});

const updateStaffSchema = createStaffSchema.partial();

const queryStaffSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().trim().optional(),
  designationId: z.string().optional(),
  isActive: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
});

exports.module = { phoneRegex, createStaffSchema, updateStaffSchema, queryStaffSchema }