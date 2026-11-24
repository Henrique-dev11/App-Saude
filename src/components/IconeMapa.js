import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export default function IconeMapa({ tipo = 'pin', size = 24, color = '#0B7F8B' }) {
    const paths = {
        busca: <><Circle cx="10.5" cy="10.5" r="6.5" /><Path d="m16 16 5 5" /></>,
        pin: <><Path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" /><Circle cx="12" cy="10" r="2.5" /></>,
        mapa: <><Path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2V5Zm6-2v16m6-14v16" /></>,
        localizacao: <><Circle cx="12" cy="12" r="7" /><Circle cx="12" cy="12" r="2" /><Path d="M12 2v3m0 14v3M2 12h3m14 0h3" /></>,
        lista: <><Path d="M9 6h12M9 12h12M9 18h12M3 6h1M3 12h1M3 18h1" /></>,
        copiar: <><Rect x="8" y="8" width="12" height="13" rx="2" /><Path d="M15 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3" /></>,
        rota: <><Path d="m12 2 10 10-10 10L2 12 12 2Z" /><Path d="M8 16v-5h8m-3-3 3 3-3 3" /></>,
        fechar: <Path d="m6 6 12 12M6 18 18 6" />,
        voltar: <Path d="m15 5-7 7 7 7" />,
    };
    return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        {paths[tipo] || paths.pin}
    </Svg>;
}
