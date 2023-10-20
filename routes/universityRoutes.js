const express = require("express");
const router = express.Router();
const univeristy = require('../service/univesityService')
const {universityValid, coursesValid} = require('../validation/validation');
const authenticateToken = require("../service/token");
const { upload } = require('../service/multer');
  
//******************************university routes********************************** *//

router.post('/universitys',authenticateToken, universityValid,univeristy.registerUniversity)


router.get('/:id' ,  univeristy.getUniversityByIdHandler)



router.get('/getall/university', univeristy.getalluniversity)


  
router.put('/updateUniversity/:id', univeristy.updateUniversity1);
 

router.put('/image/:id', upload.single('university_image'), univeristy.uploadImage1)




/******************************  Courses Api  ********************************************************** */
    
router.post('/courses1' ,authenticateToken,coursesValid, authenticateToken, univeristy.courseCreate)


router.get('/get/allcourse', univeristy.getAllCoursesHandler);


router.get('/get/:id', univeristy.getById)


router.put

module.exports = router;
