
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Usuario, ContextoAutenticacaoTipo } from '../tipos';
import * as authService from '../services/authService';

const ContextoAutenticacao = createContext<ContextoAutenticacaoTipo | undefined>(undefined);

export const ProvedorAutenticacao: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [carregando, setCarregando] = useState<boolean>(false);
    const [verificandoSessao, setVerificandoSessao] = useState<boolean>(true);
    const [erro, setErro] = useState<string | null>(null);

    // Effect to restore session from JWT token
    useEffect(() => {
        const carregarSessao = async () => {
            const token = localStorage.getItem('auth_token');
            if (token) {
                try {
                    // Call /api/auth/me to restore user session
                    const usuarioRecuperado = await authService.getMe();
                    setUsuario(usuarioRecuperado);
                } catch (e) {
                    console.error("Erro ao restaurar sessão:", e);
                    // Token is invalid or expired, clear it
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('usuario_logado_id'); // Remove old key if exists
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
            const { user, token } = await authService.login(email, pass);
            setUsuario(user);
            // Token is already stored by authService
        } catch (err: any) {
            setErro(err.message);
            throw err;
        } finally {
            setCarregando(false);
        }
    };

    const logout = () => {
        authService.logout(); // Clears token from localStorage
        setUsuario(null);
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
