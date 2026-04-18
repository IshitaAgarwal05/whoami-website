import { useState, useEffect, useRef } from 'react';
import { getProductImages } from '../../utils/imageUtils';
import './ImageCarousel.css';

const ImageCarousel = ({ imageUrl, productName }) => {
    const [images, setImages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const trackRef = useRef(null);

    const minSwipeDistance = 50;

    useEffect(() => {
        const fetchedImages = getProductImages(imageUrl);
        setImages(fetchedImages);
        setCurrentIndex(0);
    }, [imageUrl]);

    const nextSlide = () => {
        if (images.length <= 1) return;
        setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
    };

    const prevSlide = () => {
        if (images.length <= 1) return;
        setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
    };

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            nextSlide();
        } else if (isRightSwipe) {
            prevSlide();
        }
    };

    if (images.length === 0) {
        return (
            <div className="product-image">
                <div className="fallback-placeholder">No Image Available</div>
            </div>
        );
    }

    if (images.length === 1) {
        return (
            <div className="product-image">
                <img src={images[0]} alt={productName} />
            </div>
        );
    }

    return (
        <div className="product-image image-carousel-container">
            <div 
                className="carousel-track-wrapper"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                <div 
                    className="carousel-track" 
                    ref={trackRef}
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                    {images.map((imgUrl, index) => (
                        <div className="carousel-slide" key={index}>
                            <img 
                                src={imgUrl} 
                                alt={`${productName} - View ${index + 1}`} 
                                loading={index === 0 ? "eager" : "lazy"} 
                            />
                        </div>
                    ))}
                </div>
            </div>

            <button className="carousel-arrow left-arrow" onClick={prevSlide} aria-label="Previous Image">
                &#10094;
            </button>
            <button className="carousel-arrow right-arrow" onClick={nextSlide} aria-label="Next Image">
                &#10095;
            </button>

            <div className="carousel-dots">
                {images.map((_, index) => (
                    <button
                        key={index}
                        className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
                        onClick={() => setCurrentIndex(index)}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default ImageCarousel;
