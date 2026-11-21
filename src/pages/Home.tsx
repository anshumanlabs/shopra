import { ArrowRight } from "lucide-react";
import Hero from "../components/Hero";
import ProductCard from "../components/ProductCard";
import CategoryCard from "../components/CategoryCard";
import products from "../data/products";
import { Link } from "react-router-dom";

function Home() {
  return (
    <main>

      <Hero />

      {/* Categories */}

      <section className="categories-section" id="categories">

        <div className="section-heading">
          <div>
            <span className="section-tag">EXPLORE SHOPORA</span>
            <h2>Shop by Category<span>.</span></h2>
          </div>
        </div>

        <div className="category-grid">

          <CategoryCard number="01" name="Fashion" />
          <CategoryCard number="02" name="Electronics" />
          <CategoryCard number="03" name="Accessories" />
          <CategoryCard number="04" name="Footwear" />

        </div>

      </section>

      {/* Trending products */}

      <section className="products-section" id="shop">

        <div className="section-heading">

          <div>
            <span className="section-tag">
              HANDPICKED FOR YOU
            </span>

            <h2>
              Trending Products<span>.</span>
            </h2>

            <p>Discover our most loved products.</p>
          </div>

          <Link to="/shop" className="view-all">
            View All <ArrowRight size={18} />
          </Link>

        </div>

        <div className="products-grid">

          {products.slice(0, 4).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}

        </div>

      </section>

      {/* Promotion */}

      <section className="promo-section" id="about">

        <div>
          <span className="section-tag">
            SPECIAL OFFER
          </span>

          <h2>Upgrade Your Style.</h2>

          <p>
            Get up to 30% off on selected products.
            Discover something extraordinary.
          </p>

          <Link to="/shop" className="primary-btn">
            Explore Deals <ArrowRight size={18} />
          </Link>
        </div>

      </section>

    </main>
  );
}

export default Home;