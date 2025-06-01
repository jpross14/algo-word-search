"use client";
// Main Component
import { GameState } from "@/types/types";
import { useCallback, useRef, useState } from "react";
import PuzzleGenerator from "@/services/PuzzleGenerator";
import RabinKarpVerifier from "@/services/RabinKarpVerifier";

export default function WordSearchGame () {
   // Sample word list
   const SAMPLE_WORDS = [
      'REACT', 'SCRIPT', 'NEXT', 'CODE', 'WEB', 
      'APP', 'SEARCH', 'WORD', 'GAME', 'FUN'
   ];

   const [gameState, setGameState] = useState<GameState>(() => {
      // Pang-generate puzzle gamit si PuzzleGenerator
      const gridData = PuzzleGenerator.generatePuzzle(SAMPLE_WORDS, 12).grid;

      const grid = gridData.map((row, rowIndex) => 
         row.map((letter, colIndex) => ({
            letter,
            row: rowIndex,
            col: colIndex,
            isFound: false,
            isSelected: false
         }))
      );

      const words = SAMPLE_WORDS.map(word => ({ word: word.toUpperCase(), found: false }));

      return {
         grid,
         words,
         score: 0,
         isSelecting: false,
         selectedCells: [],
         startCell: null
      };
   });

   const gridRef = useRef<HTMLDivElement>(null);

   // ===============================
   // FILE: hooks/useGameControls.ts
   // ===============================
   const handleCellMouseDown = useCallback((row: number, col: number) => {
      setGameState(prev => ({
         ...prev,
         isSelecting: true,
         startCell: { row, col },
         selectedCells: [{ row, col }]
      }));
   }, [])

   const handleCellMouseEnter = useCallback((row: number, col: number) => {
      if (!gameState.isSelecting || !gameState.startCell) return;

      const { row: startRow, col: startCol } = gameState.startCell;
      const deltaRow = row - startRow;
      const deltaCol = col - startCol;

      // Check kng valid sya na straight line direction
      const isValidDirection = deltaRow === 0 || deltaCol === 0 || Math.abs(deltaRow) === Math.abs(deltaCol);

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
                  col: startCol + Math.round(i * stepCol)
               });
            }
         }

         setGameState(prev => ({
            ...prev,
            selectedCells: path
         }));
      }
   }, [gameState.isSelecting, gameState.startCell]);

   const handleMouseUp = useCallback(() => {
      if (!gameState.isSelecting || gameState.selectedCells.length === 0) {
         setGameState(prev => ({
            ...prev,
            isSelecting: false,
            selectedCells: [],
            startCell: null
         }));
         return;
      }

      //convert ang grid to string array para magamit sng Rabin-Karp
      const gridStrings = gameState.grid.map(row => row.map(cell => cell.letter));
      const wordList = gameState.words.map(w => w.word);

      // Gamita Rabin-karp to verify ang selection
      const verification = RabinKarpVerifier.verifySelection(
         gridStrings,
         gameState.selectedCells,
         wordList
      );

      if (verification.isValid && verification.word) {
         const wordIndex = gameState.words.findIndex(w =>
            w.word === verification.word && !w.found
         );

         if (wordIndex !== -1) {
            // Word found! Update ang state
            setGameState(prev => {
               const newGrid = prev.grid.map(row => row.map(cell => ({
                  ...cell,
                  isFound: prev.selectedCells.some(sc => sc.row === cell.row && sc.col === cell.col)
                     ? true
                     : cell.isFound
               })));

               const newWords = [...prev.words];
               newWords[wordIndex] = {
                  ...newWords[wordIndex],
                  found: true,
                  path: prev.selectedCells
               };

               return {
                  ...prev,
                  grid: newGrid,
                  words: newWords,
                  score: prev.score + verification.word!.length * 10,
                  isSelecting: false,
                  selectedCells: [],
                  startCell: null
               };
            });
            return;
         }
      }

      // If word is not found or already found, i-clear lng naton ang selection
      setGameState(prev => ({
         ...prev,
         isSelecting: false,
         selectedCells: [],
         startCell: null
      }));
   }, [gameState.isSelecting, gameState.selectedCells, gameState.grid, gameState.words]);

   const resetGame = () => {
      // Generate sng bag-o nga puzzle
      const gridData = PuzzleGenerator.generatePuzzle(SAMPLE_WORDS, 12).grid;

      const grid = gridData.map((row, rowIndex) =>
         row.map((letter, colIndex) => ({
            letter,
            row: rowIndex,
            col: colIndex,
            isFound: false,
            isSelected: false
         }))
      );

      setGameState(prev => ({
         ...prev,
         grid,
         words: prev.words.map(w => ({ ...w, found: false, path: undefined})),
         score: 0,
         isSelecting: false,
         selectedCells: [],
         startCell: null
      }));
   };

   const foundWordsCount = gameState.words.filter(w => w.found).length;
   const isGameComplete = foundWordsCount === gameState.words.length;

   return (
      <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
         {/* ===============================
          FILE: components/Header.tsx
          =============================== */}
         <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Wise Ways Word Search</h1>
            <p className="text-gray-600">Find all hidden words using advanced Rabin-Karp algorithm!</p>
         </div>

         {/* ===============================
          FILE: components/ScoreBoard.tsx
          =============================== */}
         <div className="flex justify-between items-center mb-6 bg-white rounded-lg p-4 shadow-md">
            <div className="text-center">
               <div className="text-2xl font-bold text-blue-600">{gameState.score}</div>
               <div className="text-sm text-gray-500">Score</div>
            </div>

            <div className="text-center">
               <div className="text-2xl font-bold text-green-600">{foundWordsCount}/{gameState.words.length}</div>
               <div className="text-sm text-gray-500">Words Found</div>
            </div>

            <div className="text-center">
               <div className="text-lg font-semibold text-purple-600">Rabin-Karp</div>
               <div className="text-sm text-gray-500">Algorithm</div>
            </div>

            <button
               onClick={resetGame}
               className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
               New Puzzle
            </button> 
         </div>

         {/* Game Complete Message */}
         {isGameComplete && (
         <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6 text-center">
            🎉 Amazing! You found all words! Final Score: {gameState.score} 🎉
         </div>
         )}
         
         <div className="flex flex-col xl:flex-row gap-6">
            {/* ===============================
            FILE: components/GameBoard.tsx
            =============================== */}
            <div className="flex-1">
               <div
                  ref={gridRef}
                  className="inline-block bg-white p-4 rounded-lg shadow-lg select-none"
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
               >
                  <div className="grid grid-cols-12 gap-1">
                     {gameState.grid.map((row, rowIndex) =>
                        row.map((cell, colIndex) => {
                           const isSelected = gameState.selectedCells.some(
                           sc => sc.row === rowIndex && sc.col === colIndex
                           );
                           
                           return (
                           <div
                              key={`${rowIndex}-${colIndex}`}
                              className={`
                                 w-8 h-8 flex items-center justify-center text-xs font-bold cursor-pointer
                                 border border-gray-300 transition-all duration-150 rounded
                                 ${cell.isFound 
                                 ? 'bg-green-200 text-green-800 border-green-400 shadow-sm' 
                                 : isSelected
                                 ? 'bg-blue-200 text-blue-800 border-blue-400 shadow-sm'
                                 : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                                 }
                              `}
                              onMouseDown={() => handleCellMouseDown(rowIndex, colIndex)}
                              onMouseEnter={() => handleCellMouseEnter(rowIndex, colIndex)}
                           >
                              {cell.letter}
                           </div>
                           );
                        })
                     )}
                  </div>
               </div>
            </div>

            {/* ===============================
            FILE: components/WordList.tsx
            =============================== */}
            <div className="xl:w-80">
               <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Words to Find</h3>
                  <div className="grid grid-cols-2 xl:grid-cols-1 gap-2">
                  {gameState.words.map((wordItem, index) => (
                     <div
                        key={index}
                        className={`
                        p-3 rounded-lg text-sm font-medium transition-all
                        ${wordItem.found 
                           ? 'bg-green-100 text-green-800 border border-green-200' 
                           : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }
                        `}
                     >
                        <div className="flex justify-between items-center">
                        <span className={wordItem.found ? 'line-through' : ''}>
                           {wordItem.word}
                        </span>
                        {wordItem.found && <span className="text-green-600">✓</span>}
                        </div>
                     </div>
                  ))}
                  </div>
               </div>

               {/* ===============================
               FILE: components/Instructions.tsx
               =============================== */}
               <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
                  <h4 className="font-semibold mb-2">🎮 How to Play:</h4>
                  <ul className="space-y-1">
                     <li>• Click and drag to select words</li>
                     <li>• Words can go in any direction</li>
                     <li>• Words can be forwards or backwards</li>
                     <li>• Uses Rabin-Karp for fast verification</li>
                     <li>• Find all words to win!</li>
                  </ul>
               </div>

               {/* Algorithm Info */}
               <div className="mt-4 bg-purple-50 rounded-lg p-4 text-sm text-purple-800">
                  <h4 className="font-semibold mb-2">🔬 Algorithm Features:</h4>
                  <ul className="space-y-1">
                     <li>• Rolling hash for efficiency</li>
                     <li>• O(nm) average complexity</li>
                     <li>• 8-directional search</li>
                     <li>• Collision handling</li>
                  </ul>
               </div>
            </div>
         </div>
      </div>
   );
}