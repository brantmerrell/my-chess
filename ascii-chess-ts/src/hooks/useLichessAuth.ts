import { useState, useEffect } from "react";
import { lichessAuth } from "../services/lichess/auth";

interface UseLichessAuthReturn {
  isAuthenticated: boolean;
  username: string | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
  refreshAuth: () => Promise<void>;
}

export const useLichessAuth = (): UseLichessAuthReturn => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuthStatus = async () => {
    setLoading(true);
    try {
      if (lichessAuth.isAuthenticated()) {
        const user = await lichessAuth.getCurrentUser();
        if (user) {
          setIsAuthenticated(true);
          setUsername(user.username);
        } else {
          setIsAuthenticated(false);
          setUsername(null);
        }
      } else {
        setIsAuthenticated(false);
        setUsername(null);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      setIsAuthenticated(false);
      setUsername(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "lichess_access_token") {
        checkAuthStatus();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const login = () => {
    lichessAuth.startAuth();
  };

  const logout = () => {
    lichessAuth.logout();
    setIsAuthenticated(false);
    setUsername(null);
  };

  return {
    isAuthenticated,
    username,
    loading,
    login,
    logout,
    refreshAuth: checkAuthStatus,
  };
};
