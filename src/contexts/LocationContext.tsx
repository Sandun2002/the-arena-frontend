"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

export type LocationState = "idle" | "loading" | "granted" | "denied";
export interface Coords {
  lat: number;
  lng: number;
}

interface LocationContextValue {
  locState: LocationState;
  locName: string | null;
  coords: Coords | null;
  requestLocation: () => void;
  clearLocation: () => void;
}

const LocationContext = createContext<LocationContextValue | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [locState, setLocState] = useState<LocationState>("idle");
  const [locName, setLocName] = useState<string | null>(null);
  const [coords, setCoords] = useState<Coords | null>(null);

  const requestLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    if (locState === "loading") return;

    setLocState("loading");

    // Dual-callback guard for Chrome/Windows behaviour
    let succeeded = false;
    let errorTimer: ReturnType<typeof setTimeout> | null = null;

    navigator.geolocation.getCurrentPosition(
      async ({ coords: pos }) => {
        succeeded = true;
        if (errorTimer) clearTimeout(errorTimer);

        const { latitude, longitude } = pos;
        setCoords({ lat: latitude, lng: longitude });

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const name =
            data.address?.suburb ??
            data.address?.neighbourhood ??
            data.address?.city_district ??
            data.address?.city ??
            data.address?.town ??
            data.address?.county ??
            "Your Location";
          setLocName(name);
        } catch {
          setLocName("Your Location");
        }

        setLocState("granted");
      },
      () => {
        errorTimer = setTimeout(() => {
          if (succeeded) return;
          setLocState("denied");
        }, 2000);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 600_000 }
    );
  }, [locState]);

  const clearLocation = useCallback(() => {
    setLocState("idle");
    setLocName(null);
    setCoords(null);
  }, []);

  return (
    <LocationContext.Provider
      value={{ locState, locName, coords, requestLocation, clearLocation }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation(): LocationContextValue {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocation must be used within <LocationProvider>");
  return ctx;
}
