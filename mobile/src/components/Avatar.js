import { Image, View, Text, Pressable, StyleSheet } from 'react-native';
export default function Avatar({ name = '', photo, onPress, size = 44 }) {
    const initials = name.trim().split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase() || '?';
    const content = photo ? <Image source={{ uri: photo }} style={{ width: size, height: size, borderRadius: size / 2 }} /> : <Text style={{ color: '#0d3b5f', fontWeight: '700', fontSize: size / 3 }}>{initials}</Text>;
    const style = [styles.avatar, { width: size, height: size, borderRadius: size / 2 }];
    return onPress ? <Pressable accessibilityRole="button" accessibilityLabel="Editar perfil" onPress={onPress} style={style}>{content}</Pressable> : <View style={style}>{content}</View>;
}
const styles = StyleSheet.create({ avatar: { backgroundColor: '#dff3ff', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 1, borderColor: '#aacfe8' } });
