import { httpClient } from '@/services/httpClient';

import {
  LoginRequest,
  LoginResponse,
  RefreshResponse,
  RegisterRequest,
  RegisterResponse,
} from '../type';

export const authService = {
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await httpClient.post<RegisterResponse>('/auth/register', data);

    return response.data;
  },

  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await httpClient.post<LoginResponse>('/auth/login', data);

    return response.data;
  },

  async refresh(): Promise<RefreshResponse> {
    const response = await httpClient.post<RefreshResponse>('/auth/refresh');

    return response.data;
  },

  async logout(): Promise<void> {
    await httpClient.post('/auth/logout');
  },
};
