const  express = require('express')
const router = express.Router()
const application = require ('../service/applicationService')
const {upload1} =  require('../service/multerfileforapp');
const authenticateToken = require('../service/token');
const { validateApplicationData } = require('../validation/validation');



router.post('/addappplications', validateApplicationData,authenticateToken, application.addApplication) 

router.put('/upload/documents/:id',upload1.fields([{ name: 'aadhar' }, { name: 'pan' },{ name: 'pass_front' },{ name: 'pass_back' },{ name: '10th' },{ name: '12th' }]),application.uploadDocuments);

router.get('/fetchallapplications' ,authenticateToken, application.getUserApplicationsHandler)

router.get('/getbyid/:id',authenticateToken,application.getUserApplicationsHandler)

router.get('/search/with/',authenticateToken, application.searchApplicationsHandler);

router.get('/getbydata',authenticateToken,application.getApplicationCountsController) //-->>count data

router.get('/applicationgetby/:id', application.getDocumentByFileId); 


router.get('/notification',authenticateToken,application.notifystatus) //--->>>>>check applicationand comment













module.exports =router;