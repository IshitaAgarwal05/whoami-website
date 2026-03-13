import { useState, useEffect } from 'react';
import axios from 'axios';
import { getApiUrl } from '../../config';
import ProductCard from '../../components/ProductCard/ProductCard';
import './Products.css';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
                </div>

                <div className="products-grid">
                    {products.map((product) => (
                        <ProductCard key={product.ID} product={product} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Products;
