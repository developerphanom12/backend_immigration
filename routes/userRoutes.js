const express = require("express");
const router = express.Router();
const { upload } = require('../service/multer');
const authenticateToken = require("../service/token");
const userService = require('../service/userService');
const { validateRegistrationData } = require("../validation/validation");
const db = require('../config/configration'); // Import the database connection

const nodemailer = require('nodemailer');
const randomstring = require('randomstring');

//***************************user-routes-here****************************//


/**---1---**/
router.post('/registerss', validateRegistrationData, userService.registerUser)


/**---2---**/
router.post('/login1', userService.loginUserController);


/**---3---**/ 
router.get('/get/detail',authenticateToken, userService.getByIdUser);


/**---4---**/
router.put('/:id', authenticateToken,userService.updateUser);


//***********************---5---************************//

router.post('/upload-profile-image',authenticateToken, upload.single('profile_image'), userService.uploadImage)

//            
/**---6---**/
router.get('/usersgetall/api', authenticateToken,userService.getAllUsers);



//              /**---7---**/
router.post('/change-password/:id', authenticateToken, userService.forgetpass)
router.post('/reset',authenticateToken, userService.forgetpasswordbyemail)

router.post('/verify-otp', authenticateToken,userService.verifyOTP1)

router.post('/set-new-password',authenticateToken, userService.setNewPassword)


  // router.post('/comments', authenticateToken, (req, res) => {
  //   const { application_id, comment_text } = req.body;
  //   const userId = req.user.id; // Get the user's ID from the authenticated request
  //   const userRole = req.user.role; // Get the user's role from the authenticated request
  
  //   // Check if the provided user_id exists in the 'user01' table
  //   // You can perform the validation here, ensuring the user exists.
  
  //   // Insert the comment into the 'comment_table' using the authenticated user's ID
  //   const insertSql = 'INSERT INTO comment_table (user_id, application_id, comment_text, role) VALUES (?, ?, ?, ?)';
  //   db.query(insertSql, [userId, application_id, comment_text, userRole], (insertErr, insertResult) => {
  //     if (insertErr) {
  //       console.error('Error creating comment: ' + insertErr);
  //       res.status(500).json({ error: 'Could not create comment' });
  //     } else {
  //       res.status(201).json({ data: insertResult, message: 'Comment created successfully' });
  //     }
  //   });
  // });
  
    module.exports = router;

    // Avineetsingh###11


