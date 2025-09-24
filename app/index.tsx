import { ThemedSafeAreaView } from "@/components/themed/ThemedSafeAreaView";
import { ThemedText } from "@/components/themed/ThemedText";
import { Audio } from "expo-av";
import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";

import DefinitionModal from "@/components/DefinitionModal";
import ErrorModal from "@/components/ErrorModal";
import ResultsList from "@/components/ResultsList";
import SearchInput from "@/components/SearchInput";

import { findAnagramsAsync, findAnagramsWithJokerAsync } from "@/utils/anagrammes";
import { getDefinitionWithApi } from "@/utils/def";
import { highlightJokerLetters } from "@/utils/highlightJoker";

export default function HomeScreen() {
	const [word, setWord] = useState("");
	const [results, setResults] = useState<string[]>([]);
	const [isRunning, setIsRunning] = useState(false);

	// Definition modal
	const [selectedWord, setSelectedWord] = useState<string | null>(null);
	const [definition, setDefinition] = useState<string | null>(null);
	const [modalVisible, setModalVisible] = useState(false);
	const [loadingDef, setLoadingDef] = useState(false);

	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [errorModalVisible, setErrorModalVisible] = useState(false);

	const isEmpty = word.trim().length === 0;

	useEffect(() => {
		Audio.setAudioModeAsync({
			allowsRecordingIOS: false,
			staysActiveInBackground: false,
			interruptionModeIOS: 1,
			playsInSilentModeIOS: true,
			shouldDuckAndroid: false,
			interruptionModeAndroid: 1,
			playThroughEarpieceAndroid: false,
		});
	}, []);


	const runSearch = useCallback(
		async (maybeText?: string) => {
			const input = (maybeText ?? word).trim().toUpperCase();

			// Count jokers
			const jokerCount = (input.match(/\?/g) || []).length;
			if (jokerCount > 2) {
				setErrorMessage("Vous ne pouvez pas utiliser plus de 2 jokers (?).");
				setErrorModalVisible(true);
				setResults([]);
				return;
			} else {
				setErrorMessage(null);
				setErrorModalVisible(false);
			}

			setIsRunning(true);

			if (input.length === 0) {
				setResults([]);
				setIsRunning(false);
				return;
			}

			await new Promise(resolve => setTimeout(resolve, 50));

			let anagrams: string[];
			if (input.includes("?")) {
				anagrams = await findAnagramsWithJokerAsync(input);
			} else {
				anagrams = await findAnagramsAsync(input);
			}

			setResults(anagrams);
			setIsRunning(false);
		},
		[word]
	);

	const handleCloseErrorModal = () => {
		if (word.includes("?")) {
			let seen = 0;
			const fixed = word
				.split("")
				.map(c => {
					if (c === "?") {
						seen += 1;
						return seen <= 2 ? "?" : "";
					}
					return c;
				})
				.join("");
			setWord(fixed);
		}
		setErrorMessage(null);
		setErrorModalVisible(false);
	};


	const openDefinitionModal = async (selected: string) => {
		setSelectedWord(selected);
		setDefinition(null);
		setModalVisible(true);
		setLoadingDef(true);

		const def = await getDefinitionWithApi(selected);
		setDefinition(def || "Pas de définition trouvée.");
		setLoadingDef(false);
	};

	return (
		<ThemedSafeAreaView style={styles.container}>
			<ScrollView
				contentContainerStyle={[
					styles.scrollContent,
					isEmpty && results.length === 0 ? styles.centerEmpty : {},
				]}
				keyboardShouldPersistTaps="handled"
			>
				<ThemedText style={styles.title}>Triche Scrabble</ThemedText>

				<SearchInput
					word={word}
					setWord={setWord}
					onSearch={runSearch}
					maxLength={10}
					debounceMs={1000}
				/>

				<ResultsList
					results={results}
					isRunning={isRunning}
					word={word}
					highlightJokerLetters={highlightJokerLetters}
					openDefinitionModal={openDefinitionModal}
					styles={styles}
				/>
			</ScrollView>

			{/* Modals */}
			<DefinitionModal
				visible={modalVisible}
				selectedWord={selectedWord}
				definition={definition}
				loadingDef={loadingDef}
				onClose={() => setModalVisible(false)}
			/>

			<ErrorModal
				visible={errorModalVisible}
				message={errorMessage}
				onClose={handleCloseErrorModal}
			/>

		</ThemedSafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#222a22" },
	scrollContent: { flexGrow: 1, paddingBottom: 40, paddingHorizontal: 16 },
	centerEmpty: { justifyContent: "center", alignItems: "center" },
	title: {
		fontSize: 32,
		fontWeight: "bold",
		color: "#b2df28",
		marginBottom: 24,
		letterSpacing: 2,
		textAlign: "center",
		paddingTop: 32,
		paddingBottom: 16,
	},
	resultContainer: { marginTop: 24, paddingHorizontal: 8 },
});
