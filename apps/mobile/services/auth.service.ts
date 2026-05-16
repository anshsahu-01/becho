import { ApiResponse, LoginResponse, RegisterInput, User } from "@/types";
import { apiRequest } from "./api";

export async function login(email: string, password: string) {
  const res = await apiRequest<ApiResponse<LoginResponse>>("/auth/login", {
    method: "POST",
    body: { email, password },
    token: null,
  });
  return res.data;
}

export async function register(input: RegisterInput) {
  const res = await apiRequest<ApiResponse<User>>("/auth/register", {
    method: "POST",
    body: input,
    token: null,
  });
  return res.data;
}

export async function getMe(token: string) {
  const res = await apiRequest<ApiResponse<User>>("/auth/me", { token });
  return res.data;
}
