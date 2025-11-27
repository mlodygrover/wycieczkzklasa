import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Star } from 'lucide-react';
import styled from 'styled-components';

// Dane
const destinations = [
    { id: 1, name: 'Poznań', description: 'Historyczne centrum i tętniące życiem miasto', image: '../miasta/poznan-vert.jpg', rating: 4.8, trips: '234 wycieczki' },
    { id: 2, name: 'Gdańsk', description: 'Perła Bałtyku z bogatą historią', image: 'https://images.unsplash.com/photo-1568738687275-50e40a8f5062?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', rating: 4.9, trips: '312 wycieczki' },
    { id: 3, name: 'Kraków', description: 'Królewska stolica pełna zabytków', image: '../miasta/krakow-vert.jpg', rating: 4.9, trips: '456 wycieczki' },
    { id: 4, name: 'Warszawa', description: 'Nowoczesna metropolia z duszą', image: '../miasta/warszawa-vert.jpg', rating: 4.7, trips: '289 wycieczki' },
    { id: 5, name: 'Wrocław', description: 'Miasto mostów i krasnoludków', image: '../miasta/wroclaw-vert.jpg', rating: 4.8, trips: '198 wycieczki' },
    { id: 6, name: 'Zakopane', description: 'Zimowa stolica Polski u stóp Tatr', image: 'https://images.unsplash.com/photo-1462269943995-24c140e012b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', rating: 4.9, trips: '421 wycieczki' },
    { id: 7, name: 'Toruń', description: 'Gotyckie miasto piernika', image: '../miasta/torun-vert.jpg', rating: 4.6, trips: '156 wycieczki' },
    { id: 8, name: 'Sopot', description: 'Nadmorski kurort z najdłuższym molo', image: 'https://images.unsplash.com/photo-1688860823480-4eb71e879818?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', rating: 4.8, trips: '267 wycieczki' }
];
export const ComponentHeader = styled.div`
    text-align: center;
    margin-bottom: 10px;

    .destinationSlider-badge {
      width: 220px; align-items: center; gap: 0.5rem;
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border: 1px solid #bbf7d0; color: #047857; font-size: 14px; font-weight: 600;
      height: 30px; display: flex; align-items: center; justify-content: center; border-radius: 10px;
    }
    .destinationSlider-badge svg { width: 16px; height: 16px; }

    .destinationSlider-title {
      font-size: 3.5rem; font-weight: 800; color: #0a0a0a; margin-bottom: 1px; letter-spacing: -0.02em;
      text-align: left; margin-top: 0;
    }
    @media (max-width: 768px) { .destinationSlider-title { font-size: 2.25rem; } }

    .destinationSlider-subtitle { font-size: 1.25rem; color: #6b7280; margin: 0 auto; text-align: left; }

   
`
// Komponent <style> do wstrzyknięcia CSS
const GlobalStyles = () => (
    <style>{`
    .destinationSlider-section {
      width: 90%;
      max-width: 1600px;
      background: #ffffff;
      position: relative;
      margin-top: 50px;
    }
       .destinationSlider-slider-area {
      position: relative; width: 100%; height: 500px; background: #333; overflow: hidden; border-radius: 30px; margin-right: auto;
    }
    .destinationSlider-container { width: 100%; margin: 0 auto; }

  

    .destinationSlider-slider-content-clipper {
      position: relative; width: 100%; height: 100%; border-radius: 1.5rem; overflow: hidden;
    }

    .destinationSlider-slider-background {
      position: absolute; inset: 0; background-size: cover; background-position: center; transition: background-image 0.5s ease-in-out; z-index: 1;
    }

    .destinationSlider-slider-wrapper {
      position: relative; z-index: 2; width: 100%; height: 100%; margin: 0 auto; display: flex; align-items: center;
    }

    .destinationSlider-slider-container {
      overflow: hidden; position: relative; width: 100%;
      /* kluczowe dla mobilnego przewijania: przechwytujemy przesunięcia poziome */
      touch-action: pan-y;
      user-select: none;
    }

    .destinationSlider-slider-track {
      display: flex; gap: 1.5rem; transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: grab;
    }
    .destinationSlider-slider-track.dragging {
      transition: none;
      cursor: grabbing;
    }

    .destinationSlider-slide-card {
      min-width: 300px; 
      width: 300px; 
      height: 300px; 
      position: relative; 
      border-radius: 1.5rem; 
      overflow: hidden; 
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); 
      opacity: 0.4; 
      transform: scale(0.9);
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 50%, rgba(255, 255, 255, 0.12) 100%);
      backdrop-filter: blur(20px) saturate(180%); 
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border: 2px solid rgba(255, 255, 255, 0.25);
       z-index: 3;
    }

    .destinationSlider-slide-card-active { opacity: 1; transform: scale(1); }

    @media (max-width: 768px) { .destinationSlider-slide-card { min-width: 250px; width: 250px; height: 250px; } }
    @media (max-width: 480px) { .destinationSlider-slide-card { min-width: 220px; width: 220px; height: 220px; } }

    .destinationSlider-slide-card:hover {
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(15px) saturate(200%); -webkit-backdrop-filter: blur(15px) saturate(200%);
    }

    .destinationSlider-card-content {
      position: absolute; bottom: 0; left: 0; right: 0; padding: 1.5rem; z-index: 4; color: white; text-shadow: 0 2px 4px rgba(0,0,0,0.5);
    }

    .destinationSlider-city-name { font-size: 1.75rem; font-weight: 700; margin-bottom: 0.5rem; }
    @media (max-width: 768px) { .destinationSlider-city-name { font-size: 1.5rem; } }

    .destinationSlider-city-description { font-size: 0.9375rem; opacity: 0.95; margin-bottom: 1rem; line-height: 1.4; }
    @media (max-width: 768px) { .destinationSlider-city-description { font-size: 0.875rem; } }

    .destinationSlider-card-footer { display: flex; align-items: center; justify-content: space-between; font-size: 0.875rem; opacity: 0.9; }

    .destinationSlider-rating { display: flex; align-items: center; gap: 0.25rem; }
    .destinationSlider-rating svg { width: 14px; height: 14px; fill: #fbbf24; color: #fbbf24; }

    .destinationSlider-trips { font-size: 0.8125rem; }

    .destinationSlider-navigation-container {
      position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%);
      display: flex; align-items: center; gap: 1rem; z-index: 10; width: 250px; justify-content: space-between;
    }

    .destinationSlider-nav-button {
        width: 3rem; height: 3rem; border-radius: 9999px; background: rgba(141, 141, 141, 0.13);
        backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.2); display: flex; align-items: center; justify-content: center;
        cursor: pointer; transition: background 0.2s ease;
    }
    .destinationSlider-nav-button:hover { background: rgba(255, 255, 255, 0.2); }
    .destinationSlider-nav-button svg { width: 1.5rem; height: 1.5rem; color: white; }
    
    .destinationSlider-nav-button:disabled { opacity: 0.5; cursor: not-allowed; }
    .destinationSlider-nav-button:disabled:hover { background: rgba(255, 255, 255, 0.95); transform: scale(1); border-color: rgba(0, 0, 0, 0.08); }
    .destinationSlider-nav-button:disabled:hover svg { color: #0a0a0a; }
  `}
    </style>
);

export default function DestinationsSlider() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [translateX, setTranslateX] = useState(0);

    // Stany dla drag/swipe
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartX, setDragStartX] = useState(0);
    const [dragDelta, setDragDelta] = useState(0);

    const containerRef = useRef(null);
    const slideRef = useRef(null);

    const currentDestination = destinations[currentIndex];

    // Obliczanie pozycji aktywnej karty
    useEffect(() => {
        const calculateTranslate = () => {
            if (containerRef.current && slideRef.current) {
                const containerWidth = containerRef.current.offsetWidth;
                const slideStyle = window.getComputedStyle(slideRef.current);
                const cardWidth = slideRef.current.offsetWidth;
                const gap =
                    parseFloat(slideStyle.marginRight) ||
                    parseFloat(window.getComputedStyle(slideRef.current.parentElement).gap) ||
                    24;

                const totalCardWidth = cardWidth + gap;
                const offset = containerWidth / 2 - cardWidth / 2;
                setTranslateX(offset - currentIndex * totalCardWidth);
            }
        };

        calculateTranslate();
        window.addEventListener('resize', calculateTranslate);
        return () => window.removeEventListener('resize', calculateTranslate);
    }, [currentIndex]);

    const goToNext = () => {
        if (currentIndex < destinations.length - 1) setCurrentIndex((i) => i + 1);
    };

    const goToPrev = () => {
        if (currentIndex > 0) setCurrentIndex((i) => i - 1);
    };

    // Obsługa drag/swipe
    const SWIPE_THRESHOLD = 60; // minimalny dystans (px) do zmiany slajdu

    const startDrag = (clientX) => {
        setIsDragging(true);
        setDragStartX(clientX);
        setDragDelta(0);
    };

    const onMove = (clientX) => {
        if (!isDragging) return;
        setDragDelta(clientX - dragStartX);
    };

    const endDrag = () => {
        if (!isDragging) return;

        if (Math.abs(dragDelta) > SWIPE_THRESHOLD) {
            if (dragDelta < 0 && currentIndex < destinations.length - 1) {
                setCurrentIndex((i) => i + 1);
            } else if (dragDelta > 0 && currentIndex > 0) {
                setCurrentIndex((i) => i - 1);
            }
        }

        setIsDragging(false);
        setDragDelta(0);
    };

    // Globalne nasłuchiwacze dla myszy w trakcie przeciągania
    useEffect(() => {
        const onMouseMove = (e) => onMove(e.clientX);
        const onMouseUp = () => endDrag();

        if (isDragging) {
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [isDragging, dragStartX, dragDelta, currentIndex]);

    return (
        <section className="destinationSlider-section">
            <GlobalStyles />
            <div className="destinationSlider-container">
                <ComponentHeader>
                    <div className="destinationSlider-badge">
                        <MapPin />
                        Popularne destynacje
                    </div>
                    <h2 className="destinationSlider-title">Dokąd chcesz pojechać?</h2>
                    <p className="destinationSlider-subtitle">
                        Odkryj najpiękniejsze miejsca w Polsce i zarezerwuj swoją wymarzoną podróż
                    </p>
                </ComponentHeader>

                <div className="destinationSlider-slider-area">
                    <div className="destinationSlider-slider-content-clipper">
                        <div
                            className="destinationSlider-slider-background"
                            style={{ backgroundImage: `url(${currentDestination?.image || destinations[0].image})` }}
                        />

                        <div className="destinationSlider-slider-wrapper">
                            <div
                                className="destinationSlider-slider-container"
                                ref={containerRef}
                                // Dotyk
                                onTouchStart={(e) => startDrag(e.touches[0].clientX)}
                                onTouchMove={(e) => onMove(e.touches[0].clientX)}
                                onTouchEnd={endDrag}
                                onTouchCancel={endDrag}
                                // Mysz
                                onMouseDown={(e) => startDrag(e.clientX)}
                                onMouseLeave={() => isDragging && endDrag()}
                            >
                                <div
                                    className={`destinationSlider-slider-track ${isDragging ? 'dragging' : ''}`}
                                    style={{ transform: `translateX(${translateX + (isDragging ? dragDelta : 0)}px)` }}
                                >
                                    {destinations.map((destination, index) => (
                                        <div
                                            className={`destinationSlider-slide-card ${index === currentIndex ? 'destinationSlider-slide-card-active' : ''}`}
                                            key={destination.id}
                                            ref={index === 0 ? slideRef : null}
                                            onClick={() => {
                                                // Jeżeli był drag, klik nie powinien przełączać
                                                if (Math.abs(dragDelta) < 5) setCurrentIndex(index);
                                            }}
                                        >
                                            <div className="destinationSlider-card-content">
                                                <h3 className="destinationSlider-city-name">{destination.name}</h3>
                                                <p className="destinationSlider-city-description">{destination.description}</p>
                                                <div className="destinationSlider-card-footer">
                                                    <div className="destinationSlider-rating">
                                                        <Star />
                                                        <span>{destination.rating}</span>
                                                    </div>
                                                    <div className="destinationSlider-trips">{destination.trips}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="destinationSlider-navigation-container">
                        <button
                            className="destinationSlider-nav-button"
                            onClick={goToPrev}
                            disabled={currentIndex === 0}
                        >
                            <ChevronLeft />
                        </button>
                        <button
                            className="destinationSlider-nav-button"
                            onClick={goToNext}
                            disabled={currentIndex === destinations.length - 1}
                        >
                            <ChevronRight />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
