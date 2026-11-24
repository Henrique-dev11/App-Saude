import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { catalogo } from '../../services/unidadesSaude';

const regiaoInicial = { latitude: -23.559, longitude: -46.651, latitudeDelta: 0.105, longitudeDelta: 0.12 };

export default function MapaUBS({ unidades, selecionadaId, onSelecionar, localizacao, pontoBusca, onMoverPonto, foco }) {
    const mapa = useRef(null);
    const [pronto, setPronto] = useState(false);
    useEffect(() => {
        if (!pronto || !foco) return;
        if (foco.tipo === 'todos') {
            const pontos = foco.pontos?.length ? foco.pontos : catalogo;
            mapa.current?.fitToCoordinates(pontos, { edgePadding: { top: 75, right: 50, bottom: 75, left: 50 }, animated: true });
        } else if (foco.ponto) {
            mapa.current?.animateToRegion({ ...foco.ponto, latitudeDelta: 0.013, longitudeDelta: 0.013 }, 450);
        }
    }, [foco, pronto]);

    return <MapView ref={mapa} style={StyleSheet.absoluteFill} initialRegion={regiaoInicial}
        onMapReady={() => setPronto(true)} showsUserLocation={Boolean(localizacao)}
        showsMyLocationButton={false} showsCompass toolbarEnabled={false}>
        {unidades.map(unidade => <Marker key={unidade.id} identifier={unidade.id} coordinate={unidade}
            title={unidade.nome} description={unidade.endereco}
            pinColor={unidade.id === selecionadaId ? '#DC2626' : '#0B7F8B'}
            zIndex={unidade.id === selecionadaId ? 10 : 1}
            onPress={() => onSelecionar(unidade)} />)}
        {localizacao && <Circle center={localizacao} radius={Math.min(localizacao.precisao || 0, 5000)}
            fillColor="rgba(37,99,235,0.1)" strokeColor="rgba(37,99,235,0.35)" />}
        {pontoBusca && <Marker coordinate={pontoBusca} title={pontoBusca.nome || 'Coordenadas pesquisadas'}
            pinColor="#7C3AED" draggable onDragEnd={event => onMoverPonto(event.nativeEvent.coordinate)} />}
    </MapView>;
}
