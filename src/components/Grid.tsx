// components/Grid.tsx
import { useState, useEffect } from 'react';
import { runRabinKarpInGrid } from '@/utils/rabinKarp';

interface GridProps {
  words: string[];
  onWordFound: (word: string) => void;
}

const CHAR_POOL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const GRID_SIZE = 10;

const generateGridWithWords = (words: string[]): string[][] => {
   const grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(''));

   for (const word of words) {
      let placed = false;
      while (!placed) {
         const row = Math.floor(Math.random() * GRID_SIZE);
         const col = Math.floor(Math.random() * (GRID_SIZE - word.length));

         // Checking kng ang space available
         let canPlace = true;
         for (let i = 0; i < word.length; i++) {
            if (grid[row][col] !== "") {
               canPlace = false;
               break;
            }
         }

         if (canPlace) {
            for (let i = 0; i < word.length; i++) {
               grid[row][col + i] = word[i];
            }
            placed = true;
         }
      }
   }

   // Para i-fill in ang mga na-remain empty nga cells with just random letters
   for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
         if (grid[r][c] === '') {
            grid[r][c] =CHAR_POOL[Math.floor(Math.random() * CHAR_POOL.length)];
         }
      }
   }

   return grid;
};

export default function Grid({ words, onWordFound }: GridProps) {
  const [grid, setGrid] = useState<string[][]>([]);
  const [selectedCells, setSelectedCells] = useState<[number, number][]>([]);

  useEffect(() => {
    setGrid(generateGridWithWords(words));
  }, [words]);

  const handleCellClick = (row: number, col: number) => {
    setSelectedCells([...selectedCells, [row, col]]);
  };

  useEffect(() => {
    if (selectedCells.length > 1) {
      const selectedWord = selectedCells
        .map(([r, c]) => grid[r][c])
        .join('');
      const found = runRabinKarpInGrid(selectedWord, words);
      if (found) {
        onWordFound(found);
      }
    }
  }, [selectedCells, grid, words, onWordFound]);

  return (
    <div className="grid grid-cols-10 gap-1 mb-4">
      {grid.map((row, rowIndex) =>
        row.map((char, colIndex) => {
          const selected = selectedCells.some(([r, c]) => r === rowIndex && c === colIndex);
          return (
            <button
              key={`${rowIndex}-${colIndex}`}
              onClick={() => handleCellClick(rowIndex, colIndex)}
              className={`w-8 h-8 flex items-center justify-center border text-lg font-mono ${
                selected ? 'bg-yellow-300' : 'bg-white'
              }`}
            >
              {char}
            </button>
          );
        })
      )}
    </div>
  );
}
