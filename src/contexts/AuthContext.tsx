import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, User } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo (persistidos em localStorage)
const defaultUsers: User[] = [
  {
    id: '1',
    name: 'Admin Geoteste',
    email: 'admin@geoteste.com',
    role: 'admin',
    createdAt: '2025-01-01'
  },
  {
    id: '2',
    name: 'João Silva',
    email: 'joao@geoteste.com',
    role: 'user',
    createdAt: '2025-01-02'
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Carregar lista de usuários do storage (com defaults se vazio)
      const storedUsers = localStorage.getItem('users');
      if (storedUsers) {
        try {
          setUsers(JSON.parse(storedUsers));
        } catch {
          setUsers(defaultUsers);
          localStorage.setItem('users', JSON.stringify(defaultUsers));
        }
      } else {
        setUsers(defaultUsers);
        localStorage.setItem('users', JSON.stringify(defaultUsers));
      }
      // Restaurar currentUser
      const storedCurrent = localStorage.getItem('currentUser');
      if (storedCurrent) {
        try {
          setUser(JSON.parse(storedCurrent));
        } catch {}
      }
      setIsLoading(false);
      return;
    }

    // Supabase: recuperar sessão e escutar mudanças
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Map básico para nosso tipo User
        const profile = await supabase.from('profiles').select('name, role, created_at').eq('id', session.user.id).single();
        setUser({
          id: session.user.id,
          name: profile.data?.name || session.user.email || 'Usuário',
          email: session.user.email || '',
          role: (profile.data?.role as 'admin' | 'user') || 'user',
          createdAt: profile.data?.created_at || new Date().toISOString(),
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };
    init();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setUser(null);
        return;
      }
      (async () => {
        const profile = await supabase.from('profiles').select('name, role, created_at').eq('id', session.user!.id).single();
        setUser({
          id: session.user!.id,
          name: profile.data?.name || session.user!.email || 'Usuário',
          email: session.user!.email || '',
          role: (profile.data?.role as 'admin' | 'user') || 'user',
          createdAt: profile.data?.created_at || new Date().toISOString(),
        });
      })();
    });

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<{ ok: boolean; code?: string; message?: string }> => {
    setIsLoading(true);
    if (!isSupabaseConfigured) {
      // Recarregar usuários do localStorage para garantir dados atualizados
      const storedUsers = localStorage.getItem('users');
      let currentUsers = users;
      if (storedUsers) {
        try {
          currentUsers = JSON.parse(storedUsers);
        } catch {
          currentUsers = defaultUsers;
          localStorage.setItem('users', JSON.stringify(defaultUsers));
        }
      } else {
        currentUsers = defaultUsers;
        localStorage.setItem('users', JSON.stringify(defaultUsers));
      }

      // Normalizar email para comparação (trim e lowercase)
      const normalizedEmail = email.trim().toLowerCase();
      console.log('Tentando login com email:', normalizedEmail);
      console.log('Usuários disponíveis:', currentUsers.map(u => u.email.toLowerCase()));
      
      const foundUser = currentUsers.find(u => u.email.trim().toLowerCase() === normalizedEmail);
      if (!foundUser) {
        console.error('Usuário não encontrado. Email buscado:', normalizedEmail);
        setIsLoading(false);
        return { ok: false, code: 'user_not_found', message: 'Email não encontrado' };
      }
      if (password !== '123456') {
        setIsLoading(false);
        return { ok: false, code: 'invalid_credentials', message: 'Senha incorreta' };
      }
      setUser(foundUser);
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      setIsLoading(false);
      return { ok: true };
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setIsLoading(false);
    if (!error) {
      return { ok: true };
    }

    // Mapear códigos de erro comuns do Supabase
    const msg = (error as any)?.message?.toLowerCase?.() || '';
    if (msg.includes('invalid login credentials')) {
      return { ok: false, code: 'invalid_credentials', message: 'Senha incorreta' };
    }
    if (msg.includes('email not confirmed') || msg.includes('email not confirmed')) {
      return { ok: false, code: 'email_not_confirmed', message: 'E-mail não confirmado. Verifique sua caixa de entrada.' };
    }
    if (msg.includes('user not found')) {
      return { ok: false, code: 'user_not_found', message: 'Email não encontrado' };
    }
    return { ok: false, code: 'unknown', message: (error as any).message || 'Erro ao entrar' };
  };

  const register: AuthContextType['register'] = async (name, email, password) => {
    // Regras simples de validação
    if (!name.trim() || !email.trim() || !password.trim()) {
      return { ok: false, message: 'Preencha todos os campos' };
    }
    if (!isSupabaseConfigured) {
      const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
      if (exists) {
        return { ok: false, message: 'Email já cadastrado' };
      }
      // Criar usuário (papel padrão: user)
      const newUser: User = {
        id: Date.now().toString(),
        name: name.trim(),
        email: email.trim(),
        role: 'user',
        createdAt: new Date().toISOString(),
      };
      const nextUsers = [...users, newUser];
      setUsers(nextUsers);
      localStorage.setItem('users', JSON.stringify(nextUsers));
      return { ok: true };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name.trim(),
          name: name.trim(),
          role: 'user'
        }
      }
    });
    if (error) return { ok: false, message: error.message };
    // Criar profile vinculado ao usuário
    const userId = data.user?.id;
    if (userId) {
      await supabase.from('profiles').upsert({ id: userId, name: name.trim(), email: email.trim(), role: 'user' });
    }
    return { ok: true };
  };

  const logout = () => {
    if (!isSupabaseConfigured) {
      setUser(null);
      localStorage.removeItem('currentUser');
      // Recarregar a página para garantir que volta para a tela de login
      window.location.reload();
      return;
    }
    supabase.auth.signOut().then(() => {
      window.location.reload();
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
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