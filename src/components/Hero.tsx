
import { useState, useEffect } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import "./Hero.css";
import { getProductImage } from "../utils/images";

function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);


  const slides = [
    {
      image: "photo-1556821840-3a63f95609a7",
      tag: "NEW FASHION COLLECTION",
      title: "Upgrade Your Style.",
      alt: "Premium black hoodie",
    },
    {
      image: "photo-1542291026-7eec264c27ff",
      tag: "STEP INTO COMFORT",
      title: "Move With Confidence.",
      alt: "Classic sports sneakers",
    },
    {
      image: "photo-1516035069371-29a1b244cc32",
      tag: "LATEST TECHNOLOGY",
      title: "Explore What's Next.",
      alt: "Premium digital camera",
    },
    {
      image: "photo-1507473885765-e6ed057f782c",
      tag: "HOME & LIVING",
      title: "Make Life Beautiful.",
      alt: "Modern table lamp",
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? slides.length - 1 : prev - 1
    );
  };

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

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

        <p>
          Discover products you'll love. Experience a new way of shopping.
        </p>

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

      {/* HERO CAROUSEL */}

      <div
        className="hero-carousel"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {slides.map((slide, index) => (
          <div
            className={`hero-slide ${currentSlide === index ? "active" : ""
              }`}
            key={slide.image}
          >
            <img
              src={getProductImage(slide.image)}
              alt={slide.alt}
            />

            <div className="image-label">
              <span>{slide.tag}</span>
              <h3>{slide.title}</h3>
            </div>
          </div>
        ))}

        {/* Previous Button */}
        <button
          className="carousel-arrow prev"
          onClick={prevSlide}
          aria-label="Previous slide"
        >
          <ChevronLeft size={22} />
        </button>

        {/* Next Button */}
        <button
          className="carousel-arrow next"
          onClick={nextSlide}
          aria-label="Next slide"
        >
          <ChevronRight size={22} />
        </button>

        {/* Navigation Dots */}
        <div className="carousel-dots">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`carousel-dot ${currentSlide === index ? "active" : ""
                }`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={currentSlide === index ? "true" : undefined}
            />
          ))}
        </div>

        {/* Slide Counter */}
        <div className="slide-counter">
          0{currentSlide + 1} <span>/ 0{slides.length}</span>
        </div>
      </div>
    </section>
  );
}

export default Hero;
