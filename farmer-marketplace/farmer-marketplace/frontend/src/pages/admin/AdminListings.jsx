import { useEffect, useState } from "react";
import client from "../../api/client";

export default function AdminListings() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("pending");

  async function load() {
    const { data } = await client.get("/admin/products", { params: status ? { status } : {} });
    setItems(data.items);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function approve(id) {
    await client.patch(`/admin/products/${id}/approve`);
    load();
  }

  async function reject(id) {
    const reason = prompt("Reason for rejecting this listing:", "Did not meet listing guidelines.");
    if (reason === null) return;
    await client.patch(`/admin/products/${id}/reject`, { reason });
    load();
  }

  async function remove(id) {
    if (!confirm("Permanently remove this listing?")) return;
    await client.delete(`/admin/products/${id}`);
    load();
  }

  return (
    <>
      <h1>Listings</h1>
      <div className="admin-panel">
        <div className="admin-panel-header">
          <h2>Review queue</h2>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="sold_out">Sold out</option>
            <option value="">All</option>
          </select>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Farmer</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p._id}>
                <td>{p.title}</td>
                <td>{p.farmer?.name}<br /><small>{p.farmer?.email}</small></td>
                <td>KES {p.pricePerUnit}/{p.unit}</td>
                <td>{p.quantityAvailable}</td>
                <td>{p.status}</td>
                <td>
                  {p.status === "pending" && (
                    <>
                      <button className="action-btn approve" onClick={() => approve(p._id)}>Approve</button>
                      <button className="action-btn reject" onClick={() => reject(p._id)}>Reject</button>
                    </>
                  )}
                  <button className="action-btn neutral" onClick={() => remove(p._id)}>Remove</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={6}>Nothing here.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
