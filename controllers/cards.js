const Card = require('../models/card');
const {
  HTTP_STATUS_OK,
  HTTP_STATUS_CREATED,
  HTTP_STATUS_NOT_FOUND,
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_SERVER_ERROR,
} = require('../httpStatus');

// Получение всех карточек
const getCards = (req, res) => {
  Card.find({})
    .then((cards) => {
      res.status(HTTP_STATUS_OK).send(cards);
    })
    .catch(() => {
      res.status(HTTP_STATUS_SERVER_ERROR).send({ message: 'Ошибка при получении карточек' });
    });
};

// Создание карточки
const createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  Card.create({ name, link, owner })
    .then((card) => {
      res.status(HTTP_STATUS_CREATED).send(card);
    })
    .catch((error) => {
      if (error.name === 'ValidationError') {
        res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные при создании карточки' });
      } else {
        res.status(HTTP_STATUS_SERVER_ERROR).send({ message: 'Ошибка при создании карточки' });
      }
    });
};

// Удаление карточки
const deleteCard = (req, res) => {
  const { cardId } = req.params;
  Card.findByIdAndRemove(cardId)
    .then((card) => {
      if (!card) {
        res.status(HTTP_STATUS_NOT_FOUND).send({ message: 'Карточка не найдена' });
      } else {
        res.status(HTTP_STATUS_OK).send(card);
      }
    })
    .catch((error) => {
      if (error.name === 'CastError') {
        res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Запрашиваемый ресурс не найден' });
      } else {
        res.status(HTTP_STATUS_SERVER_ERROR).send({ message: 'Ошибка при удалении карточки' });
      }
    });
};

// Поставить лайк
const likeCard = (req, res) => {
  const { cardId } = req.params;
  const userId = req.user._id;

  Card.findByIdAndUpdate(cardId, { $addToSet: { likes: userId } }, { new: true })
    .then((card) => {
      if (!card) {
        return res.status(HTTP_STATUS_NOT_FOUND).send({ message: 'Карточка не найдена' });
      }
      return res.status(HTTP_STATUS_OK).send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(HTTP_STATUS_NOT_FOUND).send({ message: 'Карточка не найдена' });
      }
      return res.status(HTTP_STATUS_SERVER_ERROR).send({ message: 'Ошибка сервера' });
    });
};

// убрать лайк
const dislikeCard = (req, res) => {
  const { cardId } = req.params;
  const userId = req.user._id;

  Card.findByIdAndUpdate(cardId, { $pull: { likes: userId } }, { new: true })
    .then((card) => {
      if (!card) {
        return res.status(HTTP_STATUS_NOT_FOUND).send({ message: 'Карточка не найдена' });
      }
      return res.status(HTTP_STATUS_OK).send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(HTTP_STATUS_NOT_FOUND).send({ message: 'Карточка не найдена' });
      }
      return res.status(HTTP_STATUS_SERVER_ERROR).send({ message: 'Ошибка сервера' });
    });
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
