
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/configration'); // Import the database connection
const {logger} =  require('../utils/logging');
const { use } = require('../routes/adminRoutes');
const nodemailer = require('nodemailer');
const randomstring = require('randomstring');
const fs = require('fs'); // Require the 'fs' module to read the HTML file
const emailTemplate = fs.readFileSync('controller/template.html', 'utf8');


//**********register a new user************//

function registerUser(user) {
  return new Promise((resolve, reject) => {
    const { username, password, firstname, lastname, email, phone_number } = user;
    const query = `
      INSERT INTO users3 
      (username, password, firstname, lastname, email, phone_number)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [username, password, firstname, lastname, email, phone_number], (error, result) => {
      if (error) {
        reject(error);
        logger.error('Error registering user:', error); // Log the error
      } else {
        resolve(result);
        logger.info('User registered successfully');
      }
    });
  });
}

// Function to authenticate user
async function authenticateUser(username, password) {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM users3 WHERE username = ? AND password = ?`;

    if (!query.trim()) {
      console.error('SQL query is empty or contains only whitespace');
      return reject(new Error('SQL query is empty or contains only whitespace'));
    }

    const queryObj = {
      query: query,
      args: [username, password],
      event: "quizQuestionOption"
    };

    db.query(queryObj, [username, password], (error, result) => {
      if (error) {
        reject(error);
        logger.error('Error authenticating user:', error); // Log the error
      } else {
        resolve(result);
        logger.info('User authenticated successfully');
      }
    });
  });
}

const getUserById1 = (userId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT
        u.id AS user_id,
        u.username,
        u.firstname,
        u.lastname,
        u.email,
        u.phone_number,
        u.create_date,
        u.update_date,
        a.address_id AS address_id,
        a.street_address,
        a.city,
        a.state,
        a.postal_code
      FROM user01 u
      INNER JOIN user_address_by a ON u.id = a.user_id
      WHERE u.id = ?`;

    db.query(query, [userId], (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        reject(error);
        logger.error('Error getting user by ID:', error); // Log the error
      } else {
        if (results.length === 0) {
          resolve(null);
        } else {
          // Extract user and address details//
          const userWithAddress = {
            user_id: results[0].user_id,
            username: results[0].username,
            firstname: results[0].firstname,
            lastname: results[0].lastname,
            email: results[0].email,
            phone_number: results[0].phone_number,
            create_date  : results[0].create_date,
            update_date : results[0].update_date,
            address: {
              address_id: results[0].address_id,
              street_address: results[0].street_address,
              city: results[0].city,
              state: results[0].state,
              postal_code: results[0].postal_code,
            },
          };
          resolve(userWithAddress);
          logger.info('User retrieved by ID successfully');
        }
      }
    });
  });
};


function getalluser() {
  return new Promise((resolve, reject) => {
    const query = `
    SELECT
      u.id AS user_id,
      u.username,
      u.firstname,
      u.password,
      u.lastname,
      u.email,
      u.is_active,
      u.phone_number,
      a.address_id AS address_id,
      a.street_address,
      a.city,
      a.state,
      a.postal_code
    FROM user01 u
    INNER JOIN user_address_by a ON u.id = a.user_id
    WHERE u.is_active = 1`;

    db.query(query, (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        reject(error);
        logger.error('Error getting all users:', error); // Log the error
      } else {
        const usersWithAddresses = results.map((row) => ({
          user_id: row.user_id,
          username: row.username,
          firstname: row.firstname,
          password: row.password,
          lastname: row.lastname,
          email: row.email,
          phone_number: row.phone_number,
          is_active: row.is_active,
          address: {
            street_address: row.street_address,
            city: row.city,
            state: row.state,
            postal_code: row.postal_code,
          },
        }));
        resolve(usersWithAddresses);
        logger.info('All users retrieved successfully');
      }
    });
  });
}
// function for upload image 
function updateProfileImage(userId, imagePath, callback) {
  const sql = 'UPDATE user01 SET profile_image = ? WHERE id = ?';
  db.query(sql, [imagePath, userId], (err, result) => {
    if (err) {
      return callback(err);
    }

    return callback(null, result);

  })
}
function getProfileImageFilename(userId, callback) {
  const sql = 'SELECT profile_image FROM user01 WHERE id = ?';
  db.query(sql, [userId], (err, results) => {
    if (err) {
      return callback(err, null);
    }

    if (results.length === 0) {
      return callback(null, null); // User not found or no profile image
    }

    return callback(null, results[0].profile_image);
  });
}

function loginUser(username, password, callback) {

  const query = 'SELECT * FROM user01 WHERE username = ?';

  db.query(query, [username], async (err, results) => {
    if (err) {
      return callback(err, null);
    }

    if (results.length === 0) {
      return callback(null, { error: 'User not found' });
    }

    const user = results[0];

    if (user.is_deleted === 1) {
      return callback(null, { error: 'User not found' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return callback(null, { error: 'Invalid password' });
    }

    const secretKey = 'secretkey';
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, secretKey);

    return callback(null, {
      data: {
        user: {
          id: user.id,
          username: user.username,
          firstname: user.firstname,
          lastname: user.lastname,
          role: user.role,
          token: token,
        }
      }
    });
  });
}

// function for forgot password
function forgetPassword(userId, currentPassword, newPassword) {
  return new Promise((resolve, reject) => {
    
    const selectQuery = 'SELECT * FROM user01 WHERE id = ?';

    db.query(selectQuery, [userId], async (selectError, userResults) => {
      if (selectError) {
        reject(selectError);
        return;
      }

      if (userResults.length === 0) {
        reject(new Error('User not found'));
        return;
      }

      const user = userResults[0];
     // check password match with new password 
      const passwordMatch = await bcrypt.compare(currentPassword, user.password);

      if (!passwordMatch) {
        reject(new Error('Incorrect current password'));
        return;
      }

      // Update the user's password with the new password
      const updateQuery = 'UPDATE users3 SET password = ? WHERE id = ?';

      bcrypt.hash(newPassword, 10, (hashError, hashedPassword) => {
        if (hashError) {
          reject(hashError);
          return;
        } 

        db.query(updateQuery, [hashedPassword, userId], (updateError, updateResults) => {
          if (updateError) {
            reject(updateError);
          } else {
            resolve();
          }
        });
      });
    });
  });
}

// function for update user data 
async function updateUserField(userId, field, newValue) {
  return new Promise((resolve, reject) => {
    let updateQuery;
    if (field === 'username') {
      updateQuery = `UPDATE users3 SET username = ? WHERE id = ?`;
    } 
    else if (field === 'firstname') {
      updateQuery = `UPDATE users3 SET firstname = ? WHERE id = ?`;
    }
     else if (field === 'lastname') {
      updateQuery = `UPDATE users3 SET lastname = ? WHERE id = ?`;
    }
    else if (field === 'email') {
      updateQuery = `UPDATE users3 SET email = ? WHERE id = ?`;
    }
    else if (field === 'phone_number') {
      updateQuery = `UPDATE users3 SET phone_number = ? WHERE id = ?`;
    }
    else {
      return reject(new Error('Invalid field to update'));
    }

    db.query(updateQuery, [newValue, userId], (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}


function insertAddress(street_address, city, state, postal_code, user_id) {
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO user_address_by(street_address, city, state, postal_code, user_id) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [street_address, city, state, postal_code, user_id], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result.insertId);
      }
    });
  });
}
function insertUser(username, password, firstname, lastname, email, phone_number, addressId) {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO user01 (username, password, firstname, lastname, email, phone_number, address_id) VALUES (?, ?, ?, ?, ?, ?, ?)';
        db.query(query, [username, password, firstname, lastname, email, phone_number, addressId], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.insertId);
            }
        });
    });
}

function getUserByUsername(username) {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM user01 WHERE username = ?';
    db.query(query, [username], (err, results) => {
      if (err) {
        reject(err);
      } else {
        // Check if any user with the given username was found
        if (results.length > 0) {
          // User found, return the user data
          resolve(results[0]);
        } else {
          // No user with the given username found
          resolve(null);
        }
      }
    });
  });
}


// updateUserAddress function remains the same
function updateUserAddress(userId, addressId) {
  return new Promise((resolve, reject) => { 
    const query = 'UPDATE user01 SET address_id = ? WHERE id = ?';
    db.query(query, [addressId, userId], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// Function to get a user by email
const getUserByEmail = async (email) => {
  return new Promise((resolve, reject) => {

    // Execute a database query to find a user by email
    const query = 'SELECT * FROM user01 WHERE email = ?  ';
    db.query(query, [email], (err, result) => {
      if (err) {
          reject(err);
      } else {
          resolve(result);
      }
  });
})
 
};


// // //GET USER BY ID
//  const getByIdUser = async (req, res) => {
//   try {
//     const userId = req.params.userId;
//     const user = await getUserById(userId);

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     res.status(200).json(user);
//   } catch (error) {
//     console.error('Error retrieving user by ID:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }catch (error) {
//     console.error('Error fetching user by ID:', error);
//     res.status(messages.COMMON.INVALID_ID.status).json({
//       message: messages.COMMON.INVALID_ID.message,

//     });
//   }
// };


// // Update user information
// const userUpdate = async (req, res) => {
//   const userId = req.params.id;
//   const { username, password, firstname, lastname, email, phone_number } = req.body;

//   try {
//     // Find the user by ID
//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     if (username && user.username !== username) {
//       const existingUsername = await User.findOne({ username });
//       if (existingUsername) {
//         return res.status(409).json({ error: 'Username already exists' });
//       }
//     }

//     if (email && user.email !== email) {
//       const existingEmail = await User.findOne({ email });
//       if (existingEmail) {
//         return res.status(409).json({ error: 'Email already exists' });
//       }
//     }

//     if (username) user.username = username;

//     if (password) {
//       const hashedPassword = await bcrypt.hash(password, 10);
//       user.password = hashedPassword;
//     }
//     if (firstname) user.firstname = firstname;
//     if (lastname) user.lastname = lastname;
//     if (email) user.email = email;
//     if (phone_number) user.phone_number = phone_number;
//         user.updated_at = new Date()

//     await user.save();

//     res.status(messages.USER_API.USER_UPDATE.status).json({
//       message: messages.USER_API.USER_UPDATE.message,
//       user: user

//     });
//   } catch (error) {
//     console.error('Error updating user:', error);
//     res.status(500).json({ error: 'An internal server error occurred' });
//   }
// };


// //---------------->get all user api
// const gettingalluser = async (req, res) => {

//   try {

//     const users = await User.find({ is_deleted: false });
//     console.log("usersss", users) // check in console
//     res.status(200).json({ data: users });

//   } catch (error) {

//     console.error('Error fetching users:', error);
//     res.status(500).json({ error: 'An internal server error occurred' });

//   }

// };

// //-------------> forget user passqword 
// const forgetPassword = async (req, res) => {
//   const { id } = req.params;
//   const { currentPassword, newPassword } = req.body;

//   try {
//     const user = await User.findById(id);
//     const { error } = forgetPasswordSchema.validate(req.body);

//     if (error) {
//       return res.status(400).json({ validation: error.details[0].message });
//     }

//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     //password compare 
//     const passwordMatch = await bcrypt.compare(currentPassword, user.password);

//     if (!passwordMatch) {
//       return res.status(400).json({ error: 'Incorrect current password' });
//     }

//     if (newPassword.length < 8) {
//       return res.status(400).json({ error: 'New password is too short' });
//     }

//     const hashedPassword = await bcrypt.hash(newPassword, 10);
//     user.password = hashedPassword;
//     await user.save();

//     return res.status(200).json({ message: 'Password changed successfully' });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// }



const transporter = nodemailer.createTransport({
  service: 'Gmail', 
  auth: {
    user: 'ashimavineet2729@gmail.com',
    pass: 'xoxe zsvs rwec pjwe',   ////---->>>>>app password  from google
  },
});

function generateOTP() {
  return randomstring.generate({
    length: 6, 
    charset: 'numeric',
  });
}
function sendOTPAndStoreInDatabase(email) {
  return new Promise((resolve, reject) => {
    const emailQuery = 'SELECT email FROM user01 WHERE email = ?';

    db.query(emailQuery, [email], (emailError, emailResults) => {
      if (emailError) {
        console.error('Error retrieving user email:', emailError);
        reject(emailError);
        return;
      }

      if (emailResults.length === 0) {
        reject('User not found');
        return;
      }

      // First, delete the previous OTP records associated with the user's email
      const deletePreviousQuery = 'DELETE FROM otp_table_verify WHERE email = ?';
      db.query(deletePreviousQuery, [email], (deletePreviousError) => {
        if (deletePreviousError) {
          console.error('Error deleting previous OTP records:', deletePreviousError);
          reject(deletePreviousError);
          return;
        }

        const otp = generateOTP();
        const mailOptions = {
          from: 'ashimavineet2729@gmail.com',
          to: email,
          subject: 'Your OTP for Password Reset',
          html: emailTemplate.replace('${otp}', otp),
        }

        // Send the OTP via email
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('Error sending email:', error);
            reject(error);
          } else {
            console.log('Email sent:' ,email);

            // Store the new OTP in the 'otp_table' along with the user's email
            const query = 'INSERT INTO otp_table_verify (email, otp) VALUES (?, ?)';
            db.query(query, [email, otp], (dbError) => {
              if (dbError) {
                console.error('Error storing OTP in the database:', dbError);
                reject(dbError);
              } else {
                console.log('New OTP stored in the database.', otp);
                resolve(otp);
              }
            });
          }
        });
      });
    });
  });
}
function verifyOTP (otp, callback){
  const otpQuery = 'SELECT email, is_verified FROM otp_table_verify WHERE otp = ?';

  db.query(otpQuery, [otp], (otpError, otpResults) => {
    if (otpError) {
      console.error('Error verifying OTP:', otpError);
      return callback(otpError, null);
    }

    if (otpResults.length === 0) {
      return callback(null, 'invalid');
    }

    const isVerified = otpResults[0].is_verified;
    if (isVerified === 1) {
      return callback(null, 'used');
    }

    const email = otpResults[0].email;
    const markVerifiedQuery = 'UPDATE otp_table_verify SET is_verified = 1 WHERE email = ? AND otp = ?';
    db.query(markVerifiedQuery, [email, otp], (markVerifiedError) => {
      if (markVerifiedError) {
        console.error('Error marking OTP as verified:', markVerifiedError);
        return callback(markVerifiedError, null);
      }

      callback(null, 'verified');
    });
  });
};

const setNewPassword = (email, newPassword, callback) => {
  bcrypt.hash(newPassword, 10, (hashError, hashedPassword) => {
    if (hashError) {
      console.error('Error hashing the password:', hashError);
      return callback(hashError);
    }

    const updatePasswordQuery = 'UPDATE user01 SET password = ? WHERE email = ?';

    db.query(updatePasswordQuery, [hashedPassword, email], (updateError) => {
      if (updateError) {
        console.error('Error updating password:', updateError);
        return callback(updateError);
      }

      callback(null);
    });  
  });
};

module.exports = {
  registerUser,
  authenticateUser,
  getUserById1,
  getUserByUsername,
  getalluser,
  updateProfileImage,
  loginUser,
  forgetPassword,
  updateUserField,
  insertAddress,
  insertUser,
  getUserByEmail,
  updateUserAddress,
  getProfileImageFilename,sendOTPAndStoreInDatabase,verifyOTP,setNewPassword
}
// create apipost method first otp send on email and there store in table then scond post api fetch user id from req.user.id and fetch otp from table where user id there then create api ost method new password and confrim password