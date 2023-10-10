module.exports = {
    common: {
      invalidId: {
        message: "Invalid ID",
        status: 400
      },
      universityNotFound: {
        message: "University not found",
        status: 404
      },
      unauthorized: {
        message: "Unauthorized",
        status: 401
      },
      internalServerError: {
        message: "Internal Server Error",
        status: 500
      }
    },
  
    universityApi: {
      universityCreateSuccess: {
        message: "University created successfully",
        status: 201
      },
      universityNotCreated: {
        message: "University creation failed",
        status: 400
      },
      universityUpdateSuccess: {
        message: "University updated successfully",
        status: 200
      },
      universityFetchSuccess: {
        message: "University fetched successfully",
        status: 200
      },
      universityAlreadyRegistered: {
        message: "University already registered",
        status: 400
      },
      universityPhotoUploadSuccess: {
        message: "University profile photo uploaded successfully",
        status: 201
      },
      universityErrorPhoto: {
        message: "Error while uploading university photo",
        status: 500
      }
    }
  };
  