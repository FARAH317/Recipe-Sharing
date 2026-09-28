import RecipeCard from "./RecipeCard";
export default function RecipeCarousel({ recipes, onOpen }) {
  return (
    <div className="carousel">
      {recipes.map((r) => (
        <RecipeCard key={r.id} recipe={r} onOpen={onOpen} />
      ))}
    </div>
  );
}
