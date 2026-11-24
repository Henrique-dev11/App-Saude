const camposNutricionais = [
    { chave: 'calories', nome: 'Calorias', unidade: 'kcal' },
    { chave: 'carbohydrates', nome: 'Carboidratos', unidade: 'g' },
    { chave: 'protein', nome: 'Proteínas', unidade: 'g' },
    { chave: 'fat', nome: 'Gorduras', unidade: 'g' },
    { chave: 'sugar', nome: 'Açúcares', unidade: 'g' },
];

function informacoesNutricionais(fruta) {
    return camposNutricionais.map(campo => {
        const valor = fruta.nutritions?.[campo.chave];
        return {
            ...campo,
            valor: typeof valor === 'number' && Number.isFinite(valor) && valor >= 0 ? valor : null,
        };
    });
}

module.exports = { informacoesNutricionais };
