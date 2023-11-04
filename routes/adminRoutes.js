const  express = require('express')
const router = express.Router();
const adminservice = require('../controller/adminControoler');
const authenticateToken = require('../service/token');
const addcountry = require('../service/countryService')


router.post('/register', adminservice.registerAdmin)


router.post('/login', adminservice.loginUser)

router.get('/allApplication', authenticateToken,adminservice.getAllApplicationstoadmin)


router.post('/statusupdate',authenticateToken,adminservice.updateApplicationStatus)   //---->>>>> statust update


router.post('/addcountrywise/' , addcountry.addcountry)


router.post('/addstaff/' , addcountry.addstaff)
router.post('/stafflogin/' , addcountry.stafflogin)
router.get('/getallcountry/' , authenticateToken,addcountry.fetchallcountry)

module.exports =router;