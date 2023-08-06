const mongoose = require('mongoose');

const User = require('../models/user');

const { ObjectId } = mongoose.Types;
const {
  HTTP_STATUS_OK,
  HTTP_STATUS_CREATED,
  HTTP_STATUS_NOT_FOUND,
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_SERVER_ERROR,
} = require('../httpStatus');

// Возвращает всех пользователей
const getUsers = (req, res) => {
  User.find({})
    .then((users) => {
      res.status(HTTP_STATUS_OK).send(users);
    })
    .catch(() => {
      res.status(HTTP_STATUS_SERVER_ERROR).send({ message: 'Ошибка при получении пользователей' });
    });
};

// Возвращает пользователя по _id
const getUserById = (req, res) => {
  const { userId } = req.params;
  if (!ObjectId.isValid(userId)) {
    res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Некорректный формат идентификатора пользователя' });
    return;
  }
  User.findById(userId)
    .then((user) => {
      if (!user) {
        return res.status(HTTP_STATUS_NOT_FOUND).send({ message: 'Запрашиваемый пользователь не найден' });
      }
      return res.status(HTTP_STATUS_OK).send(user);
    })
    .catch(() => {
      res.status(HTTP_STATUS_SERVER_ERROR).send({ message: 'Ошибка при получении пользователя' });
    });
};

// Создаёт пользователя
const createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then((user) => {
      res.status(HTTP_STATUS_CREATED).send(user);
    })
    .catch((error) => {
      if (error.name === 'ValidationError') {
        return res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные при создании пользователя' });
      }
      return res.status(HTTP_STATUS_SERVER_ERROR).send({ message: 'Ошибка сервера' });
    });
};
// Oбновление профиля
const updateProfile = (req, res) => {
  const { name, about } = req.body;
  const userId = req.user._id;
  User.findByIdAndUpdate(userId, { name, about }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        return res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Запрашиваемый пользователь не найден' });
      }
      if (user.name === name && user.about === about) {
        return res.status(HTTP_STATUS_OK).send(user);
      }

      return res.status(HTTP_STATUS_OK).send(user);
    })
    .catch((error) => {
      if (error.name === 'ValidationError') {
        return res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные при обновлении пользователя' });
      }
      return res.status(HTTP_STATUS_SERVER_ERROR).send({ message: 'Ошибка сервера' });
    });
};

// Обновляет аватар

const updateAvatar = (req, res) => {
  const { avatar } = req.body;
  const userId = req.user._id;

  if (!avatar) {
    return res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные' });
  }

  User.findByIdAndUpdate(userId, { avatar }, { new: true })
    .then((user) => {
      if (user.avatar === avatar) {
        return res.status(HTTP_STATUS_OK).send(user);
      }

      return res.status(HTTP_STATUS_OK).send({ message: 'Аватар успешно обновлен', user });
    })
    .catch(() => {
      res.status(HTTP_STATUS_SERVER_ERROR).send({ message: 'Ошибка сервера' });
    });
  return null;
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateProfile,
  updateAvatar,
};
