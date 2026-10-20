import { StyleSheet } from 'react-native';
export default StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#f2f8f4' },
    content: { padding: 20, paddingBottom: 40, width: '100%', maxWidth: 760, alignSelf: 'center' },
    header: { marginBottom: 18, gap: 14 },
    heading: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    headingText: { flex: 1 },
    image: { width: 70, height: 70 },
    title: { fontSize: 30, fontWeight: '800', color: '#18563e' },
    subtitle: { color: '#4d6a5b', fontSize: 15, lineHeight: 22, marginTop: 4 },
    source: { color: '#667085', fontSize: 13 },
    count: { color: '#4d6a5b', fontWeight: '600' },
    empty: { color: '#4d6a5b', textAlign: 'center', padding: 24, lineHeight: 22 },
    errorCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16 },
    error: { color: '#b42318', lineHeight: 22 },
});
