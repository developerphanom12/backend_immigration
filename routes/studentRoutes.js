const  express = require('express')
const router = express.Router();
const authenticateToken = require('../service/token');
const student = require('../service/studentService')




router.post('/studentregister', student.studentRegister)

router.post('/studentlogin', student.loginStudent)


module.exports = router