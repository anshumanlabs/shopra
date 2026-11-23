import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Plus, CreditCard, CheckCircle2, ShieldCheck } from "lucide-react";

import "./Checkout.css";
import { useShop } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";
import type { ShippingAddress } from "../types/orders";
import { validateCard } from "../utils/cardValidator";
import { orderService } from "../services/orderService";

type SavedAddress = ShippingAddress & {
  id: string;
  isDefault: boolean;
};

const initialAddress: ShippingAddress = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 19);
  return digits.match(/.{1,4}/g)?.join(" ") ?? "";
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);

  if (digits.length <= 2) return digits;

  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function validateExpiry(value: string) {
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(value)) {
    return "Enter expiry in MM/YY format, for example 12/28.";
  }

  const [monthText, yearText] = value.split("/");
  const month = Number(monthText);
  const year = 2000 + Number(yearText);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return "Your card has expired.";
  }

  return "";
}

function Checkout() {
  const { cart, clearCart } = useShop();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [useNewAddress, setUseNewAddress] = useState(false);

  const [address, setAddress] = useState<ShippingAddress>({
    ...initialAddress,
    fullName: user?.name ?? "",
    email: user?.email ?? "",
  });

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [addressErrors, setAddressErrors] = useState<string[]>([]);

  const storageKey = user ? `shopra_addresses_${user.email}` : "";

  useEffect(() => {
    if (!storageKey) {
      setSavedAddresses([]);
      setSelectedAddressId("");
      setUseNewAddress(true);
      return;
    }

    try {
      const stored = localStorage.getItem(storageKey);
      const parsed: SavedAddress[] = stored ? JSON.parse(stored) : [];

      setSavedAddresses(parsed);

      const defaultAddress = parsed.find((item) => item.isDefault);
      const selected = defaultAddress ?? parsed[0];

      setSelectedAddressId(selected?.id ?? "");
      setUseNewAddress(parsed.length === 0);
    } catch {
      setSavedAddresses([]);
      setSelectedAddressId("");
      setUseNewAddress(true);
    }

    setAddress({
      ...initialAddress,
      fullName: user?.name ?? "",
      email: user?.email ?? "",
    });
  }, [storageKey, user?.name, user?.email]);

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const shipping = subtotal >= 2000 ? 0 : 99;
  const total = subtotal + shipping;

  const selectedAddress = savedAddresses.find((item) => item.id === selectedAddressId);

  const updateAddress = (field: keyof ShippingAddress, value: string) => {
    setAddress((previous) => ({
      ...previous,
      [field]: value,
    }));

    setAddressErrors([]);
    setError("");
  };

  const validateShippingAddress = (value: ShippingAddress) => {
    const errors: string[] = [];

    if (!value.fullName.trim()) errors.push("Enter your full name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email)) {
      errors.push("Enter a valid email address.");
    }
    if (!/^[6-9]\d{9}$/.test(value.phone)) {
      errors.push("Enter a valid 10-digit Indian mobile number.");
    }
    if (!value.address.trim()) errors.push("Enter your street address.");
    if (!value.city.trim()) errors.push("Enter your city.");
    if (!value.state.trim()) errors.push("Enter your state.");
    if (!/^\d{6}$/.test(value.pincode)) {
      errors.push("Enter a valid 6-digit PIN code.");
    }

    return errors;
  };

  const handlePlaceOrder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setAddressErrors([]);

    if (!user) {
      navigate("/login");
      return;
    }

    if (cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    let shippingAddress: ShippingAddress | undefined;

    if (useNewAddress) {
      const errors = validateShippingAddress(address);

      if (errors.length > 0) {
        setAddressErrors(errors);
        setError("Please correct your delivery information.");
        return;
      }
      shippingAddress = address;
    } else {
      shippingAddress = selectedAddress;

      if (!shippingAddress) {
        setError("Please select a delivery address.");
        return;
      }
    }

    const expiryError = validateExpiry(expiry);

    if (expiryError) {
      setError(expiryError);
      return;
    }

    if (!/^\d{3,4}$/.test(cvv)) {
      setError("CVV must contain 3 or 4 digits.");
      return;
    }

    const validation = validateCard(cardNumber, expiry, cvv);

    if (validation.valid) {
      setError(validation.errors.join(" "));
      return;
    }

    setLoading(true);

    try {
      const createdOrder = await orderService.create({
        userId: user.id,
        items: cart.map((item) => ({
          productId: item.id,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
        })),
        shippingAddress,
        subtotal,
        discount: 0,
        shipping,
        total,
        orderStatus: "PLACED",
        paymentStatus: "SUCCESS",
      });

      setCardNumber("");
      setExpiry("");
      setCvv("");
      clearCart();
      navigate(`/orders/${createdOrder.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to place your order.");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <main className="checkout-empty">
        <CreditCard size={45} />
        <h1>Your cart is empty</h1>
        <p>Add some products before proceeding to checkout.</p>
        <button onClick={() => navigate("/shop")}>Continue Shopping</button>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <div className="checkout-heading">
        <span className="section-tag">SECURE CHECKOUT</span>
        <h1>
          Complete Your <span>Order.</span>
        </h1>
        <p>Choose your delivery address and enter your payment details.</p>
      </div>

      <form onSubmit={handlePlaceOrder} className="checkout-layout">
        <div className="checkout-main">
          {/* DELIVERY ADDRESS */}
          <section className="checkout-section">
            <div className="checkout-section-heading">
              <div>
                <span className="checkout-step">01</span>
                <h2>Delivery Address</h2>
              </div>
              <MapPin size={21} />
            </div>

            {savedAddresses.length > 0 && (
              <div className="saved-address-list">
                {savedAddresses.map((item) => (
                  <label
                    className={`saved-address-option ${
                      !useNewAddress && selectedAddressId === item.id ? "selected" : ""
                    }`}
                    key={item.id}
                  >
                    <input
                      type="radio"
                      name="deliveryAddress"
                      checked={!useNewAddress && selectedAddressId === item.id}
                      onChange={() => {
                        setSelectedAddressId(item.id);
                        setUseNewAddress(false);
                        setError("");
                        setAddressErrors([]);
                      }}
                    />

                    <span className="address-radio-indicator" />

                    <span className="saved-address-content">
                      <span className="saved-address-name">
                        {item.fullName}
                        {item.isDefault && <span className="address-default-tag">Default</span>}
                      </span>

                      <span>{item.address}</span>
                      <span>
                        {item.city}, {item.state} - {item.pincode}
                      </span>
                      <span>Phone: {item.phone}</span>
                      <span>{item.email}</span>
                    </span>

                    {selectedAddressId === item.id && !useNewAddress && (
                      <CheckCircle2 className="address-selected-icon" size={20} />
                    )}
                  </label>
                ))}
              </div>
            )}

            <label className={`new-address-option ${useNewAddress ? "selected" : ""}`}>
              <input
                type="radio"
                name="deliveryAddress"
                checked={useNewAddress}
                onChange={() => {
                  setUseNewAddress(true);
                  setError("");
                }}
              />

              <Plus size={19} />
              <span>
                {savedAddresses.length > 0
                  ? "Deliver to a different address"
                  : "Add delivery address"}
              </span>
            </label>

            {useNewAddress && (
              <div className="new-address-form">
                <div className="checkout-fields-grid">
                  {(
                    [
                      ["fullName", "Full name"],
                      ["email", "Email address"],
                      ["phone", "Mobile number"],
                      ["address", "Street address"],
                      ["city", "City"],
                      ["state", "State"],
                      ["pincode", "PIN code"],
                    ] as [keyof ShippingAddress, string][]
                  ).map(([field, label]) => (
                    <label
                      className={`checkout-field ${field === "address" ? "field-full" : ""}`}
                      key={field}
                    >
                      {label}

                      <input
                        value={address[field]}
                        type={field === "email" ? "email" : "text"}
                        inputMode={field === "phone" || field === "pincode" ? "numeric" : "text"}
                        maxLength={field === "phone" ? 10 : field === "pincode" ? 6 : 150}
                        required
                        placeholder={`Enter ${label.toLowerCase()}`}
                        onChange={(event) => {
                          const value =
                            field === "phone" || field === "pincode"
                              ? event.target.value.replace(/\D/g, "")
                              : event.target.value;

                          updateAddress(field, value);
                        }}
                      />
                    </label>
                  ))}
                </div>

                {addressErrors.length > 0 && (
                  <div className="checkout-validation-errors" role="alert">
                    {addressErrors.map((message) => (
                      <p key={message}>{message}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* PAYMENT INFORMATION */}
          <section className="checkout-section">
            <div className="checkout-section-heading">
              <div>
                <span className="checkout-step">02</span>
                <h2>Payment Information</h2>
              </div>
              <CreditCard size={21} />
            </div>

            <label className="checkout-field field-full">
              Card number
              <input
                value={cardNumber}
                onChange={(event) => setCardNumber(formatCardNumber(event.target.value))}
                placeholder="1234 5678 9012 3456"
                inputMode="numeric"
                autoComplete="cc-number"
                maxLength={23}
                required
              />
            </label>

            <div className="checkout-card-row">
              <label className="checkout-field">
                Expiry date (MM/YY)
                <input
                  value={expiry}
                  onChange={(event) => setExpiry(formatExpiry(event.target.value))}
                  placeholder="MM/YY"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  maxLength={5}
                  required
                />
              </label>

              <label className="checkout-field">
                CVV
                <input
                  value={cvv}
                  onChange={(event) => setCvv(event.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="1234"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  maxLength={4}
                  required
                />
              </label>
            </div>

            <div className="checkout-secure-note">
              <ShieldCheck size={17} />
              <span>Demo payment only. Never enter real card details.</span>
            </div>
          </section>

          {error && (
            <div className="checkout-error" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="checkout-submit"
            disabled={loading || (!useNewAddress && !selectedAddressId)}
          >
            {loading ? "Processing..." : `Pay ₹${total.toLocaleString("en-IN")}`}
          </button>
        </div>

        {/* ORDER SUMMARY */}
        <aside className="checkout-summary">
          <h2>Order Summary</h2>

          <div className="checkout-products">
            {cart.map((item) => (
              <div className="checkout-summary-item" key={item.id}>
                <div className="checkout-product-info">
                  <img src={item.image} alt={item.name} />
                  <div>
                    <span>{item.name}</span>
                    <small>Qty: {item.quantity}</small>
                  </div>
                </div>

                <strong>₹{(item.price * item.quantity).toLocaleString("en-IN")}</strong>
              </div>
            ))}
          </div>

          <hr />

          <div className="checkout-summary-item">
            <span>Subtotal</span>
            <span>₹{subtotal.toLocaleString("en-IN")}</span>
          </div>

          <div className="checkout-summary-item">
            <span>Shipping</span>
            <span>{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
          </div>

          <div className="checkout-shipping-note">
            {shipping === 0
              ? "You qualify for free shipping!"
              : `Add ₹${(2000 - subtotal).toLocaleString("en-IN")} more for free shipping.`}
          </div>

          <hr />

          <div className="checkout-summary-total">
            <span>Total</span>
            <strong>₹{total.toLocaleString("en-IN")}</strong>
          </div>

          <p className="checkout-summary-footer">
            Taxes and charges are included where applicable.
          </p>
        </aside>
      </form>
    </main>
  );
}

export default Checkout;
