import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import GoogleLikeCard from './testGoogleAtrakcja';

async function fetchAttractionPhotos(idGoogle) {
  try {
    const response = await axios.get(`http://localhost:5002/api/attraction-photos?idGoogle=${idGoogle}`);
    const imageLinks = response.data.imageLinks;
  } catch (error) {
    console.error("Błąd przy pobieraniu zdjęć atrakcji:", error);
  }
}

export const StarRating = ({ rating, total = 5 }) => {
  // Obliczamy procent wypełnienia w skali 0-100%
  const percentage = (Math.min(rating, total) / total) * 100;
  return (
    <StarWrapper>
      <StarsEmpty>
        {Array.from({ length: total }, (_, i) => (
          <Star key={i}>★</Star>
        ))}
      </StarsEmpty>
      <StarsFilled style={{ width: `${percentage}%` }}>
        {Array.from({ length: total }, (_, i) => (
          <Star key={i}>★</Star>
        ))}
      </StarsFilled>
    </StarWrapper>
  );
};

const StarWrapper = styled.div`
    position: relative;
    display: inline-block;
    font-size: 16px;
    line-height: 1;
  `;

const StarsEmpty = styled.div`
    color: #ccc;
  `;

const StarsFilled = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    overflow: hidden;
    white-space: nowrap;
    color: orange; /* złoty kolor dla wypełnionych gwiazdek */
  `;

const Star = styled.span`
    display: inline-block;
  `;


export const WyborPoleAtrakcja = ({ atrakcja, onClick, typ = 1 }) => {
  if (typ == 1) {
    return (

      <WyborPoleAtrakcjaMainbox idGoogle={atrakcja.idGoogle}>
        <img height={"30px"} src="../icons/castle.svg" alt="Ikona" />
        <div className='WyborPoleAtrakcjaGroup'>
          <div className='atrakcjaTyt'>{atrakcja.nazwa}</div>
          <div className='atrakcjaAtr'>
            Czas zwiedzania: <strong>{atrakcja.czasZwiedzania} min</strong>
          </div>
          <div className='atrakcjaAtr'>
            Szacowany koszt: <strong>{atrakcja.cenaOsoba} zł</strong>
          </div>
          <div className='atrakcjaAtr'>
            Ocena: <strong><StarRating rating={atrakcja.ocenaGoogle} /></strong>
          </div>
        </div>
        <DetailsPopup className="details">
          {/*
                  <img src={atrakcja.fotoLink}/>
                  <p><strong>Data dodania:</strong> {atrakcja.dataDodania}</p>
                  <p><strong>Miasto:</strong> {atrakcja.miasto}</p>
                  <p><strong>Nazwa:</strong> {atrakcja.nazwa}</p>
                  <p><strong>Adres:</strong> {atrakcja.adres}</p>
                  <p><strong>Czas zwiedzania:</strong> {atrakcja.czasZwiedzania} min</p>
                  <p><strong>Cena:</strong> {atrakcja.cenaOsoba} zł</p>
                  <p><strong>ID Google:</strong> {atrakcja.idGoogle}</p>
                  <p><strong>Ocena:</strong> {atrakcja.ocenaGoogle}</p>*/}
          {atrakcja ? <GoogleLikeCard aktywnosc={atrakcja} onClick={onClick} /> : ""}
        </DetailsPopup>
      </WyborPoleAtrakcjaMainbox>
    );
  }
  else if (typ == 2) {
    return (

      <WyborPoleAtrakcjaMainbox onClick={onClick} idGoogle={atrakcja.idGoogle}>
        <img height={"30px"} src="../icons/park.svg" alt="Ikona" />
        <div className='WyborPoleAtrakcjaGroup'>
          <div className='atrakcjaTyt'>{atrakcja.nazwa}</div>
          <div className='atrakcjaAtr'>
            Czas zwiedzania: 10
          </div>
          <div className='atrakcjaAtr'>
            Szacowany koszt: 20
          </div>
          <div className='atrakcjaAtr'>
            Ocena: 20
          </div>
        </div>

      </WyborPoleAtrakcjaMainbox>
    );
  }

};

const WyborPoleAtrakcjaMainbox = styled.div`
    position: relative; /* Ustawienie pozycji, aby popup mógł być pozycjonowany względem tego kontenera */
    width: 290px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: left;
   
    margin: 10px auto;
    
    border-left: ${props =>
    props.idGoogle === "FREE"
      ? "4px solid #f425ea"
      : "4px solid #F42F25"};
    background-color: rgb(255, 255, 255);
    background-blend-mode: multiply;
    border-radius: 10px;
    gap: 20px;
    padding-top: 5px;
    padding-bottom: 5px;
    padding-left: 15px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.2);
    
    .WyborPoleAtrakcjaGroup {
      display: flex;
      flex-direction: column;
      align-items: flex-start; /* Zamiast 'left' używamy flex-start */
      justify-content: center;
    }
  
    .atrakcjaTyt {
      font-size: 15px;
      font-weight: 600;
      text-align: left;
    }
  
    .atrakcjaAtr {
      font-size: 12px;
      text-align: left;
      margin-left: 0;
    }
  
    &:hover .details {
      opacity: 1;
      visibility: visible;
    }
  `;

const DetailsPopup = styled.div`
    position: absolute;
    top: 0;
    left: 105%;
    width: fit-content;
    height: fit-content;
    background-color: white;
    border: 1px solid #ccc;
    border-radius: 25px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.2);
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease, visibility 0.3s ease;
    background-blend-mode: multiply;
    z-index: 9999;
  `;
