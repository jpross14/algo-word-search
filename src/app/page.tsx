"use client";

// pages/index.tsx
import { useState } from 'react';
import Grid from '@/components/Grid';
import WordList from '@/components/WordList';

const WORDS = ['HELLO', 'WORLD', 'NEXT', 'TYPESCRIPT', 'CODE'];

export default function Home() {
  const [foundWords, setFoundWords] = useState<string[]>([]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-4">Word Search</h1>
      <Grid words={WORDS} onWordFound={(word) => setFoundWords([...foundWords, word])} />
      <WordList words={WORDS} foundWords={foundWords} />
    </main>
  );
}
