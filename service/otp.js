// // const generateOTP = () => {
// //     const otp = Math.floor(1000 + Math.random() * 9000);
// //     return otp.toString();
// //   };
  
// //   module.exports = {
// //     generateOTP,
// //   };


// const express = require('express');
// const router = express.Router();
// const nodemailer = require('nodemailer');
// const randomstring = require('randomstring');
// const mysql = require('mysql');

// // Create a MySQL connection
// const dbConnection = mysql.createConnection({
//   host: 'your_database_host',
//   user: 'your_database_user',
//   password: 'your_database_password',
//   database: 'your_database_name',
// });

// // Create a Nodemailer transporter
// const transporter = nodemailer.createTransport({
//   service: 'your_email_service', // e.g., 'Gmail' for Gmail
//   auth: {
//     user: 'your_email_address',
//     pass: 'your_email_password',
//   },
// });

// // Function to generate a random OTP
// function generateOTP() {
//   return randomstring.generate({
//     length: 6, // Length of the OTP
//     charset: 'numeric',
//   });
// }
// // Function to send OTP via email and store it in the database based on username
// // Function to send OTP via email and store it in the database based on username
// function sendOTPAndStoreInDatabase(username, callback) {
//   // Retrieve the user's email based on the username (Assuming you have a 'users' table)
//   const emailQuery = 'SELECT email FROM users WHERE username = ?';
//   dbConnection.query(emailQuery, [username], (emailError, emailResults) => {
//     if (emailError) {
//       console.error('Error retrieving user email:', emailError);
//       callback(emailError, null);
//       return;
//     }

//     if (emailResults.length === 0) {
//       callback('User not found', null);
//       return;
//     }

//     const email = emailResults[0].email;

//     // Check if the email already exists in the otp_table
//     const checkEmailQuery = 'SELECT email FROM otp_table WHERE email = ?';
//     dbConnection.query(checkEmailQuery, [email], (checkEmailError, checkEmailResults) => {
//       if (checkEmailError) {
//         console.error('Error checking if email exists in otp_table:', checkEmailError);
//         callback(checkEmailError, null);
//         return;
//       }

//       if (checkEmailResults.length > 0) {
//         callback('Email already has an OTP', null);
//         return;
//       }

//       const otp = generateOTP();
//       const mailOptions = {
//         from: 'your_email_address',
//         to: email,
//         subject: 'Your OTP for Password Reset',
//         text: `Your OTP is: ${otp}`,
//       };

//       // Send the OTP via email
//       transporter.sendMail(mailOptions, (error, info) => {
//         if (error) {
//           console.error('Error sending email:', error);
//           callback(error, null);
//         } else {
//           console.log('Email sent:', info.response);

//           // Store the OTP in the database
//           const query = 'INSERT INTO otp_table (user_id, email, otp) VALUES (?, ?, ?)';
//           // Retrieve the user's ID based on the username
//           const userIdQuery = 'SELECT id FROM users WHERE username = ?';
//           dbConnection.query(userIdQuery, [username], (userIdError, userIdResults) => {
//             if (userIdError) {
//               console.error('Error retrieving user ID:', userIdError);
//               callback(userIdError, null);
//             } else {
//               const userId = userIdResults[0].id;
//               dbConnection.query(query, [userId, email, otp], (dbError) => {
//                 if (dbError) {
//                   console.error('Error storing OTP in the database:', dbError);
//                   callback(dbError, null);
//                 } else {
//                   console.log('OTP stored in the database.');
//                   callback(null, otp);
//                 }
//               });
//             }
//           });
//         }
//       });
//     });
//   });
// }
// frist step is send otp on email email select from user01 table where username there create api for this

// // Define the route to send OTP via email and store it in the database
// router.post('/send-otp', (req, res) => {
//   const userId = req.user.id; // Replace with your authentication logic
//   const userEmail = 'user@example.com'; // Replace with the user's email
//   sendOTPAndStoreInDatabase(userEmail, userId, (error, otp) => {
//     if (error) {
//       res.status(500).json({ error: 'Failed to send OTP' });
//     } else {
//       res.status(200).json({ message: 'OTP sent successfully', otp });
//     }
//   });
// });

// module.exports = router;


// Import necessary modules and dependencies
const nodemailer = require('nodemailer');
const randomstring = require('randomstring');
const mysql = require('mysql');

// Create a MySQL connection
const dbConnection = mysql.createConnection({
  host: 'your_database_host',
  user: 'your_database_user',
  password: 'your_database_password',
  database: 'your_database_name',
});

// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'Gmail', // e.g., 'Gmail' for Gmail
  auth: {
    user: 'ashimavineet2729@gmail.com',
    pass: 'Avi@15271527',
  },
});

// Function to generate a random OTP
function generateOTP() {
  return randomstring.generate({
    length: 6, // Length of the OTP
    charset: 'numeric',
  });
}

function sendOTPAndStoreInDatabase(username, callback) {
  const emailQuery = 'SELECT email FROM user01 WHERE username = ?';
  dbConnection.query(emailQuery, [username], (emailError, emailResults) => {
    if (emailError) {
      console.error('Error retrieving user email:', emailError);
      callback(emailError, null);
      return;
    }

    if (emailResults.length === 0) {
      callback('User not found', null);
      return;
    }

    const email = emailResults[0].email;
    const otp = generateOTP();
    const mailOptions = {
      from: 'your_email_address',
      to: email,
      subject: 'Your OTP for Password Reset',
      text: `Your OTP is: ${otp}`,
    };

    // Send the OTP via email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        callback(error, null);
      } else {
        console.log('Email sent:', info.response);

        // Store the OTP in the 'otp_table' along with the user's ID
        const query = 'INSERT INTO otp_table (username, email, otp) VALUES (?, ?, ?)';
        dbConnection.query(query, [username, email, otp], (dbError) => {
          if (dbError) {
            console.error('Error storing OTP in the database:', dbError);
            callback(dbError, null);
          } else {
            console.log('OTP stored in the database.');
            callback(null, otp);
          }
        });
      }
    });
  });
}

module.exports = { sendOTPAndStoreInDatabase };
