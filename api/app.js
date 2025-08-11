import express from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoute from './routes/auth.route.js';
import testRoute from './routes/test.route.js';
import userRoute from './routes/user.route.js';
import listingRoute from './routes/listing.route.js';
import cloudinaryRoute from './routes/cloudinary.route.js';
import blogRoute from './routes/blog.route.js';
import agentRoute from './routes/agent.route.js';
import requestRoute from './routes/request.route.js';
import { verifyToken } from './middleware/verifyToken.js';

const app = express();

config();

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
  : [];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/agent', agentRoute);
app.use('/api/auth/', authRoute);
app.use('/api/test/', testRoute);
app.use('/api/user/', userRoute);
app.use('/api/listing/', listingRoute);
app.use('/api/cloudinary/', cloudinaryRoute);
app.use('/api/blog/', blogRoute);
app.use('/api/request/', requestRoute);
// Test server
app.get('/test', (req, res) => {
  res.json({ message: 'hello world' });
});

// Add a debug endpoint to test authentication
app.get('/api/debug/auth', verifyToken, (req, res) => {
  res.json({
    message: 'Authentication working!',
    userId: req.userId,
    userRole: req.userRole,
    cookies: req.cookies,
    headers: {
      authorization: req.headers.authorization,
      origin: req.headers.origin,
      'user-agent': req.headers['user-agent'],
    },
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(err.status || 500)
    .json({ error: err.message || 'Internal Server Error' });
});

// Start server
const PORT = process.env.PORT || 8800;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}!`);
});
