import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { getApiUrl } from '../../config';
import ProductCard from '../../components/ProductCard/ProductCard';
import './Products.css';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('default');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const sortOptions = [
        { value: 'default', label: 'Featured' },
        { value: 'price-asc', label: 'Price: Low to High' },
        { value: 'price-desc', label: 'Price: High to Low' }
    ];

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await axios.get(getApiUrl('/api/products'));

                if (response.data.success) {
                    setProducts(response.data.data);
                } else {
                    setError('Failed to load products');
                }
            } catch (err) {
                console.error('Error fetching products:', err);
                setError('Failed to connect to the server');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

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

    const sortedProducts = [...products].sort((a, b) => {
        if (sortBy === 'price-asc') {
            return a.Price - b.Price;
        } else if (sortBy === 'price-desc') {
            return b.Price - a.Price;
        }
        return 0; // default (Excel order)
    });

    const currentSortLabel = sortOptions.find(opt => opt.value === sortBy)?.label;

    if (loading) {
        return (
            <div className="products-page">
                <div className="container">
                    <div className="loading-state">
                        <div className="loading"></div>
                        <p>Loading products...</p>
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
        <div className="products-page">
            <div className="container">
                <div className="products-header">
                    <h1>Our Products</h1>
                    <p className="products-subtitle">
                        Discover our complete collection of handcrafted desk accessories,
                        collectibles, puzzles, and personalized gifts. Each piece is
                        meticulously designed and precision-crafted.
                    </p>

                    <div className="products-controls">
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

                <div className="products-grid">
                    {sortedProducts.map((product) => (
                        <ProductCard key={product.ID} product={product} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Products;
