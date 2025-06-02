"use client";
// Main Component
import { GameState } from "@/types/types";
import { useCallback, useRef, useState, useEffect } from "react";
import PuzzleGenerator from "@/services/PuzzleGenerator";
import RabinKarpVerifier from "@/services/RabinKarpVerifier";
import { WORD_CATEGORIES } from "@/constants/wordCategories";

export default function WordSearchGame() {
   // const SAMPLE_WORDS = [
   //    'REACT', 'SCRIPT', 'NEXT', 'CODE', 'WEB', 
   //    'APP', 'SEARCH', 'WORD', 'GAME', 'FUN'
   // ];
   // const SAMPLE_WORDS = [
   //    'HEEJIN', 'HYUNJIN', 'HASEUL', 'YEOJIN', 'VIVI', 
   //    'KIMLIP', 'JINSOUL', 'CHOERRY', 'YVES', 'CHUU', 'GOWON', 'HYEJU'
   // ];

   const [currentCategory, setCurrentCategory] = useState<keyof typeof WORD_CATEGORIES>('LOONA');

   // Enhanced color palette with better opacity support
   const WORD_COLORS = [
      { bg: 'bg-pink-300/60', text: 'text-pink-900', border: 'border-pink-400', name: 'pink', rgb: '236, 72, 153' },
      { bg: 'bg-yellow-300/60', text: 'text-yellow-900', border: 'border-yellow-400', name: 'yellow', rgb: '234, 179, 8' },
      { bg: 'bg-green-300/60', text: 'text-green-900', border: 'border-green-400', name: 'green', rgb: '34, 197, 94' },
      { bg: 'bg-orange-400/60', text: 'text-orange-900', border: 'border-orange-500', name: 'orange', rgb: '249, 115, 22' },
      { bg: 'bg-rose-200/60', text: 'text-rose-900', border: 'border-rose-300', name: 'rose', rgb: '255, 204, 211' },
      { bg: 'bg-red-300/60', text: 'text-red-900', border: 'border-red-400', name: 'red', rgb: '239, 68, 68' },
      { bg: 'bg-blue-300/60', text: 'text-blue-900', border: 'border-blue-400', name: 'blue', rgb: '59, 130, 246' },
      { bg: 'bg-purple-300/60', text: 'text-purple-900', border: 'border-purple-400', name: 'purple', rgb: '147, 51, 234' },
      { bg: 'bg-fuchsia-300/60', text: 'text-fuchsia-900', border: 'border-fuchsia-400', name: 'fuchsia', rgb: '237, 106, 255' },
      { bg: 'bg-orange-200/60', text: 'text-orange-900', border: 'border-orange-300', name: 'peach', rgb: '255, 214, 167' },
      { bg: 'bg-cyan-300/60', text: 'text-cyan-900', border: 'border-cyan-400', name: 'cyan', rgb: '6, 182, 212' },
      { bg: 'bg-indigo-300/60', text: 'text-indigo-900', border: 'border-indigo-400', name: 'indigo', rgb: '99, 102, 241' },
   ]; 

   const [gameState, setGameState] = useState<GameState>(() => {
      const initialWords = WORD_CATEGORIES[currentCategory].words;
      const gridData = PuzzleGenerator.generatePuzzle(initialWords, 12).grid;

      const grid = gridData.map((row, rowIndex) => 
         row.map((letter, colIndex) => ({
            letter,
            row: rowIndex,
            col: colIndex,
            isFound: false,
            isSelected: false,
            wordIndices: [] // Initialize as empty array
         }))
      );

      const words = initialWords.map((word, index) => ({ 
         word: word.toUpperCase(), 
         found: false,
         colorIndex: index
      }));

      return {
         grid,
         words,
         score: 0,
         isSelecting: false,
         selectedCells: [],
         startCell: null,
         foundWordsCount: 0
      };
   });

   const gridRef = useRef<HTMLDivElement>(null);

   // Enhanced function to create blended background for overlapping cells
   const getBlendedBackground = (wordIndices: number[]) => {
      if (wordIndices.length === 0) return null;
      if (wordIndices.length === 1) {
         const color = WORD_COLORS[wordIndices[0] % WORD_COLORS.length];
         return color;
      }
      
      // For multiple overlapping words, create a gradient
      const colors = wordIndices.map(idx => WORD_COLORS[idx % WORD_COLORS.length]);
      const rgbColors = colors.map(c => c.rgb);
      
      if (rgbColors.length === 2) {
         return {
            style: {
               background: `linear-gradient(135deg, rgba(${rgbColors[0]}, 0.7) 0%, rgba(${rgbColors[1]}, 0.7) 100%)`,
               border: '2px solid rgba(0, 0, 0, 0.2)'
            },
            text: 'text-gray-900 font-bold'
         };
      } else {
         // For 3+ words, create a more complex gradient
         const gradientStops = rgbColors.map((rgb, index) => 
            `rgba(${rgb}, 0.6) ${(index * 100) / (rgbColors.length - 1)}%`
         ).join(', ');
         
         return {
            style: {
               background: `linear-gradient(45deg, ${gradientStops})`,
               border: '2px solid rgba(0, 0, 0, 0.3)'
            },
            text: 'text-gray-900 font-bold'
         };
      }
   };

   // Enhanced cell styling function
   const getCellStyling = (cell: any, isSelected: boolean) => {
      if (cell.isFound && cell.wordIndices.length > 0) {
         const blendedStyle = getBlendedBackground(cell.wordIndices);
         if (blendedStyle) {
            if ('style' in blendedStyle) {
               // Custom gradient style
               return {
                  className: `${blendedStyle.text} shadow-md`,
                  style: blendedStyle.style
               };
            } else {
               // Single color
               return {
                  className: `${blendedStyle.bg} ${blendedStyle.text} ${blendedStyle.border} shadow-sm border-2`,
                  style: {}
               };
            }
         }
      }
      
      if (isSelected) {
         return {
            className: 'bg-blue-200 text-blue-800 border-blue-400 shadow-sm border-2',
            style: {}
         };
      }
      
      return {
         className: 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-300',
         style: {}
      };
   };

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
   }, []);

   const handleCellMouseEnter = useCallback((row: number, col: number) => {
      if (!gameState.isSelecting || !gameState.startCell) return;

      const { row: startRow, col: startCol } = gameState.startCell;
      const deltaRow = row - startRow;
      const deltaCol = col - startCol;

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

      const gridStrings = gameState.grid.map(row => row.map(cell => cell.letter));
      const wordList = gameState.words.map(w => w.word);

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
            setGameState(prev => {
               const newFoundWordsCount = prev.foundWordsCount + 1;
               const colorIndex = prev.foundWordsCount;

               // Enhanced grid update to handle multiple word indices per cell
               const newGrid = prev.grid.map(row => row.map(cell => {
                  const isInPath = prev.selectedCells.some(sc => sc.row === cell.row && sc.col === cell.col);
                  if (isInPath) {
                     return {
                        ...cell,
                        isFound: true,
                        wordIndices: [...cell.wordIndices, wordIndex] // Add to existing indices
                     };
                  }
                  return cell;
               }));

               const newWords = [...prev.words];
               newWords[wordIndex] = {
                  ...newWords[wordIndex],
                  found: true,
                  path: prev.selectedCells,
                  colorIndex: colorIndex
               };

               return {
                  ...prev,
                  grid: newGrid,
                  words: newWords,
                  score: prev.score + verification.word!.length * 10,
                  isSelecting: false,
                  selectedCells: [],
                  startCell: null,
                  foundWordsCount: newFoundWordsCount
               };
            });
            return;
         }
      }

      setGameState(prev => ({
         ...prev,
         isSelecting: false,
         selectedCells: [],
         startCell: null
      }));
   }, [gameState.isSelecting, gameState.selectedCells, gameState.grid, gameState.words]);

   const resetGame = () => {
      const currentWords = WORD_CATEGORIES[currentCategory].words;
      const gridData = PuzzleGenerator.generatePuzzle(currentWords, 12).grid;

      const grid = gridData.map((row, rowIndex) =>
         row.map((letter, colIndex) => ({
            letter,
            row: rowIndex,
            col: colIndex,
            isFound: false,
            isSelected: false,
            wordIndices: []
         }))
      );

      setGameState(prev => ({
         ...prev,
         grid,
         words: prev.words.map(w => ({ ...w, found: false, path: undefined, colorIndex: -1})),
         score: 0,
         isSelecting: false,
         selectedCells: [],
         startCell: null,
         foundWordsCount: 0
      }));
   };

   const handleCategoryChange = (newCategory: keyof typeof WORD_CATEGORIES) => {
      setCurrentCategory(newCategory);
      
      const newWords = WORD_CATEGORIES[newCategory].words;
      const gridData = PuzzleGenerator.generatePuzzle(newWords, 12).grid;

      const grid = gridData.map((row, rowIndex) =>
         row.map((letter, colIndex) => ({
            letter,
            row: rowIndex,
            col: colIndex,
            isFound: false,
            isSelected: false,
            wordIndices: []
         }))
      );

      setGameState({
         grid,
         words: newWords.map((word, index) => ({ 
            word: word.toUpperCase(), 
            found: false,
            colorIndex: index
         })),
         score: 0,
         isSelecting: false,
         selectedCells: [],
         startCell: null,
         foundWordsCount: 0
      });
   };

   const foundWordsCount = gameState.words.filter(w => w.found).length;
   const isGameComplete = foundWordsCount === gameState.words.length;
   const [mounted, setMounted] = useState(false);
   useEffect(() => setMounted(true), []);

   return (
      <div className="max-w-screen mx-auto p-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
         {/* ===============================
          FILE: components/Header.tsx
          =============================== */}
         <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Wise Ways Word Search</h1>
            <p className="text-gray-600">Find all hidden words in the puzzle!</p>
         </div>

         {/* ===============================
          FILE: components/ScoreBoard.tsx
          =============================== */}
         <div className="flex justify-between items-center mb-6 bg-white rounded-lg p-4 shadow-md px-10">
            <div className="text-center">
               <div className="text-2xl font-bold text-blue-600">{gameState.score}</div>
               <div className="text-sm text-gray-500">Score</div>
            </div>

            <div className="text-center">
               <div className="text-2xl font-bold text-green-600">{foundWordsCount}/{gameState.words.length}</div>
               <div className="text-sm text-gray-500">Words Found</div>
            </div>

            {/* Category Dropdown */}
            <div className="flex flex-col items-center">
               <select
                  value={currentCategory}
                  onChange={(e) => handleCategoryChange(e.target.value as keyof typeof WORD_CATEGORIES)}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium border-0 outline-none cursor-pointer hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md"
               >
                  {Object.entries(WORD_CATEGORIES).map(([key, category]) => (
                     <option key={key} value={key} className="bg-white text-gray-800">
                        {category.icon} {category.name}
                     </option>
                  ))}
               </select>
               <div className="text-sm text-gray-500 mt-1">Category</div>
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

         {isGameComplete && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6 text-center">
               🎉 Amazing! You found all words! Final Score: {gameState.score} 🎉
            </div>
         )}
         
         { !mounted ? (
            <div className="justify-self-center text-4xl font-semibold mt-10 text-gray-500">🎮 Loading Game...</div>
         ) : (
            <div className="flex flex-col xl:flex-row gap-6">
            <div className="flex-1">
               <div
                  ref={gridRef}
                  className="inline-block bg-white p-4 rounded-lg shadow-lg select-none mx-[5%] lg:mx-[20%]"
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
               >
                  <div className="grid grid-cols-12 gap-1">
                     {gameState.grid.map((row, rowIndex) =>
                        row.map((cell, colIndex) => {
                           const isSelected = gameState.selectedCells.some(
                              sc => sc.row === rowIndex && sc.col === colIndex
                           );
                           
                           const styling = getCellStyling(cell, isSelected);
                           
                           return (
                              <div
                                 key={`${rowIndex}-${colIndex}`}
                                 className={`
                                    w-8 h-8 flex items-center justify-center text-xs font-bold cursor-pointer
                                    transition-all duration-150 rounded
                                    ${styling.className}
                                 `}
                                 style={styling.style}
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
                     {gameState.words.map((wordItem, index) => {
                        const wordColor = WORD_COLORS[index % WORD_COLORS.length]; // Use word's index directly
                        
                        return (
                           <div
                              key={index}
                              className={`
                                 p-3 rounded-lg text-sm font-medium transition-all border
                                 ${wordItem.found && wordColor
                                    ? `${wordColor.bg} ${wordColor.text} ${wordColor.border}` 
                                    : 'bg-gray-100 text-gray-700 border-gray-200'
                                 }
                              `}
                           >
                              <div className="flex justify-between items-center">
                                 <span className={wordItem.found ? 'line-through' : ''}>
                                    {wordItem.word}
                                 </span>
                                 {wordItem.found && <span className={wordColor ? wordColor.text : 'text-green-600'}>✓</span>}
                              </div>
                           </div>
                        );
                     })}
                  </div>
               </div>

               <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">Color Features</h4>
                  <div className="space-y-2 text-xs text-gray-600">
                     <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gradient-to-r from-red-300/60 to-blue-300/60 rounded border"></div>
                        <span>Overlapping words create gradients</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-300/60 rounded border"></div>
                        <span>Single words use semi-transparent colors</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gradient-to-r from-yellow-300/60 via-purple-300/60 to-pink-300/60 rounded border"></div>
                        <span>Multiple overlaps create complex blends</span>
                     </div>
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
                     <li>• Overlapping words create beautiful gradients</li>
                     <li>• Each word gets a unique base color</li>
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
         )}
      </div>
   );
}