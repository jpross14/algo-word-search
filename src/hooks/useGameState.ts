import { useState } from 'react';
import { GameState } from '@/types/types';
import PuzzleGenerator from '@/services/PuzzleGenerator';
import { WORD_CATEGORIES } from '@/constants/wordCategories';

export const useGameState = (initialCategory: keyof typeof WORD_CATEGORIES) => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const initialWords = WORD_CATEGORIES[initialCategory].words;
    const gridData = PuzzleGenerator.generatePuzzle(initialWords, 12).grid;

    const grid = gridData.map((row, rowIndex) =>
      row.map((letter, colIndex) => ({
        letter,
        row: rowIndex,
        col: colIndex,
        isFound: false,
        isSelected: false,
        wordIndices: [],
      }))
    );

    const words = initialWords.map((word, index) => ({
      word: word.toUpperCase(),
      found: false,
      colorIndex: index,
    }));

    return {
      grid,
      words,
      score: 0,
      isSelecting: false,
      selectedCells: [],
      startCell: null,
      foundWordsCount: 0,
    };
  });

  const resetGame = (category: keyof typeof WORD_CATEGORIES) => {
    const currentWords = WORD_CATEGORIES[category].words;
    const gridData = PuzzleGenerator.generatePuzzle(currentWords, 12).grid;

    const grid = gridData.map((row, rowIndex) =>
      row.map((letter, colIndex) => ({
        letter,
        row: rowIndex,
        col: colIndex,
        isFound: false,
        isSelected: false,
        wordIndices: [],
      }))
    );

    setGameState((prev) => ({
      ...prev,
      grid,
      words: prev.words.map((w) => ({
        ...w,
        found: false,
        path: undefined,
        colorIndex: -1,
      })),
      score: 0,
      isSelecting: false,
      selectedCells: [],
      startCell: null,
      foundWordsCount: 0,
    }));
  };

  const changeCategory = (newCategory: keyof typeof WORD_CATEGORIES) => {
    const newWords = WORD_CATEGORIES[newCategory].words;
    const gridData = PuzzleGenerator.generatePuzzle(newWords, 12).grid;

    const grid = gridData.map((row, rowIndex) =>
      row.map((letter, colIndex) => ({
        letter,
        row: rowIndex,
        col: colIndex,
        isFound: false,
        isSelected: false,
        wordIndices: [],
      }))
    );

    setGameState({
      grid,
      words: newWords.map((word, index) => ({
        word: word.toUpperCase(),
        found: false,
        colorIndex: index,
      })),
      score: 0,
      isSelecting: false,
      selectedCells: [],
      startCell: null,
      foundWordsCount: 0,
    });
  };

  return {
    gameState,
    setGameState,
    resetGame,
    changeCategory
  };
};