const applicationservice = require('../controller/applicationController')


const addApplication = async (req, res) => {
  const courseData = req.body;
  const userId = req.user.id;

  try {
    const applicationId = await applicationservice.addApplication(courseData, userId);
    console.log('Application added with ID:', applicationId);

    
    const insertedData = await applicationservice.getApplication(applicationId);

    res.status(200).json({
      message: 'Application added successfully',
      data: insertedData,
    });
  } catch (error) {
    if (error) {
      res.status(401).json({ error: error.message });
    } else {
    
      console.error('Error adding application:', error);
      res.status(500).json({ error: 'Failed to add application' });
    }
  }
};




const uploadDocuments = async (req, res) => {
  const userId = req.params.userId;

  if (!req.files || !req.files['aadhar_card_blob'] || !req.files['pan_card_blob']) {
    return res.status(400).json({ error: 'Please provide Aadhar Card and PAN Card images.' });
  }

  const aadharCardImageName = getImageName(req.files['aadhar_card_blob'][0].path);
  const panCardImageName = getImageName(req.files['pan_card_blob'][0].path);


  const aadharCardData = {
    fileType: 'aadhar_card',
    filePath: aadharCardImageName,
  };

  const panCardData = {
    fileType: 'pan_card',
    filePath: panCardImageName,
  };

 
  applicationservice.insertApplicationDocuments(userId, aadharCardData, (aadharCardError) => {
    if (aadharCardError) {
      console.error('Database error for Aadhar Card:', aadharCardError);
      return res.status(500).json({ error: 'Document upload failed' });
    }

    
    applicationservice.insertApplicationDocuments(userId, panCardData, (panCardError) => {
      if (panCardError) {
        console.error('Database error for PAN Card:', panCardError);
        return res.status(500).json({ error: 'Document upload failed' });
      }

   
      res.status(201).json({ message: 'Documents uploaded successfully', data: applicationservice });
    });
  });
}




const getDocumentByFileId = async (req, res) => {
  const userId = req.params.id;

  if (!userId) {
    return res.status(400).json({ error: 'File ID is required' });
  }

  // Query the database to retrieve the document by `file_id`
  applicationservice.getDocumentByFileId(userId, (error, document) => {
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to retrieve the document' });
    }

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Return the retrieved document as a JSON response
    res.status(200).json({ document });
  });
};

function getImageName(imagePath) {
  const imageName = imagePath.replace(/\\/g, '/').split('/').pop(); // Normalize path and get the image name
  return imageName;
}



const getAllCofdsfsdfgursesHandler = async (req, res) => {
  try {
     
      const courses = await applicationservice.getAllCoursesWithUserDaghfjgity();

      const successMessage = 'application data  fetch successfully';
      res.status(201).json({
          message: successMessage,
          data: courses,
      });
  } catch (error) {
      console.error('Error fetching courses with user and university data:', error);
      const errorMessage = 'Error fetching courses';
      res.status(500).json({ error: errorMessage });
  }
};







// Export the new function
module.exports = {
  getDocumentByFileId,
  uploadDocuments, addApplication,
  getAllCofdsfsdfgursesHandler
};
