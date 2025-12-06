import React from "react";

const Filters = ({ onFilterChange, currentFilters }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange &&
      onFilterChange({
        ...currentFilters,
        [name]: value,
      });
  };

  return (
    <div
      className="filters"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
        marginBottom: "16px",
        padding: "10px",
        borderRadius: "8px",
        border: "1px solid #e2e2e2",
      }}
    >
      <div>
        <label style={{ fontSize: "14px" }}>Search</label>
        <input
          name="search"
          value={currentFilters?.search || ""}
          onChange={handleChange}
          placeholder="Search products..."
          style={{ display: "block", padding: "6px 8px", borderRadius: "6px" }}
        />
      </div>

      <div>
        <label style={{ fontSize: "14px" }}>Category</label>
        <select
          name="category"
          value={currentFilters?.category || ""}
          onChange={handleChange}
          style={{ display: "block", padding: "6px 8px", borderRadius: "6px" }}
        >
          <option value="">All</option>
          <option>Electronics</option>
          <option>Clothing</option>
          <option>Accessories</option>
        </select>
      </div>

      <div>
        <label style={{ fontSize: "14px" }}>Min Price</label>
        <input
          type="number"
          name="minPrice"
          value={currentFilters?.minPrice || ""}
          onChange={handleChange}
          placeholder="0"
          style={{ display: "block", padding: "6px 8px", borderRadius: "6px" }}
        />
      </div>

      <div>
        <label style={{ fontSize: "14px" }}>Max Price</label>
        <input
          type="number"
          name="maxPrice"
          value={currentFilters?.maxPrice || ""}
          onChange={handleChange}
          placeholder="10000"
          style={{ display: "block", padding: "6px 8px", borderRadius: "6px" }}
        />
      </div>

      <div>
        <label style={{ fontSize: "14px" }}>Sort By</label>
        <select
          name="sortBy"
          value={currentFilters?.sortBy || "rating"}
          onChange={handleChange}
          style={{ display: "block", padding: "6px 8px", borderRadius: "6px" }}
        >
          <option value="rating">Rating</option>
          <option value="priceAsc">Price: Low → High</option>
          <option value="priceDesc">Price: High → Low</option>
        </select>
      </div>
    </div>
  );
};

export default Filters;
