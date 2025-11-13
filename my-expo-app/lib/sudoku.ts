import { getSudoku } from 'sudoku-gen';

export type Cell = {
  value: number | null; // O valor atual (1-9 ou null)
  correctValue: number; // O valor que DEVERIA estar ali (para checar vitória)
  isFixed: boolean;     // Se true, é um número inicial (não pode mudar)
  isError: boolean;     // Se o usuário errou
  notes: number[];      // Para a funcionalidade de anotações (futuro)
};

export type Difficulty = 1 | 2 | 3 | 4 | 5 | 6;

// Configuração de quantos buracos (células vazias) cada nível tem
// Nível 1 = Muito fácil (20 buracos), Nível 7 = Insano (60 buracos)
const DIFFICULTY_HOLES: Record<Difficulty, number> = {
  1: 30,
  2: 40,
  3: 45,
  4: 50,
  5: 55,
  6: 60,
};

export const generateGame = (difficulty: Difficulty): Cell[] => {
  // 1. Gera um sudoku resolvido completo
  const raw = getSudoku('easy'); // A dificuldade aqui não importa, queremos só a solução
  const solvedArray = raw.solution.split('').map(Number);

  // 2. Cria as células preenchidas
  let cells: Cell[] = solvedArray.map((num) => ({
    value: num,
    correctValue: num,
    isFixed: true,
    isError: false,
    notes: [],
  }));

  // 3. Remove números aleatoriamente baseado na dificuldade
  const holesNeeded = DIFFICULTY_HOLES[difficulty];
  let holesRemoved = 0;
  const indices = Array.from({ length: 81 }, (_, i) => i); // [0, 1, ... 80]

  // Embaralha os índices para remover aleatoriamente
  indices.sort(() => Math.random() - 0.5);

  for (const index of indices) {
    if (holesRemoved >= holesNeeded) break;
    
    cells[index].value = null;
    cells[index].isFixed = false;
    holesRemoved++;
  }

  return cells;
};