const express = require('express');
const { celebrate, Joi, Segments } = require('celebrate');

const {
  getCards, createCard, deleteCard, likeCard, dislikeCard,
} = require('../controllers/cards');

const cardsRouter = express.Router();

const cardIdSchema = Joi.string().hex().length(24).required();

const cardSchema = {
  name: Joi.string().min(2).max(30).required(),
  link: Joi.string()
    .pattern(/http[s]?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/).required(),
};

cardsRouter.get('/', getCards);

cardsRouter.delete('/:cardId', celebrate({
  [Segments.PARAMS]: { cardId: cardIdSchema },
}), deleteCard);

cardsRouter.post('/', celebrate({
  [Segments.BODY]: cardSchema,
}), createCard);

cardsRouter.put('/:cardId/likes', celebrate({
  [Segments.PARAMS]: { cardId: cardIdSchema },
}), likeCard);

cardsRouter.delete('/:cardId/likes', celebrate({
  [Segments.PARAMS]: { cardId: cardIdSchema },
}), dislikeCard);

module.exports = cardsRouter;
