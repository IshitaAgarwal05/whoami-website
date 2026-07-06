export default function ProductLoading() {
    return (
        <div className="container" style={{ padding: '4rem 2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', maxWidth: '1200px', margin: '0 auto' }}>
                {/* Image skeleton */}
                <div style={{
                    aspectRatio: '1',
                    borderRadius: '16px',
                    background: 'rgba(255,255,255,0.05)',
                    animation: 'pulse 1.5s ease-in-out infinite',
                }} />
                {/* Info skeleton */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ height: '20px', width: '100px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }} />
                    <div style={{ height: '36px', width: '80%', borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }} />
                    <div style={{ height: '28px', width: '120px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }} />
                    <div style={{ height: '100px', width: '100%', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', marginTop: '1rem' }} />
                </div>
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
