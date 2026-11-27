import { useState } from "react";
import { Search, ShoppingBag, Heart, Menu, X, UserRound } from "lucide-react";

import { Link, NavLink, useNavigate } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const { cart, wishlist } = useShop();

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="navbar">
      <div className="nav-container">
        <Link to="/" className="logo" onClick={closeMenu}>
          SHOP<span>ORA.</span>
        </Link>

        <nav className={`nav-links ${menuOpen ? "active" : ""}`}>
          <NavLink to="/" onClick={closeMenu}>
            Home
          </NavLink>
          <NavLink to="/shop" onClick={closeMenu}>
            Shop
          </NavLink>
          <NavLink to="/about" onClick={closeMenu}>
            About
          </NavLink>
          <NavLink to="/contact" onClick={closeMenu}>
            Contact
          </NavLink>
        </nav>

        <div className="nav-icons">
          <button aria-label="Search" onClick={() => setSearchOpen(!searchOpen)}>
            <Search />
          </button>

          <Link to="/wishlist" className="icon-link" aria-label="Wishlist">
            <Heart />
            {wishlist.length > 0 && <span className="icon-count">{wishlist.length}</span>}
          </Link>

          <Link
            to={isAuthenticated ? "/profile" : "/login"}
            className="icon-link"
            aria-label="My Account"
          >
            <UserRound />
          </Link>

          <Link to="/cart" className="icon-link" aria-label="Shopping cart">
            <ShoppingBag />
            {cart.length > 0 && <span className="icon-count">{cart.length}</span>}
          </Link>
        </div>

        <button
          className="menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {searchOpen && (
        <form
          className="search-bar"
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const query = new FormData(form).get("search");
            navigate(`/shop?search=${encodeURIComponent(String(query))}`);
          }}
        >
          <input name="search" placeholder="Search products..." autoFocus />
          <button type="submit">
            <Search size={20} />
          </button>
        </form>
      )}
    </header>
  );
}

export default Navbar;
