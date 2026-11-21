import {
  // Instagram,
  // Facebook,
  // Twitter,
  ArrowUp,
} from "lucide-react";

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
          {/* <div className="social-links">
                        <a href="https://instagram.com" aria-label="Instagram">
                            <Instagram />
                        </a>
                        <a href="https://facebook.com" aria-label="Facebook">
                            <Facebook />
                        </a>
                        <a href="https://twitter.com" aria-label="Twitter">
                            <Twitter />
                        </a>
                    </div> */}
        </div>
        <div>
          <h4>Quick Links</h4>
          <Link to="/">Home</Link>
          <Link to="/shop">Shop</Link>
          <Link to="/about">About Us</Link>
        </div>
        <div>
          <h4>Customer Service</h4>
          <Link to="/contact">Contact Us</Link>
          <Link to="/contact#shipping">Shipping Policy</Link>
          <Link to="/contact#returns">Return Policy</Link>
          <Link to="/contact#privacy">Privacy Policy</Link>
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
