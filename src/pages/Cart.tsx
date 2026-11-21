import { Link } from "react-router-dom";
import { ShoppingBag, Trash2, ArrowRight } from "lucide-react";

import { useShop } from "../context/ShopContext";

function Cart() {
  const { cart, removeFromCart, clearCart } = useShop();

  const total = cart.reduce(
    (sum, product) => sum + product.price,
    0
  );

  const formatPrice = (price: number) =>
    `₹${price.toLocaleString("en-IN")}`;

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
        <h1>Shopping Cart<span>.</span></h1>
        <p>You have {cart.length} items in your cart.</p>
      </div>

      <div className="cart-layout">

        <section className="cart-items">

          {cart.map((product, index) => (
            <div className="cart-item" key={`${product.id}-${index}`}>

              <img src={product.image} alt={product.name} />

              <div className="cart-item-info">
                <span>{product.category}</span>
                <h3>{product.name}</h3>
                <strong>{formatPrice(product.price)}</strong>
              </div>

              <button
                className="remove-btn"
                onClick={() => removeFromCart(product.id)}
                aria-label={`Remove ${product.name}`}
              >
                <Trash2 size={19} />
              </button>

            </div>
          ))}

          <button className="clear-cart" onClick={clearCart}>
            Remove All Items
          </button>

        </section>

        <aside className="cart-summary">

          <h2>Order Summary</h2>

          <div className="summary-row">
            <span>Subtotal</span>
            <strong>{formatPrice(total)}</strong>
          </div>

          <div className="summary-row">
            <span>Shipping</span>
            <strong>Calculated at checkout</strong>
          </div>

          <div className="summary-total">
            <span>Total</span>
            <h2>{formatPrice(total)}</h2>
          </div>

          <button
            className="checkout-btn"
            onClick={() =>
              alert("Checkout will be connected to a real backend and payment gateway in the next step.")
            }
          >
            Proceed to Checkout <ArrowRight size={18} />
          </button>

          <Link to="/shop" className="continue-shopping">
            Continue Shopping
          </Link>

        </aside>

      </div>

    </main>
  );
}

export default Cart;