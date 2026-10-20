import { StyleSheet } from 'react-native';
export default StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#edf8ff' },
    content: { flexGrow: 1, justifyContent: 'center', padding: 24 },
    card: { backgroundColor: '#fff', padding: 24, borderRadius: 20, width: '100%', maxWidth: 480, alignSelf: 'center', gap: 12 },
    title: { fontSize: 28, fontWeight: '700', color: '#0d3b5f' },
    subtitle: { color: '#4d6a7d', marginBottom: 12, lineHeight: 22 },
    link: { color: '#216bb0', textAlign: 'center', padding: 12, fontWeight: '600' },
    error: { color: '#b42318', lineHeight: 21 },
    success: { color: '#187447', lineHeight: 21 },
    photo: { alignItems: 'center', gap: 8 },
});
