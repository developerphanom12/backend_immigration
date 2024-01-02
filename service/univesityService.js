const userservice = require("../controller/universityController");
const univeristy = require("../constants/universitymssg");
const universityStatusMessages = require("../constants/universitymssg");
const bcrypt = require("bcrypt");
const { add, error } = require("winston");

const handleServerError = (res, error) => {
  console.error("Internal server error:", error);
  res.status(500).json({ error: "Internal server error" });
};


const updateUniversity1 = async (req, res) => {
  const universityId = req.user.id;
  const userRole = req.user.role;

  try {
    if (userRole === "university") {
      const { university_name, ambassador_name, phone_number, email, address } =
        req.body;
      const updatedUniversity = await userservice
        .updateUniversity(universityId, {
          university_name,
          ambassador_name,
          phone_number,
          email,
          address: address || {},
        })
        .catch((error) => {
          return res.status(400).json({ error: error.message });
        });

      if (!updatedUniversity) {
        const notFoundMessage =
          universityStatusMessages.common.universityNotFound;
        return res
          .status(notFoundMessage.status)
          .json({ error: notFoundMessage.message });
      }

      const successMessage =
        universityStatusMessages.universityApi.universityUpdateSuccess;
      res.status(successMessage.status).json({
        message: successMessage.message,
        status: 200,
      });
    }

    if (userRole === "user") {
      const { username, firstname, lastname, email, phone_number, address } =
        req.body;

      try {
        const updatedData = await userservice
          .updateUserData(universityId, {
            username,
            firstname,
            lastname,
            email,
            phone_number,
            address: address || {},
            // Add other fields as needed
          })
          .catch((error) => {
            return res.status(400).json({ error: error.message });
          });

        if (!updatedData) {
          const notFoundMessage = universityStatusMessages.common.USERNOTFOND;
          return res
            .status(notFoundMessage.status)
            .json({ error: notFoundMessage.message });
        }

        const successMessage =
          universityStatusMessages.universityApi.uSERUpdateSuccess;
        res.status(successMessage.status).json({
          message: successMessage.message,
          status: 200,
        });
      } catch (error) {
        console.error(error);
        return res
          .status(500)
          .json({ status: 401, error: "Internal server error" });
      }
    }

    if (userRole === "student") {
      const { username, first_name, last_name, email, phone_number, address } =
        req.body;

      try {
        const updatedData = await userservice
          .updateStudentdata(universityId, {
            username,
            first_name,
            last_name,
            email,
            phone_number,
            address: address || {},
            // Add other fields as needed
          })
          .catch((error) => {
            return res.status(400).json({ error: error.message });
          });

        if (!updatedData) {
          const notFoundMessage =
            universityStatusMessages.common.STUDENTNOTFOND;
          return res
            .status(notFoundMessage.status)
            .json({ error: notFoundMessage.message });
        }

        const successMessage =
          universityStatusMessages.universityApi.STUDENTUpdateSuccess;
        res.status(successMessage.status).json({
          message: successMessage.message,
          status: 200,
        });
      } catch (error) {
        console.error(error);
        return res
          .status(500)
          .json({ status: 401, error: "Internal server error" });
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


const getAllCoursesHandler = async (req, res) => {
  const { page = 1, pageSize = 10 } = req.query;
  const offset = (page - 1) * pageSize;
  try {
    const courses = await userservice.getAllCoursesWithUserDataAndUniversity(
      offset,
      pageSize
    );

    const successMessage = "Course fethc successfully";
    res.status(201).json({
      message: successMessage,
      data: courses,
    });
  } catch (error) {
    console.error(
      "Error fetching courses with user and university data:",
      error
    );
    const errorMessage = "Error fetching courses";
    res.status(500).json({ error: errorMessage });
  }
};

// add role in this page
const getalluniversity = async (req, res) => {
  const { page = 1, pageSize = 10 } = req.query;
  const offset = (page - 1) * pageSize;
  try {
    const allUsers = await userservice.getalluniversity(offset, pageSize);
    totalCount = await userservice.GetTotalUnveristy();
    const totalPages = Math.ceil(totalCount / pageSize);

    const successMessage =
      universityStatusMessages.universityApi.universityFetchSuccess;
    res.status(successMessage.status).json({
      message: successMessage.message,
      status: 200,
      data: {
        allUsers,
        pagination: {
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          totalItems: totalCount,
          totalPages,
        },
      },
    });
  } catch (error) {
    console.error("Error retrieving all universities:", error);
    res.status(500).json({
      message: "Error retrieving all universities",
    });
  }
};

// add role in this page
const getallcourses1 = async (req, res) => {
  try {
    const allUsers = await userservice.getallcourses();

    const successMessage = universityStatusMessages.universityApi.coursefetch;
    res.status(successMessage.status).json({
      message: successMessage.message,
      status: 200,
      data: allUsers,
    });
  } catch (error) {
    console.error("Error retrieving all universities:", error);
    res.status(500).json({
      message: "Error retrieving all universities",
    });
  }
};

// add role in this page
const getallstraff = async (req, res) => {
  try {
    const allUsers = await userservice.getallstaff();

    const successMessage = universityStatusMessages.universityApi.staff;
    res.status(successMessage.status).json({
      message: successMessage.message,
      status: 200,
      data: allUsers,
    });
  } catch (error) {
    console.error("Error retrieving all staff:", error);
    res.status(500).json({
      message: "Error retrieving all staff",
    });
  }
};

// //GET USER BY ID
const getById = async (req, res) => {
  try {
    const Id = req.params.id;
    const user = await userservice.getCourseById(Id);

    if (!user) {
      return res.status(404).json({ message: "course not found" });
    }

    res.status(messages.USER_API.COURSE.status).json({
      message: messages.USER_API.COURSE.message,
      data: user,
    });
  } catch (error) {
    console.error("Error retrieving user by ID:", error);
    res.status(messages.USER_API.USER_ERROR.status).json({
      message: messages.USER_API.USER_ERROR.message,
    });
  }
};

const registerUniversityAndUploadImage = async (req, res) => {
  const {
    university_name,
    ambassador_name,
    phone_number,
    email,
    username,
    password,
    address,
    year_established,
    type,
  } = req.body;

  try {
    // Validate university_name
    if (!university_name) {
      throw new Error("University name cannot be null or empty.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Save university registration data
    const userId = await userservice.UniversityRegisterself({
      university_name,
      ambassador_name,
      phone_number,
      email,
      username,
      password: hashedPassword,
      address: null,
      year_established,
      type,
    });

    // Save university address
    const addressId = await userservice.universityaddress(
      address.street_address,
      address.city,
      address.state,
      address.country,
      address.postal_code,
      userId
    );

    // Update user with address information
    await userservice.updateaddressuniversity(userId, addressId);

    let uniImageName, regCertImageName;

    // Check and save university_image
    if (req.files && req.files["university_image"]) {
      uniImageName = req.files["university_image"][0].filename;
      await userservice.aCertificate(userId, uniImageName);
    } else {
      // Handle the case where university_image is not provided
      return res.status(400).json({
        message: "University image is required.",
      });
    }

    // Check and save registration_certificate
    if (req.files && req.files["registration_certificate"]) {
      regCertImageName = req.files["registration_certificate"][0].filename;
      await userservice.addRegistrationCertificate(userId, regCertImageName);
    } else {
      // Handle the case where registration_certificate is not provided
      return res.status(400).json({
        message: "Registration certificate is required.",
      });
    }

    const user = {
      id: userId,
      university_name,
      ambassador_name,
      phone_number,
      email,
      username,
      password,
      address: {
        id: addressId,
        street_address: address.street_address,
        city: address.city,
        state: address.state,
        country: address.country,
        postal_code: address.postal_code,
      },
      university_image: uniImageName,
      registration_certificate: regCertImageName,
      year_established,
      type,
    };

    res.status(200).json({
      message: "University registration and image upload successful",
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message || "Something went wrong",
    });
  }
};

const uniersitylogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    userservice.logiuniversity(username, password, (err, result) => {
      if (err) {
        console.error("Error:", err);
        return res
          .status(500)
          .json({ error: "An internal server error occurred" });
      }

      if (result.error) {
        return res.status(401).json({ error: result.error });
      }

      res.status(201).json({
        message: "university login successfully",
        status: 201,
        data: result.data,
        token: result.token,
      });
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
};

const courseadd = async (req, res) => {
  if (req.user.role !== "university") {
    return res.status(403).json({ error: "Forbidden for regular users" });
  }

  const userId = req.user.id;
  const {
    course_name,
    department,
    subject,
    tuition_fee,
    duration_years,
    course_type,
    university_id,
    tution,
    requirements,
  } = req.body;

  // Assuming 'image' is the key for the image file in the form data
  // const imagePath = req.file.filename;
  // Assuming you're using a middleware like multer for file uploads

  try {
    // Insert course information
    const universityData = await userservice.courseregister({
      course_name,
      department,
      subject,
      tuition_fee,
      duration_years,
      course_type,
      university_id: userId,
      tution: null, // Update this if necessary
      // image: imagePath,
    });

    // Insert tuition fees information
    const addressId = await userservice.insertfees(
      tution.hostel_meals,
      tution.tuition_fees,
      tution.transportation,
      tution.phone_internet,
      tution.total
    );

    // Update the corresponding course entry with the tuition ID
    await userservice.updatetution(universityData.id, addressId);

    for (const requirement of requirements) {
      await userservice.insertRequirement(universityData.id, requirement);
    }

    res.status(201).json({
      message: "course add successfully",
      data: universityData,
    });
  } catch (error) {
    if (error) {
      res.status(401).json({ error: error.message });
    } else {
      handleServerError(res, error);
    }
  }
};

const tutionfess = async (req, res) => {
  const {
    course_id,
    hostel_meals,
    tuition_fees,
    transportation,
    phone_internet,
    total,
  } = req.body;

  try {
    const universityData = await userservice.Tutionfess({
      course_id,
      hostel_meals,
      tuition_fees,
      transportation,
      phone_internet,
      total,
    });

    res.status(201).json({
      message: "tution add successfully",
      status: 201,
      data: universityData,
    });
  } catch (error) {
    if (error) {
      res.status(401).json({ error: error.message });
    } else {
      handleServerError(res, error);
    }
  }
};

const ugRequirement = async (req, res) => {
  if (req.user.role !== "university") {
    return res.status(403).json({ error: "Forbidden for regular users" });
  }
  const userId = req.user.id;
  console.log("jdhfgfdjgdhfd", userId);
  const {
    english_requirement,
    academic_requirement,
    offer_timeline,
    Credibility,
    Finance,
    Discount,
    university_id,
  } = req.body;

  try {
    const universityData = await userservice.ugrequirement({
      english_requirement,
      academic_requirement,
      offer_timeline,
      Credibility,
      Finance,
      Discount,
      university_id: userId,
    });

    res.status(201).json({
      message: "UG Requirement add successfully",
      data: universityData,
    });
  } catch (error) {
    if (error) {
      res.status(401).json({ error: error.message });
    } else {
      handleServerError(res, error);
    }
  }
};

const pgRequirement = async (req, res) => {
  if (req.user.role !== "university") {
    return res.status(403).json({ error: "Forbidden for regular users" });
  }
  const userId = req.user.id;
  console.log("jdhfgfdjgdhfd", userId);
  const {
    english_requirement,
    academic_requirement,
    offer_timeline,
    Credibility,
    Finance,
    Discount,
    university_id,
  } = req.body;

  try {
    const universityData = await userservice.pgrequirement({
      english_requirement,
      academic_requirement,
      offer_timeline,
      Credibility,
      Finance,
      Discount,
      university_id: userId,
    });

    res.status(201).json({
      message: "UG Requirement add successfully",
      data: universityData,
    });
  } catch (error) {
    if (error) {
      res.status(401).json({ error: error.message });
    } else {
      handleServerError(res, error);
    }
  }
};

const getallacoursebyid = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { page = 1, pageSize = 10 } = req.query;
    const offset = (page - 1) * pageSize;
    console.log("sdfsdfsdf", userId);

    let courses;

    if (userRole === "university") {
      courses = await userservice.getallcoursesbyid(userId, offset, pageSize);
      totalCount = await userservice.getTotalUniversityCoursesCount(userId);
      const totalPages = Math.ceil(totalCount / pageSize);
      if (courses.length > 0) {
        res.status(201).json({
          message: "Courses fetched successfully",
          status: 201,
          data: {
            courses,
            pagination: {
              page: parseInt(page),
              pageSize: parseInt(pageSize),
              totalItems: totalCount,
              totalPages,
            },
          },
        });
      } else {
        const responseMessage =
          "No university courses found for the provided ID.";
        res.status(404).json({
          message: responseMessage,
          status: 404,
        });
      }
    } else {
      courses = await userservice.getallcoursesbyftehc(offset, pageSize);
      totalCount = await userservice.getTotalCoursesCount(courses);
      const totalPages = Math.ceil(totalCount / pageSize);
      if (courses.length > 0) {
        res.status(201).json({
          message: "Courses fetched successfully",
          status: 201,
          data: {
            courses,
            pagination: {
              page: parseInt(page),
              pageSize: parseInt(pageSize),
              totalItems: totalCount,
              totalPages,
            },
          },
        });
      } else {
        const responseMessage =
          "No university courses found for the provided ID.";
        res.status(404).json({
          message: responseMessage,
          status: 404,
        });
      }
    }
  } catch (error) {
    console.error("Error in getallacoursebyid:", error);
    res.status(500).json({
      message: "Internal server error",
      status: 500,
    });
  }
};

const getallugrequirement = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    console.log("sdfsdfsdf", userId);

    let userApplications;

    if (userRole === "university") {
      userApplications = await userservice.getallugbyid(userId);
    } else {
      userApplications = await userservice.getallugrequirement();
    }

    if (userApplications.length > 0) {
      res.status(201).json({
        message: "Courses fetched successfully",
        status: 201,
        data: userApplications,
      });
    } else {
      const responseMessage =
        "No university courses found for the provided ID.";
      res.status(404).json({
        message: responseMessage,
        status: 404,
      });
    }
  } catch (error) {
    console.error("Error in getallacoursebyid:", error);
    res.status(500).json({
      message: "Internal server error",
      status: 500,
    });
  }
};

const getallpgrequirement = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    console.log("sdfsdfsdf", userId);

    let userApplications;

    if (userRole === "university") {
      userApplications = await userservice.getallpgbyid(userId);
    } else {
      userApplications = await userservice.getallpgrequirement();
    }

    if (userApplications.length > 0) {
      res.status(201).json({
        message: "Courses fetched successfully",
        status: 201,
        data: userApplications,
      });
    } else {
      const responseMessage =
        "No university courses found for the provided ID.";
      res.status(404).json({
        message: responseMessage,
        status: 404,
      });
    }
  } catch (error) {
    console.error("Error in getallacoursebyid:", error);
    res.status(500).json({
      message: "Internal server error",
      status: 500,
    });
  }
};

async function forgetpasswordEMAIL(req, res) {
  const { email } = req.body;

  try {
    const otp = userservice.sendotpuniversity(email);
    if (otp) {
      res.status(200).json({
        message: "OTP sent successfully",
        data: {
          email: email,
        },
      });
    } else {
      res.status(500).json({ error: "Failed to send OTP" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to send OTP" });
  }
}

const VERIFYOTP = (req, res) => {
  const { otp } = req.body;

  userservice.verifyOTP(otp, (error, result) => {
    if (error) {
      return res.status(500).json({ error: "Error verifying OTP" });
    }

    if (result === "invalid") {
      return res.status(401).json({ status: 404, error: "Invalid OTP" });
    }

    if (result === "used") {
      return res
        .status(401)
        .json({ status: 400, error: "OTP has already been used" });
    }

    res.status(200).json({ status: 201, message: "OTP verified successfully" });
  });
};

const SETNEWpassWORD = (req, res) => {
  const { email, newPassword } = req.body;

  userservice.setNewPassword(email, newPassword, (error) => {
    if (error) {
      return res.status(500).json({ error: "Error setting a new password" });
    }

    res
      .status(200)
      .json({ status: 200, message: "New password set successfully" });
  });
};

const getallbyidcourses = async (req, res) => {
  try {
    const userId = req.params.id;
    console.log("sdfsdfsdf", userId);

    let userApplications;

    // Assuming userservice.getallcoursesbyids returns a promise
    userApplications = await userservice.getallcoursesbyids(userId);

    if (userApplications.length > 0) {
      res.status(201).json({
        message: "Courses fetched successfully",
        status: 201,
        data: userApplications,
      });
    } else {
      const responseMessage =
        "No university courses found for the provided ID.";
      res.status(404).json({
        message: responseMessage,
        status: 404,
      });
    }
  } catch (error) {
    console.error("Error in getallacoursebyid:", error);
    res.status(500).json({
      message: "Internal server error",
      status: 500,
    });
  }
};

const updateCoursesAndTuitionController = async (req, res) => {
  const courseId = req.params.id;
  const userRole = req.user.role;

  try {
    if (userRole === "university") {
      const {
        course_name,
        department,
        subject,
        tuition_fee,
        duration_years,
        course_type,
        tution,
      } = req.body;
      const updatedUniversity = await userservice
        .updatecoursesandNew(courseId, {
          course_name,
          department,
          subject,
          tuition_fee,
          duration_years,
          course_type,
          tution: tution || {},
        })
        .catch((error) => {
          return res.status(400).json({ status: 400, error: error.message });
        });

      if (!updatedUniversity) {
        const notFoundMessage = universityStatusMessages.common.courseNotFound;
        return res
          .status(notFoundMessage.status)
          .json({ error: notFoundMessage.message });
      }

      const successMessage =
        universityStatusMessages.universityApi.courseUpdateSuccess;
      res.status(successMessage.status).json({
        message: successMessage.message,
        status: 200,
      });
    } else {
      res.status(404).json({
        message: "forbiiden for regular user",
        status: 404,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const UniversityFAQ = async (req, res) => {
  if (req.user.role !== "university") {
    return res.status(403).json({ error: "Forbidden for regular users" });
  }
  const userId = req.user.id;
  const role = req.user.role;
  console.log("jdhfgfdjgdhfd", userId, role);
  const { university_id, question, answer } = req.body;

  try {
    // Insert course information
    const universityData = await userservice.universityFaq({
      university_id: userId,
      question,
      answer,
    });
    res.status(201).json({
      message: "Faq add successfully",
      status: 201,
      data: universityData,
    });
  } catch (error) {
    if (error) {
      res.status(401).json({ error: error.message });
    } else {
      handleServerError(res, error);
    }
  }
};

const latestupdateUniversity = async (req, res) => {
  if (req.user.role !== "university") {
    return res.status(403).json({ error: "Forbidden for regular users" });
  }
  const userId = req.user.id;
  console.log("jdhfgfdjgdhfd", userId);
  const { university_id, heading, descpription } = req.body;

  try {
    // Insert course information
    const universityData = await userservice.univeristyUpdatelatest({
      university_id: userId,
      heading,
      descpription,
    });

    res.status(201).json({
      message: "newupdate add successfully",
      status: 201,
      data: universityData,
    });
  } catch (error) {
    if (error) {
      res.status(401).json({ error: error.message });
    } else {
      handleServerError(res, error);
    }
  }
};

const getuniveristybyids = async (req, res) => {
  try {
    const userId = req.params.id;
    console.log("sdfsdfsdf", userId);

    const userApplications = await userservice.getallUniversityids(userId);

    if (userApplications) {
      res.status(201).json({
        message: "university fetched successfully",
        status: 201,
        data: userApplications,
      });
    } else {
      const responseMessage = "No university found for the provided ID.";
      res.status(404).json({
        message: responseMessage,
        status: 404,
      });
    }
  } catch (error) {
    console.error("Error in getallacoursebyid:", error);
    res.status(500).json({
      message: "Internal server error",
      status: 500,
    });
  }
};

const getbyownuniversitydata = async (req, res) => {
  try {
    if (req.user.role !== "university") {
      return res.status(403).json({ error: "Forbidden for regular users" });
    }
    const userId = req.user.id;
    const role = req.user.role;
    console.log("sdfsdfsdf", userId, role);

    const userApplications = await userservice.getownbyid(userId);

    if (userApplications) {
      res.status(201).json({
        message: "university fetched successfully",
        status: 201,
        data: userApplications,
      });
    } else {
      const responseMessage = "No university found for the provided ID.";
      res.status(404).json({
        message: responseMessage,
        status: 404,
      });
    }
  } catch (error) {
    console.error("Error in getallacoursebyid:", error);
    res.status(500).json({
      message: "Internal server error",
      status: 500,
    });
  }
};

module.exports = {
  updateUniversity1,
  getAllCoursesHandler,
  getalluniversity,
  getById,
  getallcourses1,
  registerUniversityAndUploadImage,
  uniersitylogin,
  courseadd,
  ugRequirement,
  pgRequirement,
  getallacoursebyid,
  getallugrequirement,
  getallpgrequirement,
  forgetpasswordEMAIL,
  VERIFYOTP,
  SETNEWpassWORD,
  tutionfess,
  getallbyidcourses,
  updateCoursesAndTuitionController,
  UniversityFAQ,
  latestupdateUniversity,
  getuniveristybyids,
  getbyownuniversitydata,
  getallstraff,
};
