import { useEffect, useState } from "react";
export default function Navbar({ view, goTo, authed, onLogout, onLoginClick, onRegisterClick }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 40);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <h1 className="logo" onClick={() => goTo("home")}>SAVORA</h1>
      <nav>
        <button className={`nav-link ${view === "home" ? "active" : ""}`} onClick={() => goTo("home")}>Home</button>
        <button className={`nav-link ${view === "browse" ? "active" : ""}`} onClick={() => goTo("browse")}>Discover</button>
        <button className={`nav-link ${view === "favorites" ? "active" : ""}`} onClick={() => goTo("favorites")}>Favorites</button>
        <button className="nav-link pill" onClick={() => goTo("add")}>+ Publier</button>
        {authed ? (
          <button className="nav-link" onClick={onLogout}>Déconnexion</button>
        ) : (
          <>
            <button className="nav-link" onClick={onLoginClick}>Connexion</button>
            <button className="nav-link" onClick={onRegisterClick}>Inscription</button>
          </>
        )}
      </nav>
    </header>
  );
}
