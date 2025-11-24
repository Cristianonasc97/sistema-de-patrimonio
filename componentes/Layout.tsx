
import React from 'react';
import { useAutenticacao } from '../hooks/useAutenticacao';
import { Pagina } from '../tipos';

interface LayoutProps {
    children: React.ReactNode;
    aoNavegar: (pagina: Pagina) => void;
}

const icones = {
    menu: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>,
    bens: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>,
    movimentacoes: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>,
    inventario: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002-2h2a2 2 0 002 2M9 5v1.5a1.5 1.5 0 01-3 0V5" /></svg>,
    relatorios: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    usuarios: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.225-1.26-.632-1.742M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 0c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>,
    logout: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
};

const Layout: React.FC<LayoutProps> = ({ children, aoNavegar }) => {
    const { usuario, logout } = useAutenticacao();

    const itensMenu = [
        { pagina: Pagina.MENU_PRINCIPAL, rotulo: 'Menu Principal', icone: icones.menu, apenasAdmin: false },
        { pagina: Pagina.BENS, rotulo: 'Cadastro de Bens', icone: icones.bens, apenasAdmin: false },
        { pagina: Pagina.MOVIMENTACOES, rotulo: 'Movimentações', icone: icones.movimentacoes, apenasAdmin: false },
        { pagina: Pagina.INVENTARIO, rotulo: 'Inventário', icone: icones.inventario, apenasAdmin: false },
        { pagina: Pagina.RELATORIOS, rotulo: 'Gerar Relatórios', icone: icones.relatorios, apenasAdmin: false },
        { pagina: Pagina.USUARIOS, rotulo: 'Cadastrar Usuário', icone: icones.usuarios, apenasAdmin: true },
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Barra Lateral */}
            <aside className="w-64 bg-blue-800 text-white flex flex-col">
                <div className="p-4 border-b border-blue-700">
                    <h1 className="text-2xl font-bold text-center">Patrimônio</h1>
                </div>
                <nav className="flex-1 px-2 py-4 space-y-2">
                    {itensMenu.map(item => (
                        (!item.apenasAdmin || usuario?.perfil === 'ADMIN') && (
                            <button
                                key={item.pagina}
                                onClick={() => aoNavegar(item.pagina)}
                                className="w-full flex items-center px-4 py-2 text-blue-100 rounded-md hover:bg-blue-700 hover:text-white transition-colors duration-200"
                            >
                                {item.icone}
                                {item.rotulo}
                            </button>
                        )
                    ))}
                </nav>
                <div className="p-4 border-t border-blue-700">
                     <p className="text-sm text-blue-200 mb-2">Logado como: {usuario?.email}</p>
                     <button
                        onClick={logout}
                        className="w-full flex items-center px-4 py-2 text-blue-100 rounded-md hover:bg-blue-700 hover:text-white transition-colors duration-200"
                    >
                       {icones.logout}
                        Sair
                    </button>
                </div>
            </aside>

            {/* Conteúdo Principal */}
            <main className="flex-1 p-6 lg:p-10 overflow-auto">
                {children}
            </main>
        </div>
    );
};

export default Layout;
