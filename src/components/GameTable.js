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
    const [isFirstTurn, setIsFirstTurn] = useState(true);
    const [numDecks, setNumDecks] = useState(gameConfig.numDecks);

    const updateDecks = (newNumDecks) => {
        setNumDecks(newNumDecks);
        gameConfig.numDecks = newNumDecks; // Update the game configuration
        setDeck(createDeck());
        resetGame();
    };

    const resetGame = () => {
        setPlayerHand([]);
        setDealerHand([]);
        setBet(0);
        setBalance(1000);
        setGameMessage('');
        setGameOver(false);
        setIsFirstTurn(true);
    };

    const dealInitialCards = () => {
        const newDeck = [...deck];
        const playerCards = [newDeck.pop(), newDeck.pop()];
        const dealerCards = [newDeck.pop(), newDeck.pop()];
        setPlayerHand(playerCards);
        setDealerHand(dealerCards);
        setDeck(newDeck);
        setGameOver(false);
        setGameMessage('');
        setIsFirstTurn(true);
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

        setIsFirstTurn(false);
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

        if (playerValue > 21 || (dealerValue <= 21 && dealerValue > playerValue)) {
            setGameMessage("You lose!");
        } else if (dealerValue > 21 || playerValue > dealerValue) {
            setGameMessage("You win!");
            setBalance(balance + (bet * 1.5)); // Player wins, 3:2 payout
        } else {
            setGameMessage("Push!"); // Tie scenario
            setBalance(balance + bet); // Return the original bet to the player
        }

        setGameOver(true);
        setIsFirstTurn(false);
    };

    const playerDoubleDown = () => {
        if (balance >= bet) {
            setBalance(balance - bet);
            setBet(bet * 2);

            const newDeck = [...deck];
            const newCard = newDeck.pop();
            const newPlayerHand = [...playerHand, newCard];
            setPlayerHand(newPlayerHand);
            setDeck(newDeck);

            // Check if the player busts after doubling down
            if (calculateHandValue(newPlayerHand) > 21) {
                setGameMessage("You busted! You lose!");
                setGameOver(true);
                return;
            }

            // End the game after doubling down
            playerStand(true);
        }
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
            <p>Balance: ${balance}</p> <button onClick={() => setBalance(1000)}>Reset Balance to $1K</button>
            <p>Current Bet: ${bet}</p>
            <label>
                Number of Decks:
                <select
                    value={numDecks}
                    onChange={(e) => updateDecks(parseInt(e.target.value, 10))}
                    disabled={playerHand.length > 0 || dealerHand.length > 0}
                >
                    {[1, 2, 4, 6, 8].map((deckCount) => (
                        <option key={deckCount} value={deckCount}>
                            {deckCount}
                        </option>
                    ))}
                </select>
            </label>
            <br />
            <button onClick={() => handleBet(10)} disabled={gameOver}>Bet $10</button>
            <button onClick={() => handleBet(50)} disabled={gameOver}>Bet $50</button>
            <button onClick={() => handleBet(100)} disabled={gameOver}>Bet $100</button>
            <br />
            {gameOver && <button onClick={dealInitialCards}>Play Again</button>}
            <br />
            <button onClick={playerHit} disabled={playerHand.length === 0 || gameOver}>Hit</button>
            <button onClick={playerStand} disabled={playerHand.length === 0 || gameOver}>Stand</button>
            <button
                onClick={playerDoubleDown}
                disabled={!isFirstTurn || gameOver || balance < bet || playerHand.length === 0}
            >
                Double Down
            </button>
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
