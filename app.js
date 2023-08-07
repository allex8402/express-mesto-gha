const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');

const { PORT = 3000 } = process.env;
const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/mestodb', {
  useNewUrlParser: true,
});

app.use(helmet());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'build')));

// временное решение авторизации
app.use((req, res, next) => {
  req.user = {
    _id: '64c7b9b08e4b58d6f9e23954', // Пример заглушки, в реальном приложении идентификатор пользователя будет определяться на основе аутентификации
  };
  next();
});

// Подключаем маршруты для пользователей и карточек
app.use('/users', require('./routes/users'));
app.use('/cards', require('./routes/cards'));

// Обработка ошибок
const httpStatus = require('./httpStatus');

app.use((req, res) => {
  res.status(httpStatus.HTTP_STATUS_NOT_FOUND).json({ message: 'Запрашиваемый ресурс не найден' });
});

// Запускаем сервер на заданном порту
app.listen(PORT, () => {
  console.log(`Приложение слушает порт ${PORT}`);
});
