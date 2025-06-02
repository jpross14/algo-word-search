import { useCallback } from 'react';
import { GameState } from '@/types/types';
import RabinKarpVerifier from '@/services/RabinKarpVerifier';

interface UseGameControlsProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  startTimer: () => void;
  stopTimer: () => void;
  calculateTimeBonus: (baseScore: number, timeInSeconds: number) => number;
  elapsedTime: number;
  isTimerRunning: boolean;
  startTime: number | null;
}

export const useGameControls = ({
  gameState,
  setGameState,
  startTimer,
  stopTimer,
  calculateTimeBonus,
  elapsedTime,
  isTimerRunning,
  startTime
}: UseGameControlsProps) => {
  
  const handleCellMouseDown = useCallback(
    (row: number, col: number) => {
      if (!isTimerRunning && startTime === null) {
        startTimer();
      }

      setGameState((prev) => ({
        ...prev,
        isSelecting: true,
        startCell: { row, col },
        selectedCells: [{ row, col }],
      }));
    },
    [isTimerRunning, startTime, setGameState, startTimer]
  );

  const handleCellMouseEnter = useCallback(
    (row: number, col: number) => {
      if (!gameState.isSelecting || !gameState.startCell) return;

      const { row: startRow, col: startCol } = gameState.startCell;
      const deltaRow = row - startRow;
      const deltaCol = col - startCol;

      const isValidDirection =
        deltaRow === 0 ||
        deltaCol === 0 ||
        Math.abs(deltaRow) === Math.abs(deltaCol);

      if (isValidDirection) {
        const path: { row: number; col: number }[] = [];
        const steps = Math.max(Math.abs(deltaRow), Math.abs(deltaCol));

        if (steps === 0) {
          path.push({ row: startRow, col: startCol });
        } else {
          const stepRow = deltaRow / steps;
          const stepCol = deltaCol / steps;

          for (let i = 0; i <= steps; i++) {
            path.push({
              row: startRow + Math.round(i * stepRow),
              col: startCol + Math.round(i * stepCol),
            });
          }
        }

        setGameState((prev) => ({
          ...prev,
          selectedCells: path,
        }));
      }
    },
    [gameState.isSelecting, gameState.startCell, setGameState]
  );

  const handleMouseUp = useCallback(() => {
    if (!gameState.isSelecting || gameState.selectedCells.length === 0) {
      setGameState((prev) => ({
        ...prev,
        isSelecting: false,
        selectedCells: [],
        startCell: null,
      }));
      return;
    }

    const gridStrings = gameState.grid.map((row) =>
      row.map((cell) => cell.letter)
    );
    const wordList = gameState.words.map((w) => w.word);

    const verification = RabinKarpVerifier.verifySelection(
      gridStrings,
      gameState.selectedCells,
      wordList
    );

    if (verification.isValid && verification.word) {
      const wordIndex = gameState.words.findIndex(
        (w) => w.word === verification.word && !w.found
      );

      if (wordIndex !== -1) {
        setGameState((prev) => {
          const newFoundWordsCount = prev.foundWordsCount + 1;
          const colorIndex = prev.foundWordsCount;
          const newScore = prev.score + verification.word!.length * 10;

          const newGrid = prev.grid.map((row) =>
            row.map((cell) => {
              const isInPath = prev.selectedCells.some(
                (sc) => sc.row === cell.row && sc.col === cell.col
              );
              if (isInPath) {
                return {
                  ...cell,
                  isFound: true,
                  wordIndices: [...cell.wordIndices, wordIndex],
                };
              }
              return cell;
            })
          );

          const newWords = [...prev.words];
          newWords[wordIndex] = {
            ...newWords[wordIndex],
            found: true,
            path: prev.selectedCells,
            colorIndex: colorIndex,
          };

          const isComplete = newFoundWordsCount === prev.words.length;
          if (isComplete) {
            stopTimer();
          }

          return {
            ...prev,
            grid: newGrid,
            words: newWords,
            score: newScore,
            isSelecting: false,
            selectedCells: [],
            startCell: null,
            foundWordsCount: newFoundWordsCount,
          };
        });
        return;
      }
    }

    setGameState((prev) => ({
      ...prev,
      isSelecting: false,
      selectedCells: [],
      startCell: null,
    }));
  }, [
    gameState.isSelecting,
    gameState.selectedCells,
    gameState.grid,
    gameState.words,
    setGameState,
    stopTimer
  ]);

  return {
    handleCellMouseDown,
    handleCellMouseEnter,
    handleMouseUp
  };
};
