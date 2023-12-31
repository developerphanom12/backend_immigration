

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

    res.status(201).json({
      message: 'Admin registration successful',
      status: 201,
      data: adminId
    });
  } catch (error) {
    // Handle errors
    console.error('Error registering admin:', error);
    res.status(500).json({ error: 'Failed to register admin' });
  }

}


const loginUser = async (req, res) => {
  const { username, password } = req.body;
  try {
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
      error: 'Forbidden for regular users'
    });
  }
  console.log('User Role:', req.user.role);

  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 403,
        error: 'Forbidden for non-admin users'
      });
    }

    const applications = await admin.getallapplication();

    if (applications.length === 0) {
      res.status(404).json({ message: 'No applications found' });
    } else {
      res.status(200).json({ status: 201, applications });
    }
  } catch (error) {
    console.error('Error fetching all applications:', error);
    res.status(500).json({ error: 'Failed to fetch all applications' });
  }
};

const updateApplicationStatus = async (req, res) => {
  const { newStatus, applicationId } = req.body;

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


// add role in this page  
const getallagent = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      status: 401,
      error: 'Forbidden for regular users'
    });
  }
  console.log('User Role:', req.user.role);

  try {
    const allUsers = await admin.getallagent();

    if (allUsers) {
      res.status(201).json({
        message: 'retrive all agent successfully',
        status: 201,
        data: allUsers,
      });
    } else {
      res.status(404).json({
        message: "not data found",
        status: 404
      })
    }

  } catch (error) {
    console.error('Error retrieving all agent:', error);
    res.status(500).json({
      status: 500,
      message: 'Error retrieving all agent',
    });
  }
};



// add role in this page  
const getalluniversity = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      status: 401,
      error: 'Forbidden for regular users'
    });
  }
  console.log('User Role:', req.user.role);

  try {
    const allUsers = await admin.getalluniversity();

    if (allUsers) {
      res.status(201).json({
        message: 'retrive all university successfully',
        status: 201,
        data: allUsers,
      });
    } else {
      res.status(404).json({
        message: "not data found",
        status: 404
      })
    }

  } catch (error) {
    console.error('Error retrieving all universities:', error);
    res.status(500).json({
      status: 500,
      message: 'Error retrieving all universities',
    });
  }
};

// add role in this page  
const getallstudent = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      status: 401,
      error: 'Forbidden for regular users'
    });
  }
  console.log('User Role:', req.user.role);

  try {
    const allUsers = await admin.getallstudent();

    if (allUsers) {
      res.status(201).json({
        message: 'retrive all studnet successfully',
        status: 201,
        data: allUsers,
      });
    } else {
      res.status(404).json({
        message: "not data found",
        status: 404
      })
    }

  } catch (error) {
    console.error('Error retrieving all studnet:', error);
    res.status(500).json({
      status: 500,
      message: 'Error retrieving all studnet',
    });
  }
};



const updatestatusofagent = async (req, res) => {
  const { userId, email, is_aprooved } = req.body;

  try {
    if (req.user.role !== 'admin') {
      throw {
        status: 403,
        error: 'Forbidden. Only admin can approve or reject applications.'
      };
    }

    if (is_aprooved !== 0 && is_aprooved !== 1) {
      throw {
        status: 400,
        error: 'Invalid is_approved value. It must be either 0 or 1.'
      };
    }

    admin.updateagent(is_aprooved, userId, (error, result) => {
      if (error) {
        console.error('Error updating agent status:', error);
        throw {
          status: 500,
          error: 'Failed to update agent status.'
        };
      }

      console.log('agent status updated successfully');

      if (is_aprooved === 1) {
        admin.sendApprovalEmail(email);
      }

      res.status(200).json({
        status: 200,
        message: 'agent status updated successfully'
      });
    });
  } catch (error) {
    res.status(error.status || 500).json(error);
  }
};



const updatestudent = async (req, res) => {
  const { userId, email, is_aprooved } = req.body;

  try {
    if (req.user.role !== 'admin') {
      throw {
        status: 403,
        error: 'Forbidden. Only admin can approve or reject applications.'
      };
    }

    if (is_aprooved !== 0 && is_aprooved !== 1) {
      throw {
        status: 400,
        error: 'Invalid is_approved value. It must be either 0 or 1.'
      };
    }

    admin.updatestudent(is_aprooved, userId, (error, result) => {
      if (error) {
        console.error('Error updating student status:', error);
        throw {
          status: 500,
          error: 'Failed to update student status.'
        };
      }

      console.log('student status updated successfully');

      if (is_aprooved === 1) {
        admin.sendapprovalstudent(email);
      }

      res.status(200).json({
        status: 200,
        message: 'student status updated successfully'
      });
    });
  } catch (error) {
    res.status(error.status || 500).json(error);
  }
};




const updateuniversity = async (req, res) => {
  const { userId, email, 	is_approved } = req.body;

  try {
    if (req.user.role !== 'admin') {
      throw {
        status: 403,
        error: 'Forbidden. Only admin can approve or reject applications.'
      };
    }

    if (	is_approved !== 0 && 	is_approved !== 1) {
      throw {
        status: 400,
        error: 'Invalid is_approved value. It must be either 0 or 1.'
      };
    }

    admin.updateUNiversity	(is_approved, userId, (error, result) => {
      if (error) {
        console.error('Error  updateuniversity status:', error);
        throw {
          status: 500,
          error: 'Failed to updateuniversity status.'
        };
      }

      console.log('updateuniversity add status  successfully');

      if (	is_approved === 1) {
        admin.sendupdateuniveristy(email);
      }

      res.status(200).json({
        status: 200,
        message: 'updateuniversity status updateuniversity'
      });
    });
  } catch (error) {
    res.status(error.status || 500).json(error);
  }
};


const checkadminallsales = async (req, res) => {
  const selectedYear = req.query.year;

  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden for regular users" });
  }
  console.log("User Role:", req.user.role);

  try {
    let salesData;

      if (!isNaN(selectedYear)) {
      salesData = await admin.adminchecksalesBYYear(selectedYear);
      if (salesData.length === 0) {
        return res
          .status(404)
          .json({
            status: 404,
            error: `No sales data found for the year ${selectedYear}`,
          });
      }
    }
    res.status(201).json({
      success: 201,
      data: salesData,
    });
  }  catch (error) {
    res.status(error.status || 500).json(error);
  }
};


const checkadminallsales1 = async (req, res) => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;

  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden for regular users" });
  }
  console.log("User Role:", req.user.role);

  try {
    let salesData;

    salesData = await admin.admincheckbymonthallsales(currentMonth);

    if (salesData.length === 0) {
      return res.status(404).json({
        status: 404,
        error: `No sales data found for the current month (${currentMonth})`,
      });
    }

    res.status(201).json({
      success: 201,
      data: salesData,
    });
  } catch (error) {
    res.status(error.status || 500).json(error);
  }
};



module.exports = {
  registerAdmin,
  loginUser,
  getAllApplicationstoadmin,
  updateApplicationStatus,
  getallagent,
  getallstudent,
  getalluniversity,
  updatestatusofagent,
  updatestudent,
  updateuniversity,
  checkadminallsales,
  checkadminallsales1
  

}