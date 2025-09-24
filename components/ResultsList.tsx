import { ThemedText } from "@/components/themed/ThemedText";
import React from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from "react-native";

type LetterHighlight = { letter: string; isJoker?: boolean };

type Props = {
	results: string[];
	isRunning: boolean;
	word: string;
	highlightJokerLetters: (suggestedWord: string, input: string) => LetterHighlight[];
	openDefinitionModal: (w: string) => void;
	styles: any;
};

export default function ResultsList({
	results,
	isRunning,
	word,
	highlightJokerLetters,
	openDefinitionModal,
}: Props) {
	const isEmpty = word.trim().length === 0;

	if (isRunning) {
		return <ActivityIndicator size="large" color="#b2df28" style={styles.loader} />;
	}

	if (!isRunning && results.length === 0 && !isEmpty) {
		return <ThemedText style={styles.noResultText}>Aucun résultat trouvé</ThemedText>;
	}

	if (results.length === 0) return null;

	return (
		<>
			<ThemedText style={styles.countText}>
				{results.length} mot{results.length > 1 ? "s" : ""} trouvé{results.length > 1 ? "s" : ""}
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
	);
}

const styles = StyleSheet.create({
	loader: { marginVertical: 24 },
	noResultText: { color: "#ff5c5c", fontSize: 18, marginTop: 16, textAlign: "center" },
	countText: { color: "#b2df28", fontSize: 16, marginBottom: 12, textAlign: "center" },
	wordList: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center" },
	badge: {
		backgroundColor: "#333",
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: "#b2df28",
		margin: 4,
	},
	badgeInner: { flexDirection: "row" },

});
