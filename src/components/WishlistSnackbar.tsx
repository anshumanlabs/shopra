import { X } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";

import "./WishlistSnackbar.css";

interface WishlistSnackbarProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
}

function WishlistSnackbar({ isOpen, onClose, productName }: WishlistSnackbarProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const id = setTimeout(() => {
      onClose();
    }, 5000);

    timerRef.current = id;

    return () => {
      clearTimeout(id);
    };
  }, [isOpen, onClose]);

  const dismiss = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="wishlist-snackbar">
      <div className="wishlist-snackbar-content">
        <span className="wishlist-snackbar-icon">❤️</span>
        <span className="wishlist-snackbar-message">
          {productName ? `Add "${productName}" to your wishlist` : "Save your favorite products"} —
          please log in first.
        </span>
        <Link to="/login" className="wishlist-snackbar-action">
          Log in
        </Link>
        <button className="wishlist-snackbar-close" onClick={dismiss} aria-label="Dismiss">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

export default WishlistSnackbar;
