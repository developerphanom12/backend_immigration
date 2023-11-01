const db = require('../config/configration')
const { logger } = require('../utils/logging')

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

const updateApplicationStatus = (applicationId, newStatus, comment,callback) => {
    const updateQuery = 'UPDATE applications_table SET application_status = ? ,comment = ?WHERE application_id = ?';
  
    db.query(updateQuery, [newStatus, comment,applicationId], (error, result) => {
      if (error) {
        console.error('Error updating application status:', error);
        return callback(error, null);
      }
  
      if (result.affectedRows === 0) {
        return callback(null, { error: 'Application not found' });
      }
  
      return callback(null, { message: 'Application status updated successfully' });
    });
  };
  
  
  
module.exports = {
    adminregister,
    loginadmin,
    getallapplication,
    updateApplicationStatus
}

