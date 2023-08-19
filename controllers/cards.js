const Card = require('../models/card');

const ValidationError = require('../errors/ValidationError');

const NotFoundError = require('../errors/NotFoundError');

// Получение всех карточек
const getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.status(200).send(cards))
    .catch((err) => next(err));
};

// Создание карточки
const createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  Card.create({ name, link, owner })
    .then((card) => {
      res.status(201).send(card);
    })
    .catch((error) => {
      if (error.name === 'ValidationError') {
        if (error.errors && error.errors.link) {
          res.status(400).send({ message: 'Некорректный URL' });
        } else {
          next(new ValidationError('Переданы некорректные данные'));
        }
      } else if (error.name === 'NotFoundError') {
        next(new NotFoundError('Запрашиваемый пользователь не найден'));
      } else {
        next(error);
      }
    });
};

// Удаление карточки
const deleteCard = (req, res, next) => {
  const { cardId } = req.params;

  // Поиск карточки
  Card.findById(cardId)
    .orFail(new NotFoundError('Карточки нет в БД'))
    .then((card) => {
      // Проверка, принадлежит ли карточка текущему пользователю
      if (card.owner.toString() !== req.user._id.toString()) {
        return res.status(403).send({ message: 'Недостаточно прав для удаления чужой карточки' });
      }

      // Удаление карточки
      return Card.findByIdAndRemove(cardId)
        .then(() => res.status(200).send({ message: 'Карточка удалена' }))
        .catch((error) => {
          if (error.name === 'CastError') {
            throw new NotFoundError('Запрашиваемый ресурс не найден');
          }
          next(error);
        });
    })
    .catch(next);
};

// Поставить лайк
const likeCard = (req, res, next) => {
  const { cardId } = req.params;
  const userId = req.user._id;

  Card.findByIdAndUpdate(cardId, { $addToSet: { likes: userId } }, { new: true })
    .orFail(new NotFoundError('Карточка не найдена'))
    .then((updatedCard) => {
      res.status(200).send(updatedCard);
    })
    .catch((error) => {
      if (error.name === 'ValidationError') {
        res.status(400).send({ message: 'Некорректный формат ID карточки' });
      } else if (error.name === 'CastError') {
        next(new NotFoundError('Запрашиваемый ресурс не найден'));
      } else {
        next(error);
      }
    });
};

// убрать лайк
const dislikeCard = (req, res, next) => {
  const { cardId } = req.params;
  const userId = req.user._id;

  Card.findByIdAndUpdate(cardId, { $pull: { likes: userId } }, { new: true })
    .orFail(new NotFoundError('Карточка не найдена'))
    .then((updatedCard) => {
      res.status(200).send(updatedCard);
    })
    .catch((error) => {
      if (error.name === 'ValidationError') {
        res.status(400).send({ message: 'Некорректный формат ID карточки' });
      } else if (error.name === 'CastError') {
        next(new NotFoundError('Запрашиваемый ресурс не найден'));
      } else {
        next(error);
      }
    });
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
