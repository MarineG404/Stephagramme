import { ThemedSafeAreaView } from "@/components/themed/ThemedSafeAreaView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { AntDesign, Feather } from "@expo/vector-icons";
import { Audio } from "expo-av";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
	ActivityIndicator,
	Dimensions,
	ScrollView,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

import { findAnagrams, findAnagramsWithJoker } from "@/utils/anagrammes";
import { highlightJokerLetters } from "@/utils/highlightJoker";

const MAX_WIDTH = Dimensions.get("window").width * 0.9;

export default function HomeScreen() {
	const [word, setWord] = useState("");
	const [results, setResults] = useState<string[]>([]);
	const [isRunning, setIsRunning] = useState(false);
	const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

	const isEmpty = word.trim().length === 0;

	// Configure audio mode on mount
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

	// Main search function
	const runSearch = useCallback(async () => {
		const trimmed = word.trim();

		setIsRunning(true);

		if (trimmed.length === 0) {
			setResults([]);
			setIsRunning(false);
			return;
		}

		await new Promise((resolve) => setTimeout(resolve, 100));

		let anagrams: string[];
		if (trimmed.includes("?")) {
			const inputWithoutJoker = trimmed.replace(/\?/g, "");
			anagrams = findAnagramsWithJoker(inputWithoutJoker);
		} else {
			anagrams = findAnagrams(trimmed);
		}

		anagrams.sort((a, b) => b.length - a.length || a.localeCompare(b));
		setResults(anagrams);
		setIsRunning(false);
	}, [word]);

	// Debounced search when typing
	useEffect(() => {
		if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
		debounceTimeout.current = setTimeout(() => {
			runSearch();
		}, 200);

		return () => {
			if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
		};
	}, [word, runSearch]);

	return (
		<ThemedSafeAreaView style={styles.container}>
			<ScrollView
				contentContainerStyle={[
					styles.scrollContent,
					isEmpty && results.length === 0 ? styles.centerEmpty : {},
				]}
				keyboardShouldPersistTaps="handled"
			>
				{/* Header / Input */}
				<View style={styles.header}>
					<ThemedText style={styles.title}>Triche Scrabble</ThemedText>

					<ThemedView style={styles.inputContainer}>
						<View style={styles.inputRow}>
							<TextInput
								style={styles.input}
								placeholder="Entrez vos lettres…"
								placeholderTextColor="#b2df28"
								value={word}
								onChangeText={setWord}
								autoCapitalize="none"
								autoCorrect={false}
							/>

							<TouchableOpacity onPress={runSearch} style={styles.iconButton}>
								<Feather name="refresh-ccw" size={24} color="#b2df28" />
							</TouchableOpacity>

							<TouchableOpacity
								onPress={() => setWord("")}
								style={[
									styles.iconButton,
									isEmpty && styles.iconButtonDisabled,
								]}
								disabled={isEmpty}
							>
								<AntDesign
									name="closecircle"
									size={24}
									color={isEmpty ? "#555" : "#b2df28"}
								/>
							</TouchableOpacity>
						</View>
					</ThemedView>
				</View>

				{/* Résultats */}
				<View style={styles.resultContainer}>
					{isRunning ? (
						<ActivityIndicator size="large" color="#b2df28" style={styles.loader} />
					) : results.length === 0 && !isEmpty ? (
						<ThemedText style={styles.noResultText}>
							Aucun résultat trouvé
						</ThemedText>
					) : results.length > 0 ? (
						<>
							<ThemedText style={styles.countText}>
								{results.length} mot{results.length > 1 ? "s" : ""} trouvé
								{results.length > 1 ? "s" : ""}
							</ThemedText>
							<View style={styles.wordList}>
								{results.map((suggestedWord, index) => {
									const letters = highlightJokerLetters(suggestedWord, word);
									return (
										<ThemedView key={index} style={styles.badge}>
											<View style={styles.badgeInner}>
												{letters.map((l, i) => (
													<ThemedText
														key={i}
														style={{
															color: l.isJoker ? "#ff5c5c" : "#fff",
															letterSpacing: 1,
															fontSize: 22,
														}}
													>
														{l.letter}
													</ThemedText>
												))}
											</View>
										</ThemedView>
									);
								})}
							</View>
						</>
					) : null}
				</View>
			</ScrollView>
		</ThemedSafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#222a22",
	},
	scrollContent: {
		flexGrow: 1,
		paddingBottom: 40,
		paddingHorizontal: 16,
	},
	centerEmpty: {
		justifyContent: "center",
		alignItems: "center",
	},
	header: {
		alignItems: "center",
		paddingTop: 32,
		paddingBottom: 16,
	},
	title: {
		fontSize: 32,
		fontWeight: "bold",
		color: "#b2df28",
		marginBottom: 24,
		letterSpacing: 2,
	},
	inputContainer: {
		width: MAX_WIDTH,
		backgroundColor: "#333",
		borderRadius: 12,
		padding: 8,
		borderWidth: 2,
		borderColor: "#b2df28",
	},
	inputRow: {
		flexDirection: "row",
		alignItems: "center",
	},
	input: {
		flex: 1,
		fontSize: 20,
		color: "#fff",
		paddingVertical: 8,
		paddingHorizontal: 12,
		letterSpacing: 2,
	},
	iconButton: {
		paddingHorizontal: 8,
		paddingVertical: 4,
	},
	iconButtonDisabled: {
		opacity: 0.4,
	},
	resultContainer: {
		marginTop: 24,
		paddingHorizontal: 8,
	},
	loader: {
		marginVertical: 24,
	},
	noResultText: {
		color: "#ff5c5c",
		fontSize: 18,
		marginTop: 16,
		textAlign: "center",
	},
	countText: {
		color: "#b2df28",
		fontSize: 16,
		marginBottom: 12,
		textAlign: "center",
	},
	wordList: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "center",
	},
	badge: {
		backgroundColor: "#333",
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: "#b2df28",
		margin: 4,
	},
	badgeInner: {
		flexDirection: "row",
	},
});
