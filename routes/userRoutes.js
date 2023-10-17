const express = require("express");
const router = express.Router();
const { upload } = require('../service/multer');
const authenticateToken = require("../service/token");
const userService = require('../service/userService');
const { validateRegistrationData } = require("../validation/validation");



//***************************user-routes-here****************************//


/**---1---**/
router.post('/registerss', validateRegistrationData, userService.registerUser)


/**---2---**/
router.post('/login1', userService.loginUserController);


/**---3---**/ 
router.get('/get/detail',authenticateToken, userService.getByIdUser);


/**---4---**/
router.put('/:id', authenticateToken,userService.updateUser);


//***********************---5---************************//

router.post('/upload-profile-image',authenticateToken, upload.single('profile_image'), userService.uploadImage)

//            
/**---6---**/
router.get('/usersgetall/api', authenticateToken,userService.getAllUsers);



//              /**---7---**/
router.post('/change-password/:id', authenticateToken, userService.forgetpass)


module.exports = router;


