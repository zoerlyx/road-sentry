import { useState, useEffect, useRef, useCallback } from 'react';
import { ReportFormCard } from '../components/ReportFormCard';
import { StatsSection } from '../components/StatsSection';
import { WorkflowSection } from '../components/WorkflowSection';
import { useReportSubmission } from '../hooks/useReportSubmission';
import { reportService } from '../services/report.service';
import { Toast } from '../../../components/ui/Toast';
import { GradientBackground } from '../../../components/ui/GradientBackground';
import { Navbar } from '../../../components/common/Navbar';
import { Footer } from '../../../components/common/Footer';
import ReportStatus from '../components/ReportStatus';

export const ReportPage = () => {
  const { submitReport, isSubmitting } = useReportSubmission();
  const workflowRef = useRef(null);
  const statsRef = useRef(null);   
  
  const [stats, setStats] = useState({ total: 0, pending: 0, urgent: 0 });
  const [statsAnimated, setStatsAnimated] = useState(false);
  const [toast, setToast] = useState(null);
  
  // State untuk menyimpan detail laporan yang berhasil diproses AI
  const [submittedReport, setSubmittedReport] = useState(null);

  // Fetch statistik dinamis dari backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await reportService.getStats();
        if (response && (response.success || response.data)) {
          const statsData = response.data || response;
          setStats({
            total: Number(statsData.total ?? statsData.total_reports ?? 0),
            pending: Number(statsData.pending ?? statsData.pending_reports ?? 0) + Number(statsData.in_progress ?? 0),
            resolved: Number(statsData.resolved ?? statsData.resolved_reports ?? statsData.completed ?? 0)
          });
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        setStats({ total: 0, pending: 0, resolved: 0 });
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !statsAnimated) {
            setStatsAnimated(true);
          }
        });
      },
      { threshold: 0.5 }
    );
    
    const statsSection = document.querySelector('.stats-bar');
    if (statsSection) observer.observe(statsSection);
    
    return () => observer.disconnect();
  }, [statsAnimated]);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const handleResetForm = useCallback(() => {
    setSubmittedReport(null);
  }, []);

  const handleSubmit = useCallback(async (formData) => {
    try {
      const response = await submitReport(formData);

      // Extrak objek report dan ai_summary sesuai response backend
      const reportData = response?.data?.report;
      const aiSummary = response?.data?.ai_summary;

      if (reportData) {
        setSubmittedReport({
          reportId: reportData.id,
          imageUrl: reportData.annotated_image_url || reportData.image_url,
          originalUrl: reportData.image_url,
          aiSummary: aiSummary,
          reportData: reportData
        });
      }
      return response;
    } catch (error) {
      console.error('Submit report error:', error);
      showToast(error?.message || 'Gagal mengirim laporan', 'error');
      throw error;
    }
  }, [submitReport, showToast]);

  return (
    <>
      <GradientBackground />
      <Navbar />
      
      <main>
        <section>
          <section
            style={{
              width: '100%',
              maxWidth: '1200px',
              display: 'flex',
              alignItems: 'center',          
              justifyContent: 'center',
              margin: '0 auto',
              padding: '100px 24px 20px 24px',
              boxSizing: 'border-box',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, sans-serif'
            }}
          >
            <div
              className="hero-container"
              style={{
                width: '100%',
                maxWidth: '1200px',
                margin: '0 0',
                padding: '48px 40px',
                background: 'rgba(28, 28, 30, 0.65)',
                backdropFilter: 'blur(30px) saturate(190%)',
                WebkitBackdropFilter: 'blur(30px) saturate(190%)',
                borderRadius: '28px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: '0 24px 48px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'flex-start',
                gap: '16px',
                boxSizing: 'border-box'
              }}
            >
              <h1
                style={{
                  margin: 0,
                  fontSize: 'clamp(28px, 4vw, 48px)',
                  fontWeight: 700,
                  color: '#f5f5f7',
                  letterSpacing: '-0.025em',
                  lineHeight: 1.15,
                  maxWidth: '900px'
                }}
              >
                Sistem Pelaporan & Manajemen Integrasi{' '}
                <span
                  className="hero-title-accent"
                  style={{
                    background: 'linear-gradient(135deg, #0a84ff 0%, #5e5ce6 50%, #64d2ff 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    display: 'inline-block'
                  }}
                >
                  Infrastruktur Jalan
                </span>
              </h1>

              <p
                className="hero-sub"
                style={{
                  margin: 0,
                  fontSize: 'clamp(15px, 1.5vw, 19px)',
                  fontWeight: 400,
                  color: '#a1a1a6',
                  lineHeight: 1.5,
                  letterSpacing: '-0.01em',
                  maxWidth: '1100px'
                }}
              >
                Portal pencatatan kerusakan jalan secara presisi, terawasi secara real-time, serta teroptimasi untuk efisiensi penanganan infrastruktur publik.
              </p>
            </div>
          </section>

          {/* SECTION STATISTIK */}
          <div ref={statsRef}>
            <StatsSection stats={stats} animated={statsAnimated} />
          </div>

          <WorkflowSection ref={workflowRef} />

          {/* SECTION FORM / STATUS LAPORAN */}
          <div className="w-full my-10 px-4">
            {submittedReport ? (
              <div
                style={{
                  width: '100%',
                  maxWidth: '1000px',
                  margin: '0 auto',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '24px'
                }}
              >
                <ReportStatus
                  reportId={submittedReport.reportId}
                  originalImage={submittedReport.originalUrl}
                  annotatedImage={submittedReport.imageUrl}
                  aiSummary={submittedReport.aiSummary}
                  reportData={submittedReport.reportData}
                />
                
                <button
                  onClick={handleResetForm}
                  style={{
                    padding: '14px 38px',

                    marginBottom: '32px',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    background: 'linear-gradient(135deg, #0A84FF 0%, #0066CC 100%)',
                    color: '#ffffff',
                    fontSize: '15px',
                    fontWeight: 600,
                    letterSpacing: '-0.01em',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    boxShadow: '0 10px 30px rgba(10, 132, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 15px 35px rgba(10, 132, 255, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(10, 132, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.25)';
                  }}
                >
                  <span style={{ fontSize: '18px', lineHeight: 1 }}>+</span> Buat Laporan Baru
                </button>
              </div>
            ) : (
              <ReportFormCard onSubmit={handleSubmit} isSubmitting={isSubmitting} />
            )}
          </div>
        </section>
      </main>
      
      <Footer />
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
};