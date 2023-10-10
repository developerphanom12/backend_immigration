const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');


const sendEmail = async (to, subject, body) => {
  try {
    
    const transporter = nodemailer.createTransport({
      service: 'Gmail', 
      auth: {
        user: 'ashimavineet2729@gmail.com', 
        pass: 'Avi@152727', 
      },
    });

    const emailTemplatePath = path.join(__dirname,"email-otp.html");
    const emailTemplate = fs.readFileSync(emailTemplatePath, 'utf-8');
    const templateWithData = emailTemplate.replace('{{body}}',body)
    // Configure the email message//
    const mailOptions = {
      from: 'ashimavineet2729@gmail.com', 
      to,
      subject,
      html: templateWithData,
    };
    console.log(mailOptions, "jfghbgfhbgfhbg")

    //--------Send the email---//
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
    // user.otp = true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('An error occurred while sending email');
  }
};

module.exports = {
  sendEmail,
};

