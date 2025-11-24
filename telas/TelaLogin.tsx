
import React, { useState } from 'react';
import { useAutenticacao } from '../hooks/useAutenticacao';
import * as api from '../servicos/bancoDados';

const TelaLogin: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const { login, carregando, erro } = useAutenticacao();

    // Estados para recuperação de senha
    const [modalRecuperacaoAberto, setModalRecuperacaoAberto] = useState(false);
    const [recupLogin, setRecupLogin] = useState('');
    const [recupEmail, setRecupEmail] = useState('');
    const [recupStatus, setRecupStatus] = useState<{tipo: 'sucesso' | 'erro' | 'info', msg: string} | null>(null);
    const [recupCarregando, setRecupCarregando] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(email, password);
        } catch (err) {
            // Erro é tratado no hook useAutenticacao
        }
    };

    const handleRecuperarSenha = async (e: React.FormEvent) => {
        e.preventDefault();
        setRecupStatus(null);
        setRecupCarregando(true);
        try {
            const novaSenha = await api.recuperarSenha(recupLogin, recupEmail);
            // Simulação de envio de email
            setRecupStatus({
                tipo: 'sucesso',
                msg: `Identidade confirmada! Como este é um sistema local (sem servidor de e-mail), sua SENHA TEMPORÁRIA é: [ ${novaSenha} ]. Copie e use para entrar.`
            });
        } catch (err: any) {
            setRecupStatus({ tipo: 'erro', msg: err.message });
        } finally {
            setRecupCarregando(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
                <div>
                    <h1 className="text-center text-3xl font-extrabold text-gray-900">
                        Sistema de Patrimônio
                    </h1>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email-address" className="sr-only">Login (usuário)</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Login (usuário)"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <label htmlFor="password" className="sr-only">Senha</label>
                            <input
                                id="password"
                                name="password"
                                type={mostrarSenha ? "text" : "password"}
                                autoComplete="current-password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm pr-10"
                                placeholder="Senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 z-20"
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
                     {erro && <p className="mt-2 text-center text-sm text-red-600">{erro}</p>}
                    <div className="flex flex-col space-y-4">
                        <button
                            type="submit"
                            disabled={carregando}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                        >
                            {carregando ? 'Entrando...' : 'Entrar'}
                        </button>
                        
                        <div className="text-sm text-center">
                            <button 
                                type="button" 
                                onClick={() => setModalRecuperacaoAberto(true)}
                                className="font-medium text-blue-600 hover:text-blue-500"
                            >
                                Esqueci minha senha
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Modal de Recuperação de Senha */}
            {modalRecuperacaoAberto && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Recuperar Senha</h3>
                            <button onClick={() => setModalRecuperacaoAberto(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-4">
                            Informe seu login e o e-mail de recuperação cadastrado. Se os dados conferirem, você receberá uma nova senha temporária.
                        </p>

                        <form onSubmit={handleRecuperarSenha} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Seu Login (Usuário)</label>
                                <input 
                                    type="text" 
                                    required 
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    value={recupLogin}
                                    onChange={(e) => setRecupLogin(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">E-mail de Recuperação</label>
                                <input 
                                    type="email" 
                                    required 
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    value={recupEmail}
                                    onChange={(e) => setRecupEmail(e.target.value)}
                                />
                            </div>

                            {recupStatus && (
                                <div className={`p-3 rounded text-sm ${recupStatus.tipo === 'sucesso' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {recupStatus.msg}
                                </div>
                            )}

                            <div className="flex justify-end pt-2">
                                <button type="button" onClick={() => setModalRecuperacaoAberto(false)} className="mr-2 px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200">
                                    Fechar
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={recupCarregando}
                                    className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 disabled:bg-blue-300"
                                >
                                    {recupCarregando ? 'Verificando...' : 'Recuperar Senha'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TelaLogin;
