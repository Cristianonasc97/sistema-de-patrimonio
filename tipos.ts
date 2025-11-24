
export enum Categoria {
    MOVEL = 'móvel',
    OBJETO_LITURGICO = 'objeto litúrgico',
    ELETRONICO = 'eletrônico',
}

export enum Localizacao {
    IGREJA_MATRIZ = 'igreja matriz',
    IGREJA_PO = 'igreja do P.O',
    IGREJA_PI = 'igreja do P.I',
}

export enum TipoMovimentacao {
    EMPRESTIMO = 'empréstimo',
    DEVOLUCAO = 'devolução',
}

export enum Perfil {
    ADMIN = 'ADMIN',
    USER = 'USER',
}

export enum Pagina {
    LOGIN = 'LOGIN',
    MENU_PRINCIPAL = 'MENU_PRINCIPAL',
    BENS = 'BENS',
    MOVIMENTACOES = 'MOVIMENTACOES',
    INVENTARIO = 'INVENTARIO',
    RELATORIOS = 'RELATORIOS',
    USUARIOS = 'USUARIOS',
}

export interface Bem {
    id: string;
    tombo: string;
    nome: string;
    categoria: Categoria;
    localizacao: Localizacao;
    sala: string;
    imagemTombo?: string | null; // Base64 (PNG apenas)
    fotoBem?: string | null;     // Base64 (JPEG apenas)
}

export interface Movimentacao {
    id: string;
    tombo: string;
    nomeItem: string;
    pessoa: string;
    contato: string;
    pastoral: string;
    tipo: TipoMovimentacao;
    dataEmprestimo: string;
    dataDevolucao: string | null;
}

export interface Usuario {
    id: string;
    email: string; // Usado como login
    emailRecuperacao?: string; // E-mail ativo para recuperação de senha
    perfil: Perfil;
    tempPassword?: boolean; // Se true, usuário deve alterar a senha
}

export interface ContextoAutenticacaoTipo {
    usuario: Usuario | null;
    login: (email: string, pass: string) => Promise<void>;
    logout: () => void;
    atualizarDadosLocais: (dados: Partial<Usuario>) => void;
    carregando: boolean;
    verificandoSessao: boolean;
    erro: string | null;
}
