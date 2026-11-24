import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Keyboard, Linking, Platform, Pressable, ScrollView,
    Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import MapaUBS from '../../components/MapaUBS';
import IconeMapa from '../../components/IconeMapa';
import { catalogo, filtrarUnidades, lerCoordenadas, textoCoordenadas, urlBuscarEndereco,
    urlGoogleMaps } from '../../services/unidadesSaude';
import { buscarEnderecoNativo, obterLocalizacao } from '../../services/localizacao';
import { colors } from '../../theme';
import styles from './style';

function Acao({ titulo, icone, onPress, principal = false, disabled = false }) {
    return <Pressable accessibilityRole="button" accessibilityLabel={titulo} disabled={disabled}
        onPress={onPress} style={({ pressed }) => [styles.acao, principal && styles.acaoPrincipal,
            (pressed || disabled) && styles.pressionado]}>
        {icone && <IconeMapa tipo={icone} size={18} color={principal ? 'white' : colors.primary} />}
        <Text style={[styles.acaoTexto, principal && styles.textoBranco]}>{titulo}</Text>
    </Pressable>;
}

function Coordenadas({ ponto }) {
    return <View style={styles.coordenadas}>
        <View style={styles.coordenada}>
            <Text style={styles.rotulo}>LATITUDE</Text>
            <Text selectable style={styles.numeroCoordenada}>{ponto.latitude.toFixed(7)}</Text>
        </View>
        <View style={styles.coordenada}>
            <Text style={styles.rotulo}>LONGITUDE</Text>
            <Text selectable style={styles.numeroCoordenada}>{ponto.longitude.toFixed(7)}</Text>
        </View>
    </View>;
}

export default function UnidadesSaude() {
    const insets = useSafeAreaInsets();
    const [modo, setModo] = useState('mapa');
    const [busca, setBusca] = useState('');
    const [selecionadaId, setSelecionadaId] = useState(null);
    const [localizacao, setLocalizacao] = useState(null);
    const [pontoBusca, setPontoBusca] = useState(null);
    const [foco, setFoco] = useState({ tipo: 'todos', pontos: catalogo });
    const [localizando, setLocalizando] = useState(false);
    const [buscandoEndereco, setBuscandoEndereco] = useState(false);
    const [mensagem, setMensagem] = useState('');
    const [erro, setErro] = useState('');
    const [ajuda, setAjuda] = useState(false);
    const [copiado, setCopiado] = useState('');
    const ativo = useRef(true);
    const operacaoLocal = useRef(false);
    const operacaoBusca = useRef(0);
    useEffect(() => { ativo.current = true; return () => { ativo.current = false; }; }, []);

    let buscaEhCoordenada = false;
    try { buscaEhCoordenada = Boolean(lerCoordenadas(busca)); } catch { buscaEhCoordenada = true; }
    const unidades = filtrarUnidades(buscaEhCoordenada ? '' : busca, localizacao);
    const selecionada = unidades.find(item => item.id === selecionadaId);
    const pontoAtual = pontoBusca || selecionada;

    async function abrirUrl(url) {
        try { await Linking.openURL(url); }
        catch { if (ativo.current) setErro('Não foi possível abrir o Google Maps. Tente novamente.'); }
    }

    async function copiar(ponto) {
        try {
            const sucesso = await Clipboard.setStringAsync(textoCoordenadas(ponto));
            if (sucesso === false) throw new Error();
            if (ativo.current) { setCopiado(textoCoordenadas(ponto)); setErro(''); setMensagem('Coordenadas copiadas. Cole no Google Maps para conferir o local.'); }
        } catch { if (ativo.current) setErro('Não foi possível copiar. Você também pode selecionar os números acima.'); }
    }

    function selecionar(unidade) {
        Keyboard.dismiss();
        operacaoBusca.current++;
        setBuscandoEndereco(false);
        setSelecionadaId(unidade.id);
        setPontoBusca(null);
        setCopiado('');
        setModo('mapa');
        setErro('');
        setMensagem('');
        setFoco({ tipo: 'ponto', ponto: unidade });
    }

    function alterarBusca(valor) {
        operacaoBusca.current++;
        setBuscandoEndereco(false);
        setBusca(valor);
        setSelecionadaId(null);
        setPontoBusca(null);
        setErro('');
        setMensagem('');
    }

    async function pesquisar() {
        Keyboard.dismiss();
        setErro('');
        if (!busca.trim()) { setFoco({ tipo: 'todos', pontos: catalogo }); return; }
        try {
            const ponto = lerCoordenadas(busca);
            if (ponto) {
                setSelecionadaId(null);
                setPontoBusca({ ...ponto, nome: 'Coordenadas pesquisadas' });
                setModo('mapa');
                setFoco({ tipo: 'ponto', ponto });
            } else if (unidades.length) {
                selecionar(unidades[0]);
            } else {
                setMensagem('Nenhuma UBS deste catálogo corresponde à busca. Você pode pesquisar o endereço abaixo.');
            }
        } catch (error) { setErro(error.message); }
    }

    async function buscarEndereco() {
        if (!busca.trim() || buscandoEndereco) return;
        if (Platform.OS === 'web') return abrirUrl(urlBuscarEndereco(busca));
        const operacao = ++operacaoBusca.current;
        setBuscandoEndereco(true);
        setErro('');
        try {
            const ponto = await buscarEnderecoNativo(busca);
            if (!ativo.current || operacao !== operacaoBusca.current) return;
            setPontoBusca(ponto);
            setSelecionadaId(null);
            setModo('mapa');
            setFoco({ tipo: 'ponto', ponto });
            setMensagem('Endereço localizado. O marcador roxo pode ser arrastado para explorar as coordenadas.');
        } catch (error) {
            if (ativo.current && operacao === operacaoBusca.current) setErro(error.message || 'Não foi possível buscar o endereço.');
        } finally { if (ativo.current && operacao === operacaoBusca.current) setBuscandoEndereco(false); }
    }

    async function localizar() {
        if (operacaoLocal.current) return;
        operacaoLocal.current = true;
        setLocalizando(true);
        setErro('');
        try {
            const ponto = await obterLocalizacao();
            if (!ativo.current) return;
            setLocalizacao(ponto);
            setSelecionadaId(null);
            setPontoBusca(null);
            setFoco({ tipo: 'ponto', ponto });
            setMensagem('Sua posição aparece em azul. A lista está ordenada pelas UBS mais próximas deste catálogo.');
        } catch (error) { if (ativo.current) setErro(error.message); }
        finally { operacaoLocal.current = false; if (ativo.current) setLocalizando(false); }
    }

    function mostrarTodas() {
        alterarBusca('');
        setFoco({ tipo: 'todos', pontos: catalogo });
    }

    return <View style={styles.tela}>
        <View style={styles.cabecalho}>
            <View style={styles.linhaTitulo}>
                <View style={styles.tituloContainer}>
                    <Text style={styles.titulo}>Encontre sua UBS</Text>
                    <Text style={styles.subtitulo}>10 unidades em São Paulo, SP</Text>
                </View>
                <Pressable accessibilityRole="button" accessibilityLabel="Entenda latitude e longitude"
                    accessibilityState={{ expanded: ajuda }} onPress={() => setAjuda(value => !value)} style={styles.ajudaBotao}>
                    <Text style={styles.ajudaInterrogacao}>?</Text>
                </Pressable>
            </View>
            <View style={styles.buscaContainer}>
                <IconeMapa tipo="busca" size={21} color={colors.textMuted} />
                <TextInput accessibilityLabel="Buscar UBS, bairro ou coordenadas" style={styles.input}
                    placeholder="UBS, bairro ou latitude, longitude" placeholderTextColor={colors.textMuted}
                    value={busca} onChangeText={alterarBusca} onSubmitEditing={pesquisar} returnKeyType="search" />
                {busca ? <Pressable accessibilityRole="button" accessibilityLabel="Limpar busca" onPress={mostrarTodas} style={styles.limpar}>
                    <IconeMapa tipo="fechar" size={18} color={colors.textMuted} />
                </Pressable> : null}
                <Pressable accessibilityRole="button" accessibilityLabel="Buscar no mapa" onPress={pesquisar} style={styles.buscarBotao}>
                    <IconeMapa tipo="rota" size={21} color="white" />
                </Pressable>
            </View>
        </View>

        {ajuda && <View style={styles.ajuda}>
            <Text style={styles.ajudaTitulo}>Um ponto, duas coordenadas</Text>
            <Text style={styles.ajudaTexto}>Latitude indica a posição ao norte ou sul do Equador (-90 a 90). Longitude indica a posição a leste ou oeste de Greenwich (-180 a 180).</Text>
            <Text style={styles.ajudaTexto}>Em São Paulo, os dois valores são negativos: sul e oeste. Pesquise usando ponto decimal e vírgula entre os valores, como -23.5569536, -46.6419358.</Text>
        </View>}
        {erro || mensagem ? <View style={[styles.aviso, erro && styles.avisoErro]} accessibilityLiveRegion="polite">
            <Text style={[styles.avisoTexto, erro && styles.erroTexto]}>{erro || mensagem}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Fechar aviso" onPress={() => { setErro(''); setMensagem(''); }}>
                <IconeMapa tipo="fechar" size={17} color={erro ? colors.danger : colors.primary} />
            </Pressable>
        </View> : null}

        {modo === 'mapa' ? <View style={styles.areaMapa}>
            <MapaUBS unidades={unidades} selecionadaId={selecionadaId} onSelecionar={selecionar}
                localizacao={localizacao} pontoBusca={pontoBusca} foco={foco}
                onMoverPonto={ponto => { setPontoBusca({ ...ponto, nome: 'Ponto ajustado no mapa' }); setCopiado(''); }} />
            <View style={styles.legenda} pointerEvents="none">
                <View style={styles.pontoLegenda} /><Text style={styles.legendaTexto}>{unidades.length} UBS no mapa</Text>
                {localizacao && <><View style={[styles.pontoLegenda, styles.pontoAzul]} /><Text style={styles.legendaTexto}>Você</Text></>}
            </View>
            <View style={styles.controles}>
                <Pressable accessibilityRole="button" accessibilityLabel="Mostrar as 10 UBS" onPress={mostrarTodas} style={styles.controle}>
                    <IconeMapa tipo="mapa" />
                </Pressable>
                <Pressable accessibilityRole="button" accessibilityLabel="Usar minha localização" disabled={localizando}
                    onPress={localizar} style={styles.controle}>
                    {localizando ? <ActivityIndicator color={colors.primary} /> : <IconeMapa tipo="localizacao" />}
                </Pressable>
            </View>
            {!unidades.length && !pontoBusca && <View style={styles.vazioMapa}>
                <Text style={styles.vazioTitulo}>Nenhuma UBS encontrada</Text>
                <Text style={styles.vazioTexto}>Tente outro nome ou bairro deste catálogo.</Text>
                <Acao titulo={buscandoEndereco ? 'Buscando endereço...' : Platform.OS === 'web' ? 'Pesquisar no Google Maps' : 'Buscar endereço no mapa'}
                    onPress={buscarEndereco} disabled={buscandoEndereco} />
            </View>}
        </View> : <FlatList data={unidades} keyExtractor={item => item.id} contentContainerStyle={styles.lista}
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={<View style={styles.listaCabecalho}>
                <Text style={styles.listaTitulo}>{unidades.length} unidades encontradas</Text>
                <Text style={styles.listaSubtitulo}>{localizacao ? 'Mais próximas deste catálogo · distância em linha reta' : 'Selecione uma unidade para ver no mapa'}</Text>
                {!localizacao && <Acao titulo={localizando ? 'Obtendo posição...' : 'Usar minha localização'} icone="localizacao" onPress={localizar} disabled={localizando} />}
            </View>}
            ListEmptyComponent={<View style={styles.vazioLista}>
                <Text style={styles.vazioTitulo}>Nenhuma UBS encontrada</Text>
                <Text style={styles.vazioTexto}>Tente outro nome ou bairro.</Text>
                <Acao titulo={buscandoEndereco ? 'Buscando...' : 'Pesquisar endereço'} onPress={buscarEndereco} disabled={buscandoEndereco} />
            </View>}
            renderItem={({ item }) => <Pressable accessibilityRole="button" accessibilityLabel={`${item.nome}, ${item.bairro}. Ver no mapa`}
                onPress={() => selecionar(item)} style={({ pressed }) => [styles.cardLista, pressed && styles.pressionado]}>
                <View style={styles.linhaCard}>
                    <View style={styles.numeroUnidade}><Text style={styles.numeroTexto}>{item.numero}</Text></View>
                    <View style={styles.cardNomeContainer}>
                        <Text style={styles.cardNome}>{item.nome}</Text>
                        <Text style={styles.cardBairro}>{item.bairro}</Text>
                    </View>
                    {item.distancia !== null && <Text style={styles.distancia}>{item.distancia.toFixed(1).replace('.', ',')} km</Text>}
                </View>
                <Text style={styles.enderecoLista}>{item.endereco}</Text>
                <Coordenadas ponto={item} />
                <Text style={styles.verMapa}>Ver unidade no mapa ↗</Text>
            </Pressable>} />}

        {modo === 'mapa' && pontoAtual && <View style={styles.detalhes}>
            <ScrollView style={styles.detalhesScroll} contentContainerStyle={styles.detalhesConteudo}>
                <View style={styles.linhaDetalhes}>
                    <View style={styles.detalhesTituloContainer}>
                        <Text style={styles.etiqueta}>{selecionada ? 'UNIDADE BÁSICA DE SAÚDE' : 'EXPLORAR COORDENADAS'}</Text>
                        <Text style={styles.nomeDetalhes}>{pontoAtual.nome}</Text>
                    </View>
                    <Pressable accessibilityRole="button" accessibilityLabel="Fechar detalhes" style={styles.limpar}
                        onPress={() => { setSelecionadaId(null); setPontoBusca(null); }}><IconeMapa tipo="fechar" size={20} color={colors.textMuted} /></Pressable>
                </View>
                {selecionada && <Text style={styles.enderecoDetalhes}>{selecionada.endereco}</Text>}
                {selecionada?.distancia !== null && selecionada?.distancia !== undefined && <Text style={styles.distanciaDetalhes}>{selecionada.distancia.toFixed(1).replace('.', ',')} km de você em linha reta</Text>}
                <Coordenadas ponto={pontoAtual} />
                <View style={styles.acoesDetalhes}>
                    <Acao titulo="Google Maps" icone="mapa" onPress={() => abrirUrl(urlGoogleMaps(pontoAtual))} />
                    <Acao titulo="Traçar rota" icone="rota" principal onPress={() => abrirUrl(urlGoogleMaps(pontoAtual, { rota: true }))} />
                </View>
                <View style={styles.acoesTexto}>
                    <Pressable accessibilityRole="button" onPress={() => copiar(pontoAtual)} style={styles.linkAcao}>
                        <IconeMapa tipo="copiar" size={15} />
                        <Text style={styles.linkTexto}>{copiado === textoCoordenadas(pontoAtual) ? 'Copiado!' : 'Copiar coordenadas'}</Text>
                    </Pressable>
                    <Pressable accessibilityRole="button" accessibilityLabel="Conferir somente as coordenadas no Google Maps"
                        onPress={() => abrirUrl(urlGoogleMaps(pontoAtual, { somenteCoordenadas: true }))} style={styles.linkAcao}>
                        <Text style={styles.linkTexto}>Conferir ponto ↗</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </View>}

        <View style={[styles.rodape, { paddingBottom: Math.max(insets.bottom, 10) }]}>
            {['mapa', 'lista'].map(item => <Pressable key={item} accessibilityRole="tab" accessibilityState={{ selected: modo === item }}
                onPress={() => { setModo(item); Keyboard.dismiss(); }} style={[styles.aba, modo === item && styles.abaAtiva]}>
                <IconeMapa tipo={item} size={21} color={modo === item ? colors.primary : colors.textMuted} />
                <Text style={[styles.abaTexto, modo === item && styles.abaTextoAtiva]}>{item === 'mapa' ? 'Mapa' : 'Lista de UBS'}</Text>
            </Pressable>)}
        </View>
    </View>;
}
