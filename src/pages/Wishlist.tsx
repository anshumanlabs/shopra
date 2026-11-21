import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

import { useShop } from "../context/ShopContext";
import ProductCard from "../components/ProductCard";
import "./Wishlist.css";

function Wishlist() {
  const { wishlist } = useShop();

  return (
    <main className="wishlist-page">

      <div className="shop-heading">
        <span className="section-tag">YOUR FAVORITES</span>
        <h1>My Wishlist<span>.</span></h1>
        <p>Products you love, all in one place.</p>
      </div>

      {wishlist.length > 0 ? (
        <div className="products-grid">
          {wishlist.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Heart size={50} />

          <h2>Your wishlist is empty.</h2>

          <p>Save your favorite products here.</p>

          <Link to="/shop" className="primary-btn">
            Explore Products
          </Link>
        </div>
      )}

    </main>
  );
}

export default Wishlist;