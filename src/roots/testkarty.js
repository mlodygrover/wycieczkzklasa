import React, { useState } from 'react';
import styled from 'styled-components';

export const ChromeTabs = () => {
  // Domyślnie wybrana karta to numer 1
  const [wybor, setWybor] = useState(1);

  // Tablice obiektów definiujące karty; ikony można dostosować według potrzeb
  const tabs = [
    { id: 1, icon: "../icons/trend.svg", label: "Popularne" },
    { id: 2, icon: "../icons/castle.svg", label: "Atrakcje turystyczne" },
    { id: 3, icon:"../icons/park.svg", label: "Podstawowe aktywności"  },
    { id: 4, icon:"../icons/serce.svg", label: "Polubione"  }
  ];

  return (
    <StyledWrapper>
      <p>{tabs[wybor - 1].label}</p>
      <ToolsRadio>
        {tabs.map(tab => (
          <ToolsRadioElement
            key={tab.id}
            selected={wybor === tab.id}
            onClick={() => setWybor(tab.id)}
          >
            <Icon src={tab.icon} alt={tab.label} />
          </ToolsRadioElement>
        ))}
      </ToolsRadio>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  width: 100%;
  margin: 10px auto;
  
  text-align: left;
  p{
    width: 80%;
    max-width: 200px;
    padding-left: 20px;
    margin: auto;
    font-size: 12px;
  }
`;

const ToolsRadio = styled.div`
  background-color: black;
  width: 100%;
  max-width: 220px;
  margin: 2px auto;
  border-radius: 20px;
  display: flex;
  flex-direction: row;
  overflow: hidden;
  gap: 1px;
`;

const ToolsRadioElement = styled.div`
  /* Szerokość zależna od zawartości – padding zapewnia odstępy */
  width: 100%;
  
  padding: 5px 2px;
  background-color: ${props => (props.selected ? '#F42582' : 'white')};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.4s ease-in-out;
  color: red;
  &:hover {
    background-color: ${props => (props.selected ? '#F42582' : '#F42582')};
  }
`;

const Icon = styled.img`
  width: 30px;
  height: 30px;
  margin-right: 5px;
  /* Jeśli karta jest wybrana, filtr invert sprawia, że ikona staje się biała */
  filter: ${props => (props.selected ? 'invert(1)' : 'none')};
  
  /* Aby przekazać prop "selected" do img, możemy użyć funkcji styled() w ToolsRadioElement 
     lub opakować ikonę w komponent, ale prostszym rozwiązaniem jest ustalenie filtru w ToolsRadioElement */
`;

/* Aby ustawić filtr ikon, możemy również opakować Icon w funkcję, która korzysta z props */
const Label = styled.span`
  font-size: 14px;
  color: ${props => (props.selected ? 'white' : '#484848')};
`;

export default ChromeTabs;
