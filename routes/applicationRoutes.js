const  express = require('express')
const router = express.Router()
const application = require ('../service/applicationService')
const {upload1} =  require('../service/multerfileforapp');
const authenticateToken = require('../service/token');

router.get('/jj/:id', application.getDocumentByFileId);


router.post('/cr', authenticateToken, application.addApplication) 

router.post('/upload/documents/:userId',  upload1.fields([{ name: 'aadhar_card_blob' }, { name: 'pan_card_blob' }]),application .uploadDocuments);


router.get('/dbfj' , application.getAllCofdsfsdfgursesHandler)

module.exports =router;