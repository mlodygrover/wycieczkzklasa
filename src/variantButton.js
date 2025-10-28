import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  position: relative;
  display: inline-block;
`;

const MainButton = styled.button`
  width: 90%;
  max-width: 250px;
  min-width: 220px;
  margin: 0 auto;
  height: 30px;
  /*background: linear-gradient(135deg, #667eea 0%, #008d73ff 100%);*/ 
  background: #667eea;
  border: none;
  border-radius: 5px;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  transition: all 0.5s ease;
  font-family: inherit;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  position: relative;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;

  &.schedule{
  
    @media screen and (max-width: 1000px){
      display: none;
    }
  }
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    /*background: linear-gradient(135deg, #008d73ff 0%, #667eea 100%);*/
    background: #556dd9;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover {
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
    transform: translateY(-1px);
    
    &::before {
      opacity: 1;
    }
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  }
  
  span {
    position: relative;
    z-index: 1;
  }
`;

const ButtonText = styled.span`
  font-size: 13px;
`;

const Arrow = styled.span`
  font-size: 10px;
  transition: transform 0.3s ease;
  transform: ${props => props.isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  display: inline-block;
`;

const Dropdown = styled.div`
  position: absolute;
  top: calc(100% + 5px);
  left: 50%;
  transform: ${props => props.isOpen
    ? 'translate(-50%, 0) scale(1)'
    : 'translate(-50%, -10px) scale(0.95)'};
  width: 90%;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  z-index: 1000;
  opacity: ${props => props.isOpen ? '1' : '0'};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: top center;
  margin: 0 auto;
`;
const VariantOption = styled.div`
  padding: 14px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #1f2937;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: linear-gradient(90deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
    padding-left: 20px;
  }
  
  &.selected {
    background: linear-gradient(90deg, rgba(102, 126, 234, 0.12) 0%, rgba(118, 75, 162, 0.12) 100%);
    color: #667eea;
    position: relative;
    
    &::before {
      content: '✓';
      position: absolute;
      left: 16px;
      font-weight: bold;
    }
    
    padding-left: 32px;
  }
`;

const OptionName = styled.span`
  flex: 1;
`;

const OptionPrice = styled.span`
  color: #667eea;
  font-size: 13px;
`;

const VariantButton = ({ variants, placeholder = "Wybierz wariant", onSelect, selectedVariantInit, source = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(selectedVariantInit);
  const containerRef = useRef(null);
  useEffect(() => {
    source && console.log("TEST7", selectedVariantInit);
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (variant) => {
    setSelectedVariant(variant);
    setIsOpen(false);
    if (onSelect) {
      onSelect(variant);
    }
  };


  return (
    <Container ref={containerRef}>
      <MainButton onClick={handleToggle} className={source && "schedule"}>
        <ButtonText>{selectedVariant !== null ? variants[selectedVariant].nazwaWariantu : placeholder}</ButtonText>
        <Arrow isOpen={isOpen}>▼</Arrow>
      </MainButton>

      <Dropdown isOpen={isOpen}>
        {variants.map((variant, idx) => (
          <VariantOption
            key={variant.nazwaWariantu + idx}
            className={idx === selectedVariant ? 'selected' : ''}
            onClick={() => handleSelect(idx)}
          >
            <OptionName>{variant.nazwaWariantu}</OptionName>
            {variant.cenaZwiedzania && <OptionPrice>{variant.cenaZwiedzania} zł</OptionPrice>}
          </VariantOption>
        ))}
      </Dropdown>
    </Container>
  );
};

export default VariantButton;
