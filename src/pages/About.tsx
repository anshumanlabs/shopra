import { ArrowRight, ArrowUpRight, Heart, Sparkles, Target, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import "./About.css";
import React from "react";

const values = [
  {
    icon: Sparkles,
    number: "01",
    title: "Discover More",
    description:
      "Explore thoughtfully selected products across categories that match your lifestyle.",
  },
  {
    icon: Heart,
    number: "02",
    title: "Shop With Confidence",
    description: "Enjoy a simple and convenient shopping experience from discovery to checkout.",
  },
  {
    icon: Target,
    number: "03",
    title: "Made For Everyone",
    description: "Find products for your everyday needs, personal style and everything in between.",
  },
  {
    icon: Zap,
    number: "04",
    title: "Keep Exploring",
    description: "Discover new favourites and make every shopping experience worthwhile.",
  },
];

function About() {
  return (
    <main className="about-page">
      <section className="about-hero">
        <div className="about-hero-content">
          <span className="about-eyebrow">A LITTLE ABOUT US</span>

          <h1>
            We believe shopping
            <br />
            should be <span>extraordinary.</span>
          </h1>

          <p>
            More than a shopping destination. A place to discover products, explore your interests
            and find things you'll love.
          </p>

          <div className="about-actions">
            <Link to="/shop" className="about-primary-btn">
              Explore Collection <ArrowRight size={18} />
            </Link>

            <a href="#our-story" className="about-text-link">
              Discover our story <ArrowUpRight size={17} />
            </a>
          </div>
        </div>

        <div className="about-hero-visual">
          <div className="about-visual-glow" />

          <div className="about-brand-card">
            <span className="about-card-label">WELCOME TO</span>
            <h2>
              SHOP<span>ORA.</span>
            </h2>
            <p>YOUR WORLD. YOUR SHOPPING.</p>

            <div className="about-card-line" />

            <div className="about-card-bottom">
              <span>DISCOVER</span>

              <div className="about-floating-tag">
                <Sparkles size={16} />
                <span>SOMETHING</span>
              </div>

              <span>NEW</span>
            </div>
          </div>
        </div>
      </section>

      <section className="about-story" id="our-story">
        <div className="about-story-label">
          <span className="about-eyebrow">OUR STORY</span>
        </div>

        <div className="about-story-content">
          <h2>
            Good finds.
            <br />
            <span>Great experiences.</span>
          </h2>

          <div className="about-story-description">
            <p>
              At Shopora, we believe finding something you love should be just as enjoyable as
              owning it.
            </p>

            <p>
              That's why we're creating a shopping experience that brings fashion, electronics,
              accessories and footwear together in one convenient destination.
            </p>

            <p>
              Whether you're upgrading your everyday essentials or looking for something different,
              Shopora is here to make discovery easier.
            </p>
          </div>
        </div>
      </section>

      <section className="about-values">
        <div className="about-values-heading">
          <div>
            <span className="about-eyebrow">WHAT DRIVES US</span>
            <h2>
              Our philosophy<span>.</span>
            </h2>
          </div>

          <p>Everything we do starts with making your shopping experience better.</p>
        </div>

        <div className="about-values-grid">
          {values.map((item) => {
            const Icon = item.icon;

            return (
              <article className="about-value-card" key={item.number}>
                <div className="about-value-top">
                  <span>{item.number}</span>
                  <Icon size={24} />
                </div>

                <h3>{item.title}</h3>
                <p>{item.description}</p>

                <div className="about-value-line" />
              </article>
            );
          })}
        </div>
      </section>

      <section className="about-cta">
        <div>
          <span className="about-eyebrow">YOUR NEXT DISCOVERY STARTS HERE</span>

          <h2>
            Find your next
            <br />
            <span>favourite thing.</span>
          </h2>

          <p>Explore our collection and make your next shopping experience something special.</p>

          <Link to="/shop" className="about-primary-btn">
            Start Shopping <ArrowRight size={18} />
          </Link>
        </div>

        <span className="about-cta-decoration">S.</span>
      </section>
    </main>
  );
}

export default React.memo(About);
