import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import products from "../data/products";
import ProductCard from "../components/ProductCard";

function Shop() {
  const [searchParams] = useSearchParams();

  const initialCategory = searchParams.get("category") || "All";

  const [category, setCategory] = useState(initialCategory);
  const [search, setSearch] = useState(
    searchParams.get("search") || ""
  );

  const [sort, setSort] = useState("default");

  const categories = [
    "All",
    "Fashion",
    "Electronics",
    "Accessories",
    "Footwear",
  ];

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const matchesCategory =
        category === "All" || product.category === category;

      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.category.toLowerCase().includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    });

    if (sort === "low") {
      result = [...result].sort((a, b) => a.price - b.price);
    }

    if (sort === "high") {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    if (sort === "rating") {
      result = [...result].sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [category, search, sort]);

  return (
    <main className="shop-page">

      <div className="shop-heading">
        <span className="section-tag">DISCOVER YOUR STYLE</span>
        <h1>Our Collection<span>.</span></h1>
        <p>Explore our complete collection of products.</p>
      </div>

      <div className="shop-toolbar">

        <div className="shop-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="sort-select">
          <SlidersHorizontal size={17} />

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="default">Default sorting</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

      </div>

      <div className="shop-layout">

        <aside className="shop-sidebar">
          <h3>Categories</h3>

          {categories.map((item) => (
            <button
              key={item}
              className={category === item ? "selected" : ""}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </aside>

        <section className="shop-results">

          <div className="results-heading">
            <p>
              Showing {filteredProducts.length} products
            </p>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="products-grid">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h2>No products found</h2>
              <p>Try another search or category.</p>

              <button
                className="primary-btn"
                onClick={() => {
                  setSearch("");
                  setCategory("All");
                }}
              >
                Clear Filters
              </button>
            </div>
          )}

        </section>

      </div>

    </main>
  );
}

export default Shop;