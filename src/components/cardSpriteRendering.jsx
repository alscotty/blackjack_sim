import React from 'react';
import allCardsImage from '../assets/all_cards.png';

const CardSpriteRendering = ({ card, isHidden = false }) => {
    // Card sprite sheet mapping
    const getCardSpritePosition = (card) => {
        // Correct suit order: clubs, spades, hearts, diamonds
        const suitOrder = { 'clubs': 0, 'spades': 1, 'hearts': 2, 'diamonds': 3 };
        // Value order: A, 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K
        const valueOrder = { 'A': 0, '2': 1, '3': 2, '4': 3, '5': 4, '6': 5, '7': 6, '8': 7, '9': 8, '10': 9, 'J': 10, 'Q': 11, 'K': 12 };

        const row = suitOrder[card.suit];
        const col = valueOrder[card.value];

        // Card dimensions: 354 x 626 pixels
        const cardWidth = 354;
        const cardHeight = 626;
        const rowBuffer = 62; // 62 pixel buffer between rows

        return {
            backgroundImage: `url(${allCardsImage})`,
            backgroundPosition: `-${col * cardWidth}px -${row * (cardHeight + rowBuffer)}px`,
            width: `${cardWidth}px`,
            height: `${cardHeight}px`,
            display: 'inline-block',
            backgroundRepeat: 'no-repeat',
            margin: '0 2px'
        };
    };

    // For dealer's down card, show an empty box
    if (isHidden) {
        return (
            <div style={{
                width: '88px', // 354 * 0.25 scale
                height: '156px', // 626 * 0.25 scale
                border: '2px solid white',
                borderRadius: '5px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                display: 'inline-block',
                margin: '0 2px'
            }} title="Hidden Card" />
        );
    }

    return (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <div 
                style={getCardSpritePosition(card)}
                title={`${card.value} of ${card.suit}`}
            />
            <div style={{
                color: 'white',
                fontSize: '80px',
                fontWeight: 'bold',
                textAlign: 'center',
                marginTop: '10px',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                padding: '8px 12px',
                borderRadius: '10px',
                minWidth: '140px',
                border: '2px solid white'
            }}>
                {`${card.value} of ${card.suit}`}
            </div>
        </div>
    );
};

export default CardSpriteRendering; 