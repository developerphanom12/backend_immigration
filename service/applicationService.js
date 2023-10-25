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

  if (!userId || !files) {
    return res.status(400).json({ error: 'Missing user ID or files.' });
  }

  const requiredFields = ['aadhar', 'pan', 'pass_front', 'pass_back', '10th','12th'];
  if (!requiredFields.every(field => files[field])) {
    return res.status(400).json({ error: 'Please provide all required files (aadhar, pan, pass_front, and pass_back).' });
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

  const passCardImageName = getImageName(files['pass_front'][0].path);
  const passCardData11 = {
    fileType: 'pass_front',
    filePath: passCardImageName,
  };

  const passcard = getImageName(files['pass_back'][0].path);
  const passback = {
    fileType: 'pass_back',
    filePath: passcard,
  };
  const data10th = getImageName(files['pass_back'][0].path);
  const dataof10 = {
    fileType: '10th',
    filePath: data10th,
  };
  const data12th = getImageName(files['pass_back'][0].path);
  const dataof12 = {
    fileType: '12th',
    filePath: data12th,
  };
  
  try {
    await applicationservice.insertApplicationDocuments(userId, aadharCardData);
    await applicationservice.insertApplicationDocuments(userId, panCardData);
    await applicationservice.insertApplicationDocuments(userId, passCardData11);
    await applicationservice.insertApplicationDocuments(userId, passback);
    await applicationservice.insertApplicationDocuments(userId, dataof10);
    await applicationservice.insertApplicationDocuments(userId, dataof12);


    res.status(200).json({ message: 'Documents uploaded successfully' });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Document upload failed' });
  }
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
        const userApplications = await applicationservice.getAllUserApplications(userId, userRole);

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

// const getApplicationCountsController = async (req, res) => {
//   const userId = req.user.id; 

//   try {
//     const counts = await applicationservice.getApplicationCountsByUserId(userId);

//     const totalApplications = Object.values(counts).reduce((acc, count) => acc + count, 0);

//     res.status(200).json({
//       status: 201,
//       message: 'Application counts retrieved successfully',
//       data: {
//         ...counts,
//         totalApplications,
//       },
//     });
//   } catch (error) {
//     console.error('Error in getApplicationCountsController:', error);
//     const errorMessage = 'Error fetching application counts: ' + error.message;
//     res.status(500).json({ error: errorMessage });
//   }
// };


const getApplicationCountsController = async (req, res) => {
  const userId = req.user.id; 
  const userRole = req.user.role; 
  try {
    let counts;
    
    if (userRole === 'admin') {
      
      counts = await applicationservice.getApplicationCountsByUserId1();
    } else {
     
      counts = await applicationservice.getApplicationCountsByUserId(userId);
    }

    const totalApplications = Object.values(counts).reduce((acc, count) => acc + count, 0);

    res.status(200).json({
      status: 201,
      message: 'Application counts retrieved successfully',
      data: {
        ...counts,
        totalApplications,
      },
    });
  } catch (error) {
    console.error('Error in getApplicationCountsController:', error);
    const errorMessage = 'Error fetching application counts: ' + error.message;
    res.status(500).json({ error: errorMessage });
  }
};


const notifystatus = async (req, res) => {
  const userId = req.user.id;

  
  try {
    const userApplications = await applicationservice.notification(userId);

    if (userApplications) {
      const filteredApplications = userApplications.filter(application => application.comment !== null);

      res.status(201).json({
        message: 'User application information and comments  retrieved successfully',
        status:201,
        data: filteredApplications,
      });
    } else {
      res.status(404).json({
        message: 'No user applications found for the provided user ID.',
      });
    }
  } catch (error) {
    console.error('Error in getUserApplicationsWithComments:', error);
    const errorMessage = 'Error fetching user application information: ' + error.message;
    res.status(500).json({ error: errorMessage });
  }
};


// Export the new function
module.exports = {
  getDocumentByFileId,
  uploadDocuments,
  addApplication,
  getUserApplicationsHandler,
  searchApplicationsHandler,getApplicationCountsController,notifystatus

};
