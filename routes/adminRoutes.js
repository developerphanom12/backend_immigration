const  express = require('express')
const router = express.Router();
const adminservice = require('../controller/adminControoler');
const authenticateToken = require('../service/token');
const addcountry = require('../service/countryService');
const { addstaffrequired } = require('../validation/validation');


router.post('/register', adminservice.registerAdmin);


router.post('/login', adminservice.loginUser);

router.get('/allApplication', authenticateToken,adminservice.getAllApplicationstoadmin);


router.post('/statusupdate',authenticateToken,adminservice.updateApplicationStatus);   //---->>>>> statust update


router.post('/addcountrywise/' , addcountry.addcountry);


router.post('/addstaff/' ,addstaffrequired,addcountry.addstaff);


router.post('/stafflogin/' , addcountry.stafflogin);


router.get('/getallcountry/' , authenticateToken,addcountry.fetchallcountry);

router.get('/getagent' , authenticateToken,adminservice.getallagnt); //---->>> all agent

router.get('/getallstudent' , authenticateToken,adminservice.getallagnt); //---->>> all agent

router.get('/getalluniversity' , authenticateToken,adminservice.getallagnt); //---->>> all agent


module.exports =router;


