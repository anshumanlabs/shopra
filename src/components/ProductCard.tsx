import { Heart, ShoppingBag, Star } from "lucide-react";
import { useShop } from "../context/ShopContext";
import type { Product } from "../types";

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  const { addToCart, toggleWishlist, wishlist } = useShop();

  const isWishlisted = wishlist.some(
    (item) => item.id === product.id
  );

  return (
    <div className="product-card">

      <div className="product-image">

        <img src={product.image} alt={product.name} />

        <span className="discount-badge">
          SALE
        </span>

        <button
          className={`wishlist-btn ${isWishlisted ? "wishlisted" : ""}`}
          onClick={() => toggleWishlist(product)}
          aria-label="Toggle wishlist"
        >
          <Heart
            size={19}
            fill={isWishlisted ? "currentColor" : "none"}
          />
        </button>

        <button
          className="quick-add"
          onClick={() => addToCart(product)}
        >
          <ShoppingBag size={17} />
          Add to Cart
        </button>

      </div>

      <div className="product-info">

        <span className="product-category">
          {product.category}
        </span>

        <h3>{product.name}</h3>

        <div className="rating">
          <Star size={15} fill="#f5c542" color="#f5c542" />
          <span>{product.rating}</span>
        </div>

        <div className="product-price">
          <strong>
            ₹{product.price.toLocaleString("en-IN")}
          </strong>

          <del>
            ₹{product.oldPrice.toLocaleString("en-IN")}
          </del>
        </div>

      </div>

    </div>
  );
}

export default ProductCard;