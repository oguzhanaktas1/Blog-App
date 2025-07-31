interface TokenPayload {
  name: string;
  username: string;
  email: string;
  role?: string;
  userId?: number;
  profilePhoto?: string;
}

function base64UrlDecode(str: string) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return decodeURIComponent(escape(window.atob(str)));
}

export function getUserInfo(): {
  name: string | null;
  username: string | null;
  email: string | null;
  role: string | null;
  userId: number | null;
  profilePhoto: string | null;
} {
  const token = localStorage.getItem("token");
  if (!token)
    return {
      name: null,
      username: null,
      email: null,
      role: null,
      userId: null,
      profilePhoto: null,
    };

  try {
    const payload = token.split('.')[1];
    const decoded: TokenPayload = JSON.parse(base64UrlDecode(payload));
    return {
      name: decoded.name || null,
      username: decoded.name || null,
      email: decoded.email || null,
      role: decoded.role || null,
      userId: decoded.userId || null,
      profilePhoto: decoded.profilePhoto || null,
    };
  } catch {
    return {
      name: null,
      username: null,
      email: null,
      role: null,
      userId: null,
      profilePhoto: null,
    };
  }
}
