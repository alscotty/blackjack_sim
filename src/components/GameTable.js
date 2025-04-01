import React, { useState } from 'react';
import gameConfig from '../config/gameConfig';
import { createDeck, calculateHandValue } from '../game/blackjackLogic';

const GameTable = () => {
  const [deck, setDeck] = useState(createDeck());
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [bet, setBet] = useState(0);
  const [balance, setBalance] = useState(1000); // Starting balance
  const [gameMessage, setGameMessage] = useState('');
  const [gameOver, setGameOver] = useState(false);

  const dealInitialCards = () => {
    const newDeck = [...deck];
    const playerCards = [newDeck.pop(), newDeck.pop()];
    const dealerCards = [newDeck.pop(), newDeck.pop()];
    setPlayerHand(playerCards);
    setDealerHand(dealerCards);
    setDeck(newDeck);
    setGameOver(false);
    setGameMessage('');
  };

  const handleBet = (amount) => {
    if (amount >= gameConfig.minBet && amount <= gameConfig.maxBet && amount <= balance) {
      setBet(amount);
      setBalance(balance - amount);
      dealInitialCards();
    }
  };

  const playerHit = () => {
    const newDeck = [...deck];
    const newCard = newDeck.pop();
    const newPlayerHand = [...playerHand, newCard];
    setPlayerHand(newPlayerHand);
    setDeck(newDeck);

    // Check if the player busts
    if (calculateHandValue(newPlayerHand) > 21) {
      setGameMessage("You busted! You lose!");
      setGameOver(true);
    }
  };

  const playerStand = () => {
    let newDeck = [...deck];
    let newDealerHand = [...dealerHand];

    while (calculateHandValue(newDealerHand) < 17) {
      newDealerHand.push(newDeck.pop());
    }

    setDealerHand(newDealerHand);
    setDeck(newDeck);

    const playerValue = calculateHandValue(playerHand);
    const dealerValue = calculateHandValue(newDealerHand);

    if (playerValue > 21 || (dealerValue <= 21 && dealerValue >= playerValue)) {
      setGameMessage("You lose!");
    } else {
      setGameMessage("You win!");
    }

    setGameOver(true);
  };

  const renderDealerHand = () => {
    if (!gameOver) {
      return `Hidden, ${dealerHand.slice(1).map((card) => `${card.value} of ${card.suit}`).join(', ')}`;
    }
    return dealerHand.map((card) => `${card.value} of ${card.suit}`).join(', ');
  };

  return (
    <div>
      <h1>Blackjack</h1>
      <p>Balance: ${balance}</p>
      <p>Current Bet: ${bet}</p>
      <button onClick={() => handleBet(10)} disabled={gameOver}>Bet $10</button>
      <button onClick={() => handleBet(50)} disabled={gameOver}>Bet $50</button>
      <button onClick={() => handleBet(100)} disabled={gameOver}>Bet $100</button>
      <br/>
      {gameOver && <button onClick={dealInitialCards}>Play Again</button>}
      <br/>
      <button onClick={playerHit} disabled={playerHand.length === 0 || gameOver}>Hit</button>
      <button onClick={playerStand} disabled={playerHand.length === 0 || gameOver}>Stand</button>
      {gameMessage && <div className="game-message">{gameMessage}</div>}
      <div className="hand-container">
        <div className="player-hand">
          <h2>Player Hand</h2>
          <p>{playerHand.map((card) => `${card.value} of ${card.suit}`).join(', ')}</p>
          <p>Value: {calculateHandValue(playerHand)}</p>
        </div>
        <div className="dealer-hand">
          <h2>Dealer Hand</h2>
          <p>{renderDealerHand()}</p>
          <p>Value: {gameOver ? calculateHandValue(dealerHand) : 'Hidden'}</p>
        </div>
      </div>
    </div>
  );
};

export default GameTable;
