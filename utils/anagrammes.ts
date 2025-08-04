import indexedArray from '@/assets/ods6_indexed_flat.json';

type FlatEntry = { key: string; words: string[] };
const entries = indexedArray as FlatEntry[];

const wordIndex = new Map<string, string[]>();
entries.forEach(entry => {
	wordIndex.set(entry.key, entry.words);
});

// 🔹 Génère toutes les combinaisons possibles (triées) de lettres
function getSortedCombinations(letters: string[]): Set<string> {
	const result = new Set<string>();

	function backtrack(path: string[], start: number) {
		if (path.length > 1) {
			result.add([...path].sort().join(''));
		}
		for (let i = start; i < letters.length; i++) {
			path.push(letters[i]);
			backtrack(path, i + 1);
			path.pop();
		}
	}

	backtrack([], 0);
	return result;
}

// 🔹 Recherche simple sans joker
export function findAnagrams(input: string): string[] {
	const letters = input.toUpperCase().split('');
	const combinations = getSortedCombinations(letters);
	const found = new Set<string>();

	for (const combo of combinations) {
		const match = wordIndex.get(combo); // ✅ corriger ici
		if (match) {
			match.forEach((w) => found.add(w));
		}
	}

	return Array.from(found).sort((a, b) => b.length - a.length || a.localeCompare(b));
}

// 🔹 Recherche avec un seul joker (lettre bonus)
export function findAnagramsWithJoker(input: string): string[] {
	const base = input.toUpperCase();
	const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	const results = new Set<string>();

	for (const extra of alphabet) {
		const extended = base + extra;
		const anagrams = findAnagrams(extended);
		anagrams.forEach((w) => results.add(w));
	}

	return Array.from(results).sort((a, b) => b.length - a.length || a.localeCompare(b));
}
