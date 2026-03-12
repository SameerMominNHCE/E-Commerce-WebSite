import React, { useEffect, useState } from 'react';
import '../styles/Filters.css';

const defaultFilters = {
  search: '',
  category: '',
  minPrice: '',
  maxPrice: '',
  sortBy: 'rating'
};

const Filters = ({ currentFilters, onApplyFilters, onClose }) => {
  const [draftFilters, setDraftFilters] = useState(currentFilters || defaultFilters);

  useEffect(() => {
    setDraftFilters(currentFilters || defaultFilters);
  }, [currentFilters]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDraftFilters((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApply = () => {
    onApplyFilters && onApplyFilters(draftFilters);
  };

  const handleClear = () => {
    setDraftFilters(defaultFilters);
    onApplyFilters && onApplyFilters(defaultFilters);
  };

  return (
    <div className="filters-popover-card">
      <div className="filters-header-row">
        <h3>Filter Products</h3>
        <button type="button" className="filters-close-btn" onClick={onClose}>
          Close
        </button>
      </div>

      <div className="filters-grid">
        <div className="filter-field">
          <label>Search</label>
          <input
            name="search"
            value={draftFilters.search}
            onChange={handleChange}
            placeholder="Search products..."
          />
        </div>

        <div className="filter-field">
          <label>Category</label>
          <select name="category" value={draftFilters.category} onChange={handleChange}>
            <option value="">All</option>
            <option value="Electronics">Electronics</option>
            <option value="Clothing">Clothing</option>
            <option value="Accessories">Accessories</option>
          </select>
        </div>

        <div className="filter-field">
          <label>Min Price</label>
          <input
            type="number"
            name="minPrice"
            value={draftFilters.minPrice}
            onChange={handleChange}
            placeholder="0"
          />
        </div>

        <div className="filter-field">
          <label>Max Price</label>
          <input
            type="number"
            name="maxPrice"
            value={draftFilters.maxPrice}
            onChange={handleChange}
            placeholder="10000"
          />
        </div>

        <div className="filter-field filter-field-full">
          <label>Sort By</label>
          <select name="sortBy" value={draftFilters.sortBy} onChange={handleChange}>
            <option value="rating">Rating</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="filters-actions-row">
        <button type="button" className="filters-clear-btn" onClick={handleClear}>
          Clear
        </button>
        <button type="button" className="filters-apply-btn" onClick={handleApply}>
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default Filters;
