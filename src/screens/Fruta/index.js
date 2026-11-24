import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Button, AppState, Platform } from 'react-native';
import styles from './style';
import InputCampo from '../../components/InputCampo';
import CardFruta from '../../components/CardFruta';
import DetalhesFruta from '../../components/DetalhesFruta';
import { carregarFrutas } from '../../services/frutas';
import { filtrarFrutasPorNome, normalizarNome } from '../../services/nomesFrutas';

export default function Fruta() {
    const [frutas, setFrutas] = useState([]);
    const [busca, setBusca] = useState('');
    const [aviso, setAviso] = useState('');
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(true);
    const [tentativa, setTentativa] = useState(0);
    const [selecionadaId, setSelecionadaId] = useState(null);
    const [offline, setOffline] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        setCarregando(true);
        setErro('');
        setAviso('');
        carregarFrutas(controller.signal, { forcarAtualizacao: tentativa > 0 })
            .then(result => {
                if (controller.signal.aborted) return;
                setFrutas(result.frutas);
                setAviso(result.aviso);
                setOffline(result.offline);
            })
            .catch(error => {
                if (controller.signal.aborted) return;
                setFrutas([]);
                setSelecionadaId(null);
                setErro(error.message || 'Não foi possível carregar as frutas.');
            })
            .finally(() => {
                if (!controller.signal.aborted) setCarregando(false);
            });
        return () => controller.abort();
    }, [tentativa]);

    const precisaAtualizar = Boolean(aviso || erro);
    useEffect(() => {
        if (!precisaAtualizar || carregando) return;
        // Recupera também a conexão do servidor com o provedor, sem depender de um clique.
        const timer = setTimeout(() => {
            if (AppState.currentState !== 'background') setTentativa(value => value + 1);
        }, 15000);
        return () => clearTimeout(timer);
    }, [precisaAtualizar, carregando]);

    useEffect(() => {
        const tentarNovamente = () => setTentativa(value => value + 1);
        const subscription = AppState.addEventListener('change', state => {
            if (state === 'active') tentarNovamente();
        });
        if (Platform.OS === 'web') window.addEventListener('online', tentarNovamente);
        return () => {
            subscription.remove();
            if (Platform.OS === 'web') window.removeEventListener('online', tentarNovamente);
        };
    }, []);

    const frutasFiltradas = filtrarFrutasPorNome(frutas, busca);
    const selecionada = frutas.find(fruta => fruta.id === selecionadaId);

    return (
        <ScrollView style={styles.fundo} contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled">
            <View style={styles.conteudo}>
                <Text style={styles.titulo}>Frutas</Text>
                <InputCampo placeholder="Buscar fruta (ex.: maçã, banana)" keyboardType="default"
                    value={busca} onChangeText={value => { setBusca(value); setSelecionadaId(null); }} />
                {carregando ? (
                    <View accessibilityLiveRegion="polite">
                        <ActivityIndicator size="large" />
                        <Text style={styles.subtitulo}>Carregando frutas...</Text>
                    </View>
                ) : (
                    <>
                        {aviso ? <Text style={styles.subtitulo} accessibilityLiveRegion="polite">{aviso}</Text> : null}
                        {erro ? <Text style={styles.erro} accessibilityRole="alert">{erro}</Text> : null}
                        {aviso || erro ? <Button title="Tentar novamente"
                            onPress={() => setTentativa(value => value + 1)} /> : null}
                        {!erro && frutasFiltradas.length === 0
                            ? <Text style={styles.subtitulo}>Nenhuma fruta encontrada.</Text> : null}
                        {selecionada ? <DetalhesFruta fruta={selecionada} offline={offline}
                            onVoltar={() => setSelecionadaId(null)} />
                            : frutasFiltradas.map(fruta => <CardFruta key={normalizarNome(fruta.nomePtBr)}
                                nome={fruta.nomePtBr} onPress={() => setSelecionadaId(fruta.id)} />)}
                    </>
                )}
            </View>
        </ScrollView>
    );
}
