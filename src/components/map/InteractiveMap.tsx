"use client";

import React, { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { GibsLayer, AreaOfInterest } from "@/types";

interface InteractiveMapProps {
  basemapUrl: string;
  basemapAttribution: string;
  selectedGibsLayer: GibsLayer | null;
  gibsDate: string;
  overlayOpacity: number;
  centerCoords?: [number, number] | null;
  onCoordinatesChange: (coords: { lat: number; lng: number; zoom: number }) => void;
  onSelectAoi: (aoi: AreaOfInterest) => void;
}

export default function InteractiveMap({
  basemapUrl,
  basemapAttribution,
  selectedGibsLayer,
  gibsDate,
  overlayOpacity,
  centerCoords,
  onCoordinatesChange,
  onSelectAoi,
}: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const basemapLayerRef = useRef<L.TileLayer | null>(null);
  const gibsLayerRef = useRef<L.TileLayer | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Fix Leaflet's default icon paths in Next.js
  useEffect(() => {
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [20.0, 0.0],
      zoom: 3,
      minZoom: 2,
      maxZoom: 18,
      zoomControl: false,
    });

    L.control.zoom({ position: "topright" }).addTo(map);

    // Initial Basemap
    const basemap = L.tileLayer(basemapUrl, {
      attribution: basemapAttribution,
      maxZoom: 19,
    }).addTo(map);

    basemapLayerRef.current = basemap;
    mapInstanceRef.current = map;

    // Track mouse coordinates
    map.on("mousemove", (e: L.LeafletMouseEvent) => {
      onCoordinatesChange({
        lat: Number(e.latlng.lat.toFixed(4)),
        lng: Number(e.latlng.lng.toFixed(4)),
        zoom: map.getZoom(),
      });
    });

    // Click to select Area of Interest (AOI)
    map.on("click", (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      const zoom = map.getZoom();

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        const marker = L.marker([lat, lng]).addTo(map);
        markerRef.current = marker;
      }

      onSelectAoi({
        type: "Point",
        coordinates: [Number(lat.toFixed(4)), Number(lng.toFixed(4))],
        zoom,
        label: `Coordinates: ${lat.toFixed(3)}°N, ${lng.toFixed(3)}°E (Zoom ${zoom})`,
      });
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update Basemap when changed
  useEffect(() => {
    if (!mapInstanceRef.current || !basemapLayerRef.current) return;
    mapInstanceRef.current.removeLayer(basemapLayerRef.current);
    const newBasemap = L.tileLayer(basemapUrl, {
      attribution: basemapAttribution,
      maxZoom: 19,
    }).addTo(mapInstanceRef.current);
    basemapLayerRef.current = newBasemap;

    // Ensure GIBS layer stays on top
    if (gibsLayerRef.current) {
      gibsLayerRef.current.bringToFront();
    }
  }, [basemapUrl, basemapAttribution]);

  // Update NASA GIBS Overlay when layer or date changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (gibsLayerRef.current) {
      mapInstanceRef.current.removeLayer(gibsLayerRef.current);
      gibsLayerRef.current = null;
    }

    if (selectedGibsLayer) {
      const tileUrl = selectedGibsLayer.urlTemplate.replace("{time}", gibsDate);

      const gibsLayer = L.tileLayer(tileUrl, {
        attribution: selectedGibsLayer.attribution,
        maxZoom: selectedGibsLayer.maxZoom,
        opacity: overlayOpacity,
        // @ts-ignore
        tileSize: 256,
      }).addTo(mapInstanceRef.current);

      gibsLayerRef.current = gibsLayer;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGibsLayer, gibsDate]);

  // Update GIBS opacity
  useEffect(() => {
    if (gibsLayerRef.current) {
      gibsLayerRef.current.setOpacity(overlayOpacity);
    }
  }, [overlayOpacity]);

  // Handle centerCoords change (fly to location & update marker)
  useEffect(() => {
    if (!mapInstanceRef.current || !centerCoords) return;
    const [lat, lng] = centerCoords;
    mapInstanceRef.current.flyTo([lat, lng], 9, { duration: 1.2 });

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      const marker = L.marker([lat, lng]).addTo(mapInstanceRef.current);
      markerRef.current = marker;
    }
  }, [centerCoords]);

  return <div ref={mapContainerRef} className="w-full h-full bg-[#050811]" />;
}
