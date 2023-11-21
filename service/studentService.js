

const studnetservice =  require('../controller/studentController')
const messages = require('../constants/message')
const bcrypt = require('bcrypt')

// dob what hwo pas in json postman 
const studentRegister = async (req, res) => {
    const { username, password, first_name, last_name, gender,dob,email, phone_number, address } = req.body;
  
    try {
      const existingUser = await studnetservice.getstudentname(username);
      if (existingUser) {
        return res.status(400).json({ error: 'Username is already register.' });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const userId = await studnetservice.insertStudent(
        username,
        first_name,
        last_name,
        hashedPassword,
        gender,
        dob,  
        email,
        phone_number,
        null 
      );
  
      const addressId = await studnetservice.insertAddress(
        address.street_address,
        address.city,  
        address.state,
        address.postal_code,
        userId, 
      );
  
      await studnetservice.updatestudentaddress(userId, addressId);
  
      const user = {
        id: userId,
        username,
        first_name,
        last_name,
        gender,
        dob,
        email,
        phone_number,
        address: {
          id: addressId,
          street_address: address.street_address,
          city: address.city,
          state: address.state,
          postal_code: address.postal_code,
        },
        
      };
  
      res.status(messages.USER_API.student.status).json({
        message: messages.USER_API.student.message,
        status:200,
        data: user,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred during user registration.' });
    }
  };
  



const loginStudent = async (req, res) => {
    try {
      const { username, password } = req.body;
  
     studnetservice.loginStudent(username, password, (err, result) => {
        if (err) {
          console.error('Error:', err);
          return res.status(500).json({ error: 'An internal server error occurred' });
        }
  
        if (result.error) {
          return res.status(401).json({ error: result.error });
        }
   
      
        res.status(messages.USER_API.USER_LOGIN_Student.status).json({
          message: messages.USER_API.USER_LOGIN_Student.message,
          status:200,
          data: result.data,
          token: result.token,
        });
       
      });
    } catch (error) {
      console.error('Error logging in user:', error);
      res.status(500).json({ error: 'An internal server error occurred' });
    }
  };
  



async function forgetpasswordbyemail(req, res) {
  const { email } = req.body;

  try {
    const otp = studnetservice.sendotpSTudent(email);
    if (otp) {
      res.status(200).json({
        message: 'OTP sent successfully', data: {
          email: email
        }
      });
    } else {
      res.status(500).json({ error: 'Failed to send OTP' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to send OTP' });
  }
}



const verifyOTP1 = (req, res) => {
  const { otp } = req.body;

  studnetservice.verifyOTP(otp, (error, result) => {
    if (error) {
      return res.status(500).json({ error: 'Error verifying OTP' });
    }

    if (result === 'invalid') {
      return res.status(401).json({ status: 404, error: 'Invalid OTP' });
    }

    if (result === 'used') {
      return res.status(401).json({ status: 400, error: 'OTP has already been used' });
    }

    res.status(200).json({ status: 201, message: 'OTP verified successfully' });
  });
};



const setNewPassword = (req, res) => {
  const { email, newPassword } = req.body;

  studnetservice.setNewPassword(email, newPassword, (error) => {
    if (error) {
      return res.status(500).json({ error: 'Error setting a new password' });
    }

    res.status(200).json({ status: 200, message: 'New password set successfully' });
  });
};



  module.exports = {
    studentRegister,
    loginStudent,
    forgetpasswordbyemail,
    verifyOTP1,
    setNewPassword
  }