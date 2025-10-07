import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import styled from "styled-components";
import Loader from "./roots/loader";

const MapWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;

  .leaflet-container {
    width: 100%;
    height: 100%;
  }
`;

const RouteLayer = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    if (!points || points.length < 2) return;

    const coords = points.map(p => `${p.lng},${p.lat}`).join(";");
    const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;

    let geojsonLayer;

    const fetchRoute = async () => {
      try {
        const res = await fetch(url);
        const data = await res.json();

        if (!data.routes?.length) return;

        const route = data.routes[0].geometry;

        geojsonLayer = L.geoJSON(route, {
          style: { color: "blue", weight: 4, opacity: 0.7 }
        }).addTo(map);

        if (geojsonLayer.getBounds) {
          map.fitBounds(geojsonLayer.getBounds(), { padding: [30, 30] });
        }
      } catch {
        // celowo pusto → brak logów w konsoli
      }
    };

    fetchRoute();

    return () => {
      if (geojsonLayer) {
        try {
          map.removeLayer(geojsonLayer);
        } catch {
          // brak logów, ciche usunięcie
        }
      }
    };
  }, [points, map]);

  return null;
};

export const RouteMap = ({ schedule }) => {
  const [points, setPoints] = useState([]);

  useEffect(() => {
    if (schedule && schedule.length > 0) {
      const pts = schedule.map(item => ({
        lat: item.lokalizacja.lat,
        lng: item.lokalizacja.lng
      }));
      setPoints(pts);
    } else {
      setPoints([]);
    }
  }, [schedule]);

  if (!points.length) {
    return <Loader />;
  }

  return (
    <MapWrapper>
      <MapContainer
        center={[points[0].lat, points[0].lng]}
        zoom={13}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RouteLayer
          key={points.map(p => `${p.lat},${p.lng}`).join("|")}
          points={points}
        />
      </MapContainer>
    </MapWrapper>
  );
};

export default RouteMap;
