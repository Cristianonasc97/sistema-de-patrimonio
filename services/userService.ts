import api, { ApiResponse } from '../config/api';
import { Usuario } from '../tipos';

// User creation/update types
interface CreateUserRequest {
  email: string;
  password: string;
  perfilId: string;
  emailRecuperacao?: string;
}

interface UpdateUserRequest {
  email?: string;
  perfilId?: string;
  emailRecuperacao?: string;
  ativo?: boolean;
}

/**
 * Get all users (admin only)
 */
export const getUsuarios = async (): Promise<Usuario[]> => {
  const response = await api.get<ApiResponse<Usuario[]>>('/api/users');
  return response.data.data;
};

/**
 * Get user by ID
 */
export const getUsuarioPorId = async (id: string): Promise<Usuario> => {
  const response = await api.get<ApiResponse<Usuario>>(`/api/users/${id}`);
  return response.data.data;
};

/**
 * Create new user (admin only)
 */
export const addUsuario = async (dados: CreateUserRequest): Promise<Usuario> => {
  const response = await api.post<ApiResponse<Usuario>>('/api/users', dados);
  return response.data.data;
};

/**
 * Update existing user (admin only)
 */
export const updateUsuario = async (id: string, dados: UpdateUserRequest): Promise<Usuario> => {
  const response = await api.patch<ApiResponse<Usuario>>(`/api/users/${id}`, dados);
  return response.data.data;
};

/**
 * Delete user (admin only)
 */
export const deleteUsuario = async (id: string): Promise<void> => {
  await api.delete(`/api/users/${id}`);
};
