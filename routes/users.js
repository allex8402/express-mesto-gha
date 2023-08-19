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
    .uri()
    .error(new Error('Некорректный URL для аватара'))
    .required(),
});

usersRouter.get('/', getUsers);

usersRouter.get('/me', getUserInfo);

usersRouter.get('/:userId', celebrate({
  [Segments.PARAMS]: Joi.object().keys({
    userId: Joi.string().hex().length(24).required(),
  }),
}), getUserById);

usersRouter.patch('/me', celebrate({
  [Segments.BODY]: updateProfileSchema,
}), updateProfile);

usersRouter.patch('/me/avatar', celebrate({
  [Segments.BODY]: updateAvatarSchema,
}), updateAvatar);

module.exports = usersRouter;
