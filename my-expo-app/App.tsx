import React, { useEffect } from 'react';
import { MenuScreen } from './components/MenuScreen';
import { GameScreen } from './components/GameScreen';
import { useGameStore } from './store/gameStore';

import './global.css';

export default function App() {
  const { gameStatus, loadGameState, loadRecords } = useGameStore();

  // Carrega dados salvos ao iniciar
  useEffect(() => {
    const loadData = async () => {
      await loadRecords();
      await loadGameState();
    };
    loadData();
  }, [loadGameState, loadRecords]);

  return gameStatus === 'menu' ? <MenuScreen /> : <GameScreen />;
}