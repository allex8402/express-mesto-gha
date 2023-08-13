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
    .then((users) => {
      res.status(200).send(users);
    })
    .catch(next); // Используем next() для передачи ошибки в обработчик ошибок
};

// Возвращает пользователя по _id
const getUserById = (req, res, next) => {
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
    })
    .catch(next);
};

// Создаёт нового пользователя
const createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  const userId = req.user._id;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((user) => res.status(201).send({
      _id: userId, name: user.name, about: user.about, avatar: user.avatar, email: user.email,
    }))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        throw new ValidationError('Переданы некорректные данные при создании пользователя');
      }
      if (error.code === 11000) {
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

// const login = (req, res) => {
//   const { email, password } = req.body;
//   return User.findUserByCredentials(email, password)
//     .then((user) => {
//       const token = jwt.sign({ _id: user._id }, 'some-sekret-key', { expiresIn: '7d' });
//       res.cookie('jwt', token, {
//         maxAge: 604800,
//         httpOnly: true,
//         sameSite: true,
//         secure: true,
//       });
//       res.send({ token });
//     })
//     .catch(() => {
//       throw new UnauthorizedError({ message: 'Неправильные почта или пароль' });
//     });
// };
const login = (req, res, next) => {
  const { email, password } = req.body;

  User.findOne({ email })
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

          // Вы можете записать JWT в куку или отправить его в теле ответа
          // В данном примере, мы используем куку
          res.cookie('jwt', token, {
            maxAge: 604800,
            httpOnly: true,
            sameSite: true,
            secure: true,
          });

          res.send({ token });
        });
    })
    .catch(next);
};

const getUserInfo = (req, res, next) => {
  const userId = req.user._id;

  User.findById(userId)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Запрашиваемый пользователь не найден');
      }
      return res.status(200).send(user);
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
