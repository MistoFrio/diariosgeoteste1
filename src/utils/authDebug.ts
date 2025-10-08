/**
 * Utilitário para debug do sistema de autenticação
 */

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export const checkAuthState = () => {
  console.group('🔍 Diagnóstico de Autenticação');
  
  // Verificar localStorage
  const storedUsers = localStorage.getItem('users');
  const currentUser = localStorage.getItem('currentUser');
  
  console.log('📦 Dados do localStorage:');
  console.log('- users:', storedUsers ? 'Presente' : 'Ausente');
  console.log('- currentUser:', currentUser ? 'Presente' : 'Ausente');
  
  if (storedUsers) {
    try {
      const users: User[] = JSON.parse(storedUsers);
      console.log('\n👥 Usuários cadastrados:', users.length);
      users.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.name}`);
        console.log(`     Email: ${user.email}`);
        console.log(`     Role: ${user.role}`);
        console.log(`     ID: ${user.id}`);
      });
    } catch (e) {
      console.error('❌ Erro ao parsear usuários:', e);
    }
  }
  
  if (currentUser) {
    try {
      const user: User = JSON.parse(currentUser);
      console.log('\n🔐 Usuário atual:');
      console.log('  Nome:', user.name);
      console.log('  Email:', user.email);
      console.log('  Role:', user.role);
    } catch (e) {
      console.error('❌ Erro ao parsear usuário atual:', e);
    }
  }
  
  console.groupEnd();
};

export const resetAuthState = () => {
  console.log('🔄 Resetando estado de autenticação...');
  localStorage.removeItem('users');
  localStorage.removeItem('currentUser');
  console.log('✅ Estado resetado. Recarregue a página.');
};

export const listAllUsers = (): User[] => {
  const storedUsers = localStorage.getItem('users');
  if (!storedUsers) return [];
  
  try {
    return JSON.parse(storedUsers);
  } catch {
    return [];
  }
};

// Disponibilizar no objeto window para fácil acesso no console
if (typeof window !== 'undefined') {
  (window as any).authDebug = {
    check: checkAuthState,
    reset: resetAuthState,
    listUsers: listAllUsers,
  };
  
  console.log('💡 Use authDebug.check() no console para verificar o estado da autenticação');
  console.log('💡 Use authDebug.reset() para resetar o estado');
  console.log('💡 Use authDebug.listUsers() para listar todos os usuários');
}

