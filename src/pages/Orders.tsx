import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, ArrowRight } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import type { Order } from "../types/orders";
import { orderService } from "../services/orderService";
import "./Orders.css";

function Orders() {
  const { user, accessToken } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadOrders() {
      if (!user) {
        setOrders([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const result = await orderService.getAll(user.id, accessToken ?? undefined);

        if (active) {
          setOrders(result);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Unable to load your orders.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadOrders();

    return () => {
      active = false;
    };
  }, [user, accessToken]);

  if (loading) {
    return <p>Loading your orders...</p>;
  }

  return (
    <main className="orders-page">
      <h1>My Orders</h1>

      {error && <p role="alert">{error}</p>}

      {!orders.length && !error ? (
        <div className="orders-empty">
          <Package size={45} />
          <h2>No orders yet</h2>
          <p>Your orders will appear here after checkout.</p>
          <Link to="/shop">Start Shopping</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <article className="order-card" key={order.id}>
              <div>
                <span>Order #{order.id.slice(0, 8)}</span>

                <h3>₹{order.total.toLocaleString("en-IN")}</h3>

                <p>{new Date(order.createdAt).toLocaleDateString("en-IN")}</p>

                <p>
                  Payment: <strong>{order.paymentStatus}</strong>
                </p>

                <p>
                  Order status: <strong>{order.orderStatus}</strong>
                </p>
              </div>

              <Link to={`/orders/${order.id}`}>
                View Order <ArrowRight size={16} />
              </Link>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

export default Orders;
