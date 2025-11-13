import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Cell, Difficulty } from './sudoku';

const STORAGE_KEYS = {
  CURRENT_GAME: '@sudoku:current_game',
  RECORDS: '@sudoku:records',
};

export interface SavedGame {
  board: Cell[];
  difficulty: Difficulty;
  mistakes: number;
  startTime: number;
  elapsedTime: number;
}

export interface RecordTimes {
  1: number | null;
  2: number | null;
  3: number | null;
  4: number | null;
  5: number | null;
  6: number | null;
}

export const storageService = {
  // Salva o jogo atual
  async saveCurrentGame(game: SavedGame): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_GAME, JSON.stringify(game));
    } catch (error) {
      console.error('Erro ao salvar jogo:', error);
    }
  },

  // Carrega o jogo atual
  async loadCurrentGame(): Promise<SavedGame | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_GAME);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Erro ao carregar jogo:', error);
      return null;
    }
  },

  // Remove o jogo atual (quando termina)
  async clearCurrentGame(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_GAME);
    } catch (error) {
      console.error('Erro ao limpar jogo:', error);
    }
  },

  // Carrega os recordes
  async loadRecords(): Promise<RecordTimes> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.RECORDS);
      return data ? JSON.parse(data) : {
        1: null, 2: null, 3: null, 4: null, 5: null, 6: null
      };
    } catch (error) {
      console.error('Erro ao carregar recordes:', error);
      return {
        1: null, 2: null, 3: null, 4: null, 5: null, 6: null
      };
    }
  },

  // Salva um novo recorde se for melhor que o anterior
  async saveRecord(difficulty: Difficulty, time: number): Promise<boolean> {
    try {
      const records = await this.loadRecords();
      const currentRecord = records[difficulty];
      
      // Se não tem recorde ou o novo tempo é melhor
      if (currentRecord === null || time < currentRecord) {
        records[difficulty] = time;
        await AsyncStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
        return true; // É um novo recorde!
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao salvar recorde:', error);
      return false;
    }
  },

  // Limpa todos os dados (útil para debug)
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([STORAGE_KEYS.CURRENT_GAME, STORAGE_KEYS.RECORDS]);
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
    }
  },
};
