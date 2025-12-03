import styled, { keyframes } from "styled-components";
import React, { useState } from "react";
import { ClosedCaptionIcon, Map, X } from "lucide-react";
import { BoxSubtitle, BoxTitle, LocationSearch } from "../preConfSketch";
import LeafletMap from "../roots/googleMapViewer";

// Animacja dla tła (fade-in)
const fadeInOverlay = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

// Animacja dla okna (lekki "pop" / slide-up)
const popupEnter = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const PopupManagerMainbox = styled.div`
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  background: #0000009a;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  animation: ${fadeInOverlay} 0.25s ease-out;
`;

const FieldMainbox = styled.div`
  width: 95%;
  max-width: 400px;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 0 50px gray;
  padding: 10px;
  box-sizing: border-box;
  animation: ${popupEnter} 0.25s ease-out;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 3px;
  padding-bottom: 40px;
`;
const CloseBar = styled.div`
    width: 100%;
    height: 30px;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    .closeButton {
        width: 30px;
        height: 30px;
        background-color: #fafafa;
        color: #808080;
        border-radius: 5px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: 0.3s ease-in-out;
        &:hover{ 
            color: black;
        }
    }
`
const MapBox = styled.div`
    width: 100%;
    height: 300px;
    background-color: #f6f6f6;
    border-radius: 5px;
    overflow: hidden;
    .alertMap {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        color: #808080;
        font-size: 16px;
        font-weight: 500;
        font-family: Inter, sans-serif;
    }

    .leaflet-bottom.leaflet-right {
        display: block;
        background-color: rgba(255, 0, 0, 0);
        color: black;
        margin-bottom: auto;
    

        a {
        color: black;
        }
    }
`
const ContentBar = styled.div`
    width: 100%;
    flex: 1;
    gap: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
`
const TitleBox = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    width: 100%;
    text-align: left;
    .titleBox{
        font-size: 20px;
        color: black;
        font-weight: 600;
        font-family: Inter, sans-serif;
    }
    .subtitleBox{
        font-size: 14px;
        color: #606060;
        font-weight: 500;
        font-family: Inter, sans-serif;
    }
`

export const PopupManager = ({ field = 0, setPopupPickerOpened, miejsceDocelowe, setMiejsceDocelowe }) => {
    const handleBackdropClick = (e) => {
        // Zamknij tylko, jeśli kliknięto tło, a nie środek popupa
        if (e.target === e.currentTarget) {
            setPopupPickerOpened(false);
        }
    };
    return (
        <PopupManagerMainbox onClick={handleBackdropClick}>
            <FieldMainbox>
                <CloseBar>
                    <div className="closeButton" onClick={() => setPopupPickerOpened(false)}><X /></div>

                </CloseBar>
                <TitleBox>
                    <div className="subtitleBox">Gdzie rozpoczniemy nasza przygodę?</div>
                    <div className="titleBox">Wybierz miejsce początkowe</div>
                </TitleBox>
                <ContentBar>

                    <MapBox key={miejsceDocelowe}>
                        {!miejsceDocelowe?.location?.lat && <div className="alertMap"><Map size={50} />Nie wybrano miejsca początkowego</div> || <LeafletMap lat={miejsceDocelowe?.location?.lat || 52.5333} lng={miejsceDocelowe?.location?.lng || 16.9252} zoom={9} />}
                    </MapBox>
                    <LocationSearch
                        value={miejsceDocelowe?.nazwa || ''}
                        onChange={(sel) => setMiejsceDocelowe(sel)}
                        placeholder="Wpisz miejsce docelowe"
                    />
                </ContentBar>

            </FieldMainbox>
        </PopupManagerMainbox>
    );
};
