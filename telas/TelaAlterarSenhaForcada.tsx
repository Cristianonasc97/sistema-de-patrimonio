
import React, { useState } from 'react';
import { useAutenticacao } from '../hooks/useAutenticacao';
import * as authService from '../services/authService';

const TelaAlterarSenhaForcada: React.FC = () => {
    const { usuario, atualizarDadosLocais, logout } = useAutenticacao();
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmaSenha, setConfirmaSenha] = useState('');
    const [erro, setErro] = useState<string | null>(null);
    const [carregando, setCarregando] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErro(null);

        if (novaSenha !== confirmaSenha) {
            setErro('As senhas não coincidem.');
            return;
        }
        if (novaSenha.length < 6) {
            setErro('A senha deve ter no mínimo 6 caracteres.');
            return;
        }

        setCarregando(true);
        try {
            await authService.changePassword(novaSenha);
            // Atualiza o estado local para remover a flag de senha temporária
            // Isso fará o App redirecionar automaticamente para o menu principal
            atualizarDadosLocais({ tempPassword: false });
        } catch (err: any) {
            setErro(err.message);
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border-l-4 border-yellow-500">
                <div>
                    <h1 className="text-center text-3xl font-extrabold text-gray-900">
                        Atenção
                    </h1>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Você acessou com uma senha temporária. Por motivos de segurança, você deve definir uma nova senha pessoal antes de continuar.
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="nova-senha" className="sr-only">Nova Senha</label>
                            <input
                                id="nova-senha"
                                name="novaSenha"
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm"
                                placeholder="Nova Senha"
                                value={novaSenha}
                                onChange={(e) => setNovaSenha(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="confirma-senha" className="sr-only">Confirmar Nova Senha</label>
                            <input
                                id="confirma-senha"
                                name="confirmaSenha"
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm"
                                placeholder="Confirmar Nova Senha"
                                value={confirmaSenha}
                                onChange={(e) => setConfirmaSenha(e.target.value)}
                            />
                        </div>
                    </div>

                    {erro && <p className="text-center text-sm text-red-600">{erro}</p>}

                    <div className="flex flex-col space-y-3">
                        <button
                            type="submit"
                            disabled={carregando}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:bg-yellow-300"
                        >
                            {carregando ? 'Salvando...' : 'Definir Nova Senha'}
                        </button>
                        
                        <button
                            type="button"
                            onClick={logout}
                            className="text-sm text-gray-500 hover:text-gray-700 underline text-center"
                        >
                            Cancelar e Sair
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TelaAlterarSenhaForcada;
