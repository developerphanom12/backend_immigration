const userservice = require('../controller/universityController');
const univeristy = require('../constants/universitymssg')
const universityStatusMessages = require('../constants/universitymssg')



const handleServerError = (res, error) => {
    console.error('Internal server error:', error);
    res.status(500).json({ error: 'Internal server error' });
};

const registerUniversity = async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden for regular users' });
    }
    console.log('User Role:', req.user.role);

    const { university_name, course_type, founded_year ,contact_number,person_name} = req.body;

    try {  
        const universityData = await userservice.UniversityRegister({
            university_name,
            course_type,
            founded_year,
            person_name,
            contact_number
        });


        res.status(univeristy.universityApi.universityCreateSuccess.status).json({
            message: messages.universityApi.universityCreateSuccess.message,
            data: universityData
        });
    } catch (error) {
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({ error: error.message });
        } else {

            handleServerError(res, error);
        }
    }
};

const getUniversityByIdHandler = async (req, res) => {
    const universityId = req.params.id;

    try {
        if (!validateUniversityId(universityId)) {
            const invalidIdMessage = universityStatusMessages.common.invalidId;
            return res.status(invalidIdMessage.status).json({ error: invalidIdMessage.message });
        }

        const university = await userservice.getUniversityById(universityId);
        
        if (!university) {
            const notFoundMessage = universityStatusMessages.common.universityNotFound;
            return res.status(notFoundMessage.status).json({ error: notFoundMessage.message });
        }


        const successMessage = universityStatusMessages.universityApi.universityFetchSuccess;
        res.status(successMessage.status).json({
            message: successMessage.message,
            data: university,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }

}
const updateUniversity1 = async (req, res) => {
    const universityId = req.params.id;
    const { university_name, course_type, founded_year } = req.body;

    try {
        if (!validateUniversityId(universityId)) {
            const invalidIdMessage = universityStatusMessages.common.invalidId;
            return res.status(invalidIdMessage.status).json({ error: invalidIdMessage.message });
        }

        const updatedUniversity = await userservice.updateUniversity(universityId, {
            university_name,
            course_type,
            founded_year,
        }).catch((error) => {
            // Handle the promise rejection here
            return res.status(400).json({ error: error.message });
        });

        if (!updatedUniversity) {
            const notFoundMessage = universityStatusMessages.common.universityNotFound;
            return res.status(notFoundMessage.status).json({ error: notFoundMessage.message });
        }
        // const uni = await userservice.getUniversityById(updatedUniversity)
        const successMessage = universityStatusMessages.universityApi.universityUpdateSuccess;
        res.status(successMessage.status).json({
            message: successMessage.message,
            data: updatedUniversity,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

function validateUniversityId(id) {

    return id.match(/^[0-9]+$/);
}


const courseCreate = async (req, res) => {
    try {
        const courseData = req.body;
        const userId = req.user.id;

       
        const university = await userservice.getUniversityById(courseData.university_id);

        if (!university) {
            // Handle the case where the university is not found
            const errorMessage = 'University not found';
            return res.status(404).json({ error: errorMessage });
        }

        const courseId = await userservice.createCourse(courseData, userId);


       
        const currentDate = new Date().toISOString();

     
        const responseData = {
            course_id: courseId,
            user_id: userId,
            university_id: courseData.university_id,
            course_name: courseData.course_name,
            course_level: courseData.course_level,
            is_active: courseData.is_active || 1,  
            is_deleted :courseData.is_deleted || 0,
            create_date: currentDate,
            update_date: currentDate,
        };

       
        console.log('Course created with ID:', courseId);

       
        const successMessage = 'Course created successfully';
        // Send the response
        res.status(201).json({
            message: successMessage,
            data: responseData,
        });
    } catch (error) {
        // Handle errors and send an error response
        console.error('Error creating course:', error);

        // Define the error message
        const errorMessage = 'Error creating course';

        res.status(500).json({
            error: errorMessage,
        });
    }
};

const getAllCoursesHandler = async (req, res) => {
    try {
       
        const courses = await userservice.getAllCoursesWithUserDataAndUniversity();

        const successMessage = 'Course fethc successfully';
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


// add role in this page  
const getalluniversity = async (req, res) => {
    
    try {
        const allUsers = await userservice.getalluniversity();

        const successMessage = universityStatusMessages.universityApi.universityFetchSuccess;
        res.status(successMessage.status).json({
            message: successMessage.message,
            data: allUsers,
        });
    } catch (error) {
        console.error('Error retrieving all universities:', error);
        res.status(500).json({
            message: 'Error retrieving all universities',
        });
    }
};

// //GET USER BY ID
const getById = async (req, res) => {
    try {
      const Id = req.params.id;
      const user = await userservice.getCourseById(Id);
  
      if (!user) {
        return res.status(404).json({ message: 'course not found' });
      }
  
      res.status(messages.USER_API.COURSE.status).json({
        message: messages.USER_API.COURSE.message,
        data: user
      });
    } catch (error) {
      console.error('Error retrieving user by ID:', error);
      res.status(messages.USER_API.USER_ERROR.status).json({
        message: messages.USER_API.USER_ERROR.message,
      });
    }
  };
 


const uploadImage1 = async (req, res) => {
    const id = req.params.id;
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }
    const imagePath = req.file.path;
    const imageName = imagePath.replace(/\\/g, '/').split('/').pop(); // Normalize path and get the image name
  
    userservice.addimageuniversity(id, imageName, (err, result) => {
  
      if (err) {
        return res.status(500).json({ error: 'Profile image update failed' });
      }
      res.status(univeristy.universityApi.universityPhotoUploadSuccess.status).json({
        message: univeristy.universityApi.universityPhotoUploadSuccess.message,
        data: id
      });
    });
  
  };

  
module.exports = {
    registerUniversity,
    getUniversityByIdHandler,
    updateUniversity1,
    courseCreate,
    getAllCoursesHandler,
    getalluniversity,
    getById,
    uploadImage1
}