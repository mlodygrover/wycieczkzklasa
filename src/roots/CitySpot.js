
import React, { useState, useEffect, useMemo } from 'react';
import styled, {keyframes} from 'styled-components';

// Funkcja generująca animację zoomowania z losowym przesunięciem
const zoomShiftAnimation = (shiftX, shiftY) => keyframes`
  from {
    transform: scale(1) translate(0, 0);
  }
  to {
    transform: scale(1.1) translate(${shiftX}px, ${shiftY}px);
  }
`;

// Komponent stylizowany, który używa animacji przekazanej przez propsy
const ZoomImg = styled.img`
  height: 100%;
  width: 100%;
  object-fit: cover;
  z-index: 1;
  animation: ${({ shiftX, shiftY }) => zoomShiftAnimation(shiftX, shiftY)} 3s forwards;
`;

const Przewijanie = ({images}) => {
  const imagess = [
    "poznan1.jpeg",
    "poznan2.jpg",
    "poznan3.jpg"
  ];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Co 3 sekundy zmieniamy indeks obrazu
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(prevIndex => (prevIndex + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [images.length]);

  // Losujemy przesunięcie X i Y tylko przy zmianie obrazu
  const shiftX = useMemo(() => Math.floor(Math.random() * 21) - 10, [currentImageIndex]); // zakres -10px do 10px
  const shiftY = useMemo(() => Math.floor(Math.random() * 21) - 10, [currentImageIndex]);

  return (
    <ZoomImg 
      key={currentImageIndex} // Zmiana klucza powoduje ponowne zamontowanie komponentu i restart animacji
      src={images[currentImageIndex]} 
      alt="Poznań" 
      shiftX={shiftX}
      shiftY={shiftY}
    />
  );
};
export const CitySpot = ({ zdj, tyt = "Błąd", opis = "Błąd" }) => {
  const [isHovered, setIsHovered] = useState(false);

  const images = [
    zdj + "1.jpg",
    zdj + "2.jpg",
    zdj + "3.jpg",
  ];
  const defaultImage = zdj + ".jpg";

  return (
    <StyledCitySpot>
      <div
        className="CitySpot-mainbox"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="CitySpot-pic">
          {/* Domyślny obrazek */}
          <img
            className={`default-image ${isHovered ? "fade-out" : "fade-in"}`}
            src={defaultImage}
            alt="Poznań"
          />

          {/* Obrazek przewijany (z zoomowaniem), ukryty gdy nie jest hover */}
          <div className={`hovered-image ${isHovered ? "fade-in" : "fade-out"}`}>
            <Przewijanie images={images} />
          </div>
        </div>
        <div className="CitySpot-text">
          <div className="CitySpot-text-title">{tyt}</div>
          <div className="CitySpot-text-desc">{opis}</div>
        </div>
      </div>
    </StyledCitySpot>
  );
};




const StyledCitySpot = styled.div`
img {
  filter: saturate(1.2);
}
  .CitySpot-mainbox {
    width: 250px;
    height: 250px;
    border-radius: 20px;
    border: 0.1px solid rgb(237, 237, 237);
    padding: 10px;
    background-color: rgb(241, 241, 241);
    cursor: pointer;
  }

  .CitySpot-pic {
    position: relative;
    width: 200px;
    height: 200px;
    margin: auto;
    z-index: 1;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    overflow: hidden;
  }

  /* Oba elementy będą pozycjonowane absolutnie, by na siebie nachodziły */
  .default-image,
  .hovered-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transition: opacity 0.5s ease-in-out;
  }

  /* Klasy kontrolujące widoczność */
  .fade-in {
    opacity: 1;
    pointer-events: auto;
  }
  .fade-out {
    opacity: 0;
    pointer-events: none;
  }

  .CitySpot-text {
    position: relative;
    background-color: rgba(0, 0, 0, 0.649);
    width: 100%;
    height: 100px;
    margin-top: -50px;
    font-size: 15px;
    color: rgb(255, 251, 232);
    z-index: 10;
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
  }

  .CitySpot-text-title {
    min-width: 70%;
    text-align: center;
    font-size: 22px;
    font-weight: 600;
  }
  .CitySpot-text-desc {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    line-height: 1.4em;
    max-height: calc(1.4em * 3);
  }

  @media screen and (max-width: 800px) {
    .CitySpot-mainbox {
      width: 175px;
      height: 175px;
      border-radius: 0;
      border: none;
      background-color: rgb(239, 239, 239);
      overflow: hidden;
    }
    .CitySpot-pic {
      width: 140px;
      height: 140px;
    }
    .CitySpot-text-desc {
      line-height: 1em;
    }
    .CitySpot-text-title {
      font-size: 18px;
      font-weight: 500;
    }
    .CitySpot-text {
      margin-top: -35px;
    }
  }
`;



export const ArrowButton = ({onclick, a=false}) => {
    return (
      (a ? 
      <StyledWrapper>
        <button className="button" onClick={onclick}>
          <svg className="svgIcon" viewBox="0 0 384 512">
            <path d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z" />
          </svg>
        </button>
      </StyledWrapper>:
      <StyledWrapper>
      <button className="button l" onClick={onclick}>
        <svg className="svgIcon" viewBox="0 0 384 512">
          <path d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z" />
        </svg>
      </button>
    </StyledWrapper>
      
      )
    );
  }
  
  const StyledWrapper = styled.div`
    .button {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: rgb(20, 20, 20);
    border: none;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0px 0px 0px 4px rgba(255, 160, 160, 0.253);
    cursor: pointer;
    transition-duration: 0.3s;
    overflow: hidden;
    position: relative;
    transform: rotate(90deg)
  }
    .button.l
    {
    transform: rotate(-90deg);
    }

    .svgIcon {
      width: 12px;
      transition-duration: 0.3s;
    }
  
    .svgIcon path {
      fill: white;
    }
  
    .button:hover {
     
      transition-duration: 0.3s;
      background-color: #F42582;
      align-items: center;
    }
  
   
  
    
  
   `;
  

  