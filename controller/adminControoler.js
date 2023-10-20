

const admin = require('../service/adminService')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const saltRounds = 10;
const db = require('../config/configration')







const registerAdmin = async (req, res) => {

try {
    // Extract the request data (e.g., username and plaintext password)
    const { username, password } = req.body;

    // Hash the plaintext password using bcrypt
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Call the adminregister function with the hashed password
    const adminId = await admin.adminregister({ username, password: hashedPassword });

    // Send a successful response
    res.status(201).json({ message: 'Admin registration successful', adminId });
} catch (error) {
    // Handle errors
    console.error('Error registering admin:', error);
    res.status(500).json({ error: 'Failed to register admin' });
}

}


const loginUser = async (req, res) => {
    const { username, password } = req.body;

    admin.loginadmin(username, password, (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Login failed' });
        }

        if (result.error) {
            return res.status(401).json({ error: result.error });
        }

        const fetchAllAdminsQuery = 'SELECT * FROM admin';
        db.query(fetchAllAdminsQuery, (fetchErr, adminData) => {
            if (fetchErr) {
                return res.status(500).json({ error: 'Failed to fetch admin data' });
            }

            // Include the token as a string within the adminData object  //
            const responseData = {
                adminData: {
                    ...adminData[0],
                    token: result.token
                }
            };

            res.status(200).json(responseData);
        });
    });
};



module.exports = {
    registerAdmin,
    loginUser
}