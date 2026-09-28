import { useEffect, useState } from "react";
import api from "../api";
import RecipeCard from "./RecipeCard";
import useScrollReveal from "../hooks/useScrollReveal";
const CHIPS = ["Tous", "Italian", "Algerian", "French", "Mediterranean", "Asian", "Desserts"];
export default function RecipeList({ onOpenRecipe, initialCuisine }) {
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState("");
  const [ingredient, setIngredient] = useState("");
  const [cuisine, setCuisine] = useState(initialCuisine || "Tous");
  const [error, setError] = useState("");
  const gridRef = useScrollReveal();
  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (ingredient) params.ingredient = ingredient;
    if (cuisine && cuisine !== "Tous") params.cuisine = cuisine;
    api.get("/recipes/", { params })
      .then((res) => setRecipes(res.data.results ?? res.data))
      .catch(() => setError("Impossible de charger les recettes."));
  }, [search, ingredient, cuisine]);
  return (
    <div>
      <div className="discover-head">
        <span className="eyebrow">Recipe discovery</span>
        <h1>Find your next dish</h1>
        <div className="filters">
          <input type="text" placeholder="Rechercher un titre..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <input type="text" placeholder="Ingrédient..." value={ingredient} onChange={(e) => setIngredient(e.target.value)} />
        </div>
        <div className="chip-row">
          {CHIPS.map((c) => (
            <button key={c} className={`chip ${cuisine === c ? "active" : ""}`} onClick={() => setCuisine(c)}>
              {c}
            </button>
          ))}
        </div>
      </div>
      <div className="page">
        {error && <p className="error">{error}</p>}
        <div ref={gridRef} className="reveal-stagger recipe-grid in">
          {recipes.map((r) => (
            <RecipeCard key={r.id} recipe={r} onOpen={onOpenRecipe} />
          ))}
        </div>
        {recipes.length === 0 && !error && <p className="empty">Aucune recette trouvée.</p>}
      </div>
    </div>
  );
}
