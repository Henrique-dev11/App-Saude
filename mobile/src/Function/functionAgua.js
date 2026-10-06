export function calcularMeta(peso) {
    const valor = peso.toString().replace(',', '.').trim();
    const pesoNum = Number(valor);

    if (!valor || Number.isNaN(pesoNum) || pesoNum <= 0) {
        return 0;
    }

    return pesoNum * 35;
}

export function adicionarConsumo(consumoAtual, metaDiaria) {
    if (!metaDiaria) {
        return consumoAtual;
    }

    return Math.min(
        consumoAtual + 250,
        metaDiaria
    );
}

export function calcularRestante(metaDiaria, consumoAtual) {
    if (metaDiaria <= 0) {
        return 0;
    }

    return Math.max(
        metaDiaria - consumoAtual,
        0
    );
}

export function calcularPercentual(metaDiaria, consumoAtual) {
    if (metaDiaria <= 0) {
        return 0;
    }

    return Math.min(
        (consumoAtual / metaDiaria) * 100,
        100
    );
}

export function converterParaLitros(valorMl) {
    return (valorMl / 1000).toFixed(2);
}