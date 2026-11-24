import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import './leaflet-base.css';
import './mapa.css';
import { catalogo } from '../../services/unidadesSaude';

const coordenadas = ponto => [ponto.latitude, ponto.longitude];

export default function MapaUBS({ unidades, selecionadaId, onSelecionar, localizacao, pontoBusca, onMoverPonto, foco }) {
    const container = useRef(null);
    const mapa = useRef(null);
    const leaflet = useRef(null);
    const camada = useRef(null);
    const onSelecionarRef = useRef(onSelecionar);
    const onMoverRef = useRef(onMoverPonto);
    const [pronto, setPronto] = useState(false);
    const [erro, setErro] = useState('');
    const [tentativa, setTentativa] = useState(0);
    onSelecionarRef.current = onSelecionar;
    onMoverRef.current = onMoverPonto;

    useEffect(() => {
        let ativo = true;
        let observer;
        import('leaflet').then(modulo => {
            if (!ativo || !container.current) return;
            const L = modulo.default || modulo;
            leaflet.current = L;
            const instancia = L.map(container.current, { zoomControl: false, scrollWheelZoom: true })
                .setView([-23.553, -46.651], 12);
            mapa.current = instancia;
            L.control.zoom({ position: 'topright' }).addTo(instancia);
            const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',
            }).addTo(instancia);
            let falhas = 0;
            tiles.on('tileerror', () => {
                if (++falhas >= 3 && ativo) setErro('Não foi possível carregar o mapa. A lista de UBS continua disponível.');
            });
            tiles.on('tileload', () => { falhas = 0; if (ativo) setErro(''); });
            camada.current = L.layerGroup().addTo(instancia);
            observer = new ResizeObserver(() => instancia.invalidateSize());
            observer.observe(container.current);
            setPronto(true);
        }).catch(() => { if (ativo) setErro('Não foi possível abrir o mapa. Consulte as UBS pela lista.'); });
        return () => {
            ativo = false;
            observer?.disconnect();
            mapa.current?.remove();
            mapa.current = null;
            camada.current = null;
        };
    }, [tentativa]);

    useEffect(() => {
        if (!pronto || !camada.current) return;
        const L = leaflet.current;
        camada.current.clearLayers();
        unidades.forEach(unidade => {
            const selecionada = unidade.id === selecionadaId;
            const icon = L.divIcon({ className: 'ubs-marker-wrapper',
                html: `<span class="ubs-pin ${selecionada ? 'ubs-pin-selected' : ''}"><span>${unidade.numero}</span></span>`,
                iconSize: [36, 44], iconAnchor: [18, 42], tooltipAnchor: [0, -36] });
            const titulo = document.createElement('span');
            titulo.textContent = unidade.nome;
            L.marker(coordenadas(unidade), { icon, title: unidade.nome, alt: unidade.nome, zIndexOffset: selecionada ? 1000 : 0 })
                .bindTooltip(titulo).on('click', () => onSelecionarRef.current(unidade)).addTo(camada.current);
        });
        if (localizacao) {
            L.circle(coordenadas(localizacao), { radius: Math.min(localizacao.precisao || 0, 5000),
                color: '#2563EB', weight: 1, fillOpacity: 0.08 }).addTo(camada.current);
            L.circleMarker(coordenadas(localizacao), { radius: 8, color: 'white', weight: 3,
                fillColor: '#2563EB', fillOpacity: 1 }).bindTooltip('Sua localização').addTo(camada.current);
        }
        if (pontoBusca) {
            const icon = L.divIcon({ className: 'ubs-marker-wrapper', html: '<span class="ubs-pin ubs-pin-search"><span>+</span></span>',
                iconSize: [36, 44], iconAnchor: [18, 42] });
            L.marker(coordenadas(pontoBusca), { icon, draggable: true, title: 'Coordenadas pesquisadas' })
                .on('dragend', event => {
                    const ponto = event.target.getLatLng();
                    onMoverRef.current({ latitude: ponto.lat, longitude: ponto.lng });
                }).addTo(camada.current);
        }
    }, [unidades, selecionadaId, localizacao, pontoBusca, pronto, tentativa]);

    useEffect(() => {
        if (!pronto || !mapa.current || !foco) return;
        if (foco.tipo === 'todos') {
            const pontos = foco.pontos?.length ? foco.pontos : catalogo;
            mapa.current.fitBounds(pontos.map(coordenadas), { padding: [45, 50], maxZoom: 15 });
        } else if (foco.ponto) mapa.current.setView(coordenadas(foco.ponto), 15, { animate: true });
    }, [foco, pronto, tentativa]);

    return <View style={StyleSheet.absoluteFill}>
        <div ref={container} className="ubs-map" role="region" aria-label="Mapa das unidades básicas de saúde de São Paulo" />
        {erro ? <View style={styles.erro} accessibilityLiveRegion="polite">
            <Text style={styles.texto}>{erro}</Text>
            <Pressable accessibilityRole="button" onPress={() => { setPronto(false); setErro(''); setTentativa(value => value + 1); }}>
                <Text style={styles.tentar}>Recarregar mapa</Text>
            </Pressable>
        </View> : null}
    </View>;
}

const styles = StyleSheet.create({
    erro: { position: 'absolute', top: 12, left: 12, right: 60, padding: 12, borderRadius: 12, backgroundColor: 'white', zIndex: 1000 },
    texto: { color: '#475569', fontSize: 13 }, tentar: { color: '#0B7F8B', fontWeight: '700', marginTop: 8 },
});
