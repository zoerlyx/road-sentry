import { useState, useEffect, useCallback } from 'react';



export const useGeolocation = () => {

  const [coords, setCoords] = useState({ lat: null, lng: null });

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);



  const getLocation = useCallback(() => {

    setLoading(true);

    setError(null);



    if (!navigator.geolocation) {

      setError('Browser tidak mendukung GPS');

      setLoading(false);

      return;

    }



    navigator.geolocation.getCurrentPosition(

      (position) => {

        setCoords({

          lat: position.coords.latitude,

          lng: position.coords.longitude

        });

        setLoading(false);

      },

      (err) => {

        setError('Gagal mengambil lokasi: ' + err.message);

        setLoading(false);

      },

      { enableHighAccuracy: true, timeout: 10000 }

    );

  }, []);



  useEffect(() => {

    getLocation();

  }, [getLocation]);



  return { coords, loading, error, getLocation };

};
