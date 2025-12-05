
import React, { useState, useEffect, useCallback } from 'react';
import { Pagina, Movimentacao, Bem } from '../tipos';
import * as dataService from '../services/dataService';
import { useReferenceData } from '../hooks/useReferenceData';

interface PropsTelaMovimentacoes {
    aoNavegar: (pagina: Pagina) => void;
}

const TelaMovimentacoes: React.FC<PropsTelaMovimentacoes> = ({ aoNavegar }) => {
    const { tiposMovimentacao } = useReferenceData();
    const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
    const [bens, setBens] = useState<Bem[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [abaAtiva, setAbaAtiva] = useState<'emprestimo' | 'devolucao'>('emprestimo');
    const [feedback, setFeedback] = useState<{ tipo: 'sucesso' | 'erro', mensagem: string } | null>(null);

    const mostrarFeedback = (mensagem: string, tipo: 'sucesso' | 'erro' = 'sucesso') => {
        setFeedback({ tipo, mensagem });
        setTimeout(() => setFeedback(null), 5000);
    };

    const carregarDados = useCallback(async () => {
        setCarregando(true);
        try {
            const dadosMov = await dataService.getMovimentacoes();
            const dadosBens = await dataService.getBens();
            setMovimentacoes(dadosMov);
            setBens(dadosBens);
        } catch(err: any) {
             mostrarFeedback(`Erro ao carregar dados: ${err.message}`, 'erro');
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        carregarDados();
    }, [carregarDados]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Movimentações</h1>
                <button onClick={() => aoNavegar(Pagina.MENU_PRINCIPAL)} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">Voltar</button>
            </div>
            
            {feedback && (
                <div className={`p-4 mb-4 text-sm rounded-lg ${feedback.tipo === 'sucesso' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`} role="alert">
                    <span className="font-medium">{feedback.tipo === 'sucesso' ? 'Sucesso!' : 'Erro!'}</span> {feedback.mensagem}
                </div>
            )}

            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setAbaAtiva('emprestimo')} className={`${abaAtiva === 'emprestimo' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                        Registrar Empréstimo
                    </button>
                    <button onClick={() => setAbaAtiva('devolucao')} className={`${abaAtiva === 'devolucao' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                        Registrar Devolução
                    </button>
                </nav>
            </div>

            <div className="mt-6">
                {carregando ? <p>Carregando...</p> : (
                    <>
                        {abaAtiva === 'emprestimo' && <FormEmprestimo bens={bens} tiposMovimentacao={tiposMovimentacao} aoSalvar={carregarDados} mostrarFeedback={mostrarFeedback} />}
                        {abaAtiva === 'devolucao' && <FormDevolucao movimentacoes={movimentacoes} bens={bens} aoSalvar={carregarDados} mostrarFeedback={mostrarFeedback} />}
                    </>
                )}
            </div>
        </div>
    );
};

// --- Componente Formulário de Empréstimo ---
interface PropsFormEmprestimo {
    bens: Bem[];
    tiposMovimentacao: Array<{ id: string; nome: string }>;
    aoSalvar: () => Promise<void>;
    mostrarFeedback: (mensagem: string, tipo?: 'sucesso' | 'erro') => void;
}

const FormEmprestimo: React.FC<PropsFormEmprestimo> = ({ bens, tiposMovimentacao, aoSalvar, mostrarFeedback }) => {
    const [dadosForm, setDadosForm] = useState({
        tombo: '',
        pessoa: '',
        contato: '',
        pastoral: '',
        observacao: '',
        dataEmprestimo: new Date().toISOString().split('T')[0],
    });
    const [bemSelecionado, setBemSelecionado] = useState<Bem | null>(null);
    const [erro, setErro] = useState('');

    // Find the emprestimo tipo ID
    const emprestimoTipoId = tiposMovimentacao.find(t => t.nome.toLowerCase().includes('empréstimo'))?.id || '';

    useEffect(() => {
        const bem = bens.find(b => b.tombo === dadosForm.tombo);
        if (bem) {
            setBemSelecionado(bem);
            setErro('');
        } else {
            setBemSelecionado(null);
            if (dadosForm.tombo) setErro('Tombo inválido ou não cadastrado.');
            else setErro('');
        }
    }, [dadosForm.tombo, bens]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const valorFinal = name === 'tombo' ? value.replace(/[^0-9]/g, '') : value;
        setDadosForm(prev => ({ ...prev, [name]: valorFinal }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (erro || !bemSelecionado) {
            mostrarFeedback('Por favor, corrija os erros antes de salvar.', 'erro');
            return;
        }

        const novaMov = {
            bemId: bemSelecionado.id,
            tipoMovimentacaoId: emprestimoTipoId,
            pessoa: dadosForm.pessoa,
            contato: dadosForm.contato,
            pastoral: dadosForm.pastoral,
            observacao: dadosForm.observacao || null,
            dataEmprestimo: dadosForm.dataEmprestimo,
        };

        try {
            await dataService.addMovimentacao(novaMov);
            await aoSalvar();
            mostrarFeedback('Item emprestado com sucesso!');
             // Limpar formulário
            setDadosForm({
                tombo: '',
                pessoa: '',
                contato: '',
                pastoral: '',
                observacao: '',
                dataEmprestimo: new Date().toISOString().split('T')[0],
            });
            setBemSelecionado(null);
        } catch (err: any) {
            mostrarFeedback(`Erro ao registrar empréstimo: ${err.message}`, 'erro');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Tombo do Item</label>
                    <input type="text" pattern="[0-9]*" name="tombo" value={dadosForm.tombo} onChange={handleChange} required list="lista-tombos" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                    <datalist id="lista-tombos">
                        {bens.map(b => <option key={b.id} value={b.tombo} />)}
                    </datalist>
                    {erro && dadosForm.tombo && <p className="text-red-500 text-xs mt-1">{erro}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Qual o Item</label>
                    <input type="text" value={bemSelecionado?.nome || 'Item não encontrado'} readOnly className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"/>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Pessoa Responsável</label>
                <input type="text" name="pessoa" value={dadosForm.pessoa} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Contato</label>
                    <input type="text" name="contato" value={dadosForm.contato} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Pastoral</label>
                    <input type="text" name="pastoral" value={dadosForm.pastoral} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Observação (opcional)</label>
                <textarea
                    name="observacao"
                    value={dadosForm.observacao}
                    onChange={handleChange}
                    maxLength={500}
                    rows={4}
                    placeholder="Ex: Emprestado para evento da Páscoa. Item deve ser devolvido limpo após o evento..."
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                    {dadosForm.observacao?.length || 0}/500 caracteres
                </p>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Data do Empréstimo</label>
                <input type="date" name="dataEmprestimo" value={dadosForm.dataEmprestimo} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
            </div>
            <div className="flex justify-end pt-4">
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">Registrar Empréstimo</button>
            </div>
        </form>
    );
}

// --- Componente Formulário de Devolução ---
interface PropsFormDevolucao {
    movimentacoes: Movimentacao[];
    bens: Bem[];
    aoSalvar: () => Promise<void>;
    mostrarFeedback: (mensagem: string, tipo?: 'sucesso' | 'erro') => void;
}
const FormDevolucao: React.FC<PropsFormDevolucao> = ({ movimentacoes, bens, aoSalvar, mostrarFeedback }) => {
    const [tombo, setTombo] = useState('');
    const [dataDevolucao, setDataDevolucao] = useState(new Date().toISOString().split('T')[0]);
    const [emprestimoAtivo, setEmprestimoAtivo] = useState<Movimentacao | null>(null);
    const [erro, setErro] = useState('');

    const emprestimosAtivos = movimentacoes.filter(m => m.dataDevolucao === null);

    useEffect(() => {
        if(tombo) {
            // Find bem by tombo first
            const bem = bens.find(b => b.tombo === tombo);
            if (bem) {
                // Then find active loan for this bem
                const emprestimo = emprestimosAtivos.find(m => m.bemId === bem.id);
                if (emprestimo) {
                    setEmprestimoAtivo(emprestimo);
                    setErro('');
                } else {
                    setEmprestimoAtivo(null);
                    setErro('Nenhum empréstimo ativo encontrado para este tombo.');
                }
            } else {
                setEmprestimoAtivo(null);
                setErro('Tombo não encontrado.');
            }
        } else {
            setEmprestimoAtivo(null);
            setErro('');
        }
    }, [tombo, movimentacoes, bens, emprestimosAtivos]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!emprestimoAtivo) {
             mostrarFeedback('Selecione um item com empréstimo ativo.', 'erro');
            return;
        }

        try {
            // Use the registerReturn endpoint instead of creating new movimentacao
            await dataService.registerReturn(emprestimoAtivo.id);
            await aoSalvar();
            mostrarFeedback('Item devolvido com sucesso!');
            setTombo('');
            setEmprestimoAtivo(null);
        } catch(err: any) {
            mostrarFeedback(`Erro ao registrar devolução: ${err.message}`, 'erro');
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto">
            <div>
                <label className="block text-sm font-medium text-gray-700">Tombo do Item a ser Devolvido</label>
                <input 
                    type="text" 
                    pattern="[0-9]*" 
                    name="tombo" 
                    value={tombo} 
                    onChange={e => setTombo(e.target.value.replace(/[^0-9]/g, ''))} 
                    required 
                    list="lista-devolucao" 
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                 <datalist id="lista-devolucao">
                    {emprestimosAtivos.map(m => {
                        const bem = bens.find(b => b.id === m.bemId);
                        return bem ? <option key={m.id} value={bem.tombo}>{bem.nome}</option> : null;
                    })}
                </datalist>
                {erro && tombo && <p className="text-red-500 text-xs mt-1">{erro}</p>}
            </div>

            {emprestimoAtivo && (
                <div className="p-4 bg-gray-50 rounded-lg border space-y-2">
                    <h3 className="font-semibold text-gray-800">Detalhes do Empréstimo</h3>
                    <p><span className="font-medium">Item:</span> {bens.find(b => b.id === emprestimoAtivo.bemId)?.nome || 'N/A'}</p>
                    <p><span className="font-medium">Responsável:</span> {emprestimoAtivo.pessoa}</p>
                    <p><span className="font-medium">Data do Empréstimo:</span> {emprestimoAtivo.dataEmprestimo}</p>
                    {emprestimoAtivo.observacao && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                            <p className="font-medium text-gray-700">Observação:</p>
                            <p className="text-sm text-gray-600 mt-1">{emprestimoAtivo.observacao}</p>
                        </div>
                    )}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700">Data da Devolução</label>
                <input 
                    type="date" 
                    name="dataDevolucao" 
                    value={dataDevolucao} 
                    onChange={e => setDataDevolucao(e.target.value)} 
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            
             <div className="flex justify-end pt-4">
                <button type="submit" disabled={!emprestimoAtivo} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400">Registrar Devolução</button>
            </div>
        </form>
    );
};


export default TelaMovimentacoes;
