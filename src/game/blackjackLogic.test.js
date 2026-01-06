import { createDeck, calculateHandValue } from './blackjackLogic';
import gameConfig from '../config/gameConfig';

describe('blackjackLogic', () => {
  describe('calculateHandValue', () => {
    test('should calculate value for number cards correctly', () => {
      const hand = [
        { suit: 'hearts', value: '2' },
        { suit: 'diamonds', value: '5' },
        { suit: 'clubs', value: '7' }
      ];
      expect(calculateHandValue(hand)).toBe(14);
    });

    test('should calculate value for face cards correctly', () => {
      const hand = [
        { suit: 'hearts', value: 'J' },
        { suit: 'diamonds', value: 'Q' },
        { suit: 'clubs', value: 'K' }
      ];
      expect(calculateHandValue(hand)).toBe(30);
    });

    test('should calculate value for 10 correctly', () => {
      const hand = [
        { suit: 'hearts', value: '10' },
        { suit: 'diamonds', value: '10' }
      ];
      expect(calculateHandValue(hand)).toBe(20);
    });

    test('should handle single ace as 11', () => {
      const hand = [
        { suit: 'hearts', value: 'A' }
      ];
      expect(calculateHandValue(hand)).toBe(11);
    });

    test('should handle ace as 1 when it would cause bust', () => {
      const hand = [
        { suit: 'hearts', value: '10' },
        { suit: 'diamonds', value: '9' },
        { suit: 'clubs', value: 'A' }
      ];
      expect(calculateHandValue(hand)).toBe(20);
    });

    test('should handle multiple aces correctly', () => {
      const hand = [
        { suit: 'hearts', value: 'A' },
        { suit: 'diamonds', value: 'A' }
      ];
      expect(calculateHandValue(hand)).toBe(12); // 11 + 1
    });

    test('should handle three aces correctly', () => {
      const hand = [
        { suit: 'hearts', value: 'A' },
        { suit: 'diamonds', value: 'A' },
        { suit: 'clubs', value: 'A' }
      ];
      expect(calculateHandValue(hand)).toBe(13); // 11 + 1 + 1
    });

    test('should handle ace with face cards correctly', () => {
      const hand = [
        { suit: 'hearts', value: 'A' },
        { suit: 'diamonds', value: 'K' }
      ];
      expect(calculateHandValue(hand)).toBe(21); // Blackjack!
    });

    test('should handle ace with multiple cards that would bust', () => {
      const hand = [
        { suit: 'hearts', value: 'A' },
        { suit: 'diamonds', value: '9' },
        { suit: 'clubs', value: '8' }
      ];
      expect(calculateHandValue(hand)).toBe(18); // Ace becomes 1
    });

    test('should handle blackjack (A + 10)', () => {
      const hand = [
        { suit: 'hearts', value: 'A' },
        { suit: 'diamonds', value: '10' }
      ];
      expect(calculateHandValue(hand)).toBe(21);
    });

    test('should handle empty hand', () => {
      expect(calculateHandValue([])).toBe(0);
    });

    test('should handle bust scenario', () => {
      const hand = [
        { suit: 'hearts', value: '10' },
        { suit: 'diamonds', value: '9' },
        { suit: 'clubs', value: '8' }
      ];
      expect(calculateHandValue(hand)).toBe(27);
    });
  });

  describe('createDeck', () => {
    test('should create a deck with correct number of cards for default config', () => {
      const deck = createDeck();
      const expectedCards = gameConfig.numDecks * 52;
      expect(deck.length).toBe(expectedCards);
    });

    test('should create deck with all suits and values', () => {
      const deck = createDeck();
      const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
      const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
      
      suits.forEach(suit => {
        values.forEach(value => {
          const count = deck.filter(card => card.suit === suit && card.value === value).length;
          expect(count).toBe(gameConfig.numDecks);
        });
      });
    });

    test('should shuffle the deck', () => {
      const deck1 = createDeck();
      const deck2 = createDeck();
      
      // Decks should be different (very unlikely to be identical after shuffle)
      // We'll check that at least some cards are in different positions
      let differences = 0;
      for (let i = 0; i < Math.min(deck1.length, deck2.length); i++) {
        if (deck1[i].suit !== deck2[i].suit || deck1[i].value !== deck2[i].value) {
          differences++;
        }
      }
      // With shuffling, we expect significant differences
      expect(differences).toBeGreaterThan(0);
    });

    test('should have correct structure for each card', () => {
      const deck = createDeck();
      deck.forEach(card => {
        expect(card).toHaveProperty('suit');
        expect(card).toHaveProperty('value');
        expect(['hearts', 'diamonds', 'clubs', 'spades']).toContain(card.suit);
        expect(['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']).toContain(card.value);
      });
    });

    test('should have correct number of tens per deck', () => {
      const deck = createDeck();
      const tens = deck.filter(card => ['10', 'J', 'Q', 'K'].includes(card.value));
      const expectedTens = gameConfig.numDecks * 16; // 4 suits * 4 cards (10, J, Q, K)
      expect(tens.length).toBe(expectedTens);
    });

    test('should have correct number of aces per deck', () => {
      const deck = createDeck();
      const aces = deck.filter(card => card.value === 'A');
      const expectedAces = gameConfig.numDecks * 4; // 4 suits * 1 ace
      expect(aces.length).toBe(expectedAces);
    });
  });
});

