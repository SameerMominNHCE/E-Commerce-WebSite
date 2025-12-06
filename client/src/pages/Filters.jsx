import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiChevronDown } from 'react-icons/fi';
import '../styles/Filters.css';

const Filters = ({ onFilterChange, currentFilters }) => {
  const [categories, setCategories] = useState([]);
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    sort: true
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/products/categories/list');
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleCategoryChange = (category) => {
    onFilterChange({
      ...currentFilters,
      category: currentFilters.category === category ? '' : category
    });
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({
      ...currentFilters,
      [name]: value
    });
  };

  const handleSortChange = (e) => {
    onFilterChange({
      ...currentFilters,
      sortBy: e.target.value
    });
  };

  const clearFilters = () => {
    onFilterChange({
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'rating'
    });
  };

  return (
    <div className="filters-sidebar">
      <div className="filters-header">
        <h3>Filters</h3>
        <button onClick={clearFilters} className="clear-filters">
          Clear All
        </button>
      </div>

      {/* Sort */}
      <div className="filter-section">
        <button
          className="filter-title"
          onClick={() => toggleSection('sort')}
        >
          <span>Sort By</span>
          <FiChevronDown />
        </button>
        {expandedSections.sort && (
          <div className="filter-options">
            <select value={currentFilters.sortBy} onChange={handleSortChange}>
              <option value="rating">Most Popular</option>
              <option value="newest">Newest</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
          </div>
        )}
      </div>

      {/* Category */}
      <div className="filter-section">
        <button
          className="filter-title"
          onClick={() => toggleSection('category')}
        >
          <span>Category</span>
          <FiChevronDown />
        </button>
        {expandedSections.category && (
          <div className="filter-options">
            {categories.map((category) => (
              <label key={category}>
                <input
                  type="checkbox"
                  checked={currentFilters.category === category}
                  onChange={() => handleCategoryChange(category)}
                />
                <span>{category}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="filter-section">
        <button
          className="filter-title"
          onClick={() => toggleSection('price')}
        >
          <span>Price Range</span>
          <FiChevronDown />
        </button>
        {expandedSections.price && (
          <div className="filter-options">
            <div className="price-inputs">
              <input
                type="number"
                name="minPrice"
                placeholder="Min"
                value={currentFilters.minPrice}
                onChange={handlePriceChange}
              />
              <input
                type="number"
                name="maxPrice"
                placeholder="Max"
                value={currentFilters.maxPrice}
                onChange={handlePriceChange}
              />
            </div>
            <div className="price-presets">
              <button onClick={() => onFilterChange({ ...currentFilters, minPrice: '', maxPrice: '1000' })}>
                Under ₹1000
              </button>
              <button onClick={() => onFilterChange({ ...currentFilters, minPrice: '1000', maxPrice: '5000' })}>
                ₹1000 - ₹5000
              </button>
              <button onClick={() => onFilterChange({ ...currentFilters, minPrice: '5000', maxPrice: '10000' })}>
                ₹5000 - ₹10000
              </button>
              <button onClick={() => onFilterChange({ ...currentFilters, minPrice: '10000', maxPrice: '' })}>
                Above ₹10000
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Filters;