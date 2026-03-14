import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

// --- Ścieżki do Twoich zrzutów ekranu ---
// ZAIMPORTUJ SWOJE ZDJĘCIA TUTAJ:
// import slide1 from '../assets/slide1.jpg';
// import slide2 from '../assets/slide2.jpg';
// import slide3 from '../assets/slide3.jpg';

// Na potrzeby kodu używam tu zmiennych, podmień je na swoje importy wyżej
const slide3 = "./loader3.png"; // ZDJĘCIE 1: Odkrywaj
const slide2 = "./loader2.png"; // ZDJĘCIE 2: Informacje i AI
const slide1 = "./loader1.png"; // ZDJĘCIE 3: Plan dnia

const port = process.env.REACT_APP__SERVER_API_SOURCE || "https://wycieczkzklasa.onrender.com";
const portacc = process.env.REACT_APP_API_SOURCE || "https://api.draftngo.com";

// --- Animacje ---
const spin = keyframes`
  100% { transform: rotate(360deg); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- Style ---
const LoaderContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #f8fafc; // Delikatne, jasne tło
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  font-family: 'Poppins', sans-serif;
  color: #1e293b;
`;

// --- Timer w rogu ---
const TimerContainer = styled.div`
  position: absolute;
  top: 30px;
  right: 40px;
  display: flex;
  align-items: center;
  gap: 15px;
  background: white;
  padding: 10px 20px;
  border-radius: 50px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  z-index: 20;
`;

const Spinner = styled.div`
  width: 20px;
  height: 20px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #0ea5e9; // Kolor wiodący (niebieski)
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const TimeText = styled.div`
  font-weight: 600;
  font-size: 1.1rem;
  font-variant-numeric: tabular-nums;
  color: #334155;
`;

// --- Slider ---
const SliderWrapper = styled.div`
  width: 90%;
  max-width: 1000px;
  height: 70vh;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Slide = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: ${props => (props.$active ? 1 : 0)};
  visibility: ${props => (props.$active ? 'visible' : 'hidden')};
  transition: opacity 0.8s ease-in-out, visibility 0.8s ease-in-out;
`;

const ImageContainer = styled.div`
  width: 100%;
  flex-grow: 1;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  margin-bottom: 30px;
  background-color: white;
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top;
  }
`;

const TextContainer = styled.div`
  text-align: center;
  max-width: 600px;
  animation: ${props => (props.$active ? fadeIn : 'none')} 0.8s ease-out;
`;

const Title = styled.h2`
  font-size: 1.8rem;
  margin: 0 0 10px 0;
  color: #0f172a;
`;

const Description = styled.p`
  font-size: 1.1rem;
  color: #64748b;
  margin: 0;
  line-height: 1.6;
`;

// --- Kropki nawigacyjne ---
const DotsContainer = styled.div`
  position: absolute;
  bottom: -40px;
  display: flex;
  gap: 10px;
`;

const Dot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${props => (props.$active ? '#0ea5e9' : '#cbd5e1')};
  transition: background-color 0.3s ease;
`;

// --- Dane Slajdów ---
const slidesData = [
  {
    title: "Odkrywaj i inspiruj się",
    desc: "Przeglądaj gotowe szablony i inspiruj się wyjazdami stworzonymi przez ekspertów. Wybierz kierunek i rozpocznij planowanie idealnej wycieczki.",
    image: slide1
  },
  {
    title: "Zarządzaj wyjazdem z Asystentem AI",
    desc: "Wszystkie informacje, uczestnicy i finanse w jednym miejscu. Nasz inteligentny Asystent AI wspiera Cię na każdym kroku podczas projektowania.",
    image: slide2
  },
  {
    title: "Konfiguruj szczegółowy plan dnia",
    desc: "Układaj harmonogram metodą przeciągnij i upuść. Dodawaj atrakcje z wbudowanej biblioteki, a system sam obliczy czas przejazdów i koszty.",
    image: slide3
  }
];

export const ServerWakeupLoader = ({ onReady }) => {
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Zmiana slajdów co 6 sekund
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slidesData.length);
    }, 6000);
    return () => clearInterval(slideInterval);
  }, []);

  // Odliczanie czasu (nie blokujemy na 0, niech wisi na 00:00 w razie W)
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
          fetch(`${port}/wakeup`).catch(() => ({ ok: false })),
          fetch(`${portacc}/wakeup`).catch(() => ({ ok: false }))
        ]);

        if (apiRes.ok && accRes.ok) {
          if (isMounted) onReady(); 
        }
      } catch (err) {
        // Ignorujemy błędy fetch
      }
    };

    checkServers(); 
    const pingInterval = setInterval(checkServers, 3000); 

    return () => {
      isMounted = false;
      clearInterval(pingInterval);
    };
  }, [onReady]);

  const formattedTime = `00:${timeLeft.toString().padStart(2, '0')}`;

  return (
    <LoaderContainer>
      
      {/* Licznik czasu w prawym górnym rogu */}
      <TimerContainer>
        <Spinner />
        <TimeText>Wybudzanie systemów... {formattedTime}</TimeText>
      </TimerContainer>

      {/* Slider prezentujący funkcjonalności */}
      <SliderWrapper>
        {slidesData.map((slide, index) => (
          <Slide key={index} $active={currentSlide === index}>
            <ImageContainer>
              <img src={slide.image} alt={`Funkcjonalność: ${slide.title}`} />
            </ImageContainer>
            <TextContainer $active={currentSlide === index}>
              <Title>{slide.title}</Title>
              <Description>{slide.desc}</Description>
            </TextContainer>
          </Slide>
        ))}

        {/* Kropki na dole */}
        <DotsContainer>
          {slidesData.map((_, index) => (
            <Dot key={index} $active={currentSlide === index} />
          ))}
        </DotsContainer>
      </SliderWrapper>

    </LoaderContainer>
  );
};