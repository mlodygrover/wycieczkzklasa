import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

// --- Animacje ---
const spin = keyframes`
  100% { transform: rotate(360deg); }
`;

const blink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
`;

const cloudMove = keyframes`
  0% { transform: translateX(100vw); }
  100% { transform: translateX(-20vw); }
`;

// --- Style ---
const LoaderContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #f7f7f7; // Jasnoszare/białe tło a'la Chrome
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  overflow: hidden;
  font-family: 'Courier New', Courier, monospace; // Retro font
  color: #535353; // Szary kolor z Dinozaura
`;

const Cloud = styled.div`
  position: absolute;
  top: ${props => props.top || '20%'};
  width: 60px;
  height: 20px;
  background: #e0e0e0;
  border-radius: 10px;
  animation: ${cloudMove} ${props => props.duration || '15s'} linear infinite;
  animation-delay: ${props => props.delay || '0s'};
  z-index: 1;

  /* Tworzenie kształtu chmury za pomocą pseudoelementów */
  &::before, &::after {
    content: '';
    position: absolute;
    background: #e0e0e0;
    border-radius: 50%;
  }
  &::before { width: 30px; height: 30px; top: -15px; left: 10px; }
  &::after { width: 20px; height: 20px; top: -10px; right: 10px; }
`;

const TimerWrapper = styled.div`
  position: relative;
  width: 150px;
  height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 40px;
  z-index: 10;
`;

const RotatingRing = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 4px dashed #535353;
  border-radius: 50%;
  animation: ${spin} 8s linear infinite;
`;

const TimeDisplay = styled.div`
  font-size: 2rem;
  font-weight: bold;
  letter-spacing: 2px;
`;

const ContentBox = styled.div`
  text-align: center;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.2rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const StatusWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 1rem;
`;

const IconBox = styled.div`
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;

  svg {
    width: 100%;
    height: 100%;
    fill: #535353;
  }
`;

const BlinkingDot = styled.span`
  animation: ${blink} 1s step-end infinite;
`;

// --- Ikony SVG (Minimalistyczne, szare) ---
const icons = {
  suitcase: <svg viewBox="0 0 24 24"><path d="M19 6h-3V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H5c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-9-2h4v2h-4V4zm9 15H5V8h14v11z"/><path d="M9 10h2v7H9zm4 0h2v7h-2z"/></svg>,
  gas: <svg viewBox="0 0 24 24"><path d="M19.77 7.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11C16.17 7 15.5 7.93 15.5 9v11c0 .55.45 1 1 1s1-.45 1-1v-4.46L19.77 7.23zM12 4c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v14h8V4zM6 12V4h4v8H6z"/></svg>,
  map: <svg viewBox="0 0 24 24"><path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"/></svg>,
  rocket: <svg viewBox="0 0 24 24"><path d="M12 2C8.59 2 6 4.5 6 7.82V14l-2 3v2h16v-2l-2-3V7.82C18 4.5 15.41 2 12 2zm0 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zM9 22h6v-2H9v2z"/></svg>,
  hotel: <svg viewBox="0 0 24 24"><path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/></svg>,
  hourglass: <svg viewBox="0 0 24 24"><path d="M6 2v6h.01L6 8.01 10 12l-4 4 .01.01H6V22h12v-5.99h-.01L18 16l-4-4 4-3.99-.01-.01H18V2H6zm10 14.5V20H8v-3.5l4-4 4 4zm-4-5l-4-4V4h8v3.5l-4 4z"/></svg>
};

const steps = [
  { text: "Pakujemy walizki", icon: icons.suitcase },
  { text: "Tankujemy samolot", icon: icons.gas },
  { text: "Sprawdzamy mapy", icon: icons.map },
  { text: "Budzimy serwery", icon: icons.rocket },
  { text: "Szukamy noclegów", icon: icons.hotel },
  { text: "Już prawie gotowe", icon: icons.hourglass }
];

// ZMIEŃ TE URLe NA SWOJE Z RENDER.COM
const API_URL = process.env.REACT_APP_API_URL || "https://twoje-api.onrender.com"; 
const ACC_URL = process.env.REACT_APP_ACC_URL || "https://twoje-acc.onrender.com";

export const ServerWakeupLoader = ({ onReady }) => {
  const [timeLeft, setTimeLeft] = useState(60);
  const [stepIndex, setStepIndex] = useState(0);

  // Zmiana tekstu i ikonki co 10 sekund (żeby przeszło przez całą tablicę w ciągu minuty)
  useEffect(() => {
    const stepInterval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % steps.length);
    }, 10000);
    return () => clearInterval(stepInterval);
  }, []);

  // Odliczanie czasu
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Odpytywanie serwerów
  useEffect(() => {
    let isMounted = true;

    const checkServers = async () => {
      try {
        const [apiRes, accRes] = await Promise.all([
          fetch(`${API_URL}/wakeup`).catch(() => ({ ok: false })),
          fetch(`${ACC_URL}/wakeup`).catch(() => ({ ok: false }))
        ]);

        if (apiRes.ok && accRes.ok) {
          if (isMounted) onReady(); // Oba serwery odpowiedziały statusem 200
        }
      } catch (err) {
        // Ignorujemy błędy i próbujemy dalej
      }
    };

    checkServers(); // Pukamy od razu po wejściu
    const pingInterval = setInterval(checkServers, 3000); // Następnie co 3 sekundy

    return () => {
      isMounted = false;
      clearInterval(pingInterval);
    };
  }, [onReady]);

  // Formatowanie czasu np. "00:59"
  const formattedTime = `00:${timeLeft.toString().padStart(2, '0')}`;

  return (
    <LoaderContainer>
      {/* Szare chmurki a'la Dino w tle */}
      <Cloud top="15%" duration="25s" delay="0s" />
      <Cloud top="35%" duration="20s" delay="10s" />
      <Cloud top="65%" duration="30s" delay="5s" />
      
      <TimerWrapper>
        <RotatingRing />
        <TimeDisplay>{formattedTime}</TimeDisplay>
      </TimerWrapper>
      
      <ContentBox>
        <Title>Wybudzanie systemów</Title>
        <StatusWrapper>
          <IconBox>
            {steps[stepIndex].icon}
          </IconBox>
          <span>
            {timeLeft > 0 ? steps[stepIndex].text : "Jeszcze chwilka"}
            <BlinkingDot>_</BlinkingDot>
          </span>
        </StatusWrapper>
      </ContentBox>
    </LoaderContainer>
  );
};