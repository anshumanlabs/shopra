import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Plus, CreditCard, CheckCircle2, ShieldCheck, X } from "lucide-react";
import { Button } from "@mui/material";

import "./Checkout.css";
import { useShop } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";
import type { SavedAddress, ShippingAddress } from "../types/orders";
import { validateCard } from "../utils/cardValidator";
import { orderService } from "../services/orderService";
import { paymentService } from "../services/paymentService";
import { addressService } from "../services/addressService";
import { getProductImage } from "../utils/images";
import { env } from "../config/env";

const initialAddress: ShippingAddress = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

const FREE_SHIPPING_THRESHOLD = 999;
const SHIPPING_CHARGE = 49;

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 19);
  return digits.match(/.{1,4}/g)?.join(" ") ?? "";
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);

  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function validateShippingAddress(value: ShippingAddress): string[] {
  const errors: string[] = [];

  if (!value.fullName.trim()) {
    errors.push("Enter your full name.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email)) {
    errors.push("Enter a valid email address.");
  }

  if (!/^[6-9]\d{9}$/.test(value.phone)) {
    errors.push("Enter a valid 10-digit Indian mobile number.");
  }

  if (!value.address.trim()) {
    errors.push("Enter your street address.");
  }

  if (!value.city.trim()) {
    errors.push("Enter your city.");
  }

  if (!value.state.trim()) {
    errors.push("Enter your state.");
  }

  if (!/^\d{6}$/.test(value.pincode)) {
    errors.push("Enter a valid 6-digit PIN code.");
  }

  return errors;
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

function Checkout() {
  const { cart, clearCart } = useShop();
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);

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

  const loadAddresses = async () => {
    if (!user) {
      setSavedAddresses([]);
      setSelectedAddressId("");
      setUseNewAddress(true);
      return;
    }

    setAddressesLoading(true);
    try {
      const parsed = await addressService.getAll(user.email, accessToken ?? undefined);

      setSavedAddresses(parsed);

      const defaultAddress = parsed.find((item) => item.isDefault) ?? parsed[0];

      setSelectedAddressId(defaultAddress?.id ?? "");
      setUseNewAddress(false);
    } catch {
      setSavedAddresses([]);
      setSelectedAddressId("");
      setUseNewAddress(false);
    } finally {
      setAddressesLoading(false);
    }

    setAddress({
      ...initialAddress,
      fullName: user?.name ?? "",
      email: user?.email ?? "",
    });
  };

  useEffect(() => {
    loadAddresses();
  }, [user, accessToken]);

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  // Keep the displayed demo estimate aligned with the order-service policy.
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_CHARGE;

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

  const handleSaveAddress = async () => {
    const cleanedAddress: ShippingAddress = {
      fullName: address.fullName.trim(),
      email: address.email.trim(),
      phone: address.phone.trim(),
      address: address.address.trim(),
      city: address.city.trim(),
      state: address.state.trim(),
      pincode: address.pincode.trim(),
      isDefault: false,
    };

    const errors = validateShippingAddress(cleanedAddress);

    if (errors.length > 0) {
      setAddressErrors(errors);
      setError("Please correct your delivery information.");
      return;
    }

    setLoading(true);
    try {
      const saved = await addressService.save(
        user.email,
        cleanedAddress,
        accessToken ?? undefined
      );

      await loadAddresses();

      setSelectedAddressId(saved.id);
      setShowAddressForm(false);
      setUseNewAddress(false);
      setAddress(initialAddress);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save address.");
    } finally {
      setLoading(false);
    }
  };

  const pollPayment = async (paymentId: string): Promise<void> => {
    for (let attempt = 0; attempt < env.paymentMaxAttempts; attempt++) {
      await delay(env.paymentPollingInterval);

      const payment = await paymentService.getPayment(paymentId, accessToken ?? undefined);

      if (!payment) {
        throw new Error("Unable to find the payment.");
      }

      if (payment.status === "SUCCESS") {
        return;
      }

      if (payment.status === "FAILED") {
        throw new Error("Payment failed. Please try again.");
      }
    }

    throw new Error("Payment is still pending. Please check your order before retrying.");
  };

  const handlePlaceOrder = async (event: FormEvent<HTMLFormElement>) => {
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

    let shippingAddress: ShippingAddress;

    if (useNewAddress) {
      const errors = validateShippingAddress(address);

      if (errors.length > 0) {
        setAddressErrors(errors);
        setError("Please correct your delivery information.");
        return;
      }

      shippingAddress = address;
    } else {
      if (!selectedAddress) {
        setError("Please select a delivery address.");
        return;
      }

      shippingAddress = selectedAddress;
    }

    const validation = validateCard(cardNumber, expiry, cvv);

    // Important: reject invalid card input, not valid card input.
    if (!validation.valid) {
      setError(validation.errors.join(" "));
      return;
    }

    if (!accessToken && !env.isLocal) {
      setError("Your session has expired. Please log in again.");
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      /*
       * STEP 1: Create the order first.
       *
       * API mode sends product IDs and quantities only.
       * The order service fetches prices from product catalog.
       *
       * Local mode stores a local demo order with a pending payment state.
       */
      const createdOrder = env.isLocal
        ? await orderService.createLocalOrder({
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
          })
        : await orderService.create(
            {
              items: cart.map((item) => ({
                productId: item.id,
                quantity: item.quantity,
              })),
              shippingAddress,
            },
            accessToken ?? undefined
          );

      /*
       * STEP 2: Create payment against the persisted order.
       *
       * This is a mock token for the demo gateway. It is not a real
       * payment-provider token and no raw card number/CVV is sent.
       */
      const lastFour = cardNumber.replace(/\D/g, "").slice(-4);

      const payment = await paymentService.createPayment(
        {
          orderId: createdOrder.id,
          paymentMethodToken: `tok_demo_${lastFour}`,
          provider: "MOCK_GATEWAY",
        },
        accessToken ?? undefined,
        env.isLocal ? createdOrder.total : undefined
      );

      /*
       * STEP 3: Wait for the payment service to report its result.
       * The browser does not call a payment-status mutation endpoint.
       */
      if (payment.status === "PENDING") {
        await pollPayment(payment.paymentId);
      } else if (payment.status === "FAILED") {
        throw new Error("Payment failed. Please try again.");
      }

      /*
       * STEP 4: Update only the local demo order.
       * In API mode the payment service notifies the order service directly.
       */
      if (env.isLocal) {
        await orderService.markLocalPaymentSuccessful(createdOrder.id);
      }

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
          <section className="checkout-section">
            <div className="checkout-section-heading">
              <div>
                <span className="checkout-step">01</span>
                <h2>Delivery Address</h2>
              </div>
              <MapPin size={21} />
            </div>

            {addressesLoading ? (
              <div className="address-empty">
                <MapPin size={32} />
                <h3>Loading addresses...</h3>
              </div>
            ) : savedAddresses.length > 0 ? (
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
            ) : savedAddresses.length === 0 && !showAddressForm ? (
              <div className="address-empty">
                <MapPin size={42} />
                <h3>No saved addresses</h3>
                <p>Add your first delivery address to make checkout faster.</p>

                <Button
                  variant="outlined"
                  startIcon={<Plus size={18} />}
                  onClick={() => {
                    setAddress(initialAddress);
                    setUseNewAddress(true);
                    setShowAddressForm(true);
                  }}
                >
                  Add Your First Address
                </Button>
              </div>
            ) : null}

            {savedAddresses.length > 0 && (
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
            )}

            {(useNewAddress || showAddressForm) && (
              <div className="new-address-form">
                <div className="address-form-header">
                  <h3>Add Delivery Address</h3>
                  <button
                    type="button"
                    className="address-close"
                    onClick={() => {
                      setShowAddressForm(false);
                      setUseNewAddress(false);
                    }}
                    aria-label="Close address form"
                  >
                    <X size={20} />
                  </button>
                </div>
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

                <div className="checkout-form-actions">
                  <button
                    type="button"
                    className="checkout-cancel"
                    onClick={() => {
                      setShowAddressForm(false);
                      setUseNewAddress(false);
                      setAddress(initialAddress);
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="checkout-save"
                    onClick={handleSaveAddress}
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save Address"}
                  </button>
                </div>
              </div>
            )}
          </section>

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
            {loading ? "Processing payment..." : `Pay ₹${total.toLocaleString("en-IN")}`}
          </button>
        </div>

        <aside className="checkout-summary">
          <h2>Order Summary</h2>

          <div className="checkout-products">
            {cart.map((item) => (
              <div className="checkout-summary-item" key={item.id}>
                <div className="checkout-product-info">
                  <img src={getProductImage(item.image)} alt={item.name} />

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
              : `Add ₹${(FREE_SHIPPING_THRESHOLD - subtotal).toLocaleString(
                  "en-IN"
                )} more for free shipping.`}
          </div>

          <hr />

          <div className="checkout-summary-total">
            <span>Total</span>
            <strong>₹{total.toLocaleString("en-IN")}</strong>
          </div>

          <p className="checkout-summary-footer">
            Final amount is calculated by the order service in API mode.
          </p>
        </aside>
      </form>
    </main>
  );
}

export default Checkout;
