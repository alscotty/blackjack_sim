import { render, screen } from '@testing-library/react';
import App from './App';

test('renders blackjack game', () => {
  render(<App />);
  const gameTitle = screen.getByRole('heading', { name: /Blackjack/i });
  expect(gameTitle).toBeInTheDocument();
});

test('renders game table component', () => {
  render(<App />);
  expect(screen.getByText(/Balance:/i)).toBeInTheDocument();
});
