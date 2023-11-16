const  Joi = require('joi');

const createUserSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
  firstname: Joi.string().required(),
  lastname: Joi.string().required(),  
  email: Joi.string().email().required(),
  phone_number: Joi.string().required(),
  address: Joi.object({
    street_address: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    postal_code: Joi.string().required(),
  }).required(),
});



// Middleware for request body validation
const validateRegistrationData = (req, res, next) => {

  const { error } = createUserSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};



const UniversitySchema = Joi.object({
  university_name: Joi.string().required(),
  course_type: Joi.string().valid('graduation', 'postgraduation').required(),
  founded_year: Joi.number().integer().required(),
  contact_number:Joi.number().integer().required(),
  person_name:  Joi.string().required(),
  
});





// Middleware for request body validation
const universityValid = (req, res, next) => {

  const { error } = UniversitySchema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};


// Define a Joi schema for the cour1 table
const cour1Schema = Joi.object({
  university_id: Joi.number().integer().required(),
  course_name: Joi.string().max(255).required(),
  course_level: Joi.string().valid('POSTGRADUATION', 'GRADUATION').required(),

});


// Middleware for request body validation
const coursesValid = (req, res, next) => {

  const { error } = cour1Schema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};


const coursesnewschema = Joi.object({
  course_name: Joi.string().required(),
  department: Joi.string().required(),
  subject: Joi.string().required(),
  tuition_fee: Joi.number().precision(2).required(),
  duration_years: Joi.number().integer().required(),
  course_type: Joi.string().valid('Graduation', 'Postgraduation', 'PhD', 'Diploma'),
  university_id: Joi.number().integer(),
  
});


// Middleware for request body validation
const coursenewschemma = (req, res, next) => {

  const { error } = coursesnewschema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};


const uggschema = Joi.object({
  english_requirement: Joi.string(),
  academic_requirement: Joi.string().required(),
  offer_timeline: Joi.string().required(),
  Credibility  : Joi.string().valid('Yes', 'No').required(),
  Finance: Joi.string().valid('Yes', 'No').required(),
  Discount:Joi.string().required(),
  
});


// Middleware for request body validation
const ugschema = (req, res, next) => {

  const { error } = uggschema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};

const applicationSchema = Joi.object({
  course_id: Joi.number().integer().required(),
  university_id: Joi.number().integer().required(),
  student_firstname: Joi.string().max(255).required(),
  student_lastname: Joi.string().max(255).required(),
  student_email: Joi.string().email().max(255).required(),
  student_whatsapp_number: Joi.string().max(20).required(),
  student_passport_no: Joi.string().max(20).required(),
  marital_status: Joi.string().valid('married', 'unmarried').required(),
  previous_visa_refusals: Joi.string().valid('yes', 'no').required(),
  ielts_reading: Joi.number().precision(2).min(0).max(9.99).required(),
  ielts_listening: Joi.number().precision(2).min(0).max(9.99).required(),
  ielts_writing: Joi.number().precision(2).min(0).max(9.99).required(),
  ielts_speaking: Joi.number().precision(2).min(0).max(9.99).required(),
 
});   

const validateApplicationData = (req, res, next) => {
  const { error } = applicationSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};


module.exports = {
  createUserSchema,
  validateRegistrationData,
  universityValid,
  coursesValid,validateApplicationData,
  coursenewschemma,
  ugschema
};