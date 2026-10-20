import { useState } from 'react';
import { ActivityIndicator, FlatList, Image, Text, View } from 'react-native';
import Input from '../../components/Input';
import Button from '../../components/Button';
import FruitCard from '../../components/FruitCard';
import useFruits from '../../hooks/useFruits';
import { filterFruits } from '../../Function/functionFruta';
import styles from './style';

export default function Fruta() {
    const [query, setQuery] = useState('');
    const { fruits, loading, error, reload } = useFruits();
    const filtered = filterFruits(fruits, query);

    return (
        <FlatList
            style={styles.screen}
            contentContainerStyle={styles.content}
            data={filtered}
            keyExtractor={fruit => String(fruit.id)}
            renderItem={({ item }) => <FruitCard fruit={item} />}
            keyboardShouldPersistTaps="handled"
            refreshing={loading && fruits.length > 0}
            onRefresh={reload}
            ListHeaderComponent={
                <View style={styles.header}>
                    <View style={styles.heading}>
                        <Image source={require('../../../assets/Frutas.png')} style={styles.image} resizeMode="contain" />
                        <View style={styles.headingText}>
                            <Text style={styles.title}>Frutas</Text>
                            <Text style={styles.subtitle}>Conheça os nutrientes de cada fruta.</Text>
                        </View>
                    </View>
                    <Text style={styles.source}>Fonte: Fruityvice · valores por 100 g</Text>
                    <Input placeholder="Buscar fruta: maçã, banana, morango..." accessibilityLabel="Buscar fruta"
                        value={query} onChangeText={setQuery} autoCorrect={false} returnKeyType="search" />
                    {loading && <ActivityIndicator color="#22835b" accessibilityLabel="Carregando frutas" />}
                    {!!error && <View style={styles.errorCard}>
                        <Text accessibilityRole="alert" style={styles.error}>{error}</Text>
                        <Button label="Tentar novamente" onPress={reload} />
                    </View>}
                    {!loading && !error && <Text style={styles.count}>{filtered.length} fruta(s) encontrada(s)</Text>}
                </View>
            }
            ListEmptyComponent={!loading && !error ?
                <Text style={styles.empty}>{fruits.length ? 'Nenhuma fruta encontrada. Tente outro nome.' : 'Nenhuma fruta disponível no momento.'}</Text> : null}
        />
    );
}
