
import { useEffect, useState } from "react";

const API = "http://localhost:5000";

export default function App() {
  const [heroes, setHeroes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [search, setSearch] = useState("");
  const [loadingHeroes, setLoadingHeroes] = useState(false);
  const [loadingFavs, setLoadingFavs] = useState(false);

  
  useEffect(() => {
    const q = search.trim();
    setLoadingHeroes(true);
    fetch(`${API}/heroes${q ? `?name_like=${encodeURIComponent(q)}` : ""}`)
      .then((r) => r.json())
      .then((data) => setHeroes(data))
      .catch((err) => console.error(err))
      .finally(() => setLoadingHeroes(false));
  }, [search]);

  
  useEffect(() => {
    setLoadingFavs(true);
    fetch(`${API}/favorites`)
      .then((r) => r.json())
      .then((data) => setFavorites(data))
      .catch((err) => console.error(err))
      .finally(() => setLoadingFavs(false));
  }, []);

  
  const isFavorited = (hero) => favorites.some((f) => f.heroId === hero.id);

  
  const addFavorite = async (hero) => {
    if (isFavorited(hero)) return;
    try {
      const res = await fetch(`${API}/favorites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ heroId: hero.id, hero })
      });
      const created = await res.json();
      setFavorites((prev) => [...prev, created]);
    } catch (e) {
      console.error("Erreur ajout favori", e);
    }
  };

  
  const removeFavorite = async (favResourceId) => {
    try {
      await fetch(`${API}/favorites/${favResourceId}`, { method: "DELETE" });
      setFavorites((prev) => prev.filter((f) => f.id !== favResourceId));
    } catch (e) {
      console.error("Erreur suppression favori", e);
    }
  };

  
  const removeFavoriteByHeroId = async (heroId) => {
    
    const res = await fetch(`${API}/favorites?heroId=${heroId}`);
    const arr = await res.json();
    if (arr.length === 0) return;
    await removeFavorite(arr[0].id);
  };

  return (
    <div style={{ padding: 20, fontFamily: "system-ui, Arial" }}>
      <h1> Marvel </h1>

      <div style={{ marginBottom: 16 }}>
        <input
          placeholder="Rechercher un héros..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: 8, width: 320 }}
        />
      </div>

      <section>
        <h2>Héros</h2>
        {loadingHeroes ? <p>Chargement...</p> : null}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {heroes.map((h) => (
            <div key={h.id} style={{
              width: 220, border: "1px solid #ddd", borderRadius: 8, overflow: "hidden"
            }}>
              <img src={h.thumbnail} alt={h.name} style={{ width: "100%", height: 140, objectFit: "cover" }} />
              <div style={{ padding: 10 }}>
                <h3 style={{ margin: "0 0 8px" }}>{h.name}</h3>
                <p style={{ margin: "0 0 12px", fontSize: 13 }}>{h.description || "—"}</p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => addFavorite(h)} disabled={isFavorited(h)}>
                    {isFavorited(h) ? "⭐ Déjà favori" : "☆ Ajouter"}
                  </button>
                  <button onClick={() => removeFavoriteByHeroId(h.id)}>
                      Retirer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <hr style={{ margin: "24px 0" }} />

      <section>
        <h2>Mes favoris</h2>
        {loadingFavs ? <p>Chargement...</p> : null}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {favorites.length === 0 ? <p>Aucun favori.</p> : favorites.map((f) => (
            <div key={f.id} style={{
              width: 200, border: "1px solid #eee", borderRadius: 8, overflow: "hidden"
            }}>
              <img src={f.hero.thumbnail} alt={f.hero.name} style={{ width: "100%", height: 110, objectFit: "cover" }} />
              <div style={{ padding: 8 }}>
                <strong>{f.hero.name}</strong>
                <div style={{ marginTop: 8 }}>
                  <button onClick={() => removeFavorite(f.id)}>Supprimer</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
