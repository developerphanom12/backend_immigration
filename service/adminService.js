const db = require('../config/configration')
const { logger } = require('../utils/logging')
const nodemailer = require('nodemailer')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

function adminregister(courseData) {
    return new Promise((resolve, reject) => {
        const insertSql = `INSERT INTO admintable(username, password, role) 
                           VALUES (?, ?, ?)`;

        const values = [
            courseData.username,
            courseData.password,
            'admin'
        ];

        db.query(insertSql, values, (error, result) => {
            if (error) {
                console.error('Error adding admin:', error);
                reject(error);
            } else {
                const adminId = result.insertId;

                const selectSql = 'SELECT * FROM admintable WHERE id = ?';
                db.query(selectSql, [adminId], (selectError, selectResult) => {
                    if (selectError) {
                        console.error('Error retrieving admin data:', selectError);
                        reject(selectError);
                    } else {
                        const adminData = selectResult[0];
                        resolve(adminData);
                    }
                });
            }
        });
    });
}



function loginadmin(username, password, callback) {
    const query = 'SELECT * FROM admintable WHERE username = ?';
    db.query(query, [username], async (err, results) => {
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
      const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, secretKey);
     console.log('token', token)
      return callback(null, {
        data: {
          user: {
            id: user.id,
            username: user.username,
            password:user.password,
             role : user.role,
            token: token,
          }
        }
      });
    });
  }
  
  


async function getallapplication() {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT
          a.application_id,
          a.student_firstname,
          a.student_passport_no,
          a.application_status,
          a.created_at,
          u.id AS user_id,
          u.username,
          u.phone_number,
          au.university_id AS university_id,
          au.university_name,
          au.person_name,
          au.contact_number,
          c.course_id AS course_id,
          c.course_name,
          c.course_level
        FROM applications_table a
        INNER JOIN user01 u ON a.user_id = u.id
        LEFT JOIN university au ON a.university_id = au.university_id
        LEFT JOIN courses c ON a.course_id = c.course_id
      `;

        db.query(query, (error, results) => {
            if (error) {
                console.error('Error executing query:', error);
                reject(error);
                logger.error('Error getting all applications:', error); // Log the error
            } else {
                const applications = results.map((row) => ({
                    application_id: row.application_id,
                    student_firstname: row.student_firstname,
                    student_passport_no: row.student_passport_no,
                    application_status: row.application_status,
                    user_id: {
                        user_id: row.user_id,
                        username: row.username,
                        phone_number: row.phone_number,
                    },
                    university_id: {
                        university_id: row.university_id,
                        university_name: row.university_name,
                        person_name: row.person_name,
                        contact_number: row.contact_number,
                    },
                    course_id:{
                        course_id:row.course_id,
                        course_name:row.course_name,
                        course_level:row.course_level
                    },
                    is_active: row.is_active,
                    create_date: row.create_date,
                    update_date: row.update_date,
                    is_deleted: row.is_deleted,
                }));
                resolve(applications);
                logger.info('All applications retrieved successfully');
            }
        });
    });
};

const updateApplicationStatus = (applicationId, newStatus,callback) => {
    const updateQuery = 'UPDATE applications_table SET application_status = ? WHERE application_id = ?';
  
    db.query(updateQuery, [newStatus,applicationId], (error, result) => {
      if (error) {
        console.error('Error updating agent status:', error);
        return callback(error, null);
      }
  
      if (result.affectedRows === 0) {
        return callback(null, { error: 'agent not found' });
      }
  
      return callback(null, { message: 'agent status updated successfully' });
    });
  };
  

  const updateagent = (is_aprooved,userId,callback) => {
    const updateQuery = 'UPDATE user01 SET is_aprooved = ? WHERE id = ?';
  
    db.query(updateQuery, [is_aprooved,userId], (error, result) => {
      if (error) {
        console.error('Error updating application status:', error);
        return callback(error, null);
      }
  
      if (result.affectedRows === 0) {
        return callback(null, { error: 'agent not found' });
      }
  
      return callback(null, { message: 'agent status updated successfully' });
    });
  };



const transporter = nodemailer.createTransport({
  service: 'Gmail', 
  auth: {
    user: 'ashimavineet2729@gmail.com',
    pass: 'suqo spfj ajsb fieb',
  },
});

function sendApprovalEmail(email) {
  const mailOption = {
    from: 'ashimavineet2729@gmail.com',
    to: email,
    subject: 'Profile Approved',
    text: 'Congratulations! Your profile has been approved.',
    html: `
   <p> Mention Below Link login here </p>
    <p class="message">You can access your account <a href="https://immigration.phanomprofessionals.com/login"> click here</a>.</p>
    <p class="message">Please use these credentials to access your account.</p>
`,
  };
  transporter.sendMail(mailOption, (error, info) => {
    if (error) {
      console.error('Error sending approval email:', error);
    } else {
      console.log('Approval email sent:', info.response);
    }
  });

}



function sendapprovalstudent(email) {
  const mailOption = {
    from: 'ashimavineet2729@gmail.com',
    to: email,
    subject: 'Profile Approved',
    text: 'Congratulations! Your profile has been approved.',
    html: `
   <p> Mention Below Link login here </p>
    <p class="message">You can access your account <a href="https://immigration.phanomprofessionals.com/studentlogin"> click here</a>.</p>
    <p class="message">Please use these credentials to access your account.</p>
`,
  };
  transporter.sendMail(mailOption, (error, info) => {
    if (error) {
      console.error('Error sending approval email:', error);
    } else {
      console.log('Approval email sent:', info.response);
    }
  });

}



const updatestudent = (is_aprooved,userId,callback) => {
  const updateQuery = 'UPDATE students SET is_aprooved = ? WHERE id = ?';

  db.query(updateQuery, [is_aprooved,userId], (error, result) => {
    if (error) {
      console.error('Error updating students status:', error);
      return callback(error, null);
    }

    if (result.affectedRows === 0) {
      return callback(null, { error: 'students not found' });
    }

    return callback(null, { message: 'students status updated successfully' });
  });
};


const updateUNiversity = (	is_approved	,userId,callback) => {
  const updateQuery = 'UPDATE UniversityRegistration SET 	is_approved	 = ? WHERE id = ?';

  db.query(updateQuery, [is_approved	,userId], (error, result) => {
    if (error) {
      console.error('Error updating students status:', error);
      return callback(error, null);
    }

    if (result.affectedRows === 0) {
      return callback(null, { error: 'students not found' });
    }

    return callback(null, { message: 'students status updated successfully' });
  });
};


function sendupdateuniveristy(email) {
  const mailOption = {
    from: 'ashimavineet2729@gmail.com',
    to: email,
    subject: 'Profile Approved',
    text: 'Congratulations! Your profile has been approved.',
    html: `
   <p> Mention Below Link login here </p>
    <p class="message">You can access your account <a href="https://immigration.phanomprofessionals.com/unilogin"> click here</a>.</p>
    <p class="message">Please use these credentials to access your account.</p>
`,
  };
  transporter.sendMail(mailOption, (error, info) => {
    if (error) {
      console.error('Error sending approval email:', error);
    } else {
      console.log('Approval email sent:', info.response);
    }
  });

}


function getallagent() {
  return new Promise((resolve, reject) => {
      const query = `SELECT  * FROM user01 WHERE is_deleted = 0`

      db.query(query, (error, results) => {
          if (error) {
              console.error('Error executing query:', error);
              reject(error);
              logger.error('Error getting all users:', error); // Log the error
          } else {
              const usersWithAddresses = results.map((row) => ({
                  id: row.id,
                  firstname: row.firstname,
                  lastname: row.lastname,
                  email: row.email,
                  phone_number: row.phone_number,
                  role: row.role,
              }));
              resolve(usersWithAddresses);
              logger.info('All users retrieved successfully');
          }
      });
  });
}

  
function getallstudent() {
  return new Promise((resolve, reject) => {
      const query = `SELECT  * FROM students WHERE is_deleted = 0`

      db.query(query, (error, results) => {
          if (error) {
              console.error('Error executing query:', error);
              reject(error);
              logger.error('Error getting all users:', error); // Log the error
          } else {
              const usersWithAddresses = results.map((row) => ({
                  id: row.id,
                  first_name: row.first_name,
                  last_name: row.last_name,
                  email: row.email,
                  phone_number: row.phone_number,
                  dob:row.dob,
                  role: row.role,
              }));
              resolve(usersWithAddresses);
              logger.info('All users retrieved successfully');
          }
      });
  });
}


  
function getalluniversity() {
  return new Promise((resolve, reject) => {
      const query = `SELECT  * FROM UniversityRegistration WHERE is_deleted = 0`

      db.query(query, (error, results) => {
          if (error) {
              console.error('Error executing query:', error);
              reject(error);
              logger.error('Error getting all university:', error); // Log the error
          } else {
              const usersWithAddresses = results.map((row) => ({
                  id: row.id,
                  university_name: row.university_name,
                  ambassador_name: row.ambassador_name,
                  phone_number: row.phone_number,
                  email: row.email,
                  year_established :row.callbackyear_established,
                  role: row.role,
              }));
              resolve(usersWithAddresses);
              logger.info('All university retrieved successfully');
          }
      });
  });
}




module.exports = {
    adminregister,
    loginadmin,
    getallapplication,
    updateApplicationStatus,
    getallagent,
    getallstudent,
    getalluniversity,
    sendApprovalIfApproved,
    updateagent,
    sendApprovalEmail,
    updatestudent,
    sendapprovalstudent,
    updateUNiversity,
    sendupdateuniveristy
    // sendApprovalEmailofagent
}

