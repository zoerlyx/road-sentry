import { FaImage, FaEye, FaMapMarkerAlt, FaCalendarAlt, FaExclamationTriangle } from 'react-icons/fa';

export const AdminReportsTable = ({ reports = [], loading, onViewReport, onStatusChange }) => {
    const getPriorityBadge = (priority) => {
        const p = (priority || 'low').toLowerCase();
        let bg = 'rgba(48, 209, 88, 0.15)';
        let color = '#30D158';
        let label = 'Rendah';

        if (p === 'urgent' || p === 'darurat' || p === 'krusial') {
            bg = 'rgba(255, 69, 58, 0.2)';
            color = '#FF453A';
            label = 'Urgent';
        } else if (p === 'high' || p === 'tinggi') {
            bg = 'rgba(255, 69, 58, 0.15)';
            color = '#FF453A';
            label = 'Tinggi';
        } else if (p === 'medium' || p === 'sedang') {
            bg = 'rgba(255, 159, 10, 0.15)';
            color = '#FF9F0A';
            label = 'Sedang';
        }

        return (
            <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 600,
                background: bg,
                color: color,
                border: `1px solid ${color}33`,
                letterSpacing: '0.02em',
                textTransform: 'uppercase'
            }}>
                {(p === 'urgent' || p === 'high') && <FaExclamationTriangle style={{ fontSize: '10px' }} />}
                {label}
            </span>
        );
    };

    const getStatusBadge = (status) => {
        const s = (status || 'pending').toLowerCase();
        let bg = 'rgba(255, 159, 10, 0.15)';
        let color = '#FF9F0A';
        let label = 'Pending';

        if (s === 'in_progress') {
            bg = 'rgba(10, 132, 255, 0.15)';
            color = '#0A84FF';
            label = 'Diproses';
        } else if (s === 'resolved' || s === 'completed') {
            bg = 'rgba(48, 209, 88, 0.15)';
            color = '#30D158';
            label = 'Selesai';
        } else if (s === 'rejected') {
            bg = 'rgba(255, 69, 58, 0.15)';
            color = '#FF453A';
            label = 'Ditolak';
        }

        return (
            <span style={{
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 600,
                 background: bg,
                color: color,
                border: `1px solid ${color}33`,
                display: 'inline-block'
            }}>
                {label}
            </span>
        );
    };

    if (loading) {
        return (
            <div style={{
                background: 'rgba(28, 28, 30, 0.5)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '50px 20px',
                textAlign: 'center',
                color: '#8e8e93'
            }}>
                 <p style={{ margin: 0, fontSize: '14px', color: '#a1a1aa' }}>Memuat data laporan...</p>
            </div>
        );
    }

    if (!reports || reports.length === 0) {
        return (
            <div style={{
                background: 'rgba(28, 28, 30, 0.5)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '50px 20px',
                textAlign: 'center'
            }}>
                 <p style={{ margin: 0, fontSize: '14px', color: '#8e8e93', fontWeight: 500 }}>
                    Tidak ada data laporan ditemukan
                </p>
            </div>
        );
    }

    return (
         <div style={{
            background: 'rgba(20, 20, 22, 0.6)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            overflow: 'auto'
        }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(255, 255, 255, 0.02)' }}>
                        <th style={thStyle}>Info</th>
                        <th style={thStyle}>Lokasi</th>
                        <th style={thStyle}>Kondisi & Deskripsi</th>
                        <th style={thStyle}>Prioritas</th>
                        <th style={thStyle}>Status</th>
                        <th style={thStyle}>Tanggal</th>
                        <th style={{ ...thStyle, textAlign: 'center' }}>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {reports.map((report) => {
                        const id = report.id || report.reportId;
                        const imageUrl = report.annotated_image_url || report.image_url || report.imageUrl;
                        const lat = report.latitude ? Number(report.latitude).toFixed(4) : '-';
                        const lng = report.longitude ? Number(report.longitude).toFixed(4) : '-';
                        const priority = report.priority || report.priorityLabel || 'medium';
                        const date = report.created_at || report.submittedAt;

                        return (
                            <tr
                                key={id}
                                style={{
                                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                                    transition: 'background 0.15s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <td style={tdStyle}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        
                                        <div>
                                            <div style={{ fontSize: '10px', color: '#8e8e93', textTransform: 'uppercase', letterSpacing: '0.04em' }}>ID LAPORAN</div>
                                            <div style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 600, color: '#0A84FF' }}>
                                                #{id}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '12px', color: '#f5f5f7' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <FaMapMarkerAlt style={{ color: '#0A84FF', fontSize: '12px' }} />
                                        <span>{lat}, {lng}</span>
                                    </div>
                                </td>
                                <td style={{ ...tdStyle, color: '#f5f5f7', fontSize: '13px', maxWidth: '240px' }}>
                                    {report.road_condition && (
                                        <div style={{ fontSize: '11px', color: '#0A84FF', fontWeight: 600, marginBottom: '2px' }}>
                                            {report.road_condition}
                                        </div>
                                    )}
                                    <span title={report.description} style={{ color: '#a1a1aa', fontSize: '12px' }}>
                                        {report.description ? (report.description.length > 50 ? `${report.description.substring(0, 50)}...` : report.description) : '-'}
                                    </span>
                                </td>
                                <td style={tdStyle}>{getPriorityBadge(priority)}</td>
                                <td style={tdStyle}>{getStatusBadge(report.status)}</td>
                                <td style={{ ...tdStyle, fontSize: '12px', color: '#8e8e93' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <FaCalendarAlt style={{ color: '#8e8e93', fontSize: '11px' }} />
                                        <span>
                                            {date ? new Date(date).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            }) : '-'}
                                        </span>
                                    </div>
                                </td>
                                <td style={tdStyle}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <button
                                            onClick={() => onViewReport(id)}
                                            title="Lihat Detail Laporan"
                                            style={{
                                                padding: '7px 10px',
                                                borderRadius: '8px',
                                                background: 'rgba(10, 132, 255, 0.15)',
                                                border: '1px solid rgba(10, 132, 255, 0.3)',
                                                color: '#0A84FF',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                  justifyContent: 'center',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <FaEye style={{ fontSize: '12px' }} />
                                        </button>
                                        <select
                                            className="status-select"
                                            value={report.status || 'pending'}
                                            onChange={(e) => onStatusChange(id, e.target.value)}
                                            style={{
                                                padding: '6px 10px',
                                                borderRadius: '8px',
                                                fontSize: '11px',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                outline: 'none',
                                                background: 'rgba(255, 255, 255, 0.08)',
                                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                                color: '#ffffff'
                                            }}
                                        >
                                            <option value="pending" style={{ background: '#1c1c1e', color: '#fff' }}>Pending</option>
                                            <option value="in_progress" style={{ background: '#1c1c1e', color: '#0A84FF' }}>Diproses</option>
                                            <option value="resolved" style={{ background: '#1c1c1e', color: '#30D158' }}>Selesai</option>
                                            <option value="rejected" style={{ background: '#1c1c1e', color: '#FF453A' }}>Ditolak</option>
                                        </select>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

const thStyle = {
    padding: '14px 16px',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#8e8e93'
};

const tdStyle = {
    padding: '14px 16px',
    verticalAlign: 'middle'
};