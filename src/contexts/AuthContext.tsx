import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User, LoginCredentials, SignUpCredentials } from '../types';
import Avatars from '../components/icons/Avatars';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  signup: (credentials: SignUpCredentials) => Promise<boolean>;
  logout: () => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  authModalMode: 'signin' | 'signup';
  setAuthModalMode: (mode: 'signin' | 'signup') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user database
const MOCK_USERS = [
  {
    email: 'demo@example.com',
    password: 'password123',
    name: 'Demo User',
    id: '1',
  },
  {
    email: 'test@user.com',
    password: 'testpass',
    name: 'Test User',
    id: '2',
  },
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const foundUser = MOCK_USERS.find((u) => u.email === credentials.email && u.password === credentials.password);
    if (foundUser) {
      const { password, ...userWithoutPassword } = foundUser;
      setUser({
        ...userWithoutPassword,
        avatar: Avatars(Math.floor(Math.random() * 3)),
      });
      setShowAuthModal(false);
      return true;
    }
    return false;
  }, []);

  const signup = useCallback(async (credentials: SignUpCredentials): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const existingUser = MOCK_USERS.find((u) => u.email === credentials.email);
    if (existingUser) {
      return false;
    }
    const newUser = {
      id: Date.now().toString(),
      email: credentials.email,
      name: credentials.name,
      avatar: Avatars(Math.floor(Math.random() * 3)),
    };
    MOCK_USERS.push({
      ...newUser,
      password: credentials.password,
    });
    setUser(newUser);
    setShowAuthModal(false);
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        showAuthModal,
        setShowAuthModal,
        authModalMode,
        setAuthModalMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
