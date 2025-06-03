"use client";
import { useState, useEffect } from "react";
import { WORD_CATEGORIES } from "@/constants/wordCategories";
import { useTimer } from "@/hooks/useTimer";
import { useGameState } from "@/hooks/useGameState";
import { useGameControls } from "@/hooks/useGameControls";
import { Header } from "./Header";
import { ScoreBoard } from "./ScoreBoard";
import { GameCompleteMessage } from "./GameCompleteMessage";
import { GameGrid } from "./GameGrid";
import { WordList } from "./WordList";
import { InfoCards } from "./InfoCards";

export default function WordSearchGame() {
  const [currentCategory, setCurrentCategory] = useState<keyof typeof WORD_CATEGORIES>("LOONA");
  const [mounted, setMounted] = useState(false);

  const timer = useTimer();
  const gameState = useGameState(currentCategory);
  const gameControls = useGameControls({
    gameState: gameState.gameState,
    setGameState: gameState.setGameState,
    startTimer: timer.startTimer,
    stopTimer: timer.stopTimer,
    calculateTimeBonus: timer.calculateTimeBonus,
    elapsedTime: timer.elapsedTime,
    isTimerRunning: timer.isTimerRunning,
    startTime: timer.startTime,
  });

  const foundWordsCount = gameState.gameState.words.filter((w) => w.found).length;
  const isGameComplete = foundWordsCount === gameState.gameState.words.length;

  // Set final score kung commplete na ang game (nakuha nya tanan nga words)
  useEffect(() => {
    if (isGameComplete && timer.finalScore === 0) {
      const finalScoreWithBonus = timer.calculateTimeBonus(
        gameState.gameState.score,
        timer.elapsedTime
      );
      timer.setFinalScore(finalScoreWithBonus);
    }
  }, [isGameComplete, timer.elapsedTime, gameState.gameState.score]);

  const handleCategoryChange = (newCategory: keyof typeof WORD_CATEGORIES) => {
    setCurrentCategory(newCategory);
    gameState.changeCategory(newCategory);
    timer.resetTimer();
  };

  const handleResetGame = () => {
    gameState.resetGame(currentCategory);
    timer.resetTimer();
  };

  useEffect(() => setMounted(true), []);

  return (
    <div className="max-w-screen mx-auto p-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      <Header />
      
      <ScoreBoard
        score={gameState.gameState.score}
        finalScore={timer.finalScore}
        foundWordsCount={foundWordsCount}
        totalWords={gameState.gameState.words.length}
        elapsedTime={timer.elapsedTime}
        isTimerRunning={timer.isTimerRunning}
        formatTime={timer.formatTime}
        currentCategory={currentCategory}
        onCategoryChange={handleCategoryChange}
        onResetGame={handleResetGame}
        isGameComplete={isGameComplete}
      />

      {isGameComplete && (
        <GameCompleteMessage
          elapsedTime={timer.elapsedTime}
          formatTime={timer.formatTime}
          finalScore={timer.finalScore}
          baseScore={gameState.gameState.score}
        />
      )}

      {!mounted ? (
        <div className="justify-self-center text-4xl font-semibold mt-10 text-gray-500">
          🎮 Loading Game...
        </div>
      ) : (
        <main className="flex flex-col items-center gap-6 xl:gap-8">
          <div className="w-full max-w-7xl grid xl:grid-cols-[auto_auto] gap-6 justify-center items-start">
            <GameGrid
              grid={gameState.gameState.grid}
              selectedCells={gameState.gameState.selectedCells}
              onCellMouseDown={gameControls.handleCellMouseDown}
              onCellMouseEnter={gameControls.handleCellMouseEnter}
              onMouseUp={gameControls.handleMouseUp}
            />
            
            <WordList words={gameState.gameState.words} />
          </div>

          <InfoCards />
        </main>
      )}
    </div>
  );
}