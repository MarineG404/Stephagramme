import React from "react";
import { View, ViewProps, StyleSheet, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = ViewProps & {
	children: React.ReactNode;
	style?: any;
};

export default function SafeArea({ children, style, ...rest }: Props) {
	const insets = useSafeAreaInsets();
	const screenHeight = Dimensions.get("window").height;

	return (
		<View
			style={[
				styles.base,
				{
					paddingTop: insets.top + screenHeight * 0.05,
					paddingBottom: insets.bottom + 16,
					paddingHorizontal: 20,
				},
				style,
			]}
			{...rest}
		>
			{children}
		</View>
	);
}

const styles = StyleSheet.create({
	base: {
		flex: 1,
		backgroundColor: "#222a22",
	},
});

