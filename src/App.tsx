import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { ShopProvider } from "./context/ShopContext";
import { AuthProvider } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Loader from "./components/Loader";

import "./App.css";

const Home = lazy(() => import("./pages/Home"));
const Shop = lazy(() => import("./pages/Shop"));
const Cart = lazy(() => import("./pages/Cart"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));

const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Profile = lazy(() => import("./pages/Profile"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));

const Checkout = lazy(() => import("./pages/Checkout"));

const Orders = lazy(() => import("./pages/Orders"));

const OrderDetails = lazy(() => import("./pages/OrderDetails"));

function App() {
  return (
    <AuthProvider>
      <ShopProvider>
        <BrowserRouter>
          <Navbar />

          <Suspense fallback={<Loader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/products/:productId" element={<ProductDetails />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />

              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/profile" element={<Profile />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/orders/:orderId" element={<OrderDetails />} />
              </Route>

              <Route
                path="*"
                element={
                  <main className="not-found">
                    <h1>404</h1>
                    <p>Page not found.</p>
                  </main>
                }
              />
            </Routes>
          </Suspense>

          <Footer />
        </BrowserRouter>
      </ShopProvider>
    </AuthProvider>
  );
}

export default App;
