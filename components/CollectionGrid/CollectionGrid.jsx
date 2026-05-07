import { useState } from 'react';
import ProductCard from '../ProductCard/ProductCard';
import './CollectionGrid.css';

const CollectionGrid = ({ products, showFilters = true }) => {
    const [activeFilter, setActiveFilter] = useState('All');

    // Get unique categories
    const categories = ['All', ...new Set(products.map(p => p.Category))];

    // Filter products
    const filteredProducts = activeFilter === 'All'
        ? products
        : products.filter(p => p.Category === activeFilter);

    return (
        <div className="collection-grid-wrapper">
            {showFilters && (
                <div className="filter-bar">
                    {categories.map((category) => (
                        <button
                            key={category}
                            className={`filter-btn ${activeFilter === category ? 'active' : ''}`}
                            onClick={() => setActiveFilter(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            )}

            <div className="collection-grid">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                        <ProductCard key={product.ID} product={product} />
                    ))
                ) : (
                    <div className="no-products">
                        <p>No products found in this category.</p>
                    </div>
                )}
            </div>

            {filteredProducts.length > 0 && (
                <div className="collection-count">
                    Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                </div>
            )}
        </div>
    );
};

export default CollectionGrid;
