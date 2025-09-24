import { ThemedText } from "@/components/themed/ThemedText";
import { ThemedView } from "@/components/themed/ThemedView";
import { AntDesign, Feather } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Dimensions, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

const MAX_WIDTH = Dimensions.get("window").width * 0.95;

type Props = {
	word: string;
	setWord: (v: string) => void;
	onSearch: (v?: string) => void;
	maxLength?: number;
	debounceMs?: number;
	isRunning?: boolean;
};

export default function SearchInput({
	word,
	setWord,
	onSearch,
	maxLength = 10,
	debounceMs = 1000,
	isRunning = false,
}: Props) {
	const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
	const isEmpty = word.trim().length === 0;

	const handleChange = (text: string) => {
		setWord(text);

		if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
		debounceTimeout.current = setTimeout(() => {
			onSearch(text);
		}, debounceMs);
	};

	useEffect(() => {
		return () => {
			if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
		};
	}, []);

	return (
		<ThemedView style={styles.inputContainer}>
			<View style={styles.inputRow}>
				<TextInput
					style={styles.input}
					placeholder="Entrez vos lettres…"
					placeholderTextColor="#b2df28"
					value={word}
					onChangeText={handleChange}
					autoCapitalize="none"
					autoCorrect={false}
					maxLength={maxLength}
				/>

				<TouchableOpacity onPress={() => onSearch(word)} style={styles.iconButton} disabled={isRunning}>
					<Feather name="refresh-ccw" size={28} color="#b2df28" />
				</TouchableOpacity>

				<TouchableOpacity
					onPress={() => setWord("")}
					style={[styles.iconButton, isEmpty && styles.iconButtonDisabled]}
					disabled={isEmpty}
				>
					<AntDesign name="closecircle" size={28} color={isEmpty ? "#555" : "#b2df28"} />
				</TouchableOpacity>
			</View>

			<ThemedText style={{ color: "#b2df28", marginTop: 4, textAlign: "right" }}>
				{word.length}/{maxLength}
			</ThemedText>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	inputContainer: {
		width: MAX_WIDTH,
		backgroundColor: "#333",
		borderRadius: 12,
		padding: 8,
		borderWidth: 2,
		borderColor: "#b2df28",
		alignSelf: "center",
		marginBottom: 8,
	},
	inputRow: { flexDirection: "row", alignItems: "center" },
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
	iconButtonDisabled: { opacity: 0.4 },
});
