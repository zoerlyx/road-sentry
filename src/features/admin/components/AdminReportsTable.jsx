import { FaImage, FaEye, FaMapMarkerAlt, FaCalendarAlt, FaExclamationTriangle } from 'react-icons/fa';

export const AdminReportsTable = ({ reports = [], loading, onViewReport, onStatusChange }) => {
    

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