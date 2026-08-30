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
    
  );
};