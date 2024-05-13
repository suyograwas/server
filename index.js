const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');

const cloudinaryConnect = require('./config/cloudinary');
const dbConnect = require('./config/database');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const profileRoutes = require('./routes/profileRoutes');
const paymentRoutes = require('./routes/paymentsRoutes');
const courseRoutes = require('./routes/courseRoutes');

dbConnect();
cloudinaryConnect();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true
  })
);
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp'
  })
);

app.use('/api/v1/auth', userRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/course', courseRoutes);
app.use('/api/v1/payment', paymentRoutes);

app.get('/', (req, res) => {
  return res.json({
    status: 'success',
    message: 'Your server is running......'
  });
});

const port = process.env.PORT || 4000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
