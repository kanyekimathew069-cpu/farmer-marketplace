import { useEffect, useState } from "react";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Marketplace() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ search: "", category: "", location: "" });
  const [loading, setLoading] = useState(true);
  const [orderingId, setOrderingId] = useState(null);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    const { data } = await client.get("/products", { params });
    setItems(data.items);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleOrder(product) {
    setMessage("");
    const quantity = Number(prompt(`How many ${product.unit} of "${product.title}" would you like?`, "1"));
    if (!quantity || quantity <= 0) return;

    setOrderingId(product._id);
    try {
      await client.post("/orders", { productId: product._id, quantity });
      setMessage(`Order placed for ${quantity} ${product.unit} of ${product.title}.`);
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not place that order.");
    } finally {
      setOrderingId(null);
    }
  }

  return (
    <div className="page">
      <div className="hero">
        <h1>Fresh produce, straight from the farm.</h1>
        <p>Browse listings posted directly by farmers near you — no middlemen, fair prices.</p>
      </div>

      <div className="filters">
        <input
          placeholder="Search produce…"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <input
          placeholder="Category (e.g. vegetables)"
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        />
        <input
          placeholder="Location"
          value={filters.location}
          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
        />
        <button className="linklike" onClick={load} style={{ background: "var(--leaf)", color: "white", padding: "0.5rem 1rem", border: "none", cursor: "pointer" }}>
          Search
        </button>
      </div>

      {message && <p style={{ marginBottom: "1rem" }}>{message}</p>}

      {loading ? (
        <p>Loading listings…</p>
      ) : items.length === 0 ? (
        <p>No listings match yet. Try widening your search.</p>
      ) : (
        <div className="listing-grid">
          {items.map((product) => (
            <div className="listing-card" key={product._id}>
              <h3>{product.title}</h3>
              <div className="meta">
                {product.category} · {product.location || product.farmer?.location || "Location not set"}
              </div>
              <div className="price">
                KES {product.pricePerUnit} / {product.unit}
              </div>
              <div className="meta">{product.quantityAvailable} {product.unit} available · sold by {product.farmer?.name}</div>
              {user?.role === "buyer" ? (
                <button disabled={orderingId === product._id} onClick={() => handleOrder(product)}>
                  {orderingId === product._id ? "Placing order…" : "Order"}
                </button>
              ) : !user ? (
                <button onClick={() => (window.location.href = "/login")}>Log in to order</button>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
