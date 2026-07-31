import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import "../css/LoginPage.css";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Completa todos los campos.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      await login(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-logo">CS</div>
          <div>
            <h1 className="login-title">Pólizas CS</h1>
            <p className="login-subtitle">Panel de Pólizas</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label className="login-label">Correo electrónico</label>
            <input
              className={`login-input ${error ? "login-input--error" : ""}`}
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              autoFocus
              autoComplete="email"
            />
          </div>

          <div className="login-field">
            <label className="login-label">Contraseña</label>
            <input
              className={`login-input ${error ? "login-input--error" : ""}`}
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="login-error">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                <circle
                  cx="10"
                  cy="10"
                  r="9"
                  stroke="#ef4444"
                  strokeWidth="1.5"
                />
                <path
                  d="M10 6v4M10 14h.01"
                  stroke="#ef4444"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
              {error}
            </div>
          )}

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? "Verificando..." : "Iniciar sesión"}
          </button>
        </form>

        <p className="login-footer">
          COMPUSERVICIOS BCS &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
