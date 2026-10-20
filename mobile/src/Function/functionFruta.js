const fruitNames = {
    apple: 'Maçã', greenapple: 'Maçã verde', apricot: 'Damasco', avocado: 'Abacate',
    banana: 'Banana', blackberry: 'Amora-preta', blueberry: 'Mirtilo', cherry: 'Cereja',
    cranberry: 'Oxicoco', durian: 'Durião', feijoa: 'Feijoa', fig: 'Figo',
    gooseberry: 'Groselha', grape: 'Uva', guava: 'Goiaba', kiwi: 'Kiwi', kiwifruit: 'Kiwi',
    lemon: 'Limão-siciliano', lime: 'Lima', lingonberry: 'Arando-vermelho', lychee: 'Lichia',
    mango: 'Manga', melon: 'Melão', morus: 'Amora', orange: 'Laranja', papaya: 'Mamão',
    passionfruit: 'Maracujá', peach: 'Pêssego', pear: 'Pera', persimmon: 'Caqui',
    pineapple: 'Abacaxi', pitahaya: 'Pitaya', dragonfruit: 'Pitaya', plum: 'Ameixa',
    pomegranate: 'Romã', raspberry: 'Framboesa', strawberry: 'Morango',
    tangerine: 'Tangerina', tomato: 'Tomate', watermelon: 'Melancia', jackfruit: 'Jaca',
    'horned melon': 'Kiwano', hazelnut: 'Avelã', pomelo: 'Pomelo', mangosteen: 'Mangostão',
    pumpkin: 'Abóbora', 'japanese persimmon': 'Caqui japonês', annona: 'Anona',
    'ceylon gooseberry': 'Groselha-do-ceilão',
};

export function fruitDisplayName(name) {
    return fruitNames[name.toLowerCase()] || name;
}

function normalizeSearch(text) {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

export function filterFruits(fruits, query) {
    const term = normalizeSearch(query);
    return fruits.filter(fruit => normalizeSearch(`${fruitDisplayName(fruit.name)} ${fruit.name}`).includes(term));
}

export function formatNutrient(value) {
    return value.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
}
