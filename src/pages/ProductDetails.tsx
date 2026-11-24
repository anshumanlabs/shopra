import { useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Star,
  MessageCircle,
  UserRound,
  Send,
  Trash2,
} from "lucide-react";

import products from "../data/products";
import { useShop } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";
import "./ProductDetails.css";
import { getProductImage } from "../utils/images";

interface ProductReview {
  id: string;
  productId: number;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

type ReviewSort = "recent" | "highest" | "lowest";

function ProductDetailsContent() {
  const { productId } = useParams();

  const { addToCart, toggleWishlist, wishlist } = useShop();
  const { user, isAuthenticated } = useAuth();

  const product = products.find((item) => item.id === Number(productId));

  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<ProductReview[]>(() => {
    try {
      const saved = localStorage.getItem(`shopora_reviews_${productId}`);

      if (saved) return JSON.parse(saved);

      return product
        ? product.comments.map((comment) => ({
            ...comment,
            productId: product.id,
            userId: `demo-${comment.id}`,
            createdAt: comment.date,
          }))
        : [];
    } catch {
      return [];
    }
  });

  const [selectedRating, setSelectedRating] = useState(0);
  const [comment, setComment] = useState("");
  const [sortBy, setSortBy] = useState<ReviewSort>("recent");
  const [message, setMessage] = useState("");

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

  const isWishlisted = wishlist.some((item) => item.id === product.id);

  const stock = product.stock ?? 0;
  const isAvailable = stock > 0;

  const storageKey = `shopora_reviews_${product.id}`;

  const existingReview = reviews.find((review) => review.userId === user?.id);

  const totalReviews = reviews.length;

  const averageRating =
    totalReviews > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : product.rating;

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => {
    const count = reviews.filter((review) => review.rating === rating).length;

    return {
      rating,
      count,
      percentage: totalReviews > 0 ? (count / totalReviews) * 100 : 0,
    };
  });

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === "highest") {
      return b.rating - a.rating;
    }

    if (sortBy === "lowest") {
      return a.rating - b.rating;
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleAddToCart = () => {
    if (!isAvailable) return;

    addToCart(product, quantity);
  };

  const saveReviews = (updatedReviews: ProductReview[]): boolean => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(updatedReviews));

      setReviews(updatedReviews);

      return true;
    } catch {
      setMessage("Unable to save your review. Please try again.");

      return false;
    }
  };

  const handleSubmitReview = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    if (!isAuthenticated || !user) {
      setMessage("Please login to submit a review.");
      return;
    }

    if (selectedRating < 1 || selectedRating > 5) {
      setMessage("Please select a rating between 1 and 5 stars.");
      return;
    }

    if (!comment.trim()) {
      setMessage("Please write a comment before submitting.");
      return;
    }

    const newReview: ProductReview = {
      id: existingReview?.id ?? crypto.randomUUID(),
      productId: product.id,
      userId: user.id,
      userName: user.name,
      rating: selectedRating,
      comment: comment.trim(),
      createdAt: existingReview?.createdAt ?? new Date().toISOString(),
    };

    const updatedReviews = existingReview
      ? reviews.map((review) => (review.userId === user.id ? newReview : review))
      : [...reviews, newReview];

    const saved = saveReviews(updatedReviews);

    if (saved) {
      setMessage(
        existingReview
          ? "Your review has been updated successfully."
          : "Thank you! Your review has been submitted."
      );
    }
  };

  const handleDeleteReview = () => {
    if (!user || !existingReview) return;

    const updatedReviews = reviews.filter((review) => review.userId !== user.id);

    const saved = saveReviews(updatedReviews);

    if (saved) {
      setSelectedRating(0);
      setComment("");
      setMessage("Your review has been deleted.");
    }
  };

  const renderStars = (rating: number, size = 17, interactive = false) => {
    return Array.from({ length: 5 }, (_, index) => {
      const starNumber = index + 1;
      const active = starNumber <= rating;

      if (interactive) {
        return (
          <button
            key={starNumber}
            type="button"
            className={`review-star-button ${active ? "active" : ""}`}
            onClick={() => {
              setSelectedRating(starNumber);
            }}
            aria-label={`Rate ${starNumber} out of 5 stars`}
            aria-pressed={selectedRating === starNumber}
          >
            <Star size={size} fill={active ? "currentColor" : "none"} />
          </button>
        );
      }

      return (
        <Star
          key={starNumber}
          size={size}
          fill={active ? "currentColor" : "none"}
          className={active ? "star-filled" : "star-empty"}
        />
      );
    });
  };

  return (
    <main className="product-details-page">
      <Link to="/shop" className="back-to-shop">
        <ArrowLeft size={17} />
        Back to Collection
      </Link>

      <div className="product-details-grid">
        <div className="product-details-image">
          <img src={getProductImage(product.image)} alt={product.name} />

          <span className="discount-badge">SPECIAL OFFER</span>
        </div>

        <section className="product-details-content">
          <span className="product-category">{product.category}</span>

          <h1>{product.name}</h1>

          <div className="details-rating">
            <Star size={18} fill="#f5c542" color="#f5c542" />

            <strong>{averageRating.toFixed(1)}</strong>

            <span>
              {totalReviews > 0 ? `${totalReviews} customer reviews` : "Catalogue rating"}
            </span>
          </div>

          <div className="details-price">
            <strong>₹{product.price.toLocaleString("en-IN")}</strong>

            <del>₹{product.oldPrice.toLocaleString("en-IN")}</del>

            <span>
              {Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}% OFF
            </span>
          </div>

          <p className="product-description">{product.description}</p>

          <div className="stock-status">
            <span className={isAvailable ? "in-stock" : "out-stock"}>
              {isAvailable ? `${stock} units available` : "Currently out of stock"}
            </span>
          </div>

          {/* QUANTITY */}

          <div className="quantity-control">
            <span>Quantity</span>

            <div>
              <button
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
              >
                <Minus size={16} />
              </button>

              <span>{quantity}</span>

              <button
                onClick={() => setQuantity((current) => Math.min(stock, current + 1))}
                disabled={!isAvailable || quantity >= stock}
                aria-label="Increase quantity"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* PRODUCT ACTIONS */}

          <div className="details-actions">
            <button
              type="button"
              className="primary-btn add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={!isAvailable}
            >
              <ShoppingBag size={18} />
              <span>{isAvailable ? "Add to Cart" : "Out of Stock"}</span>
            </button>

            <button
              type="button"
              className={`details-wishlist ${isWishlisted ? "active" : ""}`}
              onClick={() => toggleWishlist(product)}
              aria-label="Toggle wishlist"
              aria-pressed={isWishlisted}
            >
              <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
            </button>
          </div>

          <div className="product-benefits">
            <p>Secure checkout</p>
            <p>Easy returns</p>
            <p>Customer support</p>
          </div>
        </section>
      </div>
      {/* PRODUCT INFORMATION */}
      <section className="product-information-section">
        <div className="product-information-card">
          <span className="reviews-eyebrow">PRODUCT SPECIFICATIONS</span>
          <h2>Product Information</h2>

          <div className="product-information-grid">
            <div>
              <span>Product Name</span>
              <strong>{product.name}</strong>
            </div>

            <div>
              <span>Company Name</span>
              <strong>{product.companyName}</strong>
            </div>

            <div>
              <span>SKU</span>
              <strong>{product.sku}</strong>
            </div>

            <div>
              <span>Category</span>
              <strong>{product.category}</strong>
            </div>

            <div>
              <span>Product Price</span>
              <strong>₹{product.price.toLocaleString("en-IN")}</strong>
            </div>

            <div>
              <span>Original Price</span>
              <strong>₹{product.oldPrice.toLocaleString("en-IN")}</strong>
            </div>

            <div>
              <span>Available Stock</span>
              <strong>{product.stock} units</strong>
            </div>

            <div>
              <span>Warranty</span>
              <strong>{product.warranty}</strong>
            </div>
          </div>
        </div>

        {/* SELLER INFORMATION */}
        <div className="seller-information-card">
          <div className="seller-information-heading">
            <div>
              <span className="reviews-eyebrow">TRUSTED SELLER</span>
              <h2>Seller Information</h2>
            </div>

            {product.seller.verified && <span className="verified-seller">✓ Verified Seller</span>}
          </div>

          <div className="seller-information-grid">
            <div>
              <span>Seller Name</span>
              <strong>{product.seller.name}</strong>
            </div>

            <div>
              <span>Business Name</span>
              <strong>{product.seller.businessName}</strong>
            </div>

            <div>
              <span>Seller ID</span>
              <strong>{product.seller.id}</strong>
            </div>

            <div>
              <span>GSTIN</span>
              <strong>{product.seller.gstin}</strong>
            </div>

            <div>
              <span>Seller Rating</span>
              <strong>
                <Star size={15} fill="#f5c542" color="#f5c542" />
                {product.seller.rating.toFixed(1)} / 5
              </strong>
            </div>

            <div>
              <span>Total Seller Reviews</span>
              <strong>{product.seller.totalReviews.toLocaleString("en-IN")}</strong>
            </div>

            <div>
              <span>Location</span>
              <strong>{product.seller.location}</strong>
            </div>

            <div>
              <span>Dispatch Time</span>
              <strong>{product.seller.dispatchTime}</strong>
            </div>

            <div>
              <span>Support Email</span>
              <strong>
                <a href={`mailto:${product.seller.supportEmail}`}>{product.seller.supportEmail}</a>
              </strong>
            </div>

            <div>
              <span>Support Phone</span>
              <strong>
                <a href={`tel:${product.seller.supportPhone}`}>{product.seller.supportPhone}</a>
              </strong>
            </div>
          </div>
        </div>
      </section>

      <section className="product-reviews-section">
        {/* SECTION HEADER */}

        <div className="reviews-heading">
          <div>
            <span className="reviews-eyebrow">CUSTOMER FEEDBACK</span>

            <h2>Reviews & Ratings</h2>

            <p>See what customers think about this product.</p>
          </div>

          <div className="reviews-total">
            <MessageCircle size={19} />
            <span>{totalReviews} Reviews</span>
          </div>
        </div>
        <div className="rating-summary">
          <div className="rating-overview">
            <strong>{averageRating.toFixed(1)}</strong>

            <div className="rating-overview-stars">
              {renderStars(Math.round(averageRating), 20)}
            </div>

            <span>
              {totalReviews > 0
                ? `Based on ${totalReviews} reviews`
                : "Catalogue rating · No customer reviews yet"}
            </span>
          </div>

          <div className="rating-breakdown">
            {ratingDistribution.map((item) => (
              <div className="rating-bar-row" key={item.rating}>
                <span>{item.rating} star</span>

                <div className="rating-bar-track">
                  <div
                    className="rating-bar-fill"
                    style={{
                      width: `${item.percentage}%`,
                    }}
                  />
                </div>

                <span className="rating-count">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="write-review-card">
          <div className="write-review-heading">
            <h3>{existingReview ? "Update Your Review" : "Write a Review"}</h3>

            <p>Share your experience with other customers.</p>
          </div>

          {isAuthenticated && user ? (
            <form className="review-form" onSubmit={handleSubmitReview}>
              <label>Your Rating</label>

              <div className="interactive-rating">
                {renderStars(selectedRating, 29, true)}

                <span>
                  {selectedRating > 0 ? `${selectedRating} out of 5` : "Select your rating"}
                </span>
              </div>

              <label htmlFor="product-review-comment">Your Comment</label>

              <textarea
                id="product-review-comment"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Tell us about your experience with this product..."
                rows={5}
                maxLength={1000}
                required
              />

              <div className="review-form-footer">
                <span>{comment.length}/1000 characters</span>

                <button
                  type="submit"
                  className="submit-review-btn"
                  disabled={!selectedRating || !comment.trim()}
                >
                  <Send size={16} />

                  {existingReview ? "Update Review" : "Submit Review"}
                </button>
              </div>

              {existingReview && (
                <button type="button" className="delete-review-btn" onClick={handleDeleteReview}>
                  <Trash2 size={15} />
                  Delete My Review
                </button>
              )}
            </form>
          ) : (
            <div className="review-login-message">
              <UserRound size={22} />

              <div>
                <strong>Want to share your experience?</strong>

                <p>Login to write a review and rate this product.</p>
              </div>

              <Link to="/login" className="review-login-btn">
                Login
              </Link>
            </div>
          )}

          {message && (
            <p
              className={`review-feedback ${
                message.includes("successfully") ||
                message.includes("Thank you") ||
                message.includes("deleted")
                  ? "success"
                  : "error"
              }`}
              role="status"
            >
              {message}
            </p>
          )}
        </div>

        <div className="customer-reviews">
          <div className="customer-reviews-heading">
            <h3>Customer Comments ({totalReviews})</h3>

            {totalReviews > 0 && (
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as ReviewSort)}
                aria-label="Sort customer reviews"
              >
                <option value="recent">Most Recent</option>

                <option value="highest">Highest Rated</option>

                <option value="lowest">Lowest Rated</option>
              </select>
            )}
          </div>

          {/* EMPTY REVIEWS */}

          {sortedReviews.length === 0 ? (
            <div className="no-reviews">
              <MessageCircle size={35} />

              <h3>No customer reviews yet</h3>

              <p>Be the first to share your experience with this product.</p>
            </div>
          ) : (
            <div className="review-list">
              {sortedReviews.map((review) => (
                <article className="customer-review" key={review.id}>
                  <div className="review-avatar">{review.userName.charAt(0).toUpperCase()}</div>

                  <div className="review-content">
                    <div className="review-user-details">
                      <div>
                        <strong>{review.userName}</strong>

                        <span>
                          {new Date(review.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      {review.userId === user?.id && (
                        <span className="your-review-label">Your Review</span>
                      )}
                    </div>

                    <div className="review-stars">
                      {renderStars(review.rating, 15)}

                      <span>{review.rating}.0</span>
                    </div>

                    <p>{review.comment}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function ProductDetails() {
  const { productId } = useParams();

  return <ProductDetailsContent key={productId} />;
}

export default ProductDetails;
