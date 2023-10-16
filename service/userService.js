const bcrypt = require('bcrypt');
const userservice = require('../controller/userController');
const { createUserSchema } = require('../validation/validation')
const messages = require('../constants/message')
const saltRounds = 10;
// const jwt = require('jsonwebtoken')
// const path = require('path')
// const { upload } = require('../service/multer')
const db = require('../config/configration'); // Import the database connection





const registerUser = async (req, res) => {
  const { username, password, firstname, lastname, email, phone_number, address } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10); 

  
    const userId = await userservice.insertUser(
      username,
      hashedPassword,
      firstname,
      lastname,
      email,
      phone_number,
      null // Pass null as //
    );

    const addressId = await userservice.insertAddress(
      address.street_address,
      address.city,
      address.state,
      address.postal_code,
      userId
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
        postal_code: address.postal_code
      }
    };

    res.status(messages.USER_API.USER_CREATE.status).json({
      message: messages.USER_API.USER_CREATE.message,
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred during user registration.' });
  }
};


// //GET USER BY ID
const getByIdUser = async (req, res) => {
  try {
    const userId = req.params.id;
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
  const userId = req.params.userId;
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }
  const imagePath = req.file.path;
  const imageName = imagePath.replace(/\\/g, '/').split('/').pop(); // Normalize path and get the image name

  userservice.updateProfileImage(userId, imageName, (err, result) => {

    if (err) {
      return res.status(500).json({ error: 'Profile image update failed' });
    }
    res.status(messages.USER_API.USER_PHOTO.status).json({
      message: messages.USER_API.USER_PHOTO.message,
      data: userId
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
      // Return a success message along with the token and user data
     
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ error: 'An internal server error occurred' });
  }
};




const forgetpass = async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;

  try {
    await userservice.forgetPassword(id, currentPassword, newPassword);

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

    // Check if the user exists
    const user = await userservice.getUserById1(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    //sql query for update data filed 
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



module.exports = {
  registerUser,
  getByIdUser,
  getAllUsers,
  uploadImage,
  loginUserController,
  forgetpass,
  updateUser,
};
