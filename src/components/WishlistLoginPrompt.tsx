import { LogIn, UserRound, X } from "lucide-react";
import { Link } from "react-router-dom";

import "./WishlistLoginPrompt.css";

interface WishlistLoginPromptProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
}

function WishlistLoginPrompt({ isOpen, onClose, productName }: WishlistLoginPromptProps) {
  if (!isOpen) return null;

  return (
    <div className="wishlist-login-overlay" onClick={onClose}>
      <div className="wishlist-login-modal" onClick={(e) => e.stopPropagation()}>
        <div className="wishlist-login-header">
          <UserRound size={24} />
          <h3>Log in to use your wishlist</h3>
          <button className="wishlist-login-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <p className="wishlist-login-message">
          {productName ? `Add "${productName}" to your wishlist` : "Save your favorite products"} —
          please log in first.
        </p>

        <div className="wishlist-login-actions">
          <Link to="/login" className="wishlist-login-btn">
            <LogIn size={18} />
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default WishlistLoginPrompt;
