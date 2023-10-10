const db = require('../config/configration')
const {logger} = require('../utils/logging')


// Define a function to add a new application //
function addApplication(courseData,userId) {
    return new Promise((resolve, reject) => {

        const insertSql = `INSERT INTO applications (user_id,course_id,univertsity_id,firstname, lastname, email) 
        VALUES (?, ?, ?, ?, ?,?)`;


        const values = [
            userId,
            courseData.course_id,
            courseData.univertsity_id,
            courseData.firstname,
            courseData.lastname,
            courseData.email,  
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
      const selectSql = `SELECT * FROM applications WHERE application_id = ?`;
  
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
    const query = 'INSERT INTO user_documents_files (user_id, file_type, file_path) VALUES (?, ?, ?)';
    const values = [userId, fileData.fileType, fileData.filePath];

    db.query(query, values, callback);
}

function getDocumentByFileId(userId, callback) {
    const query = 'SELECT * FROM user_documents_files WHERE user_id = ?';
    const values = [userId];

    console.log('Query:', query);
    console.log('Values:', values);
    db.query(query, values, callback);
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
// }


function getAllCoursesWithUserDaghfjgity() {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT
        a.application_id,
        a.firstname,
        a.lastname,
        a.email,
        u.id AS user_id,
        u.username,
        au.id AS univertsity_id,
        au.university_name,
        udf.file_type,
        udf.file_path,
        c.course_id AS course_id,
        c.course_name,
        c.course_level
      FROM applications a
      INNER JOIN users3 u ON a.user_id = u.id
      LEFT JOIN all_university au ON a.univertsity_id = au.id
      LEFT JOIN user_documents_files udf ON a.user_id = udf.user_id
      LEFT JOIN cour1 c ON a.course_id = c.course_id
    `;

    db.query(query, (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        reject(error);
        logger.error('Error getting all courses with user and university data:', error);
      } else {
        // Create an object to store merged data by user_id
        const mergedDataByUserId = {};

        // Define a function to remove duplicate documents
        function removeDuplicateDocuments(documents) {
          const uniqueDocuments = [];
          const seenDocuments = new Set();

          for (const document of documents) {
            const documentKey = `${document.file_type}_${document.file_path}`;

            if (!seenDocuments.has(documentKey)) {
              uniqueDocuments.push(document);
              seenDocuments.add(documentKey);
            }
          }

          return uniqueDocuments;
        }

        // Iterate through the database results
        results.forEach((row) => {
          const user_id = row.user_id;
          if (!mergedDataByUserId[user_id]) {
            // Initialize the user's data if not already present
            mergedDataByUserId[user_id] = {
              application_id: row.application_id,
              firstname: row.firstname,
              lastname: row.lastname,
              email: row.email,
              user_id: {
                id: user_id,
                username: row.username,
              },
              university_id: {
                university_name: row.university_name,
              },
              course_id: {
                course_id: row.course_id,
                course_name: row.course_name,
                course_level: row.course_level,
              },
              documents: [],
            };
          }

          // Add the document 
          if (row.file_type !== null && row.file_path !== null) {
            mergedDataByUserId[user_id].documents.push({
              file_type: row.file_type,
              file_path: row.file_path,
            });
          }
        });

        // Remove duplicate documents for each user
        for (const user_id in mergedDataByUserId) {
          mergedDataByUserId[user_id].documents = removeDuplicateDocuments(mergedDataByUserId[user_id].documents);
        }

        // Convert the object values to an array to 
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
    getAllCoursesWithUserDaghfjgity
};



