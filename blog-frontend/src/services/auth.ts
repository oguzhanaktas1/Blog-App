import axios from "../utils/axios";

type User = {
  id: number;
  name: string;
  username: string;
  email: string;
};

export interface AuthResponse {
  token: string;
  user: User;
}

export const signup = async (data: { name: string; username: string; email: string; password: string }): Promise<AuthResponse> => {
  const res = await axios.post("/auth/signup", data);
  return res.data as AuthResponse;
};

export const login = async (data: { email: string; password: string }): Promise<AuthResponse> => {
  const res = await axios.post("/auth/login", data);
  return res.data as AuthResponse;
};
