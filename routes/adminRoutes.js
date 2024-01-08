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


router.post('/addstaff' ,authenticateToken,addstaffrequired,addcountry.addstaff);


router.post('/stafflogin/' , addcountry.stafflogin);


router.get('/getallcountry/' , authenticateToken,addcountry.fetchallcountry);

router.get('/getagent' ,authenticateToken,adminservice.getallagent); //---->>> all agent-----//

router.get('/getallstudent' , authenticateToken,adminservice.getallstudent); //---->>> all student

router.get('/getalluniversity' , authenticateToken,adminservice.getalluniversity); //---->>> all university

router.post('/updat11e',authenticateToken, adminservice.updatestatusofagent)  // agent aprrove status update

router.post('/updatestudent',authenticateToken, adminservice.updatestudent)


router.post('/updateUniversity',authenticateToken, adminservice.updateuniversity)


router.get('/getsales', authenticateToken,adminservice.checkadminallsales);

router.get('/getsalescurrentmonth', authenticateToken,adminservice.checkadminallsales1);

module.exports =router;


