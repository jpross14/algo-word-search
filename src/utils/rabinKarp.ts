// lib/rabinKarp.ts

const BASE = 256;
const MOD = 101;

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * BASE + str.charCodeAt(i)) % MOD;
  }
  return h;
}

export function runRabinKarpInGrid(input: string, wordList: string[]): string | null {
  const inputHash = hash(input);
  const reversedHash = hash(input.split('').reverse().join(''));

  for (const word of wordList) {
    const h = hash(word);
    if (h === inputHash || h === reversedHash) {
      if (word === input || word === input.split('').reverse().join('')) {
        return word;
      }
    }
  }
  return null;
}