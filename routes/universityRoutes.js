const express = require("express");
const router = express.Router();
const univeristy = require('../service/univesityService')
const {universityValid, coursesValid} = require('../validation/validation');
const authenticateToken = require("../service/token");

  
//******************************university routes********************************** *//

router.post('/universitys', universityValid,univeristy.registerUniversity)


router.get('/:id' ,  univeristy.getUniversityByIdHandler)



router.get('/getall/university', univeristy.getalluniversity)



router.put('/updateUniversity/:id', univeristy.updateUniversity1);



/******************************  Courses Api  ********************************************************** */

router.post('/courses1' ,coursesValid, authenticateToken, univeristy.updateUniversity11)


router.get('/get/allcourse', univeristy.getAllCoursesHandler);


router.get('/get/:id', univeristy.getById)


module.exports = router;
