export function getUserEmail(): string | null {
    const token = localStorage.getItem("token");
    if (!token) return null;
  
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.email || null;
    } catch {
      return null;
    }
  }
  