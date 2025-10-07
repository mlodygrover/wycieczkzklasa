import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';

export const BookingGuestsPicker = ({ lGosci, setLGosci, lOpiekunow, setLOpiekunow }) => {
  const [open, setOpen] = useState(false);
  const pickerRef = useRef(null);

  // Zamykamy dropdown po kliknięciu poza jego obszarem
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

  return (
    <PickerWrapper ref={pickerRef}>
      <PickerButton onClick={() => setOpen(prev => !prev)}>
        Uczestników: {lGosci} / Opiekunów: {lOpiekunow}
      </PickerButton>
      {open && (
        <Dropdown>
          <DropdownRow>
            <Label>Goście</Label>
            <NumberInput>
              <Button onClick={() => setLGosci(prev => Math.max(prev - 1, 1))}>-</Button>
              <Value>{lGosci}</Value>
              <Button onClick={() => setLGosci(prev => prev + 1)}>+</Button>
            </NumberInput>
          </DropdownRow>
          <DropdownRow>
            <Label>Opiekunowie</Label>
            <NumberInput>
              <Button onClick={() => setLOpiekunow(prev => Math.max(prev - 1, 0))}>-</Button>
              <Value>{lOpiekunow}</Value>
              <Button onClick={() => setLOpiekunow(prev => prev + 1)}>+</Button>
            </NumberInput>
          </DropdownRow>
        </Dropdown>
      )}
    </PickerWrapper>
  );
};
export default BookingGuestsPicker;

/* --- Styled Components --- */
const PickerWrapper = styled.div`
  position: relative;
  width: auto;
`;

const PickerButton = styled.button`
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
  left: -30px;
  width: 100%;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  z-index: 10;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  padding: 10px;
`;

const DropdownRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.span`
  font-size: 14px;
  color: #484848;
`;

const NumberInput = styled.div`
  display: flex;
  align-items: center;
`;

const Button = styled.button`
  width: 30px;
  height: 30px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 50%;
  font-size: 18px;
  color: #484848;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 5px;
  transition: background-color 0.3s ease, border-color 0.3s ease;

  &:hover {
    background-color: #f7f7f7;
    border-color: #c0c0c0;
  }
`;

const Value = styled.span`
  font-size: 14px;
  color: #484848;
  min-width: 20px;
  text-align: center;
`;
