const Card = require('../models/card');

// возвращение всех карточек
const getCards = (req, res) => {
  Card.find({})
    .then((cards) => {
      res.status(200).send(cards);
    })
    .catch(() => {
      res.status(500).send({ message: 'Ошибка при получении карточек' });
    });
};

// создать карточку
const createCard = (req, res) => {
  // console.log(req.user._id);
  const { name, link } = req.body;
  Card.create({ name, link })
    .then((card) => {
      res.status(201).send(card);
    })
    .catch(() => {
      res.status(400).send({ message: 'Ошибка при создании карточки' });
    });
};

// удалить карточку
const deleteCard = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .then((card) => {
      if (!card) {
        res.status(404).send({ message: 'Карточка не найдена' });
      } else {
        res.status(200).send(card);
      }
    })
    .catch(() => {
      res.status(500).send({ message: 'Ошибка при удалении карточки' });
    });
};

// поставить лайк
const likeCard = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .then((card) => {
      if (!card) {
        res.status(404).send({ message: 'Карточка не найдена' });
      } else {
        res.status(200).send(card);
      }
    })
    .catch(() => {
      res.status(500).send({ message: 'Ошибка при постановке лайка' });
    });
};

// убрать лайк
const dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId, { $pull: { likes: req.user._id } }, { new: true })
    .then((card) => {
      if (!card) {
        res.status(404).send({ message: 'Карточка не найдена' });
      } else {
        res.status(200).send(card);
      }
    })
    .catch(() => {
      res.status(500).send({ message: 'Ошибка при снятии лайка' });
    });
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
