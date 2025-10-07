import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';


export const TransportChoice = ({ value, onChange }) => {
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);
  
    // Jeśli komponent jest kontrolowany, wartość wybranej ikony pochodzi z props value;
    // w przeciwnym razie używamy domyślnej wartości.
    const [selectedIcon, setSelectedIcon] = useState(value === 1 ? "icons/icon-private-bus.svg" : value === 2 ? "icons/icon-public-trannsport.svg" : "icons/icon-own-transport.svg");
    const handleClick = () => {
      setOpen(true);
    };
  
    const handleClose = () => {
      setOpen(false);
    };
  
    const handleSelectOption = (iconSrc) => {
        
      if (onChange) {
        onChange(iconSrc.val);
      }

      setSelectedIcon(iconSrc.zdj)
      setOpen(false);
      console.log("test106", selectedIcon, iconSrc.val, value) 
    };
  
    // Zamknięcie panelu po kliknięciu poza kontenerem
    useEffect(() => {
      const handleClickOutside = (e) => {
        if (containerRef.current && !containerRef.current.contains(e.target)) {
          setOpen(false);
        }
      };
  
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);
    
    return (
      <Container ref={containerRef}>
        <MainIcon onClick={handleClick}>
          <img src={selectedIcon} alt="Transport" />
        </MainIcon>
        {open && (
          <Dialog onClick={handleClose}>
            <DialogContent onClick={(e) => e.stopPropagation()}>
              <IconOption onClick={() => handleSelectOption({zdj: "icons/icon-private-bus.svg", val: 1})}>
                <img src="icons/icon-private-bus.svg" alt="Opcja 1" />
                <a>
                  Wynajęty autokar<br />
                  <div>wynajmij autokar dla grupy, jest to rozwiązanie droższe, lecz najbardziej elastyczne</div>
                </a>
              </IconOption>
              <IconOption onClick={() => handleSelectOption({zdj: "icons/icon-public-trannsport.svg", val: 2 })}>
                <img src="icons/icon-public-trannsport.svg" alt="Opcja 2" />
                <a>
                  Publiczny transport<br />
                  <div>Transport zbiorowy, bardziej ekonomiczny, ale mniej elastyczny</div>
                </a>
              </IconOption>
              <IconOption onClick={() => handleSelectOption({zdj: "icons/icon-own-transport.svg", val: 3})}>
                <img src="icons/icon-own-transport.svg" alt="Opcja 3" />
                <a>
                  Własny transport<br />
                  <div>Indywidualne rozwiązanie, dostosowane do potrzeb grupy</div>
                </a>
              </IconOption>
            </DialogContent>
          </Dialog>
        )}
      </Container>
    );
  };

const Container = styled.div`
  position: relative;
  display: inline-block;
`;

const MainIcon = styled.div`
  cursor: pointer;
  img {
    width: 30px;
    height: 30px;
  }
`;

const Dialog = styled.div`
  position: absolute;
  top: 60px; /* odstęp od głównej ikony */
  left: 50%;
  transform: translateX(-50%);
  width: min(400px, 85vw);
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  padding: 10px;
  z-index: 100;
`;

const DialogContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  
  
`;

const IconOption = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 2px;
  img {
    width: 40px;
    height: 40px;
  }
  a {
    display: flex;
    flex-direction: column;
    font-size: 14px;
    text-decoration: none;
    color: inherit;
    div {
      font-size: 10px;
      max-width: 80%;
      text-align: center;
      margin: auto;
      margin-top: 2px;
    }
  }
  &:hover{
  background-color: #f2f2f2;
  }
`;

