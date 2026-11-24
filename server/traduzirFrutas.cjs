const {
    chaveNomeOriginal, nomeLocal, limparNomeTraduzido, normalizarNome,
} = require('../src/services/nomesFrutas');

// Nomes equivalentes e variedades com denominação específica no Brasil.
const nomesCanonicos = new Set(['kiwi', 'kiwifruit', 'pitahaya', 'dragonfruit', 'lemon', 'lime', 'blackberry', 'morus']);

function textoParaTraducao(nome) {
    return nome.trim().replace(/\s+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2');
}

function createFruitTranslator({ fetchImpl = fetch, now = Date.now } = {}) {
    const cache = new Map();
    let pending;

    async function traduzirLote(nomes, signal) {
        const url = new URL('https://api.mymemory.translated.net/get');
        url.searchParams.set('q', nomes.map(textoParaTraducao).join('\n'));
        url.searchParams.set('langpair', 'en|pt-BR');
        const response = await fetchImpl(url.toString(), { signal });
        if (!response.ok) throw new Error('Serviço de tradução indisponível.');
        const data = await response.json();
        if (Number(data.responseStatus) !== 200 || data.quotaFinished ||
            typeof data.responseData?.translatedText !== 'string') {
            throw new Error('Resposta de tradução inválida.');
        }
        const traducoes = data.responseData.translatedText.trim().split(/\r?\n/);
        if (traducoes.length !== nomes.length) throw new Error('Tradução incompleta.');
        return traducoes;
    }

    async function atualizar(nomes) {
        const lotes = [];
        let lote = [];
        for (const nome of nomes) {
            const texto = [...lote, nome].map(textoParaTraducao).join('\n');
            // Limite documentado do MyMemory: 500 bytes UTF-8 por consulta.
            if (Buffer.byteLength(texto, 'utf8') > 500 && lote.length) {
                lotes.push(lote);
                lote = [];
            }
            lote.push(nome);
        }
        if (lote.length) lotes.push(lote);
        // Compartilha o prazo entre os lotes para respeitar o timeout do cliente.
        const signal = AbortSignal.timeout(2500);
        await Promise.all(lotes.map(async nomesDoLote => {
            let traducoes = [];
            try { traducoes = await traduzirLote(nomesDoLote, signal); }
            catch { /* Usa os nomes locais ou a última tradução válida. */ }
            nomesDoLote.forEach((nome, index) => {
                const chave = chaveNomeOriginal(nome);
                const anterior = cache.get(chave);
                let traducao = limparNomeTraduzido(traducoes[index]);
                const semTraducao = traducao && traducao.toLowerCase() === textoParaTraducao(nome).toLowerCase() &&
                    normalizarNome(nomeLocal(nome) || '') !== normalizarNome(traducao);
                if (semTraducao) traducao = null;
                const fallback = !traducao;
                const nomePtBr = (nomesCanonicos.has(chave) && nomeLocal(nome)) ||
                    traducao || anterior?.nomePtBr || nomeLocal(nome);
                cache.set(chave, {
                    nomePtBr,
                    fallback,
                    // Falhas são tentadas novamente após um minuto; traduções duram 24 h.
                    expires: now() + (fallback ? 60000 : 24 * 60 * 60 * 1000),
                });
            });
        }));
    }

    return async function traduzirFrutas(frutas, { refresh = false } = {}) {
        // Requisições simultâneas compartilham a tradução do catálogo.
        if (pending) await pending;
        const nomes = [...new Map(frutas.map(fruta => [chaveNomeOriginal(fruta.name), fruta.name])).values()]
            .filter(nome => {
                const item = cache.get(chaveNomeOriginal(nome));
                return !item || item.expires <= now() || (refresh && item.fallback);
            });
        if (nomes.length) {
            pending = atualizar(nomes);
            try { await pending; }
            finally { pending = undefined; }
        }
        const resultado = frutas.map(fruta => ({
            ...fruta, nomePtBr: cache.get(chaveNomeOriginal(fruta.name)).nomePtBr,
        }));
        return {
            fruits: resultado,
            translationSource: frutas.some(fruta => cache.get(chaveNomeOriginal(fruta.name)).fallback)
                ? 'fallback' : (nomes.length ? 'api' : 'cache'),
        };
    };
}

module.exports = { createFruitTranslator };
