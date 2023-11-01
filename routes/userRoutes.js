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
router.post('/reset', userService.forgetpasswordbyemail)

router.post('/verify-otp', userService.verifyOTP1)

router.post('/set-new-password', userService.setNewPassword)

// // Create a Nodemailer transporter
// const transporter = nodemailer.createTransport({
//     service: "gmail",
    
//     auth: {
//      user: 'ashimavineet2729@gmail.com',
//      pass: 'xoxe zsvs rwec pjwe',
//     },
//    });
  
//   // Function to generate a random OTP
//   const generateOTP = () => {
//     const otp = Math.floor(1000 + Math.random() * 9000);
//     return otp.toString();
//   };
  
 

// router.post('/send-otp', (req, res) => {
//     const { email } = req.body;
//   sendOTPAndStoreInDatabase(email, (error, otp) => {
//       if (error) {
//         return res.status(500).json({ error: 'Failed to send OTP' });
//       } else if (otp) {
//         return res.status(200).json({ message: 'OTP sent successfully', otp });
//       } else {
//         return res.status(500).json({ error: 'Failed to send OTP' });
//       }
//     });
//   });
  
//   function sendOTPAndStoreInDatabase(email, callback) {
//     const emailQuery = 'SELECT email FROM user01 WHERE email = ?'; // Change to use email
//     db.query(emailQuery, [email], (emailError, emailResults) => {
//       if (emailError) {
//         console.error('Error retrieving user email:', emailError);
//         callback(emailError, null);
//         return;
//       }
  
//       if (emailResults.length === 0) {
//         callback('User not found', null);
//         return;
//       }
  
//       const otp = generateOTP();
//       const mailOptions = {
//         from: 'ashimavineet2729@gmail.com',
//         to: email,
//         subject: 'Your OTP for Password Reset',
//         text: `Hello,\n\nYour OTP for password reset is: ${otp}. Please use this OTP to verify your identity and reset your password. Below are some additional details:\n\n
//         - OTP: ${otp}
//         - Validity: This OTP is valid for the next 30 minutes.
//         - Security: Please keep this OTP confidential and do not share it with anyone.
//         - If you did not request this OTP, please ignore this message.
        
//         To reset your password, visit our password reset page and enter this OTP: [Password Reset Link]
        
//         If you have any questions or need assistance, please contact our support team at supportphanomteam@example.com.
        
//         Thank you for using our service!\n\n
//         Best regards,\nYour Phanom Team`,
//       };
      
  
//       // Send the OTP via email
//       transporter.sendMail(mailOptions, (error, info) => {
//         if (error) {
//           console.error('Error sending email:', error);
//           callback(error, null);
//         } else {
//           console.log('Email sent:');
  
//           // Store the OTP in the 'otp_table' along with the user's ID
//           const query = 'INSERT INTO otp_table (email, otp) VALUES (?, ?)'; // Change to use email
//           db.query(query, [email, otp], (dbError) => {
//             if (dbError) {
//               console.error('Error storing OTP in the database:', dbError);
//               callback(dbError, null);
//             } else {
//               console.log('OTP stored in the database.');
//               callback(null, otp);
//             }
//           });
//         }
//       });
//     });
//   }
  
//   router.post('/verify-otp', (req, res) => {
//     const { otp } = req.body;
  
//     // Query the database to verify the OTP without specifying the email
//     const otpQuery = 'SELECT email, is_verified FROM otp_table_verify WHERE otp = ?';
//     db.query(otpQuery, [otp], (otpError, otpResults) => {
//       if (otpError) {
//         console.error('Error verifying OTP:', otpError);
//         return res.status(500).json({ error: 'Error verifying OTP' });
//       }
  
//       if (otpResults.length === 0) {
//         return res.status(401).json({ error: 'Invalid OTP' });
//       }
  
//       // Check if the OTP is already verified
//       const isVerified = otpResults[0].is_verified;
//       if (isVerified === 1) {
//         return res.status(401).json({ error: 'OTP has already been used' });
//       }
  
//       // If the OTP is valid, mark it as verified in the database
//       const email = otpResults[0].email;
//       const markVerifiedQuery = 'UPDATE otp_table_verify SET is_verified = 1 WHERE email = ? AND otp = ?';
//       db.query(markVerifiedQuery, [email, otp], (markVerifiedError) => {
//         if (markVerifiedError) {
//           console.error('Error marking OTP as verified:', markVerifiedError);
//           return res.status(500).json({ error: 'Error marking OTP as verified' });
//         }
  
//         // Return a success response to the client
//         res.status(200).json({ message: 'OTP verified successfully' });
//       });
//     });
//   });
  
    module.exports = router;

    // Avineetsingh###11


