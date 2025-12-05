import api, { ApiResponse } from '../config/api';
import { Usuario } from '../tipos';

// Login request/response types
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: Usuario;
}

// Password recovery types
interface RecoverPasswordRequest {
  email: string;
  emailRecuperacao: string;
}

interface RecoverPasswordResponse {
  senhaTemporaria: string;
}

// Change password types
interface ChangePasswordRequest {
  novaSenha: string;
}

/**
 * Login user with email and password
 * @returns Usuario object and JWT token
 */
export const login = async (email: string, password: string): Promise<{ user: Usuario; token: string }> => {
  const response = await api.post<ApiResponse<LoginResponse>>('/api/auth/login', {
    email,
    password,
  });

  const { token, user } = response.data.data;

  // Store token in localStorage
  localStorage.setItem('auth_token', token);

  return { user, token };
};

/**
 * Logout current user
 * Clears JWT token from localStorage
 */
export const logout = async (): Promise<void> => {
  try {
    await api.post('/api/auth/logout');
  } catch (error) {
    // Even if API call fails, clear local token
    console.error('Logout API call failed:', error);
  } finally {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('usuario_logado_id'); // Remove old localStorage key if exists
  }
};

/**
 * Get current authenticated user
 * Used to restore session from JWT token
 */
export const getMe = async (): Promise<Usuario> => {
  const response = await api.get<ApiResponse<Usuario>>('/api/auth/me');
  return response.data.data;
};

/**
 * Recover password using email and recovery email
 * @returns Temporary password
 */
export const recoverPassword = async (
  email: string,
  emailRecuperacao: string
): Promise<string> => {
  const response = await api.post<ApiResponse<RecoverPasswordResponse>>(
    '/api/auth/recover-password',
    {
      email,
      emailRecuperacao,
    }
  );

  return response.data.data.senhaTemporaria;
};

/**
 * Change user password
 * @param novaSenha New password
 */
export const changePassword = async (novaSenha: string): Promise<void> => {
  await api.patch<ApiResponse<null>>('/api/auth/change-password', {
    novaSenha,
  });
};
