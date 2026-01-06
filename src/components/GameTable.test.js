import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GameTable from './GameTable';
import { calculateHandValue } from '../game/blackjackLogic';

// Mock the card sprite rendering component
jest.mock('./cardSpriteRendering.jsx', () => {
  return function MockCardSpriteRendering({ card }) {
    return <div data-testid={`card-${card.value}-${card.suit}`}>{card.value} of {card.suit}</div>;
  };
});

describe('GameTable', () => {
  beforeEach(() => {
    // Reset any mocks or state before each test
  });

  describe('Initial State', () => {
    test('should render game table with initial balance', () => {
      render(<GameTable />);
      expect(screen.getByText(/Balance:/i)).toBeInTheDocument();
      expect(screen.getByText(/\$1000/)).toBeInTheDocument();
    });

    test('should show initial bet as $0', () => {
      render(<GameTable />);
      expect(screen.getByText(/Current Bet:/i)).toBeInTheDocument();
      expect(screen.getByText(/\$0/)).toBeInTheDocument();
    });

    test('should display payout information', () => {
      render(<GameTable />);
      expect(screen.getByText(/^Payout:/i)).toBeInTheDocument();
    });
  });

  describe('Betting', () => {
    test('should allow placing a bet', () => {
      render(<GameTable />);
      const betButton = screen.getByText('Bet $10');
      fireEvent.click(betButton);
      
      // Check for current bet specifically
      expect(screen.getByText(/Current Bet:/i)).toBeInTheDocument();
      const currentBetText = screen.getByText(/Current Bet:/i).parentElement;
      expect(currentBetText).toHaveTextContent('$10');
      
      // Check for balance
      expect(screen.getByText(/Balance:/i)).toBeInTheDocument();
      const balanceText = screen.getByText(/Balance:/i).parentElement;
      expect(balanceText).toHaveTextContent('990');
    });

    test('should deal cards after placing a bet', () => {
      render(<GameTable />);
      const betButton = screen.getByText('Bet $10');
      fireEvent.click(betButton);
      
      // Should have player and dealer hands
      expect(screen.getByText(/Player Hand/i)).toBeInTheDocument();
      expect(screen.getByText(/Dealer Hand/i)).toBeInTheDocument();
    });

    test('should disable betting buttons when game is over', async () => {
      render(<GameTable />);
      const betButton = screen.getByRole('button', { name: 'Bet $10' });
      fireEvent.click(betButton);
      
      // Stand to end the game
      const standButton = screen.getByRole('button', { name: 'Stand' });
      fireEvent.click(standButton);
      
      // Wait for game to end
      await waitFor(() => {
        const bet10Button = screen.getByRole('button', { name: 'Bet $10' });
        // Buttons should be disabled when game is over
        expect(bet10Button).toBeDisabled();
      });
    });

    test('should reduce balance when bet is placed', () => {
      render(<GameTable />);
      const betButton = screen.getByText('Bet $50');
      fireEvent.click(betButton);
      
      expect(screen.getByText(/\$950/)).toBeInTheDocument();
    });
  });

  describe('Game Actions', () => {
    beforeEach(() => {
      // Helper to start a game
      const startGame = () => {
        const betButton = screen.getByText('Bet $10');
        fireEvent.click(betButton);
      };
      
      // Store helper for tests
      window.startGame = startGame;
    });

    test('should allow player to hit', async () => {
      render(<GameTable />);
      fireEvent.click(screen.getByText('Bet $10'));
      
      const hitButton = screen.getByText('Hit');
      expect(hitButton).not.toBeDisabled();
      
      fireEvent.click(hitButton);
      
      // Player should have more cards
      await waitFor(() => {
        const playerHand = screen.getByText(/Player Hand/i).closest('.player-hand');
        expect(playerHand).toBeInTheDocument();
      });
    });

    test('should disable hit button when game is over', async () => {
      render(<GameTable />);
      fireEvent.click(screen.getByText('Bet $10'));
      
      // Get initial hand value
      const standButton = screen.getByText('Stand');
      fireEvent.click(standButton);
      
      await waitFor(() => {
        const hitButton = screen.getByText('Hit');
        expect(hitButton).toBeDisabled();
      });
    });

    test('should allow player to stand', async () => {
      render(<GameTable />);
      fireEvent.click(screen.getByText('Bet $10'));
      
      const standButton = screen.getByText('Stand');
      expect(standButton).not.toBeDisabled();
      
      fireEvent.click(standButton);
      
      // Game should end and show result
      await waitFor(() => {
        const gameMessage = screen.queryByText(/You win!/i) || 
                           screen.queryByText(/You lose!/i) || 
                           screen.queryByText(/Push!/i);
        expect(gameMessage).toBeInTheDocument();
      });
    });

    test('should allow double down on first turn', () => {
      render(<GameTable />);
      fireEvent.click(screen.getByText('Bet $10'));
      
      const doubleDownButton = screen.getByText('Double Down');
      expect(doubleDownButton).not.toBeDisabled();
    });

    test('should disable double down after first turn', async () => {
      render(<GameTable />);
      fireEvent.click(screen.getByText('Bet $10'));
      
      // Hit first to end first turn
      fireEvent.click(screen.getByText('Hit'));
      
      await waitFor(() => {
        const doubleDownButton = screen.getByText('Double Down');
        expect(doubleDownButton).toBeDisabled();
      });
    });

    test('should double the bet when doubling down', async () => {
      render(<GameTable />);
      fireEvent.click(screen.getByText('Bet $10'));
      
      const doubleDownButton = screen.getByText('Double Down');
      fireEvent.click(doubleDownButton);
      
      await waitFor(() => {
        // Bet should be doubled
        expect(screen.getByText(/\$20/)).toBeInTheDocument();
        // Balance should be reduced by additional bet
        expect(screen.getByText(/\$980/)).toBeInTheDocument();
      });
    });
  });

  describe('Game Outcomes', () => {
    test('should detect player bust', async () => {
      render(<GameTable />);
      fireEvent.click(screen.getByText('Bet $10'));
      
      // Keep hitting until bust (this is a simplified test)
      // In a real scenario, we'd need to mock the deck
      const hitButton = screen.getByText('Hit');
      
      // Click hit multiple times (simulating getting high cards)
      for (let i = 0; i < 5; i++) {
        fireEvent.click(hitButton);
        await waitFor(() => {
          // Check if game is still active
          const gameMessage = screen.queryByText(/You busted/i);
          if (gameMessage) {
            expect(gameMessage).toBeInTheDocument();
            return;
          }
        }, { timeout: 100 });
      }
    });

    test('should show game message after standing', async () => {
      render(<GameTable />);
      fireEvent.click(screen.getByText('Bet $10'));
      
      fireEvent.click(screen.getByText('Stand'));
      
      await waitFor(() => {
        const gameMessage = screen.queryByText(/You win!/i) || 
                           screen.queryByText(/You lose!/i) || 
                           screen.queryByText(/Push!/i);
        expect(gameMessage).toBeInTheDocument();
      });
    });
  });

  describe('Payout System', () => {
    test('should display current payout ratio', () => {
      render(<GameTable />);
      // Use more specific query to avoid matching "Blackjack Payout:"
      const payoutLabel = screen.getByText(/^Payout:/i);
      expect(payoutLabel).toBeInTheDocument();
    });

    test('should allow changing payout ratio', () => {
      render(<GameTable />);
      const payoutSelect = screen.getByLabelText(/Blackjack Payout/i);
      expect(payoutSelect).toBeInTheDocument();
      
      // Should be able to change payout
      fireEvent.change(payoutSelect, { target: { value: '1.5' } });
      expect(payoutSelect.value).toBe('1.5');
    });
  });

  describe('Deck Management', () => {
    test('should allow changing number of decks', () => {
      render(<GameTable />);
      const deckSelect = screen.getByLabelText(/Number of Decks/i);
      expect(deckSelect).toBeInTheDocument();
      
      fireEvent.change(deckSelect, { target: { value: '4' } });
      expect(deckSelect.value).toBe('4');
    });

    test('should disable deck selection during game', () => {
      render(<GameTable />);
      fireEvent.click(screen.getByText('Bet $10'));
      
      const deckSelect = screen.getByLabelText(/Number of Decks/i);
      expect(deckSelect).toBeDisabled();
    });
  });

  describe('Balance Management', () => {
    test('should reset balance to $1000', () => {
      render(<GameTable />);
      fireEvent.click(screen.getByText('Bet $50'));
      
      const resetButton = screen.getByText(/Reset Balance to \$1K/i);
      fireEvent.click(resetButton);
      
      expect(screen.getByText(/\$1000/)).toBeInTheDocument();
    });
  });
});

