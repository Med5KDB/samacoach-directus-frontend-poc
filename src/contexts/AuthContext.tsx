import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '../services/api';

interface User {
  id: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessToken: string, refreshToken?: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = (accessToken: string, refreshToken?: string) => {
    localStorage.setItem('access_token', accessToken);
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
    refreshUser();
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    if (!apiService.isAuthenticated()) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiService.getMe();
      // Notre endpoint personnalisé retourne { success: true, data: {...} }
      if (response.success && response.data) {
        setUser(response.data);
      } else if (response.data) {
        // Fallback pour compatibilité avec l'ancien format
        setUser(response.data);
      } else {
        throw new Error(response.error || 'Réponse invalide');
      }
    } catch (error: any) {
      const errorMessage = error?.message || error?.error || 'Erreur de connexion';
      console.error('Erreur lors de la récupération des informations utilisateur:', error);
      alert(`Erreur d'authentification: ${errorMessage}\n\nLe token n'est pas reconnu par Directus.`);
      // Si le token est invalide, déconnecter l'utilisateur
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
}

