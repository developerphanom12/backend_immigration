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

// Export the new function
module.exports = {
    insertApplicationDocuments,
    getDocumentByFileId, 
    addApplication,getApplication
};



