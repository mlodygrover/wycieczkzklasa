import React from 'react';
import styled from 'styled-components';


export const InputText1 = ({typ = "text", maxlen = "220px", onChange, value, maxh = "3px"}) => {
  return (
    <StyledWrapper maxlen={maxlen} maxh={maxh}>
      <input value={value} onChange={onChange} placeholder="Searth the internet..." min="0" type={typ} name="text" className="input"/>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .input {
    width: 300px;
    max-width: ${props => props.maxlen};
    max-height: ${props => props.maxh};
    height: 3px;
    padding-top: 12px;
    padding-bottom: 12px;
    padding-left: 5px;
    padding-right: 5px;
    border-radius: 2px;
    border: 1.5px solid grey;
    outline: none;
    transition: all 0.3s cubic-bezier(0.19, 1, 0.22, 1);
    box-shadow: 0px 0px 20px -18px;
    font-size: 12px;
    
  }

  .input:hover {
    border: 2px solid lightgrey;
    box-shadow: 0px 0px 20px -17px;
  }

  .input:active {
    transform: scale(0.95);
  }

  .input:focus {
    border: 2px solid black;
  }`;

