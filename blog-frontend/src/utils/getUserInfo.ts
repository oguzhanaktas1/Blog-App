interface TokenPayload {
  name: string;
  email: string;
  role?: string;
  userId?: number;
}

function base64UrlDecode(str: string) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return decodeURIComponent(escape(window.atob(str)));
}

export function getUserInfo(): { name: string | null; email: string | null; role: string | null; userId: number | null } {
  const token = localStorage.getItem("token");
  if (!token) return { name: null, email: null, role: null, userId: null };

  try {
    const payload = token.split('.')[1];
    const decoded: TokenPayload = JSON.parse(base64UrlDecode(payload));
    return {
      name: decoded.name || null,
      email: decoded.email || null,
      role: decoded.role || null,
      userId: decoded.userId || null,
    };
  } catch {
    return { name: null, email: null, role: null, userId: null };
  }
}
