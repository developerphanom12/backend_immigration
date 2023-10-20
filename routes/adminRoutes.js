const  express = require('express')
const router = express.Router();
const adminservice = require('../controller/adminControoler')



router.post('/register', adminservice.registerAdmin)


router.post('/login', adminservice.loginUser)


module.exports =router;