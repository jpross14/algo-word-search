import { WORD_CATEGORIES } from '@/constants/wordCategories';

interface ScoreBoardProps {
  score: number;
  finalScore: number;
  foundWordsCount: number;
  totalWords: number;
  elapsedTime: number;
  isTimerRunning: boolean;
  formatTime: (seconds: number) => string;
  currentCategory: keyof typeof WORD_CATEGORIES;
  onCategoryChange: (category: keyof typeof WORD_CATEGORIES) => void;
  onResetGame: () => void;
  isGameComplete: boolean;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  score,
  finalScore,
  foundWordsCount,
  totalWords,
  elapsedTime,
  isTimerRunning,
  formatTime,
  currentCategory,
  onCategoryChange,
  onResetGame,
  isGameComplete
}) => {
  return (
    <nav className="flex flex-wrap justify-center gap-4 xl:gap-6 items-center mb-6 bg-white rounded-2xl mx-[5%] p-4 shadow-md xl:px-[8%]">
      {/* Scores */}
      <div className="text-center flex-1 min-w-[120px]">
        <div className="text-2xl font-bold text-blue-600">
          {isGameComplete && finalScore > 0 ? finalScore : score}
        </div>
        <div className="text-sm text-gray-500">Score</div>
        {isGameComplete && finalScore > score && (
          <div className="text-xs text-green-600 font-medium">
            +{finalScore - score} time bonus!
          </div>
        )}
      </div>

      {/* Words Found */}
      <div className="text-center flex-1 min-w-[120px]">
        <div className="text-2xl font-bold text-green-600">
          {foundWordsCount}/{totalWords}
        </div>
        <div className="text-sm text-gray-500">Words Found</div>
      </div>

      {/* Timer */}
      <div className="text-center flex-1 min-w-[120px]">
        <div className="text-2xl font-bold text-orange-600">
          {formatTime(elapsedTime)}
        </div>
        <div className="text-sm text-gray-500">Time</div>
        {!isTimerRunning && elapsedTime > 0 && (
          <div className="text-xs text-gray-400">Stopped</div>
        )}
      </div>

      {/* Categories */}
      <div className="flex flex-col items-center flex-1 min-w-[160px]">
        <select
          value={currentCategory}
          onChange={(e) =>
            onCategoryChange(e.target.value as keyof typeof WORD_CATEGORIES)
          }
          className="bg-gradient-to-r from-indigo-500 to-[#0d767a] text-white px-4 py-2 rounded-lg font-medium 
          border-0 outline-none cursor-pointer hover:from-indigo-600 hover:to-[#096c71] hover:scale-103 
          transition-all shadow-md w-full"
        >
          {Object.entries(WORD_CATEGORIES).map(([key, category]) => (
            <option key={key} value={key} className="bg-white text-gray-800">
              {category.icon} {category.name}
            </option>
          ))}
        </select>
        <div className="text-sm text-gray-500 mt-1">Category</div>
      </div>

      {/* Algorithm */}
      <div className="text-center flex-1 min-w-[120px]">
        <div className="text-lg font-semibold text-purple-600">Rabin-Karp</div>
        <div className="text-sm text-gray-500">Algorithm</div>
      </div>

      {/* New Puzzle */}
      <div className="flex-1 min-w-[140px] text-center">
        <button
          onClick={onResetGame}
          className="bg-[#0d767a] hover:bg-[#096c71] text-white px-6 py-2 rounded-lg font-medium hover:scale-103 transition-all w-40 max-w-full"
        >
          New Puzzle
        </button>
      </div>
    </nav>
  );
};