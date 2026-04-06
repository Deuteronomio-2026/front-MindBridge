import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  institutionalId: number;
}

export interface RegisterRequest {
  name: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: 'PATIENT' | 'PSYCHOLOGIST' | 'ADMIN';
  identificationType?: string;
  identificationNumber?: string;
  address?: string;
  // Campos específicos para psicólogo
  professionalLicense?: string;
  specialization?: string;
  yearsOfExperience?: number;
  languages?: string[];
  biography?: string;
  officeLocation?: string;
  consultationFee?: number;
  consultationDuration?: number;
}

export const authService = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await axios.post(`${API_BASE_URL}/user/auth/login`, credentials);
    return response.data;
  },
  register: async (userData: RegisterRequest): Promise<any> => {
    const response = await axios.post(`${API_BASE_URL}/user/auth/register`, userData);
    return response.data;
  },
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await axios.post(`${API_BASE_URL}/user/auth/refresh`, { refreshToken });
    return response.data;
  }
};