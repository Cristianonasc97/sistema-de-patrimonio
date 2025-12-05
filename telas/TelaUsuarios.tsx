
import React, { useState, useEffect, useCallback } from 'react';
import { Pagina, Usuario, Perfil } from '../tipos';
import * as userService from '../services/userService';
import { useReferenceData } from '../hooks/useReferenceData';

// Componente Modal interno (Reutilizando padrão da tela de Bens)
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

interface PropsTelaUsuarios {
    aoNavegar: (pagina: Pagina) => void;
}

const TelaUsuarios: React.FC<PropsTelaUsuarios> = ({ aoNavegar }) => {
    const { perfis } = useReferenceData();
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [email, setEmail] = useState('');
    const [emailRecuperacao, setEmailRecuperacao] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [perfilId, setPerfilId] = useState<string>('');
    const [enviando, setEnviando] = useState(false);
    const [feedback, setFeedback] = useState<{ tipo: 'sucesso' | 'erro', mensagem: string } | null>(null);

    // Estados para controle de visibilidade da senha
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

    // Estados para o Modal de Exclusão
    const [modalExclusaoAberto, setModalExclusaoAberto] = useState(false);
    const [usuarioParaExcluir, setUsuarioParaExcluir] = useState<Usuario | null>(null);

    const mostrarFeedback = (mensagem: string, tipo: 'sucesso' | 'erro' = 'sucesso') => {
        setFeedback({ tipo, mensagem });
        setTimeout(() => setFeedback(null), 5000);
    };

    const carregarUsuarios = useCallback(async () => {
        setCarregando(true);
        try {
            const dados = await userService.getUsuarios();
            setUsuarios(dados);
        } catch (erro: any) {
            mostrarFeedback(`Erro ao carregar usuários: ${erro.message}`, 'erro');
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        carregarUsuarios();
    }, [carregarUsuarios]);

    const handleAdicionarUsuario = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            mostrarFeedback('Erro: As senhas não coincidem.', 'erro');
            return;
        }

        setEnviando(true);
        try {
            await userService.addUsuario({ email, password, perfilId, emailRecuperacao });
            setEmail('');
            setEmailRecuperacao('');
            setPassword('');
            setConfirmPassword('');
            setPerfilId('');
            mostrarFeedback('Usuário cadastrado com sucesso!');
            await carregarUsuarios();
        } catch (erro: any) {
            mostrarFeedback(`Erro ao cadastrar: ${erro.message}`, 'erro');
        } finally {
            setEnviando(false);
        }
    };

    const handleSolicitarExclusao = (usuario: Usuario) => {
        setUsuarioParaExcluir(usuario);
        setModalExclusaoAberto(true);
    };

    const handleConfirmarExclusao = async () => {
        if (!usuarioParaExcluir) return;

        const usuariosOriginais = [...usuarios];
        // Atualização otimista
        setUsuarios(usuariosAtuais => usuariosAtuais.filter(u => u.id !== usuarioParaExcluir.id));

        try {
            await userService.deleteUsuario(usuarioParaExcluir.id);
            mostrarFeedback('Usuário excluído com sucesso');
        } catch (erro: any) {
            // Reverter em caso de erro
            setUsuarios(usuariosOriginais);
            mostrarFeedback(`Erro ao excluir usuário: ${erro.message}`, 'erro');
        } finally {
            setModalExclusaoAberto(false);
            setUsuarioParaExcluir(null);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Gerenciamento de Usuários</h1>
                <button onClick={() => aoNavegar(Pagina.MENU_PRINCIPAL)} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">Voltar</button>
            </div>
            
            {feedback && (
                <div className={`p-4 mb-4 text-sm rounded-lg ${feedback.tipo === 'sucesso' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`} role="alert">
                    <span className="font-medium">{feedback.mensagem}</span>
                </div>
            )}

            <div className="space-y-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Cadastrar Novo Usuário</h2>
                    <form onSubmit={handleAdicionarUsuario} className="space-y-4 max-w-lg">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Login (ID do Usuário)</label>
                            <input type="text" value={email} onChange={e => setEmail(e.target.value)} required placeholder="ex: joao.silva" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">E-mail de Recuperação (Ativo)</label>
                            <input type="email" value={emailRecuperacao} onChange={e => setEmailRecuperacao(e.target.value)} required placeholder="ex: joao@gmail.com" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                            <p className="text-xs text-gray-500 mt-1">Usado para enviar nova senha caso o usuário esqueça.</p>
                        </div>
                        
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700">Senha</label>
                            <div className="relative mt-1">
                                <input 
                                    type={mostrarSenha ? "text" : "password"} 
                                    value={password} 
                                    onChange={e => setPassword(e.target.value)} 
                                    required 
                                    minLength={6} 
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-10"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                                    onClick={() => setMostrarSenha(!mostrarSenha)}
                                >
                                    {mostrarSenha ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                         <div className="relative">
                            <label className="block text-sm font-medium text-gray-700">Confirmar Senha</label>
                            <div className="relative mt-1">
                                <input 
                                    type={mostrarConfirmarSenha ? "text" : "password"} 
                                    value={confirmPassword} 
                                    onChange={e => setConfirmPassword(e.target.value)} 
                                    required 
                                    minLength={6} 
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-10"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                                    onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                                >
                                    {mostrarConfirmarSenha ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nível de Acesso</label>
                            <select value={perfilId} onChange={e => setPerfilId(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                <option value="">Selecione um perfil</option>
                                {perfis.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                            </select>
                        </div>
                        
                        <div className="flex justify-end pt-2">
                            <button type="submit" disabled={enviando} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed">
                                {enviando ? 'Cadastrando...' : 'Cadastrar Usuário'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Usuários Existentes</h2>
                    {carregando ? <p>Carregando...</p> : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3">Login</th>
                                        <th className="px-6 py-3">E-mail Recuperação</th>
                                        <th className="px-6 py-3">Nível de Acesso</th>
                                        <th className="px-6 py-3">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usuarios.map(u => (
                                        <tr key={u.id} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-6 py-4">{u.email}</td>
                                            <td className="px-6 py-4">{u.emailRecuperacao || '-'}</td>
                                            <td className="px-6 py-4">{u.perfil?.nome || 'N/A'}</td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleSolicitarExclusao(u)}
                                                    className="font-medium text-red-600 hover:underline disabled:text-gray-400 disabled:hover:no-underline disabled:cursor-not-allowed"
                                                    disabled={u.email === 'admin@email.com'}
                                                    title={u.email === 'admin@email.com' ? 'O administrador padrão não pode ser excluído.' : 'Excluir usuário'}
                                                >
                                                    Excluir
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

             {/* Modal de Confirmação de Exclusão */}
             <Modal isOpen={modalExclusaoAberto} onClose={() => setModalExclusaoAberto(false)} titulo="Confirmar Exclusão">
                <div className="space-y-4">
                    <p className="text-gray-700">
                        Tem certeza que deseja excluir esse usuário?
                        {usuarioParaExcluir && (
                            <span className="block mt-2 font-medium text-gray-900">
                                {usuarioParaExcluir.email}
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

export default TelaUsuarios;