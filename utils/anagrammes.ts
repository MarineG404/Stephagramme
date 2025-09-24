import indexedArray from '@/assets/ods6_indexed_flat.json';

type FlatEntry = { key: string; words: string[] };
const entries = indexedArray as FlatEntry[];

// Map pour lookup rapide : key => liste de mots
const wordIndex = new Map<string, string[]>();
entries.forEach(entry => wordIndex.set(entry.key, entry.words));

/**
 * 🔹 Génère toutes les combinaisons possibles de lettres, triées
 */
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

/**
 * 🔹 Recherche simple sans joker (async)
 */
export async function findAnagramsAsync(input: string): Promise<string[]> {
	const letters = input.toUpperCase().split('');
	const combinations = getSortedCombinations(letters);
	const found = new Set<string>();

	// Batch pour éviter blocage UI
	const combosArray = Array.from(combinations);
	for (let i = 0; i < combosArray.length; i += 100) {
		const batch = combosArray.slice(i, i + 100);
		batch.forEach(combo => {
			const match = wordIndex.get(combo);
			if (match) match.forEach(w => found.add(w));
		});
		// Yield control pour l’UI
		await new Promise(resolve => setTimeout(resolve, 0));
	}

	return Array.from(found).sort((a, b) => b.length - a.length || a.localeCompare(b));
}

/**
 * 🔹 Recherche avec jokers (async)
 * Supporte 1 ou plusieurs jokers
 */
export async function findAnagramsWithJokerAsync(input: string): Promise<string[]> {
	const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	const upperInput = input.toUpperCase();
	const jokerCount = (upperInput.match(/\?/g) || []).length;
	const baseLetters = upperInput.replace(/\?/g, '').split('');
	const results = new Set<string>();

	if (jokerCount === 0) return findAnagramsAsync(upperInput);

	async function generateJokerCombos(current: string[], jokersLeft: number) {
		if (jokersLeft === 0) {
			const combos = getSortedCombinations(current);
			for (const combo of combos) {
				const match = wordIndex.get(combo);
				if (match) match.forEach(w => results.add(w));
			}
			return;
		}

		for (const letter of alphabet) {
			await generateJokerCombos([...current, letter], jokersLeft - 1);
		}
	}

	await generateJokerCombos(baseLetters, jokerCount);
	return Array.from(results).sort((a, b) => b.length - a.length || a.localeCompare(b));
}
