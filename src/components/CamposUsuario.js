import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import InputCampo from './InputCampo';
import SeletorTipoSanguineo from './SeletorTipoSanguineo';
import { colors, spacing } from '../theme';

export const formularioUsuario = usuario => ({
    nome: usuario?.nome || '', email: usuario?.email || '', idade: String(usuario?.idade ?? ''),
    tipoSanguineo: usuario?.tipoSanguineo || '', tipoAlergia: usuario?.tipoAlergia || '', peso: String(usuario?.peso ?? ''), altura: String(usuario?.altura ?? ''),
});

export default function CamposUsuario({ value, onChange, disabled = false }) {
    const campo = (key, label, keyboardType, placeholder, extra = {}) => <View key={key}>
        <Text style={styles.rotulo}>{label}</Text>
        <InputCampo value={value[key]} onChangeText={text => onChange({ ...value, [key]: text })}
            keyboardType={keyboardType} placeholder={placeholder} accessibilityLabel={label}
            editable={!disabled} {...extra} />
    </View>;
    return <>
        {campo('nome', 'Nome completo', 'default', 'Seu nome completo', { autoComplete: 'name' })}
        {campo('email', 'E-mail', 'email-address', 'voce@exemplo.com', { autoComplete: 'email' })}
        <Text style={styles.secao}>Informações pessoais</Text>
        {campo('idade', 'Idade (anos)', 'number-pad', 'Ex.: 28', { maxLength: 3 })}
        <Text style={styles.rotulo}>Tipo sanguíneo</Text>
        <SeletorTipoSanguineo value={value.tipoSanguineo} onChange={tipoSanguineo => onChange({ ...value, tipoSanguineo })} disabled={disabled} />
        <Text style={styles.secao}>Alergias</Text>
        {campo('tipoAlergia', 'Tipo de alergia (opcional)', 'default', 'Ex.: Dipirona, poeira, amendoim', { maxLength: 300 })}
        <Text style={styles.dica}>Informe suas alergias ou escreva “Nenhuma conhecida”.</Text>
        <Text style={styles.secao}>Informações físicas</Text>
        {campo('peso', 'Peso (kg)', 'decimal-pad', 'Ex.: 70,5')}
        {campo('altura', 'Altura (cm)', 'decimal-pad', 'Ex.: 175')}
    </>;
}

const styles = StyleSheet.create({
    rotulo: { fontSize: 14, fontWeight: '600', color: colors.textMuted, marginBottom: 6 },
    dica: { color: colors.textMuted, fontSize: 13, lineHeight: 19, marginBottom: spacing.md },
    secao: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: spacing.sm, marginBottom: spacing.md },
});
