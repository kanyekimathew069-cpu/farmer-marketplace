import { useEffect, useState } from "react";
import client from "../../api/client";

export default function AdminOverview() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    client.get("/admin/stats").then(({ data }) => setStats(data));
  }, []);

  if (!stats) return <p>Loading…</p>;

  const cells = [
    ["Farmers", stats.totalFarmers],
    ["Buyers", stats.totalBuyers],
    ["Pending listings", stats.pendingListings],
    ["Approved listings", stats.approvedListings],
    ["Total orders", stats.totalOrders],
    ["Revenue (KES)", stats.totalRevenue.toLocaleString()],
  ];

  return (
    <>
      <h1>Overview</h1>
      <div className="stat-row">
        {cells.map(([label, value]) => (
          <div className="stat-cell" key={label}>
            <span className="label">{label}</span>
            <span className="value">{value}</span>
          </div>
        ))}
      </div>
      {stats.pendingListings > 0 && (
        <div className="admin-panel">
          <div className="admin-panel-header">
            <h2>Action needed</h2>
          </div>
          <div style={{ padding: "1rem 1.2rem" }}>
            {stats.pendingListings} listing(s) are waiting for review on the Listings page.
          </div>
        </div>
      )}
    </>
  );
}
