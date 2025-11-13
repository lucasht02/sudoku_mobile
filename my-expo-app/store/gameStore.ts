import { create } from 'zustand';
import { generateGame, Cell, Difficulty } from '../lib/sudoku';
import { storageService, RecordTimes } from '../lib/storage';

interface GameState {
  board: Cell[];
  selectedCellIndex: number | null;
  difficulty: Difficulty;
  mistakes: number;
  isPlaying: boolean;
  gameStatus: 'playing' | 'won' | 'lost' | 'menu';
  startTime: number | null;
  elapsedTime: number;
  isPaused: boolean;
  pausedTime: number | null;
  records: RecordTimes;
  isNewRecord: boolean;
  hasOngoingGame: boolean;
  
  // Actions
  startGame: (difficulty: Difficulty) => void;
  selectCell: (index: number) => void;
  setCellValue: (num: number) => void;
  checkGameStatus: () => void;
  returnToMenu: () => void;
  updateElapsedTime: () => void;
  saveGameState: () => void;
  loadGameState: () => Promise<void>;
  loadRecords: () => Promise<void>;
  resumeGame: () => void;
  pauseGame: () => void;
  resumeFromPause: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  board: [],
  selectedCellIndex: null,
  difficulty: 1,
  mistakes: 0,
  isPlaying: false,
  gameStatus: 'menu',
  startTime: null,
  elapsedTime: 0,
  isPaused: false,
  pausedTime: null,
  records: { 1: null, 2: null, 3: null, 4: null, 5: null, 6: null },
  isNewRecord: false,
  hasOngoingGame: false,

  // Carrega recordes do storage
  loadRecords: async () => {
    const records = await storageService.loadRecords();
    set({ records });
  },

  // Carrega jogo salvo (se existir)
  loadGameState: async () => {
    const savedGame = await storageService.loadCurrentGame();
    if (savedGame) {
      set({
        board: savedGame.board,
        difficulty: savedGame.difficulty,
        mistakes: savedGame.mistakes,
        startTime: savedGame.startTime,
        elapsedTime: savedGame.elapsedTime,
        hasOngoingGame: true,
        gameStatus: 'menu', // Fica no menu até clicar em "Continuar"
        isPlaying: false,
      });
    }
  },

  // Retoma o jogo salvo
  resumeGame: () => {
    set({ 
      gameStatus: 'playing', 
      isPlaying: true,
      hasOngoingGame: true,
      isPaused: false,
    });
  },

  // Salva o estado atual do jogo
  saveGameState: async () => {
    const { board, difficulty, mistakes, startTime, elapsedTime, gameStatus } = get();
    
    // Só salva se estiver jogando
    if (gameStatus === 'playing' && startTime) {
      await storageService.saveCurrentGame({
        board,
        difficulty,
        mistakes,
        startTime,
        elapsedTime,
      });
      set({ hasOngoingGame: true });
    }
  },

  startGame: (difficulty) => {
    const newBoard = generateGame(difficulty);
    set({ 
      board: newBoard, 
      difficulty, 
      mistakes: 0, 
      isPlaying: true, 
      selectedCellIndex: null,
      gameStatus: 'playing',
      startTime: Date.now(),
      elapsedTime: 0,
      isNewRecord: false,
      hasOngoingGame: true,
      isPaused: false,
      pausedTime: null,
    });
    
    // Salva o novo jogo
    get().saveGameState();
  },

  returnToMenu: async () => {
    const { gameStatus } = get();
    
    // Se estava jogando, pausa e mantém o jogo salvo para poder continuar
    // Se ganhou ou perdeu, limpa o jogo salvo
    if (gameStatus === 'won' || gameStatus === 'lost') {
      await storageService.clearCurrentGame();
      set({
        gameStatus: 'menu',
        isPlaying: false,
        hasOngoingGame: false,
      });
    } else if (gameStatus === 'playing') {
      // Estava jogando, pausa antes de voltar ao menu
      get().pauseGame();
      set({
        gameStatus: 'menu',
        isPlaying: false,
        // hasOngoingGame permanece true
      });
    }
  },

  updateElapsedTime: () => {
    const { startTime, gameStatus, isPaused } = get();
    if (startTime && gameStatus === 'playing' && !isPaused) {
      set({ elapsedTime: Math.floor((Date.now() - startTime) / 1000) });
    }
  },

  pauseGame: () => {
    const { gameStatus, startTime, elapsedTime } = get();
    if (gameStatus === 'playing' && !get().isPaused) {
      // Salva o tempo atual antes de pausar
      const currentElapsed = startTime ? Math.floor((Date.now() - startTime) / 1000) : elapsedTime;
      set({ 
        isPaused: true,
        pausedTime: Date.now(),
        elapsedTime: currentElapsed
      });
      // Salva o estado pausado
      get().saveGameState();
    }
  },

  resumeFromPause: () => {
    const { pausedTime, elapsedTime } = get();
    if (get().isPaused && pausedTime) {
      // Ajusta o startTime para compensar o tempo pausado
      const pauseDuration = Math.floor((Date.now() - pausedTime) / 1000);
      const newStartTime = Date.now() - (elapsedTime * 1000);
      set({ 
        isPaused: false,
        pausedTime: null,
        startTime: newStartTime
      });
    }
  },

  selectCell: (index) => {
    set({ selectedCellIndex: index });
  },

  setCellValue: (num) => {
    const { board, selectedCellIndex, mistakes } = get();
    
    if (selectedCellIndex === null) return;
    
    const cell = board[selectedCellIndex];
    if (cell.isFixed) return; // Não pode editar números originais

    // Se num é 0, está apagando (transforma em null)
    const newValue = num === 0 ? null : num;
    
    // Verifica se é correto (null não conta como erro, é só apagar)
    const isCorrect = newValue === null || newValue === cell.correctValue;
    
    // Só incrementa erros se:
    // 1. O novo valor está errado (!isCorrect)
    // 2. A célula não tinha erro antes (!cell.isError)
    // Isso evita contar erro duas vezes ao sobrescrever
    const wasWrong = cell.isError;
    const isNowWrong = !isCorrect;
    
    let newMistakes = mistakes;
    if (isNowWrong && !wasWrong) {
      // Novo erro
      newMistakes = mistakes + 1;
    } else if (!isNowWrong && wasWrong) {
      // Corrigiu um erro (opcional: pode remover essa linha se não quiser diminuir)
      // newMistakes = Math.max(0, mistakes - 1);
    }

    // Atualiza o tabuleiro
    const newBoard = [...board];
    newBoard[selectedCellIndex] = {
      ...cell,
      value: newValue,
      isError: isNowWrong,
    };

    set({ 
      board: newBoard,
      mistakes: newMistakes
    });

    // Verifica vitória/derrota após cada jogada
    get().checkGameStatus();
    
    // Salva o estado após cada jogada
    get().saveGameState();
  },

  checkGameStatus: async () => {
    const { board, mistakes, startTime, difficulty } = get();
    
    // Verifica derrota (3 erros)
    if (mistakes >= 3) {
      const elapsedTime = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
      await storageService.clearCurrentGame();
      set({ 
        gameStatus: 'lost', 
        isPlaying: false, 
        elapsedTime,
        hasOngoingGame: false 
      });
      return;
    }

    // Verifica vitória (todas as células preenchidas corretamente)
    const isComplete = board.every(cell => cell.value !== null);
    const isCorrect = board.every(cell => cell.value === cell.correctValue);
    
    if (isComplete && isCorrect) {
      const elapsedTime = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
      
      // Verifica se é um novo recorde
      const isNewRecord = await storageService.saveRecord(difficulty, elapsedTime);
      
      // Atualiza os recordes no estado
      const records = await storageService.loadRecords();
      
      // Limpa o jogo salvo
      await storageService.clearCurrentGame();
      
      set({ 
        gameStatus: 'won', 
        isPlaying: false, 
        elapsedTime,
        isNewRecord,
        records,
        hasOngoingGame: false 
      });
    }
  },
}));