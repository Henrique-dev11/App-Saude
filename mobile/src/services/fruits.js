import { Platform } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_FRUIT_API_URL ||
    (Platform.OS === 'web' ? '/api/fruits' : 'https://www.fruityvice.com/api/fruit/all');
const nutrients = ['calories', 'fat', 'sugar', 'carbohydrates', 'protein'];

export async function getFruits({ signal } = {}) {
    const controller = new AbortController();
    const abort = () => controller.abort();
    const timeout = setTimeout(abort, 15000);
    if (signal?.aborted) controller.abort();
    signal?.addEventListener('abort', abort);
    try {
        const response = await fetch(API_URL, { signal: controller.signal });
        if (!response.ok) throw new Error('A consulta de frutas está indisponível. Tente novamente.');
        const data = await response.json();
        const valid = Array.isArray(data) && data.every(fruit =>
            Number.isInteger(fruit.id) && typeof fruit.name === 'string' && fruit.name.trim() &&
            nutrients.every(key => Number.isFinite(fruit.nutritions?.[key]) && fruit.nutritions[key] >= 0));
        if (!valid) throw new Error('A API retornou dados de frutas inválidos. Tente novamente.');
        return data;
    } catch (error) {
        if (signal?.aborted) throw error;
        if (controller.signal.aborted) throw new Error('A consulta demorou demais. Tente novamente.');
        if (error instanceof TypeError) throw new Error('Não foi possível carregar as frutas. Verifique sua conexão.');
        throw error;
    } finally {
        clearTimeout(timeout);
        signal?.removeEventListener('abort', abort);
    }
}
