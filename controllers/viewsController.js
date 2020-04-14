const Course = require('../models/courseModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');

exports.getSignupForm = (req, res) => {
  res.status(200).render('signup', {
    title: 'Rejestracja'
  });
};

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Logowanie'
  });
};

exports.getAdmin = catchAsync(async (req, res) => {
  res.status(200).render('admin', {
    title: 'Administrator'
  });
});

exports.getOverview = catchAsync(async (req, res, next) => {
  const courses = await Course.find();

  if (!courses) {
    return next(new AppError('Nie znaleziono kursów.', 404));
  }

  res.status(200).render('overview', {
    title: 'Kursy',
    courses
  });
});

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Twoje konto'
  });
};

exports.getUsers = catchAsync(async (req, res) => {
  const features = new APIFeatures(User.find(), req.query).sort().paginate();
  const users = await features.query;

  res.status(200).render('users', {
    title: 'Użytkownicy',
    users
  });
});

exports.getUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);

  res.status(200).render('user', {
    title: `${user.name} ${user.surname}`,
    user
  });
});

exports.getCourses = catchAsync(async (req, res) => {
  const courses = await Course.find();

  res.status(200).render('courses', {
    title: 'Kursy',
    courses
  });
});

exports.getCourse = catchAsync(async (req, res) => {
  const course = await Course.findById(req.params.id);

  res.status(200).render('course', {
    title: `${course.name}`,
    course
  });
});
