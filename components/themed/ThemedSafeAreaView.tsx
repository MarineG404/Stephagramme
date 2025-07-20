import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import type { StyleProp, ViewProps, ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export type ThemedSafeAreaViewProps = ViewProps & {
	lightColor?: string;
	darkColor?: string;
	style?: StyleProp<ViewStyle>;
};

export function ThemedSafeAreaView({ style, lightColor, darkColor, ...otherProps }: ThemedSafeAreaViewProps) {
	const insets = useSafeAreaInsets();

	const backgroundColor = useThemeColor({ light: lightColor ?? '#222a22', dark: darkColor ?? '#222a22' }, 'background');

	return (
		<SafeAreaView
			style={[
				{
					backgroundColor,
					paddingTop: insets.top + 8,
					paddingBottom: insets.bottom,
					paddingLeft: insets.left,
					paddingRight: insets.right,
					flex: 1,
				},
				style,
			]}
			{...otherProps}
		/>
	);
}
