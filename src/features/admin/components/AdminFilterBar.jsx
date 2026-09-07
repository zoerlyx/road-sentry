import { FaSearch, FaUndoAlt } from 'react-icons/fa';
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from '../constants/reportStatus';

export const AdminFilterBar = ({ filters, onFilterChange, onReset }) => {
  const handleStatusChange = (e) => onFilterChange({ status: e.target.value });
  const handlePriorityChange = (e) => onFilterChange({ priority: e.target.value });
  const handleSearchChange = (e) => onFilterChange({ search: e.target.value });

return (
  <div
    className="filter-bar"
    style={{
      width: '100%',
      background: 'rgba(28, 28, 30, 0.65)',
      backdropFilter: 'blur(30px) saturate(190%)',
      WebkitBackdropFilter: 'blur(30px) saturate(190%)',
      borderRadius: '20px',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      padding: '12px 16px',
      boxSizing: 'border-box',
      marginBottom: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, sans-serif'
    }}
  >
    <div
      className="filter-group"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        width: '100%'
      }}
    >
      {/* Baris 1: Search Field Input */}
      <div
        className="filter-input-wrapper"
        style={{
          position: 'relative',
          width: '100%',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <FaSearch
          className="filter-input-icon"
          style={{
            position: 'absolute',
            left: '14px',
            color: '#8e8e93',
            fontSize: '14px',
            pointerEvents: 'none',
            zIndex: 1
          }}
        />
        <input
          type="text"
          className="filter-input"
          placeholder="Cari laporan..."
          value={filters.search || ''}
          onChange={handleSearchChange}
          style={{
            width: '100%',
            padding: '6px 14px 6px 38px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#f5f5f7',
            fontSize: '13px',
            fontWeight: 500,
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'all 0.2s ease',
            lineHeight: '1.2'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#0A84FF';
            e.target.style.boxShadow = '0 0 0 3px rgba(10, 132, 255, 0.25)';
            e.target.style.background = 'rgba(255, 255, 255, 0.08)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            e.target.style.boxShadow = 'none';
            e.target.style.background = 'rgba(255, 255, 255, 0.05)';
          }}
        />
      </div>

      {/* Baris 2: Dropdown Status, Prioritas, & Tombol Reset Icon */}
      <div
        className="filter-controls-row"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          width: '100%'
        }}
      >
        {/* Status Dropdown */}
        <select
          className="filter-select"
          value={filters.status || ''}
          onChange={handleStatusChange}
          style={{
            flex: 1,
            minWidth: 0,
            padding: '6px 28px 6px 12px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#f5f5f7',
            fontSize: '13px',
            fontWeight: 500,
            outline: 'none',
            cursor: 'pointer',
            boxSizing: 'border-box',
            transition: 'all 0.2s ease',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='%238e8e93' height='16' viewBox='0 0 24 24' width='16' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 8px center',
            lineHeight: '1.2'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#0A84FF';
            e.target.style.boxShadow = '0 0 0 3px rgba(10, 132, 255, 0.25)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            e.target.style.boxShadow = 'none';
          }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} style={{ background: '#1c1c1e', color: '#f5f5f7' }}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Priority Dropdown */}
        <select
          className="filter-select"
          value={filters.priority || ''}
          onChange={handlePriorityChange}
          style={{
            flex: 1,
            minWidth: 0,
            padding: '6px 28px 6px 12px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#f5f5f7',
            fontSize: '13px',
            fontWeight: 500,
            outline: 'none',
            cursor: 'pointer',
            boxSizing: 'border-box',
            transition: 'all 0.2s ease',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='%238e8e93' height='16' viewBox='0 0 24 24' width='16' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 8px center',
            lineHeight: '1.2'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#0A84FF';
            e.target.style.boxShadow = '0 0 0 3px rgba(10, 132, 255, 0.25)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            e.target.style.boxShadow = 'none';
          }}
        >
          {PRIORITY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} style={{ background: '#1c1c1e', color: '#f5f5f7' }}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Reset Button (Hanya Ikon) */}
        <button
          className="filter-reset"
          onClick={onReset}
          title="Reset Filter"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '6px 12px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#f5f5f7',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxSizing: 'border-box',
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
          }}
        >
          <FaUndoAlt style={{ fontSize: '12px', color: '#8e8e93' }} />
        </button>
      </div>
    </div>
  </div>
);
};