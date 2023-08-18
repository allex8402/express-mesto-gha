const Card = require('../models/card');

const ValidationError = require('../errors/ValidationError');
const UnauthorizedError = require('../errors/UnauthorizedError');
const NotFoundError = require('../errors/NotFoundError');

// Получение всех карточек
const getCards = (req, res, next) => {
  Card.find({})
    .orFail()
    .then((cards) => res.status(200).send(cards))
    .catch((err) => next(err));
};

// Создание карточки
const createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  Card.create({ name, link, owner })
    .orFail()
    .then((card) => {
      res.status(200).send(card);
    })
    .catch((error) => {
      if (error.name === 'ValidationError') {
        if (error.errors && error.errors.avatar) {
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
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка не найдена');
      }

      // Проверка, принадлежит ли карточка текущему пользователю
      if (card.owner.toString() !== req.user._id.toString()) {
        throw new UnauthorizedError('Недостаточно прав для удаления карточки');
      }

      // Удаление карточки
      return Card.findByIdAndRemove(cardId)
        .then(() => res.status(200).send(card))
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
    .orFail
    .then((card) => {
      res.status(200).send(card);
    })
    .catch((error) => {
      if (error.name === 'CastError' || error.name === 'NotFoundError') {
        next(new NotFoundError('Карточка не найдена'));
      } else if (error.name === 'ValidationError') {
        res.status(400).send({ message: 'Некорректный формат ID карточки' });
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
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка не найдена');
      }
      return res.status(200).send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new NotFoundError('Карточка не найдена');
      }
      next(err);
    });
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
