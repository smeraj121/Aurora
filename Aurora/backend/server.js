const express = require('express');
const cors = require('cors');
const errorHandler = require('./src/middlewares/errorHandler');
const db = require('./src/config/db');

const app = express();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Routes
const calendarRoutes = require('./src/routes/calendarRoutes');
const customerRoutes = require('./src/routes/customerRoutes');
const staffRoutes = require('./src/routes/staffRoutes');
const serviceRoutes = require('./src/routes/serviceRoutes');
const packageRoutes = require('./src/routes/packageRoutes');
const appointmentRoutes = require('./src/routes/appointmentRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const authRoutes = require('./src/routes/authRoutes');
const tenantRoutes = require('./src/routes/tenantRoutes');
const designationRoutes = require('./src/routes/designationRoutes');

app.get('/', (req, res) => {
  res.json({ message: 'Aurora Salon API is running!' });
});

app.use('/api/calendar', calendarRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/designations', designationRoutes);

app.use(errorHandler);

// TEMPORARY DATABASE CONNECTION TEST
db.query('SELECT NOW() AS now')
  .then(result => {
    console.log('✅ DATABASE CONNECTED:', result.rows[0]);
  })
  .catch(error => {
    console.error('❌ DATABASE CONNECTION FAILED:', error.message);
  });

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});