import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import styled, { createGlobalStyle } from 'styled-components';
import L from 'leaflet';

import AttractionResultMediumComponent, {
  AttractionResultMediumVerifiedComponent,
} from './attractionResultMediumComp';

// --- 1. Globalne style dla popupa i customowej ikony ---
const PopupStyles = createGlobalStyle`
  .leaflet-popup-content-wrapper {
    padding: 18px 10px 10px 10px;
    border-radius: 12px;
  }

  .leaflet-popup-content {
    margin: 0 !important;
    width: auto !important;
  }

  .leaflet-container {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .custom-marker {
    background: none !important;
    border: none !important;
  }
`;

// --- 2. Wrapper mapy ---
const MapWrapper = styled.div`
  width: 100%;
  height: 500px;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #e5e7eb;

  .leaflet-bottom.leaflet-right {
    display: block;
    background-color: rgba(255, 0, 0, 0);
    color: black;
    margin-bottom: auto;

    a {
      color: black;
    }
  }

  .leaflet-top.leaflet-left {
    display: block;
  }
`;

// --- 3. Pinezka: komponent z Twojego SVG, z podmianą koloru ---
const PinSvg = ({ color }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="-3 0 20 20"
    width="32"
    height="38"
    style={{
      display: 'block',
      filter: 'drop-shadow(0 3px 4px rgba(0, 0, 0, 0.35))',
    }}
  >
    <g stroke="white" strokeWidth="1" fill="none" fillRule="evenodd">
      <g transform="translate(-223.000000, -5399.000000)" fill={color}>
        <g transform="translate(56.000000, 160.000000)">
          <path d="M174,5248.219 C172.895,5248.219 172,5247.324 172,5246.219 C172,5245.114 172.895,5244.219 174,5244.219 C175.105,5244.219 176,5245.114 176,5246.219 C176,5247.324 175.105,5248.219 174,5248.219 M174,5239 C170.134,5239 167,5242.134 167,5246 C167,5249.866 174,5259 174,5259 C174,5259 181,5249.866 181,5246 C181,5242.134 177.866,5239 174,5239" />
        </g>
      </g>
    </g>
  </svg>
);

// --- 4. Pinezka dla mapy: wybór koloru + opakowanie SVG ---
const CustomPin = ({ isVerified }) => {
  const color = isVerified ? '#12b800ff' : '#2563eb'; // zielony / niebieski
  return <PinSvg color={color} />;
};

// --- 5. L.divIcon z powyższej pinezki ---
const createCustomIcon = (isVerified) => {
  const htmlString = ReactDOMServer.renderToString(
    <CustomPin isVerified={isVerified} />
  );

  // Wysoka, smukła pinezka
  const iconWidth = 26;
  const iconHeight = 32;

  return L.divIcon({
    html: htmlString,
    className: 'custom-marker',
    iconSize: [iconWidth, iconHeight],
    iconAnchor: [iconWidth / 2, iconHeight], // czubek pinezki mniej więcej w punkcie
    popupAnchor: [0, -iconHeight],          // popup nad pinezką
  });
};

// --- 6. Główny komponent mapy ---
const AttractionsMap = ({ attractions = [] }) => {
  const defaultCenter = [52.4064, 16.9252];

  const center =
    attractions.length > 0 && attractions[0].lokalizacja
      ? [attractions[0].lokalizacja.lat, attractions[0].lokalizacja.lng]
      : defaultCenter;

  return (
    <>
      <PopupStyles />
      <MapWrapper>
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          />

          {attractions.map((attraction) => {
            if (
              !attraction.lokalizacja ||
              !attraction.lokalizacja.lat ||
              !attraction.lokalizacja.lng
            ) {
              return null;
            }

            const isVerified = attraction.dataSource !== 'Bot';
            const customIcon = createCustomIcon(isVerified);

            return (
              <Marker
                key={attraction._id || attraction.googleId}
                position={[
                  attraction.lokalizacja.lat,
                  attraction.lokalizacja.lng,
                ]}
                icon={customIcon}
              >
                <Popup>
                  {isVerified ? (
                    <AttractionResultMediumVerifiedComponent atrakcja={attraction} />
                  ) : (
                    <AttractionResultMediumComponent atrakcja={attraction} />
                  )}
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </MapWrapper>
    </>
  );
};

export default AttractionsMap;
