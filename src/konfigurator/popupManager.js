import styled, { keyframes } from "styled-components";
import React, { useState } from "react";
import { Check, CheckCheckIcon, Map, Minus, Plus, X } from "lucide-react";
import { CounterButton, CounterInput, CounterWrapper, LocationSearch } from "../preConfSketch";
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

    &:hover {
      color: black;
    }
  }
`;

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
`;

const ContentBar = styled.div`
  width: 100%;
  flex: 1;
  gap: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
`;

const TitleBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
  text-align: left;

  .titleBox {
    font-size: 20px;
    color: black;
    font-weight: 600;
    font-family: Inter, sans-serif;
  }

  .subtitleBox {
    font-size: 14px;
    color: #606060;
    font-weight: 500;
    font-family: Inter, sans-serif;
  }
`;
const SubmitButton = styled.div`
    width: 100%;
    height: 30px;
    background-color: black;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 5px;
    font-weight: 600;
    cursor: pointer;
    transition: 0.3s ease-in-out;
    margin-top" 10px;
    &:hover{
        background-color: #404040;

    }

`
/** TABLICA POPUPÓW – każdy element to osobny komponent funkcyjny */
const popups = [
    function StartPlacePopup({ miejsceDocelowe, setMiejsceDocelowe, setPopupPickerOpened }) {
        const [miejsceDoceloweLocal, setMiejsceDoceloweLocal] = useState(miejsceDocelowe)
        function submitMiejsceDocelowe() {
            if (!miejsceDoceloweLocal?.nazwa || !miejsceDoceloweLocal?.location?.lat || !miejsceDoceloweLocal?.location?.lng) return
            setMiejsceDocelowe(miejsceDoceloweLocal)
            setPopupPickerOpened(-1)
        }
        return (
            <>
                <TitleBox>
                    <div className="subtitleBox">Gdzie rozpoczniemy naszą przygodę?</div>
                    <div className="titleBox">Wybierz miejsce początkowe</div>
                </TitleBox>
                <ContentBar>
                    <MapBox>
                        {!miejsceDoceloweLocal?.location?.lat ? (
                            <div className="alertMap">
                                <Map size={50} />
                                Nie wybrano miejsca początkowego
                            </div>
                        ) : (
                            <LeafletMap
                                lat={miejsceDoceloweLocal.location.lat || 52.5333}
                                lng={miejsceDoceloweLocal.location.lng || 16.9252}
                                zoom={9}
                            />
                        )}
                    </MapBox>

                    <LocationSearch
                        value={miejsceDoceloweLocal?.nazwa || ""}
                        onChange={(sel) => setMiejsceDoceloweLocal(sel)}
                        placeholder="Wpisz miejsce docelowe"
                    />
                    <SubmitButton onClick={() => submitMiejsceDocelowe()}>
                        Zatwierdź
                    </SubmitButton>
                </ContentBar>
            </>

        );
    },
    function DatesPopup({ miejsceDocelowe, setMiejsceDocelowe }) {
        return (
            <>

            </>

        );
    },
    function ParticipantsPicker({ liczbaUczestnikow = 1, setLiczbaUczestnikow, liczbaOpiekunow = 0, setLiczbaOpiekunow, setPopupPickerOpened }) {
        const [liczbaUczestnikowLocal, setLiczbaUczestnikowLocal] = useState(liczbaUczestnikow)
        const [liczbaOpiekunowLocal, setLiczbaOpiekunowLocal] = useState(liczbaOpiekunow)
        function submitParts() {
            if (liczbaUczestnikowLocal < 1 || liczbaOpiekunowLocal < 0) return
            setLiczbaUczestnikow(liczbaUczestnikowLocal)
            setLiczbaOpiekunow(liczbaOpiekunowLocal)
            setPopupPickerOpened(-1)
        }
        return (
            <>
                <TitleBox>
                    <div className="subtitleBox">Uuu, sporo nas</div>
                    <div className="titleBox">Liczba uczestników</div>
                </TitleBox>
                <CounterWrapper>
                    <CounterButton onClick={() => setLiczbaUczestnikowLocal(Math.max(1, (liczbaUczestnikowLocal || 1) - 1))}><Minus size={16} /></CounterButton>
                    <CounterInput type="number" value={liczbaUczestnikowLocal ?? 1} onChange={(e) => setLiczbaUczestnikowLocal(Math.max(1, parseInt(e.target.value) || 1))} min="1" />
                    <CounterButton $primary onClick={() => setLiczbaUczestnikowLocal((liczbaUczestnikowLocal || 1) + 1)}><Plus size={16} /></CounterButton>
                </CounterWrapper>
                <TitleBox>
                    <div className="subtitleBox">Kazdy opiekun to skarb</div>
                    <div className="titleBox">Liczba opiekunów</div>
                </TitleBox>
                <CounterWrapper>
                    <CounterButton onClick={() => setLiczbaOpiekunowLocal(Math.max(0, (liczbaOpiekunowLocal || 0) - 1))}><Minus size={16} /></CounterButton>
                    <CounterInput type="number" value={liczbaOpiekunowLocal ?? 0} onChange={(e) => setLiczbaOpiekunowLocal(Math.max(0, parseInt(e.target.value) || 0))} min="0" />
                    <CounterButton $primary onClick={() => setLiczbaOpiekunowLocal((liczbaOpiekunowLocal || 0) + 1)}><Plus size={16} /></CounterButton>
                </CounterWrapper>
                <SubmitButton onClick={() => submitParts()}>
                    Zatwierdź
                </SubmitButton>
            </>

        );
    },
    function StartPlacePopup({ miejsceDocelowe, setMiejsceDocelowe }) {
        const [miejsceDoceloweLocal, setMiejsceDoceloweLocal] = useState(miejsceDocelowe)
        return (
            <>
                <TitleBox>
                    <div className="subtitleBox">Gdzie rozpoczniemy naszą przygodę?</div>
                    <div className="titleBox">Wybierz miejsce początkowe</div>
                </TitleBox>
                <ContentBar>
                    <MapBox>
                        {!miejsceDoceloweLocal?.location?.lat ? (
                            <div className="alertMap">
                                <Map size={50} />
                                Nie wybrano miejsca początkowego
                            </div>
                        ) : (
                            <LeafletMap
                                lat={miejsceDoceloweLocal.location.lat || 52.5333}
                                lng={miejsceDoceloweLocal.location.lng || 16.9252}
                                zoom={9}
                            />
                        )}
                    </MapBox>

                    <LocationSearch
                        value={miejsceDoceloweLocal?.nazwa || ""}
                        onChange={(sel) => setMiejsceDoceloweLocal(sel)}
                        placeholder="Wpisz miejsce docelowe"
                    />
                </ContentBar>
            </>

        );
    },
    function StartPlacePopup({ miejsceDocelowe, setMiejsceDocelowe }) {
        return (
            <>
                <TitleBox>
                    <div className="subtitleBox">Gdzie rozpoczniemy naszą przygodę?</div>
                    <div className="titleBox">Wybierz miejsce początkowe</div>
                </TitleBox>
                <ContentBar>
                    <MapBox>
                        {!miejsceDocelowe?.location?.lat ? (
                            <div className="alertMap">
                                <Map size={50} />
                                Nie wybrano miejsca początkowego
                            </div>
                        ) : (
                            <LeafletMap
                                lat={miejsceDocelowe.location.lat || 52.5333}
                                lng={miejsceDocelowe.location.lng || 16.9252}
                                zoom={9}
                            />
                        )}
                    </MapBox>

                    <LocationSearch
                        value={miejsceDocelowe?.nazwa || ""}
                        onChange={(sel) => setMiejsceDocelowe(sel)}
                        placeholder="Wpisz miejsce docelowe"
                    />
                </ContentBar>
            </>

        );
    },

];

export const PopupManager = ({
    field = 0,
    setPopupPickerOpened,
    miejsceDocelowe,
    setMiejsceDocelowe,
    setLiczbaOpiekunow, liczbaOpiekunow = 0, liczbaUczestnikow = 1, setLiczbaUczestnikow,
}) => {
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            setPopupPickerOpened(-1);
        }
    };

    // Wybór odpowiedniego „szablonu” z tablicy
    const ActivePopup =
        popups[field] || popups[0]; // fallback na index 0, jeśli field poza zakresem

    return (
        <PopupManagerMainbox onClick={handleBackdropClick}>
            <FieldMainbox>
                <CloseBar>
                    <div
                        className="closeButton"
                        onClick={() => setPopupPickerOpened(-1)}
                    >
                        <X />
                    </div>
                </CloseBar>

                {/* Tytuł możesz docelowo też wynieść do konfiguracji tablicy popups */}


                <ActivePopup
                    miejsceDocelowe={miejsceDocelowe}
                    setMiejsceDocelowe={setMiejsceDocelowe}
                    setPopupPickerOpened={setPopupPickerOpened}
                    setLiczbaOpiekunow={setLiczbaOpiekunow} liczbaOpiekunow={liczbaOpiekunow} liczbaUczestnikow={liczbaUczestnikow} setLiczbaUczestnikow={setLiczbaUczestnikow}
                />
            </FieldMainbox>
        </PopupManagerMainbox>
    );
};
