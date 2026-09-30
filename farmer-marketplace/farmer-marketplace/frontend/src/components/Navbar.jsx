import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="market-nav">
      <Link to="/" className="brand">
        Shamba<span>Direct</span>
      </Link>
      <nav>
        <Link to="/">Browse</Link>
        {user?.role === "farmer" && (
          <>
            <Link to="/farmer/listings">My listings</Link>
            <Link to="/farmer/orders">Incoming orders</Link>
          </>
        )}
        {user?.role === "buyer" && <Link to="/orders">My orders</Link>}
        {user?.role === "admin" && <Link to="/admin">Admin panel</Link>}
        {user ? (
          <>
            <span className="pill">{user.name}</span>
            <button
              className="linklike"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Log in</Link>
            <Link to="/register">Sign up</Link>
          </>
        )}
      </nav>
    </header>
  );
}
