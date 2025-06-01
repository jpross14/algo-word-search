import RabinKarpVerifier from "./RabinKarpVerifier";

export default class PuzzleGenerator {
   private static readonly LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

   // PANG GENERATE RANDOM LETTER
   private static getRandomLetter(): string {
      return this.LETTERS[Math.floor(Math.random() * this.LETTERS.length)];
   }

   // create empty grid filled with random letters
   static generateGrid(size: number = 10): string[][] {
      const grid: string[][] = [];
      for (let i = 0; i < size; i++) {
         const row: string[] = [];
         for (let j = 0; j < size; j++) {
            row.push(this.getRandomLetter());
         } 
         grid.push(row);
      }
      return grid;
   }

   // place isa ka word sa sulod sng grid at random position kag direction
   static placeWord(grid: string[][], word: string): boolean {
      const directions = RabinKarpVerifier["DIRECTIONS"];
      const attempts = 100; // Max attempts to place ang word

      for (let attempt = 0; attempt < attempts; attempt++) {
         const direction = directions[Math.floor(Math.random() * directions.length)];
         const startRow = Math.floor(Math.random() * grid.length);
         const startCol = Math.floor(Math.random() * grid[0].length);

         // Check kng ang word maka-fit :3
         let canPlace = true;
         for (let i = 0; i < word.length; i++) {
            const row = startRow + i * direction.dr;
            const col = startCol + i * direction.dc;

            if (row < 0 || row >= grid.length || col < 0 || col >= grid[0].length) {
               canPlace = false;
               break;
            }
         }

         if (canPlace) {
            // Place the word
            for (let i = 0; i < word.length; i++) {
               const row = startRow + i * direction.dr;
               const col = startCol + i * direction.dc;
               grid[row][col] = word[i].toUpperCase();
            }
            return true;
         }
      }

      return false; // kng indi ta maka-place sng word :(
   }

   // pang-generate sng complete puzzle na na-place na ang mga words
   static generatePuzzle(words: string[], gridSize: number = 10): string[][]{
      const grid = this.generateGrid(gridSize);

      // Place each word
      for (const word of words) {
         this.placeWord(grid, word);
      }

      return grid;
   }
}