const  express = require('express')
const router = express.Router();
const authenticateToken = require('../service/token');
const student = require('../service/studentService')




router.post('/studentregister', student.studentRegister)

router.post('/studentlogin', student.loginStudent)

router.post('/reset', student.forgetpasswordbyemail)

router.post('/verify-otp',student.verifyOTP1)


router.post('/set-new-password', student.setNewPassword)


module.exports = router