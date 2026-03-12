import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiFilter } from 'react-icons/fi';
import ProductCard from '../components/ProductCard';
import Filters from '../components/Filters';
import { getProductsRequest } from '../features/products/api/products.api';

import '../styles/ProductsPage.css';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'rating'
  });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search?.trim()) count += 1;
    if (filters.category) count += 1;
    if (filters.minPrice !== '' && filters.minPrice !== null && filters.minPrice !== undefined) count += 1;
    if (filters.maxPrice !== '' && filters.maxPrice !== null && filters.maxPrice !== undefined) count += 1;
    if (filters.sortBy && filters.sortBy !== 'rating') count += 1;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  useEffect(() => {
    fetchProducts();
  }, [filters, page]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getProductsRequest({ ...filters, page, limit: 12 });
      setProducts(response.data.products);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterApply = (newFilters) => {
    setFilters(newFilters);
    setSearchParams(newFilters);
    setPage(1);
    setIsFilterOpen(false);
  };

  return (
    <div className="products-page">
      <div className="products-container">
        <div className="products-section">
          <div className="products-header">
            <div>
              <h1>Products</h1>
              <p>{pagination.total || 0} products found</p>
            </div>

            <div className="products-header-actions">
              <button
                type="button"
                className="filter-toggle-btn"
                onClick={() => setIsFilterOpen((prev) => !prev)}
              >
                <FiFilter /> Filter
                {activeFilterCount > 0 && (
                  <span className="active-filter-count">{activeFilterCount}</span>
                )}
              </button>
            </div>
          </div>

          {isFilterOpen && (
            <div className="products-filter-panel">
              <Filters
                currentFilters={filters}
                onApplyFilters={handleFilterApply}
                onClose={() => setIsFilterOpen(false)}
              />
            </div>
          )}

          {loading ? (
            <div className="loading">Loading...</div>
          ) : products.length > 0 ? (
            <>
              <motion.div
                className="products-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </motion.div>

              {pagination.pages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </button>
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
                    (p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={page === p ? 'active' : ''}
                      >
                        {p}
                      </button>
                    )
                  )}
                  <button
                    onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                    disabled={page === pagination.pages}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="no-products">
              <h2>No products found</h2>
              <p>Try adjusting your filters or search terms</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;