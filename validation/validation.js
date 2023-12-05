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
  tution: Joi.object({
    hostel_meals: Joi.number().precision(2).positive().required(),
    tuition_fees: Joi.number().precision(2).positive().required(),
    transportation: Joi.number().precision(2).positive().required(),
    phone_internet: Joi.number().precision(2).positive().required(),
    total: Joi.number().precision(2).positive().required(),
  }).required(),
  requirements: Joi.array().items(Joi.string()).required(),

  
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

const expensesSchema = Joi.object({
  course_id: Joi.number().integer().positive().required(),
  hostel_meals: Joi.number().precision(2).positive().required(),
  tuition_fees: Joi.number().precision(2).positive().required(),
  transportation: Joi.number().precision(2).positive().required(),
  phone_internet: Joi.number().precision(2).positive().required(),
  total: Joi.number().precision(2).positive().required(),
});


const validatetutionfess = (req, res, next) => {
  const { error } = expensesSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};



const registrationSchema = Joi.object({
  university_name: Joi.string().required(),
  ambassador_name: Joi.string().required(),
  phone_number: Joi.string().required(),
  email: Joi.string().email().required(),
  username: Joi.string().required(),
  password: Joi.string().required(),
  address: Joi.object({
    street_address: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    country: Joi.string().required(),
    postal_code: Joi.string().required(),
  }).required(),
  year_established: Joi.number().required(),
  type: Joi.string().valid('private', 'government').required(),
});

// Middleware function for validating the request body
const validateUniversityRegisastration = (req, res, next) => {
  const { error } = registrationSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }


  // Validate the presence of university_image and registration_certificate files
  if (!req.files || !req.files['university_image'] || !req.files['registration_certificate']) {
    return res.status(400).json({
      message: 'University image and registration certificate are required.',
    });
  }

  next();
};



// staff_name,
// password,
// staff_email,
// staff_phone_number,
// country_id,


const FAQschema = Joi.object({
  question: Joi.string().required(),
  answer: Joi.string().required(),
});


// Middleware for request body validation
const FAqschema = (req, res, next) => {

  const { error } = FAQschema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};

const addstaff = Joi.object({
  staff_name: Joi.string().required(),
  password : Joi.string().required(),
  staff_email: Joi.string().email().required(),
  staff_phone_number : Joi.number().integer().required(),
  country_id : Joi.number().integer().required()
})


const addstaffrequired =(req,res,next) => {
  const {error} = addstaff.validate(req.body)

  if(error){
    return res.status(400).json({error: error.details[0].message});
  }
  next();
}
// const coursesadd = Joi.object({
//   course_name: Joi.string().required(),
//   department: Joi.string().required(),
//   subject: Joi.string().required(),
//   tuition_fee: Joi.string().email().required(),
//   duration_years: Joi.string().required(),
//   course_type: Joi.string().required(),
//   tution: Joi.object({
//     hostel_meals: Joi.string().required(),
//     tuition_fees: Joi.string().required(),
//     transportation: Joi.string().required(),
//     country: Joi.string().required(),
//     postal_code: Joi.string().required(),
//   }).required(),
//   year_established: Joi.number().required(),
//   type: Joi.string().valid('private', 'government').required(),
// });


// // Middleware for request body validation
// const CoursesAdd = (req, res, next) => {

//   const { error } = coursesadd.validate(req.body);

//   if (error) {
//     return res.status(400).json({ error: error.details[0].message });
//   }

//   next();
// };




const newupdateUniversity = Joi.object({
  heading: Joi.string().required(),
  descpription: Joi.string().required(),
});


// Middleware for request body validation
const NewUpdateuniversity = (req, res, next) => {

  const { error } = newupdateUniversity.validate(req.body);

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
  ugschema,
  validatetutionfess,
  validateUniversityRegisastration,
  FAqschema,
  NewUpdateuniversity,
  addstaffrequired
};