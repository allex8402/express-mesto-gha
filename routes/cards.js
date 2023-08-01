const express = require('express');
const { getCards, createCard, deleteCard, likeCard, dislikeCard } = require('../controllers/cards');

const cardsRouter = express.Router();

cardsRouter.get('/', getCards);
cardsRouter.delete('/:cardId', deleteCard);
cardsRouter.post('/', createCard);
cardsRouter.put('/:cardId/likes', likeCard);
cardsRouter.delete('/:cardId/likes', dislikeCard);

module.exports = cardsRouter;