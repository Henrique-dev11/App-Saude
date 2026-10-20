import { StyleSheet } from 'react-native';
export default StyleSheet.create({
    card: { backgroundColor: '#fff', borderRadius: 18, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: '#dcebe4' },
    title: { fontSize: 22, fontWeight: '700', color: '#18563e' },
    subtitle: { color: '#667085', fontSize: 13, marginTop: 4 },
    nutrients: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 },
    nutrient: { minWidth: 110, flexGrow: 1, padding: 10, backgroundColor: '#f0f8f3', borderRadius: 10 },
    label: { color: '#4d6a5b', fontSize: 13 },
    value: { color: '#18563e', fontWeight: '700', fontSize: 17, marginTop: 4 },
});
