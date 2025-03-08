const express = require('express');
const morgan = require('morgan');

const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const path = require('path');
const globalErrorHandler = require('./controllers/errorController');

const AppError = require('./utils/AppError');

const articleRouter = require('./routes/articleRoutes');
const userRouter = require('./routes/userRoutes');
const stockRouter = require('./routes/stockRoutes');
const bookRouter = require('./routes/bookRoutes');

const app = express();

app.use(
  cors({
    credentials: true,
    origin: 'https://frontend-five-mauve.vercel.app',
    methods: ["GET", "POST", "PUT", "DELETE"]
  })
);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());

// -> Middleware to sanitize the incoming data and prevent NoSQL Injections
app.use(mongoSanitize());

// -> Middleware to prevent XSS Attacks
app.use(xss());

app.use(cookieParser());

// Define routes
app.use('/api/v1/articles', articleRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/stocks', stockRouter);
app.use('/api/v1/books', bookRouter);
app.use('/images', express.static(path.join(__dirname, 'public', 'articleImages')));

// Add a default route for `/`
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to the Backend Server!',
  });
});

const axios = require('axios');

app.use('/api/frontend', async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `https://frontend-five-mauve.vercel.app${req.originalUrl.replace('/api/frontend', '')}`,
      data: req.body,
      headers: req.headers,
    });

    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ 
      error: 'Proxy Error', 
      details: error.message 
    });
  }
});

// Handle all other undefined routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} ! Please try a different route.`, 404));
});

// Global error handler
app.use(globalErrorHandler);

module.exports = app;
