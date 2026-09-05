'use client';

import { useState, useEffect, useCallback } from 'react';
import './ReviewCarousel.css';

const ReviewCarousel = ({ images, categoryName }) => {
    const [lightboxSrc, setLightboxSrc] = useState(null);

    const closeLightbox = useCallback(() => setLightboxSrc(null), []);

    // Close on Escape key
    useEffect(() => {
        if (!lightboxSrc) return;
        const onKey = (e) => { if (e.key === 'Escape') closeLightbox(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [lightboxSrc, closeLightbox]);

    if (!images || images.length === 0) return null;

    // Duplicate for seamless infinite loop
    const doubled = [...images, ...images];

    return (
        <>
            <div className="review-carousel-section">
                {categoryName && (
                    <div className="review-carousel-header">
                        <h2 className="review-carousel-title">{categoryName}</h2>
                    </div>
                )}

                <div className="review-marquee-wrapper" aria-label="Customer reviews">
                    <div className="review-marquee-track">
                        {doubled.map((image, index) => (
                            <div
                                key={index}
                                className="review-marquee-item"
                                onClick={() => setLightboxSrc(image)}
                                role="button"
                                tabIndex={index < images.length ? 0 : -1}
                                aria-label={`View review image ${(index % images.length) + 1}`}
                                onKeyDown={(e) => e.key === 'Enter' && setLightboxSrc(image)}
                            >
                                <img
                                    src={image}
                                    alt={`Customer Review ${(index % images.length) + 1}`}
                                    loading="lazy"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Lightbox */}
            {lightboxSrc && (
                <div
                    className="review-lightbox-overlay"
                    onClick={closeLightbox}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Review image"
                >
                    <button
                        className="review-lightbox-close"
                        onClick={closeLightbox}
                        aria-label="Close"
                    >
                        &times;
                    </button>
                    <div
                        className="review-lightbox-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img src={lightboxSrc} alt="Review" />
                    </div>
                </div>
            )}
        </>
    );
};

export default ReviewCarousel;
