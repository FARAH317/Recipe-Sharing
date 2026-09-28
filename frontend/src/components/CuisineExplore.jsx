const CUISINES = [
  { name: "Italian", image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=80" },
  { name: "Algerian", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80" },
  { name: "French", image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=80" },
  { name: "Mediterranean", image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80" },
  { name: "Asian", image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=80" },
  { name: "Desserts", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80" },
];
export default function CuisineExplore({ onSelect }) {
  return (
    <div className="cuisine-grid">
      {CUISINES.map((c) => (
        <div key={c.name} className="cuisine-tile" style={{ backgroundImage: `url(${c.image})` }} onClick={() => onSelect(c.name)}>
          <span>{c.name} <span className="arrow">→</span></span>
        </div>
      ))}
    </div>
  );
}
