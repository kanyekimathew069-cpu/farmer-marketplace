import { useEffect, useState } from "react";
import client from "../api/client";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    client.get("/orders/mine").then(({ data }) => setOrders(data.orders));
  }, []);

  return (
    <div className="page">
      <div className="hero">
        <h1>Your orders</h1>
        <p>Track the produce you've ordered and its delivery status.</p>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Farmer</th>
            <th>Qty</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o._id}>
              <td>{o.product?.title}</td>
              <td>{o.farmer?.name} ({o.farmer?.phone})</td>
              <td>{o.quantity} {o.product?.unit}</td>
              <td>KES {o.totalPrice}</td>
              <td>{o.status}</td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr>
              <td colSpan={5}>You haven't placed any orders yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
