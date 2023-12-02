const db = require('../config/configration')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const emailTemplate = fs.readFileSync('controller/template.html', 'utf8');
const nodemailer = require('nodemailer');
const randomstring = require('randomstring');





function insertStudent(username, first_name, last_name,password,gender,dob, email, phone_number, addressId) {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO students (username, first_name,last_name, password,gender,dob,email, phone_number, address_id) VALUES (?, ?, ?, ?, ?, ?, ?,?,?)';
        db.query(query, [username, first_name, last_name, password,gender, dob, email,phone_number,addressId], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.insertId);
            }
        });
    });
}



function getstudentname(username) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM students WHERE username = ?';
      db.query(query, [username], (err, results) => {
        if (err) {
          reject(err);
        } else {
          if (results.length > 0) {
            resolve(results[0]);
          } else {
            resolve(null);
          }
        }
      });
    });
  }
  


function insertAddress(street_address, city, state, postal_code, student_id) {
    return new Promise((resolve, reject) => {
      const query = 'INSERT INTO student_addresse(street_address, city, state, postal_code, student_id) VALUES (?, ?, ?, ?, ?)';
      db.query(query, [street_address, city, state, postal_code, student_id], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result.insertId);
        }
      });
    });
  }



// updateUserAddress function remains the same
function updatestudentaddress(userId, addressId) {
    return new Promise((resolve, reject) => { 
      const query = 'UPDATE students SET address_id = ? WHERE id = ?';
      db.query(query, [addressId, userId], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }





function loginStudent(username, password, callback) {

  const query = 'SELECT * FROM students WHERE username = ?';

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


function generateOTP() {
  return randomstring.generate({
    length: 6, 
    charset: 'numeric',
  });
}

const transporter = nodemailer.createTransport({
  service: 'Gmail', 
  auth: {
    user: 'ashimavineet2729@gmail.com',
    pass: 'lvzi nwhx jzng oumz',   ////---->>>>>app password  from google
  },
});

function sendotpSTudent(email) {
  return new Promise((resolve, reject) => {
    const emailQuery = 'SELECT email FROM students WHERE email = ?';

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

    const updatePasswordQuery = 'UPDATE students SET password = ? WHERE email = ?';

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
    getstudentname,
    insertStudent,
    insertAddress,
    updatestudentaddress,
    loginStudent,
    sendotpSTudent,
    verifyOTP,
    setNewPassword
  }
  