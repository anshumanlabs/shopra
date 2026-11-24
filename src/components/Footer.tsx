import { ArrowUp } from "lucide-react";
import { FaInstagram, FaFacebookF, FaXTwitter } from "react-icons/fa6";
import { Link } from "react-router-dom";
import "./Footer.css";
import { useState } from "react";

function Footer() {
  const [email, setEmail] = useState("");

  const subscribeEmail = () => {
    console.log("Subscribed:", email);
    setEmail("");
  };

  return (
    <footer className="footer" id="contact">
      <div className="footer-content">
        <div className="footer-brand">
          <Link to="/" className="logo">
            SHOP<span>ORA.</span>
          </Link>

          <p>Your World. Your Shopping. Discover a better shopping experience.</p>

          <div className="social-links">
            <a href="https://instagram.com" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="https://facebook.com" aria-label="Facebook">
              <FaFacebookF />
            </a>
            <a href="https://x.com" aria-label="X">
              <FaXTwitter />
            </a>
          </div>
        </div>
        <div className="footer-links">
          <h4>Quick Links</h4>
          <Link to="/">Home</Link>
          <Link to="/shop">Shop</Link>
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact Us</Link>
        </div>

        <div className="footer-newsletter">
          <h4>Subscribe to Newsletter</h4>
          <p>Get the latest updates, new arrivals and exclusive offers.</p>

          <form
            className="newsletter-input-group"
            onSubmit={(e) => {
              e.preventDefault();
              subscribeEmail();
            }}
          >
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email address"
              required
            />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 SHOPORA. All rights reserved.</span>
        <a
          href="#"
          className="back-top"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          }}
        >
          Back to top <ArrowUp size={15} />
        </a>
      </div>
    </footer>
  );
}

export default Footer;
