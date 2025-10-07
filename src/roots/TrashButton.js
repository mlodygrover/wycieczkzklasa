import React from 'react';
import styled from 'styled-components';

export const TrashButton = ({onClick}) => {
  return (
    <StyledWrapper>
      <button onClick={onClick} >
        <img src="icons/icon-trash.svg"/>

      </button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  button{
      width: 40px;
      height: 40px;
      border-radius: 25px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      background-color: black;
      
    }
  button:hover{
    background-color: #F42F25;
    cursor: pointer;
    transition: background-color 0.5s ease-in-out
  }
  `;



