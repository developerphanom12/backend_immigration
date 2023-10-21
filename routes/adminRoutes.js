const  express = require('express')
const router = express.Router();
const adminservice = require('../controller/adminControoler');
const authenticateToken = require('../service/token');



router.post('/register', adminservice.registerAdmin)


router.post('/login', adminservice.loginUser)

router.get('/allApplication', authenticateToken,adminservice.getAllApplicationstoadmin)



router.post('/statusupdate',authenticateToken,adminservice.updateApplicationStatus)   //---->>>>> statust update
module.exports =router;