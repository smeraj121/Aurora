# Aurora — API Specifications

**Version:** 2.0  
**Status:** Living Document  
**Last Updated:** May 2026  
**Base URL:** `https://api.aurora.app/api/v1`

---

## 📁 Where to Place This Document

Place this file in your project structure:

```
aurora/
├── docs/
│   ├── api/
│   │   ├── README.md           # API Overview
│   │   ├── authentication.md    # Auth endpoints
│   │   ├── business.md          # Business endpoints
│   │   ├── staff.md             # Staff endpoints
│   │   ├── services.md          # Services endpoints
│   │   ├── appointments.md      # Appointments endpoints
│   │   ├── customers.md         # Customers endpoints
│   │   ├── dashboard.md         # Dashboard endpoints
│   │   ├── opportunities.md     # AI Opportunities endpoints
│   │   ├── campaigns.md         # Campaigns endpoints
│   │   ├── whatsapp.md          # WhatsApp endpoints
│   │   ├── booking.md           # Online Booking endpoints
│   │   └── billing.md           # Billing endpoints
│   ├── postman/
│   │   └── Aurora-API.postman_collection.json
│   └── openapi/
│       └── openapi.yaml
```

**Alternative (Simpler):** Place as a single file:
```
docs/
└── API.md   # Complete API specification (this file)
```

---

## 📋 Table of Contents

- [Authentication](#authentication)
- [Business](#business)
- [Staff](#staff)
- [Services](#services)
- [Appointments](#appointments)
- [Customers](#customers)
- [Dashboard](#dashboard)
- [Opportunities](#opportunities)
- [Campaigns](#campaigns)
- [WhatsApp](#whatsapp)
- [Online Booking](#online-booking)
- [Billing](#billing)
- [Common Patterns](#common-patterns)

---

## Authentication

All endpoints (except auth) require a JWT token in the `Authorization` header.

```
Authorization: Bearer <your-jwt-token>
```

---

### POST /auth/register

Register a new user and create a business.

**Request:**
```json
{
  "email": "saba@glowskinclinic.com",
  "password": "SecurePassword123!",
  "confirmPassword": "SecurePassword123!",
  "businessName": "Glow Skin Clinic"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "userId": "usr_123456789",
    "businessId": "biz_123456789",
    "email": "saba@glowskinclinic.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400
  }
}
```

**Errors:**
| Status | Message |
|--------|---------|
| 400 | Email already exists |
| 400 | Password must be at least 8 characters |
| 400 | Passwords do not match |

---

### POST /auth/login

Authenticate a user.

**Request:**
```json
{
  "email": "saba@glowskinclinic.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "userId": "usr_123456789",
    "businessId": "biz_123456789",
    "email": "saba@glowskinclinic.com",
    "name": "Saba",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400
  }
}
```

**Errors:**
| Status | Message |
|--------|---------|
| 401 | Invalid email or password |

---

### POST /auth/logout

Invalidate the current token.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### POST /auth/refresh

Refresh an expired token.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400
  }
}
```

---

### POST /auth/forgot-password

Request a password reset.

**Request:**
```json
{
  "email": "saba@glowskinclinic.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

---

### POST /auth/reset-password

Reset password with token.

**Request:**
```json
{
  "token": "reset_token_123456",
  "newPassword": "NewSecurePassword123!",
  "confirmPassword": "NewSecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

### GET /auth/me

Get current user profile.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "usr_123456789",
    "email": "saba@glowskinclinic.com",
    "name": "Saba",
    "businessId": "biz_123456789",
    "businessName": "Glow Skin Clinic",
    "role": "owner",
    "createdAt": "2026-05-01T10:00:00Z"
  }
}
```

---

## Business

---

### GET /business

Get business profile.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "biz_123456789",
    "name": "Glow Skin Clinic",
    "logo": "https://cdn.aurora.app/logos/glow-skin-clinic.png",
    "address": "123 Indiranagar, Bangalore",
    "phone": "+91 98765 43210",
    "email": "info@glowskinclinic.com",
    "website": "https://glowskinclinic.com",
    "timezone": "Asia/Kolkata",
    "currency": "INR",
    "workingHours": {
      "monday": { "isOpen": true, "open": "09:00", "close": "18:00", "breaks": [{ "start": "13:00", "end": "14:00" }] },
      "tuesday": { "isOpen": true, "open": "09:00", "close": "18:00", "breaks": [{ "start": "13:00", "end": "14:00" }] },
      "wednesday": { "isOpen": true, "open": "09:00", "close": "18:00", "breaks": [{ "start": "13:00", "end": "14:00" }] },
      "thursday": { "isOpen": true, "open": "09:00", "close": "18:00", "breaks": [{ "start": "13:00", "end": "14:00" }] },
      "friday": { "isOpen": true, "open": "09:00", "close": "18:00", "breaks": [{ "start": "13:00", "end": "14:00" }] },
      "saturday": { "isOpen": true, "open": "10:00", "close": "16:00", "breaks": [] },
      "sunday": { "isOpen": false, "open": "00:00", "close": "00:00", "breaks": [] }
    },
    "createdAt": "2026-05-01T10:00:00Z",
    "updatedAt": "2026-05-24T10:00:00Z"
  }
}
```

---

### PUT /business

Update business profile.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "name": "Glow Skin Clinic",
  "logo": "https://cdn.aurora.app/logos/glow-skin-clinic.png",
  "address": "123 Indiranagar, Bangalore",
  "phone": "+91 98765 43210",
  "email": "info@glowskinclinic.com",
  "website": "https://glowskinclinic.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "biz_123456789",
    "name": "Glow Skin Clinic",
    "logo": "https://cdn.aurora.app/logos/glow-skin-clinic.png",
    "address": "123 Indiranagar, Bangalore",
    "phone": "+91 98765 43210",
    "email": "info@glowskinclinic.com",
    "website": "https://glowskinclinic.com",
    "timezone": "Asia/Kolkata",
    "currency": "INR",
    "workingHours": { ... },
    "updatedAt": "2026-05-24T10:00:00Z"
  }
}
```

---

### PUT /business/working-hours

Update working hours.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "workingHours": {
    "monday": { "isOpen": true, "open": "09:00", "close": "18:00", "breaks": [{ "start": "13:00", "end": "14:00" }] },
    "tuesday": { "isOpen": true, "open": "09:00", "close": "18:00", "breaks": [{ "start": "13:00", "end": "14:00" }] },
    "wednesday": { "isOpen": true, "open": "09:00", "close": "18:00", "breaks": [{ "start": "13:00", "end": "14:00" }] },
    "thursday": { "isOpen": true, "open": "09:00", "close": "18:00", "breaks": [{ "start": "13:00", "end": "14:00" }] },
    "friday": { "isOpen": true, "open": "09:00", "close": "18:00", "breaks": [{ "start": "13:00", "end": "14:00" }] },
    "saturday": { "isOpen": true, "open": "10:00", "close": "16:00", "breaks": [] },
    "sunday": { "isOpen": false, "open": "00:00", "close": "00:00", "breaks": [] }
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "workingHours": { ... },
    "updatedAt": "2026-05-24T10:00:00Z"
  }
}
```

---

## Staff

---

### GET /staff

Get all staff members.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| active | boolean | Filter by active status |
| search | string | Search by name |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "stf_123456789",
      "businessId": "biz_123456789",
      "name": "Priya Sharma",
      "role": "Skin Therapist",
      "color": "#8B5CF6",
      "services": ["svc_123", "svc_456"],
      "isActive": true,
      "schedule": {
        "monday": { "isWorking": true, "start": "09:00", "end": "18:00", "breaks": [{ "start": "13:00", "end": "14:00" }] },
        "tuesday": { "isWorking": true, "start": "09:00", "end": "18:00", "breaks": [{ "start": "13:00", "end": "14:00" }] }
      },
      "createdAt": "2026-05-01T10:00:00Z",
      "updatedAt": "2026-05-24T10:00:00Z"
    }
  ]
}
```

---

### POST /staff

Add a new staff member.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "name": "Priya Sharma",
  "role": "Skin Therapist",
  "color": "#8B5CF6",
  "services": ["svc_123", "svc_456"],
  "schedule": {
    "monday": { "isWorking": true, "start": "09:00", "end": "18:00", "breaks": [{ "start": "13:00", "end": "14:00" }] },
    "tuesday": { "isWorking": true, "start": "09:00", "end": "18:00", "breaks": [{ "start": "13:00", "end": "14:00" }] }
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "stf_123456789",
    "businessId": "biz_123456789",
    "name": "Priya Sharma",
    "role": "Skin Therapist",
    "color": "#8B5CF6",
    "services": ["svc_123", "svc_456"],
    "isActive": true,
    "schedule": { ... },
    "createdAt": "2026-05-24T10:00:00Z",
    "updatedAt": "2026-05-24T10:00:00Z"
  }
}
```

---

### PUT /staff/{id}

Update a staff member.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "name": "Priya Sharma",
  "role": "Senior Skin Therapist",
  "color": "#8B5CF6",
  "services": ["svc_123", "svc_456", "svc_789"],
  "isActive": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "stf_123456789",
    "name": "Priya Sharma",
    "role": "Senior Skin Therapist",
    "color": "#8B5CF6",
    "services": ["svc_123", "svc_456", "svc_789"],
    "isActive": true,
    "updatedAt": "2026-05-24T10:00:00Z"
  }
}
```

---

### PUT /staff/{id}/schedule

Update staff schedule.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "schedule": {
    "monday": { "isWorking": true, "start": "09:00", "end": "18:00", "breaks": [{ "start": "13:00", "end": "14:00" }] },
    "tuesday": { "isWorking": true, "start": "09:00", "end": "18:00", "breaks": [{ "start": "13:00", "end": "14:00" }] },
    "wednesday": { "isWorking": false, "start": "00:00", "end": "00:00", "breaks": [] }
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "stf_123456789",
    "schedule": { ... },
    "updatedAt": "2026-05-24T10:00:00Z"
  }
}
```

---

### DELETE /staff/{id}

Delete a staff member.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Staff member deleted successfully"
}
```

---

## Services

---

### GET /services

Get all services.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| active | boolean | Filter by active status |
| category | string | Filter by category |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "svc_123456789",
      "businessId": "biz_123456789",
      "name": "HydraFacial",
      "description": "Deep cleansing and hydration treatment",
      "duration": 60,
      "price": 2500,
      "category": "Facial",
      "isActive": true,
      "createdAt": "2026-05-01T10:00:00Z",
      "updatedAt": "2026-05-24T10:00:00Z"
    }
  ]
}
```

---

### POST /services

Add a new service.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "name": "HydraFacial",
  "description": "Deep cleansing and hydration treatment",
  "duration": 60,
  "price": 2500,
  "category": "Facial"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "svc_123456789",
    "businessId": "biz_123456789",
    "name": "HydraFacial",
    "description": "Deep cleansing and hydration treatment",
    "duration": 60,
    "price": 2500,
    "category": "Facial",
    "isActive": true,
    "createdAt": "2026-05-24T10:00:00Z",
    "updatedAt": "2026-05-24T10:00:00Z"
  }
}
```

---

### PUT /services/{id}

Update a service.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "name": "HydraFacial Deluxe",
  "description": "Premium deep cleansing and hydration treatment",
  "duration": 75,
  "price": 3500,
  "category": "Facial",
  "isActive": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "svc_123456789",
    "name": "HydraFacial Deluxe",
    "description": "Premium deep cleansing and hydration treatment",
    "duration": 75,
    "price": 3500,
    "category": "Facial",
    "isActive": true,
    "updatedAt": "2026-05-24T10:00:00Z"
  }
}
```

---

### DELETE /services/{id}

Delete a service.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Service deleted successfully"
}
```

---

## Appointments

---

### GET /appointments

Get appointments with filters.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| date | string | Filter by date (YYYY-MM-DD) |
| startDate | string | Filter by date range start |
| endDate | string | Filter by date range end |
| staffId | string | Filter by staff |
| status | string | Filter by status |
| customerId | string | Filter by customer |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "app_123456789",
      "businessId": "biz_123456789",
      "customerId": "cus_123456789",
      "customerName": "Anita Singh",
      "staffId": "stf_123456789",
      "staffName": "Priya Sharma",
      "serviceId": "svc_123456789",
      "serviceName": "HydraFacial",
      "date": "2026-05-24",
      "startTime": "11:00",
      "endTime": "12:00",
      "duration": 60,
      "status": "confirmed",
      "notes": "Prefers organic products",
      "createdAt": "2026-05-23T10:00:00Z",
      "updatedAt": "2026-05-24T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "totalPages": 3
  }
}
```

---

### GET /appointments/today

Get today's appointments.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "date": "2026-05-24",
    "total": 12,
    "confirmed": 8,
    "pending": 2,
    "completed": 2,
    "appointments": [
      {
        "id": "app_123456789",
        "customerName": "Anita Singh",
        "serviceName": "HydraFacial",
        "staffName": "Priya Sharma",
        "time": "11:00",
        "status": "confirmed",
        "duration": 60
      }
    ]
  }
}
```

---

### GET /appointments/{id}

Get appointment by ID.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "app_123456789",
    "businessId": "biz_123456789",
    "customerId": "cus_123456789",
    "customerName": "Anita Singh",
    "customerPhone": "+91 98765 43210",
    "staffId": "stf_123456789",
    "staffName": "Priya Sharma",
    "serviceId": "svc_123456789",
    "serviceName": "HydraFacial",
    "date": "2026-05-24",
    "startTime": "11:00",
    "endTime": "12:00",
    "duration": 60,
    "status": "confirmed",
    "notes": "Prefers organic products",
    "createdAt": "2026-05-23T10:00:00Z",
    "updatedAt": "2026-05-24T10:00:00Z"
  }
}
```

---

### POST /appointments

Create a new appointment.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "customerId": "cus_123456789",
  "staffId": "stf_123456789",
  "serviceId": "svc_123456789",
  "date": "2026-05-24",
  "startTime": "11:00",
  "duration": 60,
  "notes": "Prefers organic products"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "app_123456789",
    "businessId": "biz_123456789",
    "customerId": "cus_123456789",
    "customerName": "Anita Singh",
    "staffId": "stf_123456789",
    "staffName": "Priya Sharma",
    "serviceId": "svc_123456789",
    "serviceName": "HydraFacial",
    "date": "2026-05-24",
    "startTime": "11:00",
    "endTime": "12:00",
    "duration": 60,
    "status": "scheduled",
    "notes": "Prefers organic products",
    "createdAt": "2026-05-24T10:00:00Z",
    "updatedAt": "2026-05-24T10:00:00Z"
  }
}
```

**Errors:**
| Status | Message |
|--------|---------|
| 400 | Staff not available at this time |
| 400 | Customer has conflicting appointment |
| 400 | Time is outside working hours |
| 404 | Customer not found |
| 404 | Staff not found |
| 404 | Service not found |

---

### PUT /appointments/{id}

Update an appointment.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "customerId": "cus_123456789",
  "staffId": "stf_123456789",
  "serviceId": "svc_123456789",
  "date": "2026-05-24",
  "startTime": "12:00",
  "duration": 60,
  "notes": "Changed time"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "app_123456789",
    "customerName": "Anita Singh",
    "staffName": "Priya Sharma",
    "serviceName": "HydraFacial",
    "date": "2026-05-24",
    "startTime": "12:00",
    "endTime": "13:00",
    "status": "scheduled",
    "notes": "Changed time",
    "updatedAt": "2026-05-24T10:00:00Z"
  }
}
```

---

### PATCH /appointments/{id}/status

Update appointment status.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "status": "confirmed"
}
```

**Valid Statuses:**
- `scheduled`
- `confirmed`
- `in_progress`
- `completed`
- `cancelled`
- `no_show`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "app_123456789",
    "status": "confirmed",
    "updatedAt": "2026-05-24T10:00:00Z"
  }
}
```

---

### DELETE /appointments/{id}

Cancel/Delete an appointment.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Appointment cancelled successfully"
}
```

---

## Customers

---

### GET /customers

Get all customers.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| search | string | Search by name or phone |
| limit | number | Results per page |
| page | number | Page number |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "cus_123456789",
      "businessId": "biz_123456789",
      "firstName": "Anita",
      "lastName": "Singh",
      "phone": "+91 98765 43210",
      "email": "anita.singh@gmail.com",
      "birthDate": "1991-02-14",
      "gender": "female",
      "preferredStaffId": "stf_123456789",
      "notes": "Prefers organic products",
      "totalVisits": 12,
      "totalSpent": 28500,
      "lastVisitDate": "2026-05-10",
      "createdAt": "2026-01-01T10:00:00Z",
      "updatedAt": "2026-05-24T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "totalPages": 3
  }
}
```

---

### POST /customers

Add a new customer.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "firstName": "Anita",
  "lastName": "Singh",
  "phone": "+91 98765 43210",
  "email": "anita.singh@gmail.com",
  "birthDate": "1991-02-14",
  "gender": "female",
  "preferredStaffId": "stf_123456789",
  "notes": "Prefers organic products"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "cus_123456789",
    "businessId": "biz_123456789",
    "firstName": "Anita",
    "lastName": "Singh",
    "phone": "+91 98765 43210",
    "email": "anita.singh@gmail.com",
    "birthDate": "1991-02-14",
    "gender": "female",
    "preferredStaffId": "stf_123456789",
    "notes": "Prefers organic products",
    "totalVisits": 0,
    "totalSpent": 0,
    "createdAt": "2026-05-24T10:00:00Z",
    "updatedAt": "2026-05-24T10:00:00Z"
  }
}
```

---

### GET /customers/{id}

Get customer by ID.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "cus_123456789",
    "businessId": "biz_123456789",
    "firstName": "Anita",
    "lastName": "Singh",
    "phone": "+91 98765 43210",
    "email": "anita.singh@gmail.com",
    "birthDate": "1991-02-14",
    "gender": "female",
    "preferredStaffId": "stf_123456789",
    "preferredStaffName": "Priya Sharma",
    "notes": "Prefers organic products",
    "totalVisits": 12,
    "totalSpent": 28500,
    "averageVisitValue": 2375,
    "lastVisitDate": "2026-05-10",
    "daysSinceLastVisit": 14,
    "nextBirthday": "2026-02-14",
    "createdAt": "2026-01-01T10:00:00Z",
    "updatedAt": "2026-05-24T10:00:00Z"
  }
}
```

---

### GET /customers/{id}/history

Get customer service history.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "app_123456789",
      "date": "2026-05-10",
      "serviceName": "HydraFacial",
      "staffName": "Priya Sharma",
      "amount": 2500,
      "status": "completed",
      "notes": "Used organic products"
    },
    {
      "id": "app_456789012",
      "date": "2026-04-28",
      "serviceName": "Chemical Peel",
      "staffName": "Neha",
      "amount": 3500,
      "status": "completed",
      "notes": "Sensitive to fragrance"
    }
  ]
}
```

---

### PUT /customers/{id}

Update a customer.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "firstName": "Anita",
  "lastName": "Singh",
  "phone": "+91 98765 43210",
  "email": "anita.singh@gmail.com",
  "birthDate": "1991-02-14",
  "gender": "female",
  "preferredStaffId": "stf_123456789",
  "notes": "Prefers organic products. Sensitive to strong fragrances."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "cus_123456789",
    "firstName": "Anita",
    "lastName": "Singh",
    "phone": "+91 98765 43210",
    "email": "anita.singh@gmail.com",
    "birthDate": "1991-02-14",
    "gender": "female",
    "preferredStaffId": "stf_123456789",
    "notes": "Prefers organic products. Sensitive to strong fragrances.",
    "updatedAt": "2026-05-24T10:00:00Z"
  }
}
```

---

### DELETE /customers/{id}

Delete a customer.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Customer deleted successfully"
}
```

---

## Dashboard

---

### GET /dashboard

Get dashboard data.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "greeting": "Good Morning, Saba!",
    "date": "2026-05-24",
    "opportunities": {
      "count": 5,
      "items": [
        {
          "id": "opp_1",
          "type": "empty_slots",
          "priority": "high",
          "title": "3 empty slots worth ₹7,500",
          "description": "Tomorrow between 1 PM - 4 PM",
          "potentialRevenue": 7500,
          "action": "create_campaign"
        },
        {
          "id": "opp_2",
          "type": "inactive_customers",
          "priority": "high",
          "title": "18 inactive customers",
          "description": "Haven't visited in 90+ days",
          "potentialRevenue": 77400,
          "action": "re_engage"
        },
        {
          "id": "opp_3",
          "type": "birthdays",
          "priority": "medium",
          "title": "2 birthdays today",
          "description": "Anita Singh, Neha Sharma",
          "potentialRevenue": 0,
          "action": "send_offer"
        }
      ]
    },
    "metrics": {
      "revenueToday": {
        "amount": 38500,
        "trend": 18,
        "direction": "up"
      },
      "appointmentsToday": {
        "count": 24,
        "change": 4,
        "direction": "up"
      },
      "occupancy": {
        "percentage": 68,
        "change": 12,
        "direction": "up"
      },
      "newCustomers": {
        "count": 5,
        "change": 2,
        "direction": "up"
      },
      "revenueThisMonth": {
        "amount": 428500,
        "trend": 14,
        "direction": "up"
      }
    },
    "todayTimeline": [
      {
        "id": "app_1",
        "time": "09:00",
        "customerName": "Anita Singh",
        "serviceName": "HydraFacial",
        "staffName": "Priya"
      },
      {
        "id": "app_2",
        "time": "10:00",
        "customerName": "Neha Sharma",
        "serviceName": "Chemical Peel",
        "staffName": "Neha"
      }
    ],
    "upcomingBirthdays": [
      {
        "id": "cus_1",
        "name": "Anita Singh",
        "birthDate": "1991-02-14",
        "daysUntil": 0
      },
      {
        "id": "cus_2",
        "name": "Neha Sharma",
        "birthDate": "1990-02-15",
        "daysUntil": 1
      }
    ],
    "returningCustomers": {
      "count": 3,
      "customers": [
        {
          "id": "cus_3",
          "name": "Riya Kapoor",
          "lastVisit": "2026-04-10",
          "daysSince": 44
        }
      ]
    }
  }
}
```

---

## Opportunities

---

### GET /opportunities

Get all AI opportunities.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| priority | string | Filter by priority (high/medium/low) |
| type | string | Filter by type |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "opp_1",
      "type": "empty_slots",
      "priority": "high",
      "title": "3 empty slots worth ₹7,500",
      "description": "Tomorrow between 1 PM - 4 PM",
      "details": {
        "date": "2026-05-25",
        "slots": [
          { "staffId": "stf_1", "staffName": "Priya", "time": "13:00", "duration": 60, "potentialRevenue": 2500 },
          { "staffId": "stf_1", "staffName": "Priya", "time": "14:00", "duration": 60, "potentialRevenue": 2500 },
          { "staffId": "stf_2", "staffName": "Neha", "time": "15:00", "duration": 60, "potentialRevenue": 2500 }
        ],
        "totalPotentialRevenue": 7500,
        "estimatedBookings": { "min": 2, "max": 3 }
      },
      "action": {
        "type": "create_campaign",
        "label": "Create Campaign"
      },
      "createdAt": "2026-05-24T06:00:00Z"
    },
    {
      "id": "opp_2",
      "type": "inactive_customers",
      "priority": "high",
      "title": "18 inactive customers",
      "description": "Haven't visited in 90+ days",
      "details": {
        "count": 18,
        "averageSpend": 4300,
        "totalPotentialRevenue": 77400,
        "highValue": 5,
        "mediumValue": 8,
        "lowValue": 5
      },
      "action": {
        "type": "re_engage",
        "label": "Re-engage Now"
      },
      "createdAt": "2026-05-24T06:00:00Z"
    }
  ]
}
```

---

### POST /opportunities/{id}/execute

Execute an opportunity action.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "action": "create_campaign"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "campaignId": "cam_123456789",
    "message": "Campaign created successfully"
  }
}
```

---

### POST /opportunities/{id}/dismiss

Dismiss an opportunity.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Opportunity dismissed"
}
```

---

## Campaigns

---

### POST /campaigns

Create a new campaign.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "name": "Monsoon Glow Facial Offer",
  "type": "empty_slots",
  "opportunityId": "opp_1",
  "targetAudience": {
    "type": "recent_customers",
    "filters": {
      "lastVisitDays": 30,
      "minSpend": 2000
    }
  },
  "message": {
    "template": "Special offer! Book a HydraFacial this week and get 20% off. Valid for limited slots. Reply BOOK to reserve your slot.",
    "variables": ["customerName"]
  },
  "channels": ["whatsapp"],
  "scheduledFor": "2026-05-25T09:00:00Z"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "cam_123456789",
    "businessId": "biz_123456789",
    "name": "Monsoon Glow Facial Offer",
    "type": "empty_slots",
    "status": "draft",
    "targetCount": 62,
    "expectedBookings": { "min": 6, "max": 9 },
    "expectedRevenue": 18000,
    "createdAt": "2026-05-24T10:00:00Z"
  }
}
```

---

### POST /campaigns/{id}/send

Send a campaign.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "cam_123456789",
    "status": "sent",
    "sentAt": "2026-05-24T10:00:00Z",
    "sentCount": 62
  }
}
```

---

### GET /campaigns

Get all campaigns.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "cam_123456789",
      "name": "Monsoon Glow Facial Offer",
      "type": "empty_slots",
      "status": "sent",
      "targetCount": 62,
      "bookingsGenerated": 8,
      "revenueRecovered": 18500,
      "sentAt": "2026-05-24T09:00:00Z",
      "createdAt": "2026-05-24T08:00:00Z"
    }
  ]
}
```

---

## WhatsApp

---

### POST /whatsapp/send

Send a WhatsApp message.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "customerId": "cus_123456789",
  "templateId": "tpl_123456789",
  "variables": {
    "customerName": "Anita",
    "serviceName": "HydraFacial",
    "staffName": "Priya",
    "date": "May 25, 2026",
    "time": "11:00 AM"
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "messageId": "msg_123456789",
    "status": "sent",
    "sentAt": "2026-05-24T10:00:00Z"
  }
}
```

---

### GET /whatsapp/templates

Get all WhatsApp templates.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "tpl_123456789",
      "name": "booking_confirmation",
      "template": "Hi {customerName}! ✅ Your {serviceName} with {staffName} is confirmed for {date} at {time}.",
      "variables": ["customerName", "serviceName", "staffName", "date", "time"],
      "isActive": true
    },
    {
      "id": "tpl_456789012",
      "name": "appointment_reminder",
      "template": "Hi {customerName}! 🔔 Reminder: Your {serviceName} with {staffName} is tomorrow at {time}.",
      "variables": ["customerName", "serviceName", "staffName", "time"],
      "isActive": true
    }
  ]
}
```

---

## Online Booking

---

### GET /booking/services

Get services for online booking.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| businessId | string | Business identifier |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "businessName": "Glow Skin Clinic",
    "businessLogo": "https://cdn.aurora.app/logos/glow-skin-clinic.png",
    "services": [
      {
        "id": "svc_123456789",
        "name": "HydraFacial",
        "description": "Deep cleansing and hydration treatment",
        "duration": 60,
        "price": 2500,
        "category": "Facial"
      }
    ]
  }
}
```

---

### GET /booking/availability

Get available slots for booking.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| businessId | string | Business identifier |
| serviceId | string | Service identifier |
| staffId | string | (Optional) Staff identifier |
| date | string | Date (YYYY-MM-DD) |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "date": "2026-05-25",
    "slots": [
      { "time": "09:00", "staffId": "stf_1", "staffName": "Priya", "available": true },
      { "time": "10:00", "staffId": "stf_1", "staffName": "Priya", "available": false },
      { "time": "11:00", "staffId": "stf_1", "staffName": "Priya", "available": true },
      { "time": "12:00", "staffId": "stf_2", "staffName": "Neha", "available": true }
    ]
  }
}
```

---

### POST /booking/confirm

Confirm an online booking.

**Request:**
```json
{
  "businessId": "biz_123456789",
  "serviceId": "svc_123456789",
  "staffId": "stf_123456789",
  "date": "2026-05-25",
  "startTime": "11:00",
  "customerName": "Anita Singh",
  "customerPhone": "+91 98765 43210",
  "customerEmail": "anita.singh@gmail.com",
  "notes": "First time customer"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "appointmentId": "app_123456789",
    "appointment": {
      "id": "app_123456789",
      "customerName": "Anita Singh",
      "serviceName": "HydraFacial",
      "staffName": "Priya Sharma",
      "date": "2026-05-25",
      "time": "11:00",
      "duration": 60,
      "status": "pending"
    },
    "confirmationSent": true,
    "message": "Booking confirmed. WhatsApp confirmation sent."
  }
}
```

---

## Billing

---

### POST /billing/invoices

Create an invoice.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "appointmentId": "app_123456789",
  "customerId": "cus_123456789",
  "items": [
    {
      "serviceId": "svc_123456789",
      "serviceName": "HydraFacial",
      "quantity": 1,
      "price": 2500
    }
  ],
  "discount": 0,
  "tax": 0,
  "paymentMethod": "cash"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "inv_123456789",
    "invoiceNumber": "INV-2026-001",
    "customerName": "Anita Singh",
    "subtotal": 2500,
    "discount": 0,
    "tax": 0,
    "total": 2500,
    "paymentMethod": "cash",
    "paymentStatus": "paid",
    "paidAt": "2026-05-24T10:00:00Z",
    "createdAt": "2026-05-24T10:00:00Z"
  }
}
```

---

### GET /billing/invoices/{id}

Get invoice by ID.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "inv_123456789",
    "invoiceNumber": "INV-2026-001",
    "customerName": "Anita Singh",
    "customerPhone": "+91 98765 43210",
    "items": [
      {
        "serviceName": "HydraFacial",
        "quantity": 1,
        "price": 2500,
        "total": 2500
      }
    ],
    "subtotal": 2500,
    "discount": 0,
    "tax": 0,
    "total": 2500,
    "paymentMethod": "cash",
    "paymentStatus": "paid",
    "paidAt": "2026-05-24T10:00:00Z",
    "createdAt": "2026-05-24T10:00:00Z"
  }
}
```

---

### GET /billing/invoices/customer/{customerId}

Get invoices for a customer.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "inv_123456789",
      "invoiceNumber": "INV-2026-001",
      "total": 2500,
      "paymentStatus": "paid",
      "createdAt": "2026-05-24T10:00:00Z"
    }
  ]
}
```

---

## Common Patterns

### Response Structure

All API responses follow this structure:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message",
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "totalPages": 3
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "One or more validation errors occurred",
    "details": {
      "email": "Email is required",
      "password": "Password must be at least 8 characters"
    }
  }
}
```

### HTTP Status Codes

| Status | Description |
|--------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 500 | Internal Server Error |

### Date/Time Formats

All dates and times are in ISO 8601 format:

- Date: `YYYY-MM-DD` (e.g., `2026-05-24`)
- Time: `HH:mm` (e.g., `11:00`)
- DateTime: `YYYY-MM-DDTHH:mm:ssZ` (e.g., `2026-05-24T10:00:00Z`)

### Pagination

List endpoints support pagination with:

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

### Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| All endpoints | 1000 | 1 hour |
| Auth endpoints | 5 | 15 minutes |

Rate limit headers:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 2026-05-24T11:00:00Z
```

---

*This API specification is the source of truth for all frontend-backend communication. All endpoints must be implemented as specified.*