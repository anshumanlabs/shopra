import { Link, useNavigate } from "react-router-dom";
import { UserRound, Mail, LogOut, ShoppingBag } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./Profile.css";

function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <main className="profile-page">
      <div className="profile-header">
        <span className="auth-tag">MY ACCOUNT</span>
        <h1>
          Welcome, <span>{user.name}</span>
        </h1>
        <p>Manage your SHOPORA account and shopping activity.</p>
      </div>

      <div className="profile-grid">
        <section className="profile-card">
          <div className="profile-avatar">
            <UserRound size={35} />
          </div>

          <h2>{user.name}</h2>
          <span className="profile-role">{user.role}</span>

          <div className="profile-detail">
            <Mail size={18} />
            <span>{user.email}</span>
          </div>

          <button className="auth-submit" onClick={handleLogout}>
            <LogOut size={18} /> Logout
          </button>
        </section>

        <section className="profile-card profile-actions">
          <h2>Quick links</h2>

          <Link to="/orders" className="profile-link">
            <ShoppingBag size={20} />
            <span>My Orders</span>
          </Link>

          <Link to="/shop" className="profile-link">
            <ShoppingBag size={20} />
            <span>Continue Shopping</span>
          </Link>
        </section>
      </div>
    </main>
  );
}

export default Profile;
