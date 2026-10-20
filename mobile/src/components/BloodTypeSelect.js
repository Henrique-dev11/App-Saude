import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View, StyleSheet } from 'react-native';
import { BLOOD_TYPES } from '../Function/functionPerfil';
export default function BloodTypeSelect({ value, onChange }) {
    const [open, setOpen] = useState(false);
    return <>
        <Pressable accessibilityRole="button" accessibilityLabel={`Tipo sanguíneo: ${value || 'selecione'}`} accessibilityState={{ expanded: open }} onPress={() => setOpen(true)} style={styles.input}><Text style={styles.text}>{value || 'Selecione seu tipo sanguíneo'}</Text><Text>▼</Text></Pressable>
        <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
            <View style={styles.overlay}><View accessibilityViewIsModal style={styles.card}>
                <Text style={styles.title}>Tipo sanguíneo</Text>
                <ScrollView>{BLOOD_TYPES.map(type => <Pressable key={type} accessibilityRole="radio" accessibilityState={{ checked: value === type }} onPress={() => { onChange(type); setOpen(false); }} style={[styles.option, value === type && styles.selected]}><Text style={styles.text}>{type}{value === type ? '  ✓' : ''}</Text></Pressable>)}</ScrollView>
                <Pressable onPress={() => setOpen(false)} style={styles.option}><Text style={styles.text}>Cancelar</Text></Pressable>
            </View></View>
        </Modal>
    </>;
}
const styles = StyleSheet.create({
    input: { minHeight: 48, borderWidth: 1, borderColor: '#b9c9d6', borderRadius: 8, padding: 12, flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
    text: { color: '#0d3b5f', fontSize: 16, flexShrink: 1 },
    overlay: { flex: 1, backgroundColor: '#0008', alignItems: 'center', justifyContent: 'center', padding: 24 },
    card: { backgroundColor: '#fff', borderRadius: 18, padding: 20, width: '100%', maxWidth: 400, maxHeight: '85%' },
    title: { fontSize: 20, color: '#0d3b5f', fontWeight: '700', marginBottom: 12 },
    option: { padding: 14, borderRadius: 8 }, selected: { backgroundColor: '#dff3ff' },
});
