interface GameCompleteMessageProps {
  elapsedTime: number;
  formatTime: (seconds: number) => string;
  finalScore: number;
  baseScore: number;
}

export const GameCompleteMessage: React.FC<GameCompleteMessageProps> = ({
  elapsedTime,
  formatTime,
  finalScore,
  baseScore
}) => {
  return (
    <div className="bg-green-100 border border-green-400 text-[#096c71] px-4 py-3 rounded-lg mb-6 text-center">
      🎉 Amazing! You found all words in {formatTime(elapsedTime)}!
      {finalScore > baseScore && (
        <span> Time bonus: +{finalScore - baseScore} points!</span>
      )}
      🎉
    </div>
  );
};