import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UsersList } from './UsersList';
import { ProgramsList } from './ProgramsList';
import { ApiTester } from './ApiTester';
import './Dashboard.css';

type Tab = 'users' | 'programs' | 'api';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('users');
  const { user, logout } = useAuth();

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>🏋️ Samacoach</h1>
          <div className="user-info">
            <span className="user-name">
              {user?.first_name && user?.last_name
                ? `${user.first_name} ${user.last_name}`
                : user?.phone || 'Utilisateur'}
            </span>
            <button onClick={logout} className="btn-logout">
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <nav className="dashboard-nav">
        <button
          className={`nav-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Utilisateurs
        </button>
        <button
          className={`nav-button ${activeTab === 'programs' ? 'active' : ''}`}
          onClick={() => setActiveTab('programs')}
        >
          📚 Programmes
        </button>
        <button
          className={`nav-button ${activeTab === 'api' ? 'active' : ''}`}
          onClick={() => setActiveTab('api')}
        >
          🧪 Test API
        </button>
      </nav>

      <main className="dashboard-content">
        {activeTab === 'users' && <UsersList />}
        {activeTab === 'programs' && <ProgramsList />}
        {activeTab === 'api' && <ApiTester />}
      </main>
    </div>
  );
}

