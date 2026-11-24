const fields = ['calories', 'carbohydrates', 'protein', 'fat', 'sugar'];

function validarFrutas(data) {
    if (!Array.isArray(data) || data.length === 0) throw new Error('Lista de frutas inválida.');
    const ids = new Set();
    for (const fruit of data) {
        if (!fruit || !Number.isInteger(fruit.id) || ids.has(fruit.id) ||
            typeof fruit.name !== 'string' || !fruit.name.trim() ||
            (fruit.nutritions != null && (typeof fruit.nutritions !== 'object' || Array.isArray(fruit.nutritions) ||
                !fields.every(key => fruit.nutritions[key] == null ||
                    (typeof fruit.nutritions[key] === 'number' && Number.isFinite(fruit.nutritions[key]) && fruit.nutritions[key] >= 0))))) {
            throw new Error('Dados de fruta inválidos.');
        }
        ids.add(fruit.id);
    }
    return data;
}

module.exports = { validarFrutas };
