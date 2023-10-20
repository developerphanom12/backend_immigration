const db = require('../config/configration')
const {logger} = require('../utils/logging')

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

function adminregister(courseData) {
    return new Promise((resolve, reject) => {
        const insertSql = `INSERT INTO admin (username, password, role) 
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

                // Retrieve the inserted data
                const selectSql = 'SELECT * FROM admin WHERE admin_id = ?';
                db.query(selectSql, [adminId], (selectError, selectResult) => {
                    if (selectError) {
                        console.error('Error retrieving admin data:', selectError);
                        reject(selectError);
                    } else {
                        // Return the inserted admin data in the resolution
                        const adminData = selectResult[0];
                        resolve(adminData);
                    }
                });
            }
        });
    });
}



// function for login user generate token for auntetication
function loginadmin(username, password, callback) {
    const query = 'SELECT * FROM admin WHERE username = ?';
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
  
    

          return callback(null, { token: token });

    })
  }
  
  
module.exports ={
adminregister,
loginadmin
}

