import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from '../Pages/Login/style';
export default function AccountLayout({ title, subtitle, children }) {
    return <SafeAreaView style={styles.screen}><KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}><View style={styles.card}><Text style={styles.title}>{title}</Text><Text style={styles.subtitle}>{subtitle}</Text>{children}</View></ScrollView></KeyboardAvoidingView></SafeAreaView>;
}
