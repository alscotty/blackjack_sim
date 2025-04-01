import React, { useState } from 'react';
import gameConfig from '../config/gameConfig';
import { createDeck, calculateHandValue } from '../game/blackjackLogic';

const GameTable = () => {
  const [deck, setDeck] = useState(createDeck());
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [bet, setBet] = useState(0);
  const [balance, setBalance] = useState(1000); // Starting balance

  const dealInitialCards = () => {
    const newDeck = [...deck];
    const playerCards = [newDeck.pop(), newDeck.pop()];
    const dealerCards = [newDeck.pop(), newDeck.pop()];
    setPlayerHand(playerCards);
    setDealerHand(dealerCards);
    setDeck(newDeck);
  };

  const handleBet = (amount) => {
    if (amount >= gameConfig.minBet && amount <= gameConfig.maxBet && amount <= balance) {
      setBet(amount);
      setBalance(balance - amount);
      dealInitialCards();
    }
  };

  return (
    <div>
      <h1>Blackjack</h1>
      <p>Balance: ${balance}</p>
      <p>Current Bet: ${bet}</p>
      <button onClick={() => handleBet(10)}>Bet $10</button>
      <button onClick={() => handleBet(50)}>Bet $50</button>
      <button onClick={() => handleBet(100)}>Bet $100</button>
      <div>
        <h2>Player Hand</h2>
        <p>{playerHand.map((card) => `${card.value} of ${card.suit}`).join(', ')}</p>
        <p>Value: {calculateHandValue(playerHand)}</p>
      </div>
      <div>
        <h2>Dealer Hand</h2>
        <p>{dealerHand.map((card) => `${card.value} of ${card.suit}`).join(', ')}</p>
        <p>Value: {calculateHandValue(dealerHand)}</p>
      </div>
    </div>
  );
};

export default GameTable;
