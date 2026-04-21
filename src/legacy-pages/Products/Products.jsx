import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { getApiUrl } from '../../config';
import ProductCard from '../../components/ProductCard/ProductCard';
import './Products.css';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [combos, setCombos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('default');
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showOnlyWithImages, setShowOnlyWithImages] = useState(true);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const dropdownRef = useRef(null);

    const INITIAL_LIMIT = 20;
    const LOAD_MORE_LIMIT = 10;

    const fetchData = async (currentOffset = 0, isInitial = true) => {
        try {
            if (isInitial) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            const limit = isInitial ? INITIAL_LIMIT : LOAD_MORE_LIMIT;
            const [productsRes, combosRes] = await Promise.all([
                axios.get(getApiUrl(`/api/products?limit=${limit}&offset=${currentOffset}`)),
                axios.get(getApiUrl('/api/products/combos'))
            ]);

            if (productsRes.data.success) {
                if (isInitial) {
                    setProducts(productsRes.data.data);
                } else {
                    setProducts(prev => [...prev, ...productsRes.data.data]);
                }
                setHasMore(productsRes.data.has_more);
                setOffset(currentOffset);
            }
            if (combosRes.data.success && isInitial) {
                setCombos(combosRes.data.data);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to connect to the server');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchData(0, true);
    }, []);

    const handleLoadMore = () => {
        const nextOffset = offset + (offset === 0 ? INITIAL_LIMIT : LOAD_MORE_LIMIT);
        fetchData(nextOffset, false);
    };

    const tabs = [
        { id: 'store-99', label: 'Under ₹99', subtext: 'Small price. Big personality.' },
        { id: 'all', label: 'Explore Identity', subtext: 'Find what represents you' },
        { id: 'combos', label: 'Curated Combos', subtext: 'Save more. Gift better.' }
    ];

    const sortOptions = [
        { value: 'default', label: 'Featured' },
        { value: 'price-asc', label: 'Price: Low to High' },
        { value: 'price-desc', label: 'Price: High to Low' }
    ];

    // Close dropdown when clicking outside
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

    // Get categories for current tab
    const getCategories = () => {
        const data = activeTab === 'combos' ? combos : products;
        const rawCats = [...new Set(data.map(p => p.Category))].filter(Boolean);
        
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

    const getActiveData = () => {
        let data = [];
        if (activeTab === 'store-99') {
            data = products.filter(p => p.Price <= 99);
        } else if (activeTab === 'combos') {
            data = combos;
        } else {
            data = products;
        }

        // Apply Image Filter
        if (showOnlyWithImages) {
            data = data.filter(p => 
                p.ImageURL && 
                p.ImageURL !== '/products/placeholder.webp' && 
                !p.ImageURL.includes('placehold.co')
            );
        }

        // Apply Category Filter
        if (activeCategory !== 'All') {
            data = data.filter(p => p.Category === activeCategory);
        }

        // Apply Search Filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            data = data.filter(p =>
                p.Name.toLowerCase().includes(query) ||
                p.Description.toLowerCase().includes(query) ||
                (p.Material && p.Material.toLowerCase().includes(query))
            );
        }

        // Apply Sort
        return [...data].sort((a, b) => {
            if (sortBy === 'price-asc') return a.Price - b.Price;
            if (sortBy === 'price-desc') return b.Price - a.Price;
            return 0;
        });
    };

    const currentSortLabel = sortOptions.find(opt => opt.value === sortBy)?.label;
    const activeTabData = tabs.find(t => t.id === activeTab);
    const displayItems = getActiveData();
    const categories = getCategories();

    if (loading) {
        return (
            <div className="products-page">
                <div className="container">
                    <div className="loading-state">
                        <div className="loading"></div>
                        <p>Loading your identity...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="products-page">
                <div className="container">
                    <div className="error-state">
                        <h2>Oops!</h2>
                        <p>{error}</p>
                    </div>
                </div>
            </div>
        );
    }

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
                                        setActiveCategory('All'); // Reset category on tab change
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

                        <div className="filter-toggle">
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={showOnlyWithImages}
                                    onChange={(e) => setShowOnlyWithImages(e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                            <span className="toggle-label">Hide items without images</span>
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
                    </div>
                </div>

                <div className={`products-grid ${activeTab === 'store-99' ? '' : ''}`}>
                {/* <div className={`products-grid ${activeTab === 'store-99' ? 'dense' : ''}`}> */}
                    {displayItems.map((item) => (
                        <ProductCard
                            key={`${activeTab}-${item.ID}`}
                            product={item}
                            compact={activeTab === 'store-99'}
                        />
                    ))}
                </div>

                {hasMore && (
                    <div className="load-more-container">
                        <button 
                            className={`load-more-btn ${loadingMore ? 'loading' : ''}`}
                            onClick={handleLoadMore}
                            disabled={loadingMore}
                        >
                            {loadingMore ? (
                                <div className="btn-spinner"></div>
                            ) : (
                                'Load More Products'
                            )}
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

export default Products;
