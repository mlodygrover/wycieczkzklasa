import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Star } from 'lucide-react';

// Dane
const destinations = [
    {
        id: 1,
        name: 'Poznań',
        description: 'Historyczne centrum i tętniące życiem miasto',
        image: 'https://images.unsplash.com/photo-1663519521801-6d93f3eb9f26?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        rating: 4.8,
        trips: '234 wycieczki'
    },
    {
        id: 2,
        name: 'Gdańsk',
        description: 'Perła Bałtyku z bogatą historią',
        image: 'https://images.unsplash.com/photo-1568738687275-50e40a8f5062?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        rating: 4.9,
        trips: '312 wycieczki'
    },
    {
        id: 3,
        name: 'Kraków',
        description: 'Królewska stolica pełna zabytków',
        image: 'https://images.unsplash.com/photo-1696272755845-568f4c552eae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        rating: 4.9,
        trips: '456 wycieczki'
    },
    {
        id: 4,
        name: 'Warszawa',
        description: 'Nowoczesna metropolia z duszą',
        image: 'https://images.unsplash.com/photo-1702978696164-10820b0b4cea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        rating: 4.7,
        trips: '289 wycieczki'
    },
    {
        id: 5,
        name: 'Wrocław',
        description: 'Miasto mostów i krasnoludków',
        image: 'https://images.unsplash.com/photo-1740329624203-842b96523832?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        rating: 4.8,
        trips: '198 wycieczki'
    },
    {
        id: 6,
        name: 'Zakopane',
        description: 'Zimowa stolica Polski u stóp Tatr',
        image: 'https://images.unsplash.com/photo-1462269943995-24c140e012b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        rating: 4.9,
        trips: '421 wycieczki'
    },
    {
        id: 7,
        name: 'Toruń',
        description: 'Gotyckie miasto piernika',
        image: 'https://images.unsplash.com/photo-1715945923967-eabbca3663dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        rating: 4.6,
        trips: '156 wycieczki'
    },
    {
        id: 8,
        name: 'Sopot',
        description: 'Nadmorski kurort z najdłuższym molo',
        image: 'https://images.unsplash.com/photo-1688860823480-4eb71e879818?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        rating: 4.8,
        trips: '267 wycieczki'
    }
];

// Komponent <style> do wstrzyknięcia CSS
const GlobalStyles = () => (
    <style>{`
    .section {
      box-sizing: border-box;
      width: 90%;
      min-height: 100vh;
      background: linear-gradient(180deg, #f9fafb 0%, #ffffff 100%);
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
    }

    .container {
      max-width: 1600px;
      width: 100%;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
    }

    .header {
      text-align: center;
      margin-bottom: 4rem;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1.25rem;
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border: 1px solid #bbf7d0;
      border-radius: 2rem;
      color: #047857;
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
    }
    
    .badge svg {
      width: 16px;
      height: 16px;
    }

    .title {
      font-size: 3.5rem;
      font-weight: 800;
      color: #0a0a0a;
      margin-bottom: 1rem;
      letter-spacing: -0.02em;
    }
    
    @media (max-width: 768px) {
      .title {
        font-size: 2.25rem;
      }
    }

    .subtitle {
      font-size: 1.25rem;
      color: #6b7280;
      max-width: 700px;
      margin: 0 auto;
    }
    
    .slider-area {
      position: relative;
      width: 100%;
      height: 500px;
      background: #333;
      overflow: hidden;
      border-radius: 30px;
      margin-right: auto;
     
    }
    
    .slider-content-clipper {
      position: relative;
      width: 100%;
      height: 100%;
      border-radius: 1.5rem;
      overflow: hidden;
    }
    
    .slider-background {
      position: absolute;
      inset: 0;
      background-size: cover;
      background-position: center;
      transition: background-image 0.5s ease-in-out;
      z-index: 1;

    }
    
    .slider-wrapper {
      position: relative;
      z-index: 2;
      width: 100%;
      height: 100%;
      margin: 0 auto;
      display: flex;
      align-items: center;

    }

    .slider-container {
      overflow: hidden;
      position: relative;
      width: 100%;
    }

    .slider-track {
      display: flex;
      gap: 1.5rem;
      transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .slide-card {
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
      background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.15) 0%,
        rgba(255, 255, 255, 0.08) 50%,
        rgba(255, 255, 255, 0.12) 100%
      );
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      
      border: 2px solid rgba(255, 255, 255, 0.25);
      z-index: 3;
    }
    
    .slide-card-active {
      opacity: 1;
      transform: scale(1);
    }
    
    @media (max-width: 768px) {
      .slide-card {
        min-width: 250px;
        width: 250px;
        height: 250px;
      }
    }
    
    @media (max-width: 480px) {
      .slide-card {
        min-width: 220px;
        width: 220px;
        height: 220px;
      }
    }
    
    .slide-card:hover {
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(15px) saturate(200%);
      -webkit-backdrop-filter: blur(15px) saturate(200%);
    }

    .card-content {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 1.5rem;
      z-index: 4;
      color: white;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    }

    .city-name {
      font-size: 1.75rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }
    
    @media (max-width: 768px) {
      .city-name {
        font-size: 1.5rem;
      }
    }

    .city-description {
      font-size: 0.9375rem;
      opacity: 0.95;
      margin-bottom: 1rem;
      line-height: 1.4;
    }
    
    @media (max-width: 768px) {
      .city-description {
        font-size: 0.875rem;
      }
    }

    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.875rem;
      opacity: 0.9;
    }

    .rating {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    
    .rating svg {
      width: 14px;
      height: 14px;
      fill: #fbbf24;
      color: #fbbf24;
    }

    .trips {
      font-size: 0.8125rem;
    }

    .navigation-container {
      position: absolute;
      bottom: 10px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 1rem;
      z-index: 10;
      width: 250px;
      justify-content: space-between;
    }

    .nav-button {
        width: 3rem;
        height: 3rem;
        border-radius: 9999px;
        background: rgba(141, 141, 141, 0.13);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background 0.2s ease;

        &:hover {
            background: rgba(255, 255, 255, 0.2);
        }

        svg {
            width: 1.5rem;
            height: 1.5rem;
            color: white;
        }
    }

    
    .nav-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .nav-button:disabled:hover {
      background: rgba(255, 255, 255, 0.95);
      transform: scale(1);
      border-color: rgba(0, 0, 0, 0.08);
    }
    
    .nav-button:disabled:hover svg {
      color: #0a0a0a;
    }
  `}
    </style>
);

export default function DestinationsSlider() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [translateX, setTranslateX] = useState(0);
    const containerRef = useRef(null);
    const slideRef = useRef(null);

    const currentDestination = destinations[currentIndex];

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
        if (currentIndex < destinations.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const goToPrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    return (
        <section className="section">
            <GlobalStyles />
            <div className="container">
                <div className="header">
                    <div className="badge">
                        <MapPin />
                        Popularne destynacje
                    </div>
                    <h2 className="title">Dokąd chcesz pojechać?</h2>
                    <p className="subtitle">
                        Odkryj najpiękniejsze miejsca w Polsce i zarezerwuj swoją wymarzoną podróż
                    </p>
                </div>

                <div className="slider-area">
                    <div className="slider-content-clipper">
                        <div
                            className="slider-background"
                            style={{ backgroundImage: `url(${currentDestination?.image || destinations[0].image})` }}
                        />

                        <div className="slider-wrapper">
                            <div className="slider-container" ref={containerRef}>
                                <div className="slider-track" style={{ transform: `translateX(${translateX}px)` }}>
                                    {destinations.map((destination, index) => (
                                        <div
                                            className={`slide-card ${index === currentIndex ? 'slide-card-active' : ''}`}
                                            key={destination.id}
                                            ref={index === 0 ? slideRef : null}
                                            onClick={() => setCurrentIndex(index)}
                                        >
                                            <div className="card-content">
                                                <h3 className="city-name">{destination.name}</h3>
                                                <p className="city-description">{destination.description}</p>
                                                <div className="card-footer">
                                                    <div className="rating">
                                                        <Star />
                                                        <span>{destination.rating}</span>
                                                    </div>
                                                    <div className="trips">{destination.trips}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div> {/* ← TU dodaliśmy brakujący zamykający DIV dla slider-content-clipper */}

                    <div className="navigation-container">
                        <button
                            className="nav-button"
                            onClick={goToPrev}
                            disabled={currentIndex === 0}
                        >
                            <ChevronLeft />
                        </button>
                        <button
                            className="nav-button"
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
