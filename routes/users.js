const express = require('express');
const {
  getUsers, getUserById, updateProfile, updateAvatar, getUserInfo,
} = require('../controllers/users');

const usersRouter = express.Router();

usersRouter.get('/', getUsers);
usersRouter.get('/:userId', getUserById);
usersRouter.patch('/me', updateProfile);
usersRouter.patch('/me/avatar', updateAvatar);
usersRouter.get('/me', getUserInfo);

module.exports = usersRouter;
