import React from "react";
import { TextInput, StyleSheet} from "react-native";
import { colors, radius, spacing } from "../theme";

const InputCampo = ({ placeholder, value, onChangeText, keyboardType = 'numeric', secureTextEntry = false, ...props }) => {

    return (
        <TextInput
                    style={styles.botao}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textMuted}
                    keyboardType={keyboardType}
                    secureTextEntry={secureTextEntry}
                    autoCapitalize={secureTextEntry || keyboardType === 'email-address' ? 'none' : 'sentences'}
                    autoCorrect={!secureTextEntry && keyboardType !== 'email-address'}
                    value={value}
                    onChangeText={onChangeText}
                    {...props}
                />

    
    )
}



export default InputCampo;

const styles = StyleSheet.create({
    botao: {
        width: '100%',
        borderWidth: 1.5,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        color: colors.text,
        borderRadius: radius.md,
        paddingHorizontal: 14,
        height: 48,
        marginBottom: spacing.md,
        fontSize: 16,
    },
});
