import { useEffect, useState } from "react";
import { minutesToStringTime } from "../roots/attractionResults";
import LeafletMap from "../roots/googleMapViewer";
import { StarRating } from "../roots/wyborPoleAtrakcja";
import { AtrakcjaResultMid } from "./addActivityPanel";

export const AtrakcjaResultMidComp = ({ radioChosen, dayIndex, setModAct, atrakcja, modActIdx, addActivity, closePanel, addAlert, addToFav }) => {
    const [priceChanged, setPriceChanged] = useState(false)
    useEffect(() => {
        if (atrakcja?.warianty && atrakcja.warianty.length > 0) {
            atrakcja.czasZwiedzania = atrakcja.warianty[0].czasZwiedzania || 60;
            atrakcja.cenaZwiedzania = atrakcja.warianty[0].cenaZwiedzania || 10;
            console.log("TEST3", atrakcja)

        }
        else {
            atrakcja.czasZwiedzania = 60;
            atrakcja.cenaZwiedzania = 0;
        }
        setPriceChanged(true);

    }, [atrakcja])
    function setWariant(idx) {
        atrakcja.czasZwiedzania = atrakcja.warianty[idx].czasZwiedzania || 60;
        atrakcja.cenaZwiedzania = atrakcja.warianty[idx].cenaZwiedzania || 10;
        atrakcja.chosenWariant = atrakcja.warianty[idx].nazwaWariantu;

    }
    return (
        <AtrakcjaResultMid key={`${atrakcja}${priceChanged}`}>
            <div className="mapBox" style={{ pointerEvents: "none" }}>
                {atrakcja.photos.length ? <img src={atrakcja.photos[0]} height={'100%'} width={'100%'} /> :
                    <LeafletMap
                        lat={atrakcja?.lokalizacja?.lat || 52.5333}
                        lng={atrakcja?.lokalizacja?.lng || 16.9252}
                        zoom={11}
                    />
                }
            </div>
            <div className="atrakcjaResultMidName" style={{ marginBottom: '4px', borderBottom: '1px solid gray', paddingBottom: '5px' }}>
                <img src="../icons/color-castle.svg" width="20px" alt="Ikona atrakcji" />

                <div className="doubleName a">
                    {atrakcja.nazwa}
                    <span>{atrakcja.adres}</span>
                </div>
            </div>
            <div className="atrakcjaResultMidName">
                <img src="../icons/time-gray.svg" width="20px" alt="Ikona atrakcji" />

                <div className="doubleName">
                    <span>Czas zwiedzania</span>
                    {atrakcja?.czasZwiedzania && minutesToStringTime(atrakcja.czasZwiedzania) || "60min"}
                </div>
            </div>
            <div className="atrakcjaResultMidName">
                <img src="../icons/icon-ticket.svg" width="20px" alt="Cena" />{" "}
                <div className="doubleName">
                    <span>Cena zwiedzania</span>
                    {atrakcja.cenaZwiedzania == 0 ? "Bezpłatne" : atrakcja.cenaZwiedzania ? atrakcja.cenaZwiedzania + "zł /osoba" : ""}
                </div>
            </div>
            <div className="atrakcjaResultMidName">
                <img src="../icons/icon-stars.svg" width="20px" alt="Ikona atrakcji" />

                <div className="doubleName">
                    <span>Ocena (liczba ocen)</span>
                    <div className="doubleNameRating"> {atrakcja.ocena}<a>({atrakcja.liczbaOpinie})</a></div>
                </div>
            </div>

            {/*}
            <div className="titleBox">
                <img src="../icons/castle.svg" height="15px" />
                {atrakcja.nazwa}
            </div>
            <div className="adresBox">
                <img src="../icons/icon-adres.svg" height="15px" />
                {atrakcja.adres}
            </div>
            <div className="ratingBox">
                <StarRating rating={atrakcja.ocena} />
                {atrakcja.ocena} <a>({atrakcja.liczbaOpinie})</a>
            </div>
            <div className="timeBox">
                <img src="../icons/icon-time.svg" height="15px" />
                {atrakcja?.czasZwiedzania || "60min"}
            </div>
            <div className="timeBox">
                <img src="../icons/icon-ticket.svg" height="15px" />
                {atrakcja?.cenaZwiedzania || "Bezpłatne"}
            </div>
            <div className="buttonsBox">
                <div
                    className="operationButton a"
                    onClick={e => {
                        e.stopPropagation();
                        setModAct({ flag: false, dayIdx: null, idx: null });
                        if (!modActIdx && modActIdx !== 0) {
                            addActivity(dayIndex, atrakcja);
                        } else {
                            addActivity(dayIndex, modActIdx, atrakcja);
                            closePanel();
                        }
                        addAlert(atrakcja.nazwa);
                    }}
                >
                    <img src="../icons/plus-white.svg" height="20px" />
                </div>
                <div
                    className="operationButton b"
                    onClick={() => addToFav(atrakcja)}
                >
                    <img src="../icons/icon-serce.svg" height="20px" />
                </div>

            </div>
            */}
            <div style={{ flex: '1' }} />
            <div className="addActivityAddButton"
                onClick={e => {
                    e.stopPropagation();
                    setModAct({ flag: false, dayIdx: null, idx: null });
                    if (!modActIdx && modActIdx !== 0) {
                        addActivity(dayIndex, atrakcja);
                    } else {
                        addActivity(dayIndex, modActIdx, atrakcja);
                        closePanel();
                    }
                    addAlert(atrakcja.nazwa);
                }}
            >
                {!modActIdx ? "+ Dodaj do dnia" : "Wybierz"}
            </div>
        </AtrakcjaResultMid>
    )
}
