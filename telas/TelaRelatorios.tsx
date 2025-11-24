
import React, { useState, useEffect } from 'react';
import { Pagina, Bem, Movimentacao } from '../tipos';
import * as api from '../servicos/bancoDados';

declare const jspdf: any;
declare const XLSX: any;

interface PropsTelaRelatorios {
    aoNavegar: (pagina: Pagina) => void;
}

const TelaRelatorios: React.FC<PropsTelaRelatorios> = ({ aoNavegar }) => {
    const [bens, setBens] = useState<Bem[]>([]);
    const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        const carregarDados = async () => {
            setCarregando(true);
            const dadosBens = await api.getBens();
            const dadosMov = await api.getMovimentacoes();
            setBens(dadosBens);
            setMovimentacoes(dadosMov);
            setCarregando(false);
        };
        carregarDados();
    }, []);

    // --- Funções de Exportação de Bens ---
    const exportarBensParaPDF = () => {
        const doc = new jspdf.jsPDF();
        doc.text("Relatório de Bens Cadastrados", 14, 16);
        (doc as any).autoTable({
            startY: 20,
            head: [['Tombo', 'Nome', 'Categoria', 'Localização', 'Sala']],
            body: bens.map(b => [b.tombo, b.nome, b.categoria, b.localizacao, b.sala]),
        });
        doc.save('relatorio_bens.pdf');
    };

    const exportarBensParaExcel = () => {
        const wb = XLSX.utils.book_new();
        const wsBens = XLSX.utils.json_to_sheet(bens.map(b => ({
            Tombo: b.tombo, Nome: b.nome, Categoria: b.categoria, Localizacao: b.localizacao, Sala: b.sala
        })));
        XLSX.utils.book_append_sheet(wb, wsBens, "Bens");
        XLSX.writeFile(wb, "relatorio_bens.xlsx");
    };

    // --- Funções de Exportação de Movimentações ---
    const exportarMovimentacoesParaPDF = () => {
        const doc = new jspdf.jsPDF();
        doc.text("Relatório de Movimentações", 14, 16);
        (doc as any).autoTable({
            startY: 20,
            head: [['Tombo', 'Item', 'Pessoa', 'Tipo', 'Data Empréstimo', 'Data Devolução']],
            body: movimentacoes.map(m => [m.tombo, m.nomeItem, m.pessoa, m.tipo, m.dataEmprestimo, m.dataDevolucao || 'N/A']),
        });
        doc.save('relatorio_movimentacoes.pdf');
    };

    const exportarMovimentacoesParaExcel = () => {
        const wb = XLSX.utils.book_new();
        const wsMovs = XLSX.utils.json_to_sheet(movimentacoes.map(m => ({
            Tombo: m.tombo, Item: m.nomeItem, Pessoa: m.pessoa, Contato: m.contato, Pastoral: m.pastoral, Tipo: m.tipo, "Data Emprestimo": m.dataEmprestimo, "Data Devolucao": m.dataDevolucao
        })));
        XLSX.utils.book_append_sheet(wb, wsMovs, "Movimentações");
        XLSX.writeFile(wb, "relatorio_movimentacoes.xlsx");
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Gerar Relatórios</h1>
                <button onClick={() => aoNavegar(Pagina.MENU_PRINCIPAL)} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">Voltar</button>
            </div>
            
            {carregando ? (
                <p className="text-center mt-10">Carregando dados para os relatórios...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {/* Cartão Bens */}
                    <div className="bg-gray-50 p-6 rounded-lg border">
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">Relatório de Bens Cadastrados</h2>
                        <p className="text-gray-600 text-sm mb-4">Gera um arquivo contendo a lista de todos os bens do patrimônio.</p>
                        <div className="flex space-x-2">
                            <button onClick={exportarBensParaPDF} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm">Gerar PDF</button>
                            <button onClick={exportarBensParaExcel} className="flex-1 bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 text-sm">Gerar Excel</button>
                        </div>
                    </div>

                    {/* Cartão Movimentações */}
                     <div className="bg-gray-50 p-6 rounded-lg border">
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">Relatório de Movimentações</h2>
                        <p className="text-gray-600 text-sm mb-4">Gera um arquivo com o histórico completo de empréstimos e devoluções.</p>
                        <div className="flex space-x-2">
                             <button onClick={exportarMovimentacoesParaPDF} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm">Gerar PDF</button>
                            <button onClick={exportarMovimentacoesParaExcel} className="flex-1 bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 text-sm">Gerar Excel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TelaRelatorios;
