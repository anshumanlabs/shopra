import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import type { Order } from "../types/orders";
import { orderService } from "../services/orderService";
import "./OrderDetail.css";
import { getProductImage } from "../utils/images";

const trackingSteps = ["PENDING_PAYMENT", "PROCESSING", "SHIPPED", "DELIVERED"];

function OrderDetails() {
  const { orderId } = useParams();
  const { accessToken } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadOrder() {
      try {
        if (!orderId) {
          throw new Error("Invalid order ID");
        }

        const result = await orderService.getById(orderId, accessToken ?? undefined);

        if (!result) {
          throw new Error("Order not found");
        }

        if (active) {
          setOrder(result);
        }
      } catch {
        if (active) {
          setError("Order not found.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadOrder();

    return () => {
      active = false;
    };
  }, [orderId, accessToken]);

  if (loading) {
    return <p>Loading order...</p>;
  }

  if (error || !order) {
    return (
      <main className="order-details-page">
        <h1>{error || "Order not found"}</h1>
        <Link to="/orders">Back to orders</Link>
      </main>
    );
  }

  const currentStep = trackingSteps.indexOf(order.orderStatus);

  return (
    <main className="order-details-page">
      <h1>Order Details</h1>
      <p>Order ID: {order.id}</p>

      <section className="order-tracking">
        <h2>Order Tracking</h2>

        {order.orderStatus === "CANCELLED" ? (
          <p>This order has been cancelled.</p>
        ) : (
          <ol>
            {trackingSteps.map((step, index) => (
              <li
                key={step}
                className={currentStep >= 0 && index <= currentStep ? "completed" : ""}
              >
                {step.replaceAll("_", " ")}
              </li>
            ))}
          </ol>
        )}

        {order.paymentStatus === "PENDING" && <p>Payment is awaiting confirmation.</p>}

        {order.paymentStatus === "FAILED" && (
          <p>Payment failed. This order has not entered processing.</p>
        )}
      </section>

      <section className="order-detail-items">
        <h2>Items</h2>

        {order.items.map((item) => (
          <div key={item.productId} className="order-detail-item">
            <img src={getProductImage(item.image)} alt={item.name} />

            <span>
              {item.name} × {item.quantity}
            </span>

            <strong>₹{(item.price * item.quantity).toLocaleString("en-IN")}</strong>
          </div>
        ))}
      </section>

      <section>
        <h2>Delivery Address</h2>
        <p>{order.shippingAddress.fullName}</p>
        <p>{order.shippingAddress.address}</p>
        <p>
          {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
          {order.shippingAddress.pincode}
        </p>
      </section>

      <section>
        <h2>Payment</h2>
        <p>Status: {order.paymentStatus}</p>
        <h3>Total: ₹{order.total.toLocaleString("en-IN")}</h3>
      </section>

      <Link to="/orders">Back to My Orders</Link>
    </main>
  );
}

export default OrderDetails;
