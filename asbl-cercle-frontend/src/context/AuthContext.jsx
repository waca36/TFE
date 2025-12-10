import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const saved = localStorage.getItem("auth");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return { user: null, token: null };
      }
    }
    return { user: null, token: null };
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (auth.token) {
        localStorage.setItem("auth", JSON.stringify(auth));
      } else {
        localStorage.removeItem("auth");
      }
    }
  }, [auth, isLoading]);

  const login = (user, token) => {
    setAuth({ user, token });
  };

  const logout = () => {
    setAuth({ user: null, token: null });
    localStorage.removeItem("auth");
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
