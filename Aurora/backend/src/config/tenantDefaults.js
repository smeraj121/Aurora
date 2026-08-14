// config/tenantDefaults.js

const TENANT_DEFAULTS = {
  1: { // Salon
    designations: [
      {
        name: 'Stylist',
        description: 'Provides salon services',
        displayOrder: 1,
      },
      {
        name: 'Senior Stylist',
        description: 'Senior salon professional',
        displayOrder: 2,
      },
      {
        name: 'Receptionist',
        description: 'Handles front desk and customer coordination',
        displayOrder: 3,
      },
    ],

    services: [
      {
        name: 'Haircut',
        category: 'Hair',
        estimatedDurationMinutes: 30,
        price: 500,
        displayOrder: 1,
      },
      {
        name: 'Hair Coloring',
        category: 'Hair',
        estimatedDurationMinutes: 120,
        price: 2500,
        displayOrder: 2,
      },
      {
        name: 'Hair Spa',
        category: 'Hair',
        estimatedDurationMinutes: 60,
        price: 1200,
        displayOrder: 3,
      },
      {
        name: 'Facial',
        category: 'Skin',
        estimatedDurationMinutes: 60,
        price: 1000,
        displayOrder: 4,
      },
    ],
  },

  2: { // Dermatology Clinic
    designations: [
      {
        name: 'Dermatologist',
        description: 'Medical practitioner',
        displayOrder: 1,
      },
      {
        name: 'Nurse',
        description: 'Clinical support',
        displayOrder: 2,
      },
      {
        name: 'Receptionist',
        description: 'Front desk and customer coordination',
        displayOrder: 3,
      },
    ],

    services: [
      {
        name: 'Consultation',
        category: 'Consultation',
        estimatedDurationMinutes: 30,
        price: 1000,
        displayOrder: 1,
      },
      {
        name: 'Skin Consultation',
        category: 'Skin',
        estimatedDurationMinutes: 45,
        price: 1500,
        displayOrder: 2,
      },
    ],
  },

  3: { // Spa
    designations: [
      {
        name: 'Therapist',
        displayOrder: 1,
      },
      {
        name: 'Senior Therapist',
        displayOrder: 2,
      },
      {
        name: 'Receptionist',
        displayOrder: 3,
      },
    ],

    services: [
      {
        name: 'Full Body Massage',
        category: 'Massage',
        estimatedDurationMinutes: 60,
        price: 1500,
        displayOrder: 1,
      },
      {
        name: 'Head Massage',
        category: 'Massage',
        estimatedDurationMinutes: 30,
        price: 700,
        displayOrder: 2,
      },
    ],
  },

  4: { // Nail Studio
    designations: [
      {
        name: 'Nail Technician',
        displayOrder: 1,
      },
      {
        name: 'Senior Nail Technician',
        displayOrder: 2,
      },
      {
        name: 'Receptionist',
        displayOrder: 3,
      },
    ],

    services: [
      {
        name: 'Manicure',
        category: 'Nails',
        estimatedDurationMinutes: 45,
        price: 500,
        displayOrder: 1,
      },
      {
        name: 'Pedicure',
        category: 'Nails',
        estimatedDurationMinutes: 60,
        price: 700,
        displayOrder: 2,
      },
    ],
  },

  5: { // Barbershop
    designations: [
      {
        name: 'Barber',
        displayOrder: 1,
      },
      {
        name: 'Senior Barber',
        displayOrder: 2,
      },
      {
        name: 'Receptionist',
        displayOrder: 3,
      },
    ],

    services: [
      {
        name: 'Haircut',
        category: 'Hair',
        estimatedDurationMinutes: 30,
        price: 300,
        displayOrder: 1,
      },
      {
        name: 'Beard Trim',
        category: 'Beard',
        estimatedDurationMinutes: 20,
        price: 200,
        displayOrder: 2,
      },
    ],
  },

  6: { // Aesthetic Clinic
    designations: [
      {
        name: 'Aesthetician',
        displayOrder: 1,
      },
      {
        name: 'Doctor',
        displayOrder: 2,
      },
      {
        name: 'Receptionist',
        displayOrder: 3,
      },
    ],

    services: [
      {
        name: 'Skin Consultation',
        category: 'Consultation',
        estimatedDurationMinutes: 30,
        price: 1000,
        displayOrder: 1,
      },
      {
        name: 'Basic Facial',
        category: 'Facial',
        estimatedDurationMinutes: 60,
        price: 1200,
        displayOrder: 2,
      },
    ],
  },
};

module.exports = TENANT_DEFAULTS;