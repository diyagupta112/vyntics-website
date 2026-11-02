/*
  Spelling correction for typed questions. A word that is not in the vocabulary is replaced by the
  closest vocabulary word (for example "clowd" becomes "cloud"), so searches still find the right content.
*/

// Edit distance between two words, giving up early once it is certain to exceed `limit`.
function editDistance(a: string, b: string, limit: number): number {
  if (Math.abs(a.length - b.length) > limit) return limit + 1;
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let value = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost);
      // Count swapping two neighbouring letters (like "sevrice") as one mistake.
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) value = Math.min(value, previous[j - 2] + 1);
      current.push(value);
      rowMin = Math.min(rowMin, value);
    }
    if (rowMin > limit) return limit + 1;
    previous = current;
  }
  return previous[b.length];
}

/** Returns `word` if it is known, otherwise the closest known word, otherwise `word` unchanged. */
export function correctWord(word: string, vocabulary: Iterable<string>, known: { has(word: string): boolean }, frequency?: Map<string, number>): string {
  if (word.length < 4 || known.has(word)) return word;
  const limit = word.length <= 5 ? 1 : 2;
  let best = word;
  let bestDistance = limit + 1;
  let bestFrequency = 0;
  for (const candidate of vocabulary) {
    if (Math.abs(candidate.length - word.length) > limit) continue;
    const distance = editDistance(word, candidate, limit);
    if (distance > limit) continue;
    const candidateFrequency = frequency?.get(candidate) ?? 0;
    if (distance < bestDistance || (distance === bestDistance && candidateFrequency > bestFrequency)) {
      best = candidate;
      bestDistance = distance;
      bestFrequency = candidateFrequency;
    }
  }
  return best;
}
