class StaffMapper {
  static toListDTO(row) {
    return {
      id: row.id,
      fullName: row.full_name,
      phone: row.phone,
      email: row.email || '',
      designation: row.designation_name,
      employmentType: row.employment_type,
      status: row.is_active ? 'Active' : 'Inactive',
      profileImage: row.profile_image || null,
      joinedDate: row.joining_date,
      servicesCount: parseInt(row.services_count || 0, 10),
    };
  }

  static toDetailsDTO(staff, services, workingHours, stats) {
    return {
      id: staff.id,
      userId: staff.user_id,
      fullName: staff.full_name,
      email: staff.email || '',
      phone: staff.phone,
      profileImage: staff.profile_image || null,
      designation: {
        id: staff.designation_id,
        name: staff.designation_name,
      },
      employmentDetails: {
        type: staff.employment_type,
        employeeId: staff.employee_id,
        employeeCode: staff.employee_code,
        joiningDate: staff.created_at,
        status: staff.is_active ? 'Active' : 'Inactive',
        commissionRate:staff.commission_percentage
      },
      schedule: {
        workingHoursStart: workingHours.startTime || '10:00 AM',
        workingHoursEnd: workingHours.endTime || '6:00 PM',
        weeklyOff: workingHours.weeklyOff || 'Sunday',
      },
      services: services.map((s) => ({
        id: s.id,
        name: s.name,
        category: s.category,
      })),
      statistics: {
        totalRevenue: parseFloat(stats.total_revenue || 0),
        totalAppointments: parseInt(stats.total_appointments || 0, 10),
        completedAppointments: parseInt(stats.completed_appointments || 0, 10),
        averageRating: parseFloat(stats.average_rating || 0),
        totalReviews: parseInt(stats.total_reviews || 0, 10),
      },
      createdAt: staff.created_at,
      updatedAt: staff.updated_at,
    };
  }
}
module.exports = { StaffMapper };