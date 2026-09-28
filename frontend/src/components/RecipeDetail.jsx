import { useEffect, useState } from "react";
import api, { isAuthenticated } from "../api";
export default function RecipeDetail({ recipeId, onBack, onEdit, onDeleted, onRequireLogin }) {
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  function load() {
    api.get(`/recipes/${recipeId}/`)
      .then((res) => setRecipe(res.data))
      .catch(() => setError("Impossible de charger cette recette."));
  }
  useEffect(load, [recipeId]);
  async function toggleFavorite() {
    if (!isAuthenticated()) return onRequireLogin();
    try {
      if (recipe.is_favorited) {
        const favs = await api.get("/favorites/");
        const match = favs.data.find((f) => f.recipe === recipe.id);
        if (match) await api.delete(`/favorites/${match.id}/`);
      } else {
        await api.post("/favorites/", { recipe: recipe.id });
      }
      load();
    } catch {
      setError("Action impossible.");
    }
  }
  async function submitReview(e) {
    e.preventDefault();
    if (!isAuthenticated()) return onRequireLogin();
    try {
      await api.post(`/recipes/${recipeId}/reviews/`, { rating: newRating, comment: newComment });
      setNewComment("");
      load();
    } catch {
      setError("Impossible d'envoyer l'avis.");
    }
  }
  async function deleteRecipe() {
    if (!window.confirm("Supprimer définitivement cette recette ?")) return;
    setDeleting(true);
    try {
      await api.delete(`/recipes/${recipeId}/`);
      onDeleted();
    } catch {
      setError("Impossible de supprimer cette recette.");
      setDeleting(false);
    }
  }
  if (error) return <p className="error">{error}</p>;
  if (!recipe) return <p>Chargement...</p>;
  return (
    <section className="recipe-detail">
      <button className="back-btn" onClick={onBack}>← Retour</button>
      <div className="recipe-photo large" style={recipe.photo ? { backgroundImage: `url(${recipe.photo})` } : {}}>
        {!recipe.photo && <span className="recipe-photo-placeholder">Photo indisponible</span>}
      </div>
      <div className="recipe-detail-header">
        <h1>{recipe.title}</h1>
        <div className="recipe-header-actions">
          {recipe.is_author && (
            <>
              <button className="fav-btn" onClick={onEdit}>Modifier</button>
              <button className="fav-btn danger" onClick={deleteRecipe} disabled={deleting}>
                {deleting ? "Suppression..." : "Supprimer"}
              </button>
            </>
          )}
          <button className={`fav-btn ${recipe.is_favorited ? "active" : ""}`} onClick={toggleFavorite}>
            {recipe.is_favorited ? "Retirer des favoris" : "Ajouter aux favoris"}
          </button>
        </div>
      </div>
      <p className="recipe-meta">
        Par {recipe.author_name} · {recipe.cuisine || "—"} · {recipe.cook_time_minutes} min
        {recipe.average_rating && ` · Note : ${Number(recipe.average_rating).toFixed(1)}/5`}
      </p>
      {recipe.description && <p className="recipe-description">{recipe.description}</p>}
      <div className="recipe-columns">
        <div>
          <h3>Ingrédients</h3>
          <ul className="ingredient-list">
            {recipe.ingredients.map((i) => (
              <li key={i.id}>{i.quantity} {i.name}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Étapes</h3>
          <ol className="step-list">
            {recipe.steps.map((s) => (
              <li key={s.id}>{s.instruction}</li>
            ))}
          </ol>
        </div>
      </div>
      <div className="reviews">
        <h3>Avis ({recipe.reviews.length})</h3>
        {recipe.reviews.map((r) => (
          <div key={r.id} className="review">
            <strong>{r.username}</strong> — {r.rating}/5
            {r.comment && <p>{r.comment}</p>}
          </div>
        ))}
        <form onSubmit={submitReview} className="review-form">
          <select value={newRating} onChange={(e) => setNewRating(Number(e.target.value))}>
            {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n}/5</option>)}
          </select>
          <input
            type="text" placeholder="Ton avis (optionnel)"
            value={newComment} onChange={(e) => setNewComment(e.target.value)}
          />
          <button type="submit">Envoyer</button>
        </form>
      </div>
    </section>
  );
}
