import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "buyer",
    phone: "",
    location: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const user = await register(form);
      navigate(user.role === "farmer" ? "/farmer/listings" : "/");
    } catch (err) {
      setError(err.response?.data?.message || "Could not create your account.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="form-card">
      <h2>Create an account</h2>
      <form onSubmit={handleSubmit}>
        <label>I am a</label>
        <select value={form.role} onChange={(e) => update("role", e.target.value)}>
          <option value="buyer">Buyer — I want to purchase produce</option>
          <option value="farmer">Farmer — I want to sell produce</option>
        </select>

        <label>Full name</label>
        <input required value={form.name} onChange={(e) => update("name", e.target.value)} />

        <label>Email</label>
        <input type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} />

        <label>Password</label>
        <input
          type="password"
          required
          minLength={6}
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
        />

        <label>Phone</label>
        <input value={form.phone} onChange={(e) => update("phone", e.target.value)} />

        <label>Location</label>
        <input
          placeholder="e.g. Kiambu, Kenya"
          value={form.location}
          onChange={(e) => update("location", e.target.value)}
        />

        {error && <p className="error-msg">{error}</p>}
        <button type="submit" disabled={busy}>
          {busy ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p className="switch">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
