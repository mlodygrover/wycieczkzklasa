import React, { use, useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';

// Keyframe for sliding in from the top
const slideDown = keyframes`
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

// Keyframe for sliding in from the bottom
const slideUp = keyframes`
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

// A component to display the time with animation based on the "direction" prop.
const TimeDisplay = styled.div`
  animation: ${props => (props.direction === 'up' ? slideUp : slideDown)} 0.5s ease forwards;
`;

// Helper function to ensure numbers are always two digits.
const fitNumber = n => (n >= 10 ? String(n) : "0" + String(n));

const TimePickerDiv = styled.div`
 
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: left;
  gap: 10px;
  .przyciskiGodzina {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 5px;
  }
  .displayGodzina{
  font-size: 14px;
    font-weight: 500;
    white-space: nowrap;}
  
  .przycisk {
  background-color: black;
  width: 15px;
  height: 15px;
  border-radius: 10px;
  cursor: pointer;
  color: white;
  display: flex;             /* włącza flexbox */
  align-items: center;       /* centrowanie w pionie */
  justify-content: center;   /* centrowanie w poziomie */
}
  .przycisk.b{
  transform: rotate(180deg)}
`;
function parseTimeString(totalMinutes) {
  if (typeof totalMinutes == 'string') return totalMinutes;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return [hours, minutes];
}

export const MyTimePicker = ({ startValue = 1500, setWybranaGodzinaOut, czyZmienna = true }) => {
  const [wybranaGodzina, setWybranaGodzina] = useState(parseTimeString(startValue));
  const [animDirection, setAnimDirection] = useState('up');
  // synchronizacja przy zmianie props.startValue
  useEffect(() => {
    setWybranaGodzina(parseTimeString(startValue));
  }, [startValue]);

  // zawsze deklarujesz hook na górze, a w nim sprawdzasz flagę
  useEffect(() => {
    if (!czyZmienna) return;
    const n = wybranaGodzina[0] * 60 + wybranaGodzina[1];
    setWybranaGodzinaOut(n);
  }, [wybranaGodzina, czyZmienna, setWybranaGodzinaOut]);

  // changeMinute też zadeklaruj zawsze, ale niech w środku pilnuje czyZmienna
  const changeMinute = delta => {
    if (!czyZmienna) return;
    setWybranaGodzina(prev => {
      let [h, m] = prev;
      m += delta;
      while (m >= 60) { m -= 60; h++; }
      while (m < 0) { m += 60; h--; }
      h = ((h % 24) + 24) % 24;
      return [h, m];
    });
    setAnimDirection(delta > 0 ? 'up' : 'down');
  };
  const isArray = Array.isArray(wybranaGodzina);
  const displayKey = isArray
    ? wybranaGodzina.join('-')
    : String(wybranaGodzina);

  const displayText = isArray
    ? `${fitNumber(wybranaGodzina[0])}:${fitNumber(wybranaGodzina[1])}`
    : wybranaGodzina;

  return (
    <TimePickerDiv>
      <div className="displayGodzina">
        <TimeDisplay key={displayKey} direction={animDirection}>
          {displayText}
        </TimeDisplay>
      </div>
      {czyZmienna && (
        <div className="przyciskiGodzina">
          <div className="przycisk" onClick={() => changeMinute(10)}>
            <img src="../icons/icon-arrow.svg" width="12" />
          </div>
          <div className="przycisk b" onClick={() => changeMinute(-10)}>
            <img src="../icons/icon-arrow.svg" width="12" />
          </div>
        </div>
      )}
    </TimePickerDiv>
  );
};


export default MyTimePicker;
