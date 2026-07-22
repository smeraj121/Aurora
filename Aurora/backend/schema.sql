-- Enable UUID extension (optional, using SERIAL for IDs here for simplicity)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================================
-- 1. STAFF / EMPLOYEES TABLE
-- =========================================================================
CREATE TABLE IF NOT EXISTS staff (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'Stylist', -- 'Senior Stylist', 'Manager', 'Barber'
  avatar_color VARCHAR(30) DEFAULT 'bg-purple-600',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- 2. CUSTOMERS TABLE
-- =========================================================================
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL, -- Phone is unique primary contact
  email VARCHAR(150) UNIQUE,
  notes TEXT,                        -- Color formulas, allergies, preferences
  total_visits INT DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0.00,
  last_visit_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- 3. SERVICES CATALOG TABLE
-- =========================================================================
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(50) NOT NULL,    -- 'Hair', 'Skincare', 'Nails', 'Spa'
  duration_minutes INT NOT NULL DEFAULT 60,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- 4. APPOINTMENTS TABLE (Core Engine)
-- =========================================================================
CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  customer_id INT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  staff_id INT REFERENCES staff(id) ON DELETE SET NULL,
  appointment_date DATE NOT NULL,
  time_slot VARCHAR(10) NOT NULL,   -- e.g. '10:00', '14:30'
  status VARCHAR(20) NOT NULL DEFAULT 'Confirmed',
    -- Allowed statuses: 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'No Show'
  total_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- UNIQUE CONSTRAINT: Prevent double-booking a staff member at the exact same date & time slot!
  CONSTRAINT unique_staff_schedule UNIQUE (staff_id, appointment_date, time_slot)
);

-- =========================================================================
-- 5. APPOINTMENT SERVICES (Junction Table for Multi-Service Bookings)
-- =========================================================================
CREATE TABLE IF NOT EXISTS appointment_services (
  id SERIAL PRIMARY KEY,
  appointment_id INT NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  service_id INT NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  service_price DECIMAL(10,2) NOT NULL, -- Snapshot of price at time of booking
  
  -- Prevent attaching the exact same service multiple times to 1 appointment
  CONSTRAINT unique_appointment_service UNIQUE (appointment_id, service_id)
);

-- =========================================================================
-- 6. PAYMENTS / INVOICES TABLE
-- =========================================================================
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  appointment_id INT UNIQUE NOT NULL REFERENCES appointments(id) ON DELETE RESTRICT,
  customer_id INT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(30) NOT NULL DEFAULT 'Card', -- 'Cash', 'Card', 'UPI'
  payment_status VARCHAR(20) NOT NULL DEFAULT 'Paid',  -- 'Paid', 'Refunded', 'Pending'
  transaction_ref VARCHAR(100),
  paid_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- 7. AI ASSISTANT INTERACTION LOGS
-- =========================================================================
CREATE TABLE IF NOT EXISTS ai_logs (
  id SERIAL PRIMARY KEY,
  prompt_type VARCHAR(50) NOT NULL, -- 'suggest_slot', 'revenue_forecast', 'summary'
  user_query TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Fast lookups for daily calendar queries filtering by date & staff
CREATE INDEX idx_appointments_date_staff ON appointments(appointment_date, staff_id);

-- Fast customer history lookups
CREATE INDEX idx_appointments_customer ON appointments(customer_id);

-- Fast revenue reporting by date range
CREATE INDEX idx_payments_paid_at ON payments(paid_at);

-- Seed Initial Staff
INSERT INTO staff (name, email, phone, role, avatar_color) VALUES
  ('Aarav Mehta', 'aarav@aurora.com', '+91 98000 11111', 'Senior Stylist', 'bg-purple-600'),
  ('Ananya Roy', 'ananya@aurora.com', '+91 98000 22222', 'Hair Specialist', 'bg-pink-600'),
  ('Rohan Sharma', 'rohan@aurora.com', '+91 98000 33333', 'Barber & Spa', 'bg-indigo-600')
ON CONFLICT (email) DO NOTHING;

-- Seed Common Services
INSERT INTO services (name, category, duration_minutes, price) VALUES
  ('Hair Cut & Styling', 'Hair', 60, 1200.00),
  ('Balayage Hair Color', 'Hair', 120, 3500.00),
  ('Beard Trim & Facial', 'Spa', 45, 850.00),
  ('Luxury Manicure', 'Nails', 45, 1000.00)
ON CONFLICT (name) DO NOTHING;