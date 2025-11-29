import { useState } from 'react';
import { apiService } from '../services/api';
import './ApiTester.css';

interface Endpoint {
  name: string;
  method: string;
  path: string;
  description: string;
  body?: Record<string, any>;
}

const ENDPOINTS: Endpoint[] = [
  {
    name: 'Request OTP',
    method: 'POST',
    path: '/directus-extension-otp-auth/request',
    description: 'Demander un code OTP',
    body: { phone: '+33612345678' },
  },
  {
    name: 'Verify OTP',
    method: 'POST',
    path: '/directus-extension-otp-auth/verify',
    description: 'Vérifier un code OTP',
    body: { phone: '+33612345678', code: '123456' },
  },
  {
    name: 'Get Me',
    method: 'GET',
    path: '/directus-extension-otp-auth/me',
    description: 'Récupérer les informations de l\'utilisateur connecté',
  },
  {
    name: 'Get Users',
    method: 'GET',
    path: '/items/User?fields[]=*&limit=-1',
    description: 'Récupérer la liste des utilisateurs',
  },
  {
    name: 'Get Programs',
    method: 'GET',
    path: '/items/Program?fields[]=*&limit=-1',
    description: 'Récupérer la liste des programmes',
  },
  {
    name: 'Health Check',
    method: 'GET',
    path: '/directus-extension-otp-auth/health',
    description: 'Vérifier l\'état de l\'extension',
  },
];

export function ApiTester() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint>(ENDPOINTS[0]);
  const [requestBody, setRequestBody] = useState<string>('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEndpointSelect = (endpoint: Endpoint) => {
    setSelectedEndpoint(endpoint);
    setRequestBody(endpoint.body ? JSON.stringify(endpoint.body, null, 2) : '');
    setResponse(null);
    setError(null);
  };

  const executeRequest = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8055';
      const token = localStorage.getItem('access_token');

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers,
      };

      if (selectedEndpoint.method !== 'GET' && requestBody) {
        try {
          options.body = JSON.stringify(JSON.parse(requestBody));
        } catch (e) {
          throw new Error('JSON invalide dans le body');
        }
      }

      const startTime = Date.now();
      const res = await fetch(`${DIRECTUS_URL}${selectedEndpoint.path}`, options);
      const duration = Date.now() - startTime;

      const data = await res.json().catch(() => ({}));

      setResponse({
        status: res.status,
        statusText: res.statusText,
        duration,
        headers: Object.fromEntries(res.headers.entries()),
        data,
      });
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'exécution de la requête');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="api-tester">
      <div className="api-tester-header">
        <h2>🧪 Testeur d'API</h2>
        <p>Testez les endpoints de l'API Directus</p>
      </div>

      <div className="api-tester-content">
        <div className="endpoints-sidebar">
          <h3>Endpoints</h3>
          <div className="endpoints-list">
            {ENDPOINTS.map((endpoint, index) => (
              <button
                key={index}
                className={`endpoint-item ${selectedEndpoint.path === endpoint.path ? 'active' : ''}`}
                onClick={() => handleEndpointSelect(endpoint)}
              >
                <div className="endpoint-method">{endpoint.method}</div>
                <div className="endpoint-info">
                  <div className="endpoint-name">{endpoint.name}</div>
                  <div className="endpoint-path">{endpoint.path}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="request-panel">
          <div className="request-header">
            <div className="request-method-badge">{selectedEndpoint.method}</div>
            <div className="request-path">{selectedEndpoint.path}</div>
            <button
              className="btn-execute"
              onClick={executeRequest}
              disabled={loading}
            >
              {loading ? '⏳ Envoi...' : '▶️ Exécuter'}
            </button>
          </div>

          <div className="request-description">
            {selectedEndpoint.description}
          </div>

          {selectedEndpoint.method !== 'GET' && (
            <div className="request-body-section">
              <label>Request Body (JSON)</label>
              <textarea
                className="request-body"
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                placeholder='{"key": "value"}'
                rows={8}
              />
            </div>
          )}

          {error && (
            <div className="response-error">
              <div className="error-icon">❌</div>
              <div className="error-message">{error}</div>
            </div>
          )}

          {response && (
            <div className="response-section">
              <div className="response-header">
                <div className="response-status">
                  <span className={`status-badge status-${response.status >= 200 && response.status < 300 ? 'success' : 'error'}`}>
                    {response.status} {response.statusText}
                  </span>
                  <span className="response-duration">⏱️ {response.duration}ms</span>
                </div>
              </div>

              <div className="response-tabs">
                <div className="tab-content">
                  <pre className="response-body">{JSON.stringify(response.data, null, 2)}</pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

