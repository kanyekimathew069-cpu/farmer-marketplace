import { useEffect, useState } from "react";
import client from "../api/client";

const emptyForm = {
  title: "",
  category: "",
  unit: "kg",
  pricePerUnit: "",
  quantityAvailable: "",
  location: "",
  description: "",
};

export default function FarmerDashboard() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const { data } = await client.get("/products/mine");
    setItems(data.items);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await client.post("/products", form);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create the listing.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Remove this listing?")) return;
    await client.delete(`/products/${id}`);
    load();
  }

  return (
    <div className="page">
      <div className="hero">
        <h1>Your listings</h1>
        <p>New listings are reviewed before they appear in the marketplace.</p>
      </div>

      <div className="form-card" style={{ margin: "0 0 2.5rem" }}>
        <h2>Add a new listing</h2>
        <form onSubmit={handleSubmit}>
          <label>What are you selling?</label>
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />

          <label>Category</label>
          <input
            required
            placeholder="e.g. Vegetables, Grains, Fruit"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />

          <label>Unit</label>
          <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
            <option value="kg">kg</option>
            <option value="bag">bag</option>
            <option value="crate">crate</option>
            <option value="litre">litre</option>
            <option value="piece">piece</option>
          </select>

          <label>Price per unit (KES)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            required
            value={form.pricePerUnit}
            onChange={(e) => setForm({ ...form, pricePerUnit: e.target.value })}
          />

          <label>Quantity available</label>
          <input
            type="number"
            min="0"
            required
            value={form.quantityAvailable}
            onChange={(e) => setForm({ ...form, quantityAvailable: e.target.value })}
          />

          <label>Farm location</label>
          <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />

          <label>Description</label>
          <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

          {error && <p className="error-msg">{error}</p>}
          <button type="submit" disabled={busy}>
            {busy ? "Submitting…" : "Submit listing"}
          </button>
        </form>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Qty</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((p) => (
            <tr key={p._id}>
              <td>{p.title}</td>
              <td>KES {p.pricePerUnit}/{p.unit}</td>
              <td>{p.quantityAvailable}</td>
              <td>
                <span className={`status-tag status-${p.status}`}>{p.status.replace("_", " ")}</span>
                {p.status === "rejected" && p.rejectionReason && (
                  <div style={{ fontSize: "0.8rem", color: "#7a2e24", marginTop: "0.2rem" }}>{p.rejectionReason}</div>
                )}
              </td>
              <td>
                <button className="linklike" style={{ color: "var(--clay-red)" }} onClick={() => handleDelete(p._id)}>
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
