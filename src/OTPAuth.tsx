import { useState } from 'react';
import { apiService } from './services/api';
import { useAuth } from './contexts/AuthContext';
import './OTPAuth.css';

export function OTPAuth() {
  const [step, setStep] = useState<'phone' | 'code' | 'success'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const requestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await apiService.requestOTP(phone);

      if (data.success) {
        setStep('code');
      } else {
        setError(data.error || 'Erreur lors de l\'envoi du code');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion au serveur');
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
      const data = await apiService.verifyOTP(phone, code);

      if (data.success && data.access_token) {
        setStep('success');
        // Attendre 1.5s pour montrer le message de succès avant de rediriger
        setTimeout(() => {
          login(data.access_token!, data.refresh_token);
        }, 1500);
      } else {
        setError(data.error || 'Code invalide');
        setLoading(false); // Arrêter le chargement seulement en cas d'erreur
      }
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion au serveur');
      console.error(err);
      setLoading(false);
    }
  };

  const reset = () => {
    setStep('phone');
    setPhone('');
    setCode('');
    setError(null);
  };

  return (
    <div className="otp-container">
      <div className="otp-card">
        <div className="logo-section">
          <h1>🔐 Samacoach</h1>
          <p className="subtitle">Connectez-vous avec votre numéro de téléphone</p>
        </div>

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
            <p>Redirection vers l'application...</p>
            <div className="loading-spinner"></div>
          </div>
        )}
      </div>
    </div>
  );
}

