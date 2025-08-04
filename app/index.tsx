import { ThemedSafeAreaView } from "@/components/themed/ThemedSafeAreaView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { AntDesign, Feather } from "@expo/vector-icons";
import { Audio } from "expo-av";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
	ActivityIndicator,
	Dimensions,
	Linking,
	Modal,
	Pressable,
	ScrollView,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	View
} from "react-native";

import { findAnagrams, findAnagramsWithJoker } from "@/utils/anagrammes";
import { getDefinitionWithApi } from "@/utils/def";
import { highlightJokerLetters } from "@/utils/highlightJoker";

const MAX_WIDTH = Dimensions.get("window").width * 0.95;

export default function HomeScreen() {
	const [word, setWord] = useState("");
	const [results, setResults] = useState<string[]>([]);
	const [isRunning, setIsRunning] = useState(false);
	const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Modal state
	const [selectedWord, setSelectedWord] = useState<string | null>(null);
	const [definition, setDefinition] = useState<string | null>(null);
	const [modalVisible, setModalVisible] = useState(false);
	const [loadingDef, setLoadingDef] = useState(false);

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
			anagrams = findAnagramsWithJoker(trimmed);
		} else {
			anagrams = findAnagrams(trimmed);
		}

		anagrams.sort((a, b) => b.length - a.length || a.localeCompare(b));
		setResults(anagrams);
		setIsRunning(false);
	}, [word]);

	useEffect(() => {
		if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
		debounceTimeout.current = setTimeout(() => {
			runSearch();
		}, 200);

		return () => {
			if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
		};
	}, [word, runSearch]);

	// Ouvre modal avec définition
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
				{/* Header */}
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
								<Feather name="refresh-ccw" size={28} color="#b2df28" />
							</TouchableOpacity>

							<TouchableOpacity
								onPress={() => setWord("")}
								style={[styles.iconButton, isEmpty && styles.iconButtonDisabled]}
								disabled={isEmpty}
							>
								<AntDesign
									name="closecircle"
									size={28}
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
						<ThemedText style={styles.noResultText}>Aucun résultat trouvé</ThemedText>
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
										<TouchableOpacity
											key={index}
											style={styles.badge}
											onPress={() => openDefinitionModal(suggestedWord)}
										>
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
										</TouchableOpacity>
									);
								})}
							</View>
						</>
					) : null}
				</View>
			</ScrollView>

			{/* Modal */}
			<Modal
				visible={modalVisible}
				transparent
				animationType="slide"
				onRequestClose={() => setModalVisible(false)}
			>
				<View style={modalStyles.overlay}>
					<View style={modalStyles.container}>
						<ThemedText style={modalStyles.title}>{selectedWord}</ThemedText>

						{/* ScrollView pour afficher toute la définition */}
						<ScrollView
							style={modalStyles.scrollView}
							contentContainerStyle={{ paddingBottom: 12 }}
							showsVerticalScrollIndicator={true}
						>
							{loadingDef ? (
								<ActivityIndicator color="#b2df28" />
							) : (
								<ThemedText style={modalStyles.definition}>{definition}</ThemedText>
							)}
						</ScrollView>

						{!loadingDef && (
							<Pressable
								onPress={() =>
									Linking.openURL(
										`https://fr.wiktionary.org/wiki/${encodeURIComponent(
											(selectedWord || "").toLowerCase()
										)}`
									)
								}
							>
								<ThemedText style={modalStyles.link}>Voir sur Wiktionnaire →</ThemedText>
							</Pressable>
						)}

						<Pressable onPress={() => setModalVisible(false)} style={modalStyles.closeButton}>
							<ThemedText style={modalStyles.closeText}>Fermer</ThemedText>
						</Pressable>
					</View>
				</View>
			</Modal>

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
		fontSize: 22,
		color: "#fff",
		paddingVertical: 12,
		paddingHorizontal: 16,
		letterSpacing: 2,
	},
	iconButton: {
		paddingHorizontal: 16,
		paddingVertical: 12,
		marginLeft: 8,
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 8,
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

const modalStyles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.6)",
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 16,
	},
	container: {
		width: "85%",
		backgroundColor: "#2e2e2e",
		borderRadius: 12,
		padding: 20,
		alignItems: "center",
		borderColor: "#b2df28",
		borderWidth: 2,
		maxHeight: "70%", // Modal max 70% hauteur écran
		justifyContent: "flex-start",
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#b2df28",
		marginBottom: 12,
		textAlign: "center",
	},
	scrollView: {
		width: "100%",
		// hauteur max pour scroll si texte long
		maxHeight: 200,
		marginBottom: 12,
	},
	definition: {
		fontSize: 16,
		color: "#fff",
		textAlign: "left",
	},
	link: {
		color: "#b2df28",
		textDecorationLine: "underline",
		fontSize: 14,
		marginBottom: 12,
	},
	closeButton: {
		marginTop: 8,
		paddingVertical: 8,
		paddingHorizontal: 20,
		borderRadius: 8,
		backgroundColor: "#444",
	},
	closeText: {
		color: "#fff",
		fontSize: 16,
	},
});
