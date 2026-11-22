import { ArrowUp } from "lucide-react";
import { FaInstagram, FaFacebookF, FaXTwitter } from "react-icons/fa6";

import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
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

        <div>
          <h4>Quick Links</h4>
          <Link to="/">Home</Link>
          <Link to="/shop">Shop</Link>
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact Us</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 SHOPORA. All rights reserved.</span>

        <a href="#home" className="back-top">
          Back to top <ArrowUp size={15} />
        </a>
      </div>
    </footer>
  );
}

export default Footer;
