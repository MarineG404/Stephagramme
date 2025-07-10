import dictionaryJson from '@/assets/ods6.json';

const dictionary = dictionaryJson as { mots: string[] };
const validWords = new Set<string>(dictionary.mots);

// Génère toutes les permutations possibles d'une taille donnée
function generatePermutations(letters: string[], size: number): string[][] {
	if (size === 1) return letters.map((letter) => [letter]);

	const allPermutations: string[][] = [];

	letters.forEach((letter, index) => {
		const remainingLetters = letters.slice(0, index).concat(letters.slice(index + 1));
		const smallerPermutations = generatePermutations(remainingLetters, size - 1);
		smallerPermutations.forEach((perm) => {
			allPermutations.push([letter, ...perm]);
		});
	});

	return allPermutations;
}

// Trouve tous les anagrammes valides à partir d’un mot
export function findAnagrams(input: string): string[] {
	const foundWords: Set<string> = new Set();
	const inputLetters = input.toUpperCase().split('');

	for (let length = inputLetters.length; length > 0; length--) {
		const permutations = generatePermutations(inputLetters, length);
		permutations.forEach((perm) => {
			const candidateWord = perm.join('');
			if (validWords.has(candidateWord)) {
				foundWords.add(candidateWord);
			}
		});
	}

	return Array.from(foundWords).sort((a, b) => b.length - a.length);
}

// Trouve tous les anagrammes avec 1 joker (lettre bonus)
export function findAnagramsWithJoker(input: string): string[] {
	const alphabet = 'abcdefghijklmnopqrstuvwxyz';
	const anagramSet: Set<string> = new Set();

	for (const extraLetter of alphabet) {
		const anagrams = findAnagrams(input + extraLetter);
		anagrams.forEach((word) => anagramSet.add(word));
	}

	return Array.from(anagramSet).sort((a, b) => b.length - a.length);
}
