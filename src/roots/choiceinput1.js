import React from 'react';
import styled from 'styled-components';

export const ChoiceInput1 = ({ onChange, value = "brak", options, maxlen = "220px", ...props }) => {
  // Domyślne opcje wyboru
  const defaultOptions = [
    "brak",
    "śniadanie",
    "obiad",
    "kolacja",
    "śniadanie/kolacja",
    "śniadanie/obiad",
    "obiad/kolacja",
    "śniadanie/obiadokolacja"
  ];

  const opts = options || defaultOptions;

  return (
    <StyledWrapper maxlen={maxlen} {...props}>
      <select className="input" value={value} onChange={onChange}>
        {opts.map((option, index) => (
          <option key={index} value={option}>{option}</option>
        ))}
      </select>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .input {
    width: 300px;
    max-width: ${props => props.maxlen};
    height: 30px;
    padding-left: 5px;
    border-radius: 2px;
    border: 1.5px solid grey;
    outline: none;
    transition: all 0.3s cubic-bezier(0.19, 1, 0.22, 1);
    box-shadow: 0px 0px 20px -18px;
    font-size: 12px;
    line-height: 10px; /* lub inna wartość, która zapewni odpowiednią widoczność tekstu */
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    color: #555555;
    font-weight: 200;
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
  }
`;

export default ChoiceInput1;
