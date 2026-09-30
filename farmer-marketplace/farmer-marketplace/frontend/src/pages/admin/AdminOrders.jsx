import { useEffect, useState } from "react";
import client from "../../api/client";

export default function AdminOrders() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const params = status ? { status } : {};
    client.get("/admin/orders", { params }).then(({ data }) => setItems(data.items));
  }, [status]);

  return (
    <>
      <h1>Orders</h1>
      <div className="admin-panel">
        <div className="admin-panel-header">
          <h2>All orders</h2>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option value="placed">Placed</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Buyer</th>
              <th>Farmer</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((o) => (
              <tr key={o._id}>
                <td>{o.product?.title}</td>
                <td>{o.buyer?.name}</td>
                <td>{o.farmer?.name}</td>
                <td>KES {o.totalPrice}</td>
                <td>{o.status}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5}>No orders match.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
