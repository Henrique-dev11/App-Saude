import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import * as auth from '../services/autenticacao';

const Context = createContext(null);

export function AutenticacaoProvider({ children }) {
    const [usuario, setUsuario] = useState(null);
    const [iniciando, setIniciando] = useState(true);
    const [erroInicial, setErroInicial] = useState('');
    const [destino, setDestino] = useState('Home');
    const revisao = useRef(0);

    async function restaurar() {
        const atual = ++revisao.current;
        setIniciando(true);
        setErroInicial('');
        try {
            const restaurado = await auth.restaurarSessao();
            if (atual === revisao.current) setUsuario(restaurado);
        }
        catch (error) { if (atual === revisao.current) setErroInicial(error.message); }
        finally { if (atual === revisao.current) setIniciando(false); }
    }
    useEffect(() => { restaurar(); }, []);
    useEffect(() => {
        const subscription = AppState.addEventListener('change', async state => {
            if (state !== 'active' || !usuario) return;
            const atual = revisao.current;
            try {
                const restaurado = await auth.restaurarSessao();
                if (atual === revisao.current) setUsuario(restaurado);
            }
            catch { /* Uma falha de rede não apaga a sessão ou os dados já carregados. */ }
        });
        return () => subscription.remove();
    }, [usuario?.id]);

    async function executar(acao) {
        const atual = ++revisao.current;
        try {
            const resultado = await acao();
            if (atual !== revisao.current) throw new Error('A sessão mudou durante a solicitação. Tente novamente.');
            // Invalida também consultas de sessão iniciadas enquanto a gravação estava em curso.
            revisao.current++;
            return resultado;
        }
        catch (error) {
            if (['UNAUTHENTICATED', 'SESSION_STORAGE'].includes(error.code) && atual === revisao.current) {
                revisao.current++;
                try { await auth.limparSessaoLocal(); } catch { /* O servidor já recusará a credencial inválida. */ }
                setUsuario(null);
            }
            throw error;
        }
    }

    const value = {
        usuario, iniciando, erroInicial, destino, restaurar,
        async cadastrar(data) {
            const novo = await executar(() => auth.cadastrarUsuario(data));
            setDestino('Perfil');
            setUsuario(novo);
        },
        async entrar(data) {
            const atual = await executar(() => auth.entrarUsuario(data));
            setDestino('Home');
            setUsuario(atual);
        },
        async salvarPerfil(data) {
            const atualizado = await executar(() => auth.atualizarUsuario(data));
            setUsuario(atualizado);
        },
        async alterarSenha(data) {
            const atualizado = await executar(() => auth.alterarSenhaUsuario(data));
            setUsuario(atualizado);
        },
        async sair() {
            await executar(() => auth.sairUsuario());
            setUsuario(null);
        },
        async recarregarPerfil() {
            const atualizado = await executar(() => auth.restaurarSessao());
            setUsuario(atualizado);
        },
    };
    return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useAutenticacao() { return useContext(Context); }
