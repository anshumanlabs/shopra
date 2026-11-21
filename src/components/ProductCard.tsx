import { Heart, ShoppingBag, Star, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import type { Product } from "../types";
import "./ProductCard.css";

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  const { addToCart, toggleWishlist, wishlist } = useShop();

  const isWishlisted = wishlist.some((item) => item.id === product.id);

  return (
    <div className="product-card">
      <div className="product-image">
        <Link to={`/products/${product.id}`} aria-label={`View ${product.name}`}>
          <img src={product.image} alt={product.name} loading="lazy" />
        </Link>

        <button
          className={`wishlist-btn ${isWishlisted ? "wishlisted" : ""}`}
          onClick={() => toggleWishlist(product)}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={isWishlisted}
        >
          <Heart size={19} fill={isWishlisted ? "currentColor" : "none"} />
        </button>

        <button
          className="quick-add"
          onClick={() => addToCart(product)}
          disabled={product.stock === 0}
        >
          <ShoppingBag size={17} />
          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>

      <div className="product-info">
        <span className="product-category">{product.category}</span>

        <Link to={`/products/${product.id}`} className="product-title-link">
          <h3>{product.name}</h3>
        </Link>

        <div className="rating">
          <Star size={15} fill="#f5c542" color="#f5c542" />
          <span>{product.rating}</span>
        </div>

        <div className="product-price">
          <strong>₹{product.price.toLocaleString("en-IN")}</strong>
          <del>₹{product.oldPrice.toLocaleString("en-IN")}</del>
        </div>

        <Link to={`/products/${product.id}`} className="view-details-link">
          <Eye size={15} /> View Details
        </Link>
      </div>
    </div>
  );
}

export default ProductCard;
