import api, { ApiResponse } from '../config/api';
import { Categoria, Localizacao, TipoMovimentacao, PerfilType } from '../tipos';

/**
 * Get all categorias (asset categories)
 */
export const getCategorias = async (): Promise<Categoria[]> => {
  const response = await api.get<ApiResponse<Categoria[]>>('/api/categorias');
  return response.data.data;
};

/**
 * Get all localizacoes (locations)
 */
export const getLocalizacoes = async (): Promise<Localizacao[]> => {
  const response = await api.get<ApiResponse<Localizacao[]>>('/api/localizacoes');
  return response.data.data;
};

/**
 * Get all tipos de movimentacao (movement types)
 */
export const getTiposMovimentacao = async (): Promise<TipoMovimentacao[]> => {
  const response = await api.get<ApiResponse<TipoMovimentacao[]>>('/api/tipos-movimentacao');
  return response.data.data;
};

/**
 * Get all perfis (user roles/profiles)
 */
export const getPerfis = async (): Promise<PerfilType[]> => {
  const response = await api.get<ApiResponse<PerfilType[]>>('/api/perfis');
  return response.data.data;
};
