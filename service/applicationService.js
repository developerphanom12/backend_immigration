const { error } = require('winston');
const applicationservice = require('../controller/applicationController')
const ExcelJS = require('exceljs');
const { upload1 } = require('./multerfileforapp');

const addApplication = async (req, res) => {
  const courseData = req.body;
  const userId = req.user.id;

  try {
    const applicationId = await applicationservice.addApplication(courseData, userId);
    console.log('Application added with ID:', applicationId);

    res.status(200).json({
      message: 'Application added successfully',
      status: 200,
      data: {
        id: applicationId // Include only the id of the application_id
      }
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
  const userId = req.params.id;
  const files = req.files;

  if (!files) {
    return res.status(400).json({ error: 'Please provide both Aadhar Card and PAN Card images.' });
  }

  if (!files['aadhar'] || !files['pan']) {
    return res.status(400).json({ error: 'Please provide both Aadhar Card and PAN Card images.' });
  }

  const aadharCardImageName = getImageName(files['aadhar'][0].path);
  const aadharCardData = {
    fileType: 'aadhar_card',
    filePath: aadharCardImageName,
  };

  const panCardImageName = getImageName(files['pan'][0].path);
  const panCardData = {
    fileType: 'pan_card',
    filePath: panCardImageName,
  };

  applicationservice.insertApplicationDocuments(userId, aadharCardData, (aadharCardError) => {
    if (aadharCardError) {
      console.error('Database error for Aadhar Card:', aadharCardError);
      return res.status(500).json({ error: 'Aadhar Card upload failed' });
    }

    applicationservice.insertApplicationDocuments(userId, panCardData, (panCardError) => {
      if (panCardError) {
        console.error('Database error for PAN Card:', panCardError);
        return res.status(500).json({ error: 'PAN Card upload failed' });
      }

      res.status(200).json({ message: 'Aadhar Card and PAN Card uploaded successfully' });
    });
  });
};


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

const searchApplicationsHandler = async (req, res) => {
  const userId = req.user.id;
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const { studentName, applicationId } = req.query;

  try {
    const applications = await applicationservice.getUserApplications(userId, studentName, applicationId);

    if (applications.length === 0) {
      // No applications found, return a message
      const noApplicationsMessage = 'No applications found for the given criteria.';
      res.status(200).json({
        message: noApplicationsMessage,
      });
    } else {
      const studentFound = applications.some(application => application.studentName === studentName);
      if (studentFound) {
        // Applications were found
        const successMessage = 'User applications data fetched successfully';
        res.status(200).json({
          message: successMessage,
          data: applications,
        });
      } else {
        // No data found for the provided studentName
        const noDataFoundMessage = 'No data found for this name.';
        res.status(200).json({
          message: noDataFoundMessage,
        });
      }
    }
  } catch (error) {
    console.error('Error in searchApplicationsHandler:', error);
    const errorMessage = 'Error fetching user applications: ' + error.message;
    res.status(500).json({ error: errorMessage });
  }
};

const getUserApplicationsHandler = async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role; // Assuming you have a "role" property in your user object

  if (userRole === 'user') {
    const { searchKey, applicationStatus } = req.query;

    try {
      if (applicationStatus === 'rejected' || applicationStatus === 'approved' || applicationStatus === 'fake') {
        const filteredApplications = await applicationservice.getUserApplicationByPhoneNumber11(userId, applicationStatus);

        if (filteredApplications.length > 0) {
          res.status(200).json({
            message: `${applicationStatus} user applications fetched successfully`,
            data: filteredApplications,
          });
        } else {
          res.status(404).json({
            message: `No ${applicationStatus} user applications found for the provided user ID.`,
          });
        }
      } else if (searchKey) {
        // Handle the case where you are searching by name or phone number
        const isNumeric = !isNaN(searchKey);

        if (isNumeric) {
          const userApplication = await applicationservice.getUserApplicationByPhoneNumber(userId, searchKey);

          if (userApplication) {
            res.status(200).json({
              message: 'User application data fetched successfully',
              data: userApplication,
            });
          } else {
            res.status(404).json({
              message: 'No user application found for the provided phone number.',
            });
          }
        } else {
          const userApplications = await applicationservice.getUserApplicationsByName(userId, searchKey);

          if (userApplications.length > 0) {
            res.status(200).json({
              message: 'User applications data fetched successfully',
              data: userApplications,
            });
          } else {
            res.status(404).json({
              message: 'No user applications found for the provided name.',
            });
          }
        }
      } else {
        const userApplications = await applicationservice.getallapplication(userId, userRole);

        if (userApplications.length > 0) {
          res.status(200).json({
            message: 'All user applications data fetched successfully',
            data: userApplications,
          });
        } else {
          res.status(404).json({
            message: 'No user applications found for the provided user ID.',
          });
        }
      }
    } catch (error) {
      console.error('Error in getUserApplicationsHandler:', error);
      const errorMessage = 'Error fetching user applications: ' + error.message;
      res.status(500).json({ error: errorMessage });
    }
  } else if (userRole === 'admin') {
    try {
      const allApplications = await applicationservice.getallapplication(userId, userRole);

      if (allApplications.length > 0) {
        res.status(200).json({
          message: 'All user applications data fetched successfully',
          data: allApplications,
        });
      } else {
        res.status(404).json({
          message: 'No user applications found for the provided user ID.',
        });
      }
    } catch (error) {
      console.error('Error in getUserApplicationsHandler:', error);
      const errorMessage = 'Error fetching user applications: ' + error.message;
      res.status(500).json({ error: errorMessage });
    }
  }
}



// Export the new function
module.exports = {
  getDocumentByFileId,
  uploadDocuments,
  addApplication,
  getUserApplicationsHandler,
  searchApplicationsHandler,

};
