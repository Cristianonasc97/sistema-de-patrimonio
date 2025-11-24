
import React, { useState, useEffect, useCallback } from 'react';
import { Bem, Pagina } from '../tipos';
import * as api from '../servicos/bancoDados';
import { OPCOES_CATEGORIA, OPCOES_LOCALIZACAO } from '../constantes';

// Componente Modal interno
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
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-full overflow-y-auto">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-xl font-semibold">{titulo}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};


interface PropsTelaBens {
    aoNavegar: (pagina: Pagina) => void;
}

const TelaBens: React.FC<PropsTelaBens> = ({ aoNavegar }) => {
    const [bens, setBens] = useState<Bem[]>([]);
    const [carregando, setCarregando] = useState(true);
    
    // Estado para Modal de Cadastro/Edição
    const [modalAberto, setModalAberto] = useState(false);
    const [bemEditando, setBemEditando] = useState<Bem | null>(null);

    // Estado para Modal de Exclusão
    const [modalExclusaoAberto, setModalExclusaoAberto] = useState(false);
    const [bemParaExcluir, setBemParaExcluir] = useState<Bem | null>(null);

    const [feedback, setFeedback] = useState<{ tipo: 'sucesso' | 'erro', mensagem: string } | null>(null);

    const mostrarFeedback = (mensagem: string, tipo: 'sucesso' | 'erro' = 'sucesso') => {
        setFeedback({ tipo, mensagem });
        // Limpar após 5s
        setTimeout(() => setFeedback(null), 5000);
    };

    const carregarBens = useCallback(async () => {
        setCarregando(true);
        try {
            const dados = await api.getBens();
            setBens(dados);
        } catch (e: any) {
            mostrarFeedback('Erro ao carregar lista de bens: ' + e.message, 'erro');
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        carregarBens();
    }, [carregarBens]);

    // Funções Modal Cadastro/Edição
    const abrirModal = (bem: Bem | null = null) => {
        setBemEditando(bem);
        setModalAberto(true);
    };

    const fecharModal = () => {
        setModalAberto(false);
        setBemEditando(null);
    };

    const salvarBem = async (bem: Bem) => {
        if (bemEditando) {
            await api.updateBem(bem);
            mostrarFeedback('Item atualizado com sucesso!');
        } else {
            await api.addBem(bem);
            mostrarFeedback('Item cadastrado com sucesso!');
        }
        await carregarBens();
        fecharModal();
    };

    // Funções Modal Exclusão
    const handleSolicitarExclusao = (bem: Bem) => {
        setBemParaExcluir(bem);
        setModalExclusaoAberto(true);
    };

    const handleConfirmarExclusao = async () => {
        if (!bemParaExcluir) return;
        
        try {
            await api.deleteBem(bemParaExcluir.id);
            // Atualizar UI removendo o item
            setBens(bensAtuais => bensAtuais.filter(bem => bem.id !== bemParaExcluir!.id));
            mostrarFeedback('Bem excluído com sucesso!');
        } catch (erro: any) {
            console.error("Erro ao excluir:", erro);
            mostrarFeedback(`Erro ao excluir o item: ${erro.message}`, 'erro');
        } finally {
            setModalExclusaoAberto(false);
            setBemParaExcluir(null);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Cadastro de Bens</h1>
                <div>
                    <button onClick={() => abrirModal()} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 mr-2">Cadastrar Bem</button>
                    <button onClick={() => aoNavegar(Pagina.MENU_PRINCIPAL)} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">Voltar</button>
                </div>
            </div>

            {feedback && (
                <div className={`p-4 mb-4 text-sm rounded-lg ${feedback.tipo === 'sucesso' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`} role="alert">
                    <span className="font-medium">{feedback.tipo === 'sucesso' ? 'Sucesso!' : 'Erro!'}</span> {feedback.mensagem}
                </div>
            )}

            {carregando ? <p>Carregando...</p> : (
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Tombo</th>
                                <th scope="col" className="px-6 py-3">Imagens</th>
                                <th scope="col" className="px-6 py-3">Nome</th>
                                <th scope="col" className="px-6 py-3">Categoria</th>
                                <th scope="col" className="px-6 py-3">Localização</th>
                                <th scope="col" className="px-6 py-3">Sala</th>
                                <th scope="col" className="px-6 py-3">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bens.map(bem => (
                                <tr key={bem.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{bem.tombo}</td>
                                    <td className="px-6 py-4 flex space-x-2">
                                        {bem.imagemTombo && <img src={bem.imagemTombo} alt="Tombo" className="w-8 h-8 object-cover rounded border" title="Imagem do Tombo" />}
                                        {bem.fotoBem && <img src={bem.fotoBem} alt="Bem" className="w-8 h-8 object-cover rounded border" title="Foto do Bem" />}
                                    </td>
                                    <td className="px-6 py-4">{bem.nome}</td>
                                    <td className="px-6 py-4">{bem.categoria}</td>
                                    <td className="px-6 py-4">{bem.localizacao}</td>
                                    <td className="px-6 py-4">{bem.sala}</td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => abrirModal(bem)} className="font-medium text-blue-600 hover:underline mr-4">Editar</button>
                                        <button onClick={() => handleSolicitarExclusao(bem)} className="font-medium text-red-600 hover:underline">Excluir</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal de Cadastro/Edição */}
            <Modal isOpen={modalAberto} onClose={fecharModal} titulo={bemEditando ? 'Editar Bem' : 'Cadastrar Bem'}>
                <FormularioBem bem={bemEditando} aoSalvar={salvarBem} aoCancelar={fecharModal} />
            </Modal>

            {/* Modal de Confirmação de Exclusão */}
            <Modal isOpen={modalExclusaoAberto} onClose={() => setModalExclusaoAberto(false)} titulo="Confirmar Exclusão">
                <div className="space-y-4">
                    <p className="text-gray-700">
                        Tem certeza que deseja excluir esse bem?
                        {bemParaExcluir && (
                            <span className="block mt-2 font-medium text-gray-900">
                                {bemParaExcluir.tombo} - {bemParaExcluir.nome}
                            </span>
                        )}
                    </p>
                    <p className="text-sm text-red-500">Esta ação não poderá ser desfeita.</p>
                    <div className="flex justify-end pt-4 space-x-2">
                        <button 
                            onClick={() => setModalExclusaoAberto(false)} 
                            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={handleConfirmarExclusao} 
                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                        >
                            Sim, Excluir
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

interface PropsFormularioBem {
    bem: Bem | null;
    aoSalvar: (bem: Bem) => Promise<void>;
    aoCancelar: () => void;
}

const FormularioBem: React.FC<PropsFormularioBem> = ({ bem, aoSalvar, aoCancelar }) => {
    const [dadosForm, setDadosForm] = useState<Omit<Bem, 'id'>>({
        tombo: bem?.tombo || '',
        nome: bem?.nome || '',
        categoria: bem?.categoria || OPCOES_CATEGORIA[0].value,
        localizacao: bem?.localizacao || OPCOES_LOCALIZACAO[0].value,
        sala: bem?.sala || '',
        imagemTombo: bem?.imagemTombo || null,
        fotoBem: bem?.fotoBem || null,
    });
    const [enviando, setEnviando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'tombo') {
            const valorNumerico = value.replace(/[^0-9]/g, '');
            setDadosForm(prev => ({ ...prev, [name]: valorNumerico }));
        } else {
            setDadosForm(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, campo: 'imagemTombo' | 'fotoBem') => {
        const file = e.target.files?.[0];
        if (file) {
            // Validação adicional de tipo
            if (campo === 'imagemTombo' && file.type !== 'image/png') {
                setErro("A imagem do tombo deve ser PNG.");
                return;
            }
            if (campo === 'fotoBem' && (file.type !== 'image/jpeg' && file.type !== 'image/jpg')) {
                setErro("A foto do bem deve ser JPEG.");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setDadosForm(prev => ({ ...prev, [campo]: reader.result as string }));
                setErro(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const removerImagem = (campo: 'imagemTombo' | 'fotoBem') => {
        setDadosForm(prev => ({ ...prev, [campo]: null }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErro(null);
        setEnviando(true);
        try {
            await aoSalvar({ id: bem?.id || '', ...dadosForm });
        } catch (err: any) {
            setErro(err.message);
            setEnviando(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             <div>
                <label className="block text-sm font-medium text-gray-700">Tombo do Item</label>
                <input type="text" pattern="[0-9]*" name="tombo" value={dadosForm.tombo} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Nome do Item</label>
                <input type="text" name="nome" value={dadosForm.nome} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
            </div>
            
            {/* Upload Imagem Tombo (PNG) */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Imagem do Tombo (Apenas PNG)</label>
                {!dadosForm.imagemTombo ? (
                    <input 
                        type="file" 
                        accept="image/png" 
                        onChange={(e) => handleFileChange(e, 'imagemTombo')} 
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                ) : (
                    <div className="mt-2 flex items-center space-x-4">
                        <img src={dadosForm.imagemTombo} alt="Preview Tombo" className="h-20 w-auto border rounded"/>
                        <button type="button" onClick={() => removerImagem('imagemTombo')} className="text-red-600 text-sm hover:underline">Remover</button>
                    </div>
                )}
            </div>

            {/* Upload Foto Bem (JPEG) */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Foto do Bem (Apenas JPEG)</label>
                {!dadosForm.fotoBem ? (
                    <input 
                        type="file" 
                        accept="image/jpeg, image/jpg" 
                        onChange={(e) => handleFileChange(e, 'fotoBem')} 
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                ) : (
                    <div className="mt-2 flex items-center space-x-4">
                        <img src={dadosForm.fotoBem} alt="Preview Bem" className="h-20 w-auto border rounded"/>
                        <button type="button" onClick={() => removerImagem('fotoBem')} className="text-red-600 text-sm hover:underline">Remover</button>
                    </div>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Categoria</label>
                <select name="categoria" value={dadosForm.categoria} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                    {OPCOES_CATEGORIA.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Localização</label>
                <select name="localizacao" value={dadosForm.localizacao} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                    {OPCOES_LOCALIZACAO.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Sala</label>
                <input type="text" name="sala" value={dadosForm.sala} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
            </div>
            {erro && <p className="text-red-600 text-sm mt-2 text-center">{erro}</p>}
            <div className="flex justify-end pt-4 space-x-2">
                <button type="button" onClick={aoCancelar} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Cancelar</button>
                <button type="submit" disabled={enviando} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed">
                    {enviando ? 'Salvando...' : 'Salvar'}
                </button>
            </div>
        </form>
    );
}

export default TelaBens;
