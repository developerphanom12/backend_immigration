const { error } = require('winston');
const db = require('../config/configration');
const { logger } = require('../utils/logging')

function UniversityRegister(university) {
    return new Promise((resolve, reject) => {
        const { university_name, course_type, founded_year,person_name,contact_number } = university;
        const query = `
        INSERT INTO university 
        (university_name, course_type, founded_year,person_name,contact_number)
        VALUES (?, ?, ?,?,?)
      `;

        db.query(query, [university_name, course_type, founded_year,person_name,contact_number], (error, result) => {
            if (error) {
                reject(error);
                logger.error('Error registering university:', error);
            } else {
                const insertedUniversity = {
                    id: result.insertId,
                    university_name,
                    course_type,
                    founded_year,
                    person_name,
                    is_active: true,
                    create_date: new Date(),
                    update_date: new Date()
                };
                resolve(insertedUniversity);
                logger.info('University registered successfully', insertedUniversity);
            }
        });
    });
}

function getCourseById(id) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT c.course_id, c.university_id, c.course_name, c.course_level, c.is_active, c.create_date, c.update_date, c.is_deleted,
            u.id AS user_id, u.username, u.email,
            au.id AS university_id,
            au.university_name,
            au.founded_year,
            au.course_type,
            au.is_active,
            au.create_date,
            au.update_date,
            au.is_deleted   
            FROM cour1 c
            INNER JOIN users3 u ON c.user_id = u.id
            LEFT JOIN all_university au ON c.university_id = au.id
        `;

        db.query(query, [id], (error, result) => {
            if (error) {
                reject(error);
                logger.error('Error getting course by ID:', error);
            } else {
                if (result.length > 0) {
                    const courseData = result[0];
                    const response = {
                        data: {
                            course_id: courseData.course_id,
                            university_id :{
                            university_id: courseData.university_id,
                            university_name : courseData.university_name,
                            founded_year :  courseData.founded_year,
                            course_type: courseData.course_type,
                            is_active: courseData.is_active,
                            create_date: courseData.create_date,
                            update_date: courseData.update_date,
                            is_deleted: courseData.is_deleted
                           },
                                
                            user_id: {
                                id: courseData.user_id,
                                username: courseData.username,
                                email: courseData.email,
                                 is_active: courseData.is_active,
                               
                            },
                            course_name: courseData.course_name,
                            course_level: courseData.course_level,
                            is_active: courseData.is_active,
                            create_date: courseData.create_date,
                            update_date: courseData.update_date,
                            is_deleted: courseData.is_deleted
                        }
                    };
                    resolve(response);
                } else {
                    reject('No course found with this ID');
                }
            }
        });
    });
}


function getalluniversity() {
    return new Promise((resolve, reject) => {
        const query = `SELECT  * FROM university WHERE is_deleted = 0`

        db.query(query, (error, results) => {
            if (error) {
                console.error('Error executing query:', error);
                reject(error);
                logger.error('Error getting all users:', error); // Log the error
            } else {
                const usersWithAddresses = results.map((row) => ({
                    id: row.id,
                    university_name: row.university_name,
                    course_type: row.course_type,
                    person_name:row.person_name,
                    contact_number: row.contact_number,
                    founded_year: row.founded_year,
                    is_active: row.is_active,
                    create_date: row.create_date,
                    update_date: row.update_date,
                    is_deleted: row.is_deleted,

                }));
                resolve(usersWithAddresses);
                logger.info('All users retrieved successfully');
            }
        });
    });
}
function updateUniversity(id, updatedUniversityData) {
    return new Promise((resolve, reject) => {
        const { university_name, course_type, founded_year,person_name,contact_number } = updatedUniversityData;

        // Construct the SQL query
        const query = `
        UPDATE university
        SET 
          university_name = COALESCE(?, university_name),
          course_type = COALESCE(?, course_type),
          founded_year = COALESCE(?, founded_year),
          person_name = COALESCE(?, person_name),\
          contact_number = COALESCE(?,contact_number)
        WHERE university_id = ?;
      `;


        db.query(query, [university_name, course_type, founded_year, contact_number,person_name,id], (error, result) => {
            if (error) {
                reject(error);
                logger.error('Error updating university:', error);
            } else {
                if (result.affectedRows > 0) {

                    const fetchQuery = `
              SELECT * FROM university WHERE university_id = ?;
            `;

                    db.query(fetchQuery, [id], (fetchError, fetchResult) => {
                        if (fetchError) {
                            reject(fetchError);
                            logger.error('Error fetching updated university:', fetchError);
                        } else {
                            if (fetchResult.length > 0) {
                                const updatedUniversity = fetchResult[0];
                                resolve(updatedUniversity);
                                logger.info('University updated successfully', updatedUniversity);
                            } else {
                                resolve(null); 
                            }
                        }
                    });
                } else {
                    resolve(null); 
                }
            }
        });
    });
}


function createCourse(courseData, userId) {
    return new Promise((resolve, reject) => {
        // Prepare the INSERT query
        const query = `
        INSERT INTO courses
(user_id, university_id, course_name, course_level, is_active, create_date, update_date, is_deleted) 
VALUES (?, ?, ?, ?,  true, NOW(), NOW(), 0)
`;

        // Prepare the values to be inserted  //
        const values = [
            userId,
            courseData.university_id,
            courseData.course_name,
            courseData.course_level,
            courseData.is_active,
            courseData.create_date,
            courseData.update_date,
            courseData.is_deleted
        ];

        // Execute the INSERT query
        db.query(query, values, (error, results) => {
            if (error) {
                console.error('Error creating course:', error);
                reject(error);
            } else {
                const courseId = results.insertId;
                resolve(courseId);
            }
        });
    });
}

function getUniversityById(universityId) {
    return new Promise((resolve, reject) => {

        const query = `
            SELECT * FROM university
            WHERE university_id = ?;
        `;


        db.query(query, [universityId], (error, results) => {
            if (error) {
                console.error('Error getting university by ID:', error);
                reject(error);
            } else {
                if (results.length > 0) {
                    const university = results[0];
                    resolve(university);
                } else {
                    resolve(null);
                }
            }
        });
    });
}




function getAllCoursesWithUserDataAndUniversity() {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT
                
                c.course_name,
                c.course_level,
                c.is_active,
                c.is_deleted,
                c.create_date,
                c.update_date,
                u.id AS user_id,
                u.username,
                u.firstname,
                u.password,
                u.lastname,
                u.email,
                u.is_active,
                u.phone_number,
                au.university_id AS university_id,
                au.university_name,
                au.founded_year,
                au.course_type
                
            FROM courses c
            INNER JOIN user01 u ON c.user_id = u.id
            LEFT JOIN university au ON c.university_id = au.university_id
        `;

        db.query(query, (error, results) => {
            if (error) {
                console.error('Error executing query:', error);
                reject(error);
                logger.error('Error getting all courses with user and university data:', error);
            } else {
                // Create an array of objects containing course_name, user data, and university data
                const coursesWithUserDataAndUniversity = results.map((row) => ({

                    course_name: row.course_name,
                    course_level: row.course_level,
                    is_active: row.is_active,
                    is_deleted: row.is_deleted,
                    create_date: row.create_date,
                    update_date: row.update_date,

                    user_id: {
                        user_id: row.user_id,
                        username: row.username,
                        firstname: row.firstname,
                        lastname: row.lastname,
                        password: row.password,
                        email: row.email,
                        phone_number: row.phone_number,
                        is_active: row.is_active,
                        is_deleted: row.is_deleted,
                        create_date: row.create_date,
                        update_date: row.update_date,
                    },
                    university_id: {
                        university_id: row.university_id,
                        university_name: row.university_name,
                        founded_year: row.founded_year,
                        course_type: row.course_type,
                        is_active: row.is_active,
                        is_deleted: row.is_deleted,
                        create_date: row.create_date,
                        update_date: row.update_date,
                    },
                    is_active: row.is_active,
                    is_deleted: row.is_deleted,
                    create_date: row.create_date,
                    update_date: row.update_date,
                }));
                resolve(coursesWithUserDataAndUniversity);
                logger.info('All courses with user and university data retrieved successfully');
            }
        });
    });
}



// function for upload image 
function addimageuniversity(userId, imagePath, callback) {
    const sql = 'UPDATE university SET  university_image = ? WHERE university_id = ?';
    db.query(sql, [imagePath, userId], (err, result) => {
      if (err) {
        return callback(err);
      }
  
      return callback(null, result);
  
    })
  }
  

// function insertUserDocuments(userId, fileData, callback) {
//     const sql = 'INSERT INTO user_documents_files (user_id, file_type, file_path) VALUES (?, ?, ?)';
//     const values = [userId, fileData.fileType, fileData.filePath];

//     db.query(sql, values, callback);
// }

module.exports = {
    UniversityRegister,
    getUniversityById,
    updateUniversity,
    createCourse,
    getUniversityById,
    getAllCoursesWithUserDataAndUniversity,
    getalluniversity,
    getCourseById,
    addimageuniversity
}