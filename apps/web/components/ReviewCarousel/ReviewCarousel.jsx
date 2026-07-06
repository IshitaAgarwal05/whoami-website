'use client';

import { useState, useRef } from 'react';
import './ReviewCarousel.css';

const ReviewCarousel = ({ images, categoryName }) => {
    const carouselRef = useRef(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);

    const scroll = (direction) => {
        const container = carouselRef.current;
        if (!container) return;

        const scrollAmount = container.clientWidth * 0.8;
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
        }, 100); 
    };

    if (!images || images.length === 0) return null;

    return (
        <div className="review-carousel-section">
            <div className="carousel-header">
                {categoryName && <h2 className="carousel-title">{categoryName}</h2>}
            </div>

            <div
                className="review-carousel"
                ref={carouselRef}
                onScroll={handleScroll}
            >
                {images.map((image, index) => (
                    <div key={index} className="review-carousel-item">
                        <div className="review-image-wrapper">
                            <img src={image} alt={`Customer Review ${index + 1}`} loading="lazy" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReviewCarousel;
