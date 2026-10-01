import { useState } from "react";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Login from "./components/Login";
import RecipeList from "./components/RecipeList";
import RecipeDetail from "./components/RecipeDetail";
import RecipeForm from "./components/RecipeForm";
import Favorites from "./components/Favorites";
import { isAuthenticated, logout } from "./api";
import "./styles.css";
export default function App() {
  const [authed, setAuthed] = useState(isAuthenticated());
  const [showLogin, setShowLogin] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [view, setView] = useState("home"); // home | browse | detail | add | favorites
  const [activeRecipeId, setActiveRecipeId] = useState(null);
  const [editingRecipeId, setEditingRecipeId] = useState(null);
  const [cuisineFilter, setCuisineFilter] = useState(null);
  function openAuthModal(mode = "login") {
    setAuthMode(mode);
    setShowLogin(true);
  }
  function openRecipe(id) {
    setActiveRecipeId(id);
    setView("detail");
    window.scrollTo(0, 0);
  }
  function editRecipe(id) {
    setEditingRecipeId(id);
    setView("edit");
    window.scrollTo(0, 0);
  }
  function requireLogin() {
    openAuthModal("login");
  }
  function goTo(v) {
    if (v === "add" && !authed) {
      openAuthModal("register");
      return;
    }
    setView(v);
    window.scrollTo(0, 0);
  }
  function selectCuisine(name) {
    setCuisineFilter(name);
    setView("browse");
    window.scrollTo(0, 0);
  }
  return (
    <div className="app">
      <Navbar
        view={view}
        goTo={goTo}
        authed={authed}
        onLogout={() => { logout(); setAuthed(false); setView("home"); }}
        onLoginClick={() => openAuthModal("login")}
        onRegisterClick={() => openAuthModal("register")}
      />
      {view === "home" && (
        <Home onOpenRecipe={openRecipe} onGoDiscover={() => goTo("browse")} onSelectCuisine={selectCuisine} />
      )}
      {view === "browse" && <RecipeList onOpenRecipe={openRecipe} initialCuisine={cuisineFilter} />}
      {view === "detail" && (
        <RecipeDetail
          recipeId={activeRecipeId}
          onBack={() => setView("browse")}
          onEdit={() => editRecipe(activeRecipeId)}
          onDeleted={() => { setView("browse"); window.scrollTo(0, 0); }}
          onRequireLogin={requireLogin}
        />
      )}
      {view === "add" && <RecipeForm onCreated={openRecipe} />}
      {view === "edit" && (
        <RecipeForm
          recipeId={editingRecipeId}
          onCreated={openRecipe}
          onCancel={() => setView("detail")}
        />
      )}
      {view === "favorites" && (
        authed
          ? <Favorites onOpenRecipe={openRecipe} />
          : <div className="page" style={{ paddingTop: 60 }}><p>Connecte-toi pour voir tes favoris.</p></div>
      )}
      {showLogin && (
        <Login
          initialMode={authMode}
          onCancel={() => setShowLogin(false)}
          onLoggedIn={() => { setAuthed(true); setShowLogin(false); }}
        />
      )}
      <footer className="site-footer">Savora — Tâche 5, stage InfozaTech</footer>
    </div>
  );
}
