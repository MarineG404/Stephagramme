import SafeArea from "@/components/themed/SafeArea";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { AntDesign, Feather } from '@expo/vector-icons';
import { Audio } from "expo-av";
import React from "react";
import {
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

Audio.setAudioModeAsync({
	allowsRecordingIOS: false,
	staysActiveInBackground: false,
	interruptionModeIOS: 1,
	playsInSilentModeIOS: true,
	shouldDuckAndroid: false,
	interruptionModeAndroid: 1,
	playThroughEarpieceAndroid: false,
});

export default function HomeScreen() {
	const [word, setWord] = React.useState("");
	const [results, setResults] = React.useState<string[]>([]);
	const [isRunning, setIsRunning] = React.useState(false);
	const [cleanIsRunning, setCleanIsRunning] = React.useState(false); // 👈 ajouté

	const runSearch = async () => {
		setIsRunning(true);
		await new Promise((resolve) => setTimeout(resolve, 50));

		const trimmed = word.trim();
		if (trimmed.length === 0) {
			setResults([]);
			setIsRunning(false);
			return;
		}

		let anagrams: string[];
		if (trimmed.includes("?")) {
			const inputWithoutJoker = trimmed.replace(/\?/g, "");
			anagrams = findAnagramsWithJoker(inputWithoutJoker);
		} else {
			anagrams = findAnagrams(trimmed);
		}

		setResults(anagrams);
		setIsRunning(false);
	};

	React.useEffect(() => {
		const timeout = setTimeout(() => {
			runSearch();
		}, 30);

		return () => clearTimeout(timeout);
	}, [word]);

	const isEmpty = word.trim().length === 0;

	return (
		<SafeArea style={styles.container}>
			<ScrollView
				contentContainerStyle={[
					styles.scrollContent,
					isEmpty && results.length === 0 ? styles.centerEmpty : {},
				]}
				keyboardShouldPersistTaps="handled"
			>
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
								onPress={async () => {
									setCleanIsRunning(true);
									await new Promise(resolve => setTimeout(resolve, 50));
									setWord('');
									setCleanIsRunning(false);
								}}
								style={[
									styles.iconButton,
									(cleanIsRunning || word.trim().length === 0) && styles.iconButtonDisabled,
								]}
								disabled={cleanIsRunning || word.trim().length === 0}
							>
								{cleanIsRunning ? (
									<AntDesign
										name="loading1"
										size={24}
										color="#b2df28"
									/>
								) : (
									<AntDesign
										name="closecircle"
										size={24}
										color={word.trim().length === 0 ? "#555" : "#b2df28"}
									/>
								)}
							</TouchableOpacity>
						</View>
					</ThemedView>
				</View>

				<View style={styles.resultContainer}>
					{isRunning ? (
						<ThemedText style={styles.loadingText}>Recherche en cours...</ThemedText>
					) : results.length === 0 && word.length > 0 ? (
						<ThemedText style={styles.noResultText}>Aucun résultat trouvé</ThemedText>
					) : results.length > 0 ? (
						<>
							<ThemedText style={styles.countText}>
								{results.length} mot{results.length > 1 ? "s" : ""} trouvé{results.length > 1 ? "s" : ""}
							</ThemedText>
							<View style={styles.wordList}>
								{results
									.sort((a, b) => b.length - a.length || a.localeCompare(b))
									.map((suggestedWord, index) => {
										const letters = highlightJokerLetters(suggestedWord, word);
										return (
											<ThemedView key={index} style={styles.badge}>
												<ThemedText style={styles.badgeText}>
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
												</ThemedText>
											</ThemedView>
										);
									})}
							</View>
						</>
					) : null}
				</View>
			</ScrollView>
		</SafeArea>
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
	loadingText: {
		color: "#b2df28",
		fontSize: 20,
		paddingVertical: 20,
		textAlign: "center",
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
		gap: 8,
	},
	badge: {
		backgroundColor: "#333",
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: "#b2df28",
		marginBottom: 8,
	},
	badgeText: {
		color: "#fff",
		fontSize: 22,
		letterSpacing: 1,
		flexDirection: "row",
		flexWrap: "nowrap",
	},
});
