const countryservice = require('../controller/countryController')
const bcrypt = require('bcrypt')
const saltRounds = 10;

const addcountry = async (req, res) => {
    const courseData = req.body;
  
    try {
      const applicationId = await countryservice.addcountry(courseData);
      console.log('Country added with ID:', applicationId);
  
      res.status(200).json({
        message: 'Country added successfully',
        status: 200,
        data: {
          id: applicationId 
        }
      });
    } catch (error) {
      if (error) {
        res.status(401).json({ error: error.message });
      } else {
        console.error('Error adding Country:', error);
        res.status(500).json({ error: 'Failed to add Country' });
      }
    }
  };




  const addstaff = async (req, res) => {
    const { staff_name, password, staff_email, staff_phone_number ,country_id} = req.body;

    try {  
        const staffdata = await countryservice.addstaff({
            staff_name,
            password,
            staff_email,
            staff_phone_number,
            country_id,
        });


        res.status(201).json({
            message: "staff add succesfully",
            data: staffdata
        });
    } catch (error) {
        if (error) {
            res.status(401).json({ error: error.message });
          } else {
            console.error('Error adding Country:', error);
            res.status(500).json({ error: 'Failed to add Country' });
          }
    }
};


const stafflogin = async (req, res) => {
    const { staff_name, password } = req.body;
try{
    countryservice.stafflogin(staff_name, password, (err, result) => {
      if (err) {
        console.error('Error:', err);
        return res.status(500).json({ error: 'An internal server error occurred' });
      }

      if (result.error) {
        return res.status(401).json({ error: result.error });
      }

    
      res.status(201).json({
        message: "staff login succesffully",
        data: result.data,
        token: result.token,
      });
   
     
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ error: 'An internal server error occurred' });
  }
};

const fetchallcountry = async (req, res) => {

try {
  const countries = await countryservice.getAllCountries(); 

  res.status(200).json({ status:200 ,message: 'fetch all country ', data:countries });
} catch (error) {
  res.status(500).json({ error: 'An error occurred while fetching countries' });
}
};
  module.exports = {
    addcountry,
    addstaff,
    stafflogin,
    fetchallcountry
  }