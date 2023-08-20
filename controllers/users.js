const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const ValidationError = require('../errors/ValidationError');
const ConflictError = require('../errors/ConflictError');
const UnauthorizedError = require('../errors/UnauthorizedError');
const NotFoundError = require('../errors/NotFoundError');

// Возвращает всех пользователей
const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.status(200).send(users))
    .catch((err) => next(err));
};

// возвращает данные пользователя
const getUserInfo = (req, res, next) => {
  const { _id } = req.user;

  User.findById(_id)
    .orFail()
    .then((user) => res.status(200).send(user))
    .catch((error) => {
      if (error.name === 'NotFoundError') {
        next(new NotFoundError('Запрашиваемый пользователь не найден'));
      } else {
        next(error);
      }
    });
};

// Возвращает пользователя по _id
const getUserById = (req, res, next) => {
  const { userId } = req.params;

  User.findById(userId)
    .orFail(new NotFoundError('Пользователь не найден'))
    .then((user) => res.status(200).send(user))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        next(new ValidationError('Переданы некорректные данные при получении пользователя'));
      } else if (error.name === 'NotFoundError') {
        next(new NotFoundError('Запрашиваемый пользователь не найден'));
      } else {
        next(error);
      }
    });
};

// Создаёт нового пользователя

const createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  // Хешируем пароль и создаем пользователя
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((user) => res.status(200).send({
      _id: user._id, name: user.name, about: user.about, avatar: user.avatar,
    }))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        throw new ValidationError('Переданы некорректные данные при создании пользователя');
      } else if (error.name === 'MongoError' && error.code === 11000) {
        // Обработка ошибки дубликата (код 11000)
        throw new ConflictError('Пользователь с таким email уже существует');
      } else {
        next(error);
      }
    });
};

// Oбновление профиля
const updateProfile = (req, res, next) => {
  const { name, about } = req.body;
  const userId = req.user._id;

  User.findByIdAndUpdate(userId, { name, about }, { new: true, runValidators: true })
    .orFail()
    .then((user) => res.status(200).send(user))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        next(new ValidationError('Переданы некорректные данные при обновлении пользователя'));
      } else if (error.name === 'NotFoundError') {
        next(new NotFoundError('Запрашиваемый пользователь не найден'));
      } else {
        next(error);
      }
    });
};

// Обновление аватара
const updateAvatar = (req, res, next) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .orFail()
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((error) => {
      if (error.name === 'ValidationError') {
        if (error.errors && error.errors.avatar) {
          next(new ValidationError('Некорректный URL для аватара'));
        } else {
          next(new ValidationError('Переданы некорректные данные при обновлении аватара'));
        }
      } else if (error.name === 'NotFoundError') {
        next(new NotFoundError('Запрашиваемый пользователь не найден'));
      } else {
        next(error);
      }
    });
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

          res.status(200).send({ token }); // отправляем токен в теле ответа
        });
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
