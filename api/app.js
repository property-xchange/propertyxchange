import express from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoute from './routes/auth.route.js';
import testRoute from './routes/test.route.js';
import userRoute from './routes/user.route.js';
import listingRoute from './routes/listing.route.js';

const app = express();

config();

const allowedOrigins = [
  'https://propertyxchange.com.ng',
  'https://www.propertyxchange.com.ng',
  'http://localhost:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth/', authRoute);
app.use('/api/test/', testRoute);
app.use('/api/user/', userRoute);
app.use('/api/listing/', listingRoute);

// Test server
app.get('/test', (req, res) => {
  res.json({ message: 'hello world' });
});

app.listen(8800, () => {
  console.log('Server is running at 8800!');
});
