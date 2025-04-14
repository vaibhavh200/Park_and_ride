const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// Protected routes - Admin only
router.use(authenticate);
router.use(authorizeAdmin);

router.route('/')
  .get(usersController.getUsers)
  .post(usersController.createUser);

router.route('/:id')
  .get(usersController.getUser)
  .put(usersController.updateUser)
  .delete(usersController.deleteUser);

module.exports = router;
