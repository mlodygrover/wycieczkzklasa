import React from 'react';
import styled from 'styled-components';
const Radio1 = ({
    options = [
        { icon: "../icons/osrodek.svg", label: "Ośrodki kolonijne" },
        { icon: "../icons/icon-hotel.svg", label: "Hotele 2/3 gwiazdkowe" },
        { icon: "../icons/hotel-building-svgrepo-com.svg", label: "Hotele premium" },
        { icon: "../icons/icon-own-transport.svg", label: "Własne / brak" }
    ],
    setWybor,
    value,   // <-- dodane
    name = "radio-group"
}) => {
    return (
        <StyledWrapper>
            <div className="radio-inputs">
                {options.map((option, optionIdx) => (
                    <label key={optionIdx}>
                        <input
                            className="radio-input"
                            type="radio"
                            name={name}
                            value={option.label}
                            checked={value === option.label}   // <-- sterowanie zaznaczeniem
                            onChange={() => setWybor(option.label)}
                        />
                        <span className="radio-tile">
                            <span className="radio-icon">
                                <img src={option.icon} height="30px" width="30px" />
                            </span>
                            <span className="radio-label">{option.label}</span>
                        </span>
                    </label>
                ))}
            </div>
        </StyledWrapper>
    );
};


const StyledWrapper = styled.div`
  .radio-inputs {
    display: flex;
    justify-content: center;
    align-items: center;
    max-width: 350px;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  .radio-inputs > * {
    margin: 6px;
  }

  .radio-input:checked + .radio-tile {
    border-color: #F49725;
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
    color: #F49725;
  }

  .radio-input:checked + .radio-tile:before {
    transform: scale(1);
    opacity: 1;
    background-color: #F49725;
    border-color: #F49725;
  }

  .radio-input:checked + .radio-tile .radio-icon svg {
    fill: #F49725;
  }

  .radio-input:checked + .radio-tile .radio-label {
    
  }

  .radio-input:focus + .radio-tile {
    border-color: #F49725;
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1), 0 0 0 4px #f4972533;
  }

  .radio-input:focus + .radio-tile:before {
    transform: scale(1);
    opacity: 1;
  }

  .radio-tile {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 80px;
    min-height: 80px;
    border-radius: 0.5rem;
    border: 2px solid #b5bfd9;
    background-color: #fff;
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
    transition: 0.15s ease;
    cursor: pointer;
    position: relative;
  }

  .radio-tile:before {
    content: "";
    position: absolute;
    display: block;
    width: 0.75rem;
    height: 0.75rem;
    border: 2px solid #F49725;
    background-color: #F49725;
    border-radius: 50%;
    top: 0.25rem;
    left: 0.25rem;
    opacity: 0;
    transform: scale(0);
    transition: 0.25s ease;
  }

  .radio-tile:hover {
    border-color: #F49725;
  }

  .radio-tile:hover:before {
    transform: scale(1);
    opacity: 1;
  }

  .radio-icon svg {
    width: 2rem;
    height: 2rem;
    fill: #494949;
  }

  .radio-label {
    color: #707070;
    transition: 0.375s ease;
    text-align: center;
    font-size: 13px;
  }

  .radio-input {
    clip: rect(0 0 0 0);
    -webkit-clip-path: inset(100%);
    clip-path: inset(100%);
    height: 1px;
    overflow: hidden;
    position: absolute;
    white-space: nowrap;
    width: 1px;
  }`;

export default Radio1;
