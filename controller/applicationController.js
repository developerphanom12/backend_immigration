const db = require('../config/configration')
const {logger} = require('../utils/logging')


// Define a function to add a new application //
function addApplication(courseData,userId) {
    return new Promise((resolve, reject) => {

        const insertSql = `INSERT INTO applications_table (user_id,course_id,university_id,student_firstname, student_lastname,
          student_email,student_whatsapp_number,student_passport_no,marital_status,previous_visa_refusals,ielts_reading,
          ielts_listening,ielts_writing,ielts_speaking) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;


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


function insertApplicationDocuments(userId, fileData, callback) {
  const query = 'INSERT INTO documnets (application_id, file_type, file_path) VALUES (?, ?, ?)';
  const values = [userId, fileData.fileType, fileData.filePath];

  db.query(query, values, (error, result) => {
      if (error) {
          console.error('Database error:', error);
          callback(error);
      } else {
          const documentId = result.insertId;
          callback(null, documentId);
      }
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
      // No documents found for the given user
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


async function getUserApplicationByPhoneNumber(userId, phoneNumber) {
  // Modify your database query to search for a specific user application by phone number
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
      AND a.student_whatsapp_number = ?;`;

  const params = [userId, phoneNumber];

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
              student_whatsapp_number:row.student_whatsapp_number,
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

async function getAllUserApplications(userId) {
  // Modify your database query to get all user applications for a specific user
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
    WHERE u.id = ?;`;

  const params = [userId];

  return new Promise((resolve, reject) => {
    db.query(query, params, (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        reject(error);
        logger.error('Error getting all user applications:', error);
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
              student_whatsapp_number:row.student_whatsapp_number,
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
        logger.error('Error getting all user applications:', error);
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
              student_whatsapp_number: row.student_whatsapp_number,
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
              student_whatsapp_number:row.student_whatsapp_number,
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
async function getallapplication(userId, userRole) {
  // Modify your database query to get all user applications or all applications for an admin
  let query = `
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
  `;

  if (userRole === 'admin') {
    
  } else {
    
    query += ' WHERE u.id = ?';
  }

  const params = (userRole === 'admin') ? [] : [userId];

  return new Promise((resolve, reject) => {
    db.query(query, params, (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        reject(error);
        logger.error('Error getting user applications:', error);
      } else {
        // Format the retrieved data as needed (similar to your previous code)
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
            if (row.file_type !== null && row.file_path !== null) {
              const document = {
                file_type: row.file_type,
                file_path: row.file_path,
              };
              existingApplication.documents.push(document);
            }
          } else {
            const newApplication = {
              application_id: application_id,
              student_firstname: row.student_firstname,
              student_passport_no: row.student_passport_no,
              application_status: row.application_status,
              student_whatsapp_number: row.student_whatsapp_number,
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

        const mergedData = Object.values(mergedDataByUserId);

        resolve(mergedData);
        logger.info('User applications or all applications retrieved successfully');
      }
    });
  });
}

const getApplicationCountsByUserId = (userId) => {
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

const getApplicationCountsByUserId1= (userId) => {
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
    getApplicationCountsByUserId,getApplicationCountsByUserId1,notification
};


