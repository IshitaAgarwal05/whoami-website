export default function Loading() {
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0a0a0a'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid rgba(253, 216, 53, 0.2)',
        borderTopColor: '#fdd835',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
}
