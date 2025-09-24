import { ThemedText } from "@/components/themed/ThemedText";
import React from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";

type Props = {
	visible: boolean;
	message: string | null;
	onClose: () => void;
};

export default function ErrorModal({ visible, message, onClose }: Props) {
	return (
		<Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
			<View style={styles.overlay}>
				<View style={styles.container}>
					<ThemedText style={styles.title}>Erreur</ThemedText>
					<ThemedText style={styles.message}>{message}</ThemedText>

					<Pressable onPress={onClose} style={styles.closeButton}>
						<ThemedText style={styles.closeText}>OK</ThemedText>
					</Pressable>
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
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
		maxHeight: "70%",
		justifyContent: "flex-start",
	},
	title: { fontSize: 24, fontWeight: "bold", color: "#b2df28", marginBottom: 12, textAlign: "center" },
	scrollView: { width: "100%", maxHeight: 200, marginBottom: 12 },
	message: { fontSize: 16, color: "#fff", textAlign: "left" },
	link: { color: "#b2df28", textDecorationLine: "underline", fontSize: 14, marginBottom: 12 },
	closeButton: { marginTop: 8, paddingVertical: 8, paddingHorizontal: 20, borderRadius: 8, backgroundColor: "#444" },
	closeText: { color: "#fff", fontSize: 16 },
});
