import { useEffect, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { productService } from "../services/productService";
import ProductCard from "../components/ProductCard";
import useDebounce from "../hooks/useDebounce";
import type { Product } from "../types";
import "./Shop.css";

const PAGE_SIZE = 6;

interface PageResponse {
  content: Product[];
  totalPages: number;
  totalElements: number;
}

const SORT_MAP: Record<string, { sortBy: string; order: string }> = {
  default: { sortBy: "id", order: "asc" },
  low: { sortBy: "price", order: "asc" },
  high: { sortBy: "price", order: "desc" },
  rating: { sortBy: "rating", order: "desc" },
  name: { sortBy: "name", order: "asc" },
};

function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();

  const category = searchParams.get("category") || "All";
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "default";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const minRating = Number(searchParams.get("minRating") || 0);
  const page = Number(searchParams.get("page") || 1);

  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const debouncedSearch = useDebounce(search, 350);

  const categories = ["All", "Fashion", "Electronics", "Accessories", "Footwear"];

  const { sortBy, order } = SORT_MAP[sort] || SORT_MAP.default;

  const updateParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });
    if (next.get("category") === "All") next.delete("category");
    if (next.get("sort") === "default") next.delete("sort");
    if (next.get("minRating") === "0") next.delete("minRating");
    if (next.get("page") === "1") next.delete("page");
    setSearchParams(next);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");

      try {
        const data = (await productService.getAll({
          page: page - 1,
          size: PAGE_SIZE,
          category,
          sortBy,
          order,
          minRating,
          minPrice: minPrice === "" ? undefined : Number(minPrice),
          maxPrice: maxPrice === "" ? undefined : Number(maxPrice),
        })) as unknown;

        const isArray = Array.isArray(data);
        let content: Product[];
        let totalElementsVal: number;
        let totalPagesVal: number;

        if (isArray) {
          const all = data as Product[];
          totalElementsVal = all.length;
          totalPagesVal = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
          content = all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
        } else {
          const pageData = data as PageResponse;
          content = pageData.content;
          totalElementsVal = pageData.totalElements;
          totalPagesVal = pageData.totalPages;
        }

        setTotalElements(totalElementsVal);
        setTotalPages(totalPagesVal);
        setProducts(content);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load products.");
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page, category, sortBy, order, minRating, minPrice, maxPrice, debouncedSearch]);
  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  if (loading) {
    return (
      <main className="shop-page">
        <div className="shop-heading">
          <span className="section-tag">DISCOVER YOUR STYLE</span>
          <h1>
            Our Collection<span>.</span>
          </h1>
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
      {error && (
        <div className="home-error" role="alert">
          {error}
        </div>
      )}

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
            onChange={(e) => updateParams({ search: e.target.value, page: "1" })}
            aria-label="Search products"
          />

          {search && (
            <button
              className="clear-search"
              onClick={() => updateParams({ search: null, page: "1" })}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="sort-select">
          <SlidersHorizontal size={17} />
          <select
            value={sort}
            onChange={(e) => updateParams({ sort: e.target.value, page: "1" })}
            aria-label="Sort products"
          >
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
                onClick={() => updateParams({ category: item, page: "1" })}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="filter-group">
            <h4>Minimum rating</h4>

            <select
              value={minRating}
              onChange={(e) => updateParams({ minRating: e.target.value, page: "1" })}
            >
              <option value={0}>Any rating</option>
              <option value={1}>1 star and up</option>
              <option value={2}>2 stars and up</option>
              <option value={3}>3 stars and up</option>
              <option value={4}>4 stars and up</option>
            </select>
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
              onChange={(e) => updateParams({ minPrice: e.target.value, page: "1" })}
            />

            <label htmlFor="max-price">Maximum price</label>
            <input
              id="max-price"
              type="number"
              min="0"
              placeholder="₹ Max"
              value={maxPrice}
              onChange={(e) => updateParams({ maxPrice: e.target.value, page: "1" })}
            />
          </div>
        </aside>

        <section className="shop-results">
          <div className="results-heading">
            <p>
              Showing {products.length} of {totalElements} products
            </p>
          </div>

          {products.length > 0 ? (
            <>
              <div className="products-grid">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    disabled={page === 1}
                    onClick={() => updateParams({ page: String(page - 1) })}
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, index) => (
                    <button
                      key={index + 1}
                      className={page === index + 1 ? "active" : ""}
                      onClick={() => updateParams({ page: String(index + 1) })}
                      aria-label={`Page ${index + 1}`}
                      aria-current={page === index + 1 ? "page" : undefined}
                    >
                      {index + 1}
                    </button>
                  ))}

                  <button
                    disabled={page === totalPages}
                    onClick={() => updateParams({ page: String(page + 1) })}
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
