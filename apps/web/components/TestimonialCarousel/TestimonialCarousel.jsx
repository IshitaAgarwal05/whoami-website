'use client';

import { useState, useRef, useEffect } from 'react';
import './TestimonialCarousel.css';

const TestimonialCarousel = ({ testimonials }) => {
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

    const handleScroll = () => {
        const container = carouselRef.current;
        if (container) {
            setShowLeftArrow(container.scrollLeft > 20);
            setShowRightArrow(
                container.scrollLeft < container.scrollWidth - container.clientWidth - 20
            );
        }
    };

    useEffect(() => {
        const container = carouselRef.current;
        if (container) {
            handleScroll();
            window.addEventListener('resize', handleScroll);
            return () => window.removeEventListener('resize', handleScroll);
        }
    }, []);

    return (
        <div className="testimonial-carousel-wrapper">
            <div className="carousel-controls">
                <button
                    className={`nav-arrow left ${!showLeftArrow ? 'hidden' : ''}`}
                    onClick={() => scroll('left')}
                    aria-label="Previous"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>
                <button
                    className={`nav-arrow right ${!showRightArrow ? 'hidden' : ''}`}
                    onClick={() => scroll('right')}
                    aria-label="Next"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </button>
            </div>

            <div
                className="testimonial-carousel-container"
                ref={carouselRef}
                onScroll={handleScroll}
            >
                {testimonials.map((testimonial, index) => (
                    <div key={index} className="testimonial-slide">
                        <div className="testimonial-card-premium">
                            <div className="quote-mark">“</div>
                            <p className="quote-text">{testimonial.text}</p>
                            <div className="testimonial-author-box">
                                <span className="author-name">{testimonial.author}</span>
                                <span className="author-role">{testimonial.role}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TestimonialCarousel;
