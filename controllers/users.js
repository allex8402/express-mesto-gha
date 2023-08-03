const mongoose = require('mongoose');
const User = require('../models/user');

// возвращение всех пользователей
const getUsers = (req, res) => {
  User.find({})
    .then((users) => {
      res.status(200).send(users);
    })
    .catch(() => {
      res.status(500).send({ message: 'Ошибка при получении пользователя' });
    });
};

// возвращение пользователей по _id
const getUserById = (req, res) => {
  const { userId } = req.params;
  User.findById(new mongoose.Types.ObjectId(userId))
    .then((user) => {
      if (!user) {
        res.status(404).send({ message: 'Запрашиваемый пользователь не найден' });
      } else {
        res.status(200).send(user);
      }
    })
    .catch(() => {
      res.status(500).send({ message: 'Ошибка при получении пользователя' });
    });
};
// создание пользователя
const createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then((user) => {
      res.status(201).send(user);
    })
    .catch(() => {
      res.status(400).send({ message: 'Переданы некорректные данные при создании пользователя' });
    });
};

// обновить профиль
const updateProfile = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, about }, { new: true })
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: 'Запрашиваемый пользователь не найден' });
      }

      // Проверяем, совпадают ли введенные данные с обновленными данными пользователя
      if (user.name === name && user.about === about) {
        return res.status(200).send({ message: 'Данные совпадают', user });
      }

      // Если данные обновились, то возвращаем успешный ответ
      return res.status(200).send(user);
    })
    .catch(next); // Передаем ошибку централизованному обработчику
};
const updateAvatar = (req, res) => {
  const { avatar } = req.body;
  if (!avatar) {
    return res.status(400).send({ message: 'Переданы некорректные данные' });
  }

  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true })
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: 'Запрашиваемый пользователь не найден' });
      }

      return res.status(200).send(user);
    })
    .catch(() => res.status(500).send({ message: 'Ошибка при обновлении аватара' }));

  return null;
};
module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateProfile,
  updateAvatar,
};
