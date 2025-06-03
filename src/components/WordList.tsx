import { WordItem } from '@/types/types';
import { WORD_COLORS } from '@/constants/wordColors';

interface WordListProps {
  words: WordItem[];
}

export const WordList: React.FC<WordListProps> = ({ words }) => {
  return (
    <section className="w-full max-w-sm xl:w-[22rem] self-start">
      <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Words to Find</h3>
        <div className="grid grid-cols-2 gap-2">
          {words.map((wordItem, index) => {
            const wordColor = WORD_COLORS[index % WORD_COLORS.length];

            return (
              <div
                key={index}
                className={`
                  p-3 rounded-lg text-sm font-medium transition-all border
                  ${
                    wordItem.found && wordColor
                      ? `${wordColor.bg} ${wordColor.text} ${wordColor.border}`
                      : "bg-gray-100 text-gray-700 border-gray-200"
                  }
                `}
              >
                <div className="flex justify-between items-center">
                  <span className={wordItem.found ? "line-through" : ""}>
                    {wordItem.word}
                  </span>
                  {wordItem.found && (
                    <span className={wordColor ? wordColor.text : "text-green-600"}>✓</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};