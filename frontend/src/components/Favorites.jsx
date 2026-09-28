import { useEffect, useState } from "react";
import api from "../api";
import RecipeCard from "./RecipeCard";
export default function Favorites({ onOpenRecipe }) {
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => {
    api.get("/favorites/")
      .then((res) => setFavorites(res.data))
      .catch(() => setError("Impossible de charger tes favoris."));
  }, []);
  if (error) return <p className="error">{error}</p>;
  return (
    <div className="favorites-page">
      <span className="eyebrow">Your collection</span>
      <h1>Mes favoris</h1>
      <div className="recipe-grid" style={{ marginTop: 28 }}>
        {favorites.map((f) => (
          <RecipeCard key={f.id} recipe={f.recipe_detail} onOpen={() => onOpenRecipe(f.recipe)} />
        ))}
      </div>
      {favorites.length === 0 && <p className="empty">Aucun favori pour l'instant.</p>}
    </div>
  );
}
