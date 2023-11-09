const db = require('../config/configration')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')







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





  module.exports = {
    getstudentname,
    insertStudent,
    insertAddress,
    updatestudentaddress,
    loginStudent
  }
  