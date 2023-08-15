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
    .orFail(new NotFoundError('Пользователи не найдены.'))
    .then((users) => res.send(users.map(
      (user) => ({
        _id: user._id, name: user.name, about: user.about, avatar: user.avatar,
      }),
    )))
    .catch(next);
};

// Возвращает пользователя по _id
// const getUserById = (req, res, next) => {
//   const { userId } = req.params;
//   if (!ObjectId.isValid(userId)) {
//     throw new ValidationError('Переданы некорректные данные');
//   }
//   User.findById(userId)
//     .then((user) => {
//       if (!user) {
//         throw new NotFoundError('Запрашиваемый пользователь не найден');
//       }
//       res.status(200).send({ data: user });
//     })
//     .catch(next);
// };
const getUserById = (req, res, next) => {
  const { userId } = req.params;

  if (!ObjectId.isValid(userId)) {
    throw new ValidationError('Некорректный формат ID пользователя');
  }

  User.findById(userId)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Запрашиваемый пользователь не найден');
      }
      res.status(200).send({ data: user });
    })
    .catch(next);
};
// Создаёт нового пользователя
const createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((user) => res.status(200).send({
      _id: user._id, name: user.name, about: user.about, avatar: user.avatar, email: user.email,
    }))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        throw new ValidationError('Переданы некорректные данные при создании пользователя');
      }
      if (error.name === 'MongoError' && error.code === 11000) {
        throw new ConflictError('Пользователь с таким email уже существует');
      }
      next(error);
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
        return Promise.reject(new Error('Неправильные почта или пароль'));
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            // хеши не совпали — отклоняем промис
            return Promise.reject(new Error('Неправильные почта или пароль'));
          }

          // аутентификация успешна
          return user;
        });
    })
    .then((user) => {
      // создадим токен
      const token = jwt.sign({ _id: user._id }, 'super-strong-secret', { expiresIn: '7d' });
      // вернём токен
      res.send({ token });
    })
    .catch(() => {
      throw new UnauthorizedError('ошибка');
    })
    .catch(next);
};

const getUserInfo = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => res.send({
      _id: user._id, name: user.name, about: user.about, avatar: user.avatar,
    }))
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new ValidationError('Переданы некорректные данные _id пользователя.');
      }
      next(err);
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
