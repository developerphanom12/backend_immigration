const bcrypt = require('bcrypt');
const userservice = require('../controller/userController');
const { createUserSchema } = require('../validation/validation')
const messages = require('../constants/message')
const saltRounds = 10;
const db = require('../config/configration'); 
const fs = require('fs')

 
const registerUser = async (req, res) => {
  const { username, password, firstname, lastname, email, phone_number, address } = req.body;

  try {
    const existingUser = await userservice.getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username is already register.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userId = await userservice.insertUser(
      username,
      hashedPassword,
      firstname,
      lastname,    
      email,
      phone_number,
      null 
    );

    const addressId = await userservice.insertAddress(
      address.street_address,
      address.city,  
      address.state,
      address.postal_code,
      userId, 
    );

    await userservice.updateUserAddress(userId, addressId);

    const user = {
      id: userId,
      username,
      firstname,
      lastname,
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

    res.status(messages.USER_API.USER_CREATE.status).json({
      message: messages.USER_API.USER_CREATE.message,
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred during user registration.' });
  }
};



// //GET USER BY ID
const getByIdUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await userservice.getUserById1(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(messages.USER_API.USER_FETCH.status).json({
      message: messages.USER_API.USER_FETCH.message,
      data: user
    });
  } catch (error) {
    console.error('Error retrieving user by ID:', error);
    res.status(messages.USER_API.USER_ERROR.status).json({
      message: messages.USER_API.USER_ERROR.message,
    });
  }
};

//----->>> get all user data

const getAllUsers = async (req, res) => {
  
  try {
    const allUsers = await userservice.getalluser();

    res.status(messages.USER_API.USER_FETCH.status).json({
      message: messages.USER_API.USER_FETCH.message,
      data: allUsers,
    });
  } catch (error) {
    console.error('Error retrieving all users:', error);
    res.status(500).json({
      message: 'Error retrieving all users',
    });
  }
};
const uploadImage = async (req, res) => {
  const userId = req.user.id;
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }
  const imagePath = req.file.path;
  const imageName = imagePath.replace(/\\/g, '/').split('/').pop();

  userservice.getProfileImageFilename(userId, (prevImageName) => {
    if (prevImageName) {
      const prevImagePath = `uploads/${prevImageName}`;
      fs.unlink(prevImagePath, (err) => {
        if (err) {
          console.error('Error deleting previous image:', err);
        }
      });
    }

    userservice.updateProfileImage(userId, imageName, (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Profile image update failed' });
      }
      res.status(messages.USER_API.USER_PHOTO.status).json({
        message: messages.USER_API.USER_PHOTO.message,
        data: userId
      });
    });
  });
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
     
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ error: 'An internal server error occurred' });
  }
};




const forgetpass = async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  try {
    await userservice.forgetPassword(userId, currentPassword, newPassword);

    res.status(messages.USER_API.USER_PASSWORD_CHANGE.status).json({
      message: messages.USER_API.USER_PASSWORD_CHANGE.message,
      data: userId
    });
    } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

async function updateUser(req, res) {
  try {
    const userId = req.params.id;
    const { field, value } = req.body;

    const user = await userservice.getUserById1(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await userservice.updateUserField(userId, field, value);

    const updatedUser = await userservice.getUserById1(userId);

    res.status(messages.USER_API.USER_UPDATE.status).json({
      message: messages.USER_API.USER_UPDATE.message,
      data: updatedUser
    }); 
   } 
   catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
async function forgetpasswordbyemail(req, res) {
  const { email } = req.body;

  try {
    const otp =  userservice.sendOTPAndStoreInDatabase(email);
    if (otp) {
      res.status(200).json({message: 'OTP sent successfully' ,data:{
        email:email
    }});
    } else {
      res.status(500).json({ error: 'Failed to send OTP' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to send OTP' });
  }
}

const verifyOTP1 = (req, res) => {
  const { otp } = req.body;

  userservice.verifyOTP(otp, (error, result) => {
    if (error) {
      return res.status(500).json({ error: 'Error verifying OTP' });
    }

    if (result === 'invalid') {
      return res.status(401).json({ status: 404, error: 'Invalid OTP' });
    }

    if (result === 'used') {
      return res.status(401).json({status:400, error: 'OTP has already been used' });
    }

    res.status(200).json({ status : 201,message: 'OTP verified successfully' });
  });
};



const setNewPassword = (req, res) => {
  const { email, newPassword } = req.body;

  userservice.setNewPassword(email, newPassword, (error) => {
    if (error) {
      return res.status(500).json({ error: 'Error setting a new password' });
    }

    res.status(200).json({ status : 200,message: 'New password set successfully' });
  });
};

module.exports = {
  registerUser,
  getByIdUser,
  getAllUsers,
  uploadImage,
  loginUserController,
  forgetpass,
  updateUser,
  forgetpasswordbyemail,
  verifyOTP1,setNewPassword
};
