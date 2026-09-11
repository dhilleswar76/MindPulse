import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { authService } from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  switchDemoRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USERS: Record<UserRole, User> = {
  USER: {
    id: 'demo_user_1',
    email: 'user@gmail.com',
    fullName: 'Alex Rivera (Case MP-1042)',
    role: 'USER',
    victimType: 'WITNESS',
    caseId: 'MP-1042',
    caseStage: 'COURT_TRIAL',
    district: 'District Central',
    state: 'State Alpha',
    supportStatus: 'ACTIVE',
    consentStatus: true,
    assignedCounselor: 'Dr. Sarah Jenkins',
  },
  COUNSELOR: {
    id: 'demo_counselor_1',
    email: 'counsellor@gmail.com',
    fullName: 'Dr. Sarah Jenkins',
    role: 'COUNSELOR',
    department: 'District Legal Aid & Victim Support Cell',
    district: 'District Central',
    state: 'State Alpha',
  },
  ADMIN: {
    id: 'demo_admin_1',
    email: 'admin@gmail.com',
    fullName: 'Marcus Vance (District Welfare Officer)',
    role: 'ADMIN',
    department: 'Social Justice & Empowerment Department',
    district: 'District Central',
    state: 'State Alpha',
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const cached = localStorage.getItem('mindpulse_user');
    return cached ? JSON.parse(cached) : DEMO_USERS.USER;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('mindpulse_token') || 'demo_token_user');
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authService.login(email, password);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('mindpulse_user', JSON.stringify(res.user));
      localStorage.setItem('mindpulse_token', res.token);
    } catch (err: any) {
      // Demo fallback if backend is starting
      let matchedRole: UserRole = 'USER';
      const emailLower = email.toLowerCase();
      if (emailLower.includes('counselor') || emailLower.includes('counsellor')) matchedRole = 'COUNSELOR';
      if (emailLower.includes('admin')) matchedRole = 'ADMIN';

      const fallbackUser = DEMO_USERS[matchedRole];
      setUser(fallbackUser);
      const fakeToken = `demo_token_${matchedRole.toLowerCase()}`;
      setToken(fakeToken);
      localStorage.setItem('mindpulse_user', JSON.stringify(fallbackUser));
      localStorage.setItem('mindpulse_token', fakeToken);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await authService.register(data);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('mindpulse_user', JSON.stringify(res.user));
      localStorage.setItem('mindpulse_token', res.token);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('mindpulse_user');
    localStorage.removeItem('mindpulse_token');
  };

  const switchDemoRole = (role: UserRole) => {
    const newUser = DEMO_USERS[role];
    const newToken = `demo_token_${role.toLowerCase()}`;
    setUser(newUser);
    setToken(newToken);
    localStorage.setItem('mindpulse_user', JSON.stringify(newUser));
    localStorage.setItem('mindpulse_token', newToken);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, switchDemoRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
