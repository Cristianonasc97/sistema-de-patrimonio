
import React from 'react';
import { Pagina, Perfil } from '../tipos';
import { useAutenticacao } from '../hooks/useAutenticacao';

interface PropsMenuPrincipal {
    aoNavegar: (pagina: Pagina) => void;
}

const TelaMenuPrincipal: React.FC<PropsMenuPrincipal> = ({ aoNavegar }) => {
    const { usuario } = useAutenticacao();

    const itensMenu = [
        { pagina: Pagina.BENS, titulo: 'Cadastro de Bens', descricao: 'Adicione, edite e remova bens do patrimônio.' },
        { pagina: Pagina.MOVIMENTACOES, titulo: 'Movimentações', descricao: 'Registre empréstimos e devoluções de itens.' },
        { pagina: Pagina.INVENTARIO, titulo: 'Inventário', descricao: 'Consulte todos os bens e movimentações ativas.' },
        { pagina: Pagina.RELATORIOS, titulo: 'Gerar Relatórios', descricao: 'Exporte dados do inventário em PDF ou Excel.' },
        { pagina: Pagina.USUARIOS, titulo: 'Cadastrar Usuário', descricao: 'Gerencie os usuários do sistema.', apenasAdmin: true },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Menu Principal</h1>
                    <p className="text-gray-600 mt-1">Bem-vindo ao Sistema de Patrimônio.</p>
                </div>
                {/* Opção de alterar senha removida conforme solicitação */}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {itensMenu.map(item => (
                    (!item.apenasAdmin || usuario?.perfil === Perfil.ADMIN) && (
                        <div
                            key={item.pagina}
                            onClick={() => aoNavegar(item.pagina)}
                            className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl hover:scale-105 hover:border-blue-500 border-2 border-transparent transition-all duration-300 cursor-pointer"
                        >
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">{item.titulo}</h2>
                            <p className="text-gray-600">{item.descricao}</p>
                        </div>
                    )
                ))}
            </div>
        </div>
    );
};

export default TelaMenuPrincipal;
