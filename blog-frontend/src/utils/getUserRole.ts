import { jwtDecode } from "jwt-decode";

interface DecodedToken {
    userId: number;
    role: string;
    exp: number;
    iat: number;
  }
  
  export function getUserRole(): string | null {
    const token = localStorage.getItem("token");
    if (!token) return null;
  
    try {
      const decoded: DecodedToken = jwtDecode(token);
      return decoded.role;
    } catch {
      return null;
    }
  }
  