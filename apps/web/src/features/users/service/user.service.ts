import { httpClient } from '@/services';

import { User, UpdateUserRequest, DeleteUserRequest } from '../types';

export const userService = {
  async getCurrentUser(): Promise<User> {
    const response = await httpClient.get<User>('/users/me');

    return response.data;
  },

  async updateCurrentUser(data: UpdateUserRequest): Promise<User> {
    const response = await httpClient.patch<User>('/users/me', data);

    return response.data;
  },

  async deleteCurrentUser(data: DeleteUserRequest): Promise<void> {
    await httpClient.delete('/users/me', {
      data,
    });
  },
};
