import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useAutenticacao } from '../contexts/Autenticacao';
import { listarMedicoes, salvarMedicao } from '../services/autenticacao';
import { ordenarMedicoes } from '../services/dadosMedicoes';

export default function useMedicoes(tipo) {
    const { usuario } = useAutenticacao();
    const [registros, setRegistros] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erroHistorico, setErroHistorico] = useState('');
    const revisao = useRef(0);
    const gravando = useRef(false);
    const foco = useRef(false);
    const proprietario = useRef(usuario?.id);
    const carregar = useCallback(async () => {
        const atual = ++revisao.current;
        if (proprietario.current !== usuario?.id) {
            proprietario.current = usuario?.id;
            setRegistros([]);
        }
        setCarregando(true); setErroHistorico('');
        try {
            const lista = await listarMedicoes(tipo);
            if (atual === revisao.current) setRegistros(ordenarMedicoes(lista));
        } catch (error) {
            if (atual === revisao.current) setErroHistorico(error.message);
        } finally { if (atual === revisao.current) setCarregando(false); }
    }, [tipo, usuario?.id]);
    useFocusEffect(useCallback(() => {
        foco.current = true;
        carregar();
        return () => { foco.current = false; revisao.current++; };
    }, [carregar]));
    async function salvar(data) {
        if (gravando.current) throw new Error('Aguarde o registro ser salvo.');
        gravando.current = true; setSalvando(true);
        const dono = usuario?.id;
        ++revisao.current;
        try {
            const medicao = await salvarMedicao({ ...data, tipo });
            if (foco.current && proprietario.current === dono) {
                ++revisao.current;
                setRegistros(lista => ordenarMedicoes([...lista.filter(r => r.id !== medicao.id), medicao]));
                setCarregando(false);
            }
        } finally { gravando.current = false; setSalvando(false); }
    }
    return { registros, carregando, salvando, erroHistorico, carregar, salvar };
}
