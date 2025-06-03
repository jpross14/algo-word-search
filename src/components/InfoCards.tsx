export const InfoCards: React.FC = () => {
  return (
    <section className="w-full max-w-7xl flex flex-wrap gap-4 justify-center mb-15">
      {/* About Grid Cells Colors */}
      <article className="bg-red-50 rounded-lg shadow-lg p-4 text-sm text-red-800 flex-1 min-w-[220px] max-w-sm">
        <h4 className="font-semibold mb-3">🎨 Color Features</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 p-2 bg-green-300/60 rounded border"></div>
            <span>Letters of a word will share a single color distinct from other words</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 p-2 bg-gradient-to-r from-red-300/60 to-blue-300/60 rounded border"></div>
            <span>Words may overlap and will create gradients! Will you get to see one?</span>
          </div>
        </div>
      </article>

      {/* About Time Bonus */}
      <article className="bg-orange-50 rounded-lg shadow-lg p-4 text-sm text-orange-800 flex-1 min-w-[220px] max-w-sm">
        <h4 className="font-semibold mb-2">⏱️ Time Bonus:</h4>
        <ul className="space-y-1">
          <li>• Formula: Score + (Score ÷ Time)</li>
          <li>• Timer starts on first click</li>
          <li>• Stops when puzzle is complete</li>
          <li>• The faster you find all the words the higher bonus points you get!</li>
        </ul>
      </article>

      {/* Instructions */}
      <article className="bg-blue-50 rounded-lg shadow-lg p-4 text-sm text-blue-800 flex-1 min-w-[220px] max-w-sm">
        <h4 className="font-semibold mb-2">🎮 How to Play:</h4>
        <ul className="space-y-1">
          <li>• Click and drag to select words</li>
          <li>• Words can go in any direction</li>
          <li>• Compete with friends to earn the highest points</li>
          <li>• Find all words to win!</li>
        </ul>
      </article>

      {/* About the Algorithm */}
      <article className="bg-purple-100 rounded-lg shadow-lg p-4 text-sm text-purple-800 flex-1 min-w-[220px] max-w-sm">
        <h4 className="font-semibold mb-2">🔬 Algorithm Features:</h4>
        <ul className="space-y-1">
          <li>• Rolling hash for efficiency</li>
          <li>• O(n) average complexity</li>
          <li>• 8-directional search</li>
          <li>• Collision handling</li>
        </ul>
      </article>
    </section>
  );
};