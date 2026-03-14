import { useRef, useState } from 'react';
import './ValuesCarousel.css';

const ValuesCarousel = () => {
    const carouselRef = useRef(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);

    const values = [
        {
            icon: '✦',
            title: 'Identity',
            description: 'Not what you wear. Who you are. Artifacts that don\'t announce, they resonate. For those who know the difference between a symbol and a logo. Your desk, your identity.'
        },
        {
            icon: '⚡',
            title: 'Rebellion',
            description: 'The quiet kind. The kind that doesn\'t shout but refuses to conform. Premium craftsmanship for those who won\'t blend into beige cubicles and generic aesthetics.'
        },
        {
            icon: '♡',
            title: 'Emotion',
            description: 'Every product evokes the magic of your favorite stories. The thrill of seeing your house crest on your desk, the joy of gifting a loved one something truly special. We design for emotional connection.'
        },
        {
            icon: '⬢',
            title: 'Craft',
            description: 'Made in India with precision engineering. We use premium materials, 3D printing, and laser cutting to create products that are as refined as they are meaningful. Quality that lasts.'
        },
        {
            icon: '✓',
            title: 'Trust',
            description: 'An Indian brand you can trust. Transparent pricing, honest materials, and reliable delivery across India. We\'re fans serving fans.'
        },
        {
            icon: '◈',
            title: 'Connection',
            description: 'From Jaipur workshops to your desk in Delhi, Bangalore, Mumbai, or anywhere you\'re building your world. Indian-made, globally understood.'
        }
    ];

    const scroll = (direction) => {
        const container = carouselRef.current;
        if (!container) return;

        const scrollAmount = container.clientWidth * 0.9;
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

    return (
        <div className="values-carousel-section">
            <div className="values-carousel-controls">
                <button
                    className={`values-carousel-arrow left ${!showLeftArrow ? 'hidden' : ''}`}
                    onClick={() => scroll('left')}
                    aria-label="Scroll left"
                >
                    ←
                </button>
                <button
                    className={`values-carousel-arrow right ${!showRightArrow ? 'hidden' : ''}`}
                    onClick={() => scroll('right')}
                    aria-label="Scroll right"
                >
                    →
                </button>
            </div>

            <div
                className="values-carousel"
                ref={carouselRef}
                onScroll={handleScroll}
            >
                {values.map((value, index) => (
                    <div key={index} className="value-card">
                        <div className="value-icon">{value.icon}</div>
                        <div className="value-content">
                            <h3>{value.title}</h3>
                            <p>{value.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ValuesCarousel;
