import React from 'react';
import styled from 'styled-components';


export const InputText2 = ({typ='time', value, onChange}) => {
  return (
    <StyledWrapper>
        <input type={typ} value={value} onChange={onChange}/>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
input{
    height: 20px;
    width: 100%;
    font-family: arial;
    font-weight: 100;
    border: none;
    outline: none;
    color: grey;
    border-radius: 10px;
    padding-left: 10px;
    appearance: none;      /* standard */
    -webkit-appearance: none; /* dla przeglądarek opartych na WebKit */
    -moz-appearance: none;    /* dla Firefoksa */
    
    /* Specyficzny dla WebKit, by usunąć ikonę kalendarza/ zegara */
    &::-webkit-calendar-picker-indicator {
      display: none;
}


`;

