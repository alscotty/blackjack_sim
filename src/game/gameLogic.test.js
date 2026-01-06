import { calculateHandValue } from './blackjackLogic';

describe('Game Logic - Outcomes and Payouts', () => {
  describe('Hand Comparison', () => {
    test('should identify player win when player has higher value', () => {
      const playerHand = [
        { suit: 'hearts', value: '10' },
        { suit: 'diamonds', value: '9' }
      ];
      const dealerHand = [
        { suit: 'clubs', value: '10' },
        { suit: 'spades', value: '7' }
      ];
      
      const playerValue = calculateHandValue(playerHand);
      const dealerValue = calculateHandValue(dealerHand);
      
      expect(playerValue).toBe(19);
      expect(dealerValue).toBe(17);
      expect(playerValue > dealerValue).toBe(true);
    });

    test('should identify dealer win when dealer has higher value', () => {
      const playerHand = [
        { suit: 'hearts', value: '10' },
        { suit: 'diamonds', value: '7' }
      ];
      const dealerHand = [
        { suit: 'clubs', value: '10' },
        { suit: 'spades', value: '9' }
      ];
      
      const playerValue = calculateHandValue(playerHand);
      const dealerValue = calculateHandValue(dealerHand);
      
      expect(playerValue).toBe(17);
      expect(dealerValue).toBe(19);
      expect(dealerValue > playerValue).toBe(true);
    });

    test('should identify push (tie) when values are equal', () => {
      const playerHand = [
        { suit: 'hearts', value: '10' },
        { suit: 'diamonds', value: '9' }
      ];
      const dealerHand = [
        { suit: 'clubs', value: '10' },
        { suit: 'spades', value: '9' }
      ];
      
      const playerValue = calculateHandValue(playerHand);
      const dealerValue = calculateHandValue(dealerHand);
      
      expect(playerValue).toBe(19);
      expect(dealerValue).toBe(19);
      expect(playerValue === dealerValue).toBe(true);
    });

    test('should identify player win when dealer busts', () => {
      const playerHand = [
        { suit: 'hearts', value: '10' },
        { suit: 'diamonds', value: '9' }
      ];
      const dealerHand = [
        { suit: 'clubs', value: '10' },
        { suit: 'spades', value: '9' },
        { suit: 'hearts', value: '8' }
      ];
      
      const playerValue = calculateHandValue(playerHand);
      const dealerValue = calculateHandValue(dealerHand);
      
      expect(playerValue).toBe(19);
      expect(dealerValue).toBe(27);
      expect(dealerValue > 21).toBe(true);
    });

    test('should identify player loss when player busts', () => {
      const playerHand = [
        { suit: 'hearts', value: '10' },
        { suit: 'diamonds', value: '9' },
        { suit: 'clubs', value: '8' }
      ];
      const dealerHand = [
        { suit: 'spades', value: '10' },
        { suit: 'hearts', value: '7' }
      ];
      
      const playerValue = calculateHandValue(playerHand);
      const dealerValue = calculateHandValue(dealerHand);
      
      expect(playerValue).toBe(27);
      expect(dealerValue).toBe(17);
      expect(playerValue > 21).toBe(true);
    });
  });

  describe('Payout Calculations', () => {
    test('should calculate 6:5 payout correctly (1.2x multiplier)', () => {
      const bet = 100;
      const payoutMultiplier = 1.2;
      const payout = bet * payoutMultiplier;
      
      expect(payout).toBe(120);
    });

    test('should calculate 3:2 payout correctly (1.5x multiplier)', () => {
      const bet = 100;
      const payoutMultiplier = 1.5;
      const payout = bet * payoutMultiplier;
      
      expect(payout).toBe(150);
    });

    test('should calculate total balance after win with 6:5 payout', () => {
      const initialBalance = 1000;
      const bet = 50;
      const payoutMultiplier = 1.2;
      
      // Player wins: balance = initialBalance - bet + (bet * payoutMultiplier)
      const finalBalance = initialBalance - bet + (bet * payoutMultiplier);
      
      expect(finalBalance).toBe(1010); // 1000 - 50 + 60
    });

    test('should calculate total balance after win with 3:2 payout', () => {
      const initialBalance = 1000;
      const bet = 50;
      const payoutMultiplier = 1.5;
      
      const finalBalance = initialBalance - bet + (bet * payoutMultiplier);
      
      expect(finalBalance).toBe(1025); // 1000 - 50 + 75
    });

    test('should return bet on push (tie)', () => {
      const initialBalance = 1000;
      const bet = 50;
      
      // Push: balance = initialBalance - bet + bet (bet returned)
      const finalBalance = initialBalance - bet + bet;
      
      expect(finalBalance).toBe(1000);
    });

    test('should lose bet on loss', () => {
      const initialBalance = 1000;
      const bet = 50;
      
      // Loss: balance = initialBalance - bet (no return)
      const finalBalance = initialBalance - bet;
      
      expect(finalBalance).toBe(950);
    });
  });

  describe('Split Logic', () => {
    test('should identify valid split hand (two cards of same value)', () => {
      const hand = [
        { suit: 'hearts', value: '8' },
        { suit: 'diamonds', value: '8' }
      ];
      
      const canSplit = hand.length === 2 && hand[0].value === hand[1].value;
      expect(canSplit).toBe(true);
    });

    test('should identify invalid split hand (different values)', () => {
      const hand = [
        { suit: 'hearts', value: '8' },
        { suit: 'diamonds', value: '9' }
      ];
      
      const canSplit = hand.length === 2 && hand[0].value === hand[1].value;
      expect(canSplit).toBe(false);
    });

    test('should identify invalid split hand (more than 2 cards)', () => {
      const hand = [
        { suit: 'hearts', value: '8' },
        { suit: 'diamonds', value: '8' },
        { suit: 'clubs', value: '8' }
      ];
      
      const canSplit = hand.length === 2 && hand[0].value === hand[1].value;
      expect(canSplit).toBe(false);
    });

    test('should allow splitting face cards', () => {
      const hand = [
        { suit: 'hearts', value: 'K' },
        { suit: 'diamonds', value: 'Q' }
      ];
      
      // Face cards (J, Q, K) are all worth 10, so they can be split
      const canSplit = hand.length === 2 && 
        (hand[0].value === hand[1].value || 
         (['J', 'Q', 'K'].includes(hand[0].value) && ['J', 'Q', 'K'].includes(hand[1].value)));
      expect(canSplit).toBe(true);
    });

    test('should calculate split hand values correctly', () => {
      const firstHand = [
        { suit: 'hearts', value: '8' },
        { suit: 'diamonds', value: '5' }
      ];
      const secondHand = [
        { suit: 'clubs', value: '8' },
        { suit: 'spades', value: '7' }
      ];
      
      const firstValue = calculateHandValue(firstHand);
      const secondValue = calculateHandValue(secondHand);
      
      expect(firstValue).toBe(13);
      expect(secondValue).toBe(15);
    });
  });

  describe('Double Down Logic', () => {
    test('should double bet amount', () => {
      const initialBet = 50;
      const doubledBet = initialBet * 2;
      
      expect(doubledBet).toBe(100);
    });

    test('should require sufficient balance for double down', () => {
      const balance = 100;
      const bet = 50;
      const canDoubleDown = balance >= bet;
      
      expect(canDoubleDown).toBe(true);
    });

    test('should prevent double down with insufficient balance', () => {
      const balance = 40;
      const bet = 50;
      const canDoubleDown = balance >= bet;
      
      expect(canDoubleDown).toBe(false);
    });
  });

  describe('Dealer Logic', () => {
    test('should hit when dealer has less than 17', () => {
      const dealerHand = [
        { suit: 'hearts', value: '10' },
        { suit: 'diamonds', value: '6' }
      ];
      
      const dealerValue = calculateHandValue(dealerHand);
      const shouldHit = dealerValue < 17;
      
      expect(dealerValue).toBe(16);
      expect(shouldHit).toBe(true);
    });

    test('should stand when dealer has 17 or more', () => {
      const dealerHand = [
        { suit: 'hearts', value: '10' },
        { suit: 'diamonds', value: '7' }
      ];
      
      const dealerValue = calculateHandValue(dealerHand);
      const shouldStand = dealerValue >= 17;
      
      expect(dealerValue).toBe(17);
      expect(shouldStand).toBe(true);
    });

    test('should stand when dealer has soft 17 (A + 6)', () => {
      const dealerHand = [
        { suit: 'hearts', value: 'A' },
        { suit: 'diamonds', value: '6' }
      ];
      
      const dealerValue = calculateHandValue(dealerHand);
      const shouldStand = dealerValue >= 17;
      
      expect(dealerValue).toBe(17);
      expect(shouldStand).toBe(true);
    });
  });
});

