"use client";

import maplibregl, { type StyleSpecification } from "maplibre-gl";
import { useEffect, useRef } from "react";

import { DEMO_SCENARIO } from "../../lib/demo-scenario";
import { localMetersToGeographic } from "../../lib/geo";

interface MapViewProps {
  player: { east: number; north: number };
  onMove?: (position: { east: number; north: number }) => void;
}

function featureCollection(features: object[]) {
  return { type: "FeatureCollection" as const, features };
}

function buildStyle(): StyleSpecification {
  return {
    version: 8,
    name: "Disaster Simulation Local Fixture",
    sources: {
      roads: {
        type: "geojson",
        data: featureCollection(
          DEMO_SCENARIO.roads.map((coordinates, index) => ({
            type: "Feature",
            id: `road-${index}`,
            properties: {},
            geometry: { type: "LineString", coordinates },
          })),
        ),
      },
      hazard: {
        type: "geojson",
        data: featureCollection([
          {
            type: "Feature",
            properties: {},
            geometry: {
              type: "Polygon",
              coordinates: [DEMO_SCENARIO.hazardPolygon],
            },
          },
        ]),
      },
      evacuation: {
        type: "geojson",
        data: featureCollection([
          {
            type: "Feature",
            properties: {},
            geometry: {
              type: "Point",
              coordinates: [
                DEMO_SCENARIO.evacuationTarget.longitude,
                DEMO_SCENARIO.evacuationTarget.latitude,
              ],
            },
          },
        ]),
      },
    },
    layers: [
      {
        id: "background",
        type: "background",
        paint: { "background-color": "#08121d" },
      },
      {
        id: "hazard-fill",
        type: "fill",
        source: "hazard",
        paint: {
          "fill-color": "#3d8fb0",
          "fill-opacity": 0.24,
          "fill-outline-color": "#75d7ff",
        },
      },
      {
        id: "roads",
        type: "line",
        source: "roads",
        paint: {
          "line-color": "#718394",
          "line-width": 4,
        },
      },
      {
        id: "evacuation",
        type: "circle",
        source: "evacuation",
        paint: {
          "circle-radius": 8,
          "circle-color": "#d8ff9a",
          "circle-stroke-color": "#08121d",
          "circle-stroke-width": 3,
        },
      },
    ],
  };
}

export function MapView({ player, onMove }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const onMoveRef = useRef(onMove);
  onMoveRef.current = onMove;

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: buildStyle(),
      center: [DEMO_SCENARIO.center.longitude, DEMO_SCENARIO.center.latitude],
      zoom: 15.4,
      pitch: 0,
      attributionControl: false,
      localIdeographFontFamily: "sans-serif",
    });
    const marker = new maplibregl.Marker({ color: "#ffffff", scale: 0.8 })
      .setLngLat([DEMO_SCENARIO.center.longitude, DEMO_SCENARIO.center.latitude])
      .addTo(map);

    map.on("click", (event) => {
      const latitudeRadians = (DEMO_SCENARIO.center.latitude * Math.PI) / 180;
      const metersPerDegreeLongitude = 111_320 * Math.cos(latitudeRadians);
      onMoveRef.current?.({
        east:
          (event.lngLat.lng - DEMO_SCENARIO.center.longitude) *
          metersPerDegreeLongitude,
        north:
          (event.lngLat.lat - DEMO_SCENARIO.center.latitude) * 111_320,
      });
    });

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      marker.remove();
      map.remove();
      markerRef.current = null;
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const coordinate = localMetersToGeographic(DEMO_SCENARIO.center, player);
    markerRef.current?.setLngLat([coordinate.longitude, coordinate.latitude]);
  }, [player]);

  return (
    <div className="map-frame" aria-label="避難経路を操作する2D地図">
      <div className="map-canvas" ref={containerRef} />
      <div className="map-legend">
        <span><i className="legend-player" />現在地</span>
        <span><i className="legend-target" />避難目標</span>
        <span><i className="legend-hazard" />最大浸水Envelope（合成fixture）</span>
      </div>
    </div>
  );
}
