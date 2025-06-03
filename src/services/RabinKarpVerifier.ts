import { SearchResult } from "@/types/types";

export default class RabinKarpVerifier {
   private static readonly BASE = 256;
   private static readonly PRIME = 1000000007; // Larger prime number for better distribution

   // Tanan na possible na 8 nga directions: horizontal or vertical or diagonal
   private static readonly DIRECTIONS = [
      { name: 'right', dr: 0, dc: 1 },      // →
      { name: 'down', dr: 1, dc: 0 },       // ↓
      { name: 'down-right', dr: 1, dc: 1 }, // ↘
      { name: 'down-left', dr: 1, dc: -1 }, // ↙
      { name: 'left', dr: 0, dc: -1 },      // ←
      { name: 'up', dr: -1, dc: 0 },        // ↑
      { name: 'up-left', dr: -1, dc: -1 },  // ↖
      { name: 'up-right', dr: -1, dc: 1 }   // ↗
   ];

   // Cache for powers to avoid recalculation
   private static powerCache = new Map<number, number>();

   // pang-calculate sng rolling hash for a string
   private static calculateHash(str: string): number {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
         hash = (hash * this.BASE + str.charCodeAt(i)) % this.PRIME;
      }
      return hash;
   }

   // pang-calculate ang power of base for rolling hash
   private static calculatePower(length: number): number {
      if (this.powerCache.has(length)) {
         return this.powerCache.get(length)!;
      }

      let power = 1;
      for (let i = 0; i < length - 1; i++) {
         power = (power * this.BASE) % this.PRIME;
      }
      
      this.powerCache.set(length, power);
      return power;
   }

   // pang-update rolling hash when sliding window
   private static updateHash(
      oldHash: number, 
      oldChar: string, 
      newChar: string, 
      power: number
   ): number {
      // Remove ang leftmost character
      let newHash = (oldHash - (oldChar.charCodeAt(0) * power) % this.PRIME + this.PRIME) % this.PRIME;
      // Add new rightmost character
      newHash = (newHash * this.BASE + newChar.charCodeAt(0)) % this.PRIME;
      return newHash;
   }

   // Check kng ang position is within grid bounds
   private static isValidPosition(grid: string[][], row: number, col: number): boolean {
      return row >= 0 && row < grid.length && col >= 0 && col < grid[0].length;
   }

   // Get ang character at position or return null kng out of bounds
   private static getChar(grid: string[][], row: number, col: number): string | null {
      return this.isValidPosition(grid, row, col) ? grid[row][col] : null;
   }

   // Build initial window string for any direction
   private static buildInitialWindow(
      grid: string[][],
      startRow: number,
      startCol: number,
      length: number,
      dr: number,
      dc: number
   ): { window: string; positions: Array<{row: number, col: number}> } | null {
      const chars: string[] = [];
      const positions: Array<{row: number, col: number}> = [];

      for (let i = 0; i < length; i++) {
         const row = startRow + i * dr;
         const col = startCol + i * dc;
         const char = this.getChar(grid, row, col);
         
         if (char === null) return null;
         
         chars.push(char);
         positions.push({ row, col });
      }

      return { window: chars.join(''), positions };
   }

   // Gamit pang search sng word sa specific nga direction using Rabin-Karp
   private static searchInDirection(
      grid: string[][],
      word: string,
      direction: { name: string; dr: number; dc: number }
   ): SearchResult[] {
      const results: SearchResult[] = [];
      const wordHash = this.calculateHash(word);
      const wordLength = word.length;
      const power = this.calculatePower(wordLength);
      const { dr, dc } = direction;

      // Determine the range of starting positions based on direction
      const startPositions = this.getStartPositions(grid, wordLength, dr, dc);

      for (const { startRow, startCol, maxSteps } of startPositions) {
         const initialBuild = this.buildInitialWindow(grid, startRow, startCol, wordLength, dr, dc);
         if (!initialBuild) continue;

         let { window, positions } = initialBuild;
         let hash = this.calculateHash(window);

         // check first iya initial position
         if (hash === wordHash && window === word) {
            results.push({
               found: true,
               path: [...positions],
               direction: direction.name,
               startPos: { row: startRow, col: startCol }
            });
         }

         // slide ang window
         for (let step = 1; step < maxSteps; step++) {
            const newStartRow = startRow + step * dr;
            const newStartCol = startCol + step * dc;
            
            // ang position sng new character na i-add
            const newCharRow = newStartRow + (wordLength - 1) * dr;
            const newCharCol = newStartCol + (wordLength - 1) * dc;
            
            const oldChar = this.getChar(grid, positions[0].row, positions[0].col);
            const newChar = this.getChar(grid, newCharRow, newCharCol);
            
            if (oldChar === null || newChar === null) break;

            // update hash & window
            hash = this.updateHash(hash, oldChar, newChar, power);
            window = window.slice(1) + newChar;
            
            // update positions
            positions.shift();
            positions.push({ row: newCharRow, col: newCharCol });

            // check for match
            if (hash === wordHash && window === word) {
               results.push({
                  found: true,
                  path: [...positions],
                  direction: direction.name,
                  startPos: { row: newStartRow, col: newStartCol }
               });
            }
         }
      }

      return results;
   }

   // Get ang valid starting positions kag ang max steps for a direction
   private static getStartPositions(
      grid: string[][],
      wordLength: number,
      dr: number,
      dc: number
   ): Array<{ startRow: number; startCol: number; maxSteps: number }> {
      const positions: Array<{ startRow: number; startCol: number; maxSteps: number }> = [];
      const rows = grid.length;
      const cols = grid[0].length;

      // For horizontal directions (dr = 0)
      if (dr === 0) {
         const maxSteps = cols - wordLength + 1;
         if (maxSteps > 0) {
            for (let row = 0; row < rows; row++) {
               positions.push({ startRow: row, startCol: dc > 0 ? 0 : cols - 1, maxSteps });
            }
         }
      }
      // For vertical directions (dc = 0)
      else if (dc === 0) {
         const maxSteps = rows - wordLength + 1;
         if (maxSteps > 0) {
            for (let col = 0; col < cols; col++) {
               positions.push({ startRow: dr > 0 ? 0 : rows - 1, startCol: col, maxSteps });
            }
         }
      }
      // For diagonal directions
      else {
         // Calculate valid starting positions for diagonals
         for (let startRow = 0; startRow < rows; startRow++) {
            for (let startCol = 0; startCol < cols; startCol++) {
               // Check if we can fit the word starting from this position
               const endRow = startRow + (wordLength - 1) * dr;
               const endCol = startCol + (wordLength - 1) * dc;
               
               if (this.isValidPosition(grid, endRow, endCol)) {
                  positions.push({ startRow, startCol, maxSteps: 1 });
               }
            }
         }
      }

      return positions;
   }

   // Ini ang main search function (it finds all occurences sng word)
   static searchWord(grid: string[][], word: string): SearchResult[] {
      if (!grid || !grid.length || !word) return [];
      
      const results: SearchResult[] = [];
      const upperWord = word.toUpperCase();

      // Search in all 8 directions using optimized rolling hash
      for (const direction of this.DIRECTIONS) {
         const directionResults = this.searchInDirection(grid, upperWord, direction);
         results.push(...directionResults);
      }

      return results;
   }

   // Pang verify kng ang na-contain sng gin-select nga path ang valid word
   static verifySelection(
      grid: string[][],
      path: { row: number; col: number }[],
      wordList: string[]
   ): { isValid: boolean; word?: string; reversedWord?: string } {
      if (!path || path.length === 0) return { isValid: false };

      // Validate ang path positions
      for (const pos of path) {
         if (!this.isValidPosition(grid, pos.row, pos.col)) {
            return { isValid: false };
         }
      }

      // Extract ang words
      const word = path.map(({ row, col }) => grid[row][col]).join('').toUpperCase();
      const reversedWord = word.split('').reverse().join('');

      // Himo to ang wordlist nga uppercase for comparison
      const upperWordList = wordList.map(w => w.toUpperCase());

      // Check dayon ang matches
      const normalMatch = upperWordList.includes(word);
      const reverseMatch = upperWordList.includes(reversedWord);

      if (normalMatch) {
         return { isValid: true, word };
      } else if (reverseMatch) {
         return { isValid: true, word: reversedWord, reversedWord: word };
      }

      return { isValid: false };
   }

   // Clear cache kng kinanglan naton (useful for memory management)
   static clearCache(): void {
      this.powerCache.clear();
   }
}