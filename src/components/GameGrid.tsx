import { useRef } from 'react';
import { Cell } from '@/types/types';
import { WORD_COLORS } from '@/constants/wordColors';

interface GameGridProps {
  grid: Cell[][];
  selectedCells: { row: number; col: number }[];
  onCellMouseDown: (row: number, col: number) => void;
  onCellMouseEnter: (row: number, col: number) => void;
  onMouseUp: () => void;
}

export const GameGrid: React.FC<GameGridProps> = ({
  grid,
  selectedCells,
  onCellMouseDown,
  onCellMouseEnter,
  onMouseUp
}) => {
  const gridRef = useRef<HTMLDivElement>(null);

  const getBlendedBackground = (wordIndices: number[]) => {
    if (wordIndices.length === 0) return null;
    if (wordIndices.length === 1) {
      const color = WORD_COLORS[wordIndices[0] % WORD_COLORS.length];
      return color;
    }

    const colors = wordIndices.map(
      (idx) => WORD_COLORS[idx % WORD_COLORS.length]
    );
    const rgbColors = colors.map((c) => c.rgb);

    if (rgbColors.length === 2) {
      return {
        style: {
          background: `linear-gradient(135deg, rgba(${rgbColors[0]}, 0.7) 0%, rgba(${rgbColors[1]}, 0.7) 100%)`,
          border: "2px solid rgba(0, 0, 0, 0.2)",
        },
        text: "text-gray-900 font-bold",
      };
    } else {
      const gradientStops = rgbColors
        .map(
          (rgb, index) =>
            `rgba(${rgb}, 0.6) ${(index * 100) / (rgbColors.length - 1)}%`
        )
        .join(", ");

      return {
        style: {
          background: `linear-gradient(45deg, ${gradientStops})`,
          border: "2px solid rgba(0, 0, 0, 0.3)",
        },
        text: "text-gray-900 font-bold",
      };
    }
  };

  const getCellStyling = (cell: Cell, isSelected: boolean) => {
    if (cell.isFound && cell.wordIndices.length > 0) {
      const blendedStyle = getBlendedBackground(cell.wordIndices);
      if (blendedStyle) {
        if ("style" in blendedStyle) {
          return {
            className: `${blendedStyle.text} shadow-md`,
            style: blendedStyle.style,
          };
        } else {
          return {
            className: `${blendedStyle.bg} ${blendedStyle.text} ${blendedStyle.border} shadow-sm border-2`,
            style: {},
          };
        }
      }
    }

    if (isSelected) {
      return {
        className:
          "bg-[#a2ebed] text-[#37b0b4] border-[#1c9b9f] shadow-sm border-2",
        style: {},
      };
    }

    return {
      className:
        "bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-300",
      style: {},
    };
  };

  return (
    <section
      ref={gridRef}
      className="inline-block bg-white p-4 rounded-lg shadow-lg select-none"
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      <div className="grid grid-cols-12 gap-1">
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isSelected = selectedCells.some(
              (sc) => sc.row === rowIndex && sc.col === colIndex
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
                onMouseDown={() => onCellMouseDown(rowIndex, colIndex)}
                onMouseEnter={() => onCellMouseEnter(rowIndex, colIndex)}
              >
                {cell.letter}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};