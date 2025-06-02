import { SearchResult } from "@/types/types";

export default class RabinKarpVerifier {
   private static readonly BASE = 256;
   private static readonly PRIME = 101;

   // Tanan na possible na 8 nga directions: horizantal or vertical or diagonal
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
      let power = 1;
      for (let i = 0; i < length - 1; i++) {
         power = (power * this.BASE) % this.PRIME;
      }
      return power;
   }

   // pang-update rolling hash when sliding window
   private static updateHash(
      oldHash: number, 
      oldChar: string, 
      newChar: string, 
      power: number
   ): number {
      let newHash = oldHash - (oldChar.charCodeAt(0) * power) % this.PRIME;
      newHash  = (newHash * this.BASE + newChar.charCodeAt(0)) % this.PRIME;
      return newHash < 0 ? newHash + this.PRIME : newHash;
   }

   // Extract ang string halin grid in a specific direction
   private static extractString(
      grid: string[][],
      startRow: number,
      startCol: number,
      length: number,
      dr: number,
      dc: number
   ): { str: string; path: { row: number; col: number }[] } | null {
      const str: string[] = [];
      const path: { row: number; col: number }[] = [];

      for (let i = 0; i < length; i++) {
         const row = startRow + i * dr;
         const col = startCol + i * dc;

         if (row < 0 || row >= grid.length || col < 0 || col >= grid[0].length) {
            return null;
         }

         str.push(grid[row][col]);
         path.push({ row, col });
      }

      return { str: str.join(""), path };
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

      const isRight = direction.dr === 0 && direction.dc === 1;
      const isDown = direction.dr === 1 && direction.dc === 0;
      const isLeft = direction.dr === 0 && direction.dc === -1;
      const isUp = direction.dr === -1 && direction.dc === 0;

      const power = this.calculatePower(wordLength);

      if (isRight) {
         for (let row = 0; row < grid.length; row++) {
            let window = grid[row].slice(0, wordLength).join("");
            let hash = this.calculateHash(window);

            for (let col = 0; col <= grid[0].length - wordLength; col++) {
               if (hash === wordHash && window === word) {
                  const path = Array.from({ length: wordLength }, (_, i) => ({
                     row,
                     col: col + i,
                  }));
                  results.push({
                     found: true,
                     path,
                     direction: direction.name,
                     startPos: { row, col },
                  });
               }

               if (col < grid[0].length - wordLength) {
                  const oldChar = grid[row][col];
                  const newChar = grid[row][col + wordLength];
                  hash = this.updateHash(hash, oldChar, newChar, power);
                  window = window.slice(1) + newChar;
               }
            }
         }
         return results;
      }

      if (isDown) {
         for (let col = 0; col < grid[0].length; col++) {
            let window = "";
            for (let i = 0; i < wordLength; i++) {
               window += grid[i][col];
            }
            let hash = this.calculateHash(window);

            for (let row = 0; row <= grid.length - wordLength; row++) {
               if (hash === wordHash && window === word) {
                  const path = Array.from({ length: wordLength }, (_, i) => ({
                     row: row + i,
                     col,
                  }));
                  results.push({
                     found: true,
                     path,
                     direction: direction.name,
                     startPos: { row, col },
                  });
               }

               if (row < grid.length - wordLength) {
                  const oldChar = grid[row][col];
                  const newChar = grid[row + wordLength][col];
                  hash = this.updateHash(hash, oldChar, newChar, power);
                  window = window.slice(1) + newChar;
               }
            }
         }
         return results;
      }

      if (isLeft) {
         for (let row = 0; row < grid.length; row++) {
            let window = grid[row]
               .slice(-wordLength)
               .reverse()
               .join("");
            let hash = this.calculateHash(window);

            for (let col = grid[0].length - 1; col >= wordLength - 1; col--) {
               const startCol = col;
               if (hash === wordHash && window === word) {
                  const path = Array.from({ length: wordLength }, (_, i) => ({
                     row,
                     col: startCol - i,
                  }));
                  results.push({
                     found: true,
                     path,
                     direction: direction.name,
                     startPos: { row, col: startCol },
                  });
               }

               if (col >= wordLength) {
                  const oldChar = grid[row][col];
                  const newChar = grid[row][col - wordLength];
                  hash = this.updateHash(hash, oldChar, newChar, power);
                  window = newChar + window.slice(0, -1);
               }
            }
         }
         return results;
      }

      if (isUp) {
         for (let col = 0; col < grid[0].length; col++) {
            let window = "";
            for (let i = grid.length - 1; i >= grid.length - wordLength; i--) {
               window += grid[i][col];
            }
            let hash = this.calculateHash(window);

            for (let row = grid.length - 1; row >= wordLength - 1; row--) {
               const startRow = row;
               if (hash === wordHash && window === word) {
                  const path = Array.from({ length: wordLength }, (_, i) => ({
                     row: startRow - i,
                     col,
                  }));
                  results.push({
                     found: true,
                     path,
                     direction: direction.name,
                     startPos: { row: startRow, col },
                  });
               }

               if (row >= wordLength) {
                  const oldChar = grid[row][col];
                  const newChar = grid[row - wordLength][col];
                  hash = this.updateHash(hash, oldChar, newChar, power);
                  window = newChar + window.slice(0, -1);
               }
            }
         }
         return results;
      }

      // fallback for diagonal and complex directions
      for (let startRow = 0; startRow < grid.length; startRow++) {
         for (let startCol = 0; startCol < grid[0].length; startCol++) {
            const extraction = this.extractString(grid, startRow, startCol, wordLength, direction.dr, direction.dc);
            if (!extraction) continue;

            const { str, path } = extraction;
            const strHash = this.calculateHash(str);

            if (strHash === wordHash && str === word) {
               results.push({
                  found: true,
                  path,
                  direction: direction.name,
                  startPos: { row: startRow, col: startCol },
               });
            }
         }
      }

      return results;
   }

   // Ito yung main search function (it finds all occurences sng word)
   static searchWord(grid: string[][], word: string): SearchResult[] {
      const results: SearchResult[] = [];
      const upperWord = word.toUpperCase();

      // Search alllll 8 directions
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
   ) : { isValid: boolean; word?: string; reveresedWord?: string } {
      if (path.length === 0) return { isValid: false };

      // extract the word from the pathh
      const word = path.map(({ row, col}) => grid[row][col]).join('');
      const reversedWord = word.split('').reverse().join('');

      // Check if word or ang iya reverse exists sa word list
      const normalMatch = wordList.some(w => w.toUpperCase() === word.toUpperCase());
      const reverseMatch = wordList.some(w => w.toUpperCase() === reversedWord.toUpperCase());

      if (normalMatch) {
         return { isValid: true, word: word.toUpperCase() };
      } else if (reverseMatch) {
         return { isValid: true, word: reversedWord.toUpperCase() };
      }

      return { isValid: false };
   }
}