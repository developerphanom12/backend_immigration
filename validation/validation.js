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
  course_level: Joi.string().valid('undergraduate', 'postgraduate', 'doctorate').required(),

});


// Middleware for request body validation
const coursesValid = (req, res, next) => {

  const { error } = cour1Schema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};



module.exports = {
  createUserSchema,
  validateRegistrationData,
  universityValid,
  coursesValid,
 // forgetPasswordSchema
};