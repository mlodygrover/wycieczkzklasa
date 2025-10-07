import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { AktywnosciNaw } from './aktywnosciNaw.js';
import { DodawaniePanel } from './dodawaniePanel.js';

export const DodawaniePlan = ({ onAddActivity, katP }) => {
  //console.log('🔴 DodawaniePlan onAddActivity =', onAddActivity);
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const open = () => {
    setIsClosing(false);
    setIsOpen(true);
  };
  function testfoo(){
    return "ABCD";
  }
  const close = () => {
    // najpierw ustawiamy flagę zamykania, animacja potrwa 300ms,
    // potem odmontowujemy modal
    setIsClosing(true);
    setTimeout(() => setIsOpen(false), 300);
  };
  const toggleMaximize = () => setIsMaximized(m => !m);
  const minimize = () => {
    // np. tylko schowaj treść, zostaw belkę
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 300);
  };
  
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = e => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen]);
  useEffect(()=>{
    console.log("TEST40",katP)
    if(katP){
      setIsOpen(true);

    }
  },[katP])
  return (
    <>
      <div className='aktywnoscPlanGroup'>
        <AktywnosciNaw/>
        <div className='dodawaniePlan' onClick={open}>
          <div className='dodawanieBox'>
            <img src="../icons/icon-plus.svg" height={'50px'}/>
            <a>Dodaj aktywność</a>
          </div>
        </div>
      </div>
      
      {isOpen && (
        <Overlay $closing={isClosing}>
          <Modal $maximized={isMaximized} $closing={isClosing}>
            <WindowControls>
              <Control color="#ff5f57" onClick={close}><img src="../icons/icon-close2.svg"/></Control>
              <Control color="lightgray"/>
              <Control color="#28c940" onClick={toggleMaximize}><img src="../icons/icon-maximize.svg"/></Control>
            </WindowControls>
            <DodawaniePanel onAddActivity={onAddActivity} />
          </Modal>
        </Overlay>
      )}
    </>
  );
};

const Overlay = styled.div`
  position: fixed; top:0; left:0;
  width:100vw; height:100vh;
  background: rgba(0,0,0,${p => p.$closing ? 0 : 0.5});
  display:flex; align-items:center; justify-content:center;
  z-index:1000;
  transition: background 0.3s ease;
`;

const Modal = styled.div`
  position: relative;
  width: ${p => p.$maximized ? '100vw' : '70vw'};
  height: ${p => p.$maximized ? '100vh' : '80vh'};
  background: white;
  border-radius: ${p => p.$maximized ? '0px' : '15px'};
  padding: 20px;
  box-sizing: border-box;
  overflow-y: auto;
  
  /* animacje */
  opacity: ${p => p.$closing ? 0 : 1};
  transform: ${p => p.$closing ? 'scale(0.9)' : 'scale(1)'};
  transition:
    width 0.3s ease,
    height 0.3s ease,
    border-radius 0.3s ease,
    opacity 0.3s ease,
    transform 0.3s ease;
`;

const WindowControls = styled.div`
  position: absolute;
  top: 10px;
  left: 12px;
  display: flex;
  gap: 8px;
  padding: 10px;
  /* przy hover nad całym WindowControls - pokazujemy wszystkie <img> w dzieciach */
  border-bottom: 1px solid gray;
  &:hover img {
    display: block;
  }
`;

const Control = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${p => p.color};
  cursor: pointer; 
  display: flex;
  align-items: center;
  justify-content: center;   
  & > img {
    width: 10px;
    display: none;        /* domyślnie ukrywamy */
  }
 
`;
