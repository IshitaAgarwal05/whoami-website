'use client';

import Link from 'next/link';

export default function ProductError({ error, reset }) {
    return (
        <div className="container" style={{ textAlign: 'center', padding: '6rem 2rem' }}>
            <h1 style={{ fontSize: '2rem', color: '#FDD835', marginBottom: '1rem' }}>
                Something went wrong
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
                We couldn&apos;t load this product. This might be a temporary issue — please try again.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button
                    onClick={() => reset()}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: '#FDD835',
                        color: '#0F0F0F',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 600,
                    }}
                >
                    Try Again
                </button>
                <Link
                    href="/products"
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: 'rgba(255,255,255,0.1)',
                        color: '#fff',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontWeight: 600,
                    }}
                >
                    Back to Products
                </Link>
            </div>
        </div>
    );
}
