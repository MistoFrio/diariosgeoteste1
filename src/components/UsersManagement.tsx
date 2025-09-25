import React, { useState, useEffect } from 'react';
import { Search, Plus, User, Mail, Shield, ShieldCheck, Edit, Trash2, Loader2 } from 'lucide-react';
import { User as UserType } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

// Mock data
const mockUsers: UserType[] = [
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
  },
  {
    id: '3',
    name: 'Ana Costa',
    email: 'ana@geoteste.com',
    role: 'user',
    createdAt: '2025-01-03'
  },
];

export const UsersManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user' as 'admin' | 'user',
    password: ''
  });

  // Buscar usuários do Supabase
  useEffect(() => {
    const fetchUsers = async () => {
      if (!isSupabaseConfigured) {
        setUsers(mockUsers);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const mappedUsers: UserType[] = (data || []).map((profile: any) => {
          const email: string = profile.email || '';
          const fallbackFromEmail = email ? (email.split('@')[0] as string) : '';
          const displayName = profile.full_name || profile.name || fallbackFromEmail || 'Nome não informado';
          return {
            id: profile.id,
            name: displayName,
            email: email || 'email@exemplo.com',
            role: profile.role || 'user',
            createdAt: profile.created_at || new Date().toISOString()
          };
        });

        setUsers(mappedUsers);
      } catch (err: any) {
        console.error('Erro ao buscar usuários:', err);
        setError(err.message || 'Erro ao carregar usuários');
        setUsers(mockUsers); // Fallback para dados mock
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (user?: UserType) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        password: ''
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        role: 'user',
        password: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      role: 'user',
      password: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSupabaseConfigured) {
      // Fallback para modo demo
      if (editingUser) {
        setUsers(prev => prev.map(user => 
          user.id === editingUser.id 
            ? { ...user, name: formData.name, email: formData.email, role: formData.role }
            : user
        ));
      } else {
        const newUser: UserType = {
          id: Date.now().toString(),
          name: formData.name,
          email: formData.email,
          role: formData.role,
          createdAt: new Date().toISOString()
        };
        setUsers(prev => [...prev, newUser]);
      }
      handleCloseModal();
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (editingUser) {
        // Atualizar usuário existente
        const { error } = await supabase
          .from('profiles')
          .update({
            name: formData.name,
            role: formData.role
          })
          .eq('id', editingUser.id);

        if (error) throw error;

        setUsers(prev => prev.map(user => 
          user.id === editingUser.id 
            ? { ...user, name: formData.name, role: formData.role }
            : user
        ));
      } else {
        // Criar novo usuário via Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name,
              role: formData.role
            }
          }
        });

        if (authError) throw authError;

        if (authData.user) {
          // O perfil será criado automaticamente pelo trigger
          // Aguardar um pouco para o trigger processar
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Buscar o perfil criado
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();

          if (profileError) {
            console.warn('Perfil não encontrado, criando manualmente:', profileError);
            // Criar perfil manualmente se o trigger falhou
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: authData.user.id,
                name: formData.name,
                email: formData.email,
                role: formData.role
              });
            if (insertError) throw insertError;
          }

          const newUser: UserType = {
            id: authData.user.id,
            name: formData.name,
            email: formData.email,
            role: formData.role,
            createdAt: new Date().toISOString()
          };
          setUsers(prev => [newUser, ...prev]);
        }
      }
      
      handleCloseModal();
    } catch (err: any) {
      console.error('Erro ao salvar usuário:', err);
      setError(err.message || 'Erro ao salvar usuário');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) return;

    if (!isSupabaseConfigured) {
      setUsers(prev => prev.filter(user => user.id !== userId));
      return;
    }

    try {
      // Deletar perfil (o usuário auth será deletado automaticamente pelo trigger)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev => prev.filter(user => user.id !== userId));
    } catch (err: any) {
      console.error('Erro ao deletar usuário:', err);
      setError(err.message || 'Erro ao deletar usuário');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 md:mb-8 space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">Gerenciamento de Usuários</h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300">Cadastre e gerencie os usuários do sistema</p>
        </div>
        
        <button
          onClick={() => handleOpenModal()}
          className="w-full sm:w-auto bg-green-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium hover:bg-green-700 hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-sm sm:text-base">Novo Usuário</span>
        </button>
      </div>

      {/* Search */}
      <div className="mb-4 sm:mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
          <input
            type="text"
            placeholder="Buscar usuários..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            <span className="ml-3 text-gray-500">Carregando usuários...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                <tr>
                  <th className="text-left py-2 sm:py-3 md:py-4 px-2 sm:px-4 md:px-6 font-medium text-gray-700 dark:text-gray-300">Usuário</th>
                  <th className="text-left py-2 sm:py-3 md:py-4 px-2 sm:px-4 md:px-6 font-medium text-gray-700 dark:text-gray-300">Email</th>
                  <th className="text-left py-2 sm:py-3 md:py-4 px-2 sm:px-4 md:px-6 font-medium text-gray-700 dark:text-gray-300">Função</th>
                  <th className="text-left py-2 sm:py-3 md:py-4 px-2 sm:px-4 md:px-6 font-medium text-gray-700 dark:text-gray-300">Criado em</th>
                  <th className="text-center py-2 sm:py-3 md:py-4 px-2 sm:px-4 md:px-6 font-medium text-gray-700 dark:text-gray-300">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="py-2 sm:py-3 md:py-4 px-2 sm:px-4 md:px-6">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <User className="text-green-600 dark:text-green-400 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[100px] sm:max-w-[140px] md:max-w-none text-xs sm:text-sm">{user.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-2 sm:py-3 md:py-4 px-2 sm:px-4 md:px-6">
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300 truncate max-w-[120px] sm:max-w-[160px] md:max-w-none text-xs sm:text-sm">{user.email}</span>
                    </div>
                  </td>
                  <td className="py-3 sm:py-4 px-4 sm:px-6">
                    <div className="flex items-center space-x-2">
                      {user.role === 'admin' ? (
                        <>
                          <ShieldCheck className="w-4 h-4 text-red-500" />
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                            Administrador
                          </span>
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4 text-blue-500" />
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                            Usuário
                          </span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="py-3 sm:py-4 px-4 sm:px-6 text-gray-600 whitespace-nowrap">
                    {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-3 sm:py-4 px-4 sm:px-6">
                    <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                      <button
                        onClick={() => handleOpenModal(user)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {!loading && filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum usuário encontrado</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Tente ajustar os termos de busca' : 'Comece adicionando um novo usuário'}
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Função *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'admin' | 'user' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="user">Usuário</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              
              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Senha *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required={!editingUser}
                    minLength={6}
                  />
                </div>
              )}
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? 'Salvando...' : (editingUser ? 'Atualizar' : 'Cadastrar')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};