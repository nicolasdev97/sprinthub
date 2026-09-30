import { useMutation } from '@tanstack/react-query';

import { authService } from '../service';
import { LoginRequest, RegisterRequest } from '../type';
import { useAuth } from '../context';

export const useLogin = () => {
  const { setAuth } = useAuth();

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (response) => {
      setAuth(response.accessToken, response.user);
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
  });
};

export const useLogout = () => {
  const { logout } = useAuth();

  return useMutation({
    mutationFn: () => logout(),
  });
};
