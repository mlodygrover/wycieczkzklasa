import React from 'react';
import styled from 'styled-components';

export const Checkbox2 = () => {
  return (
    <StyledWrapper>
      <label className="checkbox-wrapper">
        <input defaultChecked type="checkbox" id="check" hidden />
        <label htmlFor="check" className="checkmark" />
      </label>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .checkmark {
   display: block;
   width: 18px;
   height: 18px;
   background-color: #ddd;
   border-radius: 5px;
   position: relative;
   transition: background-color 0.4s;
   overflow: hidden;
   cursor: pointer;
  }

  #check:checked ~ .checkmark {
   background-color: #08bb68;
  }

  .checkmark::after {
   content: "";
   position: absolute;
   width: 3px;
   height: 6px;
   border-right: 3px solid #fff;
   border-bottom: 3px solid #fff;
   top: 44%;
   left: 50%;
   transform: translate(-50%, -50%) rotateZ(40deg) scale(10);
   opacity: 0;
   transition: all 0.4s;
  }

  #check:checked ~ .checkmark::after {
   opacity: 1;
   transform: translate(-50%, -50%) rotateZ(40deg) scale(1);
  }`;