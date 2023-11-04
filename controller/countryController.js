const db = require('../config/configration')
const nodemailer = require('nodemailer');
const {logger} = require('../utils/logging')
const fs = require('fs')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// const emailTemplate = fs.readFileSync('controller/staffregister.html', 'utf8');

// Define a function to add a new application //
function addcountry(staffdata) {
    return new Promise((resolve, reject) => {

        const insertSql = `INSERT INTO country (country_name) 
          VALUES (?)`;
        const values = [
            staffdata.country_name,
         ];
        db.query(insertSql, values, (error, result) => {
            if (error) {
                console.error('Error  course:', error);
                reject(error);
            } else {
                const courseId = result.insertId;
                resolve(courseId);
            }
        });
    });
}

async function addstaff(staff) {
    return new Promise((resolve, reject) => {
        const { staff_name, password, staff_email, staff_phone_number, country_id } = staff;

        // Hash the password
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                reject(err);
                logger.error('Error hashing password:', err);
            } else {
                const query = `
                    INSERT INTO staff 
                    (staff_name, password, staff_email, staff_phone_number, country_id)
                    VALUES (?, ?, ?, ?, ?)
                `;

                db.query(query, [staff_name, hashedPassword, staff_email, staff_phone_number, country_id], (error, result) => {
                    if (error) {
                        reject(error);
                        logger.error('Error registering staff:', error);
                    } else {
                        const insertedStaff = {
                            id: result.insertId,
                            staff_name,
                            password: hashedPassword, // Store the hashed password
                            staff_email,
                            staff_phone_number,
                            country_id,
                            is_active: true,
                            create_date: new Date(),
                            update_date: new Date()
                        };

                        // Sending a registration email to the user
                        sendRegistrationEmail(staff_email, staff_name, password); // Pass the original password

                        resolve(insertedStaff);
                        logger.info('Staff registered successfully', insertedStaff);
                    }
                });
            }
        });
    });
}


// Function to send a registration email
function sendRegistrationEmail(email, username, password) {
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'ashimavineet2729@gmail.com',
            pass: 'xoxe zsvs rwec pjwe', 
        }
    })
    const mailOptions = {
        from: 'ashimavineet2729@gmail.com',
        to: email,
        subject: 'Registration Successful',
        html: `
            <p class="message">Hello, ${username},staff</p>
            <p class="message">Your registration details are as follows:</p>
            <p class="credentials"><strong>Username:</strong> ${username}</p>
            <p class="credentials"><strong>Password:</strong> ${password}</p>
            <p class="message">Please use these credentials to access your account.</p>
        `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}


function stafflogin(staff_name, password, callback) {
    const query = 'SELECT * FROM staff WHERE staff_name = ?';
    db.query(query, [staff_name], async (err, results) => {
      if (err) {
        return callback(err, null);
      }
  
      if (results.length === 0) {
        return callback(null, { error: 'Invalid user' });
      }
  
      const user = results[0];
  
      const passwordMatch = await bcrypt.compare(password, user.password);
  
      if (!passwordMatch) {
        return callback(null, { error: 'Invalid password' });
      }
  
      const secretKey = 'secretkey';
      const token = jwt.sign({
        id: user.id,
        staff_name: user.staff_name,
        role: user.role,
        country_id: user.country_id, // Include country_id in the token
      }, secretKey);
  
      return callback(null, {
        data: {
          user: {
            id: user.id,
            staff_name: user.staff_name,
            password: user.password,
            role: user.role,
            country_id: user.country_id, // Include country_id in the response
            token: token,
          }
        }
      });
    });
  }
  
  async function getAllCountries() {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM country'; // Replace 'countries' with your actual table name

        db.query(query, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}
  
module.exports ={
    addcountry,
    addstaff,
    stafflogin,
    getAllCountries
}

