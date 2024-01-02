const { error } = require('winston');
const db = require('../config/configration');
const { logger } = require('../utils/logging')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer');
const randomstring = require('randomstring');
const fs = require('fs');
const emailTemplate = fs.readFileSync('controller/template.html', 'utf8');










function UniversityRegister(university) {
    return new Promise((resolve, reject) => {
        const { university_name, course_type, founded_year, person_name, contact_number } = university;
        const query = `
        INSERT INTO university 
        (university_name, course_type, founded_year,person_name,contact_number)
        VALUES (?, ?, ?,?,?)
      `;

        db.query(query, [university_name, course_type, founded_year, person_name, contact_number], (error, result) => {
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
                            university_id: {
                                university_id: courseData.university_id,
                                university_name: courseData.university_name,
                                founded_year: courseData.founded_year,
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
                            university_id: {
                                university_id: courseData.university_id,
                                university_name: courseData.university_name,
                                founded_year: courseData.founded_year,
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




/*  
async function getbyid(applicationId) {
  const query = `
  SELECT
  a.application_id,
  a.student_firstname,
  a.student_passport_no,
  a.application_status,
  a.student_whatsapp_number,
  a.created_at,
  a.updated_at,
  a.role,
  CASE
    WHEN a.role = 'user' THEN u.id
    WHEN a.role = 'student' THEN s.id
  END AS user_id,
  CASE
    WHEN a.role = 'user' THEN u.username
    WHEN a.role = 'student' THEN s.username
  END AS user_username,
  CASE
    WHEN a.role = 'user' THEN u.phone_number
    WHEN a.role = 'student' THEN s.phone_number
  END AS user_phone_number,
  au.university_id AS university_id,
  au.university_name,
  au.person_name,
  au.contact_number,
  d.file_type,
  d.file_path,
  c.course_id AS course_id,
  c.course_name,
  c.course_level,
  c.update_date,
  cc.id AS comment_id,
  cc.comment_text,
  cc.role,
  cc.select_type,
  cc.created_at AS comment_created_at,
  CASE
    WHEN cc.role = 'staff' THEN staff.staff_name
    WHEN cc.role = 'admin' THEN ad.username
    WHEN cc.role = 'student' THEN sd.username
    WHEN cc.role = 'user' THEN u1.username
  END AS comment_username
FROM applications_table a
LEFT JOIN user01 u ON a.user_id = u.id AND a.role = 'user'
LEFT JOIN students s ON a.user_id = s.id AND a.role = 'student'
LEFT JOIN university au ON a.university_id = au.university_id
LEFT JOIN documnets d ON a.application_id = d.application_id
LEFT JOIN courses c ON a.course_id = c.course_id 
LEFT JOIN comment_table cc ON cc.application_id = a.application_id
LEFT JOIN staff staff ON cc.role = 'staff' AND staff.id = cc.user_id
LEFT JOIN admintable ad ON cc.role = 'admin' AND ad.id = cc.user_id
LEFT JOIN students sd ON cc.role = 'student' AND sd.id = cc.user_id
LEFT JOIN user01 u1 ON cc.role = 'user' AND u1.id = cc.user_id

WHERE a.application_id = ?`;


  const params = [applicationId];

  return new Promise((resolve, reject) => {
    db.query(query, params, (error, results) => {
      if (error) {
        // Handle the error
        reject(error);
      } else {
        const applications = [];

        results.forEach((row) => {
          const application = applications.find(
            (app) => app.application_id === row.application_id
          );

          if (application) {
            if (row.file_type !== null && row.file_path !== null) {
              const document = {
                file_type: row.file_type,
                file_path: row.file_path,
              };
              application.documents.push(document);
            }

            if (row.comment_id !== null && row.comment_text !== null) {
              const comment = {
                comment_id: row.comment_id,
                comment_text: row.comment_text,
                username: row.comment_username, // Use the computed column
                role: row.role,
                select_type: row.select_type,
                created_at: row.comment_created_at,
              };
              application.comments.push(comment);
            }
          } else {
            const newApplication = {
              application_id: row.application_id,
              student_firstname: row.student_firstname,
              student_passport_no: row.student_passport_no,
              application_status: row.application_status,
              student_whatsapp_number: row.student_whatsapp_number,
              created_at: row.created_at,
              updated_at: row.updated_at,
              role:row.role,
              university_id: {
                university_name: row.university_name,
                person_name: row.person_name,
                contact_number: row.contact_number,
              },
              user_id: {
                id: row.user_id,
                username: row.user_username, // Use the computed column
                phone_number: row.user_phone_number,
              },
              course_id: {
                course_id: row.course_id,
                course_name: row.course_name,
                course_level: row.course_level,
                update_date: row.update_date,
              },
              documents: [],
              comments: [],
            };
            console.log("fsdgdg",newApplication)

            if (row.file_type !== null && row.file_path !== null) {
              const document = {
                file_type: row.file_type,
                file_path: row.file_path,
              };
              newApplication.documents.push(document);
            }

            if (row.comment_id !== null && row.comment_text !== null) {
              const comment = {
                comment_id: row.comment_id,
                comment_text: row.comment_text,
                username: row.comment_username, // Use the computed column
                role: row.role,
                select_type: row.select_type,
                created_at: row.comment_created_at,
              };
              newApplication.comments.push(comment);
            }

            applications.push(newApplication);
          }
        });
        resolve(applications);
      }
    });
  });
}
 */
function getalluniversity() {
    return new Promise((resolve, reject) => {
        const query = `SELECT  * FROM UniversityRegistration WHERE is_deleted = 0`

        db.query(query, (error, results) => {
            if (error) {
                console.error('Error executing query:', error);
                reject(error);
                logger.error('Error getting all university:', error); // Log the error
            } else {
                const usersWithAddresses = results.map((row) => ({
                    id: row.id,
                    university_name: row.university_name,
                    ambassador_name: row.ambassador_name,
                    phone_number: row.phone_number,
                    university_image: row.university_image,
                    year_established:row.year_established,
                    is_active: row.is_active,
                    create_date: row.create_date,
                    update_date: row.update_date,
                    is_deleted: row.is_deleted,

                }));
                resolve(usersWithAddresses);
                logger.info('All university retrieved successfully');
            }
        });
    });
}

function updateUniversity(id, updatedUniversityData) {
    return new Promise((resolve, reject) => {
        const { university_name, ambassador_name, phone_number, email } = updatedUniversityData;

        // Construct the SQL query
        const query = `
        UPDATE UniversityRegistration
        SET 
          university_name = COALESCE(?, university_name),
          ambassador_name = COALESCE(?, ambassador_name),
          phone_number = COALESCE(?, phone_number),
          email = COALESCE(?, email)
          WHERE id = ?;
      `;


        db.query(query, [university_name, ambassador_name, phone_number, email, id], (error, result) => {
            if (error) {
                reject(error);
                logger.error('Error updating university:', error);
            } else {
                if (result.affectedRows > 0) {

                    const fetchQuery = `
              SELECT * FROM UniversityRegistration WHERE id = ?;
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

function updateUserData(id, updatedUserData) {
    return new Promise((resolve, reject) => {
        const { username, firstname, lastname, email, phone_number, address } = updatedUserData;

        // Construct the SQL query to update user information and address
        const updateQuery = `
            UPDATE user01 u
            JOIN user_address_by a ON u.id = a.user_id
            SET 
                u.username = COALESCE(?, u.username),
                u.firstname = COALESCE(?, u.firstname),
                u.lastname = COALESCE(?, u.lastname),
                u.email = COALESCE(?, u.email),
                u.phone_number = COALESCE(?, u.phone_number),
                a.street_address = COALESCE(?, a.street_address),
                a.city = COALESCE(?, a.city),
                a.state = COALESCE(?, a.state),
                a.postal_code = COALESCE(?, a.postal_code)
            WHERE u.id = ?;
        `;

        // Execute the update query
        db.query(
            updateQuery,
            [
                username,
                firstname,
                lastname,
                email,
                phone_number,
                address.street_address,
                address.city,
                address.state,
                address.postal_code,
                id
            ],
            (updateError, updateResult) => {
                if (updateError) {
                    reject(updateError);
                    logger.error('Error updating user information and address:', updateError);
                } else {
                    // Check if any rows were affected (indicating a successful update)
                    if (updateResult.affectedRows > 0) {
                        // Fetch the updated data after the update
                        const fetchQuery = `
                            SELECT * FROM user01 u
                            JOIN user_address_by a ON u.id = a.user_id
                            WHERE u.id = ?;
                        `;

                        db.query(fetchQuery, [id], (fetchError, fetchResult) => {
                            if (fetchError) {
                                reject(fetchError);
                                logger.error('Error fetching updated user data:', fetchError);
                            } else {
                                // Check if the fetch query returned any data
                                if (fetchResult.length > 0) {
                                    const updatedUserData = fetchResult[0];
                                    resolve(updatedUserData);
                                    logger.info('User information and address updated successfully', updatedUserData);
                                } else {
                                    resolve(null);
                                }
                            }
                        });
                    } else {
                        resolve(null);
                    }
                }
            }
        );
    });
}

function updateStudentdata(id, updatedUserData) {
    return new Promise((resolve, reject) => {
        const { username, first_name, last_name, email, phone_number, address } = updatedUserData;

        // Construct the SQL query to update user information and address
        const updateQuery = `
            UPDATE students u
            JOIN student_addresse a ON u.id = a.student_id
            SET 
                u.username = COALESCE(?, u.username),
                u.first_name = COALESCE(?, u.first_name),
                u.last_name = COALESCE(?, u.last_name),
                u.email = COALESCE(?, u.email),
                u.phone_number = COALESCE(?, u.phone_number),
                a.street_address = COALESCE(?, a.street_address),
                a.city = COALESCE(?, a.city),
                a.state = COALESCE(?, a.state),
                a.postal_code = COALESCE(?, a.postal_code)
            WHERE u.id = ?;
        `;

        // Execute the update query
        db.query(
            updateQuery,
            [
                username,
                first_name,
                last_name,
                email,
                phone_number,
                address.street_address,
                address.city,
                address.state,
                address.postal_code,
                id
            ],
            (updateError, updateResult) => {
                if (updateError) {
                    reject(updateError);
                    logger.error('Error updating user information and address:', updateError);
                } else {
                    // Check if any rows were affected (indicating a successful update)
                    if (updateResult.affectedRows > 0) {
                        // Fetch the updated data after the update
                        const fetchQuery = `
                            SELECT * FROM students u
                            JOIN student_addresse a ON u.id = a.student_id
                            WHERE u.id = ?;
                        `;

                        db.query(fetchQuery, [id], (fetchError, fetchResult) => {
                            if (fetchError) {
                                reject(fetchError);
                                logger.error('Error fetching updated user data:', fetchError);
                            } else {
                                // Check if the fetch query returned any data
                                if (fetchResult.length > 0) {
                                    const updatedUserData = fetchResult[0];
                                    resolve(updatedUserData);
                                    logger.info('User information and address updated successfully', updatedUserData);
                                } else {
                                    resolve(null);
                                }
                            }
                        });
                    } else {
                        resolve(null);
                    }
                }
            }
        );
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



function getAllCoursesWithUserDataAndUniversity(offset, pageSize) {
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
                au.course_type,
                au.university_image
                
            FROM courses c
            INNER JOIN user01 u ON c.user_id = u.id
            LEFT JOIN university au ON c.university_id = au.university_id
            LIMIT ?, ?;
        `;

        db.query(query,  [offset, parseInt(pageSize, 10)], (error, results) => {
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
                        university_image: row.university_image,
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




function getallcourses() {
    return new Promise((resolve, reject) => {
        const query = `SELECT  * FROM courses_list WHERE is_deleted = 0`

        db.query(query, (error, results) => {
            if (error) {
                console.error('Error executing query:', error);
                reject(error);
                logger.error('Error getting all users:', error); // Log the error
            } else {
                const usersWithAddresses = results.map((row) => ({
                    course_id: row.course_id,
                    course_name: row.course_name,
                }));
                resolve(usersWithAddresses);
                logger.info('All courses retrieved successfully');
            }
        });
    });
}



function getallstaff() {
    return new Promise((resolve, reject) => {
        const query = `SELECT  * FROM staff WHERE is_deleted = 0`

        db.query(query, (error, results) => {
            if (error) {
                console.error('Error executing query:', error);
                reject(error);
                logger.error('Error getting all staff:', error); // Log the error
            } else {
                const usersWithAddresses = results.map((row) => ({
                    id: row.id,
                    staff_name: row.staff_name,
                }));
                resolve(usersWithAddresses);
                logger.info('All staff retrieved successfully');
            }
        });
    });
}


function UniversityRegisterself(university) {
    return new Promise((resolve, reject) => {
        const { university_name, ambassador_name, phone_number, email, username, password, addressId, year_established, type } = university;
        const query = `
        INSERT INTO UniversityRegistration  
        (university_name, ambassador_name, phone_number,email,username,password,address_id,year_established,type)
        VALUES (?, ?, ?,?,?,?,?,?,?)
      `;

        db.query(query, [university_name, ambassador_name, phone_number, email, username, password, addressId, year_established, type], (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result.insertId);
            }
        });
    });
}






// function for uploading image and registration certificate
function addimg(userId, universityImage, registrationCertificate) {
    return new Promise((resolve, reject) => {

        const sql = 'UPDATE UniversityRegistration SET university_image = ?, registration_certificate = ? WHERE id = ?';
        db.query(sql, [universityImage, registrationCertificate, userId], (err, result) => {
            if (err) {
                return reject(err);
            }

            return resolve(result);
        });
    })
}



async function addRegistrationCertificate(userId, regCertImageName) {
    try {
        const sql = 'UPDATE UniversityRegistration SET registration_certificate = ? WHERE id = ?';
        const result = db.query(sql, [regCertImageName, userId]);

        // Check if the update was successful and handle it as needed
        if (result.affectedRows === 0) {
            throw new Error('No rows were updated. User may not exist or the field already has the same value.');
        }

        return result;
    } catch (error) {
        throw error;
    }
}

async function aCertificate(userId, uniImageName) {
    try {
        const sql = 'UPDATE UniversityRegistration SET university_image = ? WHERE id = ?';
        const result = db.query(sql, [uniImageName, userId]);

        // Check if the update was successful and handle it as needed
        if (result.affectedRows === 0) {
            throw new Error('No rows were updated. User may not exist or the field already has the same value.');
        }

        return result;
    } catch (error) {
        throw error;
    }
}



function logiuniversity(username, password, callback) {

    const query = 'SELECT * FROM UniversityRegistration WHERE username = ?';


    db.query(query, [username], async (err, results) => {
        if (err) {
            return callback(err, null);
        }

        if (results.length === 0) {
            return callback(null, { error: 'User not found' });
        }

        const user = results[0];

        if (user.is_deleted === 1) {
            return callback(null, { error: 'User not found' });
        }
        if (user.is_approved !== 1) {
            return callback(null, { error: 'You are not approved at this moment' });
        }


        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return callback(null, { error: 'Invalid password' });
        }

        const secretKey = 'secretkey';
        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, secretKey);

        return callback(null, {
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    role: user.role,
                    token: token,
                }
            }
        });
    });
}

function universityaddress(street_address, city, state, country, postal_code, user_id) {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO university_address(street_address, city, state, country, postal_code,user_id) VALUES ( ?, ?, ?, ?, ?,?)';
        db.query(query, [street_address, city, state, country, postal_code, user_id], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.insertId);
            }
        });
    });
}





// updateUserAddress function remains the same
function updateaddressuniversity(userId, addressId) {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE UniversityRegistration SET address_id = ? WHERE id = ?';
        db.query(query, [addressId, userId], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

function insertfees(hostel_meals, tuition_fees, transportation, phone_internet, total) {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO  tution_fees(hostel_meals, tuition_fees, transportation, phone_internet, total) VALUES (?, ?, ?, ?, ?)';
        db.query(query, [hostel_meals, tuition_fees, transportation, phone_internet, total], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.insertId);
            }
        });
    });
}

function insertArrayDescription(description) {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO new_update_university (descpription) VALUES (?)';
        db.query(query, [description], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.insertId);
            }
        });
    });
}

// Modify the insertfees function to handle multiple requirements
function insertRequirement(courseId, requirement) {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO entiry_requirements (course_id, requirement) VALUES (?, ?)';
        db.query(query, [courseId, requirement], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.insertId);
            }
        });
    });
}

function updatetution(courseId, tuitionId) {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE courses_list SET tuition_id = ? WHERE course_id = ?';
        db.query(query, [tuitionId, courseId], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}


function courseregister(university, userId) {
    return new Promise((resolve, reject) => {
        const { course_name, department, subject, tuition_fee, duration_years, course_type, university_id, tutionId } = university;
        const query = `
        INSERT INTO courses_list 
        (course_name, department, subject,tuition_fee,duration_years,course_type,university_id,tuition_id)
        VALUES (?, ?, ?,?,?,?,?,?)
      `;

        db.query(query, [course_name, department, subject, tuition_fee, duration_years, course_type, university_id, tutionId], (error, result) => {
            if (error) {
                reject(error);
                logger.error('Error registering courses:', error);
            } else {
                const insertedUniversity = {
                    id: result.insertId,
                    course_name,
                    department,
                    subject,
                    tuition_fee,
                    duration_years,
                    course_type,
                    userId,

                };
                resolve(insertedUniversity);
                logger.info('courses registered successfully', insertedUniversity);
            }
        });
    });
}


// updateUserAddress function remains the same
function updatetution(userId, addressId) {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE courses_list SET tuition_id = ? WHERE course_id = ?';
        db.query(query, [addressId, userId], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

function Tutionfess(university) {
    return new Promise((resolve, reject) => {
        const { course_id, hostel_meals, tuition_fees, transportation, phone_internet, total } = university;
        const query = `
        INSERT INTO tution_fees 
        (course_id, hostel_meals, tuition_fees,transportation,phone_internet,total)
        VALUES (?, ?, ?,?,?,?)
      `;

        db.query(query, [course_id, hostel_meals, tuition_fees, transportation, phone_internet, total], (error, result) => {
            if (error) {
                reject(error);
                logger.error('Error registering tutionfess with course:', error);
            } else {
                const insertedUniversity = {
                    tution_id: result.insertId,
                    course_id,
                    hostel_meals,
                    tuition_fees,
                    transportation,
                    phone_internet,
                    total

                };
                resolve(insertedUniversity);
                logger.info('tution fess registered successfully', insertedUniversity);
            }
        });
    });
}


function ugrequirement(university, userId) {
    return new Promise((resolve, reject) => {
        const { english_requirement, academic_requirement, offer_timeline, Credibility, Finance, Discount, university_id } = university;
        const query = `
        INSERT INTO ug_requirememnt 
        (english_requirement, academic_requirement, offer_timeline,Credibility,Finance,Discount,university_id)
        VALUES (?, ?, ?,?,?,?,?)
      `;

        db.query(query, [english_requirement, academic_requirement, offer_timeline, Credibility, Finance, Discount, university_id], (error, result) => {
            if (error) {
                reject(error);
                logger.error('Error registering courses:', error);
            } else {
                const insertedUniversity = {
                    id: result.insertId,
                    english_requirement,
                    academic_requirement,
                    offer_timeline,
                    Credibility,
                    Finance,
                    Discount,
                    userId

                };
                resolve(insertedUniversity);
                logger.info('courses registered successfully', insertedUniversity);
            }
        });
    });
}





function pgrequirement(university, userId) {
    return new Promise((resolve, reject) => {
        const { english_requirement, academic_requirement, offer_timeline, Credibility, Finance, Discount, university_id } = university;
        const query = `
        INSERT INTO pg_requirememnt 
        (english_requirement, academic_requirement, offer_timeline,Credibility,Finance,Discount,university_id)
        VALUES (?, ?, ?,?,?,?,?)
      `;

        db.query(query, [english_requirement, academic_requirement, offer_timeline, Credibility, Finance, Discount, university_id], (error, result) => {
            if (error) {
                reject(error);
                logger.error('Error registering courses:', error);
            } else {
                const insertedUniversity = {
                    id: result.insertId,
                    english_requirement,
                    academic_requirement,
                    offer_timeline,
                    Credibility,
                    Finance,
                    Discount,
                    userId

                };
                resolve(insertedUniversity);
                logger.info('courses registered successfully', insertedUniversity);
            }
        });
    });
}



function getallcoursesbyid(userId) {
    return new Promise((resolve, reject) => {
        const query = ` 
        SELECT
        c.course_id,
        c.course_name,
        c.department,
        c.subject,
        c.tuition_fee,
        c.duration_years,
        c.course_type,
        u.id AS university_id,
        u.university_image
      FROM courses_list c
      INNER JOIN UniversityRegistration u ON c.university_id = u.id
      WHERE u.id = ?;`

        db.query(query, userId, (error, results) => {
            if (error) {
                console.error('Error executing query:', error);
                reject(error);
                logger.error('Error getting all courses:', error); // Log the error
            } else {


                const usersWithAddresses = results.map((row) => ({
                    course_id: row.course_id,
                    course_name: row.course_name,
                    department: row.department,
                    subject: row.subject,
                    tuition_fee: row.tuition_fee,
                    duration_years: row.duration_years,
                    course_type: row.course_type,
                    university: {
                        id: row.university_id,
                        image: row.university_image // Include the university image here
                    },
                    is_active: row.is_active,
                    create_date: row.create_date,
                    update_date: row.update_date,
                    is_deleted: row.is_deleted,

                }));

                resolve(usersWithAddresses);

                logger.info('All courses retrieved successfully');
            }
        });
    });
}




function getallcoursesbyftehc(offset,pageSize) {
    return new Promise((resolve, reject) => {
        const query = ` 
        SELECT
        c.course_id,
        c.course_name,
        c.department,
        c.subject,
        c.tuition_fee,
        c.duration_years,
        c.course_type,
        u.id AS university_id,
        u.university_image
      FROM courses_list c
      INNER JOIN UniversityRegistration u ON c.university_id = u.id
      LIMIT ?, ?;`

        db.query(query, [offset, parseInt(pageSize, 10)],(error, results) => {
            if (error) {
                console.error('Error executing query:', error);
                reject(error);
                logger.error('Error getting all courses:', error); // Log the error
            } else {


                const usersWithAddresses = results.map((row) => ({
                    course_id: row.course_id,
                    course_name: row.course_name,
                    department: row.department,
                    subject: row.subject,
                    tuition_fee: row.tuition_fee,
                    duration_years: row.duration_years,
                    course_type: row.course_type,
                    university: {
                        id: row.university_id,
                        image: row.university_image // Include the university image here
                    },
                    is_active: row.is_active,
                    create_date: row.create_date,
                    update_date: row.update_date,
                    is_deleted: row.is_deleted,

                }));

                resolve(usersWithAddresses);

                logger.info('All courses retrieved successfully');
            }
        });
    });
}


function getTotalCoursesCount() {
    return new Promise((resolve, reject) => {
      const countQuery = 'SELECT COUNT(*) AS totalCount FROM courses_list;';
  
      db.query(countQuery, (error, results) => {
        if (error) {
          console.error('Error executing count query:', error);
          reject(error);
        } else {
          const totalCount = results[0].totalCount;
          resolve(totalCount);
        }
      });
    });
  }
function getTotalUniversityCoursesCount(universityId) {
    return new Promise((resolve, reject) => {
      const countQuery = 'SELECT COUNT(*) AS totalCount FROM courses_list WHERE university_id = ?;';
    
      db.query(countQuery, [universityId], (error, results) => {
        if (error) {
          console.error('Error executing count query:', error);
          reject(error);
        } else {
          const totalCount = results[0].totalCount;
          resolve(totalCount);
        }
      });
    });
  }
  
function getallugbyid(userId) {
    return new Promise((resolve, reject) => {
        const query = ` 
        SELECT
        c.ug_id,
        c.english_requirement,
        c.academic_requirement,
        c.offer_timeline,
        c.Credibility,
        c.Finance,
        c.Discount,
        u.id AS university_id,
        u.university_image
      FROM  ug_requirememnt c
      INNER JOIN UniversityRegistration u ON c.university_id = u.id
      WHERE u.id = ?;`

        db.query(query, userId, (error, results) => {
            if (error) {
                console.error('Error executing query:', error);
                reject(error);
                logger.error('Error getting all courses:', error); // Log the error
            } else {


                const usersWithAddresses = results.map((row) => ({
                    ug_requirement: row.ug_id,
                    english_requirement: row.english_requirement,
                    academic_requirement: row.academic_requirement,
                    offer_timeline: row.offer_timeline,
                    Credibility: row.Credibility,
                    Finance: row.Finance,
                    Discount: row.Discount,
                    university: {
                        id: row.university_id,
                        image: row.university_name
                    },
                    is_active: row.is_active,
                    create_date: row.create_date,
                    update_date: row.update_date,
                    is_deleted: row.is_deleted,

                }));

                resolve(usersWithAddresses);

                logger.info('All courses retrieved successfully');
            }
        });
    });
}



function getallugrequirement() {
    return new Promise((resolve, reject) => {
        const query = ` 
        SELECT
        c.ug_id,
        c.english_requirement,
        c.academic_requirement,
        c.offer_timeline,
        c.Credibility,
        c.Finance,
        c.Discount,
        u.id AS university_id,
        u.university_image
      FROM  ug_requirememnt c
      INNER JOIN UniversityRegistration u ON c.university_id = u.id
     ;`

        db.query(query, (error, results) => {
            if (error) {
                console.error('Error executing query:', error);
                reject(error);
                logger.error('Error getting all courses:', error); // Log the error
            } else {


                const usersWithAddresses = results.map((row) => ({
                    ug_requirement: row.ug_id,
                    english_requirement: row.english_requirement,
                    academic_requirement: row.academic_requirement,
                    offer_timeline: row.offer_timeline,
                    Credibility: row.Credibility,
                    Finance: row.Finance,
                    Discount: row.Discount,
                    university: {
                        id: row.university_id,
                        image: row.university_name // Include the university image here
                    },
                    is_active: row.is_active,
                    create_date: row.create_date,
                    update_date: row.update_date,
                    is_deleted: row.is_deleted,

                }));

                resolve(usersWithAddresses);

                logger.info('All courses retrieved successfully');
            }
        });
    });
}


function getallpgbyid(userId) {
    return new Promise((resolve, reject) => {
        const query = ` 
        SELECT
        c.pg_id,
        c.english_requirement,
        c.academic_requirement,
        c.offer_timeline,
        c.Credibility,
        c.Finance,
        c.Discount,
        u.id AS university_id,
        u.university_image
      FROM  pg_requirememnt c
      INNER JOIN UniversityRegistration u ON c.university_id = u.id
      WHERE u.id = ?;`

        db.query(query, userId, (error, results) => {
            if (error) {
                console.error('Error executing query:', error);
                reject(error);
                logger.error('Error getting all courses:', error); // Log the error
            } else {


                const usersWithAddresses = results.map((row) => ({
                    pg_requirement: row.pg_id,
                    english_requirement: row.english_requirement,
                    academic_requirement: row.academic_requirement,
                    offer_timeline: row.offer_timeline,
                    Credibility: row.Credibility,
                    Finance: row.Finance,
                    Discount: row.Discount,
                    university: {
                        id: row.university_id,
                        image: row.university_name // Include the university image here
                    },
                    is_active: row.is_active,
                    create_date: row.create_date,
                    update_date: row.update_date,
                    is_deleted: row.is_deleted,

                }));

                resolve(usersWithAddresses);

                logger.info('All courses retrieved successfully');
            }
        });
    });
}



function getallpgrequirement() {
    return new Promise((resolve, reject) => {
        const query = ` 
        SELECT
        c.pg_id,
        c.english_requirement,
        c.academic_requirement,
        c.offer_timeline,
        c.Credibility,
        c.Finance,
        c.Discount,
        u.id AS university_id,
        u.university_image
      FROM  pg_requirememnt c
      INNER JOIN UniversityRegistration u ON c.university_id = u.id
     ;`

        db.query(query, (error, results) => {
            if (error) {
                console.error('Error executing query:', error);
                reject(error);
                logger.error('Error getting all courses:', error); // Log the error
            } else {


                const usersWithAddresses = results.map((row) => ({
                    pg_requirement: row.pg_id,
                    english_requirement: row.english_requirement,
                    academic_requirement: row.academic_requirement,
                    offer_timeline: row.offer_timeline,
                    Credibility: row.Credibility,
                    Finance: row.Finance,
                    Discount: row.Discount,
                    university: {
                        id: row.university_id,
                        image: row.university_name // Include the university image here
                    },
                    is_active: row.is_active,
                    create_date: row.create_date,
                    update_date: row.update_date,
                    is_deleted: row.is_deleted,

                }));

                resolve(usersWithAddresses);

                logger.info('All courses retrieved successfully');
            }
        });
    });
}






const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'ashimavineet2729@gmail.com',
        pass: 'suqo spfj ajsb fieb',   ////---->>>>>app password  from google
    },
});

function generateOTP() {
    return randomstring.generate({
        length: 6,
        charset: 'numeric',
    });
}


function sendotpuniversity(email) {
    return new Promise((resolve, reject) => {
        const emailQuery = 'SELECT email FROM UniversityRegistration WHERE email = ?';

        db.query(emailQuery, [email], (emailError, emailResults) => {
            if (emailError) {
                console.error('Error retrieving user email:', emailError);
                reject(emailError);
                return;
            }

            if (emailResults.length === 0) {
                reject('User not found');
                return;
            }

            // First, delete the previous OTP records associated with the user's email 
            const deletePreviousQuery = 'DELETE FROM otp_table_verify WHERE email = ?';
            db.query(deletePreviousQuery, [email], (deletePreviousError) => {
                if (deletePreviousError) {
                    console.error('Error deleting previous OTP records:', deletePreviousError);
                    reject(deletePreviousError);
                    return;
                }

                const otp = generateOTP();
                const mailOptions = {
                    from: 'ashimavineet2729@gmail.com',
                    to: email,
                    subject: 'Your OTP for Password Reset',
                    html: emailTemplate.replace('${otp}', otp),
                }

                // Send the OTP via email
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error('Error sending email:', error);
                        reject(error);
                    } else {
                        console.log('Email sent:', email);

                        // Store the new OTP in the 'otp_table' along with the user's email
                        const query = 'INSERT INTO otp_table_verify (email, otp) VALUES (?, ?)';
                        db.query(query, [email, otp], (dbError) => {
                            if (dbError) {
                                console.error('Error storing OTP in the database:', dbError);
                                reject(dbError);
                            } else {
                                console.log('New OTP stored in the database.', otp);
                                resolve(otp);
                            }
                        });
                    }
                });
            });
        });
    });
}



function verifyOTP(otp, callback) {
    const otpQuery = 'SELECT email, is_verified FROM otp_table_verify WHERE otp = ?';

    db.query(otpQuery, [otp], (otpError, otpResults) => {
        if (otpError) {
            console.error('Error verifying OTP:', otpError);
            return callback(otpError, null);
        }

        if (otpResults.length === 0) {
            return callback(null, 'invalid');
        }

        const isVerified = otpResults[0].is_verified;
        if (isVerified === 1) {
            return callback(null, 'used');
        }

        const email = otpResults[0].email;
        const markVerifiedQuery = 'UPDATE otp_table_verify SET is_verified = 1 WHERE email = ? AND otp = ?';
        db.query(markVerifiedQuery, [email, otp], (markVerifiedError) => {
            if (markVerifiedError) {
                console.error('Error marking OTP as verified:', markVerifiedError);
                return callback(markVerifiedError, null);
            }

            callback(null, 'verified');
        });
    });
};

const setNewPassword = (email, newPassword, callback) => {
    bcrypt.hash(newPassword, 10, (hashError, hashedPassword) => {
        if (hashError) {
            console.error('Error hashing the password:', hashError);
            return callback(hashError);
        }

        const updatePasswordQuery = 'UPDATE UniversityRegistration SET password = ? WHERE email = ?';

        db.query(updatePasswordQuery, [hashedPassword, email], (updateError) => {
            if (updateError) {
                console.error('Error updating password:', updateError);
                return callback(updateError);
            }

            callback(null);
        });
    });
};


function getallcoursesbyids(userId) {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT
            c.course_id,
            c.course_name,
            c.department,
            c.subject,
            c.tuition_fee,
            c.duration_years,
            c.course_type,
            a.tution_id AS tuition_id ,
            a.hostel_meals,
            a.tuition_fees,
            a.transportation,
            a.phone_internet,
            a.total,
            u.id AS university_id,
            u.university_image,
            u.university_name,
            au.course_id AS entry_requirements_course_id,
            au.requirement AS entry_requirement,
            au.create_date AS entry_requirement_create_date
        FROM courses_list c
        INNER JOIN UniversityRegistration u ON c.university_id = u.id
        LEFT JOIN tution_fees a ON c.tuition_id = a.tution_id
        LEFT JOIN entiry_requirements au ON c.course_id = au.course_id
        WHERE c.course_id = ?;`;

        db.query(query, userId, (error, results) => {
            if (error) {
                console.error('Error executing query:', error);
                reject(error);
                logger.error('Error getting all courses:', error); // Log the error
            } else {
                const courses = {};
                results.forEach((row) => {
                    if (!courses[row.course_id]) {
                        courses[row.course_id] = {
                            course_id: row.course_id,
                            course_name: row.course_name,
                            department: row.department,
                            subject: row.subject,
                            tuition_fee: row.tuition_fee,
                            duration_years: row.duration_years,
                            course_type: row.course_type,
                            university: {
                                id: row.university_id,
                                image: row.university_image,
                                university_name: row.university_name,
                            },
                            tution: {
                                id: row.tuition_id,
                                hostel_meals: row.hostel_meals,
                                tuition_fees: row.tuition_fees,
                                transportation: row.transportation,
                                phone_internet: row.phone_internet,
                                total: row.total,
                            },
                            entry_requirements: [],
                        };
                    }
                    // Add entry requirement data to the course
                    if (row.entry_requirements_course_id) {
                        courses[row.course_id].entry_requirements.push({
                            course_id: row.entry_requirements_course_id,
                            requirement: row.entry_requirement,
                            create_date: row.entry_requirement_create_date,
                        });
                    }
                });

                resolve(Object.values(courses));

                logger.info('All courses retrieved successfully');
            }
        });
    });
}


// function updatecoursesandNew(id, updatedUniversityData) {
//     return new Promise((resolve, reject) => {
//         const { 	course_name, department, subject, 	tuition_fee, duration_years,course_type} = updatedUniversityData;

//         // Construct the SQL query
//         const query = `
//         UPDATE courses_list
//         SET 
//         course_name = COALESCE(?, course_name),
//         department = COALESCE(?, department),
//         subject = COALESCE(?, subject),
//         tuition_fee = COALESCE(?, tuition_fee),
//         duration_years = COALESCE(?, duration_years),
//         course_type = COALESCE(?, course_type)

//           WHERE course_id = ?;
//       `;


//         db.query(query, [course_name, department, subject, tuition_fee, duration_years,course_type,id], (error, result) => {
//             if (error) {
//                 reject(error);
//                 logger.error('Error updating university:', error);
//             } else {
//                 if (result.affectedRows > 0) {

//                     const fetchQuery = `
//               SELECT * FROM courses_list WHERE course_id = ?;
//             `;

//                     db.query(fetchQuery, [id], (fetchError, fetchResult) => {
//                         if (fetchError) {
//                             reject(fetchError);
//                             logger.error('Error fetching updated university:', fetchError);
//                         } else {
//                             if (fetchResult.length > 0) {
//                                 const updatedUniversity = fetchResult[0];
//                                 resolve(updatedUniversity);
//                                 logger.info('University updated successfully', updatedUniversity);
//                             } else {
//                                 resolve(null);
//                             }
//                         }
//                     });
//                 } else {
//                     resolve(null);
//                 }
//             }
//         });
//     });
// }


function updatecoursesandNew(id, updatedUserData) {
    return new Promise((resolve, reject) => {
        const { course_name, department, subject, tuition_fee, duration_years, course_type, tution } = updatedUserData;

        const updateQuery = `
            UPDATE courses_list u
            JOIN  tution_fees a ON u.tuition_id = a.tution_id
            SET 
                u.course_name = COALESCE(?, u.course_name),
                u.department = COALESCE(?, u.department),
                u.subject = COALESCE(?, u.subject),
                u.tuition_fee = COALESCE(?, u.tuition_fee),
                u.duration_years = COALESCE(?, u.duration_years),
                u.course_type = COALESCE(?, u.course_type),
                a.hostel_meals = COALESCE(?, a.hostel_meals),
                a.tuition_fees = COALESCE(?, a.tuition_fees),
                a.transportation = COALESCE(?, a.transportation),
                a.phone_internet = COALESCE(?, a.phone_internet),
                a.total = COALESCE(?, a.total)
            WHERE u.tuition_id = ?;
        `;

        db.query(
            updateQuery,
            [
                course_name,
                department,
                subject,
                tuition_fee,
                duration_years,
                course_type,
                tution.hostel_meals,
                tution.tuition_fees,
                tution.transportation,
                tution.phone_internet,
                tution.total,
                id
            ],
            (updateError, updateResult) => {
                if (updateError) {
                    reject(updateError);
                    logger.error('Error updating courses information and tutionfees:', updateError);
                } else {
                    if (updateResult.affectedRows > 0) {
                        const fetchQuery = `
                            SELECT * FROM courses_list u
                            JOIN tution_fees a ON u.tuition_id = a.tution_id
                            WHERE u.tuition_id = ?;
                        `;

                        db.query(fetchQuery, [id], (fetchError, fetchResult) => {
                            if (fetchError) {
                                reject(fetchError);
                                logger.error('Error fetching updated courses data:', fetchError);
                            } else {
                                if (fetchResult.length > 0) {
                                    const updatedUserData = fetchResult[0];
                                    resolve(updatedUserData);
                                    logger.info('courses information and tutionfees updated successfully', updatedUserData);
                                } else {
                                    resolve(null);
                                }
                            }
                        });
                    } else {
                        resolve(null);
                    }
                }
            }
        );
    });
}

function universityFaq(university, userId) {
    return new Promise((resolve, reject) => {
        const { university_id, question, answer } = university;
        const query = `
        INSERT INTO university_faq 
        (university_id, question, answer)
        VALUES (?, ?, ?)
      `;

        db.query(query, [university_id, question, answer], (error, result) => {
            if (error) {
                reject(error);
                logger.error('Error register FAq:', error);
            } else {
                const insertedUniversity = {
                    id: result.insertId,
                    userId,
                    question,
                    answer

                };
                resolve(insertedUniversity);
                logger.info('FAq registered successfully', insertedUniversity);
            }
        });
    });
}


function univeristyUpdatelatest(university, userId) {
    return new Promise((resolve, reject) => {
        const { university_id, heading, descpription } = university;
        const query = `
        INSERT INTO new_update_university 
        (university_id, heading,descpription)
        VALUES (?, ?,?)
      `;

        db.query(query, [university_id, heading, descpription], (error, result) => {
            if (error) {
                reject(error);
                logger.error('Error registering Update latest:', error);
            } else {
                const insertedUniversity = {
                    id: result.insertId,
                    userId,
                    heading,
                    descpription

                };
                resolve(insertedUniversity);
                logger.info(' add successfully latest Update of successfully', insertedUniversity);
            }
        });
    });
}

function getallUniversityids(userId) {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT DISTINCT
            c.id,
            c.university_name,
            c.ambassador_name,
            c.phone_number,
            c.email,
            c.university_image,
            c.registration_certificate,
            c.year_established,
            c.type,
            a.address_id AS address_id,
            a.street_address,
            a.city,
            a.state,
            a.country,
            a.postal_code,
            u.faq_id,
            u.university_id AS university_id,
            u.question AS entry_requirement,
            u.answer,
            un.latest_id,
            un.university_id AS university_idBTDATA,
            un.heading AS heading_requirmrnet,
            un.descpription,
            un.updated_at
        FROM UniversityRegistration c
        LEFT JOIN university_faq u ON c.id = u.university_id
        LEFT JOIN new_update_university un ON c.id = un.university_id
        LEFT JOIN university_address a ON c.address_id = a.address_id
        WHERE c.id = ?;`;

        db.query(query, [userId], (error, results) => {
            if (error) {
                console.error('Error executing query:', error);
                reject(error);
                logger.error('Error getting university by ID:', error);
            } else {
                if (results.length === 0) {
                    reject(new Error('University not found'));
                } else {
                    const universities = {};
                    results.forEach((row) => {
                        if (!universities[row.id]) {
                            universities[row.id] = {
                                id: row.id,
                                university_name: row.university_name,
                                ambassador_name: row.ambassador_name,
                                phone_number: row.phone_number,
                                email: row.email,
                                university_image: row.university_image,
                                registration_certificate: row.registration_certificate,
                                year_established: row.year_established,
                                type: row.type,
                                address: {
                                    address_id: row.address_id,
                                    street_address: row.street_address,
                                    city: row.city,
                                    state: row.state,
                                    postal_code: row.postal_code,
                                },
                                faqs: [],
                                updates: []
                            };
                        }

                        if (row.faq_id && !universities[row.id].faqs.some(faq => faq.faq_id === row.faq_id)) {
                            universities[row.id].faqs.push({
                                faq_id: row.faq_id,
                                university_id: row.university_id,
                                question: row.entry_requirement,
                                answer: row.answer,
                            });
                        }

                        if (row.university_idBTDATA && !universities[row.id].updates.some(update => update.latest_id === row.latest_id)) {
                            universities[row.id].updates.push({
                                latest_id: row.latest_id,
                                university_id: row.university_id,
                                heading: row.heading_requirmrnet,
                                description: row.descpription,
                                updated_at : row.updated_at
                            });
                        }
                    });

                    resolve(Object.values(universities));
                    logger.info('University retrieved by ID successfully');
                }
            }
        });
    });
}


function getownbyid(userId) {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT DISTINCT
            c.id,
            c.university_name,
            u.faq_id,
            u.university_id AS university_id,
            u.question AS entry_requirement,
            u.answer,
            un.latest_id,
            un.university_id AS university_idBTDATA,
            un.heading AS heading_requirmrnet,
            un.descpription,
            un.updated_at
        FROM UniversityRegistration c
        LEFT JOIN university_faq u ON c.id = u.university_id
        LEFT JOIN new_update_university un ON c.id = un.university_id
        WHERE c.id = ?;`;

        db.query(query, [userId], (error, results) => {
            if (error) {
                console.error('Error executing query:', error);
                reject(error);
                logger.error('Error getting university by ID:', error);
            } else {
                if (results.length === 0) {
                    reject(new Error('University not found'));
                } else {
                    const universities = {};
                    results.forEach((row) => {
                        if (!universities[row.id]) {
                            universities[row.id] = {
                                id: row.id,
                                university_name: row.university_name,
                                faqs: [],
                                updates: []
                            };
                        }

                        if (row.faq_id && !universities[row.id].faqs.some(faq => faq.faq_id === row.faq_id)) {
                            universities[row.id].faqs.push({
                                faq_id: row.faq_id,
                                university_id: row.university_id,
                                question: row.entry_requirement,
                                answer: row.answer,
                            });
                        }

                        if (row.university_idBTDATA && !universities[row.id].updates.some(update => update.latest_id === row.latest_id)) {
                            universities[row.id].updates.push({
                                latest_id: row.latest_id,
                                university_id: row.university_id,
                                heading: row.heading_requirmrnet,
                                description: row.descpription,
                                updated_at : row.updated_at
                            });
                        }
                    });

                    resolve(Object.values(universities));
                    logger.info('University retrieved by ID successfully');
                }
            }
        });
    });
}
module.exports = {
    UniversityRegister,
    updateUniversity,
    createCourse,
    getAllCoursesWithUserDataAndUniversity,
    getalluniversity,
    getCourseById,
    addimageuniversity,
    getallcourses,
    UniversityRegisterself,
    addimg,
    addRegistrationCertificate,
    aCertificate,
    logiuniversity,
    universityaddress,
    updateaddressuniversity,
    courseregister,
    ugrequirement,
    pgrequirement,
    getallcoursesbyid,
    getallcoursesbyftehc,
    getallugbyid,
    getallugrequirement,
    getallpgbyid,
    getallpgrequirement,
    updateUserData,
    updateStudentdata,
    sendotpuniversity,
    setNewPassword,
    verifyOTP,
    Tutionfess,
    insertfees,
    updatetution,
    getallcoursesbyids,
    insertRequirement,
    updatecoursesandNew,
    universityFaq,
    univeristyUpdatelatest,
    insertArrayDescription,
    getallUniversityids,
    getownbyid,
    getallstaff,
    getTotalCoursesCount,
    getTotalUniversityCoursesCount

}