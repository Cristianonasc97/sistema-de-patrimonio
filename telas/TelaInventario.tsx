
import React, { useState, useEffect, useMemo } from 'react';
import { Pagina, Bem, Movimentacao } from '../tipos';
import * as dataService from '../services/dataService';
import { useReferenceData } from '../hooks/useReferenceData';

// Componente Modal Interno
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    titulo: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, titulo }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                    <h3 className="text-xl font-semibold text-gray-800">{titulo}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 focus:outline-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

interface PropsTelaInventario {
    aoNavegar: (pagina: Pagina) => void;
}

const TelaInventario: React.FC<PropsTelaInventario> = ({ aoNavegar }) => {
    const { categorias, localizacoes } = useReferenceData();
    const [bens, setBens] = useState<Bem[]>([]);
    const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [abaAtiva, setAbaAtiva] = useState<'bens' | 'movimentacoes'>('bens');

    // Estados para visualização de imagem
    const [modalImagemAberto, setModalImagemAberto] = useState(false);
    const [bemVisualizar, setBemVisualizar] = useState<Bem | null>(null);

    const [filtrosBens, setFiltrosBens] = useState({ tombo: '', nome: '', categoriaId: '', localizacaoId: '', sala: '' });
    const [filtrosMov, setFiltrosMov] = useState({ tombo: '', pessoa: '', pastoral: '', status: ''});

    // Helper functions to get names from IDs
    const getCategoriaNome = (categoriaId: string) => {
        return categorias.find(c => c.id === categoriaId)?.nome || 'N/A';
    };

    const getLocalizacaoNome = (localizacaoId: string) => {
        return localizacoes.find(l => l.id === localizacaoId)?.nome || 'N/A';
    };

    useEffect(() => {
        const carregarDados = async () => {
            setCarregando(true);
            const dadosBens = await dataService.getBens();
            const dadosMov = await dataService.getMovimentacoes();
            setBens(dadosBens);
            setMovimentacoes(dadosMov.sort((a, b) => new Date(b.dataEmprestimo).getTime() - new Date(a.dataEmprestimo).getTime()));
            setCarregando(false);
        };
        carregarDados();
    }, []);

    const handleMudancaFiltroBem = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFiltrosBens(prev => ({ ...prev, [name]: value }));
    };
    
    const handleMudancaFiltroMov = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFiltrosMov(prev => ({ ...prev, [name]: value }));
    };

    const abrirVisualizacaoImagem = (bem: Bem) => {
        setBemVisualizar(bem);
        setModalImagemAberto(true);
    };

    const fecharVisualizacaoImagem = () => {
        setModalImagemAberto(false);
        setBemVisualizar(null);
    };

    const bensFiltrados = useMemo(() => {
        return bens.filter(bem =>
            bem.tombo.toLowerCase().includes(filtrosBens.tombo.toLowerCase()) &&
            bem.nome.toLowerCase().includes(filtrosBens.nome.toLowerCase()) &&
            (filtrosBens.categoriaId === '' || bem.categoriaId === filtrosBens.categoriaId) &&
            (filtrosBens.localizacaoId === '' || bem.localizacaoId === filtrosBens.localizacaoId) &&
            bem.sala.toLowerCase().includes(filtrosBens.sala.toLowerCase())
        );
    }, [bens, filtrosBens]);
    
    const movimentacoesFiltradas = useMemo(() => {
        return movimentacoes
            .filter(mov => {
                const tomboMov = mov.bem?.tombo || '';
                return tomboMov.toLowerCase().includes(filtrosMov.tombo.toLowerCase()) &&
                    mov.pessoa.toLowerCase().includes(filtrosMov.pessoa.toLowerCase()) &&
                    mov.pastoral.toLowerCase().includes(filtrosMov.pastoral.toLowerCase());
            })
            .filter(mov => {
                if (filtrosMov.status === 'emprestado') return mov.dataDevolucao === null;
                if (filtrosMov.status === 'devolvido') return mov.dataDevolucao !== null;
                return true;
            });
    }, [movimentacoes, filtrosMov]);


    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Inventário</h1>
                <button onClick={() => aoNavegar(Pagina.MENU_PRINCIPAL)} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">Voltar</button>
            </div>

            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setAbaAtiva('bens')} className={`${abaAtiva === 'bens' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                        Bens Cadastrados
                    </button>
                    <button onClick={() => setAbaAtiva('movimentacoes')} className={`${abaAtiva === 'movimentacoes' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                        Histórico de Movimentações
                    </button>
                </nav>
            </div>
            
            {carregando ? <p className="mt-6">Carregando...</p> : (
            <div className="mt-6">
                {abaAtiva === 'bens' && (
                    <div>
                        {/* Filtros para Bens */}
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4 p-4 bg-gray-50 rounded-md">
                            <input type="text" name="tombo" placeholder="Filtrar por Tombo" value={filtrosBens.tombo} onChange={handleMudancaFiltroBem} className="px-3 py-2 border border-gray-300 rounded-md"/>
                            <input type="text" name="nome" placeholder="Filtrar por Nome" value={filtrosBens.nome} onChange={handleMudancaFiltroBem} className="px-3 py-2 border border-gray-300 rounded-md"/>
                             <select name="categoriaId" value={filtrosBens.categoriaId} onChange={handleMudancaFiltroBem} className="px-3 py-2 border border-gray-300 rounded-md bg-white">
                                <option value="">Todas Categorias</option>
                                {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nome}</option>)}
                            </select>
                             <select name="localizacaoId" value={filtrosBens.localizacaoId} onChange={handleMudancaFiltroBem} className="px-3 py-2 border border-gray-300 rounded-md bg-white">
                                <option value="">Todas Localizações</option>
                                {localizacoes.map(loc => <option key={loc.id} value={loc.id}>{loc.nome}</option>)}
                            </select>
                            <input type="text" name="sala" placeholder="Filtrar por Sala" value={filtrosBens.sala} onChange={handleMudancaFiltroBem} className="px-3 py-2 border border-gray-300 rounded-md"/>
                        </div>
                        {/* Tabela de Bens */}
                        <div className="overflow-x-auto">
                           <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3">Tombo</th>
                                    <th className="px-6 py-3">Visualizar</th>
                                    <th className="px-6 py-3">Nome</th>
                                    <th className="px-6 py-3">Categoria</th>
                                    <th className="px-6 py-3">Localização</th>
                                    <th className="px-6 py-3">Sala</th>
                                </tr>
                            </thead>
                            <tbody>{bensFiltrados.map(bem => (
                                <tr key={bem.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{bem.tombo}</td>
                                    <td className="px-6 py-4">
                                        {(bem.fotoBem || bem.imagemTombo) ? (
                                            <button
                                                onClick={() => abrirVisualizacaoImagem(bem)}
                                                className="text-blue-600 hover:text-blue-900 flex items-center space-x-1 font-medium"
                                                title="Ver Fotos"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                <span>Abrir</span>
                                            </button>
                                        ) : (
                                            <span className="text-gray-400 text-xs italic">Sem fotos</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">{bem.nome}</td>
                                    <td className="px-6 py-4">{bem.categoria?.nome || getCategoriaNome(bem.categoriaId)}</td>
                                    <td className="px-6 py-4">{bem.localizacao?.nome || getLocalizacaoNome(bem.localizacaoId)}</td>
                                    <td className="px-6 py-4">{bem.sala}</td>
                                </tr>
                            ))}</tbody>
                           </table>
                        </div>
                    </div>
                )}
                {abaAtiva === 'movimentacoes' && (
                    <div>
                        {/* Filtros para Movimentações */}
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-md">
                            <input type="text" name="tombo" placeholder="Filtrar por Tombo" value={filtrosMov.tombo} onChange={handleMudancaFiltroMov} className="px-3 py-2 border border-gray-300 rounded-md"/>
                            <input type="text" name="pessoa" placeholder="Filtrar por Pessoa" value={filtrosMov.pessoa} onChange={handleMudancaFiltroMov} className="px-3 py-2 border border-gray-300 rounded-md"/>
                            <input type="text" name="pastoral" placeholder="Filtrar por Pastoral" value={filtrosMov.pastoral} onChange={handleMudancaFiltroMov} className="px-3 py-2 border border-gray-300 rounded-md"/>
                             <select name="status" value={filtrosMov.status} onChange={handleMudancaFiltroMov} className="px-3 py-2 border border-gray-300 rounded-md bg-white">
                                <option value="">Todos os Status</option>
                                <option value="emprestado">Emprestado</option>
                                <option value="devolvido">Devolvido</option>
                            </select>
                         </div>
                        {/* Tabela de Movimentações */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50"><tr><th className="px-6 py-3">Status</th><th className="px-6 py-3">Tombo</th><th className="px-6 py-3">Item</th><th className="px-6 py-3">Pessoa</th><th className="px-6 py-3">Pastoral</th><th className="px-6 py-3">Data Empréstimo</th><th className="px-6 py-3">Data Devolução</th></tr></thead>
                            <tbody>
                                {movimentacoesFiltradas.map(mov => {
                                    const estaEmprestado = mov.dataDevolucao === null;
                                    return (
                                        <tr key={mov.id} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${estaEmprestado ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                                    {estaEmprestado ? 'Emprestado' : 'Devolvido'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">{mov.bem?.tombo || 'N/A'}</td>
                                            <td className="px-6 py-4">{mov.bem?.nome || 'N/A'}</td>
                                            <td className="px-6 py-4">{mov.pessoa}</td>
                                            <td className="px-6 py-4">{mov.pastoral}</td>
                                            <td className="px-6 py-4">{mov.dataEmprestimo}</td>
                                            <td className="px-6 py-4">{mov.dataDevolucao || 'N/A'}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
            )}

            {/* Modal de Visualização de Imagens */}
            <Modal isOpen={modalImagemAberto} onClose={fecharVisualizacaoImagem} titulo={`Visualizando Imagens: ${bemVisualizar?.nome} (Tombo: ${bemVisualizar?.tombo})`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Foto do Bem */}
                    <div className="flex flex-col items-center">
                        <h4 className="text-lg font-medium text-gray-700 mb-2">Foto do Bem</h4>
                        {bemVisualizar?.fotoBem ? (
                            <img src={bemVisualizar.fotoBem} alt="Foto do Bem" className="w-full max-h-96 object-contain border rounded shadow-sm bg-gray-50" />
                        ) : (
                            <div className="w-full h-48 flex items-center justify-center bg-gray-100 rounded border border-dashed border-gray-300 text-gray-400">
                                Sem foto do bem
                            </div>
                        )}
                    </div>

                    {/* Imagem do Tombo */}
                    <div className="flex flex-col items-center">
                        <h4 className="text-lg font-medium text-gray-700 mb-2">Imagem do Tombo</h4>
                        {bemVisualizar?.imagemTombo ? (
                            <img src={bemVisualizar.imagemTombo} alt="Imagem do Tombo" className="w-full max-h-96 object-contain border rounded shadow-sm bg-gray-50" />
                        ) : (
                            <div className="w-full h-48 flex items-center justify-center bg-gray-100 rounded border border-dashed border-gray-300 text-gray-400">
                                Sem imagem do tombo
                            </div>
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default TelaInventario;
