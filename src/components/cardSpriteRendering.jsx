import React from 'react';
import allCardsImage from '../assets/all_cards.png';

const SCALE = 0.65
const CARD_WIDTH = 190;
const CARD_HEIGHT = 273;

const CardSpriteRendering = ({ card, isHidden = false }) => {
    const getCardSpritePosition = (card) => {
        // Correct suit order: clubs, spades, hearts, diamonds
        const suitOrder = { 'clubs': 0, 'diamonds': 1, 'hearts': 2, 'spades': 3 };
        // Value order: A, 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K
        const valueOrder = { 'A': 0, '2': 1, '3': 2, '4': 3, '5': 4, '6': 5, '7': 6, '8': 7, '9': 8, '10': 9, 'J': 10, 'Q': 11, 'K': 12 };

        const row = suitOrder[card.suit];
        const col = valueOrder[card.value];

      
        return {
            backgroundImage: `url(${allCardsImage})`,
            backgroundPosition: `-${col * CARD_WIDTH}px -${row * (CARD_HEIGHT)}px`,
            width: `${CARD_WIDTH}px`,
            height: `${CARD_HEIGHT}px`,
        };
    };

    // For dealer's down card, show an empty box
    if (isHidden) {
        return (
            <div className='card-and-text-container'>
                <div 
                    style={{
                        width: `${CARD_WIDTH}px`, 
                        height: `${CARD_HEIGHT}px`, 
                        border: '2px solid white',
                        borderRadius: '5px',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        display: 'inline-block',
                        margin: '0 2px',
                        transform: `scale(${SCALE})`,
                        transformOrigin: 'top left'
                    }}
                    title="Hidden Card" 
                />
                <div style={{ height: '0px', overflow: 'hidden' }}>
                    Hidden Card
                </div>
            </div>
        );
    }

    return (
        <div className='card-and-text-container'>
            <div 
                style={{
                    ...getCardSpritePosition(card),
                    transform: `scale(${SCALE})`,
                    verticalAlign: 'top',
                    margin: '0 2px'
                }}
                title={`${card.value} of ${card.suit}`}
            />
            <div style={{ height: '0px', overflow: 'hidden' }}>
                {`${card.value} of ${card.suit}`}
            </div>
        </div>
    );
};

export default CardSpriteRendering; 