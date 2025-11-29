import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import './UsersList.css';

interface User {
  id: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
}

export function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getUsers();
      setUsers(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="list-container">
        <div className="loading">⏳ Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="list-container">
        <div className="error-message">❌ {error}</div>
        <button onClick={loadUsers} className="btn-retry">
          🔄 Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="list-container">
      <div className="list-header">
        <h2>👥 Liste des utilisateurs</h2>
        <button onClick={loadUsers} className="btn-refresh" title="Actualiser">
          🔄
        </button>
      </div>
      
      {users.length === 0 ? (
        <div className="empty-state">
          <p>Aucun utilisateur trouvé</p>
        </div>
      ) : (
        <div className="list-content">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Téléphone</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.last_name || '-'}</td>
                  <td>{user.first_name || '-'}</td>
                  <td>{user.phone || '-'}</td>
                  <td>{user.email || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

