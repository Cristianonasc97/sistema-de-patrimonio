
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Usuario, ContextoAutenticacaoTipo } from '../tipos';
import * as api from '../servicos/bancoDados';

const ContextoAutenticacao = createContext<ContextoAutenticacaoTipo | undefined>(undefined);

export const ProvedorAutenticacao: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [carregando, setCarregando] = useState<boolean>(false);
    const [verificandoSessao, setVerificandoSessao] = useState<boolean>(true);
    const [erro, setErro] = useState<string | null>(null);

    // Efeito para verificar se já existe usuário logado (persistência)
    useEffect(() => {
        const carregarSessao = async () => {
            const idSalvo = localStorage.getItem('usuario_logado_id');
            if (idSalvo) {
                try {
                    const usuarioRecuperado = await api.getUsuarioPorId(idSalvo);
                    if (usuarioRecuperado) {
                        setUsuario(usuarioRecuperado);
                    } else {
                        // Se o ID existe mas o usuário não (ex: banco limpo), remove o lixo
                        localStorage.removeItem('usuario_logado_id');
                    }
                } catch (e) {
                    console.error("Erro ao restaurar sessão:", e);
                    localStorage.removeItem('usuario_logado_id');
                }
            }
            setVerificandoSessao(false);
        };

        carregarSessao();
    }, []);

    const login = async (email: string, pass: string) => {
        setCarregando(true);
        setErro(null);
        try {
            const usuarioLogado = await api.login(email, pass);
            setUsuario(usuarioLogado);
            localStorage.setItem('usuario_logado_id', usuarioLogado.id);
        } catch (err: any) {
            setErro(err.message);
            throw err;
        } finally {
            setCarregando(false);
        }
    };

    const logout = () => {
        api.logout();
        setUsuario(null);
        localStorage.removeItem('usuario_logado_id');
    };

    const atualizarDadosLocais = (dados: Partial<Usuario>) => {
        if (usuario) {
            setUsuario({ ...usuario, ...dados });
        }
    };

    return (
        <ContextoAutenticacao.Provider value={{ usuario, login, logout, atualizarDadosLocais, carregando, verificandoSessao, erro }}>
            {children}
        </ContextoAutenticacao.Provider>
    );
};

export const useAutenticacao = (): ContextoAutenticacaoTipo => {
    const contexto = useContext(ContextoAutenticacao);
    if (contexto === undefined) {
        throw new Error('useAutenticacao deve ser usado dentro de um ProvedorAutenticacao');
    }
    return contexto;
};
