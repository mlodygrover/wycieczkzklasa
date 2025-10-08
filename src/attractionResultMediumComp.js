import React, { use, useEffect, useRef, useState } from "react";
import { useMapEvent } from "react-leaflet";
import styled from "styled-components";
import { minutesToStringTime } from "./roots/attractionResults";

const AttractionResultMedium = styled.div`
    width: 90%;
    max-width: 300px;
    min-height: 200px;
    background-color: #fbfbfb;
    border-radius: 15px;
    border: 1px solid lightgray;
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    padding-bottom: 10px;
    .attractionResultMediumTitleBox{
        margin-top:  5px;
        width: 100%;
        min-height: 50px;
        display: flex;
        flex-direction: row;
        align-items: stretch;
        justify-content: flex-start;
        .titleIconBox{
            width: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
        
        }
        .titleTextBox{
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: center;
            padding: 10px 0;
            .attractionResultMediumTitle{
                font-size: 16px;
                width: 100%;
                text-align: left;
                font-family: Inter, system-ui, -apple-system, sans-serif;
            }
            .attractionResultMediumSubtitle{
                font-size: 12px;
                color: #606060;
                font-weight: 300;
                text-align: left;
            }
        }
        
    }
    .attractionResultMediumDetails{
        flex: 1;
        width: 90%;
        box-sizing: border-box;
        margin: 10px auto;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: stretch;
        .attractionResultMediumDetailRow{
            width: 100%;
            height: 30px;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            color: #505050;
            font-size: 12px;
            font-weight: 400;
            .detailRowElement{
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 5px;
                span{
                    font-size: 11px;
                }
                &.b{
                    border: 1px solid lightgray;   
                    padding: 2px 4px;
                    border-radius: 999px; 
                    background-color: #f4f4f4;
                    cursor: pointer;
                    transition: 0.3s ease-in-out;
                    a{
                        text-decoration: none;
                        color: inherit;
                    }
                    &:hover{
                        background-color: #e0e0e0;
                    }
                }
                &.c{
                    margin-top: 10px;
                    padding: 2px 6px;
                    border-radius: 5px; 
                    background-color: #cfffe4ff;
                    color: #006553ff;
                    font-weight: 400;
                   
                }
            }
        }

    }
    .attractionResultMediumAddBox{
        height: 30px;
        width: 90%;
        background-color: #008d73ff;
        margin: 3px auto;
        border-radius: 5px;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: 0.3s ease-in-out;
        box-sizing: border-box;
        
        &:hover{
            background-color: #007a61ff;
        }
    }
    .wariantButton{
        height: 30px;
        width: 90%;
        background-color: #222f7dff;
        margin: 3px auto;
        border-radius: 5px;
        color: #eeefffff;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        font-size: 12px;
        cursor: pointer;
        position: relative;
        font-weight: 500;
        gap: 4px;
        font-family: Inter, system-ui, -apple-system, sans-serif;
        transition: background-color 0.3s ease;
        &.opened{
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;
            box-shadow: 2px 2px 2px #222f7dff;
            &:hover{
                background-color: #222f7dff;
            }
        }

        .wariantsResults {
            position: absolute;
            width: calc(100%);
            top: 100%;
            background-color: red;
            height: 0px;
            background-color: #222f7dff;
            overflow: hidden;
            
            box-shadow: 2px 1px 2px #222f7dff;
            transition: 0.3s ease;
            &.opened{
                min-height: 100px;
                height: fit-content;
                border-bottom-left-radius: 5px;
                border-bottom-right-radius: 5px;
            }
        }
        .wariantResult{
            height: 25px;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: 0.3s ease-in-out;
            &:hover{
            background-color: #444f8eff;    
            }
        }
        &:hover{
            background-color: #333f8eff;
        }
    }
`
const AttractionResultMediumComponent = ({
    atrakcja,
    wybranyDzien,
    addActivity,
    wariantResultsOpened,
}) => {


    const [wariantsOpened, setWariantsOpened] = useState(false)
    const wariantButtonRef = useRef(null);

    // ✅ Zamknij dropdown po kliknięciu poza przyciskiem/obszarem wariantów
    useEffect(() => {
        function handleClickOutside(event) {
            if (
                wariantButtonRef.current &&
                !wariantButtonRef.current.contains(event.target)
            ) {
                setWariantsOpened(false);
            }
        }

        if (wariantsOpened) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wariantsOpened]);

    useEffect(() => {
        if (atrakcja.warianty.length > 0) {
            atrakcja.czasZwiedzania = atrakcja.warianty[0].czasZwiedzania || 60;
            atrakcja.cenaZwiedzania = atrakcja.warianty[0].cenaZwiedzania || 10;
        }
        else {
            atrakcja.czasZwiedzania = 60;
            atrakcja.cenaZwiedzania = 0;
        }
        atrakcja.nazwa == "Termy Maltańskie" && console.log(atrakcja);

    }, [atrakcja])
    function setWariant(idx) {
        atrakcja.czasZwiedzania = atrakcja.warianty[idx].czasZwiedzania || 60;
        atrakcja.cenaZwiedzania = atrakcja.warianty[idx].cenaZwiedzania || 10;
        atrakcja.chosenWariant = atrakcja.warianty[idx].nazwaWariantu;

    }
    return (
        <AttractionResultMedium key={atrakcja.googleId + "bok"}>
            <div className="attractionResultMediumTitleBox">
                <div className="titleIconBox">
                    <img src="../icons/color-castle.svg" width="20px" alt="Ikona atrakcji" />
                </div>
                <div className="titleTextBox">
                    <div className="attractionResultMediumTitle">{atrakcja.nazwa}</div>
                    <div className="attractionResultMediumSubtitle">{atrakcja.adres}</div>
                </div>
            </div>

            <div className="attractionResultMediumDetails">
                <div className="attractionResultMediumDetailRow">
                    <div className="detailRowElement">
                        <img src="../icons/icon-time.svg" width="20px" alt="Czas zwiedzania" />{" "}
                        {minutesToStringTime(atrakcja.czasZwiedzania) || "1h 30min"}
                    </div>
                    <div className="detailRowElement">
                        <img src="../icons/icon-ticket.svg" width="20px" alt="Cena" />{" "}
                        {atrakcja.cenaZwiedzania == 0 ? "Bezpłatne" : atrakcja.cenaZwiedzania ? atrakcja.cenaZwiedzania + "zł /osoba" : ""}
                    </div>
                </div>

                <div className="attractionResultMediumDetailRow">
                    <div className="detailRowElement">
                        <img src="../icons/icon-stars.svg" width="20px" alt="Ocena" /> {atrakcja.ocena}{" "}
                        <span>({atrakcja.liczbaOpinie})</span>
                    </div>
                    <div className="detailRowElement b">
                        <img src="../icons/link.svg" width="20px" alt="Link" />{" "}
                        <a href={atrakcja?.stronaInternetowa} target="_blank" rel="noreferrer">
                            Witryna
                        </a>
                    </div>
                </div>

                <div className="attractionResultMediumDetailRow">
                    <div className="detailRowElement c">
                        <img src="../icons/success.svg" width="20px" alt="Przewodnik" /> Dostępne z przewodnikiem
                    </div>
                </div>
            </div>
            {atrakcja.warianty.length > 0 &&
                <div className={wariantsOpened ? "wariantButton opened" : "wariantButton"} onClick={() => setWariantsOpened(!wariantsOpened)} ref={wariantButtonRef}>
                    <img src="../icons/filterViolet.svg" height={'15px'}></img>{atrakcja.chosenWariant && !wariantsOpened ? atrakcja.chosenWariant : "Wybierz wariant"}
                    <div className={wariantsOpened ? "wariantsResults opened" : "wariantsResults"}>
                        {atrakcja.warianty.map((wariant, idx) => (
                            <div className="wariantResult" key={atrakcja.googleId + "wariant" + idx} onClick={() => { setWariant(idx); setWariantsOpened(false); }}>
                                {wariant.nazwaWariantu}
                            </div>

                        ))}
                    </div>
                </div>
            }

            <div
                className="attractionResultMediumAddBox"
                onClick={() => addActivity(wybranyDzien, atrakcja)}
            >
                + Dodaj do dnia
            </div>
        </AttractionResultMedium>
    );
};

export default AttractionResultMediumComponent;
