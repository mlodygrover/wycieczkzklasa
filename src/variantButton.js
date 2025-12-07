import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  position: relative;
  display: flex;
`;

const MainButton = styled.button`
  width: 90%;
  min-width: 220px;
  max-width: 250px;
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
    background: white;
    border: 1px solid #e0e0e0;
    box-shadow: none;
    color: #707070;

    &::before {
      
      background: #ddefff;
      transition: opacity 0.3s ease;
    }
    &:hover{
      background: #ddefff;
      border: 1px solid #667eea;
      box-shadow: none;
      transform: translateY(0);
    
    }
    @media screen and (max-width: 1000px){
      display: none;
    }
  }
  
  
  &:hover {
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
    transform: translateY(-1px);
    @media screen and (max-width: 1200px){
      transform: none;
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
  &.b{
    width: 100%;
    margin-bottom: 5px;
    background: #00b191ff;
    font-weight: 500;
    &.sourcePlace{
      min-width: 150px;
      max-width: none;
    }
    &:hover{
      background: rgba(0, 135, 110, 0.66);
    }
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
  z-index: 2000;
  opacity: ${props => props.isOpen ? '1' : '0'};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: top center;
  margin: 0 auto;
  @media screen and (min-width: 1200px){
  }
  
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

const VariantButton = ({ variants, placeholder = "Wybierz wariant", onSelect, selectedVariantInit, source = false, typ=1, sourcePlace = false}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(selectedVariantInit);
  const containerRef = useRef(null);

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
      <MainButton onClick={handleToggle} className={`${source ? "schedule" : ""} ${typ === 2 ? "b" : ""} ${sourcePlace ? "sourcePlace" : ""}`.trim()}>
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
