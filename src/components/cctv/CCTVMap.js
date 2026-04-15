"use client";

/**
 * CCTVMap — Interactive map of Yogyakarta CCTV cameras.
 *
 * Uses React-Leaflet with switchable dark/light tiles.
 * Each CCTV location has a custom animated marker.
 * Click a marker → opens live stream modal.
 *
 * Must be dynamically imported (no SSR) since Leaflet needs `window`.
 */

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { YOGYA_CENTER, DEFAULT_ZOOM } from "@/lib/cctv-data";
import "leaflet/dist/leaflet.css";

/* ── Tile URLs ────────────────────────────────────────────────────── */

const TILES = {
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    bg: "#091413",
  },
  light: {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    bg: "#f2f0eb",
  },
};

/* ── Custom CCTV Marker Icon ──────────────────────────────────────── */

function createCCTVIcon() {
  return L.divIcon({
    className: "cctv-marker",
    html: `
      <div class="cctv-pin">
        <div class="cctv-pin-inner">
          <svg viewBox="0 0 24 24" fill="currentColor" class="cctv-icon">
            <path d="M20.916 9.564a.998.998 0 0 0-.513-1.42L7.084 4.01a.999.999 0 0 0-1.318.71L4.002 12.078a1 1 0 0 0 .71 1.318l3.959 1.399-1.379 1.835a1 1 0 0 0 .2 1.4l.5.375a1 1 0 0 0 1.4-.2l1.376-1.834 3.963 1.401a1 1 0 0 0 1.318-.71l.553-2.084 1.007.483a2.003 2.003 0 0 0 2.693-.985l.399-.83a2.002 2.002 0 0 0-.985-2.693l-.8-.39zM10.964 11.455a1.5 1.5 0 1 1 .536-2.053 1.502 1.502 0 0 1-.536 2.053zM7 20h10v2H7z"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -24],
  });
}

/* ── Map auto-fit to markers ──────────────────────────────────────── */

function FitBounds({ locations }) {
  const map = useMap();
  useEffect(() => {
    if (locations.length > 0) {
      const bounds = L.latLngBounds(locations.map((l) => [l.lat, l.lng]));
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
    }
  }, [map, locations]);
  return null;
}

/* ── Theme watcher — changes map background color ─────────────────── */

function ThemeSync({ lightTheme }) {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    container.style.transition = "background-color 0.5s ease";
    container.style.backgroundColor = lightTheme ? TILES.light.bg : TILES.dark.bg;
  }, [map, lightTheme]);
  return null;
}

/* ── Main Component ───────────────────────────────────────────────── */

export default function CCTVMap({ cameras, onSelectCCTV, selectedId, lightTheme = false }) {
  const cctvIcon = useRef(null);

  useEffect(() => {
    cctvIcon.current = createCCTVIcon();
  }, []);

  if (!cctvIcon.current) {
    cctvIcon.current = createCCTVIcon();
  }

  const tile = lightTheme ? TILES.light : TILES.dark;

  // Define bounding box to keep users around Yogyakarta
  const JOGJA_BOUNDS = [
    [-7.95, 110.20], // South-West padding
    [-7.65, 110.50]  // North-East padding
  ];

  return (
    <MapContainer
      center={[YOGYA_CENTER.lat, YOGYA_CENTER.lng]}
      zoom={DEFAULT_ZOOM}
      minZoom={12}
      maxBounds={JOGJA_BOUNDS}
      maxBoundsViscosity={1.0}
      className="w-full h-full z-0"
      zoomControl={false}
      attributionControl={false}
      style={{ background: tile.bg }}
    >
      {/* Tile layer — key change forces re-mount for smooth swap */}
      <TileLayer
        key={lightTheme ? "light" : "dark"}
        url={tile.url}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
      />

      <ThemeSync lightTheme={lightTheme} />
      <FitBounds locations={cameras} />

      {/* CCTV Markers */}
      {cameras.map((cam) => (
        <Marker
          key={cam.id}
          position={[cam.lat, cam.lng]}
          icon={cctvIcon.current}
          eventHandlers={{
            click: () => onSelectCCTV(cam),
          }}
        >
          <Popup
            className="cctv-popup"
            closeButton={false}
            autoPan={false}
          >
            <div className="cctv-popup-content">
              <p className="cctv-popup-name">{cam.name}</p>
              <p className="cctv-popup-location">
                {cam.district}
                {cam.categoryLabel ? ` • ${cam.categoryLabel}` : ""}
              </p>
              <button
                className="cctv-popup-btn"
                onClick={() => onSelectCCTV(cam)}
              >
                ▶ Liat Live
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
