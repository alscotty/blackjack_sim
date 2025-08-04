import React, { useState, useEffect } from 'react';
import gameConfig from '../config/gameConfig';
import { createDeck, calculateHandValue } from '../game/blackjackLogic';
import CardSpriteRendering from './cardSpriteRendering.jsx';

const GameTable = () => {
    // Game state - core gameplay variables
    const [gameState, setGameState] = useState({
        playerHand: [],
        dealerHand: [],
        gameMessage: '',
        gameOver: false,
        isFirstTurn: true
    });

    // Betting state - money and wagers
    const [bettingState, setBettingState] = useState({
        bet: 0,
        balance: 1000 // Starting balance
    });

    // Deck state - cards and tracking
    const [deckState, setDeckState] = useState({
        deck: createDeck(),
        numDecks: gameConfig.numDecks,
        unseenOthers: 0,
        unseenTens: 0
    });

    // Split state - handling multiple hands
    const [splitState, setSplitState] = useState({
        splitHands: [],
        activeHandIndex: 0
    });

    // UI state - display preferences
    const [uiState, setUiState] = useState({
        showCardTally: true
    });

    // Destructure for easier access
    const { playerHand, dealerHand, gameMessage, gameOver, isFirstTurn } = gameState;
    const { bet, balance } = bettingState;
    const { deck, numDecks, unseenOthers, unseenTens } = deckState;
    const { splitHands, activeHandIndex } = splitState;
    const { showCardTally } = uiState;

    useEffect(() => {
        const totalCards = numDecks * 52;
        const totalTens = numDecks * 16; // 4 suits * 4 cards (10, J, Q, K) per deck
        setDeckState(prev => ({
            ...prev,
            unseenOthers: totalCards - totalTens,
            unseenTens: totalTens
        }));
    }, [numDecks]);

    const reshuffleDeckIfNeeded = () => {
        const totalCards = numDecks * 52;
        const usedCards = totalCards - (unseenOthers + unseenTens);

        if (usedCards >= totalCards / 2) {
            setDeckState(prev => ({
                ...prev,
                deck: createDeck(),
                unseenOthers: numDecks * 36, // Reset unseen others (52 - 16 tens per deck)
                unseenTens: numDecks * 16 // Reset unseen tens
            }));
            setGameState(prev => ({
                ...prev,
                gameMessage: "Deck reshuffled!"
            }));
        }
    };

    const updateDecks = (newNumDecks) => {
        setDeckState(prev => ({
            ...prev,
            numDecks: newNumDecks,
            deck: createDeck()
        }));
        gameConfig.numDecks = newNumDecks; // Update the game configuration
        resetGame();
    };

    const resetGame = () => {
        setGameState({
            playerHand: [],
            dealerHand: [],
            gameMessage: '',
            gameOver: false,
            isFirstTurn: true
        });
        setBettingState({
            bet: 0,
            balance: 1000
        });
        setSplitState({
            splitHands: [],
            activeHandIndex: 0
        });
    };

    const updateUnseenCounts = (playedCards) => {
        let othersCount = 0;
        let tensCount = 0;

        playedCards.forEach((card) => {
            if (['10', 'J', 'Q', 'K'].includes(card.value)) {
                tensCount++;
            } else {
                othersCount++;
            }
        });

        setDeckState(prev => ({
            ...prev,
            unseenOthers: prev.unseenOthers - othersCount,
            unseenTens: prev.unseenTens - tensCount
        }));
    };

    const dealInitialCards = () => {
        reshuffleDeckIfNeeded();
        
        const newDeck = [...deck];
        const playerCards = [newDeck.pop(), newDeck.pop()];
        const dealerCards = [newDeck.pop(), newDeck.pop()];
        updateUnseenCounts([...playerCards, ...dealerCards]);
        
        setGameState({
            playerHand: playerCards,
            dealerHand: dealerCards,
            gameMessage: '',
            gameOver: false,
            isFirstTurn: true
        });
        setDeckState(prev => ({
            ...prev,
            deck: newDeck
        }));
        setSplitState({
            splitHands: [],
            activeHandIndex: 0
        });
    };

    const handleBet = (amount) => {
        if (amount >= gameConfig.minBet && amount <= gameConfig.maxBet && amount <= balance) {
            setBettingState(prev => ({
                bet: amount,
                balance: prev.balance - amount
            }));
            dealInitialCards();
        }
    };

    const playerHit = () => {
        reshuffleDeckIfNeeded();
        const newDeck = [...deck];
        const newCard = newDeck.pop();
        const newPlayerHand = [...playerHand, newCard];
        updateUnseenCounts([newCard]);
        
        setGameState(prev => ({
            ...prev,
            playerHand: newPlayerHand,
            isFirstTurn: false
        }));
        setDeckState(prev => ({
            ...prev,
            deck: newDeck
        }));

        // Check if the player busts
        if (calculateHandValue(newPlayerHand) > 21) {
            setGameState(prev => ({
                ...prev,
                gameMessage: "You busted! You lose!",
                gameOver: true
            }));
        }
    };

    const playNextHand = () => {
        if (activeHandIndex < splitHands.length - 1) {
            setSplitState(prev => ({
                ...prev,
                activeHandIndex: prev.activeHandIndex + 1
            }));
            setGameState(prev => ({
                ...prev,
                playerHand: splitHands[activeHandIndex + 1],
                gameMessage: '',
                gameOver: false,
                isFirstTurn: true
            }));
        } else {
            // All hands have been played, end the turn
            setGameState(prev => ({
                ...prev,
                playerHand: []
            }));
            setSplitState({
                splitHands: [],
                activeHandIndex: 0
            });
        }
    };

    const playerStand = () => {
        reshuffleDeckIfNeeded();
        let newDeck = [...deck];
        let newDealerHand = [...dealerHand];

        while (calculateHandValue(newDealerHand) < 17) {
            const newCard = newDeck.pop();
            newDealerHand.push(newCard);
            updateUnseenCounts([newCard]);
        }

        setGameState(prev => ({
            ...prev,
            dealerHand: newDealerHand,
            isFirstTurn: false
        }));
        setDeckState(prev => ({
            ...prev,
            deck: newDeck
        }));

        const playerValue = calculateHandValue(playerHand);
        const dealerValue = calculateHandValue(newDealerHand);

        let newMessage = '';
        let newBalance = balance;

        if (playerValue > 21 || (dealerValue <= 21 && dealerValue > playerValue)) {
            newMessage = "You lose!";
        } else if (dealerValue > 21 || playerValue > dealerValue) {
            newMessage = "You win!";
            newBalance = balance + (bet * 1.5); // Player wins, 3:2 payout
        } else {
            newMessage = "Push!"; // Tie scenario
            newBalance = balance + bet; // Return the original bet to the player
        }

        setGameState(prev => ({
            ...prev,
            gameMessage: newMessage,
            gameOver: true
        }));
        setBettingState(prev => ({
            ...prev,
            balance: newBalance
        }));

        if (splitHands.length > 0) {
            playNextHand(); // Move to the next hand if split
        }
    };

    const playerDoubleDown = () => {
        reshuffleDeckIfNeeded();
        if (balance >= bet) {
            setBettingState(prev => ({
                ...prev,
                balance: prev.balance - bet,
                bet: prev.bet * 2
            }));

            const newDeck = [...deck];
            const newCard = newDeck.pop();
            const newPlayerHand = [...playerHand, newCard];
            updateUnseenCounts([newCard]);
            
            setGameState(prev => ({
                ...prev,
                playerHand: newPlayerHand
            }));
            setDeckState(prev => ({
                ...prev,
                deck: newDeck
            }));

            // Check if the player busts after doubling down
            if (calculateHandValue(newPlayerHand) > 21) {
                setGameState(prev => ({
                    ...prev,
                    gameMessage: "You busted! You lose!",
                    gameOver: true
                }));
                return;
            }

            // End the game after doubling down
            playerStand(true);
        }
    };

    const canSplit = () => {
        return (
            gameConfig.allowSplit &&
            playerHand.length === 2 &&
            playerHand[0].value === playerHand[1].value &&
            balance >= bet
        );
    };

    const handleSplit = () => {
        if (canSplit()) {
            const newDeck = [...deck];
            const firstHand = [playerHand[0], newDeck.pop()];
            const secondHand = [playerHand[1], newDeck.pop()];

            setSplitState({
                splitHands: [firstHand, secondHand],
                activeHandIndex: 0
            });
            setGameState(prev => ({
                ...prev,
                playerHand: firstHand
            }));
            setDeckState(prev => ({
                ...prev,
                deck: newDeck
            }));
            setBettingState(prev => ({
                ...prev,
                balance: prev.balance - bet
            }));
        }
    };

    const renderDealerHand = () => {
        if (!gameOver) {
            return `Hidden, ${dealerHand.slice(1).map((card) => `${card.value} of ${card.suit}`).join(', ')}`;
        }
        return dealerHand.map((card) => `${card.value} of ${card.suit}`).join(', ');
    };

    const payoutsMapping = {
        1.5: "3:2"
    }

    return (
        <div className="game-table">
            <h3>Blackjack</h3>
            
            {/* Game Stats */}
            <div className="game-stats">
                <p><strong>Balance:</strong> ${balance}</p>
                <p><strong>Current Bet:</strong> ${bet}</p>
                <p><strong>Payout:</strong> {payoutsMapping[gameConfig.blackjackPayout]}</p>
                <label>
                    <strong>Number of Decks:</strong>
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
                <button id="reset" onClick={() => setBettingState(prev => ({ ...prev, balance: 1000 }))}>Reset Balance to $1K</button>
            </div>
            
            {/* Game Controls */}
            <div className='game-controls-row'>
                <div className='betting'>
                    <button onClick={() => handleBet(10)} disabled={gameOver}>Bet $10</button>
                    <button onClick={() => handleBet(50)} disabled={gameOver}>Bet $50</button>
                    <button onClick={() => handleBet(100)} disabled={gameOver}>Bet $100</button>
                    {gameOver && <button onClick={() => {
                        setGameState(prev => ({
                            ...prev,
                            playerHand: [],
                            dealerHand: []
                        }));
                        setSplitState({
                            splitHands: [],
                            activeHandIndex: 0
                        });
                        setTimeout(() => dealInitialCards(), 0);
                    }}>Play Again</button>}
                </div>
                
                <div className='player-actions'>
                    <button onClick={playerHit} disabled={playerHand.length === 0 || gameOver}>Hit</button>
                    <button onClick={playerStand} disabled={playerHand.length === 0 || gameOver}>Stand</button>
                    <button
                        onClick={playerDoubleDown}
                        disabled={!isFirstTurn || gameOver || balance < bet || playerHand.length === 0}
                    >
                        Double Down
                    </button>
                    <button
                        onClick={handleSplit}
                        disabled={!canSplit() || gameOver}
                    >
                        Split
                    </button>
                </div>
            </div>
            {gameMessage && <div className="game-message">{gameMessage}</div>}
            <div className="game-layout">
                <div className="hand-container">
                    <div className="player-hand">
                        <h2>Player Hand {splitHands.length > 0 ? `(Hand ${activeHandIndex + 1})` : ''}</h2>
                        <div className="cards-display">
                            {playerHand.map((card) => (
                                <CardSpriteRendering key={`${card.value}-${card.suit}`} card={card} />
                            ))}
                        </div>
                        <p>Value: {calculateHandValue(playerHand)}</p>
                    </div>
                    <div className="dealer-hand">
                        <h2>Dealer Hand</h2>
                        <div className="cards-display">
                            {!gameOver ? (
                                <>
                                    <CardSpriteRendering card={{ value: 'back', suit: 'back' }} isHidden={true} />
                                    {dealerHand.slice(1).map((card) => (
                                        <CardSpriteRendering key={`${card.value}-${card.suit}`} card={card} />
                                    ))}
                                </>
                            ) : (
                                dealerHand.map((card) => (
                                    <CardSpriteRendering key={`${card.value}-${card.suit}`} card={card} />
                                ))
                            )}
                        </div>
                        <p>Value: {gameOver ? calculateHandValue(dealerHand) : renderDealerHand(dealerHand)}</p>
                    </div>
                </div>
                <div className="card-tally">
                    <h3>Card Tally</h3>
                    <button
                        onClick={() => setUiState(prev => ({ ...prev, showCardTally: !prev.showCardTally }))}
                        className="toggle-tally-btn"
                    >
                        {showCardTally ? 'Hide Numbers' : 'Show Numbers'}
                    </button>
                    {showCardTally && (
                        <>
                            <p>Unseen Others: {unseenOthers}</p>
                            <p>Unseen Tens: {unseenTens}</p>
                            <p>Ratio (Others to Tens): {(unseenOthers / unseenTens).toFixed(2)}</p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GameTable;
