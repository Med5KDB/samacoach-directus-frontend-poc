import "./App.css";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { OTPAuth } from "./OTPAuth";
import { Dashboard } from "./components/Dashboard";

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        ⏳ Chargement...
      </div>
    );
  }

  return isAuthenticated ? <Dashboard /> : <OTPAuth />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
