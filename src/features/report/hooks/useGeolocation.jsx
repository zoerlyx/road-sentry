import { useState, useEffect, useCallback } from 'react';



export const useGeolocation = () => {



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





  return { coords, loading, error, getLocation };

};
