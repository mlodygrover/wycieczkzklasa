import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

export const TransportSelector = ({ transport, setTransport }) => {
  const [open, setOpen] = useState(false);
  const pickerRef = useRef(null);

  // Obiekt mapujący standard na etykietę i ścieżkę do ikony
  const transportStandardMapping = {
    1: { label: "Wynajęty autokar", icon: "../icons/icon-private-bus.svg" },
    2: { label: "Transport zbiorowy", icon: "../icons/icon-public-trannsport.svg" },
    3: { label: "Własny", icon: "../icons/icon-own-transport.svg" }
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

  // Jeśli "transport" nie jest jeszcze ustawiony, możemy wyświetlić placeholder
  const currentTransport = transportStandardMapping[transport];
  const currentLabel = currentTransport ? currentTransport.label : "Nie wybrano";
  const currentIcon = currentTransport ? currentTransport.icon : "../icons/icon-transport.svg";

  return (
    <SelectorWrapper ref={pickerRef}>
      <SelectorButton onClick={() => setOpen(prev => !prev)}>
        {currentLabel}
        <InlineIcon src={currentIcon} alt="Ikona transportu" />
      </SelectorButton>
      {open && (
        <Dropdown>
          {Object.keys(transportStandardMapping).map(key => {
            const value = Number(key);
            return (
              <DropdownRow
                key={value}
                onClick={() => {
                  // Ustawiamy nową wartość w komponencie nadrzędnym
                  setTransport(value);
                  setOpen(false);
                }}
              >
                <Icon src={transportStandardMapping[value].icon} alt="Ikona" />
                <Description>{transportStandardMapping[value].label}</Description>
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
  width: 100%;
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
  display: flex;
  align-items: center;
  gap: 5px;
  transition: background-color 0.3s ease, border-color 0.3s ease;

  &:hover {
    background-color: #f7f7f7;
    border-color: #c0c0c0;
  }
`;

const InlineIcon = styled.img`
  width: 20px;
  height: 20px;
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
  min-width: 180px;
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

export default TransportSelector;
