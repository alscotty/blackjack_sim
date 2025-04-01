import gameConfig from '../config/gameConfig';

export const createDeck = () => {
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  const values = [
    '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A',
  ];
  const deck = [];
  for (let i = 0; i < gameConfig.numDecks; i++) {
    for (const suit of suits) {
      for (const value of values) {
        deck.push({ suit, value });
      }
    }
  }
  return shuffle(deck);
};

export const calculateHandValue = (hand) => {
  let value = 0;
  let aces = 0;
  hand.forEach((card) => {
    if (['J', 'Q', 'K'].includes(card.value)) {
      value += 10;
    } else if (card.value === 'A') {
      aces += 1;
      value += 11;
    } else {
      value += parseInt(card.value, 10);
    }
  });
  while (value > 21 && aces > 0) {
    value -= 10;
    aces -= 1;
  }
  return value;
};

const shuffle = (deck) => {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};
