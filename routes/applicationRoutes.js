const  express = require('express')
const router = express.Router()
const application = require ('../service/applicationService')
const {upload1} =  require('../service/multerfileforapp');
const authenticateToken = require('../service/token');
const { validateApplicationData } = require('../validation/validation');



router.post('/addappplications', validateApplicationData,authenticateToken, application.addApplication) 



router.put('/upload/documents/:id',upload1.fields([{ name: 'aadhar' }, { name: 'pan' }]),application.uploadDocuments);


router.get('/fetchallapplication' ,authenticateToken, application.getUserApplicationsHandler)


router.get('/getbyid/:id',authenticateToken,application.getUserApplicationsHandler)

router.get('/search/with/',authenticateToken, application.searchApplicationsHandler);



router.get('/applicationgetby/:id', application.getDocumentByFileId);
















module.exports =router;