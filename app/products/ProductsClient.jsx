'use client';

import { useState, useEffect, useRef } from 'react';
import ProductCard from '../../components/ProductCard/ProductCard';
import '../../styles/Products.css';

const ProductsClient = ({ allProducts = [], combos, forcedCategory = 'All', allCategories = [] }) => {
    const [sortBy, setSortBy] = useState('default');
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState(forcedCategory);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [visibleCount, setVisibleCount] = useState(16);
    const showOnlyWithImages = process.env.NEXT_PUBLIC_SHOW_NO_IMAGE_PRODUCTS !== 'true';
    const dropdownRef = useRef(null);

    const ITEMS_PER_PAGE = 16;

    // Reset visible count when tab, category, or search changes
    useEffect(() => {
        setVisibleCount(ITEMS_PER_PAGE);
    }, [activeTab, activeCategory, searchQuery]);

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + ITEMS_PER_PAGE);
    };

    const tabs = [
        { id: 'store-99', label: 'Under ₹99', subtext: 'Small price. Big personality.' },
        { id: 'all', label: 'Curated For You', subtext: 'Find what represents you' },
        { id: 'combos', label: 'Curated Combos', subtext: 'Save more. Gift better.' },
        { id: 'charms', label: 'Charms', subtext: 'Collect your charms' }
    ];

    const sortOptions = [
        { value: 'default', label: 'Featured' },
        { value: 'price-asc', label: 'Price: Low to High' },
        { value: 'price-desc', label: 'Price: High to Low' }
    ];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSortSelect = (value) => {
        setSortBy(value);
        setIsDropdownOpen(false);
    };

    const getCategories = () => {
        let rawCats;
        if (activeTab === 'combos') {
            rawCats = [...new Set(combos.map(p => p.Category))].filter(Boolean);
        } else if (allCategories.length > 0) {
            // Use the complete category list provided by the server
            rawCats = [...allCategories];
        } else {
            rawCats = [...new Set(allProducts.map(p => p.Category))].filter(Boolean);
        }
        
        // Filter out Charms because it has its own main tab
        rawCats = rawCats.filter(cat => cat !== 'Charms');
        
        const preferredOrder = ['Collectibles', 'Keychains', 'Book Accessories', 'Decor'];
        const sortedCats = rawCats.sort((a, b) => {
            const indexA = preferredOrder.indexOf(a);
            const indexB = preferredOrder.indexOf(b);
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return a.localeCompare(b);
        });
        return ['All', ...sortedCats];
    };

    const getFilteredData = () => {
        let data = [];
        if (activeTab === 'store-99') {
            data = allProducts.filter(p => p.Price <= 99);
        } else if (activeTab === 'combos') {
            data = combos;
        } else if (activeTab === 'charms') {
            data = allProducts.filter(p => p.Category === 'Keychains' || p.Category === 'Charms');
        } else {
            data = allProducts;
        }

        if (showOnlyWithImages) {
            data = data.filter(p => 
                p.ImageURL && 
                p.ImageURL !== '/products/placeholder.webp' && 
                !p.ImageURL.includes('placehold.co')
            );
        }

        if (activeCategory !== 'All') {
            data = data.filter(p => p.Category === activeCategory);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            data = data.filter(p =>
                p.Name.toLowerCase().includes(query) ||
                p.Description.toLowerCase().includes(query) ||
                (p.Material && p.Material.toLowerCase().includes(query))
            );
        }

        return [...data].sort((a, b) => {
            if (sortBy === 'price-asc') return a.Price - b.Price;
            if (sortBy === 'price-desc') return b.Price - a.Price;
            return 0;
        });
    };

    const currentSortLabel = sortOptions.find(opt => opt.value === sortBy)?.label;
    const activeTabData = tabs.find(t => t.id === activeTab);
    const allFilteredItems = getFilteredData();
    const displayItems = allFilteredItems.slice(0, visibleCount);
    const hasMore = visibleCount < allFilteredItems.length;
    const categories = getCategories();

    return (
        <div className={`products-page ${activeTab}`}>
            <div className="container">
                <div className="products-header">
                    <h1 className="reveal-text">Discover Your Identity</h1>
                    <p className="products-subtitle">
                        {activeTabData.subtext}
                    </p>

                    <div className="products-tabs-container">
                        <div className="products-tabs">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                                    onClick={() => {
                                        setActiveTab(tab.id);
                                        setActiveCategory('All');
                                    }}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="products-controls">
                        <div className="search-bar">
                            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                            <input
                                type="text"
                                placeholder="Search identity..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="custom-dropdown" ref={dropdownRef}>
                            <span className="dropdown-label">Sort by:</span>
                            <div
                                className={`dropdown-trigger ${isDropdownOpen ? 'active' : ''}`}
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            >
                                <span>{currentSortLabel}</span>
                                <svg className={`chevron-icon ${isDropdownOpen ? 'rotate' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M6 9l6 6 6-6"></path>
                                </svg>
                            </div>

                            {isDropdownOpen && (
                                <ul className="dropdown-menu">
                                    {sortOptions.map((option) => (
                                        <li
                                            key={option.value}
                                            className={`dropdown-item ${sortBy === option.value ? 'selected' : ''}`}
                                            onClick={() => handleSortSelect(option.value)}
                                        >
                                            {option.label}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {!(activeTab === 'combos' || activeTab === 'charms') && (
                            <div className="category-filters">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        className={`cat-btn ${activeCategory === cat ? 'active' : ''}`}
                                        onClick={() => setActiveCategory(cat)}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        )}


                    </div>
                </div>

                {activeTab === 'combos' && (
                    <div className="combo-general-note" style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)', padding: '0 var(--spacing-lg)' }}>
                        <p style={{ color: 'var(--color-warm-gold)', fontStyle: 'italic', fontSize: 'var(--font-size-sm)' }}>
                            * Please Note: Books shown in the product images are for styling purposes only and are not included in the combos.
                        </p>
                    </div>
                )}

                <div className="products-grid">
                    {displayItems.map((item) => (
                        <ProductCard
                            key={`${activeTab}-${item.ID}`}
                            product={item}
                            compact={activeTab === 'store-99'}
                            isCombo={activeTab === 'combos'}
                        />
                    ))}
                </div>

                {hasMore && (
                    <div className="load-more-container">
                        <button 
                            className="load-more-btn"
                            onClick={handleLoadMore}
                        >
                            Load More Products
                        </button>
                    </div>
                )}

                {displayItems.length === 0 && (
                    <div className="empty-state">
                        <p>No products found in this category.</p>
                        <button onClick={() => { setSearchQuery(''); setActiveCategory('All'); }} className="reset-btn">
                            Clear Filter
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductsClient;
