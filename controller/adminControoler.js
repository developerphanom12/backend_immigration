

const admin = require('../service/adminService')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const saltRounds = 10;
const db = require('../config/configration')
const messages = require('../constants/message')







const registerAdmin = async (req, res) => {

    try {
        const { username, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const adminId = await admin.adminregister({ username, password: hashedPassword });

        res.status(201).json({ message: 'Admin registration successful', 
        status:201,
        data: adminId });
    } catch (error) {
        // Handle errors
        console.error('Error registering admin:', error);
        res.status(500).json({ error: 'Failed to register admin' });
    }

}


const loginUser = async (req, res) => {
    const { username, password } = req.body;
try{
    admin.loginadmin(username, password, (err, result) => {
      if (err) {
        console.error('Error:', err);
        return res.status(500).json({ error: 'An internal server error occurred' });
      }

      if (result.error) {
        return res.status(401).json({ error: result.error });
      }

    
      res.status(messages.USER_API.USER_LOGIN_SUCCESS.status).json({
        message: messages.USER_API.USER_LOGIN_SUCCESS.message,
        data: result.data,
        token: result.token,
      });
     
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ error: 'An internal server error occurred' });
  }
};

const loginUserController = async (req, res) => {
    try {
      const { username, password } = req.body;
  
     userservice.loginUser(username, password, (err, result) => {
        if (err) {
          console.error('Error:', err);
          return res.status(500).json({ error: 'An internal server error occurred' });
        }
  
        if (result.error) {
          return res.status(401).json({ error: result.error });
        }
  
      
        res.status(messages.USER_API.USER_LOGIN_SUCCESS.status).json({
          message: messages.USER_API.USER_LOGIN_SUCCESS.message,
          data: result.data,
          token: result.token,
        });
        // Return a success message along with the token and user data
       
      });
    } catch (error) {
      console.error('Error logging in user:', error);
      res.status(500).json({ error: 'An internal server error occurred' });
    }
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
    const { newStatus, applicationId} = req.body;
  
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
  
    admin.updateApplicationStatus(applicationId, newStatus,(error, result) => {
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