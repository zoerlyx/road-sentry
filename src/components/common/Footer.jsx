import { useState, useEffect } from 'react';

export const Footer = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <footer
      style={{
        width: '100%',
        maxWidth: '960px',
        margin: '0 auto',
        padding: isMobile ? '24px 16px 36px' : '36px 20px 48px',
        /* Border atas tipis berkilau ala iOS Dark Mode */
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif'
      }}
    >
      <p
        style={{
          fontSize: isMobile ? '12px' : '13px',
          fontWeight: 500,
          /* Warna teks utama terang soft ala Apple Dark */
          color: '#f5f5f7',
          margin: '0 0 6px 0',
          lineHeight: 1.4,
          letterSpacing: '-0.01em'
        }}
      >
        © 2026 Road-Sentry | Sistem Pelaporan Jalan Rusak Berbasis AI & GIS
      </p>

      <p
        style={{
          fontSize: isMobile ? '11px' : '12px',
          fontWeight: 400,
          /* Warna teks sekunder muted */
          color: '#a1a1aa',
          margin: 0,
          lineHeight: 1.4
        }}
      >
        Dikembangkan oleh Fardho Z.
      </p>
    </footer>
  );
};