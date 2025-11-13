import React, { useCallback, memo } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useGameStore } from '../store/gameStore';
import type { Cell as CellType } from '../lib/sudoku';
import clsx from 'clsx';

// Calcula tamanho da tela para garantir que o grid fique quadrado
const { width } = Dimensions.get('window');
const BOARD_SIZE = width - 32; // 16px de padding de cada lado

// Componente Cell com memoization para evitar re-renders desnecessários
interface CellProps {
  cell: CellType;
  index: number;
  isSelected: boolean;
  onPress: (index: number) => void;
}

const Cell = memo<CellProps>(({ cell, index, isSelected, onPress }) => {
  const col = index % 9;
  const row = Math.floor(index / 9);

  // Lógica para as bordas grossas dos quadrantes 3x3
  const isRightBorderThick = (col + 1) % 3 === 0 && col !== 8;
  const isBottomBorderThick = (row + 1) % 3 === 0 && row !== 8;

  const handlePress = useCallback(() => {
    onPress(index);
  }, [onPress, index]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      className={clsx(
        "w-[11.11%] h-[11.11%] justify-center items-center border-slate-200",
        // Bordas base
        "border-r border-b",
        // Bordas grossas dos quadrantes
        isRightBorderThick && "border-r-2 border-r-slate-800",
        isBottomBorderThick && "border-b-2 border-b-slate-800",
        // Estilos de estado
        isSelected && "bg-blue-200",
        cell.isError && !isSelected && "bg-red-100",
        cell.value === null && !isSelected && "bg-white"
      )}
    >
      {cell.value && (
        <Text
          className={clsx(
            "text-xl md:text-2xl",
            cell.isFixed ? "font-bold text-slate-900" : "font-medium text-blue-600",
            cell.isError && "text-red-500"
          )}
        >
          {cell.value}
        </Text>
      )}
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  // Custom comparison: só re-renderiza se mudou algo relevante
  return (
    prevProps.cell.value === nextProps.cell.value &&
    prevProps.cell.isError === nextProps.cell.isError &&
    prevProps.cell.isFixed === nextProps.cell.isFixed &&
    prevProps.isSelected === nextProps.isSelected
  );
});

Cell.displayName = 'Cell';

export const Board = memo(() => {
  const { board, selectCell, selectedCellIndex, isPaused } = useGameStore();

  const handleSelectCell = useCallback((index: number) => {
    if (!isPaused) {
      selectCell(index);
    }
  }, [selectCell, isPaused]);

  return (
    <View 
      className="flex-row flex-wrap border-2 border-slate-800 bg-white"
      style={{ width: BOARD_SIZE, height: BOARD_SIZE }}
    >
      {board.map((cell, index) => (
        <Cell
          key={index}
          cell={cell}
          index={index}
          isSelected={selectedCellIndex === index}
          onPress={handleSelectCell}
        />
      ))}
    </View>
  );
});

Board.displayName = 'Board';
