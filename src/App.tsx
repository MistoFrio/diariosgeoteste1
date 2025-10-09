import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './components/LoginPage';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { DiariesList } from './components/DiariesList';
import { NewDiary } from './components/NewDiary';
import { ClientsManagement } from './components/ClientsManagement';
import { UsersManagement } from './components/UsersManagement';
import { ProfilePage } from './components/ProfilePage';
import { AgentAssistant } from './components/AgentAssistant';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onPageChange={setCurrentPage} />;
      case 'diaries':
        return <DiariesList onNewDiary={() => setCurrentPage('new-diary')} />;
      case 'new-diary':
        return <NewDiary onBack={() => setCurrentPage('diaries')} />;
      case 'clients':
        return user.role === 'admin' ? <ClientsManagement /> : <Dashboard onPageChange={setCurrentPage} />;
      case 'users':
        return user.role === 'admin' ? <UsersManagement /> : <Dashboard onPageChange={setCurrentPage} />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <Dashboard onPageChange={setCurrentPage} />;
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
      <AgentAssistant />
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;