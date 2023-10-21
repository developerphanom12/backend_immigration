

const admin = require('../service/adminService')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const saltRounds = 10;
const db = require('../config/configration')







const registerAdmin = async (req, res) => {

    try {
        const { username, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const adminId = await admin.adminregister({ username, password: hashedPassword });

        res.status(201).json({ message: 'Admin registration successful', adminId });
    } catch (error) {
        // Handle errors
        console.error('Error registering admin:', error);
        res.status(500).json({ error: 'Failed to register admin' });
    }

}


const loginUser = async (req, res) => {
    const { username, password } = req.body;

    admin.loginadmin(username, password, (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Login failed' });
        }

        if (result.error) {
            return res.status(401).json({ error: result.error });
        }

        const fetchAllAdminsQuery = 'SELECT * FROM admin';
        db.query(fetchAllAdminsQuery, (fetchErr, adminData) => {
            if (fetchErr) {
                return res.status(500).json({ error: 'Failed to fetch admin data' });
            }

            // Include the token as a string within the adminData object  //
            const responseData = {
                adminData: {
                    ...adminData[0],
                    token: result.token
                }
            };

            res.status(200).json(responseData);
        });
    });
};


const getAllApplicationstoadmin = async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ 
            status: 401,
            error: 'Forbidden for regular users' });
    }
    console.log('User Role:', req.user.role);

    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ 
                status: 403,
                error: 'Forbidden for non-admin users' });
        }

        const applications = await admin.getallapplication();

        if (applications.length === 0) {
            res.status(404).json({ message: 'No applications found' });
        } else {
            res.status(200).json({status:201, applications });
        }
    } catch (error) {
        console.error('Error fetching all applications:', error);
        res.status(500).json({ error: 'Failed to fetch all applications' });
    }
};

const updateApplicationStatus = async (req, res) => {
    const { newStatus, applicationId, } = req.body;
  
    console.log('Received request with newStatus:', newStatus, 'for application ID:', applicationId);
  
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 403,
        error: 'Forbidden. Only admin can approve or reject applications.'
      });
    }
  
    if (newStatus !== 'approved' && newStatus !== 'rejected') {
      return res.status(400).json({
        status: 400,
        error: 'Invalid newStatus. It must be either "approved" or "rejected".'
      });
    }
  
    admin.updateApplicationStatus(applicationId, newStatus, (error, result) => {
      if (error) {
        console.error('Error updating application status:', error);
        return res.status(500).json({
          status: 500,
          error: 'Failed to update application status.'
        });
      }
  
      console.log('Application status updated successfully');
      res.status(200).json({
        status: 200,
        message: 'Application status updated successfully'
      });
    });
}
module.exports = {
    registerAdmin,
    loginUser,
    getAllApplicationstoadmin,
    updateApplicationStatus
}