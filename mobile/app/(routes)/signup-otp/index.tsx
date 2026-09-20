import React, { useRef, useState } from 'react';
import { Keyboard, StyleSheet, Text, TextInput, View } from 'react-native';

export default function SignupOtpScreen() {
	const [code, setCode] = useState<string[]>(Array(6).fill(''));
	const inputs = useRef<Array<TextInput | null>>([]);

	const updateCode = (value: string, index: number) => {
		const digit = value.replace(/\D/g, '').slice(-1);
		const next = [...code];
		next[index] = digit;
		setCode(next);

		if (digit && index < 5) {
			inputs.current[index + 1]?.focus();
		} else if (digit && index === 5) {
			Keyboard.dismiss();
		}
	};

	const handleKeyPress = (key: string, index: number) => {
		if (key === 'Backspace' && !code[index] && index > 0) {
			inputs.current[index - 1]?.focus();
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Enter verification code</Text>
			<Text style={styles.subtitle}>Enter the 6-digit code sent to your phone.</Text>

			<View style={styles.inputs}>
				{code.map((digit, index) => (
					<TextInput
						key={index}
						ref={(input) => {
							inputs.current[index] = input;
						}}
						value={digit}
						onChangeText={(value) => updateCode(value, index)}
						onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
						keyboardType="number-pad"
						maxLength={1}
						selectTextOnFocus
						textAlign="center"
						style={styles.input}
					/>
				))}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 24,
		justifyContent: 'center',
		backgroundColor: '#fff',
	},
	title: {
		fontSize: 28,
		fontWeight: '700',
		color: '#111',
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 16,
		color: '#666',
		marginBottom: 32,
	},
	inputs: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	input: {
		width: 48,
		height: 56,
		borderWidth: 1,
		borderColor: '#D0D0D0',
		borderRadius: 10,
		fontSize: 24,
		color: '#111',
	},
});
