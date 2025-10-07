import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

export const HotelStandardSelector = ({ standard, setStandard }) => {
  const [open, setOpen] = useState(false);
  const pickerRef = useRef(null);

  const hotelStandardMapping = {
    1: "Ośrodki kolonijne, hostele",
    2: "Hotele 2/3 gwiazdkowe",
    3: "Hotele premium"
  };

  // Zamykamy dropdown przy kliknięciu poza jego obszarem
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  // Funkcja do pobierania odpowiedniej ikony na podstawie standardu
  const getIconSrc = (std) => {
    if (std === 1) return "../icons/osrodek.svg";
    if (std === 2) return "../icons/icon-hotel.svg";
    return "../icons/hotel-building-svgrepo-com.svg";
  };

  return (
    <SelectorWrapper ref={pickerRef}>
      <SelectorButton onClick={() => setOpen(prev => !prev)}>
        Standard hotelu: {hotelStandardMapping[standard]}
      </SelectorButton>
      {open && (
        <Dropdown>
          {Object.keys(hotelStandardMapping).map(key => {
            const value = Number(key);
            return (
              <DropdownRow
                key={value}
                onClick={() => {
                  // Ustawiamy nowy standard w stanie nadrzędnym
                  setStandard(value);
                  setOpen(false);
                }}
              >
                <Icon src={getIconSrc(value)} alt="Ikona" />
                <Description>{hotelStandardMapping[value]}</Description>
              </DropdownRow>
            );
          })}
        </Dropdown>
      )}
    </SelectorWrapper>
  );
};

/* --- Styled Components --- */
const SelectorWrapper = styled.div`
  position: relative;
  width: auto;
  max-width: 200px;
`;

const SelectorButton = styled.button`
  width: auto;
  height: auto;
  background-color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 15px;
  text-align: left;
  font-size: 12px;
  font-weight: 300;
  color: #484848;
  cursor: pointer;
  transition: background-color 0.3s ease, border-color 0.3s ease;

  &:hover {
    background-color: #f7f7f7;
    border-color: #c0c0c0;
  }
`;

const Dropdown = styled.div`
  position: absolute;
  top: 60px;
  left: 0;
  width: 100%;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  z-index: 10;
`;

const DropdownRow = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 15px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #f7f7f7;
  }
`;

const Icon = styled.img`
  width: 30px;
  height: 30px;
  margin-right: 10px;
`;

const Description = styled.span`
  font-size: 12px;
  font-weight: 300;
  color: #255FF4;
`;

export default HotelStandardSelector;
