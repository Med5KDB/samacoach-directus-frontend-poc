import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import './UsersList.css';

interface Program {
  id: string;
  name?: string;
  description?: string;
  image?: string;
  document?: string;
}

export function ProgramsList() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getPrograms();
      setPrograms(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des programmes');
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
        <button onClick={loadPrograms} className="btn-retry">
          🔄 Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="list-container">
      <div className="list-header">
        <h2>📚 Liste des programmes</h2>
        <button onClick={loadPrograms} className="btn-refresh" title="Actualiser">
          🔄
        </button>
      </div>
      
      {programs.length === 0 ? (
        <div className="empty-state">
          <p>Aucun programme trouvé</p>
        </div>
      ) : (
        <div className="list-content">
          <div className="programs-grid">
            {programs.map((program) => (
              <div key={program.id} className="program-card">
                {program.image && (
                  <div className="program-image">
                    <img 
                      src={`${import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8055'}/assets/${program.image}`} 
                      alt={program.name || 'Programme'} 
                    />
                  </div>
                )}
                <div className="program-info">
                  <h3>{program.name || 'Sans nom'}</h3>
                  <p>{program.description || 'Aucune description'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

