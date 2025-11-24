import { Usuario, Perfil, Bem, Movimentacao, TipoMovimentacao } from '../tipos';

// Interface para o objeto Database do SQL.js
interface Database {
    run(sql: string, params?: any[] | object): void;
    exec(sql: string): Array<{ columns: string[], values: any[][] }>;
    prepare(sql: string): any;
    export(): Uint8Array;
    close(): void;
}

// Declaração global para evitar erros de TypeScript com a lib externa
declare global {
    interface Window {
        initSqlJs: (config?: any) => Promise<any>;
        dcodeIO: any; // Namespace do bcryptjs
    }
}

declare const initSqlJs: (config?: any) => Promise<any>;

let db: Database | null = null;

// Configurações do IndexedDB
const IDB_NAME = 'patrimonio_db';
const IDB_VERSION = 1;
const STORE_NAME = 'arquivos';
const DB_KEY = 'sqlite_file';

// --- Helpers de Criptografia ---

const getBcrypt = () => {
    if (window.dcodeIO && window.dcodeIO.bcrypt) {
        return window.dcodeIO.bcrypt;
    }
    console.warn("Biblioteca bcryptjs não carregada. Usando modo inseguro (fallback).");
    return null;
};

const hashSenha = (senha: string): string => {
    const bcrypt = getBcrypt();
    if (bcrypt) {
        return bcrypt.hashSync(senha, 10);
    }
    return senha; // Fallback inseguro apenas se a lib falhar
};

const compararSenha = (senhaDigitada: string, hashSalvo: string): boolean => {
    const bcrypt = getBcrypt();
    if (bcrypt) {
        // Verifica se é um hash válido do bcrypt (começa com $2a$ ou $2b$)
        if (hashSalvo.startsWith('$2')) {
            return bcrypt.compareSync(senhaDigitada, hashSalvo);
        }
        // Fallback para suportar senhas antigas em texto plano antes da migração
        return senhaDigitada === hashSalvo;
    }
    return senhaDigitada === hashSalvo;
};

// --- Funções Auxiliares do IndexedDB ---

const abrirIDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(IDB_NAME, IDB_VERSION);

        request.onerror = (event) => {
            console.error("Erro ao abrir IndexedDB", event);
            reject("Erro ao abrir banco de dados local");
        };

        request.onsuccess = (event: any) => {
            resolve(event.target.result);
        };

        request.onupgradeneeded = (event: any) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
    });
};

const salvarNoIDB = async (data: Uint8Array): Promise<void> => {
    const idb = await abrirIDB();
    return new Promise((resolve, reject) => {
        const transaction = idb.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(data, DB_KEY);

        request.onsuccess = () => resolve();
        request.onerror = (e) => reject(e);
    });
};

const carregarDoIDB = async (): Promise<Uint8Array | null> => {
    try {
        const idb = await abrirIDB();
        return new Promise((resolve, reject) => {
            const transaction = idb.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(DB_KEY);

            request.onsuccess = (event: any) => {
                const result = event.target.result;
                resolve(result ? result : null);
            };
            request.onerror = (e) => reject(e);
        });
    } catch (e) {
        console.warn("Erro ao tentar carregar do IDB (pode ser o primeiro acesso):", e);
        return null;
    }
};

// --- Gerenciamento do SQLite ---

// Salvar o estado atual do banco no IndexedDB
const salvarBD = async (): Promise<boolean> => {
    if (!db) return false;
    try {
        // TypeScript safe check
        const database = db;
        const data = database.export();
        await salvarNoIDB(data);
        return true;
    } catch (e) {
        console.error("Erro ao salvar o banco de dados no IndexedDB:", e);
        return false;
    }
};

// Auxiliar para gerar UUID
const gerarId = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

// Inicializar Banco de Dados
const promessaInicializacao = (async () => {
    // Verifica se a função global initSqlJs existe (carregada via script tag no index.html)
    const initFunc = (window as any).initSqlJs || (typeof initSqlJs !== 'undefined' ? initSqlJs : null);

    if (!initFunc) {
        console.error("CRÍTICO: A biblioteca sql.js não foi carregada. Verifique o index.html.");
        return null;
    }

    try {
        const SQL = await initFunc({
            locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
        });

        let dadosIniciais: Uint8Array | null = null;
        
        try {
            dadosIniciais = await carregarDoIDB();
        } catch (e) {
            console.warn("Não foi possível carregar do IndexedDB, criando novo banco.", e);
        }
        
        if (dadosIniciais) {
            try {
                db = new SQL.Database(dadosIniciais);
            } catch (e) {
                console.error("Arquivo corrompido, criando novo banco:", e);
                db = new SQL.Database();
            }
        } else {
            db = new SQL.Database();
        }

        // Garantir Esquema do Banco
        if (db) {
            // Alias seguro para TypeScript
            const database = db;
            database.run(`
                CREATE TABLE IF NOT EXISTS usuarios (
                    id TEXT PRIMARY KEY,
                    email TEXT UNIQUE,
                    password TEXT,
                    perfil TEXT,
                    emailRecuperacao TEXT,
                    tempPassword INTEGER DEFAULT 0
                );
            `);
            
            // MIGRATION: Tentar adicionar coluna emailRecuperacao se ela não existir
            try {
                database.run("ALTER TABLE usuarios ADD COLUMN emailRecuperacao TEXT");
            } catch (e) { /* Coluna provavelmente já existe */ }

            // MIGRATION: Tentar adicionar coluna tempPassword se ela não existir
            try {
                database.run("ALTER TABLE usuarios ADD COLUMN tempPassword INTEGER DEFAULT 0");
            } catch (e) { /* Coluna provavelmente já existe */ }

            database.run(`
                CREATE TABLE IF NOT EXISTS bens (
                    id TEXT PRIMARY KEY,
                    tombo TEXT UNIQUE,
                    nome TEXT,
                    categoria TEXT,
                    localizacao TEXT,
                    sala TEXT,
                    imagemTombo TEXT,
                    fotoBem TEXT
                );
            `);
            
            // MIGRATION: Tentar adicionar colunas se elas não existirem (para bancos antigos)
            try {
                database.run("ALTER TABLE bens ADD COLUMN imagemTombo TEXT");
            } catch (e) { /* Coluna provavelmente já existe */ }
            
            try {
                database.run("ALTER TABLE bens ADD COLUMN fotoBem TEXT");
            } catch (e) { /* Coluna provavelmente já existe */ }

            database.run(`
                CREATE TABLE IF NOT EXISTS movimentacoes (
                    id TEXT PRIMARY KEY,
                    tombo TEXT,
                    nomeItem TEXT,
                    pessoa TEXT,
                    contato TEXT,
                    pastoral TEXT,
                    tipo TEXT,
                    dataEmprestimo TEXT,
                    dataDevolucao TEXT
                );
            `);

            // Seed Admin
            const res = database.exec("SELECT count(*) FROM usuarios WHERE email = 'admin@email.com'");
            if (res.length === 0 || res[0].values[0][0] === 0) {
                // Ao criar o admin padrão, já criamos com a senha hashada
                const senhaHash = hashSenha('admin123');
                database.run(`INSERT INTO usuarios (id, email, password, perfil, emailRecuperacao, tempPassword) VALUES (?, ?, ?, ?, ?, ?)`, 
                    [gerarId(), 'admin@email.com', senhaHash, Perfil.ADMIN, 'admin@patrimonio.com', 0]
                );
                await salvarBD();
            }
        }
        
        return db;
    } catch (err) {
        console.error("Erro fatal na inicialização do SQL.js:", err);
        return null;
    }
})().catch(e => {
    console.error("Erro não tratado na Promessa de Inicialização do Banco:", e);
    return null;
});

const garantirBd = async (): Promise<Database> => {
    if (!db) await promessaInicializacao;
    if (!db) throw new Error("Falha ao inicializar banco de dados. Tente recarregar a página.");
    return db;
};

// --- FUNÇÕES DA API ---

// Autenticação
export const login = async (email: string, pass: string): Promise<Usuario> => {
    const database = await garantirBd();
    // Buscamos apenas pelo email primeiro
    const stmt = database.prepare("SELECT id, email, password, perfil, emailRecuperacao, tempPassword FROM usuarios WHERE email=:email");
    const result = stmt.getAsObject({':email': email});
    stmt.free();
    
    if (result && result.id) {
        // Verificar Senha (Hash ou Texto Plano legado)
        const senhaSalva = result.password as string;
        const senhaValida = compararSenha(pass, senhaSalva);

        if (senhaValida) {
            // MIGRATION ON LOGIN:
            // Se a senha salva não era um hash (texto plano) e o login foi bem sucedido,
            // atualizamos para hash agora para garantir segurança futura.
            if (!senhaSalva.startsWith('$2')) {
                console.log("Migrando senha de usuário para formato criptografado...");
                const novoHash = hashSenha(pass);
                database.run("UPDATE usuarios SET password = ? WHERE id = ?", [novoHash, result.id]);
                await salvarBD();
            }

            return { 
                id: result.id, 
                email: result.email, 
                perfil: result.perfil,
                emailRecuperacao: result.emailRecuperacao,
                tempPassword: result.tempPassword === 1
            } as Usuario;
        }
    }
    
    throw new Error('Credenciais inválidas ou usuário não encontrado.');
};

export const getUsuarioPorId = async (id: string): Promise<Usuario | null> => {
    try {
        const database = await garantirBd();
        const stmt = database.prepare("SELECT id, email, perfil, emailRecuperacao, tempPassword FROM usuarios WHERE id=:id");
        const result = stmt.getAsObject({':id': id});
        stmt.free();

        if (result && result.id) {
            return { 
                id: result.id, 
                email: result.email, 
                perfil: result.perfil,
                emailRecuperacao: result.emailRecuperacao,
                tempPassword: result.tempPassword === 1
            } as Usuario;
        }
        return null;
    } catch (e) {
        console.error("Erro ao recuperar usuário por ID:", e);
        return null;
    }
};

export const logout = async (): Promise<void> => {
    return Promise.resolve();
};

export const recuperarSenha = async (email: string, emailRecuperacao: string): Promise<string> => {
    const database = await garantirBd();
    
    const stmt = database.prepare("SELECT id, emailRecuperacao FROM usuarios WHERE email=:email");
    const result = stmt.getAsObject({':email': email});
    stmt.free();

    if (!result || !result.id) {
        throw new Error('Usuário não encontrado.');
    }

    if (result.emailRecuperacao !== emailRecuperacao) {
        throw new Error('E-mail de recuperação incorreto.');
    }

    // Gerar senha temporária
    const senhaTemporaria = Math.random().toString(36).slice(-6).toUpperCase();
    
    // Hash da senha temporária para salvar no banco
    const senhaHash = hashSenha(senhaTemporaria);

    // Atualizar no banco e marcar como SENHA TEMPORÁRIA (tempPassword = 1)
    database.run("UPDATE usuarios SET password = ?, tempPassword = 1 WHERE id = ?", [senhaHash, result.id]);
    
    if (!(await salvarBD())) {
        throw new Error('Erro ao salvar nova senha no banco.');
    }

    // Retorna a senha em texto plano APENAS para ser mostrada na tela uma única vez
    return senhaTemporaria;
};

export const alterarSenha = async (idUsuario: string, novaSenha: string): Promise<void> => {
    const database = await garantirBd();
    
    const senhaHash = hashSenha(novaSenha);

    // Ao alterar senha, remove a marcação de senha temporária (tempPassword = 0)
    database.run("UPDATE usuarios SET password = ?, tempPassword = 0 WHERE id = ?", [senhaHash, idUsuario]);
    if (!(await salvarBD())) {
        throw new Error('Erro ao salvar nova senha no banco.');
    }
};

// Usuários
export const getUsuarios = async (): Promise<Usuario[]> => {
    const database = await garantirBd();
    const resultado = database.exec("SELECT id, email, perfil, emailRecuperacao, tempPassword FROM usuarios");
    if (resultado.length === 0) return [];
    
    return resultado[0].values.map((linha: any[]) => ({
        id: linha[0],
        email: linha[1],
        perfil: linha[2] as Perfil,
        emailRecuperacao: linha[3] || '',
        tempPassword: linha[4] === 1
    }));
};

export const addUsuario = async (dados: { email: string, password: string, perfil: Perfil, emailRecuperacao: string }): Promise<Usuario> => {
    const database = await garantirBd();
    
    const stmt = database.prepare("SELECT id FROM usuarios WHERE email=:email");
    const check = stmt.getAsObject({':email': dados.email});
    stmt.free();

    if (check && check.id) {
        throw new Error('Usuário com este Login/Email já existe.');
    }

    const novoId = gerarId();
    const senhaHash = hashSenha(dados.password);

    // tempPassword padrão é 0
    database.run(`INSERT INTO usuarios (id, email, password, perfil, emailRecuperacao, tempPassword) VALUES (?, ?, ?, ?, ?, 0)`, 
        [novoId, dados.email, senhaHash, dados.perfil, dados.emailRecuperacao]
    );
    
    const salvou = await salvarBD();
    if (!salvou) {
        database.run(`DELETE FROM usuarios WHERE id = ?`, [novoId]);
        throw new Error('Erro crítico: Não foi possível salvar o usuário no disco.');
    }

    return { id: novoId, email: dados.email, perfil: dados.perfil, emailRecuperacao: dados.emailRecuperacao, tempPassword: false };
};

export const deleteUsuario = async (id: string): Promise<void> => {
    const database = await garantirBd();
    
    const stmt = database.prepare("SELECT email FROM usuarios WHERE id=:id");
    const checkUsuario = stmt.getAsObject({':id': id});
    stmt.free();
    
    if (!checkUsuario || !checkUsuario.email) {
         throw new Error('Usuário não encontrado.');
    }

    if (checkUsuario.email === 'admin@email.com') {
        throw new Error('Não é possível excluir o usuário administrador padrão.');
    }

    database.run(`DELETE FROM usuarios WHERE id = ?`, [id]);
    
    if (!(await salvarBD())) {
        throw new Error('Atenção: Usuário excluído da sessão, mas houve erro ao salvar no disco.');
    }
};

// Bens
export const getBens = async (): Promise<Bem[]> => {
    const database = await garantirBd();
    const resultado = database.exec("SELECT * FROM bens");
    if (resultado.length === 0) return [];

    const colunas = resultado[0].columns;
    return resultado[0].values.map((linha: any[]) => {
        let obj: any = {};
        colunas.forEach((col, index) => {
            obj[col] = linha[index];
        });
        return obj as Bem;
    });
};

export const addBem = async (dadosBem: Omit<Bem, 'id'>): Promise<Bem> => {
    const database = await garantirBd();
    
    const stmt = database.prepare("SELECT id FROM bens WHERE tombo=:tombo");
    const check = stmt.getAsObject({':tombo': dadosBem.tombo});
    stmt.free();

    if (check && check.id) {
        throw new Error('Já existe um item com este número de tombo.');
    }

    const novoId = gerarId();
    database.run(
        `INSERT INTO bens (id, tombo, nome, categoria, localizacao, sala, imagemTombo, fotoBem) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            novoId, 
            dadosBem.tombo, 
            dadosBem.nome, 
            dadosBem.categoria, 
            dadosBem.localizacao, 
            dadosBem.sala,
            dadosBem.imagemTombo || null,
            dadosBem.fotoBem || null
        ]
    );
    
    if (!(await salvarBD())) {
        database.run(`DELETE FROM bens WHERE id = ?`, [novoId]);
        throw new Error('Erro: Falha ao salvar no disco. Tente recarregar a página.');
    }

    return { id: novoId, ...dadosBem };
};

export const updateBem = async (dadosBem: Bem): Promise<Bem> => {
    const database = await garantirBd();
    database.run(
        `UPDATE bens SET tombo = ?, nome = ?, categoria = ?, localizacao = ?, sala = ?, imagemTombo = ?, fotoBem = ? WHERE id = ?`,
        [
            dadosBem.tombo, 
            dadosBem.nome, 
            dadosBem.categoria, 
            dadosBem.localizacao, 
            dadosBem.sala, 
            dadosBem.imagemTombo || null,
            dadosBem.fotoBem || null,
            dadosBem.id
        ]
    );
    await salvarBD();
    return dadosBem;
};

export const deleteBem = async (id: string): Promise<void> => {
    const database = await garantirBd();
    
    const stmtBem = database.prepare("SELECT tombo FROM bens WHERE id=:id");
    const resBem = stmtBem.getAsObject({':id': id});
    stmtBem.free();

    if (!resBem || !resBem.tombo) {
        throw new Error('Item não encontrado no banco de dados.');
    }
    
    const tombo = resBem.tombo;

    // Verificar empréstimos ativos
    const stmtCheck = database.prepare("SELECT id FROM movimentacoes WHERE tombo=$tombo AND dataDevolucao IS NULL");
    stmtCheck.bind({'$tombo': tombo});
    if (stmtCheck.step()) {
        stmtCheck.free();
        throw new Error('Não é possível excluir um item que possui um empréstimo ativo.');
    }
    stmtCheck.free();

    database.run(`DELETE FROM bens WHERE id = ?`, [id]);
    
    if (!(await salvarBD())) {
        throw new Error('Atenção: Item excluído, mas houve erro ao salvar no disco.');
    }
};

// Movimentações
export const getMovimentacoes = async (): Promise<Movimentacao[]> => {
    const database = await garantirBd();
    const resultado = database.exec("SELECT * FROM movimentacoes");
    if (resultado.length === 0) return [];

    const colunas = resultado[0].columns;
    return resultado[0].values.map((linha: any[]) => {
        let obj: any = {};
        colunas.forEach((col, index) => {
            obj[col] = linha[index];
        });
        return obj as Movimentacao;
    });
};

export const addMovimentacao = async (dadosMov: Omit<Movimentacao, 'id'>): Promise<Movimentacao> => {
    const database = await garantirBd();

    const stmtBem = database.prepare("SELECT id FROM bens WHERE tombo=:tombo");
    const checkBem = stmtBem.getAsObject({':tombo': dadosMov.tombo});
    stmtBem.free();

    if (!checkBem || !checkBem.id) {
        throw new Error('Item com este tombo não existe.');
    }

    if (dadosMov.tipo === TipoMovimentacao.DEVOLUCAO) {
        // Buscar empréstimo ativo
        const stmtLoan = database.prepare("SELECT id, nomeItem, pessoa, contato, pastoral, dataEmprestimo FROM movimentacoes WHERE tombo=:tombo AND dataDevolucao IS NULL");
        const loanResult = stmtLoan.getAsObject({':tombo': dadosMov.tombo});
        stmtLoan.free();
        
        if (loanResult && loanResult.id) {
            const idEmprestimo = loanResult.id;
            const dataDev = dadosMov.dataDevolucao || new Date().toISOString().split('T')[0];
            
            database.run(`UPDATE movimentacoes SET dataDevolucao = ? WHERE id = ?`, [dataDev, idEmprestimo]);
            
            if (!(await salvarBD())) throw new Error('Erro ao salvar devolução no disco.');
            
            return {
                id: idEmprestimo,
                tombo: dadosMov.tombo,
                nomeItem: loanResult.nomeItem,
                pessoa: loanResult.pessoa,
                contato: loanResult.contato,
                pastoral: loanResult.pastoral,
                tipo: TipoMovimentacao.EMPRESTIMO,
                dataEmprestimo: loanResult.dataEmprestimo,
                dataDevolucao: dataDev
            } as Movimentacao;

        } else {
            throw new Error('Não foi encontrado um empréstimo ativo para este item.');
        }
    } else {
        // Empréstimo
        const stmtCheck = database.prepare("SELECT id FROM movimentacoes WHERE tombo=:tombo AND dataDevolucao IS NULL");
        const checkLoan = stmtCheck.getAsObject({':tombo': dadosMov.tombo});
        stmtCheck.free();

        if (checkLoan && checkLoan.id) {
            throw new Error('Este item já está emprestado.');
        }

        const novoId = gerarId();
        database.run(
            `INSERT INTO movimentacoes (id, tombo, nomeItem, pessoa, contato, pastoral, tipo, dataEmprestimo, dataDevolucao) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [novoId, dadosMov.tombo, dadosMov.nomeItem, dadosMov.pessoa, dadosMov.contato, dadosMov.pastoral, dadosMov.tipo, dadosMov.dataEmprestimo, null]
        );
        
        if (!(await salvarBD())) {
            database.run(`DELETE FROM movimentacoes WHERE id = ?`, [novoId]);
            throw new Error('Erro: Falha ao salvar no disco.');
        }

        return { id: novoId, ...dadosMov, dataDevolucao: null };
    }
};