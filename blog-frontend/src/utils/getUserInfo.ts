import {jwtDecode} from "jwt-decode";

interface TokenPayload {
  name: string;
  email: string;
}

export function getUserInfo(): { name: string | null; email: string | null } {
  const token = localStorage.getItem("token");
  if (!token) return { name: null, email: null };

  try {
    const decoded = jwtDecode<TokenPayload>(token);
    return {
      name: decoded.name || null,
      email: decoded.email || null,
    };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    return { name: null, email: null };
  }
}
