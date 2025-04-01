import React from 'react';
import './index.css';
import GameTable from './components/GameTable';
import { createRoot } from 'react-dom/client';
import './App.css';


document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById('root');
  const root = createRoot(container); //

  root.render(<GameTable/>);
});
