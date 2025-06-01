export interface Cell {
   letter: string;
   row: number;
   col: number;
   isFound: boolean;
   isSelected: boolean;
}

export interface WordItem {
   word: string;
   found: boolean;
   direction?: string;
   startPos?: { row: number; col: number };
   path?: { row: number; col: number }[];
}

export interface GameState {
   grid: Cell[][];
   words: WordItem[];
   score: number;
   isSelecting: boolean;
   selectedCells: { row: number; col: number }[];
   startCell: { row: number; col: number } | null;
}

export interface SearchResult {
   found: boolean;
   path?: { row: number; col: number }[];
   direction?: string;
   startPos?: { row: number; col: number };
}

