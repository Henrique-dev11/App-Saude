import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
        backgroundColor: '#f4f7fb',
        paddingBottom: 24,
    },
    container: {
        flex: 1,
        padding: 20,
        gap: 18,
    },
    headerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    iconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#ffe6e6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    icon: {
        fontSize: 32,
    },
    headerText: {
        flex: 1,
    },
    kicker: {
        fontSize: 12,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        color: '#a61b1b',
        fontWeight: '700',
        marginBottom: 4,
    },
    title: {
        fontSize: 30,
        fontWeight: '800',
        color: '#1f2937',
    },
    subtitle: {
        fontSize: 14,
        color: '#667085',
        marginTop: 4,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 18,
        padding: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 12,
    },
    inputGroup: {
        marginBottom: 14,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    resultCard: {
        backgroundColor: '#ffffff',
        borderLeftWidth: 6,
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    resultTitle: {
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 8,
    },
    resultMessage: {
        fontSize: 14,
        lineHeight: 20,
        color: '#4b5563',
    },
});

export default styles;
