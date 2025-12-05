
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { ReferenceDataContextType, Categoria, Localizacao, TipoMovimentacao, PerfilType, Usuario } from '../tipos';
import * as referenceService from '../services/referenceService';

const ReferenceDataContext = createContext<ReferenceDataContextType | undefined>(undefined);

interface ReferenceDataProviderProps {
    children: ReactNode;
    usuario: Usuario | null;
}

export const ReferenceDataProvider: React.FC<ReferenceDataProviderProps> = ({ children, usuario }) => {
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [localizacoes, setLocalizacoes] = useState<Localizacao[]>([]);
    const [tiposMovimentacao, setTiposMovimentacao] = useState<TipoMovimentacao[]>([]);
    const [perfis, setPerfis] = useState<PerfilType[]>([]);
    const [carregando, setCarregando] = useState<boolean>(true);
    const [erro, setErro] = useState<string | null>(null);

    const carregarTodosDados = async () => {
        setCarregando(true);
        setErro(null);

        try {
            // Load all reference data in parallel
            const [categoriasData, localizacoesData, tiposData, perfisData] = await Promise.all([
                referenceService.getCategorias(),
                referenceService.getLocalizacoes(),
                referenceService.getTiposMovimentacao(),
                referenceService.getPerfis(),
            ]);

            setCategorias(categoriasData.filter(c => c.ativo));
            setLocalizacoes(localizacoesData.filter(l => l.ativo));
            setTiposMovimentacao(tiposData.filter(t => t.ativo));
            setPerfis(perfisData.filter(p => p.ativo));
        } catch (e: any) {
            console.error('Erro ao carregar dados de referência:', e);
            setErro(e.message || 'Erro ao carregar dados do sistema');
        } finally {
            setCarregando(false);
        }
    };

    // Load reference data only when user is authenticated
    useEffect(() => {
        if (usuario) {
            // User just logged in, load reference data
            carregarTodosDados();
        } else {
            // User logged out, clear reference data
            setCategorias([]);
            setLocalizacoes([]);
            setTiposMovimentacao([]);
            setPerfis([]);
            setCarregando(false);
            setErro(null);
        }
    }, [usuario]); // Re-run when usuario changes

    const recarregar = async () => {
        await carregarTodosDados();
    };

    return (
        <ReferenceDataContext.Provider
            value={{
                categorias,
                localizacoes,
                tiposMovimentacao,
                perfis,
                carregando,
                erro,
                recarregar,
            }}
        >
            {children}
        </ReferenceDataContext.Provider>
    );
};

export const useReferenceData = (): ReferenceDataContextType => {
    const contexto = useContext(ReferenceDataContext);
    if (contexto === undefined) {
        throw new Error('useReferenceData deve ser usado dentro de um ReferenceDataProvider');
    }
    return contexto;
};
