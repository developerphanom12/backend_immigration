const db = require('../config/configration')
const {logger} = require('../utils/logging')
const ExcelJS = require('exceljs');
const path =require('path')

// Define a function to add a new application //
function addApplication(courseData,userId,userRole) {
    return new Promise((resolve, reject) => {

        const insertSql = `INSERT INTO applications_table (user_id,course_id,university_id,student_firstname, student_lastname,
          student_email,student_whatsapp_number,student_passport_no,marital_status,previous_visa_refusals,ielts_reading,
          ielts_listening,ielts_writing,ielts_speaking,country_id,gender,role) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?)`;


        const values = [
            userId,
            courseData.course_id,
            courseData.university_id,
            courseData.student_firstname,
            courseData.student_lastname,
            courseData.student_email,  
            courseData.student_whatsapp_number,
            courseData.student_passport_no,
            courseData.marital_status,
            courseData.previous_visa_refusals,
            courseData.ielts_reading,
            courseData.ielts_listening,
            courseData.ielts_writing,
            courseData.ielts_speaking,
            courseData.country_id,
            courseData.gender,
            userRole
         ];
        db.query(insertSql, values, (error, result) => {
            if (error) {
                console.error('Error  course:', error);
                reject(error);
            } else {
                const courseId = result.insertId;
                resolve(courseId);
            }
        });
    });
}



function getApplication(applicationId) {
    return new Promise((resolve, reject) => {
      const selectSql = `SELECT * FROM applications_table WHERE application_id = ?`;
  
      db.query(selectSql, [applicationId], (error, result) => {
        if (error) {
          console.error('Error fetching application data:', error);
          reject(error);
        } else if (result.length === 0) {
          reject(new Error('Application not found'));
        } else {
          resolve(result[0]); //--**Assuming you want to return the first matching row**---//
        }
      });
    });
  }
// insertApplicationDocuments function
function insertApplicationDocuments(userId, fileData) {
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO documnets (application_id, file_type, file_path) VALUES (?, ?, ?)';
    const values = [userId, fileData.fileType, fileData.filePath];

    db.query(query, values, (error, result) => {
      if (error) {
        console.error('Database error:', error);
        reject(error);
      } else {
        const documentId = result.insertId;
        resolve(documentId);
      }
    });
  });
}



function updateApplicationDocument(userId, fileType, filePath) {
  return new Promise((resolve, reject) => {
    const query = 'UPDATE documnets SET file_path = ? WHERE application_id = ? AND file_type = ?';
    const values = [filePath, userId, fileType];

    db.query(query, values, (error, result) => {
      if (error) {
        console.error('Database error:', error);
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}

function getDocumentByFileId(userId, callback) {
  // Assuming you have a 'user_documents_files' table with a 'file_id' column
  const query = 'SELECT * FROM user_documents_files WHERE user_id = ?';
  const values = [userId];

  // Execute the database query
  db.query(query, values, (error, results) => {
    if (error) {
      return callback(error, null);
    }

    if (results.length === 0) {
      // No documents found for the give  n user
      return callback(null, null);
    }

    // Assuming you want to return the first document found
    const document = results[0];
    callback(null, document);
  });
}




// function getAllCoursesWithUserDaghfjgity() {
//   return new Promise((resolve, reject) => {
//     const query = `
//       SELECT
//         a.application_id,
//         a.firstname,
//         a.lastname,
//         a.email,
//         u.id AS user_id,
//         u.username,
//         au.id AS univertsity_id,
//         au.university_name,
//         udf.file_type,
//         udf.file_path
//       FROM applications a
//       INNER JOIN users3 u ON a.user_id = u.id
//       LEFT JOIN all_university au ON a.univertsity_id = au.id
//       LEFT JOIN user_documents_files udf ON a.user_id = udf.user_id 
//     `;

//     db.query(query, (error, results) => {
//       if (error) {
//         console.error('Error executing query:', error);
//         reject(error);
//         logger.error('Error getting all courses with user and university data:', error);
//       } else {
       
//         const data = results.map((row) => ({
//           application_id: row.application_id,
//           firstname: row.firstname,
//           lastname: row.lastname,
//           email: row.email,
//           user_id: {
//             id: row.user_id,
//             username: row.username,
//           },
//           university_id: {
//             university_name: row.university_name,
//           },
//           documents: [
//             {
//               file_type: row.file_type,
//               file_path: row.file_path,
//             }
//           ],
//         }));

//         // Group data by user to merge documents
//         const mergedData = data.reduce((acc, curr) => {
//           const existingUser = acc.find(user => user.application_id === curr.application_id);
//           if (existingUser) {
//             existingUser.documents.push(curr.documents[0]);
//           } else {
//             acc.push(curr);
//           }
//           return acc;
//         }, []);

//         resolve(mergedData);
//         logger.info('All courses with user and university data retrieved successfully');
//       }
//     });
//   });
async function getUserApplicationsByUserId(userId, studentName, applicationId) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT
        a.application_id,
        a.student_firstname,
        a.student_passport_no,
        a.application_status,
        a.created_at,
        u.id AS user_id,
        u.username,
        u.phone_number,
        au.university_id AS university_id,
        au.university_name,
        au.person_name,
        au.contact_number,
        d.file_type,
        d.file_path,
        c.course_id AS course_id,
        c.course_name,
        c.course_level
      FROM applications_table a
      INNER JOIN user01 u ON a.user_id = u.id
      LEFT JOIN university au ON a.university_id = au.university_id
      LEFT JOIN documnets d ON a.application_id = d.application_id
      LEFT JOIN courses c ON a.course_id = c.course_id
      WHERE u.id = ?
        ${studentName ? `AND a.student_firstname LIKE '%${studentName}%'` : ''}
        ${applicationId ? `AND a.application_id = ${applicationId}` : ''}
    `;

    db.query(query, [userId], (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        reject(error);
        logger.error('Error getting user applications by user ID:', error);
      }  else {
        // Create an object to store merged data by user_id
        const mergedDataByUserId = {};

        // Iterate through the database results
        results.forEach((row) => {
          const user_id = row.user_id;
          const application_id = row.application_id;

          if (!mergedDataByUserId[user_id]) {
            // Initialize the user's data if not already present
            mergedDataByUserId[user_id] = {
              applications: [],
            };
          }

          // Check if the application with the same ID already exists
          const existingApplication = mergedDataByUserId[user_id].applications.find(app => app.application_id === application_id);

          if (existingApplication) {
            // If the application already exists, add the document if it exists
            if (row.file_type !== null && row.file_path !== null) {
              const document = {
                file_type: row.file_type,
                file_path: row.file_path,
              };
              existingApplication.documents.push(document);
            }
          } else {
            // If the application doesn't exist, add it
            const newApplication = {
              application_id: application_id,
              student_firstname: row.student_firstname,
              student_passport_no: row.student_passport_no,
              application_status: row.application_status,
              created_at: row.created_at,
              university_id: {
                university_name: row.university_name,
                person_name: row.person_name,
                contact_number: row.contact_number,
              },
              user_id: {
                id: user_id,
                username: row.username,
                phone_number: row.phone_number,
              },
              course_id: {
                course_id: row.course_id,
                course_name: row.course_name,
                course_level: row.course_level,
              },
              documents: [],
            };

            // Add the document if it exists
            if (row.file_type !== null && row.file_path !== null) {
              const document = {
                file_type: row.file_type,
                file_path: row.file_path,
              };
              newApplication.documents.push(document);
            }

            mergedDataByUserId[user_id].applications.push(newApplication);
          }
        });

        // Convert the object values to an array to get the final result
        const mergedData = Object.values(mergedDataByUserId);

        resolve(mergedData);
        logger.info('All courses with user and university data retrieved successfully');
      }
    });
  });
}

async function getUserApplications(userId, studentName, applicationId) {
  // Your database query should be modified to include search conditions
  const query = `
    SELECT
      a.application_id,
      a.student_firstname,
      a.student_passport_no,
      a.application_status,
      a.created_at,
      u.id AS user_id,
      u.username,
      u.phone_number,
      au.university_id AS university_id,
      au.university_name,
      au.person_name,
      au.contact_number,
      d.file_type,
      d.file_path,
      c.course_id AS course_id,
      c.course_name,
      c.course_level
    FROM applications_table a
    INNER JOIN user01 u ON a.user_id = u.id
    LEFT JOIN university au ON a.university_id = au.university_id
    LEFT JOIN documnets d ON a.application_id = d.application_id
    LEFT JOIN courses c ON a.course_id = c.course_id
    WHERE u.id = ? 
      ${studentName ? `AND a.student_firstname = ?` : ''}
      ${applicationId ? `AND a.application_id = ?` : ''};`;

  const params = [userId];
  if (studentName) params.push(studentName);
  if (applicationId) params.push(applicationId);

  return new Promise((resolve, reject) => {
    db.query(query, params, (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        reject(error);
        logger.error('Error getting user applications:', error);
      } else {
        // Create an object to store merged data by user_id
        const mergedDataByUserId = {};

        // Iterate through the database results
        results.forEach((row) => {
          const user_id = row.user_id;
          const application_id = row.application_id;

          if (!mergedDataByUserId[user_id]) {
            // Initialize the user's data if not already present
            mergedDataByUserId[user_id] = {
            
              applications: [],
            };
          }

          // Check if the application with the same ID already exists
          const existingApplication = mergedDataByUserId[user_id].applications.find(app => app.application_id === application_id);

          if (existingApplication) {
            // If the application already exists, add the document if it exists
            if (row.file_type !== null && row.file_path !== null) {
              const document = {
                file_type: row.file_type,
                file_path: row.file_path,
              };
              existingApplication.documents.push(document);
            }
          } else {
            // If the application doesn't exist, add it
            const newApplication = {
              application_id: application_id,
              student_firstname: row.student_firstname,
              student_passport_no: row.student_passport_no,
              application_status:row.application_status,
              created_at:row.created_at,
              university_id: {
                university_name: row.university_name,
                person_name:row.person_name,
                contact_number:row.contact_number
              },
              user_id: {
                id: user_id,
                username: row.username,
                phone_number: row.phone_number,
              },
              course_id: {
                course_id: row.course_id,
                course_name: row.course_name,
                course_level: row.course_level,
              },
              documents: [],
            };

            // Add the document if it exists
            if (row.file_type !== null && row.file_path !== null) {
              const document = {
                file_type: row.file_type,
                file_path: row.file_path,
              };
              newApplication.documents.push(document);
            }

            mergedDataByUserId[user_id].applications.push(newApplication);
          }
        });

        // Convert the object values to an array to get the final result  //
        const mergedData = Object.values(mergedDataByUserId);

        resolve(mergedData);
        logger.info('All courses with user and university data retrieved successfully');
      }
    });
  });
}

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


async function getbyidstudent(applicationId) {
  const query = `
    SELECT
      a.application_id,
      a.student_firstname,
      a.student_passport_no,
      a.application_status,
      a.student_whatsapp_number,
      a.role,
      a.created_at,
      u.id AS user_id,
      u.username AS user_username,
      u.phone_number AS user_phone_number,
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
        WHEN cc.role = 'staff' THEN s.staff_name
        WHEN cc.role = 'student' THEN u.username
      END AS comment_username
    FROM applications_table a
    INNER JOIN students u ON a.user_id = u.id
    LEFT JOIN university au ON a.university_id = au.university_id
    LEFT JOIN documnets d ON a.application_id = d.application_id
    LEFT JOIN courses c ON a.course_id = c.course_id 
    LEFT JOIN comment_table cc ON cc.application_id = a.application_id
    LEFT JOIN staff s ON cc.role = 'staff' AND s.id = cc.user_id
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
              role:row.role,
              created_at: row.created_at,
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




async function getUserApplicationByPhoneNumber(userId, phoneNumber) {
  const query = `
    SELECT
      a.application_id,
      a.student_firstname,
      a.student_passport_no,
      a.application_status,
      a.student_whatsapp_number,
      a.created_at,
      u.id AS user_id,
      u.username,
      u.phone_number,
      au.university_id AS university_id,
      au.university_name,
      au.person_name,
      au.contact_number,
      c.course_id AS course_id,
      c.course_name,
      c.course_level
    FROM applications_table a
    INNER JOIN user01 u ON a.user_id = u.id
    LEFT JOIN university au ON a.university_id = au.university_id
    LEFT JOIN courses c ON a.course_id = c.course_id
    WHERE u.id = ? 
      AND a.student_whatsapp_number = ?;`;

  const params = [userId, phoneNumber];

  return new Promise((resolve, reject) => {
    db.query(query, params, (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        reject(error);
        logger.error('Error getting user application by phone number:', error);
      } else {
        const mergedDataByUserId = {};

        results.forEach((row) => {
          const user_id = row.user_id;
          const application_id = row.application_id;

          if (!mergedDataByUserId[user_id]) {
            mergedDataByUserId[user_id] = {
              applications: [],
            };
          }

          const existingApplication = mergedDataByUserId[user_id].applications.find(app => app.application_id === application_id);

          if (existingApplication) {
          } else {
            const newApplication = {
              application_id: application_id,
              student_firstname: row.student_firstname,
              student_passport_no: row.student_passport_no,
              student_whatsapp_number: row.student_whatsapp_number,
              application_status: row.application_status,
              created_at: row.created_at,
              university_id: {
                university_name: row.university_name,
                person_name: row.person_name,
                contact_number: row.contact_number
              },
              user_id: {
                id: user_id,
                username: row.username,
                phone_number: row.phone_number,
              },
              course_id: {
                course_id: row.course_id,
                course_name: row.course_name,
                course_level: row.course_level,
              },
            };

            mergedDataByUserId[user_id].applications.push(newApplication);
          }
        });

        // Convert the object values to an array to get the final result
        const mergedData = Object.values(mergedDataByUserId);

        resolve(mergedData);
        logger.info('All courses with user and university data retrieved successfully');
      }
    });
  });
}

async function getAllUserApplications(userId) {
  // Modify your database query to get all user applications for a specific user
  const query = `
    SELECT
      a.application_id,
      a.student_firstname,
      a.student_passport_no,
      a.application_status,
      a.student_whatsapp_number,
      a.student_email,
      a.created_at,
      u.id AS user_id,
      u.username,
      u.phone_number,
      au.university_id AS university_id,
      au.university_name,
      au.person_name,
      au.contact_number,
      d.file_type,
      d.file_path,
      c.course_id AS course_id,
      c.course_name,
      c.course_level
    FROM applications_table a
    INNER JOIN user01 u ON a.user_id = u.id
    LEFT JOIN university au ON a.university_id = au.university_id
    LEFT JOIN documnets d ON a.application_id = d.application_id
    LEFT JOIN courses c ON a.course_id = c.course_id
    WHERE u.id = ?;`;

  const params = [userId];

  return new Promise((resolve, reject) => {
    db.query(query, params, (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        reject(error);
        logger.error('Error getting user application by phone number:', error);
      } else {
        const mergedDataByUserId = {};

        results.forEach((row) => {
          const user_id = row.user_id;
          const application_id = row.application_id;

          if (!mergedDataByUserId[user_id]) {
            mergedDataByUserId[user_id] = {
              applications: [],
            };
          }

          const existingApplication = mergedDataByUserId[user_id].applications.find(app => app.application_id === application_id);

          if (existingApplication) {
          } else {
            const newApplication = {
              application_id: application_id,
              student_firstname: row.student_firstname,
              student_passport_no: row.student_passport_no,
              student_email:row.student_email,
              student_whatsapp_number: row.student_whatsapp_number,
              application_status: row.application_status,
              created_at: row.created_at,
              university_id: {
                university_name: row.university_name,
                person_name: row.person_name,
                contact_number: row.contact_number
              },
              user_id: {
                id: user_id,
                username: row.username,
                phone_number: row.phone_number,
              },
              course_id: {
                course_id: row.course_id,
                course_name: row.course_name,
                course_level: row.course_level,
              },
            };

            mergedDataByUserId[user_id].applications.push(newApplication);
          }
        });

        // Convert the object values to an array to get the final result
        const mergedData = Object.values(mergedDataByUserId);

        resolve(mergedData);
        logger.info('All courses with user and university data retrieved successfully');
      }
    });
  });
}



async function getUserApplicationsByName(userId, studentName) {
  // Modify your database query to search for applications by student name
  const query = `
    SELECT
      a.application_id,
      a.student_firstname,
      a.student_passport_no,
      a.application_status,
      a.student_whatsapp_number,
      a.created_at,
      u.id AS user_id,
      u.username,
      u.phone_number,
      au.university_id AS university_id,
      au.university_name,
      au.person_name,
      au.contact_number,
      d.file_type,
      d.file_path,
      c.course_id AS course_id,
      c.course_name,
      c.course_level
    FROM applications_table a
    INNER JOIN user01 u ON a.user_id = u.id
    LEFT JOIN university au ON a.university_id = au.university_id
    LEFT JOIN documnets d ON a.application_id = d.application_id
    LEFT JOIN courses c ON a.course_id = c.course_id
    WHERE u.id = ? 
      AND a.student_firstname = ?;`;

  const params = [userId, studentName];

 
  return new Promise((resolve, reject) => {
    db.query(query, params, (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        reject(error);
        logger.error('Error getting user application by phone number:', error);
      } else {
        const mergedDataByUserId = {};

        results.forEach((row) => {
          const user_id = row.user_id;
          const application_id = row.application_id;

          if (!mergedDataByUserId[user_id]) {
            mergedDataByUserId[user_id] = {
              applications: [],
            };
          }

          const existingApplication = mergedDataByUserId[user_id].applications.find(app => app.application_id === application_id);

          if (existingApplication) {
          } else {
            const newApplication = {
              application_id: application_id,
              student_firstname: row.student_firstname,
              student_passport_no: row.student_passport_no,
              student_whatsapp_number: row.student_whatsapp_number,
              application_status: row.application_status,
              created_at: row.created_at,
              university_id: {
                university_name: row.university_name,
                person_name: row.person_name,
                contact_number: row.contact_number
              },
              user_id: {
                id: user_id,
                username: row.username,
                phone_number: row.phone_number,
              },
              course_id: {
                course_id: row.course_id,
                course_name: row.course_name,
                course_level: row.course_level,
              },
            };

            mergedDataByUserId[user_id].applications.push(newApplication);
          }
        });

        // Convert the object values to an array to get the final result
        const mergedData = Object.values(mergedDataByUserId);

        resolve(mergedData);
        logger.info('All courses with user and university data retrieved successfully');
      }
    });
  });
}


async function getUserApplicationByPhoneNumber11(userId, application) {
  const query = `
    SELECT
      a.application_id,
      a.student_firstname,
      a.student_passport_no,
      a.application_status,
      a.student_whatsapp_number,
      a.created_at,
      u.id AS user_id,
      u.username,
      u.phone_number,
      au.university_id AS university_id,
      au.university_name,
      au.person_name,
      au.contact_number,
      c.course_id AS course_id,
      c.course_name,
      c.course_level
    FROM applications_table a
    INNER JOIN user01 u ON a.user_id = u.id
    LEFT JOIN university au ON a.university_id = au.university_id
    LEFT JOIN courses c ON a.course_id = c.course_id
    WHERE u.id = ? 
      AND a.application_status = ?;`;

  const params = [userId, application];

  return new Promise((resolve, reject) => {
    db.query(query, params, (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        reject(error);
        logger.error('Error getting user application by phone number:', error);
      } else {
        // Create an object to store merged data by user_id
        const mergedDataByUserId = {};

        // Iterate through the database results
        results.forEach((row) => {
          const user_id = row.user_id;
          const application_id = row.application_id;

          if (!mergedDataByUserId[user_id]) {
            // Initialize the user's data if not already present
            mergedDataByUserId[user_id] = {
              applications: [],
            };
          }

          // Check if the application with the same ID already exists
          const existingApplication = mergedDataByUserId[user_id].applications.find(app => app.application_id === application_id);

          if (existingApplication) {
            // If the application already exists, do nothing (no document handling)
          } else {
            // If the application doesn't exist, add it without documents
            const newApplication = {
              application_id: application_id,
              student_firstname: row.student_firstname,
              student_passport_no: row.student_passport_no,
              student_whatsapp_number: row.student_whatsapp_number,
              application_status: row.application_status,
              created_at: row.created_at,
              university_id: {
                university_name: row.university_name,
                person_name: row.person_name,
                contact_number: row.contact_number
              },
              user_id: {
                id: user_id,
                username: row.username,
                phone_number: row.phone_number,
              },
              course_id: {
                course_id: row.course_id,
                course_name: row.course_name,
                course_level: row.course_level,
              },
            };

            mergedDataByUserId[user_id].applications.push(newApplication);
          }
        });

        // Convert the object values to an array to get the final result
        const mergedData = Object.values(mergedDataByUserId);

        resolve(mergedData);
        logger.info('All courses with user and university data retrieved successfully');
      }
    });
  });
}


async function getallapplication() {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT
        a.application_id,
        a.student_firstname,
        a.student_passport_no,
        a.application_status,
        a.student_email,
        a.created_at,
        u.id AS user_id,
        u.username,
        u.phone_number,
        au.university_id AS university_id,
        au.university_name,
        au.person_name,
        au.contact_number,
        c.course_id AS course_id,
        c.course_name,
        c.course_level,
        d.file_type,
        d.file_path
      FROM applications_table a
      INNER JOIN user01 u ON a.user_id = u.id
      LEFT JOIN documnets d ON a.application_id = d.application_id
      LEFT JOIN university au ON a.university_id = au.university_id
      LEFT JOIN courses c ON a.course_id = c.course_id
    `;

    db.query(query, (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        reject(error);
        logger.error('Error getting all applications:', error); // Log the error
      } else {
        const allApplications = [];

        results.forEach((row) => {
          // Check if the application already exists in the array
          const existingApplication = allApplications.find((app) => app.application_id === row.application_id);

          if (existingApplication) {
            // If the application already exists, add the document if it exists
            if (row.file_type !== null && row.file_path !== null) {
              const document = {
                file_type: row.file_type,
                file_path: row.file_path,
              };
              existingApplication.documents.push(document);
            }
          } else {
            // If the application doesn't exist, add it
            const application = {
              application_id: row.application_id,
              student_firstname: row.student_firstname,
              student_passport_no: row.student_passport_no,
              application_status: row.application_status,
              student_email:row.student_email,
              created_at: row.created_at,
              university_id: {
                university_name: row.university_name,
                person_name: row.person_name,
                contact_number: row.contact_number,
              },
              user_id: {
                id: row.user_id,
                username: row.username,
                phone_number: row.phone_number,
              },
              course_id: {
                course_id: row.course_id,
                course_name: row.course_name,
                course_level: row.course_level,
              },
              documents: [],
            };

            // Add the document if it exists
            if (row.file_type !== null && row.file_path !== null) {
              const document = {
                file_type: row.file_type,
                file_path: row.file_path,
              };
              application.documents.push(document);
            }

            allApplications.push(application);
          }
        });

        resolve(allApplications);
        logger.info('All applications retrieved successfully');
      }
    });
  });
}

const getApplicationCountsByUserId = (userId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT
        u.id AS user_id,
        u.username,
        u.role,
        IFNULL(COUNT(CASE WHEN a.application_status = 'rejected' THEN 1 ELSE NULL END), 0) AS rejectedCount,
        IFNULL(COUNT(CASE WHEN a.application_status = 'pending' THEN 1 ELSE NULL END), 0) AS pendingCount,
        IFNULL(COUNT(CASE WHEN a.application_status = 'approved' THEN 1 ELSE NULL END), 0) AS approvedCount
      FROM
        students u
        LEFT JOIN applications_table a ON u.id = a.user_id
      WHERE
        u.id = ?
      GROUP BY
        u.id, u.username;
    `;

    db.query(query, [userId], (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        reject(error);
        logger.error('Error getting application counts by user ID:', error);
        return;
      }

      if (results.length === 0) {
        // Handle the case when the user does not exist
        resolve([]);
      } else {
        const userCounts = results.map((row) => ({
          userId: row.user_id,
          username: row.username,
          role:row.role,
          rejectedCount: row.rejectedCount,
          pendingCount: row.pendingCount,
          approvedCount: row.approvedCount,
        }));
        resolve(userCounts);
      }
      logger.info('Application counts retrieved successfully');
    });
  });
};


const getusercount = (userId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT
        u.id AS user_id,
        u.username,
        u.role,
        IFNULL(COUNT(CASE WHEN a.application_status = 'rejected' THEN 1 ELSE NULL END), 0) AS rejectedCount,
        IFNULL(COUNT(CASE WHEN a.application_status = 'pending' THEN 1 ELSE NULL END), 0) AS pendingCount,
        IFNULL(COUNT(CASE WHEN a.application_status = 'approved' THEN 1 ELSE NULL END), 0) AS approvedCount
      FROM
        user01 u
        LEFT JOIN applications_table a ON u.id = a.user_id
      WHERE
        u.id = ?
      GROUP BY
        u.id, u.username;
    `;

    db.query(query, [userId], (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        reject(error);
        logger.error('Error getting application counts by user ID:', error);
        return;
      }

      if (results.length === 0) {
        // Handle the case when the user does not exist
        resolve([]);
      } else {
        const userCounts = results.map((row) => ({
          userId: row.user_id,
          username: row.username,
          role:row.role,
          rejectedCount: row.rejectedCount,
          pendingCount: row.pendingCount,
          approvedCount: row.approvedCount,
        }));
        resolve(userCounts);
      }
      logger.info('Application counts retrieved successfully');
    });
  });
};

const getApplicationCountsByUserId1 = () => {
  return new Promise((resolve, reject) => {
    const query = `
    SELECT
    u.id AS user_id,
    u.username,
    IFNULL(COUNT(CASE WHEN applications_table.application_status = 'rejected' THEN 1 ELSE NULL END), 0) AS rejectedCount,
    IFNULL(COUNT(CASE WHEN applications_table.application_status = 'pending' THEN 1 ELSE NULL END), 0) AS pendingCount,
    IFNULL(COUNT(CASE WHEN applications_table.application_status = 'approved' THEN 1 ELSE NULL END), 0) AS approvedCount
  FROM
    applications_table
  RIGHT JOIN
    user01 u ON u.id = applications_table.user_id
  WHERE
    u.is_deleted = 0  
  GROUP BY
    u.id, u.username;
  
    `;

    db.query(query, (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        reject(error);
        logger.error('Error getting user application counts:', error);
        return;
      }

      const userCounts = results.map((row) => ({
        // userId: row.user_id,
        username: row.username,
        rejectedCount: row.rejectedCount,
        pendingCount: row.pendingCount,
        approvedCount: row.approvedCount,
      }));

      if (userCounts.length === 0) {
        resolve([
          {
            username: 'username',
            rejectedCount: 0,
            pendingCount: 0,
            approvedCount: 0,
          },
        ]);
      } else {
        resolve(userCounts);
      }
      logger.info('User application counts retrieved successfully');
    });
  });
};

const staffcount = () => {
  return new Promise((resolve, reject) => {
    const query = `
    SELECT
    u.id AS user_id,
    u.staff_name,
    IFNULL(COUNT(CASE WHEN applications_table.application_status = 'rejected' THEN 1 ELSE NULL END), 0) AS rejectedCount,
    IFNULL(COUNT(CASE WHEN applications_table.application_status = 'pending' THEN 1 ELSE NULL END), 0) AS pendingCount,
    IFNULL(COUNT(CASE WHEN applications_table.application_status = 'approved' THEN 1 ELSE NULL END), 0) AS approvedCount
  FROM
    applications_table
  RIGHT JOIN
    staff u ON u.id = applications_table.user_id
  WHERE
    u.is_deleted = 0  
  GROUP BY
    u.id, u.staff_name;
  
    `;

    db.query(query, (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        reject(error);
        logger.error('Error getting user application counts:', error);
        return;
      }

      const userCounts = results.map((row) => ({
        // userId: row.user_id,
        username: row.staff_name,
        rejectedCount: row.rejectedCount,
        pendingCount: row.pendingCount,
        approvedCount: row.approvedCount,
      }));

      if (userCounts.length === 0) {
        resolve([
          {
            username: 'username',
            rejectedCount: 0,
            pendingCount: 0,
            approvedCount: 0,
          },
        ]);
      } else {
        resolve(userCounts);
      }
      logger.info('User application counts retrieved successfully');
    });
  });
};


async function notification(userId) {
  const query = `
    SELECT
      a.application_id,
      a.comment,
      u.id AS user_id,
      u.username
    FROM applications_table a
    INNER JOIN user01 u ON a.user_id = u.id
    WHERE u.id = ?`;

  const params = [userId];

    return new Promise((resolve, reject) => {
      db.query(query,params, (error, results) => {
      if (error) {
          console.error('Error executing query:', error);
          reject(error);
          logger.error('Error getting all applications:', error); 
      } else {
          const applications = results.map((row) => ({
              application_id: row.application_id,
              comment: row.comment,
              user_id: row.user_id,
              username:row.username
              
          }));
          resolve(applications);
          logger.info('All applications retrieved successfully');
      }
  });
});
};


const excelFileDirectory = path.join(__dirname, 'applications'); // Replace with your preferred directory path

async function getExcelData(userId) {
  try {
    const query = `
    SELECT DISTINCT
    a.application_id,
    a.student_firstname,
    a.student_lastname,
    a.student_passport_no,
    a.application_status,
    u.username,
    c.course_name
  FROM applications_table a
  INNER JOIN user01 u ON a.user_id = u.id
  LEFT JOIN university au ON a.university_id = au.university_id
  LEFT JOIN documnets d ON a.application_id = d.application_id
  LEFT JOIN courses c ON a.course_id = c.course_id
  WHERE u.id = ?;
  
  `;
    const queryPromise = new Promise((resolve, reject) => {
      db.query(query, userId,(error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });

    // Execute the database query using await
    const results = await queryPromise;

    // Process the results and populate the Excel sheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('UserApplications');

    // Define the headers for the Excel sheet
    worksheet.columns = [
      { header: 'Application ID', key: 'application_id' },
      { header: 'Student Name', key: 'student_name' }, // Combine first and last name
      { header: 'Passport Number', key: 'student_passport_no' },
      { header: 'Course Name', key: 'course_name' },
      { header: 'University Name', key: 'university_name' },
      { header: 'Application Status', key: 'application_status' },

      // Add more headers as needed
    ];

    // Process the database results and populate the Excel sheet
    results.forEach((row) => {
      // Create rows based on database results
      const rowData = {
        application_id: row.application_id,
        student_name: `${row.student_firstname} ${row.student_lastname}`,
        student_passport_no: row.student_passport_no,
        course_name : row.course_name,
        university_name: row.university_name,
        application_status:row.application_status
        // Populate other fields accordingly
      };
      worksheet.addRow(rowData);
    });

    // Generate and save the Excel file
    const excelFileName = `${new Date().getTime()}.xlsx`;
    const excelFilePath = path.join(excelFileDirectory, excelFileName);

    await workbook.xlsx.writeFile(excelFilePath);

    console.log(`Excel file saved as ${excelFilePath}`);
    return excelFilePath;
  } catch (error) {
    console.error('Error executing or saving Excel file:', error);
    throw error;
  }
}
async function getExcelDataForAllApplications(userRole) {
  try {
    const query = `
    SELECT DISTINCT
      a.application_id,
      a.student_firstname,
      a.student_lastname,
      a.application_status,
      u.username,
      c.course_name
    FROM applications_table a
    INNER JOIN user01 u ON a.user_id = u.id
    LEFT JOIN university au ON a.university_id = au.university_id
    LEFT JOIN documnets d ON a.application_id = d.application_id
    LEFT JOIN courses c ON a.course_id = c.course_id
  
    ;`;

  // Create a Promise for the database query
  const queryPromise = new Promise((resolve, reject) => {
    db.query(query,userRole,(error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });

  // Execute the database query using await
  const results = await queryPromise;
    // Process the results and populate the Excel sheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('AllApplications');

    // Define the headers for the Excel sheet
    worksheet.columns = [
      { header: 'Application ID', key: 'application_id' },
      { header: 'Student Name', key: 'student_name' }, // Combine first and last name
      { header: 'Passport Number', key: 'student_passport_no' },
      { header: 'Course Name', key: 'course_name' },
      { header: 'University Name', key: 'university_name' },
      { header: 'Application Status', key: 'application_status' },

      // Add more headers as needed
    ];

    // Process the database results and populate the Excel sheet
    results.forEach((row) => {
      // Create rows based on database results
      const rowData = {
        application_id: row.application_id,
        student_name: `${row.student_firstname} ${row.student_lastname}`,
        student_passport_no: row.student_passport_no,
        course_name: row.course_name,
        university_name: row.university_name,
        application_status: row.application_status
        // Populate other fields accordingly
      };
      worksheet.addRow(rowData);
    });

    // Generate and save the Excel file
    const excelFileName = `all_applications_${new Date().getTime()}.xlsx`;
    const excelFilePath = path.join(excelFileDirectory, excelFileName);

    await workbook.xlsx.writeFile(excelFilePath);

    console.log(`Excel file saved as ${excelFilePath}`);
    return excelFilePath;
  } catch (error) {
    console.error('Error executing or saving Excel file:', error);
    throw error;
  }
}





// checkin application_table user_id is match with table of studentts tbale id

async function studenteceldata(userId) {
  try {
    const query = `
    SELECT DISTINCT
    a.application_id,
    a.student_firstname,
    a.student_lastname,
    a.student_passport_no,
    a.application_status,
    a.role,
    u.username,
    c.course_name
  FROM applications_table a
  INNER JOIN students u ON a.user_id = u.id
  LEFT JOIN university au ON a.university_id = au.university_id
  LEFT JOIN documnets d ON a.application_id = d.application_id
  LEFT JOIN courses c ON a.course_id = c.course_id
  WHERE u.id = ?`;
const queryPromise = new Promise((resolve, reject) => {
  db.query(query,userId,(error, results) => {
    if (error) {
      reject(error);
    } else {
      resolve(results);
    }
  });
});

const results = await queryPromise;
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('AllApplications');

  // Define the headers for the Excel sheet
  worksheet.columns = [
    { header: 'Application ID', key: 'application_id' },
    { header: 'Student Name', key: 'student_name' }, // Combine first and last name
    { header: 'Passport Number', key: 'student_passport_no' },
    { header: 'Course Name', key: 'course_name' },
    { header: 'University Name', key: 'university_name' },
    { header: 'Application Status', key: 'application_status' },
    { header: 'Position', key: 'role' },


    // Add more headers as needed
  ];

  // Process the database results and populate the Excel sheet
  results.forEach((row) => {
    // Create rows based on database results
    const rowData = {
      application_id: row.application_id,
      student_name: `${row.student_firstname} ${row.student_lastname}`,
      student_passport_no: row.student_passport_no,
      course_name: row.course_name,
      university_name: row.university_name,
      application_status: row.application_status,
      role:row.role
      // Populate other fields accordingly
    };
    worksheet.addRow(rowData);
  });

  // Generate and save the Excel file
  const excelFileName = `all_applications_${new Date().getTime()}.xlsx`;
  const excelFilePath = path.join(excelFileDirectory, excelFileName);

  await workbook.xlsx.writeFile(excelFilePath);

  console.log(`Excel file saved as ${excelFilePath}`);
  return excelFilePath;
} catch (error) {
  console.error('Error executing or saving Excel file:', error);
  throw error;
}
}






// // Function to fetch and add comments for each application
// function fetchCommentsForApplications(applications, resolve, reject) {
//   const applicationIds = applications.map((app) => app.application_id);

//   // Check if the applicationIds array is empty, and handle it
//   if (applicationIds.length === 0) {
//     resolve(applications); // No need to fetch comments if there are no application IDs
//     return;
//   }

//   // Query to fetch comments for the specified application IDs
//   const commentsQuery = `
//     SELECT
//       application_id,
//       comment_text
//     FROM comment_table
//     WHERE application_id IN (?)`;

//   const commentParams = [applicationIds];

//   db.query(commentsQuery, commentParams, (error, commentResults) => {
//     if (error) {
//       console.error('Error fetching comments:', error);
//       reject(error);
//     } else {
//       // Add comments to the respective applications
//       applications.forEach((app) => {
//         app.comments = commentResults.filter(
//           (comment) => comment.application_id === app.application_id
//         );
//       });

//       resolve(applications);
//     }
//   });
// }
async function getcomment(applicationId, comment_text, userId, userRole,select_type) {
  return new Promise((resolve, reject) => {
    const insertSql =
      'INSERT INTO comment_table (user_id, application_id, comment_text, role,select_type) VALUES (?, ?, ?, ?,?)';
    const params = [applicationId, comment_text, userId, userRole,select_type];

    db.query(insertSql, params, (error, results) => {
      if (error) {
        console.error('Error creating comment:', error);
        reject(error); // Reject the promise with the error
      } else {
        resolve(results); // Resolve the promise with the results
      }
    });
  });
}

const countadmin= (userId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT
        application_status,
        COUNT(*) AS count
      FROM
        applications_table
    
      GROUP BY
        application_status;
    `;  

    db.query(query, [userId], (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        reject(error);
        logger.error('Error getting application counts by user ID:', error);
      } else {
        const counts = {};

        results.forEach((row) => {
          const applicationStatus = row.application_status;
          const count = row.count;
          counts[applicationStatus] = count;
        });

        resolve(counts);
        logger.info('Application counts retrieved successfully');
      }
    });
  });
};



const countuser = (userId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT
        application_status,
        COUNT(*) AS count
      FROM
        applications_table
      WHERE
        user_id = ? 
      GROUP BY
        application_status;
    `;  

    db.query(query, [userId], (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        reject(error);
        logger.error('Error getting application counts by user ID:', error);
      } else {
        const counts = {};

        results.forEach((row) => {
          const applicationStatus = row.application_status;
          const count = row.count;
          counts[applicationStatus] = count;
        });

        resolve(counts);
        logger.info('Application counts retrieved successfully');
      }
    });
  });
};

async function getApplicationsByAdminCountry(adminCountryId) {
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
      WHERE a.country_id = ?; 
    `;

  
    return new Promise((resolve, reject) => {
      db.query(query, adminCountryId, (error, results) => {
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
  


async function getallstudent(userId) {
  // Modify your database query to get all user applications for a specific user
  const query = `
    SELECT
      a.application_id,
      a.student_firstname,
      a.student_passport_no,
      a.application_status,
      a.student_whatsapp_number,
      a.student_email,
      a.created_at,
      u.id AS user_id,
      u.username,
      u.phone_number,
      au.university_id AS university_id,
      au.university_name,
      au.person_name,
      au.contact_number,
      d.file_type,
      d.file_path,
      c.course_id AS course_id,
      c.course_name,
      c.course_level
    FROM applications_table a
    INNER JOIN students u ON a.user_id = u.id
    LEFT JOIN university au ON a.university_id = au.university_id
    LEFT JOIN documnets d ON a.application_id = d.application_id
    LEFT JOIN courses c ON a.course_id = c.course_id
    WHERE u.id = ?;`;

  const params = [userId];

  return new Promise((resolve, reject) => {
    db.query(query, params, (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        reject(error);
        logger.error('Error getting user application by phone number:', error);
      } else {
        const mergedDataByUserId = {};

        results.forEach((row) => {
          const user_id = row.user_id;
          const application_id = row.application_id;

          if (!mergedDataByUserId[user_id]) {
            mergedDataByUserId[user_id] = {
              applications: [],
            };
          }

          const existingApplication = mergedDataByUserId[user_id].applications.find(app => app.application_id === application_id);

          if (existingApplication) {
          } else {
            const newApplication = {
              application_id: application_id,
              student_firstname: row.student_firstname,
              student_passport_no: row.student_passport_no,
              student_email:row.student_email,
              student_whatsapp_number: row.student_whatsapp_number,
              application_status: row.application_status,
              created_at: row.created_at,
              university_id: {
                university_name: row.university_name,
                person_name: row.person_name,
                contact_number: row.contact_number
              },
              user_id: {
                id: user_id,
                username: row.username,
                phone_number: row.phone_number,
              },
              course_id: {
                course_id: row.course_id,
                course_name: row.course_name,
                course_level: row.course_level,
              },
            };

            mergedDataByUserId[user_id].applications.push(newApplication);
          }
        });

        // Convert the object values to an array to get the final result
        const mergedData = Object.values(mergedDataByUserId);

        resolve(mergedData);
        logger.info('All courses with user and university data retrieved successfully');
      }
    });
  });
}


module.exports = {
    insertApplicationDocuments,
    getDocumentByFileId, 
    addApplication,
    getApplication,
    getUserApplicationsByUserId,
    getUserApplications,
    getUserApplicationByPhoneNumber,
    getAllUserApplications,
    getUserApplicationsByName,
    getUserApplicationByPhoneNumber11,
    getallapplication,
    getApplicationCountsByUserId,getApplicationCountsByUserId1,
    notification,
    getExcelData,
    getExcelDataForAllApplications,
    getbyid,
    getcomment,
    countadmin,
    countuser,
    updateApplicationDocument,
    getApplicationsByAdminCountry,
    getallstudent,
    getusercount,
    getbyidstudent,
    studenteceldata,
    staffcount
};


