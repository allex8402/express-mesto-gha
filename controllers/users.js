const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const ValidationError = require('../errors/UnauthorizedError');
const ConflictError = require('../errors/ConflictError');
const UnauthorizedError = require('../errors/UnauthorizedError');
const NotFoundError = require('../errors/NotFoundError');

const { ObjectId } = mongoose.Types;

// Возвращает всех пользователей

const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.status(200).send(users))
    .catch((err) => next(err));
};
// Возвращает пользователя по _id

const getUserById = (req, res) => {
  const { userId } = req.params;

  if (!ObjectId.isValid(userId)) {
    throw new ValidationError('Переданы некорректные данные');
  }

  User.findById(userId)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Запрашиваемый пользователь не найден');
      }
      res.status(200).send({ data: user });
    });
};

// Создаёт нового пользователя
const createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  User.findOne({ email }) // Проверяем наличие пользователя с таким email
    .then((existingUser) => {
      if (existingUser) {
        throw new ConflictError('Пользователь с таким email уже существует');
      }

      // Хешируем пароль и создаем пользователя
      return bcrypt.hash(password, 10);
    })
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((user) => res.status(200).send({
      _id: user._id, name: user.name, about: user.about, avatar: user.avatar,
    }))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        throw new ValidationError('Переданы некорректные данные при создании пользователя');
      }
      next(error); // Пропускаем ошибку дальше для обработки в middleware
    });
};

// Oбновление профиля
const updateProfile = (req, res, next) => {
  const { name, about } = req.body;
  const userId = req.user._id;

  User.findByIdAndUpdate(userId, { name, about }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Запрашиваемый пользователь не найден');
      }

      return res.status(200).send(user);
    })
    .catch((error) => {
      if (error.name === 'ValidationError') {
        throw new ValidationError('Переданы некорректные данные при обновлении пользователя');
      }
      next(error);
    });
};

const updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  const userId = req.user._id;

  if (!avatar) {
    throw new ValidationError('Переданы некорректные данные');
  }

  User.findByIdAndUpdate(userId, { avatar }, { new: true })
    .then((user) => {
      if (user.avatar === avatar) {
        return res.status(200).send(user);
      }

      return res.status(201).send('Аватар успешно обновлен', user);
    })
    .catch(next);
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new UnauthorizedError('Неправильные почта или пароль');
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            throw new UnauthorizedError('Неправильные почта или пароль');
          }
          const token = jwt.sign({ _id: user._id }, 'some-sekret-key', { expiresIn: '7d' });

          res.status(200).send({ token }); // Здесь отправляем токен в теле ответа
        });
    })
    .catch(next);
};

const getUserInfo = (req, res, next) => {
  const { _id } = req.user;
  User.find({ _id })
    .then((user) => {
      if (!user) {
        next(new NotFoundError('Пользователь не найден'));
      }
      return res.send(...user);
    })
    .catch(next);
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateProfile,
  updateAvatar,
  login,
  getUserInfo,
};
