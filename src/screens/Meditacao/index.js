import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, Linking } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import Botao from '../../components/Botao';
import { musicasMeditacao } from '../../data/musicasMeditacao';
import { criarTemporizadorMeditacao } from '../../services/temporizadorMeditacao';
import styles from './style';

export default function Meditacao() {
  const [selecionada, setSelecionada] = useState(musicasMeditacao[0]);
  const player = useAudioPlayer(musicasMeditacao[0].fonte);
  const audio = useAudioPlayerStatus(player);
  const timer = useRef(null);
  if (!timer.current) timer.current = criarTemporizadorMeditacao();
  const [estado, setEstado] = useState({ segundos: 600, ativo: false });
  const [sessoes, setSessoes] = useState([]);
  const [concluida, setConcluida] = useState(false);
  const [erro, setErro] = useState('');
  const [volume, setVolume] = useState(0.5);
  const { segundos, ativo } = estado;

  const atualizar = useCallback(novo => {
    setEstado(novo);
    if (novo.concluiu) {
      player.pause();
      setConcluida(true);
      setSessoes(lista => [...lista, { data: Date.now(), minutos: 10 }]);
    }
  }, [player]);

  useEffect(() => { player.loop = true; player.volume = volume; }, [player, volume, selecionada.id]);
  useEffect(() => {
    if (!ativo) return;
    const intervalo = setInterval(() => atualizar(timer.current.consultar()), 250);
    return () => clearInterval(intervalo);
  }, [ativo, atualizar]);
  useFocusEffect(useCallback(() => () => {
    player.pause();
    atualizar(timer.current.pausar());
  }, [player, atualizar]));
  useEffect(() => {
    if (!audio.error) return;
    player.pause(); atualizar(timer.current.pausar());
    setErro('Não foi possível reproduzir esta música. Selecione outra faixa e tente novamente.');
  }, [audio.error, player, atualizar]);

  function alternar() {
    if (ativo) {
      player.pause(); atualizar(timer.current.pausar());
      return;
    }
    try {
      setErro(''); setConcluida(false);
      player.play();
      atualizar(timer.current.iniciar());
    } catch {
      setErro('Não foi possível iniciar a música. Tente novamente.');
    }
  }
  function selecionar(musica) {
    if (musica.id === selecionada.id) return;
    player.pause(); atualizar(timer.current.pausar());
    setErro('');
    try { player.replace(musica.fonte); setSelecionada(musica); }
    catch { setErro('Não foi possível carregar esta música. Tente outra faixa.'); }
  }
  function reiniciar() {
    player.pause();
    atualizar(timer.current.reiniciar());
    setConcluida(false); setErro('');
    player.seekTo(0).catch(() => setErro('O tempo foi reiniciado. Selecione outra faixa se o áudio não recomeçar.'));
  }
  function abrirLink(url) {
    Linking.openURL(url).catch(() => setErro('Não foi possível abrir os créditos neste dispositivo.'));
  }
  const inicioSemana = new Date();
  inicioSemana.setHours(0, 0, 0, 0);
  inicioSemana.setDate(inicioSemana.getDate() - (inicioSemana.getDay() + 6) % 7);
  const minutosSemana = sessoes.filter(s => s.data >= inicioSemana.getTime()).reduce((total, s) => total + s.minutos, 0);

  return <ScrollView style={styles.fundo} contentContainerStyle={styles.container}>
    <View style={styles.card}>
      <Text style={styles.title} accessibilityRole="header">Meditação</Text>
      <Text style={styles.label}>10 min · Foco e calma</Text>
      <Text style={styles.legenda}>Escolha uma música e reserve um momento para você.</Text>
      <View style={styles.temporizador}>
        <Text style={styles.relogio} accessibilityLabel={`${Math.floor(segundos / 60)} minutos e ${segundos % 60} segundos restantes`}>{String(Math.floor(segundos / 60)).padStart(2, '0')}:{String(segundos % 60).padStart(2, '0')}</Text>
        <Text style={styles.texto}>{ativo ? 'Inspire. Expire. Permita-se desacelerar.' : 'Relaxe os ombros e encontre uma posição confortável.'}</Text>
      </View>
      <View style={styles.progresso} accessibilityRole="progressbar" accessibilityLabel="Progresso da meditação" accessibilityValue={{ min: 0, max: 600, now: 600 - segundos }}><View style={[styles.progressoPreenchido, { width: `${(600 - segundos) / 6}%` }]} /></View>
      <Text style={styles.tocando} accessibilityLiveRegion="polite">{audio.playing ? 'Tocando' : 'Selecionada'}: {selecionada.titulo}</Text>
      <Botao titulo={ativo ? 'Ⅱ Pausar sessão' : '▶ Iniciar sessão'} onPress={alternar} disabled={!audio.isLoaded || Boolean(audio.error)} />
      {!audio.isLoaded && !audio.error && <Text style={styles.legenda} accessibilityLiveRegion="polite">Carregando música...</Text>}
      <Pressable accessibilityRole="button" onPress={reiniciar} style={({ pressed }) => [styles.botaoReiniciar, pressed && styles.pressionado]}><Text style={styles.textoReiniciar}>↺ Reiniciar tempo</Text></Pressable>
      <Text style={styles.legenda}>Volta para 10:00 e pausa a música.</Text>
      {concluida && <Text style={styles.tag} accessibilityLiveRegion="polite">Sessão concluída. Mais 10 minutos de cuidado!</Text>}
      {erro ? <Text style={styles.erro} accessibilityRole="alert">{erro}</Text> : null}

      <View style={styles.secao}>
        <Text style={styles.label} accessibilityRole="header">Músicas para meditar</Text>
        <Text style={styles.legenda}>A faixa se repete durante a sessão. Trocar de música pausa o tempo.</Text>
        {musicasMeditacao.map((musica, i) => <Pressable key={musica.id} accessibilityRole="radio" accessibilityState={{ checked: selecionada.id === musica.id }} accessibilityLabel={`${musica.titulo}, ${musica.descricao}`} onPress={() => selecionar(musica)} style={({ pressed }) => [styles.faixa, selecionada.id === musica.id && styles.faixaSelecionada, pressed && styles.pressionado]}>
          <Text style={styles.numero}>{String(i + 1).padStart(2, '0')}</Text>
          <View style={styles.dadosFaixa}><Text style={styles.tituloFaixa}>{musica.titulo}</Text><Text style={styles.descricaoFaixa}>{musica.descricao}</Text></View>
          <Text style={styles.marcador}>{selecionada.id === musica.id ? '●' : '○'}</Text>
        </Pressable>)}
      </View>
      <View style={styles.volume}>
        <Text style={styles.label}>Volume · {Math.round(volume * 100)}%</Text>
        <View style={styles.controlesVolume}>
          <Pressable accessibilityRole="button" accessibilityLabel="Diminuir volume" disabled={volume === 0} onPress={() => setVolume(v => Math.max(0, Math.round((v - 0.1) * 10) / 10))} style={[styles.botaoVolume, volume === 0 && styles.desabilitado]}><Text style={styles.texto}>−</Text></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Aumentar volume" disabled={volume === 1} onPress={() => setVolume(v => Math.min(1, Math.round((v + 0.1) * 10) / 10))} style={[styles.botaoVolume, volume === 1 && styles.desabilitado]}><Text style={styles.texto}>＋</Text></Pressable>
        </View>
      </View>
      <View style={styles.secao}><Text style={styles.label}>Minutos meditados nesta semana</Text><Text style={styles.valor}>{minutosSemana} <Text style={styles.unidade}>min</Text></Text></View>
      <Text style={styles.aviso}>Contabilizamos sessões completas. Os registros ficam disponíveis enquanto esta tela estiver aberta.</Text>
      <View style={styles.creditos}>
        <Text style={styles.legenda}>Músicas de Kevin MacLeod (incompetech.com): {musicasMeditacao.map(m => m.original).join(', ')}. Títulos de exibição traduzidos; áudio convertido para MP3 de 96 kbps.</Text>
        <Pressable accessibilityRole="link" onPress={() => abrirLink('https://incompetech.com/music/royalty-free/')} style={styles.link}><Text style={styles.textoLink}>Conhecer o autor</Text></Pressable>
        <Pressable accessibilityRole="link" onPress={() => abrirLink('https://creativecommons.org/licenses/by/4.0/')} style={styles.link}><Text style={styles.textoLink}>Licença Creative Commons BY 4.0</Text></Pressable>
      </View>
    </View>
  </ScrollView>;
}
