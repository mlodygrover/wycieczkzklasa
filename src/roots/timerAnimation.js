import React from 'react';
import styled from 'styled-components';

export const Timer = () => {
  return (
    <StyledWrapper>
      <div className="circle-button">
        <svg className="icon" strokeLinejoin="round" strokeLinecap="round" strokeWidth={2} stroke="currentColor" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
          <path d="M12 6v6l3 3" />
        </svg>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .circle-button {
    position: relative;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background-color: black;
    display: flex;
    justify-content: center;
    align-items: center;
    
    cursor: pointer;
    transition:
      transform 0.4s ease,
      box-shadow 0.3s ease,
      background 0.5s ease;
    overflow: hidden;
  }

  

  .icon {
    width: 40px;
    height: 40px;
    stroke: white;
    transition:
      transform 0.5s ease-in-out,
      stroke-dasharray 0.6s ease-in-out;
    stroke-dasharray: 200;
    stroke-dashoffset: 200;
    animation: strokeAnimate 2s linear infinite;
  }

  .circle-button:hover .icon {
    transform: rotate(360deg);
    stroke-dashoffset: 0;
    animation: none;
  }

  .button-text {
    position: absolute;
    bottom: -40px;
    font-size: 12px;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #00d4ff;
    opacity: 0;
    transition:
      bottom 0.4s ease,
      opacity 0.4s ease;
  }

  .circle-button:hover .button-text {
    bottom: 10px;
    opacity: 1;
  }

  .circle-button:after {
    content: "";
    position: absolute;
    width: 150%;
    height: 150%;
    background: radial-gradient(circle, rgba(0, 212, 255, 0.4), transparent);
    border-radius: 50%;
    opacity: 0;
    transition: opacity 0.5s ease-in-out;
  }

  .circle-button:hover:after {
    opacity: 1;
  }

  @keyframes strokeAnimate {
    0% {
      stroke-dashoffset: 200;
    }
    50% {
      stroke-dashoffset: 100;
    }
    100% {
      stroke-dashoffset: 0;
    }
  }`;

export default Timer;
