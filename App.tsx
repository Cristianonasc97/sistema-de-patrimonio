
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ProvedorAutenticacao, useAutenticacao } from './hooks/useAutenticacao';
import { Pagina, Perfil } from './tipos';
import TelaLogin from './telas/TelaLogin';
import TelaMenuPrincipal from './telas/TelaMenuPrincipal';
import TelaBens from './telas/TelaBens';
import TelaMovimentacoes from './telas/TelaMovimentacoes';
import TelaInventario from './telas/TelaInventario';
import TelaRelatorios from './telas/TelaRelatorios';
import TelaUsuarios from './telas/TelaUsuarios';
import TelaAlterarSenhaForcada from './telas/TelaAlterarSenhaForcada';
import Layout from './componentes/Layout';

// Função para obter a página atual baseada na URL
// Definida fora do componente para evitar recriação e erros de referência
const obterPaginaDaUrl = (): Pagina => {
    if (typeof window === 'undefined') return Pagina.MENU_PRINCIPAL;
    
    const params = new URLSearchParams(window.location.search);
    const paginaUrl = params.get('pagina');
    
    // Verifica se o parâmetro da URL é um valor válido do enum Pagina
    if (paginaUrl && Object.values(Pagina).includes(paginaUrl as Pagina)) {
        return paginaUrl as Pagina;
    }
    return Pagina.MENU_PRINCIPAL;
};

const ConteudoApp: React.FC = () => {
    const { usuario, verificandoSessao } = useAutenticacao();

    // Inicializa o estado com o valor da URL ou Menu Principal
    const [paginaAtual, setPaginaAtual] = useState<Pagina>(obterPaginaDaUrl);

    // Efeito para escutar o botão "Voltar" e "Avançar" do navegador
    useEffect(() => {
        const handlePopState = () => {
            setPaginaAtual(obterPaginaDaUrl());
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    // Função de navegação atualizada para manipular o histórico e URL
    const navegarPara = useCallback((pagina: Pagina) => {
        setPaginaAtual(pagina);
        
        // Atualiza a URL sem recarregar a página
        const url = new URL(window.location.href);
        
        if (pagina === Pagina.MENU_PRINCIPAL) {
            // Se for menu principal, limpa o parâmetro para ficar mais limpo
            url.searchParams.delete('pagina');
        } else {
            url.searchParams.set('pagina', pagina);
        }
        
        // Garante que o URL é passado como string para compatibilidade
        window.history.pushState({}, '', url.toString());
    }, []);

    const renderizarConteudo = useMemo(() => {
        switch (paginaAtual) {
            case Pagina.MENU_PRINCIPAL:
                return <TelaMenuPrincipal aoNavegar={navegarPara} />;
            case Pagina.BENS:
                return <TelaBens aoNavegar={navegarPara} />;
            case Pagina.MOVIMENTACOES:
                return <TelaMovimentacoes aoNavegar={navegarPara} />;
            case Pagina.INVENTARIO:
                return <TelaInventario aoNavegar={navegarPara} />;
            case Pagina.RELATORIOS:
                return <TelaRelatorios aoNavegar={navegarPara} />;
            case Pagina.USUARIOS:
                // Verificação de segurança: apenas admins acessam esta página
                if (usuario?.perfil === Perfil.ADMIN) {
                    return <TelaUsuarios aoNavegar={navegarPara} />;
                }
                // Se não for admin, renderiza o menu principal (sem alterar state durante render)
                return <TelaMenuPrincipal aoNavegar={navegarPara} />;
            default:
                return <TelaMenuPrincipal aoNavegar={navegarPara} />;
        }
    }, [paginaAtual, navegarPara, usuario]);

    // Enquanto verifica a sessão (localStorage -> DB), exibe um loading simples
    if (verificandoSessao) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-xl text-gray-600 font-semibold">Carregando sistema...</div>
            </div>
        );
    }

    if (!usuario) {
        return <TelaLogin />;
    }

    // Se o usuário estiver logado com uma senha temporária, força a troca
    if (usuario.tempPassword) {
        return <TelaAlterarSenhaForcada />;
    }

    return (
        <Layout aoNavegar={navegarPara}>
            {renderizarConteudo}
        </Layout>
    );
};

const App: React.FC = () => {
    return (
        <ProvedorAutenticacao>
            <ConteudoApp />
        </ProvedorAutenticacao>
    );
};

export default App;
