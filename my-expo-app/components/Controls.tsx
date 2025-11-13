import React, { memo, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useGameStore } from '../store/gameStore';
import clsx from 'clsx';

const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export const Controls = memo(() => {
  const { setCellValue, selectedCellIndex, board, isPaused } = useGameStore();

  // Verifica se uma célula está selecionada e se ela pode ser editada
  const canEdit = useMemo(() => {
    return selectedCellIndex !== null && !board[selectedCellIndex]?.isFixed && !isPaused;
  }, [selectedCellIndex, board, isPaused]);

  const handleSetValue = useCallback((num: number) => {
    setCellValue(num);
  }, [setCellValue]);

  return (
    <View className="mt-8 w-full px-4">
      <View className="flex-row justify-between flex-wrap gap-2">
        {numbers.map((num) => (
          <TouchableOpacity
            key={num}
            disabled={!canEdit}
            onPress={() => handleSetValue(num)}
            className={clsx(
              "w-5 justify-center items-center shadow-sm",
              canEdit ? "" : ""
            )}
          >
            <Text className={clsx("text-2xl font-semibold", canEdit ? "text-blue-500" : "text-gray-400")}>
              {num}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Botão de Apagar (Opcional, mas útil) */}
      <View className="mt-4 items-center">
         <TouchableOpacity 
            disabled={!canEdit}
            onPress={() => handleSetValue(0)}
            className="p-4"
         >
            <Text className="text-slate-500 font-medium uppercase tracking-widest text-xs">Apagar</Text>
         </TouchableOpacity>
      </View>
    </View>
  );
});

Controls.displayName = 'Controls';