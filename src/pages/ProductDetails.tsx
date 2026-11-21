
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Heart,
    Minus,
    Plus,
    ShoppingBag,
    Star,
} from "lucide-react";

import products from "../data/products";
import { useShop } from "../context/ShopContext";

function ProductDetails() {
    const { productId } = useParams();
    const { addToCart, toggleWishlist, wishlist } = useShop();

    const product = products.find(
        (item) => item.id === Number(productId)
    );

    const [quantity, setQuantity] = useState(1);

    if (!product) {
        return (
            <main className="product-not-found">
                <h1>Product not found</h1>
                <p>The product you're looking for does not exist.</p>
                <Link to="/shop" className="primary-btn">
                    Back to Shop
                </Link>
            </main>
        );
    }

    const isWishlisted = wishlist.some(
        (item) => item.id === product.id
    );

    const stock = product.stock ?? 0;
    const isAvailable = stock > 0;


    const handleAddToCart = () => {
        if (!isAvailable) return;

        addToCart(product, quantity);
    };


    return (
        <main className="product-details-page">
            <Link to="/shop" className="back-to-shop">
                <ArrowLeft size={17} />
                Back to Collection
            </Link>

            <div className="product-details-grid">
                <div className="product-details-image">
                    <img src={product.image} alt={product.name} />
                    <span className="discount-badge">SPECIAL OFFER</span>
                </div>

                <section className="product-details-content">
                    <span className="product-category">{product.category}</span>

                    <h1>{product.name}</h1>

                    <div className="details-rating">
                        <Star size={18} fill="#f5c542" color="#f5c542" />
                        <strong>{product.rating}</strong>
                        <span>Customer rating</span>
                    </div>

                    <div className="details-price">
                        <strong>
                            ₹{product.price.toLocaleString("en-IN")}
                        </strong>
                        <del>
                            ₹{product.oldPrice.toLocaleString("en-IN")}
                        </del>

                        <span>
                            {Math.round(
                                ((product.oldPrice - product.price) /
                                    product.oldPrice) *
                                100
                            )}
                            % OFF
                        </span>
                    </div>

                    <p className="product-description">
                        {product.description}
                    </p>

                    <div className="stock-status">
                        <span className={isAvailable ? "in-stock" : "out-stock"}>
                            {isAvailable
                                ? `${stock} units available`
                                : "Currently out of stock"}
                        </span>
                    </div>

                    <div className="quantity-control">
                        <span>Quantity</span>

                        <div>
                            <button
                                onClick={() =>
                                    setQuantity((current) => Math.max(1, current - 1))
                                }
                                disabled={quantity <= 1}
                                aria-label="Decrease quantity"
                            >
                                <Minus size={16} />
                            </button>

                            <span>{quantity}</span>

                            <button
                                onClick={() =>
                                    setQuantity((current) =>
                                        Math.min(stock, current + 1)
                                    )
                                }
                                disabled={!isAvailable || quantity >= stock}
                                aria-label="Increase quantity"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="details-actions">
                        <button
                            className="primary-btn"
                            onClick={handleAddToCart}
                            disabled={!isAvailable}
                        >
                            <ShoppingBag size={18} />
                            {isAvailable ? "Add to Cart" : "Out of Stock"}
                        </button>

                        <button
                            className={`details-wishlist ${isWishlisted ? "active" : ""}`}
                            onClick={() => toggleWishlist(product)}
                            aria-label="Toggle wishlist"
                            aria-pressed={isWishlisted}
                        >
                            <Heart
                                size={20}
                                fill={isWishlisted ? "currentColor" : "none"}
                            />
                        </button>
                    </div>

                    <div className="product-benefits">
                        <p>Secure checkout</p>
                        <p>Easy returns</p>
                        <p>Customer support</p>
                    </div>
                </section>
            </div>
        </main>
    );
}

export default ProductDetails;
