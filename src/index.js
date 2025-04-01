import React from 'react';
import './index.css';
import GameTable from './components/GameTable';
import { createRoot } from 'react-dom/client';

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById('root');
  const root = createRoot(container); //

  root.render(<GameTable/>);
});
