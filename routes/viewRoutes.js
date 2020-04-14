const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/signup', authController.isLoggedIn, viewsController.getSignupForm);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/', authController.isLoggedIn, viewsController.getOverview);
router.get('/me', authController.isLoggedIn, viewsController.getAccount);

router.get(
  '/admin',
  authController.isLoggedIn,
  authController.restrictToView('admin'),
  viewsController.getAdmin
);

router.get(
  '/users',
  authController.isLoggedIn,
  authController.restrictToView('admin'),
  viewsController.getUsers
);

router.get(
  '/users/:id',
  authController.isLoggedIn,
  authController.restrictToView('admin'),
  viewsController.getUser
);

router.get(
  '/courses',
  authController.isLoggedIn,
  authController.restrictToView('admin'),
  viewsController.getCourses
);

router.get(
  '/courses/:id',
  authController.isLoggedIn,
  authController.restrictToView('admin'),
  viewsController.getCourse
);

module.exports = router;
