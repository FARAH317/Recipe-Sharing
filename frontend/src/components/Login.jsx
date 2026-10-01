import { useState } from "react";
import { login, register } from "../api";
export default function Login({ initialMode = "login", onLoggedIn, onCancel }) {
  const [mode, setMode] = useState(initialMode);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (mode === "register" && confirmPassword !== password) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "register") {
        await register(username, password);
      } else {
        await login(username, password);
      }
      onLoggedIn();
    } catch (err) {
      if (mode === "register") {
        const message = err.response?.data?.username?.[0] || "Impossible de créer le compte.";
        setError(message);
      } else {
        setError("Identifiants incorrects.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <form className="login-form" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <div className="auth-toggle" aria-label="Choisir le mode d'authentification">
          <button
            type="button"
            className={mode === "login" ? "active" : ""}
            onClick={() => setMode("login")}
          >
            Connexion
          </button>
          <button
            type="button"
            className={mode === "register" ? "active" : ""}
            onClick={() => setMode("register")}
          >
            Inscription
          </button>
        </div>

        <h2>{mode === "register" ? "Créer un compte" : "Connexion"}</h2>
        <input
          type="text"
          placeholder="Nom d'utilisateur"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {mode === "register" && (
          <input
            type="password"
            placeholder="Confirmer le mot de passe"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        )}
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading
            ? (mode === "register" ? "Création..." : "Connexion...")
            : (mode === "register" ? "Créer mon compte" : "Se connecter")}
        </button>
      </form>
    </div>
  );
}
