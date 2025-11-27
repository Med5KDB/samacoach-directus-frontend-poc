import { useState } from 'react';
import './OTPAuth.css';

const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8055';

interface OTPResponse {
  success: boolean;
  message?: string;
  error?: string;
}

interface AuthResponse extends OTPResponse {
  access_token?: string;
  refresh_token?: string;
  expires?: number;
}

export function OTPAuth() {
  const [step, setStep] = useState<'phone' | 'code' | 'success'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const requestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${DIRECTUS_URL}/directus-extension-otp-auth/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });

      const data: OTPResponse = await response.json();

      if (data.success) {
        setStep('code');
      } else {
        setError(data.error || 'Erreur lors de l\'envoi du code');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${DIRECTUS_URL}/directus-extension-otp-auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, code }),
      });

      const data: AuthResponse = await response.json();

      if (data.success && data.access_token) {
        setAccessToken(data.access_token);
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token || '');
        setStep('success');
      } else {
        setError(data.error || 'Code invalide');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep('phone');
    setPhone('');
    setCode('');
    setError(null);
    setAccessToken(null);
  };

  return (
    <div className="otp-container">
      <div className="otp-card">
        <h1>🔐 Authentification OTP</h1>
        <p className="subtitle">Samacoach - POC</p>

        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        {step === 'phone' && (
          <form onSubmit={requestOTP}>
            <div className="form-group">
              <label htmlFor="phone">Numéro de téléphone</label>
              <input
                id="phone"
                type="tel"
                placeholder="+33612345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                disabled={loading}
              />
              <small>Format international (ex: +33612345678)</small>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? '⏳ Envoi...' : '📱 Envoyer le code'}
            </button>

            <div className="dev-note">
              ℹ️ <strong>Mode développement:</strong> Le code OTP sera affiché dans les logs Docker.<br />
              <code>docker-compose logs -f directus</code>
            </div>
          </form>
        )}

        {step === 'code' && (
          <form onSubmit={verifyOTP}>
            <div className="form-group">
              <label htmlFor="code">Code OTP</label>
              <input
                id="code"
                type="text"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                required
                disabled={loading}
                autoFocus
              />
              <small>Entrez le code à 6 chiffres reçu par SMS</small>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? '⏳ Vérification...' : '✅ Vérifier'}
            </button>

            <button type="button" className="btn-secondary" onClick={reset}>
              ← Retour
            </button>

            <div className="resend-link">
              <button type="button" className="link-button" onClick={() => {
                setCode('');
                requestOTP(new Event('submit') as any);
              }}>
                Renvoyer le code
              </button>
            </div>
          </form>
        )}

        {step === 'success' && (
          <div className="success-container">
            <div className="success-icon">✅</div>
            <h2>Authentification réussie !</h2>
            <p>Vous êtes maintenant connecté</p>

            <div className="token-display">
              <label>Access Token:</label>
              <textarea
                readOnly
                value={accessToken || ''}
                rows={4}
              />
              <button
                className="btn-copy"
                onClick={() => {
                  if (accessToken) {
                    navigator.clipboard.writeText(accessToken);
                    alert('Token copié dans le presse-papiers !');
                  }
                }}
              >
                📋 Copier le token
              </button>
            </div>

            <button className="btn-primary" onClick={reset}>
              🔄 Nouvelle authentification
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

