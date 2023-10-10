
const express = require('express');
const app = express();
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const universityRoutes = require('./routes/universityRoutes')
const application = require('./routes/applicationRoutes')
const path = require('path')
const cors = require('cors')


dotenv.config();


// MW to parse JSON for my opinion request to body
app.use(express.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors({origin: true})) // -----> cors



//******************user routes*******************//

       app.use('/api/users', userRoutes);


//******************university routes********** *//
       app.use('/api/university',universityRoutes)
       

//*******************application routes********** //

      app.use('/api/application', application)

const port = process.env.PORT 
const ipAddress = '127.0.0.1'; // Bind to the loopback interface (localhost)

       //****dirname for image upload set in there ****//
app.use('/application', express.static(path.join(__dirname, 'application')))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
app.listen(port, () => {
       console.log(`Server is running on http://${ipAddress}:${port}`);
});





















