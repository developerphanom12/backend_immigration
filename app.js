const express = require('express');
const app = express();
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const universityRoutes = require('./routes/universityRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const studentRoutes = require('./routes/studentRoutes');
const path = require('path');
const cors = require('cors');

dotenv.config();

app.use(express.json()); 

app.use(cors({ origin: true })); // Enable CORS

// User routes
app.use('/api/users', userRoutes);

// University routes
app.use('/api/university', universityRoutes);

// Application routes
app.use('/api/application', applicationRoutes);

// Admin routes
app.use('/api/admin', adminRoutes);

// Student routes
app.use('/api/student', studentRoutes);

const port = process.env.PORT || 3100;
const ipAddress = '127.0.0.1';

// Serve static files
app.use('/application', express.static(path.join(__dirname, 'application')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(port, () => {
    console.log(`Server is running on http://${ipAddress}:${port}`);
});
