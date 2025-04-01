import React from 'react';
import styled from 'styled-components';

export const ArrowButton2 = ({rot = 0, onClick}) =>{

    return (
        <StyledWrapper>
          <button onClick={onClick}>
            <img src="icons/icon-arrow.svg" style={{ transform: `rotate(${rot}deg)` }}/>
    
          </button>
        </StyledWrapper>
      );
}

const StyledWrapper = styled.div`
  button{
      width: 30px;
      height: 30px;
      border-radius: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      background-color: black;
      
    }
  button:hover{
    background-color: #F42582;
    cursor: pointer;
    transition: background-color 0.3s ease-in-out
  }
  `;



