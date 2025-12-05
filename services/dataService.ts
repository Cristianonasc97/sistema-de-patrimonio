import api, { ApiResponse } from '../config/api';
import { Bem, Movimentacao } from '../tipos';

// Bem types
interface CreateBemRequest {
  tombo: string;
  nome: string;
  categoriaId: string;
  localizacaoId: string;
  sala: string;
  imagemTombo?: string | null;
  fotoBem?: string | null;
}

interface UpdateBemRequest {
  tombo?: string;
  nome?: string;
  categoriaId?: string;
  localizacaoId?: string;
  sala?: string;
  imagemTombo?: string | null;
  fotoBem?: string | null;
}

// Movimentacao types
interface CreateMovimentacaoRequest {
  bemId: string;
  tipoMovimentacaoId: string;
  pessoa: string;
  contato: string;
  pastoral: string;
  dataEmprestimo: string;
}

interface UpdateMovimentacaoRequest {
  pessoa?: string;
  contato?: string;
  pastoral?: string;
  dataEmprestimo?: string;
  dataDevolucao?: string | null;
}

// ========== BENS ==========

/**
 * Get all bens (assets)
 */
export const getBens = async (): Promise<Bem[]> => {
  const response = await api.get<ApiResponse<Bem[]>>('/api/bens');
  return response.data.data;
};

/**
 * Get bem by ID
 */
export const getBemById = async (id: string): Promise<Bem> => {
  const response = await api.get<ApiResponse<Bem>>(`/api/bens/${id}`);
  return response.data.data;
};

/**
 * Get bem by tombo (catalogue number)
 */
export const getBemByTombo = async (tombo: string): Promise<Bem> => {
  const response = await api.get<ApiResponse<Bem>>(`/api/bens/tombo/${tombo}`);
  return response.data.data;
};

/**
 * Create new bem
 */
export const addBem = async (dados: CreateBemRequest): Promise<Bem> => {
  const response = await api.post<ApiResponse<Bem>>('/api/bens', dados);
  return response.data.data;
};

/**
 * Update existing bem
 */
export const updateBem = async (id: string, dados: UpdateBemRequest): Promise<Bem> => {
  const response = await api.patch<ApiResponse<Bem>>(`/api/bens/${id}`, dados);
  return response.data.data;
};

/**
 * Delete bem
 */
export const deleteBem = async (id: string): Promise<void> => {
  await api.delete(`/api/bens/${id}`);
};

// ========== MOVIMENTACOES ==========

/**
 * Get all movimentacoes (movements/loans)
 */
export const getMovimentacoes = async (): Promise<Movimentacao[]> => {
  const response = await api.get<ApiResponse<Movimentacao[]>>('/api/movimentacoes');
  return response.data.data;
};

/**
 * Get active loans (movimentacoes without dataDevolucao)
 */
export const getActiveLoans = async (): Promise<Movimentacao[]> => {
  const response = await api.get<ApiResponse<Movimentacao[]>>('/api/movimentacoes/active');
  return response.data.data;
};

/**
 * Get movimentacao by ID
 */
export const getMovimentacaoById = async (id: string): Promise<Movimentacao> => {
  const response = await api.get<ApiResponse<Movimentacao>>(`/api/movimentacoes/${id}`);
  return response.data.data;
};

/**
 * Create new movimentacao (loan/movement)
 */
export const addMovimentacao = async (dados: CreateMovimentacaoRequest): Promise<Movimentacao> => {
  const response = await api.post<ApiResponse<Movimentacao>>('/api/movimentacoes', dados);
  return response.data.data;
};

/**
 * Update existing movimentacao
 */
export const updateMovimentacao = async (
  id: string,
  dados: UpdateMovimentacaoRequest
): Promise<Movimentacao> => {
  const response = await api.patch<ApiResponse<Movimentacao>>(`/api/movimentacoes/${id}`, dados);
  return response.data.data;
};

/**
 * Register return of a loaned item
 * Convenience endpoint that sets dataDevolucao to current date
 */
export const registerReturn = async (id: string): Promise<Movimentacao> => {
  const response = await api.post<ApiResponse<Movimentacao>>(`/api/movimentacoes/${id}/return`);
  return response.data.data;
};
