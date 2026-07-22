const express = require('express');
const cors = require('cors');

const app = express();

// 1. Enable Middleware
app.use(cors({ origin: '*' })); // Allows React app to connect
app.use(express.json());

// 2. Import Routes
const calendarRoutes = require('./src/routes/calendarRoutes');
const customerRoutes = require('./src/routes/customerRoutes');
const staffRoutes = require('./src/routes/staffRoutes');
const serviceRoutes = require('./src/routes/serviceRoutes');

// 3. Health Check / Root route (Prevents 404 on http://localhost:5000/)
app.get('/', (req, res) => {
  res.json({ message: 'Aurora Salon API is running!' });
});

// 4. Mount Routes (Make sure /api/staff matches exactly)
app.use('/api/calendar', calendarRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/services', serviceRoutes);

// Catch-all for Chrome DevTools .well-known probe to stop CSP/404 logs
//app.get('/.well-known', (req, res) => {
  //res.sendStatus(204);
//});

// 5. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});