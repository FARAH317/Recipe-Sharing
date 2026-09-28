import { useState, useEffect } from "react";
import api from "../api";
export default function RecipeForm({ recipeId, onCreated, onCancel }) {
  const [title, setTitle] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [existingPhoto, setExistingPhoto] = useState(null);
  const [ingredients, setIngredients] = useState([{ name: "", quantity: "" }]);
  const [steps, setSteps] = useState([{ instruction: "" }]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!recipeId) return;
    setLoading(true);
    api.get(`/recipes/${recipeId}/`)
      .then(({ data }) => {
        setTitle(data.title ?? "");
        setCuisine(data.cuisine ?? "");
        setCookTime(data.cook_time_minutes ?? "");
        setDescription(data.description ?? "");
        setExistingPhoto(data.photo);
        setIngredients(data.ingredients.length ? data.ingredients : [{ name: "", quantity: "" }]);
        setSteps(data.steps.length ? data.steps : [{ instruction: "" }]);
      })
      .catch(() => setError("Impossible de charger cette recette."))
      .finally(() => setLoading(false));
  }, [recipeId]);
  useEffect(() => {
    if (!photo) { setPhotoPreview(null); return; }
    const url = URL.createObjectURL(photo);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);
  function updateIngredient(i, field, value) {
    setIngredients((list) => list.map((ing, idx) => idx === i ? { ...ing, [field]: value } : ing));
  }
  function removeIngredient(i) {
    setIngredients((list) => list.filter((_, idx) => idx !== i));
  }
  function updateStep(i, value) {
    setSteps((list) => list.map((s, idx) => idx === i ? { instruction: value } : s));
  }
  function removeStep(i) {
    setSteps((list) => list.filter((_, idx) => idx !== i));
  }
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const recipeData = {
        title,
        cuisine,
        cook_time_minutes: Number(cookTime) || 0,
        description,
        ingredients: ingredients.filter((i) => i.name.trim()),
        steps: steps
          .filter((s) => s.instruction.trim())
          .map((s, idx) => ({ order: idx+1, instruction: s.instruction })),
      };
      const { data: created } = recipeId
        ? await api.patch(`/recipes/${recipeId}/`, recipeData)
        : await api.post("/recipes/", recipeData);
      if (photo) {
        const formData = new FormData();
        formData.append("photo", photo);
        await api.patch(`/recipes/${created.id}/`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      onCreated(created.id);
    } catch {
      setError(recipeId ? "Impossible de modifier la recette — vérifie les champs." : "Impossible de créer la recette — vérifie les champs.");
    } finally {
      setSaving(false);
    }
  }
  if (loading) return <div className="recipe-form-page"><p>Chargement...</p></div>;
  return (
    <div className="recipe-form-page">
      <span className="eyebrow">Share a recipe</span>
      <h1>{recipeId ? "Modifier la recette" : "Write your recipe"}</h1>
      <form onSubmit={handleSubmit} className="recipe-form">
        {error && <p className="error">{error}</p>}
        <div className="form-card">
          <h3>Recipe information</h3>
          <div className="form-row">
            <input type="text" placeholder="Titre de la recette" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="two-col">
            <input type="text" placeholder="Cuisine (ex: italienne)" value={cuisine} onChange={(e) => setCuisine(e.target.value)} />
            <input type="number" placeholder="Temps (min)" value={cookTime} onChange={(e) => setCookTime(e.target.value)} />
          </div>
          <textarea placeholder="Description — qu'est-ce qui rend cette recette spéciale ?" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="form-card">
          <h3>Recipe image</h3>
          {photoPreview || existingPhoto ? (
            <div className="upload-preview" style={{ backgroundImage: `url(${photoPreview || existingPhoto})`, position: "relative" }}>
              <label className="upload-zone" style={{ position: "absolute", inset: 0, border: "none", background: "rgba(51,40,32,0.35)", opacity: 0 }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                onMouseLeave={(e) => e.currentTarget.style.opacity = 0}>
                <span className="txt" style={{ color: "#fff" }}>Changer l'image</span>
                <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files[0])} />
              </label>
            </div>
          ) : (
            <label className="upload-zone">
              <span className="txt">Glisse une photo ici, ou clique pour choisir un fichier</span>
              <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files[0])} />
            </label>
          )}
        </div>
        <div className="form-card">
          <h3>Ingredients</h3>
          {ingredients.map((ing, i) => (
            <div className="ingredient-row" key={i}>
              <input className="qty" type="text" placeholder="Quantité (200g)" value={ing.quantity}
                onChange={(e) => updateIngredient(i, "quantity", e.target.value)} />
              <input type="text" placeholder="Ingrédient" value={ing.name}
                onChange={(e) => updateIngredient(i, "name", e.target.value)} />
              {ingredients.length > 1 && (
                <button type="button" className="remove-row" onClick={() => removeIngredient(i)}>x</button>
              )}
            </div>
          ))}
          <button type="button" className="add-btn" onClick={() => setIngredients((l) => [...l, { name: "", quantity: "" }])}>
            + Ajouter un ingrédient
          </button>
        </div>
        <div className="form-card">
          <h3>Cooking steps</h3>
          {steps.map((s, i) => (
            <div className="step-row" key={i}>
              <div className="step-num">{String(i+1).padStart(2, "0")}</div>
              <textarea placeholder={`Décris l'étape ${i+1}...`} value={s.instruction}
                onChange={(e) => updateStep(i, e.target.value)} style={{ flex: 1 }} />
              {steps.length > 1 && (
                <button type="button" className="remove-row" onClick={() => removeStep(i)}>x</button>
              )}
            </div>
          ))}
          <button type="button" className="add-btn" onClick={() => setSteps((l) => [...l, { instruction: "" }])}>
            + Ajouter une étape
          </button>
        </div>
        <div className="recipe-form-actions">
          {recipeId && <button type="button" className="btn btn-ghost" onClick={onCancel}>Annuler</button>}
          <button type="submit" className="submit-btn" disabled={saving}>
            {saving ? "Enregistrement..." : recipeId ? "Enregistrer les modifications" : "Publier la recette"}
          </button>
        </div>
      </form>
    </div>
  );
}
