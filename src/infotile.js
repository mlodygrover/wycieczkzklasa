import React, { useState, useEffect, useMemo } from 'react';
import styled, {keyframes, css} from 'styled-components';

const Iphone = () => {

    return(
        <div className='IP-body'>
            <div className='IP-notch'>

            </div>

        </div>
    )

}

const shrinkExpand = keyframes`
  0% {
    width: 300px;
  }
  30% {
    width: 280px; /* lekki skurcz */
  }
  100% {
    width: 100%;
  }
`;

export const InfoTile = ({ tekst, wariant = "a" }) => {
  const [expanded, setExpanded] = useState(false);
  const klasa = "InfoTile " + wariant; 

  return (
    <StyledInfoTile expanded={expanded}>
      {/* Kliknięcie na element (jeśli nie rozszerzony) rozszerza go */}
      <div className={klasa} onClick={() => !expanded && setExpanded(true)}>
        <a className='InfoTile-tekst-group'>
        <div className='InfoTile-tyt'>{tekst.tyt}</div>
        <div className='InfoTile-tekst'>{tekst.tekst+" "}
        {expanded ? tekst.tekst.repeat(6) : ""}
        </div>
        
        </a>
        <Iphone/>
      </div>
      {/* Ikona zamykania – widoczna gdy rozszerzony */}
      {expanded && (
        <div
          className="close-icon"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(false);
          }}
        >
          <svg
            width="30px"
            height="30px"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14.5 9.50002L9.5 14.5M9.49998 9.5L14.5 14.5"
              stroke="black"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M7 3.33782C8.47087 2.48697 10.1786 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 10.1786 2.48697 8.47087 3.33782 7"
              stroke="#1C274C"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}
    </StyledInfoTile>
  );
};

const StyledInfoTile = styled.div`
  /* Jeśli expanded, wrapper staje się absolutny i rozciąga się na całą szerokość kontenera */
  position: ${props => props.expanded ? "absolute" : "relative"};
  top: ${props => props.expanded ? "0" : "auto"};
  left: ${props => props.expanded ? "0" : "auto"};
  width: ${props => props.expanded ? "100%" : "auto"};
  z-index: ${props => props.expanded ? "100" : "1"};
  margin-top: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  

  .InfoTile {
    height: 500px;
    border-radius: 25px;
    background-image: url("/white-waves.webp");
    background-blend-mode: multiply; 
    overflow: hidden;
    display:flex;
    align-items: center;
    justify-content: center;
    
    flex-direction: ${props => props.expanded ? "row" : "column"};
    
    ${props =>
      props.expanded
        ? css`
            animation: ${shrinkExpand} 0.5s ease forwards;
          `
        : css`
            width: 280px;
            transition: width 0.5s ease;
            cursor: pointer;
          `}
    
          
  }
    
    .InfoTile-tekst-group{
    
    max-width: 600px;
    height: fit-content;
   
    }
    .InfoTile-tyt{

        
        text-align: center;
        font-size: 22px;
        font-weight: 500;
        margin-top: 12px;
    }
    .InfoTile-tekst{
        width: 90%;
        margin: auto;
        font-size: 16px;
        font-weight: 300;

    }
    .InfoTile .IP-body{
        ${props => props.expanded ? " border-radius: 25px; border-bottom: 1px solid black" : ""};
    }
    
  .close-icon {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(650px);
  cursor: pointer;
  z-index: 110;
}
  .close-icon svg:hover {
    transform: scale(1.2);
    transition: 0.3s ease-in-out;
  }
`;