import { Text, View } from 'react-native';
import Input from './Input';
export default function FormField({ label, ...props }) {
    return <View><Text style={{ color: '#374151', fontWeight: '600', marginBottom: 8 }}>{label}</Text><Input accessibilityLabel={label} {...props} /></View>;
}
