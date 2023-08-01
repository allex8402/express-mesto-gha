/* eslint-disable no-console */
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');

const { PORT = 3000 } = process.env;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
mongoose.connect('mongodb://127.0.0.1:27017/mestodb', {
  useNewUrlParser: true,

});

app.use('/users', require('./routes/users'));
app.use('/cards', require('./routes/cards'));

app.use(express.static(path.join(__dirname, 'build')));

// временное решение авторизации
app.use((req, res, next) => {
  req.user = {
    _id: '64c7b9b08e4b58d6f9e23954',
  };

  next();
});

// обработка ошибок
app.use((err, req, res) => {
  const ERROR_CODE = 400;

  if (err.name === 'ValidationError') {
    return res.status(ERROR_CODE).send({ message: 'Переданы некорректные данные' });
  }

  if (err.name === 'CastError') {
    return res.status(404).send({ message: 'Запрашиваемый ресурс не найден' });
  }

  return res.status(500).send({ message: 'Ошибка сервера' });
});

app.listen(PORT, () => {
  console.log(`Приложение слушает порт ${PORT}`);
});
