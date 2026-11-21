import {
    Instagram,
    Facebook,
    Twitter,
    ArrowUp,
} from "lucide-react";

import { Link } from "react-router-dom";

function Footer() {
    return (
        <footer className="footer" id="contact">
            <div className="footer-content">
                <div className="footer-brand">
                    <Link to="/" className="logo">
                        SHOP<span>ORA.</span>
                    </Link>
                    <p>
                        Your World. Your Shopping.
                        Discover a better shopping experience.
                    </p>
                    <div className="social-links">
                        <a href="https://instagram.com" aria-label="Instagram">
                            <Instagram />
                        </a>
                        <a href="https://facebook.com" aria-label="Facebook">
                            <Facebook />
                        </a>
                        <a href="https://twitter.com" aria-label="Twitter">
                            <Twitter />
                        </a>
                    </div>
                </div>
                <div>
                    <h4>Quick Links</h4>
                    <Link to="/">Home</Link>
                    <Link to="/shop">Shop</Link>
                    <a href="/#categories">Categories</a>
                    <a href="/#about">About Us</a>
                </div>
                <div>
                    <h4>Customer Service</h4>
                    <a href="/#contact">Contact Us</a>
                    <a href="/#contact">Shipping Policy</a>
                    <a href="/#contact">Return Policy</a>
                    <a href="/#contact">Privacy Policy</a>
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