import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import RequireRole from "./components/RequireRole";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Marketplace from "./pages/Marketplace";
import FarmerDashboard from "./pages/FarmerDashboard";
import IncomingOrders from "./pages/IncomingOrders";
import MyOrders from "./pages/MyOrders";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminListings from "./pages/admin/AdminListings";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminOrders from "./pages/admin/AdminOrders";

export default function App() {
  return (
    <Routes>
      {/* Admin interface has its own shell/layout, no marketplace navbar */}
      <Route
        path="/admin"
        element={
          <RequireRole roles={["admin"]}>
            <AdminLayout />
          </RequireRole>
        }
      >
        <Route index element={<AdminOverview />} />
        <Route path="listings" element={<AdminListings />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="orders" element={<AdminOrders />} />
      </Route>

      {/* User-facing marketplace */}
      <Route
        path="/*"
        element={
          <>
            <Navbar />
            <Routes>
              <Route path="/" element={<Marketplace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/orders"
                element={
                  <RequireRole roles={["buyer"]}>
                    <MyOrders />
                  </RequireRole>
                }
              />
              <Route
                path="/farmer/listings"
                element={
                  <RequireRole roles={["farmer"]}>
                    <FarmerDashboard />
                  </RequireRole>
                }
              />
              <Route
                path="/farmer/orders"
                element={
                  <RequireRole roles={["farmer"]}>
                    <IncomingOrders />
                  </RequireRole>
                }
              />
            </Routes>
          </>
        }
      />
    </Routes>
  );
}
