export const GradientBackground = () => {
  return (
    <>
      <style>{`
        .bg-apple-dark {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          /* Base dark background ala iOS Dark Mode */
          background-color: #0d0e12;
          z-index: -3;
          pointer-events: none;
          overflow: hidden;
        }

        /* Gradient Orbs untuk pendaran warna halus di background */
        .bg-glow-1 {
          position: fixed;
          top: -10%;
          left: -10%;
          width: 50vw;
          height: 50vw;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(0, 0, 0, 0) 70%);
          filter: blur(80px);
          z-index: -2;
          pointer-events: none;
        }

        .bg-glow-2 {
          position: fixed;
          bottom: -10%;
          right: -5%;
          width: 60vw;
          height: 60vw;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, rgba(0, 0, 0, 0) 70%);
          filter: blur(100px);
          z-index: -2;
          pointer-events: none;
        }

        /* Subtle Noise Grid Texture (Opsional untuk estetika khas Apple) */
        .bg-subtle-overlay {
          position: fixed;
          inset: 0;
          background-image: radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 32px 32px;
          z-index: -1;
          pointer-events: none;
        }
      `}</style>

      {/* Latar Belakang Dark Glass Mesh */}
      <div className="bg-apple-dark" />
      <div className="bg-glow-1" />
      <div className="bg-glow-2" />
      <div className="bg-subtle-overlay" />
    </>
  );
};