import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, AppState } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Board } from './Board';
import { Controls } from './Controls';
import { GameModal } from './GameModal';
import { useGameStore } from '../store/gameStore';
import { ChevronLeft, CirclePause, CirclePlay } from 'lucide-react-native';

export const GameScreen = () => {
    const { mistakes, difficulty, returnToMenu, updateElapsedTime, elapsedTime, isPaused, pauseGame, resumeFromPause, records } = useGameStore();

    // Atualiza o timer a cada segundo
    useEffect(() => {
        const interval = setInterval(() => {
            updateElapsedTime();
        }, 1000);

        return () => clearInterval(interval);
    }, [updateElapsedTime]);

    // Detecta quando o app é minimizado ou volta ao foreground
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (nextAppState === 'background' || nextAppState === 'inactive') {
                // App foi minimizado - pausa o jogo
                pauseGame();
            } else if (nextAppState === 'active') {
                // App voltou - retoma se estava pausado
                if (isPaused) {
                    resumeFromPause();
                }
            }
        });

        return () => {
            subscription.remove();
        };
    }, [pauseGame, resumeFromPause, isPaused]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handlePauseToggle = () => {
        if (isPaused) {
            resumeFromPause();
        } else {
            pauseGame();
        }
    };

    const currentRecord = records[difficulty];

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <StatusBar style="dark" />

            <View className="flex-1 items-center justify-center p-4">
                {/* Header */}
                <View className="w-full flex-row justify-between items-center mb-6 px-2">
                    <TouchableOpacity
                        onPress={returnToMenu}
                        className="pr-4 py-2 w-20"
                    >
                        <ChevronLeft size={22} color="gray" />
                    </TouchableOpacity>

                    <View className="items-center">
                        <Text className="text-slate-400 text-xs uppercase tracking-wide">Dificuldade {difficulty}</Text>
                        <View className="flex-row items-center gap-2">
                            <Text className="text-slate-900 text-xl font-bold">{formatTime(elapsedTime)}</Text>
                            {/* Botão de Pausa/Retomar */}
                            <TouchableOpacity
                                onPress={handlePauseToggle}
                                className="pl-1"
                            >
                                {isPaused ? (
                                    <CirclePlay size={20} color="gray" />
                                ) : (
                                    <CirclePause size={20} color="gray" />
                                )}
                            </TouchableOpacity>
                        </View>
                        {currentRecord && (
                            <Text className="text-green-600 text-xs mt-1">
                                🏆 {formatTime(currentRecord)}
                            </Text>
                        )}
                    </View>

                    <View className="items-end w-20">
                        <Text className="text-slate-400 text-xs uppercase">Erros</Text>
                        <Text className="text-red-500 text-xl font-bold">{mistakes}/3</Text>
                    </View>
                </View>



                {/* Tabuleiro */}
                <Board />

                {/* Controles */}
                <Controls />
            </View>

            {/* Modal de Vitória/Derrota */}
            <GameModal />
        </SafeAreaView>
    );
};
