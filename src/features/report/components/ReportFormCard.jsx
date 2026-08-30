import { useState, useRef, useCallback, useEffect } from 'react';
import {
  FaCloudUploadAlt,
  FaMapMarkerAlt,
  FaSyncAlt,
  FaPaperPlane,
  FaSpinner,
  FaTrash,
  FaKeyboard,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimes,
} from 'react-icons/fa';
import { createPortal } from 'react-dom';
import { useGeolocation } from '../hooks/useGeolocation';
import { validateReport } from '../validations/report.schema';
import { UserMapPreview } from './UserMapPreview';

const geocodeAddress = async (query, signal) => {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    query
  )}&limit=5&countrycodes=id`;
  const res = await fetch(url, {
    signal,
    headers: {
      'Accept-Language': 'id',
      'User-Agent': 'RoadSentry/1.0',
    },
  });
  if (!res.ok) throw new Error('Nominatim error');
  return res.json();
};

// Fungsi Helper Reverse Geocoding (Mendapatkan Alamat dari Lat/Lng)
const reverseGeocode = async (lat, lng) => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
    const res = await fetch(url, {
      headers: {
        'Accept-Language': 'id',
        'User-Agent': 'RoadSentry/1.0',
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.display_name || null;
  } catch (err) {
    console.error('Reverse Geocode error:', err);
    return null;
  }
};

export const ReportFormCard = ({ onSubmit, isSubmitting }) => {
  const { coords, loading: gpsLoading, error: gpsError, getLocation } = useGeolocation();
  const fileInputRef = useRef(null);
  const cardRef = useRef(null);
  const wrapperRef = useRef(null);
  const geocodeTimer = useRef(null);
  const abortControllerRef = useRef(null);

  const [locationMode, setLocationMode] = useState('gps');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: null,
    reportType: 'PENGADUAN',
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // State Status Feedback Backend
  const [submitResult, setSubmitResult] = useState(null);

  const [addressQuery, setAddressQuery] = useState('');
  const [addressResults, setAddressResults] = useState([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [manualCoords, setManualCoords] = useState({ lat: null, lng: null });

  // State Penyimpan String Alamat Terdeteksi
  const [resolvedAddress, setResolvedAddress] = useState('');

  const activeCoords =
    locationMode === 'gps'
      ? { lat: coords?.lat ?? null, lng: coords?.lng ?? null }
      : { lat: manualCoords.lat, lng: manualCoords.lng };

  // Otomatis lakukan Reverse Geocode saat koordinat GPS terdeteksi atau dipilih di peta
  useEffect(() => {
    if (activeCoords.lat && activeCoords.lng) {
      if (locationMode === 'manual' && addressQuery && addressQuery.length > 5) {
        setResolvedAddress(addressQuery);
      } else {
        reverseGeocode(activeCoords.lat, activeCoords.lng).then((addr) => {
          if (addr) setResolvedAddress(addr);
          else setResolvedAddress(`Koordinat (${activeCoords.lat.toFixed(5)}, ${activeCoords.lng.toFixed(5)})`);
        });
      }
    }
  }, [activeCoords.lat, activeCoords.lng, locationMode, addressQuery]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  useEffect(() => {
    return () => {
      if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showPreviewModal) setShowPreviewModal(false);
        else if (submitResult) setSubmitResult(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPreviewModal, submitResult]);

  const processFile = useCallback(
    (file) => {
      if (file && file.type.startsWith('image/')) {
        if (imagePreview) URL.revokeObjectURL(imagePreview);

        setFormData((prev) => ({ ...prev, image: file }));
        setImagePreview(URL.createObjectURL(file));
        setErrors((prev) => ({ ...prev, image: null }));
      }
    },
    [imagePreview]
  );

  const handleImageChange = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        processFile(e.dataTransfer.files[0]);
      }
    },
    [processFile]
  );

  const handleRemoveImage = useCallback(
    (e) => {
      e.stopPropagation();
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setFormData((prev) => ({ ...prev, image: null }));
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [imagePreview]
  );

  const handleAddressChange = useCallback((e) => {
    const value = e.target.value;
    setAddressQuery(value);
    setAddressResults([]);

    if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
    if (abortControllerRef.current) abortControllerRef.current.abort();

    if (value.trim().length < 4) {
      setAddressLoading(false);
      return;
    }

    geocodeTimer.current = setTimeout(async () => {
      setAddressLoading(true);
      abortControllerRef.current = new AbortController();
      try {
        const results = await geocodeAddress(value, abortControllerRef.current.signal);
        setAddressResults(results);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setAddressResults([]);
        }
      } finally {
        setAddressLoading(false);
      }
    }, 500);
  }, []);

  const handleSelectAddress = useCallback((result) => {
    setManualCoords({ lat: parseFloat(result.lat), lng: parseFloat(result.lon) });
    setAddressQuery(result.display_name);
    setResolvedAddress(result.display_name);
    setAddressResults([]);
    setErrors((prev) => ({ ...prev, location: null }));
  }, []);

  const handleMapLocationChange = useCallback(
    (newCoords) => {
      setManualCoords({ lat: newCoords.lat, lng: newCoords.lng });
      setErrors((prev) => ({ ...prev, location: null }));
      if (locationMode !== 'manual') {
        setLocationMode('manual');
      }
    },
    [locationMode]
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setSubmitted(false);

      const validation = validateReport({
        image: formData.image,
        latitude: activeCoords.lat,
        longitude: activeCoords.lng,
        description: formData.description,
        title: formData.title,
      });

      if (!validation.isValid) {
        setErrors(validation.errors);
        return;
      }

      setErrors({});
      const fullDescription = formData.title
        ? `${formData.title}\n\n${formData.description}`
        : formData.description;

      // --- PERBAIKAN UTAMA: Dapatkan alamat secara pasti sebelum submit ---
      let finalAddressLocation = resolvedAddress;

      // Jika resolvedAddress masih kosong padahal koordinat ada, lakukan reverseGeocode paksa saat ini juga
      if (!finalAddressLocation && activeCoords.lat && activeCoords.lng) {
        if (locationMode === 'manual' && addressQuery) {
          finalAddressLocation = addressQuery;
        } else {
          const fetchedAddr = await reverseGeocode(activeCoords.lat, activeCoords.lng);
          finalAddressLocation = fetchedAddr || `Lokasi Terpilih (${activeCoords.lat.toFixed(5)}, ${activeCoords.lng.toFixed(5)})`;
        }
      }

      // Fallback terakhir jika API Nominatim gagal/timeout
      if (!finalAddressLocation) {
        finalAddressLocation = addressQuery || (activeCoords.lat && activeCoords.lng 
          ? `Lokasi Terpilih (${activeCoords.lat.toFixed(5)}, ${activeCoords.lng.toFixed(5)})`
          : 'Lokasi tidak terdeteksi');
        }

      try {
        const response = await onSubmit({
          image: formData.image,
          latitude: activeCoords.lat,
          longitude: activeCoords.lng,
          description: fullDescription,
          reportType: formData.reportType,

          // KIRIM ALAMAT KE BACKEND (Mendukung snake_case, camelCase & address)
          address_location: finalAddressLocation,
          addressLocation: finalAddressLocation,
          address: finalAddressLocation,
        });

        if (response && response.is_road === false) {
          setSubmitResult({
            type: 'rejected',
            title: 'Laporan Tidak Diterima',
            message: response.message || 'Sistem mendeteksi foto yang Anda unggah bukan objek jalan rusak.',
          });
        } else {
          setSubmitted(true);
          setSubmitResult({
            type: 'success',
            title: 'Laporan Berhasil Terkirim',
            message: 'Laporan Anda telah tercatat dan sedang diproses oleh tim kami.',
          });

          if (imagePreview) URL.revokeObjectURL(imagePreview);
          setFormData({ title: '', description: '', image: null, reportType: 'PENGADUAN' });
          setImagePreview(null);
          setAddressQuery('');
          setResolvedAddress('');
          setManualCoords({ lat: null, lng: null });
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      } catch (err) {
        console.error('Submit error:', err);
        setSubmitResult({
          type: 'error',
          title: 'Gagal Mengirim Laporan',
          message: err.message || 'Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.',
        });
      }
    },
    [formData, activeCoords, imagePreview, resolvedAddress, addressQuery, onSubmit]
  );

  return (
    <div
      ref={wrapperRef}
      style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '20px',
        paddingBottom: '96px',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        ref={cardRef}
        style={{
          width: '100%',
          maxWidth: '1000px',
          background: 'rgba(28, 28, 30, 0.65)',
          backdropFilter: 'blur(25px) saturate(190%)',
          WebkitBackdropFilter: 'blur(25px) saturate(190%)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow:
            '0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          overflow: 'hidden',
          color: '#f5f5f7',
        }}
      >
        {/* Header macOS Dark Glass Window */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '16px 20px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#FF5F56' }} />
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#FFBD2E' }} />
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#27C93F' }} />
          <h2
            style={{
              margin: '0 0 0 12px',
              fontSize: '15px',
              fontWeight: 600,
              color: '#f5f5f7',
              letterSpacing: '-0.01em',
            }}
          >
            Form Pelaporan Jalan Rusak
          </h2>
        </div>

        <form
          onSubmit={handleSubmit}
          className="card-body"
          noValidate
          style={{
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }}
        >
          {/* Input Judul */}
          <input
            type="text"
            placeholder="Judul laporan"
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              fontSize: '14px',
              color: '#ffffff',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />

          {/* Textarea Deskripsi */}
          <div>
            <textarea
              className={`textarea-field ${errors.description ? 'input-error' : ''}`}
              placeholder="Detail lokasi / ciri kerusakan"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              rows={3}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: errors.description
                  ? '1px solid #FF453A'
                  : '1px solid rgba(255, 255, 255, 0.12)',
                fontSize: '14px',
                color: '#ffffff',
                outline: 'none',
                resize: 'none',
                boxSizing: 'border-box',
              }}
            />
            {errors.description && (
              <div
                className="error-message"
                style={{ color: '#FF453A', fontSize: '12px', marginTop: '4px', fontWeight: 500 }}
              >
                {errors.description}
              </div>
            )}
          </div>

          {/* Upload Area */}
          <div>
            <div
              className={`upload-area ${isDragging ? 'dragging' : ''}`}
              onClick={!imagePreview ? () => fileInputRef.current?.click() : undefined}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{
                cursor: imagePreview ? 'default' : 'pointer',
                border: isDragging
                  ? '2px dashed #0A84FF'
                  : errors.image
                  ? '1px dashed #FF453A'
                  : '1px dashed rgba(255, 255, 255, 0.2)',
                borderRadius: '16px',
                padding: '20px',
                textAlign: 'center',
                background: isDragging ? 'rgba(10, 132, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s ease',
              }}
            >
              {imagePreview ? (
                <>
                  <div className="image-preview-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="image-preview-img"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowPreviewModal(true);
                      }}
                      style={{
                        width: '100px',
                        height: '100px',
                        objectFit: 'cover',
                        borderRadius: '12px',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
                        cursor: 'pointer',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="btn-remove-image"
                      aria-label="Hapus foto"
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: 'rgba(255, 69, 58, 0.9)',
                        color: '#fff',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      <FaTrash />
                    </button>
                  </div>
                  <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#f5f5f7', fontWeight: 500 }}>
                    Foto siap diupload · klik foto untuk preview
                  </p>
                  <span
                    style={{ fontSize: '12px', color: '#0A84FF', cursor: 'pointer', fontWeight: 500 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    Ganti foto
                  </span>
                </>
              ) : (
                <>
                  <FaCloudUploadAlt style={{ fontSize: '32px', color: '#0A84FF', marginBottom: '4px' }} />
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#f5f5f7' }}>
                    Upload foto jalan rusak
                  </p>
                  <span style={{ fontSize: '12px', color: '#8e8e93' }}>
                    Tarik & lepas foto di sini atau klik untuk mencari · JPG, PNG maks. 5MB
                  </span>
                </>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden-input"
                onChange={handleImageChange}
                onClick={(e) => e.stopPropagation()}
                style={{ display: 'none' }}
              />
            </div>
            {errors.image && (
              <div className="error-message" style={{ color: '#FF453A', fontSize: '12px', marginTop: '6px', fontWeight: 500 }}>
                {errors.image}
              </div>
            )}
          </div>

          {/* Segmented Control */}
          <div
            className="location-mode-tabs"
            style={{
              display: 'flex',
              background: 'rgba(0, 0, 0, 0.3)',
              padding: '3px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              gap: '4px',
            }}
          >
            <button
              type="button"
              className={`loc-tab ${locationMode === 'gps' ? 'active' : ''}`}
              onClick={() => setLocationMode('gps')}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '9px',
                border: 'none',
                background: locationMode === 'gps' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                color: locationMode === 'gps' ? '#ffffff' : '#8e8e93',
                boxShadow: locationMode === 'gps' ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
                fontWeight: 500,
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer',
              }}
            >
              <FaMapMarkerAlt /> GPS Otomatis
            </button>
            <button
              type="button"
              className={`loc-tab ${locationMode === 'manual' ? 'active' : ''}`}
              onClick={() => setLocationMode('manual')}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '9px',
                border: 'none',
                background: locationMode === 'manual' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                color: locationMode === 'manual' ? '#ffffff' : '#8e8e93',
                boxShadow: locationMode === 'manual' ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
                fontWeight: 500,
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer',
              }}
            >
              <FaKeyboard /> Cari Alamat
            </button>
          </div>

          {locationMode === 'gps' && (
            <div
              className="gps-bar"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                fontSize: '13px',
                color: '#f5f5f7',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>
                  <FaMapMarkerAlt style={{ marginRight: '6px', color: '#0A84FF' }} />
                  GPS Auto-detect:
                  <strong style={{ marginLeft: '4px', fontWeight: 600, color: '#ffffff' }}>
                    {gpsLoading
                      ? ' Mendeteksi...'
                      : gpsError
                      ? ' Gagal'
                      : coords?.lat && coords?.lng
                      ? ` ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`
                      : ' Tidak tersedia'}
                  </strong>
                </span>
              </div>
              <button
                type="button"
                onClick={getLocation}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0A84FF',
                  cursor: 'pointer',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <FaSyncAlt />
              </button>
            </div>
          )}

          {locationMode === 'manual' && (
            <div className="address-search-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className="address-input-row" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Ketik nama jalan..."
                  value={addressQuery}
                  onChange={handleAddressChange}
                  autoComplete="off"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    fontSize: '14px',
                    color: '#ffffff',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                {addressLoading && (
                  <FaSpinner
                    className="animate-spin"
                    style={{ position: 'absolute', right: '14px', color: '#8e8e93' }}
                  />
                )}
              </div>
              {addressResults.length > 0 && (
                <ul
                  style={{
                    listStyle: 'none',
                    margin: 0,
                    padding: '6px',
                    borderRadius: '12px',
                    background: 'rgba(38, 38, 41, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.5)',
                  }}
                >
                  {addressResults.map((r, i) => (
                    <li
                      key={i}
                      onClick={() => handleSelectAddress(r)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        color: '#f5f5f7',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <FaMapMarkerAlt style={{ color: '#0A84FF', flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.display_name}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {manualCoords.lat && (
                <div
                  style={{
                    marginTop: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    fontSize: '13px',
                    color: '#f5f5f7',
                  }}
                >
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0A84FF' }} />
                  <span>
                    Lokasi:{' '}
                    <strong style={{ fontWeight: 600, color: '#ffffff' }}>
                      {manualCoords.lat?.toFixed(6)}, {manualCoords.lng?.toFixed(6)}
                    </strong>
                  </span>
                </div>
              )}
            </div>
          )}

          {errors.location && (
            <div style={{ color: '#FF453A', fontSize: '12px', marginTop: '-6px', fontWeight: 500 }}>
              {errors.location}
            </div>
          )}

          <UserMapPreview
            lat={activeCoords.lat}
            lng={activeCoords.lng}
            submitted={submitted}
            onLocationChange={handleMapLocationChange}
          />

          {/* Display Indicator Alamat Terdeteksi */}
          {resolvedAddress && (
            <div
              style={{
                fontSize: '12px',
                color: '#8e8e93',
                padding: '6px 10px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              📍 Alamat terdeteksi: <span style={{ color: '#f5f5f7' }}>{resolvedAddress}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || (locationMode === 'gps' && gpsLoading)}
            style={{
              marginTop: '10px',
              marginBottom: '10px',
              padding: '14px',
              borderRadius: '14px',
              border: 'none',
              background: '#0A84FF',
              color: '#ffffff',
              fontSize: '15px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: isSubmitting || (locationMode === 'gps' && gpsLoading) ? 'not-allowed' : 'pointer',
              opacity: isSubmitting || (locationMode === 'gps' && gpsLoading) ? 0.6 : 1,
              boxShadow: '0 4px 16px rgba(10, 132, 255, 0.35)',
            }}
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="animate-spin" /> Memproses...
              </>
            ) : (
              <>
                <FaPaperPlane /> Kirim Laporan
              </>
            )}
          </button>
        </form>
      </div>

      {/* MODAL PREVIEW IMAGE */}
      {showPreviewModal &&
        imagePreview &&
        createPortal(
          <div
            onClick={() => setShowPreviewModal(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
            }}
          >
            <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
              <img
                src={imagePreview}
                alt="Full Preview"
                style={{
                  width: '100%',
                  height: '100%',
                  maxHeight: '80vh',
                  objectFit: 'contain',
                  borderRadius: '16px',
                  boxShadow: '0 25px 50px rgba(0, 0, 0, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                style={{
                  position: 'absolute',
                  top: '-16px',
                  right: '-16px',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'rgba(44, 44, 46, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <FaTimes />
              </button>
            </div>
          </div>,
          document.body
        )}

      {/* APPLE DARK MODE FEEDBACK MODAL (SUCCESS / REJECTED / ERROR) */}
      {submitResult &&
        createPortal(
          <div
            onClick={() => setSubmitResult(null)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10000,
              background: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(30px) saturate(180%)',
              WebkitBackdropFilter: 'blur(30px) saturate(180%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '420px',
                background: 'rgba(32, 32, 36, 0.75)',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
                padding: '28px 24px',
                textAlign: 'center',
                color: '#f5f5f7',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '14px',
              }}
            >
              {submitResult.type === 'success' && (
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'rgba(48, 209, 88, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#30D158',
                    fontSize: '32px',
                    marginBottom: '4px',
                  }}
                >
                  <FaCheckCircle />
                </div>
              )}

              {(submitResult.type === 'rejected' || submitResult.type === 'error') && (
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'rgba(255, 69, 58, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FF453A',
                    fontSize: '32px',
                    marginBottom: '4px',
                  }}
                >
                  <FaExclamationTriangle />
                </div>
              )}

              <h3 style={{ margin: 0, fontSize: '19px', fontWeight: 600, letterSpacing: '-0.02em' }}>
                {submitResult.title}
              </h3>

              <p style={{ margin: 0, fontSize: '14px', color: '#a1a1a6', lineHeight: 1.45 }}>
                {submitResult.message}
              </p>

              <button
                type="button"
                onClick={() => setSubmitResult(null)}
                style={{
                  marginTop: '12px',
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background:
                    submitResult.type === 'success'
                      ? 'rgba(48, 209, 88, 0.2)'
                      : 'rgba(255, 255, 255, 0.1)',
                  color: submitResult.type === 'success' ? '#30D158' : '#ffffff',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.2s ease',
                }}
              >
                Tutup
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};