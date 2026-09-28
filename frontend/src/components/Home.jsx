import { useEffect, useState } from "react";
import api from "../api";
import RecipeCard from "./RecipeCard";
import RecipeCarousel from "./RecipeCarousel";
import CuisineExplore from "./CuisineExplore";
import useScrollReveal from "../hooks/useScrollReveal";
function RevealSection({ className = "", stagger = false, style, children }) {
  const ref = useScrollReveal();
  return (
    <div ref={ref} className={`${stagger ? "reveal-stagger" : "reveal"} ${className}`} style={style}>
      {children}
    </div>
  );
}
export default function Home({ onOpenRecipe, onGoDiscover, onSelectCuisine }) {
  const [trending, setTrending] = useState([]);
  const [quick, setQuick] = useState([]);
  useEffect(() => {
    api.get("/recipes/").then((res) => {
      const all = res.data.results ?? res.data;
      setTrending(all.slice(0, 6));
      setQuick([...all].sort((a, b) => a.cook_time_minutes - b.cook_time_minutes).slice(0, 6));
    }).catch(() => {});
  }, []);
  return (
    <div>
      {/* HERO */}
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">SAVORA</span>
          <h1>
            <span className="line">Good food deserves</span>
            <span className="line">to be shared.</span>
          </h1>
          <p>
            Discover recipes from a community of home cooks, save your favorites,
            and share the dishes that make your table feel like home.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={onGoDiscover}>
              Explore recipes <span className="btn-arrow">→</span>
            </button>
            <button className="btn btn-ghost" onClick={onGoDiscover}>
              How it works
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="blob" />
          <div className="hero-main-photo" style={trending[0]?.photo ? { backgroundImage: `url(${trending[0].photo})` } : {}}>
            {!trending[0]?.photo && "Savora"}
          </div>
          <div className="hero-float-card card-a">
            <span className="rating-number">4.8</span>
            <div>
              <div className="label">average</div>
              <div className="sub">from home cooks</div>
            </div>
          </div>
          <div className="hero-float-card card-b">
            <div>
              <div className="label">{trending.length}+ recipes</div>
              <div className="sub">shared this week</div>
            </div>
          </div>
        </div>
      </section>
      {/* TRENDING */}
      <RevealSection className="section">
        <div className="section-head">
          <div>
            <span className="eyebrow">Fresh from the community</span>
            <h2>What's cooking</h2>
          </div>
          <button className="btn btn-ghost" onClick={onGoDiscover}>See all <span className="btn-arrow">→</span></button>
        </div>
        <RevealSection stagger className="trend-grid">
          {trending.map((r) => (
            <RecipeCard key={r.id} recipe={r} onOpen={onOpenRecipe} />
          ))}
        </RevealSection>
      </RevealSection>
      {/* CAROUSEL */}
      <RevealSection className="section">
        <div className="section-head">
          <div>
            <span className="eyebrow">Hand-picked</span>
            <h2>Editor's favorites</h2>
          </div>
        </div>
        <RecipeCarousel recipes={trending} onOpen={onOpenRecipe} />
      </RevealSection>
      {/* CUISINE */}
      <RevealSection className="section">
        <div className="section-head">
          <div>
            <span className="eyebrow">Around the table</span>
            <h2>Explore by cuisine</h2>
          </div>
        </div>
        <CuisineExplore onSelect={onSelectCuisine} />
      </RevealSection>
      {/* QUICK & EASY */}
      <RevealSection className="section">
        <div className="section-head">
          <div>
            <span className="eyebrow">Short on time</span>
            <h2>Delicious doesn't have to take all day</h2>
          </div>
        </div>
        <div className="quick-strip">
          {[10, 15, 20, 25, 30].map((t) => <span key={t} className="time-badge">{t} min</span>)}
        </div>
        <RevealSection stagger className="recipe-grid" style={{ marginTop: 24 }}>
          {quick.map((r) => (
            <RecipeCard key={r.id} recipe={r} onOpen={onOpenRecipe} />
          ))}
        </RevealSection>
      </RevealSection>
      {/* COMMUNITY */}
      <RevealSection className="section">
        <div className="community">
          <div>
            <span className="eyebrow" style={{ color: "var(--gold)" }}>From our kitchen community</span>
            <h2>Real recipes, from real cooks.</h2>
            <p>Every recipe on Savora comes from someone who made it, tasted it, and wanted to share it.</p>
          </div>
          <div className="avatar-stack">
            {["A", "M", "S", "J", "R"].map((initial, i) => (
              <div className="avatar" key={i}>{initial}</div>
            ))}
          </div>
        </div>
      </RevealSection>
      {/* FINAL CTA */}
      <RevealSection className="final-cta">
        <span className="accent-underline" />
        <h2>Your next favorite recipe might be waiting.</h2>
        <button className="btn btn-primary" onClick={onGoDiscover}>
          Start exploring <span className="btn-arrow">→</span>
        </button>
      </RevealSection>
    </div>
  );
}
