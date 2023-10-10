// // // const mongoose = require("mongoose");

// // // const otpTableSchema = new mongoose.Schema({
// // //     email : {type: String, required : true, unique: true},
// // //     otp :{type: Number}
// // //   })

// // // module.exports = mongoose.model('OtpTable',otpTableSchema)


// // const mysql = require('mysql2/promise');
// // const bcrypt = require('bcrypt');
// // const jwt = require('jsonwebtoken');

// // const dbConfig = {
// //   host: 'your_mysql_host',
// //   user: 'your_mysql_user',
// //   password: 'your_mysql_password',
// //   database: 'your_database_name',
// // };

// // // Function to authenticate user
// // async function authenticateUser(username, password) {
// //   const connection = await mysql.createConnection(dbConfig);

// //   try {
// //     const [rows] = await connection.execute('SELECT * FROM your_single_table_name WHERE username = ?', [username]);

// //     if (rows.length === 0) {
// //       throw new Error('Invalid username or password');
// //     }

// //     const user = rows[0];

// //     const passwordMatch = await bcrypt.compare(password, user.password);

// //     if (!passwordMatch) {
// //       throw new Error('Invalid username or password');
// //     }

// //     return {
// //       username: user.username,
// //       firstname: user.firstname,
// //       lastname: user.lastname,
// //     };
// //   } finally {
// //     connection.end();
// //   }
// // }

// // // Function to handle login
// // const login = async (req, res) => {
// //   const { username, password } = req.body;

// //   try {
// //     const user = await authenticateUser(username, password);

// //     // Generate JWT token
// //     const secretKey = 'your-secret-key';
// //     const token = jwt.sign(user, secretKey, { expiresIn: '1h' });

// //     res.status(200).json({
// //       message: 'User login successful',
// //       token: token,
// //       user: user,
// //     });
// //   } catch (error) {
// //     console.error('Error logging in user:', error);
// //     res.status(401).json({ error: error.message });
// //   }
// // };

// // module.exports = login;


// const mysql = require('mysql');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const dbConnection = require('./db'); // Import your database connection module

// const loginUser = async (req, res) => {
//   try {
//     const { username, password } = req.body;

//     // Query the database to find the user by username
//     const query = 'SELECT * FROM users WHERE username = ?';
//     dbConnection.query(query, [username], async (err, results) => {
//       if (err) {
//         console.error('Error querying the database:', err);
//         return res.status(500).json({ error: 'An internal server error occurred' });
//       }

//       if (results.length === 0) {
//         return res.status(401).json({ error: 'Invalid user' });
//       }

//       const user = results[0];

//       // Compare the password with the hashed password from the database
//       const passwordMatch = await bcrypt.compare(password, user.password);

//       if (!passwordMatch) {
//         return res.status(401).json({ error: 'Invalid password' });
//       }

//       // Generate a JWT token
//       const secretKey = 'your-secret-key';
//       const token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '1h' });

//       // You can save the token in the database or return it as needed

//       res.status(200).json({
//         message: 'Login successful',
//         token: token,
//         user: {
//           id: user.id,
//           username: user.username,
//           // Add other user data you want to include in the response
//         },
//       });
//     });
//   } catch (error) {
//     console.error('Error logging in user:', error);
//     res.status(500).json({ error: 'An internal server error occurred' });
//   }
// };

// module.exports = loginUser;

