const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const viewRouter = require('./routes/viewRoutes');
const subcjectRouter = require('./routes/subjectRoutes');
const userRouter = require('./routes/userRoutes');
const courseRouter = require('./routes/courseRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'js')));
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: 'Zbyt dużo żądań do serwera z tego adresu IP'
});

app.use('/', limiter);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());

app.use('/', viewRouter);
app.use('/api/subjects', subcjectRouter);
app.use('/api/users', userRouter);
app.use('/api/courses', courseRouter);

app.disable('etag');

app.all('*', (req, res, next) => {
  next(new AppError(`Nie znaleziono ${req.originalUrl} na tym serwerze`, 404));
});

module.exports = app;
