import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useGameStore } from '../store/gameStore';
import type { Difficulty } from '../lib/sudoku';

export const MenuScreen = () => {
  const { startGame, resumeGame, hasOngoingGame, records } = useGameStore();

  const difficulties: { level: Difficulty; label: string; description: string; color: string }[] = [
    { level: 1, label: 'Muito Fácil', description: '30 células vazias', color: 'bg-green-500' },
    { level: 2, label: 'Fácil', description: '40 células vazias', color: 'bg-blue-500' },
    { level: 3, label: 'Médio', description: '45 células vazias', color: 'bg-yellow-500' },
    { level: 4, label: 'Difícil', description: '50 células vazias', color: 'bg-orange-500' },
    { level: 5, label: 'Muito Difícil', description: '55 células vazias', color: 'bg-red-500' },
    { level: 6, label: 'Insano', description: '60 células vazias', color: 'bg-purple-500' },
  ];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView 
        contentContainerClassName="items-center justify-center px-6 py-12"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="items-center mb-12 pt-10">
          <Text className="text-5xl font-bold text-slate-900 mb-2">Sudoku</Text>
          <Text className="text-slate-500 text-center">
            Escolha sua dificuldade e comece a jogar
          </Text>
        </View>

        {/* Botão Continuar Jogo (se houver) */}
        {hasOngoingGame && (
          <View className="w-full max-w-md mb-6">
            <TouchableOpacity
              onPress={resumeGame}
              className="bg-purple-600 p-6 rounded-2xl active:opacity-80 shadow-xl"
            >
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-white text-2xl font-bold mb-1">Continuar</Text>
                  <Text className="text-white/90 text-sm">Retome seu jogo atual</Text>
                </View>
                <Text className="text-white text-2xl">🎮</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Botões de Dificuldade */}
        <View className="w-full max-w-md gap-3">
          {difficulties.map((diff) => {
            const record = records[diff.level];
            return (
              <TouchableOpacity
                key={diff.level}
                onPress={() => startGame(diff.level)}
                className={`${diff.color} p-5 rounded-2xl active:opacity-80 shadow-lg`}
              >
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text className="text-white text-xl font-bold mb-1">
                      {diff.label}
                    </Text>
                    <Text className="text-white/80 text-sm">
                      {diff.description}
                    </Text>
                    {record && (
                      <Text className="text-white/90 text-xs mt-1">
                        🏆 Recorde: {formatTime(record)}
                      </Text>
                    )}
                  </View>
                  <Text className="text-white text-3xl font-bold">
                    {diff.level}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Footer */}
        {/* <View className="mt-12 items-center">
          <Text className="text-slate-400 text-xs">
            Boa sorte! 🍀
          </Text>
        </View> */}
      </ScrollView>
    </View>
  );
};
