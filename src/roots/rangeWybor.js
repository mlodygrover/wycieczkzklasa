import React from 'react';
import styled from 'styled-components';

const RangeContainer = styled.div`
  /* Ensure the parent div uses the "atrybut" class */
  &.atrybut {
    width: 100%;
  }
`;

const StyledRange = styled.input`
  -webkit-appearance: none;
  width: 100%;
  height: 5px;
  border-radius: 5px;
  background: linear-gradient(
    to right,
    black 0%,
    black var(--percent),
    gray var(--percent),
    gray 100%
  );
  outline: none;
  margin: 0;
  
  /* WebKit (Chrome, Safari) */
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 2px;         /* A thin vertical line */
    height: 20px;       /* Adjust as needed */
    background: black;  /* Color of the thumb */
    cursor: pointer;
    margin-top: -7.5px; /* Centers the thumb relative to the 5px track */
  }
  
  /* Firefox */
  &::-moz-range-thumb {
    width: 2px;
    height: 20px;
    background: black;
    cursor: pointer;
    border: none;
  }
`;

export const CustomRange = ({ value, min, max, onChange }) => {
  const percent = ((value - min) / (max - min)) * 100;
  return (
    <RangeContainer className="atrybut">
      <StyledRange
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={onChange}
        style={{ '--percent': percent + '%' }}
      />
    </RangeContainer>
  );
};

export default CustomRange;
