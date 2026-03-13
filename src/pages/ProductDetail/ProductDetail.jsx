import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl } from '../../config';
import './ProductDetail.css';

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await axios.get(getApiUrl(`/api/products/${id}`));

                if (response.data.success) {
                    setProduct(response.data.data);
                } else {
                    setError('Product not found');
                }
            } catch (err) {
                console.error('Error fetching product:', err);
                setError('Failed to load product details');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(price);
    };

    if (loading) {
        return (
            <div className="product-detail-page">
                <div className="container">
                    <div className="loading-state">
                        <div className="loading"></div>
                        <p>Loading product...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="product-detail-page">
                <div className="container">
                    <div className="error-state">
                        <h2>Product Not Found</h2>
                        <p>{error || 'The product you are looking for does not exist.'}</p>
                        <Link to="/products" className="btn-primary">
                            Browse All Products
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const imageUrl = product.ImageURL || 'https://via.placeholder.com/600x600/2B2B2B/F5F5F3?text=WhoAmI';

    return (
        <div className="product-detail-page">
            <div className="container">
                {/* Breadcrumb */}
                <div className="breadcrumb">
                    <Link to="/">Home</Link>
                    <span>/</span>
                    <Link to="/products">Products</Link>
                    <span>/</span>
                    <span>{product.Name}</span>
                </div>

                <div className="product-detail-grid">
                    {/* Product Image */}
                    <div className="product-image-section">
                        <div className="product-image">
                            <img src={imageUrl} alt={product.Name} />
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="product-info-section">
                        <div className="product-category-badge">{product.Category}</div>

                        <h1 className="product-title">{product.Name}</h1>

                        <div className="product-price">{formatPrice(product.Price)}</div>

                        <div className="product-description">
                            <h3>Description</h3>
                            <p>{product.Description}</p>
                        </div>

                        <div className="product-specs">
                            <h3>Specifications</h3>
                            <div className="specs-grid">
                                <div className="spec-item">
                                    <span className="spec-label">Material</span>
                                    <span className="spec-value">{product.Material}</span>
                                </div>

                                {/* {product.Dimensions && (
                                    <div className="spec-item">
                                        <span className="spec-label">Dimensions</span>
                                        <span className="spec-value">{product.Dimensions}</span>
                                    </div>
                                )} */}

                                {/* {product.Weight && (
                                    <div className="spec-item">
                                        <span className="spec-label">Weight</span>
                                        <span className="spec-value">{product.Weight}</span>
                                    </div>
                                )} */}
                            </div>
                        </div>

                        {product.UseCase && (
                            <div className="product-use-case">
                                <h3>Use Case</h3>
                                <p>{product.UseCase}</p>
                            </div>
                        )}

                        {/* Note: No purchase button - informational only */}
                        <div className="product-note">
                            <p>
                                <strong>Note:</strong> This is a showcase website. For inquiries
                                about this product, please visit our <Link to="/contact">Contact</Link> page.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
