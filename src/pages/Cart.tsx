import { Link } from "react-router-dom";
import { ShoppingBag, Trash2, ArrowRight, Minus, Plus } from "lucide-react";

import { useShop } from "../context/ShopContext";
import "./Cart.css";

function Cart() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useShop();

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const formatPrice = (price: number) => `₹${price.toLocaleString("en-IN")}`;

  if (cart.length === 0) {
    return (
      <main className="empty-cart">
        <ShoppingBag size={55} />
        <h1>Your cart is empty.</h1>
        <p>Looks like you haven't added anything yet.</p>

        <Link to="/shop" className="primary-btn">
          Start Shopping <ArrowRight size={18} />
        </Link>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <div className="shop-heading">
        <span className="section-tag">YOUR SHOPPING BAG</span>
        <h1>
          Shopping Cart<span>.</span>
        </h1>
        <p>
          You have {totalItems} {totalItems === 1 ? "item" : "items"} in your cart.
        </p>
      </div>

      <div className="cart-layout">
        <section className="cart-items">
          {cart.map((item) => (
            <article className="cart-item" key={item.id}>
              <Link to={`/products/${item.id}`}>
                <img src={item.image} alt={item.name} />
              </Link>

              <div className="cart-item-info">
                <span>{item.category}</span>
                <h3>
                  <Link to={`/products/${item.id}`}>{item.name}</Link>
                </h3>

                <strong>{formatPrice(item.price)}</strong>

                <div className="cart-quantity">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    aria-label={`Decrease ${item.name} quantity`}
                  >
                    <Minus size={15} />
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={item.stock !== undefined && item.quantity >= item.stock}
                    aria-label={`Increase ${item.name} quantity`}
                  >
                    <Plus size={15} />
                  </button>
                </div>

                <p className="cart-line-total">
                  Subtotal: <strong>{formatPrice(item.price * item.quantity)}</strong>
                </p>
              </div>

              <button
                className="remove-btn"
                onClick={() => removeFromCart(item.id)}
                aria-label={`Remove ${item.name} from cart`}
              >
                <Trash2 size={19} />
              </button>
            </article>
          ))}

          <button className="clear-cart" onClick={clearCart}>
            Remove All Items
          </button>
        </section>

        <aside className="cart-summary">
          <h2>Order Summary</h2>

          <div className="summary-row">
            <span>Total Items</span>
            <strong>{totalItems}</strong>
          </div>

          <div className="summary-row">
            <span>Subtotal</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>

          <div className="summary-row">
            <span>Shipping</span>
            <strong>Calculated at checkout</strong>
          </div>

          <div className="summary-total">
            <span>Total</span>
            <h2>{formatPrice(subtotal)}</h2>
          </div>

          <Link to="/checkout" className="checkout-btn">
            Proceed to Checkout <ArrowRight size={18} />
          </Link>

          <Link to="/shop" className="continue-shopping">
            Continue Shopping
          </Link>
        </aside>
      </div>
    </main>
  );
}

export default Cart;
