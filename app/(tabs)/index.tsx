import SafeArea from "@/components/themed/SafeArea";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Audio } from "expo-av";
import React from "react";
import {
	Dimensions,
	ScrollView,
	StyleSheet,
	TextInput,
	View,
} from "react-native";

const MAX_WIDTH = Dimensions.get("window").width * 0.9;

import { findAnagrams } from "@/utils/anagrammes";

// Prevent app from pausing background music by allowing audio to mix with others.
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
	const [mot, setMot] = React.useState("");
	const [resultats, setResultats] = React.useState<string[]>([]);

	React.useEffect(() => {
		const trimmed = mot.trim();
		if (trimmed.length === 0) {
			setResultats([]);
			return;
		}

		const timeout = setTimeout(() => {
			const anagrammes = findAnagrams(trimmed);
			setResultats(anagrammes);
		}, 30);

		return () => clearTimeout(timeout);
	}, [mot]);

	const isEmpty = mot.trim().length === 0;

	return (
		<SafeArea style={styles.container}>
			<ScrollView
				contentContainerStyle={[
					styles.scrollContent,
					isEmpty && resultats.length === 0 ? styles.centerEmpty : {},
				]}
				keyboardShouldPersistTaps="handled"
			>
				<View style={styles.header}>
					<ThemedText style={styles.title}>Triche Scrabble</ThemedText>

					<ThemedView style={styles.inputContainer}>
						<TextInput
							style={styles.input}
							placeholder="Entrez vos lettres…"
							placeholderTextColor="#b2df28"
							value={mot}
							onChangeText={setMot}
							autoCapitalize="none"
							autoCorrect={false}
						/>
					</ThemedView>
				</View>

				<ThemedView style={styles.resultatsContainer}>
					{resultats.length === 0 && mot.length > 0 ? (
						<ThemedText>Aucun résultat trouvé</ThemedText>
					) : (
						resultats.map((mot, index) => (
							<ThemedView key={index} style={styles.badge}>
								<ThemedText style={styles.badgeText}>{mot}</ThemedText>
							</ThemedView>
						))
					)}
				</ThemedView>
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
		padding: 12,
		borderWidth: 2,
		borderColor: "#b2df28",
	},
	input: {
		fontSize: 20,
		color: "#fff",
		letterSpacing: 2,
	},
	resultatsContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "center",
		gap: 8,
		marginTop: 24,
		backgroundColor: "#222a22",
	},
	badge: {
		backgroundColor: "#333",
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: "#b2df28",
	},
	badgeText: {
		color: "#fff",
		fontSize: 22,
		letterSpacing: 1,
	},
});
