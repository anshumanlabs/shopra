import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Checkout.css";
import { useShop } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";
import type { Order, ShippingAddress } from "../types/orders";
import { validateCard } from "../utils/cardValidator";

const initialAddress: ShippingAddress = {
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
};

function Checkout() {
    const { cart, clearCart } = useShop();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [address, setAddress] = useState(initialAddress);
    const [cardNumber, setCardNumber] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvv, setCvv] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const subtotal = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const shipping = subtotal >= 2000 ? 0 : 99;
    const total = subtotal + shipping;

    const updateAddress = (
        field: keyof ShippingAddress,
        value: string
    ) => {
        setAddress((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    const handlePlaceOrder = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();
        setError("");

        if (!user) {
            navigate("/login");
            return;
        }

        if (cart.length === 0) {
            setError("Your cart is empty.");
            return;
        }

        const validation = validateCard(cardNumber, expiry, cvv);

        if (!validation.valid) {
            setError(validation.errors.join(" "));
            return;
        }

        setLoading(true);

        try {
            const orderId = crypto.randomUUID();

            const order: Order = {
                id: orderId,
                userId: user.id,
                items: cart.map((item) => ({
                    productId: item.id,
                    name: item.name,
                    image: item.image,
                    price: item.price,
                    quantity: item.quantity,
                })),
                shippingAddress: address,
                subtotal,
                discount: 0,
                shipping,
                total,
                orderStatus: "PROCESSING",
                paymentStatus: "PENDING",
                createdAt: new Date().toISOString(),
            };

            // await orderService.createOrder(order);

            // const payment = await paymentService.initiatePayment({
            //     orderId,
            //     amount: total,
            // });

            // let paymentStatus = payment.status;

            // Poll payment status asynchronously.
            // for (let attempt = 0; attempt < 5; attempt++) {
            //     if (paymentStatus !== "PENDING") break;

            //     await new Promise((resolve) => setTimeout(resolve, 2000));

            //     const result = await paymentService.checkPaymentStatus(
            //         payment.id
            //     );

            //     paymentStatus = result.status;
            // }

            // if (paymentStatus !== "SUCCESS") {
            //     await orderService.updateOrder(orderId, {
            //         paymentStatus: "FAILED",
            //         orderStatus: "CANCELLED",
            //     });

            //     throw new Error("Payment failed. Please try again.");
            // }

            // await orderService.updateOrder(orderId, {
            //     paymentStatus: "SUCCESS",
            //     orderStatus: "PLACED",
            // });

            // Card details are never persisted.
            setCardNumber("");
            setExpiry("");
            setCvv("");

            clearCart();

            navigate(`/orders/${orderId}`);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to place your order."
            );
        } finally {
            setLoading(false);
        }
    };

    if (cart.length === 0) {
        return (
            <main className="checkout-page">
                <h1>Your cart is empty</h1>
                <button onClick={() => navigate("/shop")}>
                    Continue Shopping
                </button>
            </main>
        );
    }

    return (
        <main className="checkout-page">
            <h1>Checkout</h1>

            <form onSubmit={handlePlaceOrder} className="checkout-layout">
                <section className="checkout-section">
                    <h2>Delivery Information</h2>

                    {(
                        [
                            ["fullName", "Full name"],
                            ["email", "Email"],
                            ["phone", "Phone number"],
                            ["address", "Address"],
                            ["city", "City"],
                            ["state", "State"],
                            ["pincode", "PIN code"],
                        ] as [keyof ShippingAddress, string][]
                    ).map(([field, label]) => (
                        <label className="checkout-field" key={field}>
                            {label}
                            <input
                                value={address[field]}
                                type={
                                    field === "email"
                                        ? "email"
                                        : field === "phone" || field === "pincode"
                                            ? "tel"
                                            : "text"
                                }
                                required
                                onChange={(event) =>
                                    updateAddress(field, event.target.value)
                                }
                            />
                        </label>
                    ))}

                    <h2>Payment Information</h2>

                    <label className="checkout-field">
                        Card number
                        <input
                            value={cardNumber}
                            onChange={(event) =>
                                setCardNumber(
                                    event.target.value.replace(/[^\d ]/g, "").slice(0, 23)
                                )
                            }
                            placeholder="Enter test card number"
                            inputMode="numeric"
                            autoComplete="cc-number"
                            required
                        />
                    </label>

                    <div className="checkout-card-row">
                        <label className="checkout-field">
                            Expiry (MM/YY)
                            <input
                                value={expiry}
                                onChange={(event) => setExpiry(event.target.value)}
                                placeholder="MM/YY"
                                autoComplete="cc-exp"
                                required
                            />
                        </label>

                        <label className="checkout-field">
                            CVV
                            <input
                                value={cvv}
                                onChange={(event) =>
                                    setCvv(event.target.value.replace(/\D/g, "").slice(0, 4))
                                }
                                placeholder="CVV"
                                inputMode="numeric"
                                autoComplete="cc-csc"
                                required
                            />
                        </label>
                    </div>

                    <p className="checkout-note">
                        Demo only. Never enter real payment card details.
                    </p>

                    {error && (
                        <p className="checkout-error" role="alert">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="checkout-submit"
                        disabled={loading}
                    >
                        {loading ? "Processing payment..." : `Pay ₹${total.toLocaleString("en-IN")}`}
                    </button>
                </section>

                <aside className="checkout-summary">
                    <h2>Order Summary</h2>

                    {cart.map((item) => (
                        <div className="checkout-summary-item" key={item.id}>
                            <span>
                                {item.name} × {item.quantity}
                            </span>
                            <strong>
                                ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                            </strong>
                        </div>
                    ))}

                    <hr />

                    <div className="checkout-summary-item">
                        <span>Subtotal</span>
                        <span>₹{subtotal.toLocaleString("en-IN")}</span>
                    </div>

                    <div className="checkout-summary-item">
                        <span>Shipping</span>
                        <span>{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
                    </div>

                    <hr />

                    <div className="checkout-summary-total">
                        <span>Total</span>
                        <strong>₹{total.toLocaleString("en-IN")}</strong>
                    </div>
                </aside>
            </form>
        </main>
    );
}

export default Checkout;
