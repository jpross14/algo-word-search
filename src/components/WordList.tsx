// components/WordList.tsx
interface WordListProps {
  words: string[];
  foundWords: string[];
}

export default function WordList({ words, foundWords }: WordListProps) {
  return (
    <div className="mt-4">
      <h2 className="text-xl font-semibold mb-2">Words to Find</h2>
      <ul className="grid grid-cols-2 gap-2">
        {words.map((word) => (
          <li
            key={word}
            className={`text-lg ${foundWords.includes(word) ? 'line-through text-green-600' : ''}`}
          >
            {word}
          </li>
        ))}
      </ul>
    </div>
  );
}
