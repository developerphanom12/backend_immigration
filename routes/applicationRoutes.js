const  express = require('express')
const router = express.Router()
const application = require ('../service/applicationService')
const {upload1} =  require('../service/multerfileforapp');
const authenticateToken = require('../service/token');
// const { validateApplicationData } = require('../validation/validation');

// const jwt = require('jsonwebtoken');
// const secretKey = 'secretkey';
// import React, { useState } from 'react';

// function YourComponent() {
//   const [a, setA] = useState("this is");

//   const handleChange = (event) => {
//     setA(event.target.value);
//   };

//   return (
//     <input type="text" value={a} onChange={handleChange} />
//   );
// }

// export default YourComponent;


router.post('/addappplications',authenticateToken, application.addApplication) 

router.put('/upload/documents/:id',upload1.fields([{ name: 'aadhar' }, { name: 'pan' },{ name: 'pass_front' },{ name: 'pass_back' },{ name: '10th' },{ name: '12th' }]),application.uploadDocuments);

router.put('/update/documents/:id', upload1.fields([{ name: 'aadhar' }, { name: 'pan' }, { name: 'pass_front' }, { name: 'pass_back' }, { name: '10th' }, { name: '12th' }]), application.updateDocuments);


router.get('/fetchallapplications' ,authenticateToken, application.getUserApplicationsHandler)

router.get('/getbyid/:applicationId',authenticateToken,application.getbyid)

router.get('/search/with/',authenticateToken, application.searchApplicationsHandler);

router.get('/getbydata',authenticateToken,application.getApplicationCountsController) //-->>//coutnall data with agent

router.get('/staffcount',authenticateToken,application.staffdata) //-->>//coutnall data with staff

router.get('/count',authenticateToken,application.countby) //-->>count data --->>>///

router.get('/applicationgetby/:id', application.getDocumentByFileId); 


router.get('/notification',authenticateToken,application.notifystatus) //--->>>>>check applicationand comment


router.get('/generate-exc111el',authenticateToken,application.getexcelshheetdata)

router.post('/comments', authenticateToken,application.getcooment)



// const authenticateToken111 = (req, res, next) => {
//     const token = req.headers.authorization.split(' ')[1];
  
//     if (!token) {
//       return res.status(401).json({ error: 'Unauthorized user, please provide a token' });
//     }
  
//     jwt.verify(token, secretKey, (err, decodedToken) => {
//       if (err) {
//         return res.status(401).json({ error: 'Invalid token' });
//       }
  
//       // Assuming the country_id is stored in the decoded token
//       const { country_id, ...user } = decodedToken;
  
//       req.user = {
//         ...user,
//         country_id, // Add the country_id to the user object
//       };
  
//       next();
//     });
//   };
  

// router.get('/fetchalla' ,authenticateToken, application.getApplicationsByAdminCountryController)






module.exports =router;