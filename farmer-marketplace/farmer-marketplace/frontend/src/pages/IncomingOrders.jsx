import { useEffect, useState } from "react";
import client from "../api/client";

const NEXT_STATUS = {
  placed: "confirmed",
  confirmed: "shipped",
  shipped: "delivered",
};

export default function IncomingOrders() {
  const [orders, setOrders] = useState([]);

  async function load() {
    const { data } = await client.get("/orders/incoming");
    setOrders(data.orders);
  }

  useEffect(() => {
    load();
  }, []);

  async function advance(order) {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    await client.patch(`/orders/${order._id}/status`, { status: next });
    load();
  }

  async function cancel(order) {
    if (!confirm("Cancel this order?")) return;
    await client.patch(`/orders/${order._id}/status`, { status: "cancelled" });
    load();
  }

  return (
    <div className="page">
      <div className="hero">
        <h1>Incoming orders</h1>
        <p>Update order status as you prepare and deliver produce to buyers.</p>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Buyer</th>
            <th>Qty</th>
            <th>Total</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o._id}>
              <td>{o.product?.title}</td>
              <td>{o.buyer?.name} ({o.buyer?.phone})</td>
              <td>{o.quantity} {o.product?.unit}</td>
              <td>KES {o.totalPrice}</td>
              <td>{o.status}</td>
              <td>
                {NEXT_STATUS[o.status] && (
                  <button className="linklike" style={{ color: "var(--leaf)", marginRight: "0.6rem" }} onClick={() => advance(o)}>
                    Mark {NEXT_STATUS[o.status]}
                  </button>
                )}
                {["placed", "confirmed"].includes(o.status) && (
                  <button className="linklike" style={{ color: "var(--clay-red)" }} onClick={() => cancel(o)}>
                    Cancel
                  </button>
                )}
              </td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr>
              <td colSpan={6}>No orders yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
