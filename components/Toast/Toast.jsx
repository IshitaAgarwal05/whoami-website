import React, { useState, useEffect } from 'react';
import './Toast.css';

const Toast = ({ message, type = 'success', duration = 3000, onComplete }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            if (onComplete) {
                setTimeout(onComplete, 400); // Wait for fade out animation
            }
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onComplete]);

    return (
        <div className={`toast-notification ${type} ${isVisible ? 'visible' : ''}`}>
            <div className="toast-content">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>{message}</span>
            </div>
            <div className="toast-progress" style={{ animationDuration: `${duration}ms` }}></div>
        </div>
    );
};

export default Toast;
