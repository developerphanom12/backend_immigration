const express = require("express");
const router = express.Router();
const univeristy = require('../service/univesityService')
const {universityValid, coursesValid, coursenewschemma} = require('../validation/validation');
const authenticateToken = require("../service/token");
const { upload } = require('../service/multer');
  
//******************************university routes********************************** *//

router.post('/register', upload.fields([{ name: 'registration_certificate' }, { name: 'university_image' }]), univeristy.registerUniversityAndUploadImage);

router.post('/unilogin',univeristy.uniersitylogin)

router.post('/universitys',authenticateToken, universityValid,univeristy.registerUniversity)

router.get('/:id' ,  univeristy.getUniversityByIdHandler)

router.get('/getall/university', authenticateToken, univeristy.getalluniversity) //------------>>>>>s

  
router.put('/updateUniversity/:id', univeristy.updateUniversity1);
 

router.put('/image/:id', upload.single('university_image'), univeristy.uploadImage1)


/******************************Courses Api********************************************************** */
    
router.post('/newcoursesadd',authenticateToken, coursenewschemma,univeristy.courseadd)


router.post('/courses1' ,coursesValid,authenticateToken, univeristy.courseCreate)


router.get('/get/allcourse', univeristy.getAllCoursesHandler);


router.get('/all/courseonly', authenticateToken, univeristy.getallcourses1)   //----->>>>>>>>>>courses



router.get('/get/:id', univeristy.getById)



module.exports = router;
