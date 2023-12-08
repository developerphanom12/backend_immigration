const express = require("express");
const router = express.Router();
const univeristy = require('../service/univesityService')
const { universityValid, coursesValid, coursenewschemma, ugschema, validatetutionfess, validateUniversityRegisastration, FAqschema, NewUpdateuniversity } = require('../validation/validation');
const authenticateToken = require("../service/token");
const { upload } = require('../service/multer');

//******************************university routes***********************************//


router.get('/getallug', authenticateToken, univeristy.getallugrequirement) //--->>get al ug courses requirement

router.get('/getallpg', authenticateToken, univeristy.getallpgrequirement) //---------->>> get al pg courses requirement

router.get('/getdatabyid', authenticateToken, univeristy.getallacoursebyid) //-->>>get all courses


router.post('/register',upload.fields([{ name: 'university_image' }, { name: 'registration_certificate' }]), validateUniversityRegisastration,univeristy.registerUniversityAndUploadImage); //allnewapi

router.post('/unilogin', univeristy.uniersitylogin)  //allnewapi

router.post('/universitys', authenticateToken, universityValid, univeristy.registerUniversity)


router.get('/getall/university', authenticateToken, univeristy.getalluniversity) //------------>>>>>s


router.put('/updateUniversity',authenticateToken, univeristy.updateUniversity1);


router.put('/image/:id', upload.single('university_image'), univeristy.uploadImage1)

router.post('/universityFaq', authenticateToken,FAqschema, univeristy.UniversityFAQ) //---------->>> //by ambassdor new api //allnewapi



router.get('/getbyUniversity/:id', authenticateToken, univeristy.getuniveristybyids) //---------->>> //by id of univeristy get data

/******************************Courses Api********************************************************** */

router.post('/newcoursesadd', authenticateToken,coursenewschemma, univeristy.courseadd) //---------->>> //by ambassdor new api //allnewapi

router.post('/ugrequirement', authenticateToken, ugschema, univeristy.ugRequirement) //---------->>> //by ambassdor new api //allnewapi

router.post('/pgrequirement', authenticateToken, ugschema, univeristy.pgRequirement) //---------->>> //by ambassdor new api //allnewapi


router.post('/courses1', coursesValid, authenticateToken, univeristy.courseCreate)


router.get('/get/allcourse', univeristy.getAllCoursesHandler);


router.get('/all/courseonly', authenticateToken, univeristy.getallcourses1)   //----->>>>>>>>>>courses  //allnewapi



router.get('/get/:id',authenticateToken, univeristy.getallbyidcourses)//////------>>>>>>>>getftech new courses //allnewapi


router.post('/tutionfess', validatetutionfess, univeristy.tutionfess)  // tuion fess

router.put('/updatess/:id',authenticateToken, univeristy.updateCoursesAndTuitionController); ///--->>>update coursed  new api  

router.post('/newupdateuniveristy',authenticateToken, univeristy.updateCoursesAndTuitionController); ///--->>>update coursed ata new

router.post('/latestupdate', authenticateToken,NewUpdateuniversity, univeristy.latestupdateUniversity) //---------->>> //by ambassdor new api //allnewapi

///***forgot password*****////


router.post('/reset', univeristy.forgetpasswordEMAIL)



router.post('/verify-otp',univeristy.VERIFYOTP)

router.post('/set-new-password', univeristy.SETNEWpassWORD)

router.get('/getiduniveirsty', authenticateToken, univeristy.getbyownuniversitydata)

module.exports = router;
