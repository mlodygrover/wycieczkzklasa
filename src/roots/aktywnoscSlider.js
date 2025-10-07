// AktwnoscSlider.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const SliderWrapper = styled.div`
  width: 100%;
  height: 90%; /* Fills parent's height */
  overflow: hidden;
  position: relative;
  border: 1px solid #ccc;
  border-radius: 15px;
  z-index: 3000;

`;

const SlidesContainer = styled.div`
  display: flex;
  width: ${props => props.slideCount * 100}%;
  transition: transform 0.5s ease-in-out;
  transform: translateX(${props => -props.activeSlide * (100 / props.slideCount)}%);
  height: 100%;
`;

const Slide = styled.div`
  flex: 0 0 ${props => 100 / props.slideCount}%;
  height: 100%;
 
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NavButtons = styled.div`
  margin-top: 10px;
  display: flex;
  justify-content: center;
`;

const NavButton = styled.button`
  background: ${props => (props.active ? '#555' : '#ccc')};
  border: none;
  padding: 0;
  width: 10px;
  height: 10px;
  margin: 0 5px;
  cursor: pointer;
  border-radius: 50%;
`;

export const AktwnoscSlider = ({
  imageUrl = "../miasta/poznan.jpg",
  coords = { lat: "52.4064", lng: "16.9252" },
  zoom = 13,
  lng,
  lat,
  link,
}) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const slides = [
    { type: 'image', content: imageUrl },
    { type: 'map', content: { lat: lat || coords.lat, lng: lng || coords.lng, zoom } }
  ];

  useEffect(() => {
    const intervalId = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(intervalId);
  }, [slides.length]);

  return (
    <div style={{ height: '100%' }}>
      <SliderWrapper>
        <SlidesContainer activeSlide={activeSlide} slideCount={slides.length}>
          {slides.map((slide, index) => (
            <Slide key={index} slideCount={slides.length}>
              {slide.type === 'image' ? (
                <img
                  src={link || slide.content}
                  alt="Slide"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center'
                  }}
                />
              ) : (
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  title="Map"
                  src={`https://www.google.com/maps?q=${slide.content.lat},${slide.content.lng}&z=${slide.content.zoom}&output=embed`}
                ></iframe>
              )}
            </Slide>
          ))}
        </SlidesContainer>
      </SliderWrapper>
      <NavButtons>
        {slides.map((_, index) => (
          <NavButton
            key={index}
            active={index === activeSlide}
            onClick={() => setActiveSlide(index)}
          />
        ))}
      </NavButtons>
    </div>
  );
};

export default AktwnoscSlider;
