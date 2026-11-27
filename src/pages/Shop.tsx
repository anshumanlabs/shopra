import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { productService } from "../services/productService";
import ProductCard from "../components/ProductCard";
import useDebounce from "../hooks/useDebounce";
import type { Product } from "../types";
import "./Shop.css";

const PAGE_SIZE = 6;

function Shop() {
  const [searchParams] = useSearchParams();

  const [category, setCategory] = useState(searchParams.get("category") || "All");

  const [search, setSearch] = useState(searchParams.get("search") || "");

  const [sort, setSort] = useState("default");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const debouncedSearch = useDebounce(search, 350);

  const categories = ["All", "Fashion", "Electronics", "Accessories", "Footwear"];

  useEffect(() => {
    productService
      .getAll()
      .then((data) => {
        setAllProducts(data as Product[]);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Unable to load products.");
        setLoading(false);
      });
  }, []);

  const filteredProducts = useMemo(() => {
    let result = allProducts.filter((product) => {
      const matchesCategory = category === "All" || product.category === category;

      const searchTerm = debouncedSearch.trim().toLowerCase();

      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm);

      const matchesMin = minPrice === "" || product.price >= Number(minPrice);

      const matchesMax = maxPrice === "" || product.price <= Number(maxPrice);

      return matchesCategory && matchesSearch && matchesMin && matchesMax;
    });

    switch (sort) {
      case "low":
        result = [...result].sort((a, b) => a.price - b.price);
        break;

      case "high":
        result = [...result].sort((a, b) => b.price - a.price);
        break;

      case "rating":
        result = [...result].sort((a, b) => b.rating - a.rating);
        break;

      case "name":
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return result;
  }, [category, debouncedSearch, minPrice, maxPrice, sort, allProducts]);

  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);

  const paginatedProducts = filteredProducts.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const clearFilters = () => {
    setCategory("All");
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    setSort("default");
    setPage(1);
  };

  if (loading) {
    return (
      <main className="shop-page">
        <div className="shop-heading">
          <span className="section-tag">DISCOVER YOUR STYLE</span>
          <h1>Our Collection<span>.</span></h1>
          <p>Explore our complete collection of products.</p>
        </div>
        <div className="products-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="product-skeleton" />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="shop-page">
      {error && <div className="home-error" role="alert">{error}</div>}

      <div className="shop-heading">
        <span className="section-tag">DISCOVER YOUR STYLE</span>
        <h1>
          Our Collection<span>.</span>
        </h1>
        <p>Explore our complete collection of products.</p>
      </div>

      <div className="shop-toolbar">
        <div className="shop-search">
          <Search size={18} />
          <input
            type="search"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search products"
          />

          {search && (
            <button
              className="clear-search"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="sort-select">
          <SlidersHorizontal size={17} />
          <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort products">
            <option value="default">Default sorting</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
            <option value="name">Name: A to Z</option>
          </select>
        </div>
      </div>

      <div className="shop-layout">
        <aside className="shop-sidebar">
          <div className="filter-heading">
            <h3>Filters</h3>
            <button onClick={clearFilters}>Clear all</button>
          </div>

          <div className="filter-group">
            <h4>Categories</h4>

            {categories.map((item) => (
              <button
                key={item}
                className={category === item ? "selected" : ""}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="filter-group">
            <h4>Price range</h4>

            <label htmlFor="min-price">Minimum price</label>
            <input
              id="min-price"
              type="number"
              min="0"
              placeholder="₹ Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />

            <label htmlFor="max-price">Maximum price</label>
            <input
              id="max-price"
              type="number"
              min="0"
              placeholder="₹ Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
        </aside>

        <section className="shop-results">
          <div className="results-heading">
            <p>
              Showing {paginatedProducts.length} of {filteredProducts.length} products
            </p>
          </div>

          {paginatedProducts.length > 0 ? (
            <>
              <div className="products-grid">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button disabled={page === 1} onClick={() => setPage((current) => current - 1)}>
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, index) => (
                    <button
                      key={index + 1}
                      className={page === index + 1 ? "active" : ""}
                      onClick={() => setPage(index + 1)}
                      aria-label={`Page ${index + 1}`}
                      aria-current={page === index + 1 ? "page" : undefined}
                    >
                      {index + 1}
                    </button>
                  ))}

                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((current) => current + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <h2>No products found</h2>
              <p>Try changing your search or filters.</p>
              <button className="primary-btn" onClick={clearFilters}>
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
