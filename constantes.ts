
import { Categoria, Localizacao, TipoMovimentacao, Perfil } from './tipos';

export const OPCOES_CATEGORIA = [
    { value: Categoria.MOVEL, label: 'Móvel' },
    { value: Categoria.OBJETO_LITURGICO, label: 'Objeto Litúrgico' },
    { value: Categoria.ELETRONICO, label: 'Eletrônico' },
];

export const OPCOES_LOCALIZACAO = [
    { value: Localizacao.IGREJA_MATRIZ, label: 'Igreja Matriz' },
    { value: Localizacao.IGREJA_PO, label: 'Igreja do P.O' },
    { value: Localizacao.IGREJA_PI, label: 'Igreja do P.I' },
];

export const OPCOES_TIPO_MOVIMENTACAO = [
    { value: TipoMovimentacao.EMPRESTIMO, label: 'Empréstimo' },
    { value: TipoMovimentacao.DEVOLUCAO, label: 'Devolução' },
];

export const OPCOES_PERFIL = [
    { value: Perfil.ADMIN, label: 'Administrador' },
    { value: Perfil.USER, label: 'Usuário Comum' },
];
