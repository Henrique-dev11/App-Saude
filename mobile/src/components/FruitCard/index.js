import { Text, View } from 'react-native';
import { fruitDisplayName, formatNutrient } from '../../Function/functionFruta';
import styles from './style';

const nutrients = [
    ['calories', 'Energia', 'kcal'], ['carbohydrates', 'Carboidratos', 'g'],
    ['sugar', 'Açúcares', 'g'], ['protein', 'Proteínas', 'g'], ['fat', 'Gorduras', 'g'],
];

export default function FruitCard({ fruit }) {
    return (
        <View style={styles.card}>
            <Text style={styles.title}>{fruitDisplayName(fruit.name)}</Text>
            <Text style={styles.subtitle}>{fruit.name} · porção de 100 g</Text>
            <View style={styles.nutrients}>
                {nutrients.map(([key, label, unit]) => (
                    <View key={key} style={styles.nutrient}>
                        <Text style={styles.label}>{label}</Text>
                        <Text style={styles.value}>{formatNutrient(fruit.nutritions[key])} {unit}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}
