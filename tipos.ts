
// ========== REFERENCE DATA TYPES (from database tables) ==========

export interface Categoria {
    id: string;
    nome: string;
    descricao?: string;
    ativo: boolean;
}

export interface Localizacao {
    id: string;
    nome: string;
    endereco?: string;
    responsavel?: string;
    telefone?: string;
    ativo: boolean;
}

export interface TipoMovimentacao {
    id: string;
    nome: string;
    requerDevolucao: boolean;
    ativo: boolean;
}

export interface PerfilType {
    id: string;
    nome: string;
    descricao?: string;
    permissoes: any;
    ativo: boolean;
}

// ========== LEGACY ENUMS (kept for backwards compatibility) ==========

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
    categoriaId: string;  // UUID reference
    localizacaoId: string; // UUID reference
    sala: string;
    imagemTombo?: string | null; // Base64 (PNG apenas)
    fotoBem?: string | null;     // Base64 (JPEG apenas)
    // Joined data from API (optional, for display)
    categoria?: Categoria;
    localizacao?: Localizacao;
}

export interface Movimentacao {
    id: string;
    bemId: string; // UUID reference
    tipoMovimentacaoId: string; // UUID reference
    pessoa: string;
    contato: string;
    pastoral: string;
    dataEmprestimo: string;
    dataDevolucao: string | null;
    // Joined data from API (optional, for display)
    bem?: Bem;
    tipoMovimentacao?: TipoMovimentacao;
    // Legacy fields for compatibility
    tombo?: string; // Bem's tombo (for backwards compatibility)
    nomeItem?: string; // Bem's nome (for backwards compatibility)
}

export interface Usuario {
    id: string;
    email: string; // Usado como login
    emailRecuperacao?: string; // E-mail ativo para recuperação de senha
    perfilId: string; // UUID reference
    tempPassword?: boolean; // Se true, usuário deve alterar a senha
    // Joined data from API
    perfil?: PerfilType;
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

export interface ReferenceDataContextType {
    categorias: Categoria[];
    localizacoes: Localizacao[];
    tiposMovimentacao: TipoMovimentacao[];
    perfis: PerfilType[];
    carregando: boolean;
    erro: string | null;
    recarregar: () => Promise<void>;
}
