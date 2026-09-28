export default function RecipeCard({ recipe, onOpen, onToggleFavorite }) {
  return (
    <div className="card-wrap">
      <div className="recipe-card" onClick={() => onOpen(recipe.id)}>
        <div className="photo">
          <div
            className="ph-bg"
            style={recipe.photo ? { backgroundImage: `url(${recipe.photo})` } : { background: "var(--rust-dim)" }}
          />
          {!recipe.photo && <span className="photo-placeholder">Photo indisponible</span>}
          {recipe.cuisine && <span className="cuisine-tag">{recipe.cuisine}</span>}
          {onToggleFavorite && (
            <button
              className="fav-icon"
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(recipe); }}
              aria-label={recipe.is_favorited ? "Retirer des favoris" : "Ajouter aux favoris"}
            >
              {recipe.is_favorited ? "Favori" : "Ajouter"}
            </button>
          )}
        </div>
        <div className="body">
          <h3>{recipe.title}</h3>
          <div className="meta-row">
            <span>{recipe.cook_time_minutes} min</span>
            <span className="dot">·</span>
            <span>{recipe.average_rating != null ? `${Number(recipe.average_rating).toFixed(1)}/5 ⭐` : "Nouveau"}</span>
            <span className="dot">·</span>
            <span>{recipe.review_count ?? 0} avis</span>
            {recipe.author_name && <><span className="dot">·</span><span>{recipe.author_name}</span></>}
          </div>
        </div>
      </div>
    </div>
  );
}
