export function highlightJokerLetters(
	candidateWord: string,
	userInput: string
): { letter: string; isJoker: boolean }[] {
	const input = userInput.replace(/\?/g, "").toUpperCase();
	const candidate = candidateWord.toUpperCase();

	const inputLetterCount: Record<string, number> = {};

	for (const letter of input) {
		inputLetterCount[letter] = (inputLetterCount[letter] || 0) + 1;
	}

	const result: { letter: string; isJoker: boolean }[] = [];

	for (const letter of candidate) {
		if (inputLetterCount[letter]) {
			inputLetterCount[letter]--;
			result.push({ letter, isJoker: false });
		} else {
			result.push({ letter, isJoker: true });
		}
	}

	return result;
}
