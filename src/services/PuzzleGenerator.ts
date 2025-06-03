import RabinKarpVerifier from "./RabinKarpVerifier";

export default class PuzzleGenerator {
   private static readonly LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

   // PANG GENERATE RANDOM LETTER
   private static getRandomLetter(): string {
      return this.LETTERS[Math.floor(Math.random() * this.LETTERS.length)];
   }

   // create empty grid (waay random letters)
   static generateGrid(size: number): string[][] {
      const grid: string[][] = [];
      for (let i = 0; i < size; i++) {
         const row: string[] = [];
         for (let j = 0; j < size; j++) {
            row.push(""); // Empty cells lang
         } 
         grid.push(row);
      }
      return grid;
   }

   // Check kng ang word pwede ma-place considering overlaps
   private static canPlaceWord(grid: string[][], word: string, startRow: number, startCol: number, direction: any): boolean {
      for (let i = 0; i < word.length; i++) {
         const row = startRow + i * direction.dr;
         const col = startCol + i * direction.dc;

         // Check kng naga-sobra sa grid boundaries
         if (row < 0 || row >= grid.length || col < 0 || col >= grid[0].length) {
            return false;
         }

         // Check kng may existing letter na indi match
         const existingLetter = grid[row][col];
         const requiredLetter = word[i].toUpperCase();
         
         if (existingLetter !== "" && existingLetter !== requiredLetter) {
            return false; // May conflict sa overlap
         }
      }
      return true;
   }

   // place isa ka word sa sulod sng grid at a random position kag direction (with proper overlap handling)
   static placeWord(grid: string[][], word: string): boolean {
      const directions = RabinKarpVerifier["DIRECTIONS"];
      const attempts = 200; // Increased attempts para sa better placement chances

      for (let attempt = 0; attempt < attempts; attempt++) {
         const direction = directions[Math.floor(Math.random() * directions.length)];
         const startRow = Math.floor(Math.random() * grid.length);
         const startCol = Math.floor(Math.random() * grid[0].length);

         // Check kng ang word maka-fit with proper overlap handling
         if (this.canPlaceWord(grid, word, startRow, startCol, direction)) {
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

   // pang-fill sang empty cells with random letters
   static fillEmptyCells(grid: string[][]): void {
      for (let i = 0; i < grid.length; i++) {
         for (let j = 0; j < grid[i].length; j++) {
            if (grid[i][j] === "") {
               grid[i][j] = this.getRandomLetter();
            }
         }
      }
   }

   // pang-generate sng complete puzzle na na-place na ang mga words kag filled na ang empty cells
   static generatePuzzle(words: string[], gridSize: number): { 
   grid: string[][], 
   placedWords: string[], 
   failedWords: string[], 
   wordLocations: Map<string, Array<{startPos: {row: number, col: number}, direction: string, path: Array<{row: number, col: number}>}>>
   } {
      const grid = this.generateGrid(gridSize);
      const placedWords: string[] = [];
      const failedWords: string[] = [];
      

      // Place each word
      for (const word of words) {
         const success = this.placeWord(grid, word);
         if (success) {
            placedWords.push(word);
         } else {
            failedWords.push(word);
         }
      }

      // Fill empty cells with random letters
      this.fillEmptyCells(grid);
      
      const wordLocations = 
         new Map<string, Array<{startPos: {row: number, col: number}, direction: string, path: Array<{row: number, col: number}>}>>();
      
      // gamit naton RABIN-KARP to verify nga tanan na words findable and get their locations
      for (const word of placedWords) {
         const searchResults = RabinKarpVerifier.searchWord(grid, word);
         if (searchResults.length > 0) {
            wordLocations.set(
               word,
               searchResults
                  .filter(
                     result =>
                        result.startPos !== undefined &&
                        result.direction !== undefined &&
                        result.path !== undefined
                  )
                  .map(result => ({
                     startPos: result.startPos as { row: number; col: number },
                     direction: result.direction as string,
                     path: result.path as Array<{ row: number; col: number }>
                  }))
            );
         }
      }

      return {
         grid,
         placedWords,
         failedWords,
         wordLocations
      };
   }
}