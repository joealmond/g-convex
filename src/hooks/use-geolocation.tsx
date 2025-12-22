'use client';

import { useState, useCallback, createContext, useContext } from 'react';
import type { ReactNode } from 'react';

export interface GeolocationCoords {
  lat: number;
  lng: number;
}

export interface GeolocationState {
  coords: GeolocationCoords | null;
  error: string | null;
  loading: boolean;
  requestLocation: () => void;
  clearLocation: () => void;
}

const GeolocationContext = createContext<GeolocationState | undefined>(undefined);

export function GeolocationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{
    coords: GeolocationCoords | null;
    error: string | null;
    loading: boolean;
  }>({
    coords: null,
    error: null,
    loading: false,
  });

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
        loading: false,
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          coords: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          error: null,
          loading: false,
        });
      },
      (error) => {
        let errorMessage = 'Failed to get location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        setState({
          coords: null,
          error: errorMessage,
          loading: false,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes cache
      }
    );
  }, []);

  const clearLocation = useCallback(() => {
    setState({
      coords: null,
      error: null,
      loading: false,
    });
  }, []);

  return (
    <GeolocationContext.Provider value={{ ...state, requestLocation, clearLocation }}>
      {children}
    </GeolocationContext.Provider>
  );
}

export function useGeolocation() {
  const context = useContext(GeolocationContext);
  if (context === undefined) {
    throw new Error('useGeolocation must be used within a GeolocationProvider');
  }
  return context;
}
