export default function ProductsLoading() {
    return (
        <div className="container" style={{ padding: '4rem 2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ height: '40px', width: '300px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', margin: '0 auto', animation: 'pulse 1.5s ease-in-out infinite' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} style={{
                        borderRadius: '16px',
                        background: 'rgba(255,255,255,0.05)',
                        overflow: 'hidden',
                        animation: 'pulse 1.5s ease-in-out infinite',
                    }}>
                        <div style={{ aspectRatio: '1', background: 'rgba(255,255,255,0.03)' }} />
                        <div style={{ padding: '1rem' }}>
                            <div style={{ height: '16px', width: '70%', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', marginBottom: '0.5rem' }} />
                            <div style={{ height: '14px', width: '40%', borderRadius: '4px', background: 'rgba(255,255,255,0.05)' }} />
                        </div>
                    </div>
                ))}
            </div>
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }
            `}</style>
        </div>
    );
}
