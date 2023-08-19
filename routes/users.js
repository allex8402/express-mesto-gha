const express = require('express');
const { celebrate, Joi, Segments } = require('celebrate');

const {
  getUsers, getUserById, updateProfile, updateAvatar, getUserInfo,
} = require('../controllers/users');

const usersRouter = express.Router();

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(30).required(),
  about: Joi.string().min(2).max(30).required(),
});
const updateAvatarSchema = Joi.object({
  avatar: Joi.string()
    .pattern(/http[s]?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/),
});

usersRouter.get('/', getUsers);

usersRouter.get('/me', getUserInfo);

usersRouter.get('/:userId', celebrate({
  [Segments.PARAMS]: Joi.object().keys({
    userId: Joi.string().hex().required(),
  }),
}), getUserById);

usersRouter.patch('/me', celebrate({
  [Segments.BODY]: updateProfileSchema,
}), updateProfile);

usersRouter.patch('/me/avatar', celebrate({
  [Segments.BODY]: updateAvatarSchema,
}), updateAvatar);

module.exports = usersRouter;
