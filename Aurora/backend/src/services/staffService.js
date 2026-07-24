// services/staffService.js
const staffRepository = require('../repositories/staffRepository');

exports.getAllStaff = async (onlyActive = false) => {
  return staffRepository.getAllStaff(onlyActive);
};

exports.getAllStaffWithStats = async (onlyActive = false) => {
  return staffRepository.getAllStaffWithStats(onlyActive);
};

exports.getStaffById = async (id) => {
  const staff = await staffRepository.getStaffById(id);
  if (!staff) {
    throw new Error('Staff member not found');
  }
  return staff;
};

exports.getStaffByIdWithStats = async (id) => {
  const staff = await staffRepository.getStaffByIdWithStats(id);
  if (!staff) {
    throw new Error('Staff member not found');
  }
  return staff;
};

exports.getStaffTodaySchedule = async (id) => {
  const staff = await staffRepository.getStaffById(id);
  if (!staff) {
    throw new Error('Staff member not found');
  }
  return staffRepository.getStaffTodaySchedule(id);
};

exports.createStaff = async (data) => {
  if (!data.name || !data.name.trim()) {
    throw new Error('Staff name is required');
  }
  if (!data.email || !data.email.trim()) {
    throw new Error('Email is required');
  }
  if (!data.phone || !data.phone.trim()) {
    throw new Error('Phone number is required');
  }
  if (!data.role || !data.role.trim()) {
    throw new Error('Role is required');
  }

  const existingStaff = await staffRepository.getStaffByEmail(data.email);
  if (existingStaff) {
    throw new Error(`Staff with email ${data.email} already exists`);
  }

  return staffRepository.createStaff(data);
};

exports.updateStaff = async (id, data) => {
  const existing = await staffRepository.getStaffById(id);
  if (!existing) {
    throw new Error('Staff member not found');
  }

  if (data.email && data.email !== existing.email) {
    const emailCheck = await staffRepository.getStaffByEmail(data.email);
    if (emailCheck && emailCheck.id !== parseInt(id)) {
      throw new Error(`Staff with email ${data.email} already exists`);
    }
  }

  return staffRepository.updateStaff(id, data);
};

exports.deleteStaff = async (id) => {
  const existing = await staffRepository.getStaffById(id);
  if (!existing) {
    throw new Error('Staff member not found');
  }
  return staffRepository.deleteStaff(id);
};

exports.getStaffStats = async () => {
  return staffRepository.getStaffStats();
};

exports.getTopStaff = async (limit) => {
  return staffRepository.getTopStaff(limit);
};

exports.getActiveStaff = async () => {
  return staffRepository.getAllStaff(true);
};