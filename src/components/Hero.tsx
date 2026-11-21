import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import "./Hero.css";

function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-content">
        <span className="hero-tag">
          <Sparkles size={15} />
          THE NEW COLLECTION 2026
        </span>

        <h1>
          SHOP THE
          <br />
          <span>BEST.</span>
        </h1>

        <p>Discover products you'll love. Experience a new way of shopping.</p>

        <div className="hero-buttons">
          <Link to="/shop" className="primary-btn">
            Shop Now <ArrowRight size={18} />
          </Link>

          <a href="#categories" className="secondary-btn">
            Explore Categories
          </a>
        </div>

        <div className="hero-stats">
          <div>
            <h3>500+</h3>
            <span>Products</span>
          </div>

          <div>
            <h3>10K+</h3>
            <span>Customers</span>
          </div>

          <div>
            <h3>4.9/5</h3>
            <span>Rating</span>
          </div>
        </div>
      </div>

      <div className="hero-image">
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1000"
          alt="SHOPORA fashion collection"
        />

        <div className="image-label">
          <span>NEW ARRIVALS</span>
          <h3>Define Your Style.</h3>
        </div>
      </div>
    </section>
  );
}

export default Hero;
