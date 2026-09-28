import { useState } from "react";
import { login } from "../api";
export default function Login({ onLoggedIn, onCancel }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      onLoggedIn();
    } catch {
      setError("Identifiants incorrects.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <form className="login-form" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2>Connexion</h2>
        <input
          type="text" placeholder="Nom d'utilisateur"
          value={username} onChange={(e) => setUsername(e.target.value)} required
        />
        <input
          type="password" placeholder="Mot de passe"
          value={password} onChange={(e) => setPassword(e.target.value)} required
        />
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
