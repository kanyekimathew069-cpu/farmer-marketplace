import { useEffect, useState } from "react";
import client from "../../api/client";

export default function AdminUsers() {
  const [items, setItems] = useState([]);
  const [role, setRole] = useState("");
  const [search, setSearch] = useState("");

  async function load() {
    const params = {};
    if (role) params.role = role;
    if (search) params.search = search;
    const { data } = await client.get("/admin/users", { params });
    setItems(data.items);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  async function toggleActive(u) {
    await client.patch(`/admin/users/${u._id}/status`, { isActive: !u.isActive });
    load();
  }

  return (
    <>
      <h1>Users</h1>
      <div className="admin-panel">
        <div className="admin-panel-header">
          <h2>All accounts</h2>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              placeholder="Search name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load()}
              style={{ padding: "0.35rem 0.5rem", border: "1px solid var(--border)", fontSize: "0.85rem" }}
            />
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="">All roles</option>
              <option value="farmer">Farmers</option>
              <option value="buyer">Buyers</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td><span className={`badge ${u.role}`}>{u.role}</span></td>
                <td>{u.isActive ? "Active" : "Deactivated"}</td>
                <td>
                  <button className="action-btn neutral" onClick={() => toggleActive(u)}>
                    {u.isActive ? "Deactivate" : "Reactivate"}
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5}>No users match.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
