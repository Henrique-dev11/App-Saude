import { Text, View } from 'react-native';
import FormField from '../FormField';
import BloodTypeSelect from '../BloodTypeSelect';
import styles from './style';

export default function HealthFields({ weight, age, bloodType, onWeightChange, onAgeChange, onBloodTypeChange }) {
    return (
        <View style={styles.container}>
            <FormField label="Peso (kg)" placeholder="Ex.: 70,5" value={weight}
                onChangeText={onWeightChange} keyboardType="decimal-pad" maxLength={8} />
            <FormField label="Idade (anos)" placeholder="Ex.: 25" value={age}
                onChangeText={onAgeChange} keyboardType="number-pad" maxLength={3} />
            <Text style={styles.label}>Tipo sanguíneo</Text>
            <BloodTypeSelect value={bloodType} onChange={onBloodTypeChange} />
        </View>
    );
}
