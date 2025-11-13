import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { useGameStore } from '../store/gameStore';

export const GameModal = () => {
  const { gameStatus, elapsedTime, startGame, returnToMenu, difficulty, isNewRecord, records } = useGameStore();
  
  const isVisible = gameStatus === 'won' || gameStatus === 'lost';
  const isWin = gameStatus === 'won';

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentRecord = records[difficulty];

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View className="flex-1 bg-black/50 items-center justify-center px-6">
        <View className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl">
          {/* Emoji e Título */}
          <View className="items-center mb-6">
            <Text className="text-6xl mb-4">{isWin ? '🎉' : '😔'}</Text>
            <Text className="text-3xl font-bold text-slate-900">
              {isWin ? 'Parabéns!' : 'Game Over'}
            </Text>
            <Text className="text-slate-500 text-center mt-2">
              {isWin 
                ? 'Você completou o Sudoku!' 
                : 'Você atingiu 3 erros'}
            </Text>
            {isWin && isNewRecord && (
              <View className="mt-3 bg-yellow-100 px-4 py-2 rounded-full">
                <Text className="text-yellow-700 font-bold text-sm">🏆 NOVO RECORDE!</Text>
              </View>
            )}
          </View>

          {/* Estatísticas */}
          <View className="bg-slate-50 rounded-2xl p-4 mb-6">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-slate-600 text-sm">Tempo</Text>
              <Text className="text-slate-900 text-xl font-bold">{formatTime(elapsedTime)}</Text>
            </View>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-slate-600 text-sm">Dificuldade</Text>
              <Text className="text-slate-900 text-lg font-semibold">Nível {difficulty}</Text>
            </View>
            {isWin && currentRecord && (
              <View className="flex-row justify-between items-center pt-2 border-t border-slate-200">
                <Text className="text-slate-600 text-sm">Recorde</Text>
                <Text className="text-green-600 text-lg font-semibold">{formatTime(currentRecord)}</Text>
              </View>
            )}
          </View>

          {/* Botões */}
          <View className="gap-3">
            <TouchableOpacity
              onPress={() => startGame(difficulty)}
              className="bg-blue-500 py-4 rounded-xl active:bg-blue-600"
            >
              <Text className="text-white text-center font-bold text-lg">
                Novo Jogo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={returnToMenu}
              className="bg-slate-200 py-4 rounded-xl active:bg-slate-300"
            >
              <Text className="text-slate-700 text-center font-bold text-lg">
                Menu Principal
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
