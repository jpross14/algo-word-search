export interface Cell {
   letter: string;
   row: number;
   col: number;
   isFound: boolean;
   isSelected: boolean;
   wordIndices: number[]; // Changed to array to track multiple words
}

export interface WordItem {
   word: string;
   found: boolean;
   direction?: string;
   startPos?: { row: number; col: number };
   path?: { row: number; col: number }[];
   colorIndex: number;
}

export interface GameState {
   grid: Cell[][];
   words: WordItem[];
   score: number;
   isSelecting: boolean;
   selectedCells: { row: number; col: number }[];
   startCell: { row: number; col: number } | null;
   foundWordsCount: number;
}

export interface SearchResult {
   found: boolean;
   path?: { row: number; col: number }[];
   direction?: string;
   startPos?: { row: number; col: number };
}

