export async function getDefinitionWithApi(word: string): Promise<string | null> {
	try {
		const params = new URLSearchParams({
			action: 'query',
			format: 'json',
			prop: 'extracts',
			titles: word.toLowerCase(),
			redirects: '1',
			explaintext: '1',
			origin: '*',
		});
		const url = `https://fr.wiktionary.org/w/api.php?${params.toString()}`;

		const res = await fetch(url, {
			method: 'GET',
			headers: {
				'User-Agent': 'ReactNativeApp/1.0',
				'Accept': 'application/json',
			},
		});
		if (!res.ok) {
			console.warn(`Wiktionary API error: ${res.status}`);
			return null;
		}
		const data = await res.json();
		const pages = data.query.pages;
		if (!pages || Object.keys(pages).length === 0) return 'Définition introuvable.';
		const page = pages[Object.keys(pages)[0]];
		if (page.missing) return 'Entrée introuvable.';
		const extract: string = page.extract;
		return extract || 'Définition introuvable.';
	} catch (e) {
		console.error('Erreur récupération définition:', e);
		return null;
	}
}
