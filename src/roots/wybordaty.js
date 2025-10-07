import React, { useState, useRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styled from 'styled-components';
import pl from 'date-fns/locale/pl';

function parseDate(value) {
  if (!value) return null; // Jeśli puste, zwróć null
  const d = new Date(value);
  // Jeżeli value = "2025-04-15", new Date("2025-04-15") zadziała i zwróci obiekt Date
  if (isNaN(d.getTime())) {
    // Na wypadek, gdyby data była w niezrozumiałym formacie
    return null;
  }
  return d;
}

export const BookingDatePicker = ({ dataPrzyjazdu= null, dataWyjazdu = null, setDataPrzyjazdu, setDataWyjazdu }) => {
  const parsedStart = parseDate(dataPrzyjazdu);
  const parsedEnd = parseDate(dataWyjazdu);

  // Stan wewnętrzny (lub bezpośrednio ustawiasz w useState)
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [open, setOpen] = useState(false);
  const pickerRef = useRef(null);
  useEffect(() => {
    if (startDate) setDataPrzyjazdu(startDate.toISOString().split('T')[0]);
  }, [startDate]);

  useEffect(() => {
    if (endDate) setDataWyjazdu(endDate.toISOString().split('T')[0]);
  }, [endDate]);
  const handleSelect = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  // Nasłuchujemy kliknięcia poza kontenerem kalendarza
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
      <DateButton onClick={() => setOpen(prev => !prev)}>
        {startDate ? formatDate(startDate) : 'Zameldowanie'} / {endDate ? formatDate(endDate) : 'Wymeldowanie'}
      </DateButton>
      {open && (
        <CalendarContainer>
          <StyledDatePicker
            selected={startDate}
            onChange={handleSelect}
            startDate={startDate}
            endDate={endDate}
            selectsRange
            inline
            locale={pl}
          />
        </CalendarContainer>
      )}
    </PickerWrapper>
  );
};

const formatDate = (date) => {
  return date.toLocaleDateString('pl-PL', {
    weekday: 'short', // np. "pon", "wt", "śr" itd.
    day: '2-digit',
    month: 'short',
  });
};

const PickerWrapper = styled.div`
  position: relative;
  max-width: 400px;
`;

const DateButton = styled.button`
  width: 100%;
  height: auto;
  background-color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 300;
  color: #484848;
  cursor: pointer;
  text-align: left;
  padding: 10px 15px;
  transition: background-color 0.3s ease, border-color 0.3s ease;
  
  &:hover {
    background-color: #f7f7f7;
    border-color: #c0c0c0;
  }
`;

const CalendarContainer = styled.div`
  position: absolute;
  top: 60px;
  left: -40px;
  z-index: 10;
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
`;

const StyledDatePicker = styled(DatePicker)`
  /* Możesz tutaj nadpisać domyślne style react-datepicker */
  .react-datepicker__header {
    background-color: white;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .react-datepicker__current-month {
    font-weight: 600;
  }
`;

export default BookingDatePicker;
