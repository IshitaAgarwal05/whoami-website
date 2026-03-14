import { useState, useRef } from 'react';
import ProductCard from '../ProductCard/ProductCard';
import './ProductCarousel.css';

const ProductCarousel = ({ products, categoryName }) => {
    const carouselRef = useRef(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);

    const scroll = (direction) => {
        const container = carouselRef.current;
        if (!container) return;

        const scrollAmount = container.clientWidth * 0.8; // Scroll 80% of visible width
        const newScrollLeft = direction === 'left'
            ? container.scrollLeft - scrollAmount
            : container.scrollLeft + scrollAmount;

        container.scrollTo({
            left: newScrollLeft,
            behavior: 'smooth'
        });
    };

    const throttleTimer = useRef(null);

    const handleScroll = () => {
        if (throttleTimer.current) return;

        throttleTimer.current = setTimeout(() => {
            const container = carouselRef.current;
            if (container) {
                setShowLeftArrow(container.scrollLeft > 10);
                setShowRightArrow(
                    container.scrollLeft < container.scrollWidth - container.clientWidth - 10
                );
            }
            throttleTimer.current = null;
        }, 100); // Throttle to 10fps for arrow checks (unobtrusive)
    };

    return (
        <div className="product-carousel-section">
            <div className="carousel-header">
                <h2 className="carousel-title">{categoryName}</h2>
                <div className="carousel-controls">
                    <button
                        className={`carousel-arrow carousel-arrow-left ${!showLeftArrow ? 'hidden' : ''}`}
                        onClick={() => scroll('left')}
                        aria-label="Scroll left"
                    >
                        ←
                    </button>
                    <button
                        className={`carousel-arrow carousel-arrow-right ${!showRightArrow ? 'hidden' : ''}`}
                        onClick={() => scroll('right')}
                        aria-label="Scroll right"
                    >
                        →
                    </button>
                </div>
            </div>

            <div
                className="product-carousel"
                ref={carouselRef}
                onScroll={handleScroll}
            >
                {products.map((product) => (
                    <div key={product.ID} className="carousel-item">
                        <ProductCard product={product} compact={true} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductCarousel;
