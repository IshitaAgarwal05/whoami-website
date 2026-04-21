export default function Loading() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#0a0a0a',
      color: '#ffffff',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div className="loader-container" style={{ position: 'relative', width: '80px', height: '80px' }}>
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          border: '3px solid transparent',
          borderTopColor: '#FDD835',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          width: '60px',
          height: '60px',
          top: '10px',
          left: '10px',
          border: '3px solid transparent',
          borderBottomColor: '#ffffff',
          borderRadius: '50%',
          animation: 'spin-reverse 1.5s linear infinite'
        }}></div>
        <img 
          src="/whoami_logo.png" 
          alt="Logo" 
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '30px',
            height: '30px',
            opacity: '0.8'
          }} 
        />
      </div>
      <p style={{
        marginTop: '24px',
        fontSize: '14px',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        opacity: '0.6'
      }}>Defining Identity...</p>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          to { transform: rotate(-360deg); }
        }
      `}} />
    </div>
  );
}
