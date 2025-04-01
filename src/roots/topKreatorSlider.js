import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import BookingDatePicker from './wybordaty';
import BookingGuestsPicker from './uczestnicyWybor';
import HotelStandardSelector from './hotelandtransport';
import TransportSelector from './transportWybor.js';
const images = [
    '/miasta/poznan.jpg',
    '/miasta/poznan2.jpg',
    '/miasta/poznan3.jpg'
];

export const TopKreatorSlider = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [transformStyle, setTransformStyle] = useState('scale(1) translate(0, 0)');
    const [paused, setPaused] = useState(false);
    const intervalRef = useRef(null);

    // Ustawienie interwału – co 5 sekund zmieniamy zdjęcie i transformację
    useEffect(() => {
        if (!paused) {
            intervalRef.current = setInterval(() => {
                setCurrentImageIndex(prevIndex => (prevIndex + 1) % images.length);
                // Losowe przesunięcie w zakresie -20 do 20 pikseli
                const randomX = Math.floor(Math.random() * 41) - 20;
                const randomY = Math.floor(Math.random() * 41) - 20;
                // Ustaw transformację – delikatne przybliżenie oraz przesunięcie
                setTransformStyle(`scale(1.1) translate(${randomX}px, ${randomY}px)`);
            }, 5000);
        }
        return () => clearInterval(intervalRef.current);
    }, [paused]);

    const handlePauseClick = () => {
        setPaused(prev => !prev);
    };
    useEffect(()=>{
      console.log("test5")
    }, [])
    return (
        <>
            <SliderContainer>
                <BackgroundImage bgImage={images[currentImageIndex]} />
                <CentralImage>
                    <CentralImageInner
                        bgImage={images[currentImageIndex]}
                        transformStyle={paused ? 'none' : transformStyle}
                    />
                </CentralImage>
                <PauseButton onClick={handlePauseClick}>
                    {paused ? <img src="../icons/restart-svgrepo-com.svg" /> : <img src="../icons/pause-svgrepo-com.svg" />}
                </PauseButton>
            </SliderContainer>
            
        </>
    );
};

const SliderContainer = styled.div`
  position: relative;
  width: 100%;
  height: 340px;
  overflow: hidden;
  margin-top: 20px;
`;

// Tło – pełna szerokość, rozmyte
const BackgroundImage = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: ${props => `url(${props.bgImage})`};
  background-size: cover;
  background-position: center;
  filter: blur(10px);
  transform: scale(1.1);
  z-index: 1;
  background-color: gray;
`;

// Kontener centralnego obrazu – statyczny, maksymalna szerokość 700px
const CentralImage = styled.div`
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 700px;
  height: 110%;
  margin: auto auto;
  overflow: hidden;
  border-left: 20px solid white;
  border-right: 20px solid white;
  
`;

// Wewnętrzny element prezentujący obraz, który podlega animacji transformacji
// Ustawienie position: absolute wraz z transform-origin: center center powoduje, że transformacja odbywa się względem środka kontenera.
const CentralImageInner = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: ${props => `url(${props.bgImage})`};
  background-size: cover;
  background-position: center;
  transition: transform 5s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center center;
  transform: ${props => props.transformStyle || 'scale(1) translate(0, 0)'};
  filter: brightness(0.8) saturate(1.2);
  
`;

// Przycisk pauzy
const PauseButton = styled.button`
  position: absolute;
  top: 20px;
  left: 20px;
  width: 50px;
  height: 50px;
  border-radius: 25px;
  background-color: #212121ae;
  color: white;
  border: none;
  cursor: pointer;
  z-index: 3;
  transition: background-color 0.3s ease-in-out;
  &:hover{
  background-color: #212121;
  
  }
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }
`;


export default TopKreatorSlider;
