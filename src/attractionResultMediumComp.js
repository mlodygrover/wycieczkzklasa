import React, { use, useEffect, useRef, useState } from "react";
import { useMapEvent } from "react-leaflet";
import styled from "styled-components";
import { minutesToStringTime } from "./roots/attractionResults";
import VariantButton from "./variantButton";

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
    &.baseVersion{
        min-height: 120px;
    }
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
        background-color: #f0f0f0ff;
        /*background: linear-gradient(90deg, rgba(184, 104, 0, 1) 0%, rgba(219, 187, 72, 1) 100%);*/
        margin: 3px auto;
        border-radius: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        color: #606060;
        font-size: 13px;
        font-weight: 400;
        cursor: pointer;
        position: relative;
        gap: 4px;
        font-family: Inter, system-ui, -apple-system, sans-serif;
        transition: background-color 0.3s ease;
        &.opened{
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;
            box-shadow: 2px 2px 2px lightgray;
            &:hover{
                background-color: #eaeaea;
            }
        }

        .wariantsResults {
            position: absolute;
            width: calc(100%);
            top: 100%;
            background-color: red;
            height: 0px;
            background-color: #eaeaea;
            overflow: hidden;
            box-shadow: 2px 2px 2px lightgray;
            transition: 0.3s ease;
            margin-top: -1px;
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
            background-color: #d5d5d5ff;    
            }
        }
        &:hover{
            background-color: #d5d5d5ff;
        }
    }
`
const AttractionResultMediumComponent = ({
    atrakcja,
    wybranyDzien,
    addActivity,
    wariantResultsOpened,
    baseVersion
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
        if (atrakcja?.warianty && atrakcja.warianty.length > 0) {
            atrakcja.czasZwiedzania = atrakcja.warianty[0].czasZwiedzania || 60;
            atrakcja.cenaZwiedzania = atrakcja.warianty[0].cenaZwiedzania || 0;
        }
        else {
            atrakcja.czasZwiedzania = 60;
            atrakcja.cenaZwiedzania = 0;
        }


    }, [atrakcja])
    const [selectedVariant, setSelectedVariant] = useState(null)
    function setWariant(idx) {
        setSelectedVariant(idx)
        atrakcja.czasZwiedzania = atrakcja.warianty[idx].czasZwiedzania || 60;
        atrakcja.cenaZwiedzania = atrakcja.warianty[idx].cenaZwiedzania || 0;
        atrakcja.chosenWariant = atrakcja.warianty[idx].nazwaWariantu;
        atrakcja.selectedVariant = idx;
    }
    return (
        <AttractionResultMedium key={`${atrakcja.googleId}${atrakcja.cenaZwiedzania}${selectedVariant}`} className={baseVersion ? "baseVersion" : ""}>
            <div className="attractionResultMediumTitleBox">
                <div className="titleIconBox">
                    {baseVersion ? <img src="../icons/park-color.svg" width="20px" alt="Ikona atrakcji" /> : <img src="../icons/color-castle.svg" width="20px" alt="Ikona atrakcji" />}
                </div>
                <div className="titleTextBox">
                    <div className="attractionResultMediumTitle">{atrakcja.nazwa}</div>
                    <div className="attractionResultMediumSubtitle">{atrakcja.adres}</div>
                </div>
            </div>
            {!baseVersion &&
                <div className="attractionResultMediumDetails">
                    <div className="attractionResultMediumDetailRow">
                        <div className="detailRowElement">
                            <img src="../icons/icon-time.svg" width="20px" alt="Czas zwiedzania" />{" "}
                            {atrakcja?.czasZwiedzania && minutesToStringTime(atrakcja.czasZwiedzania) || "1h 30min"}
                        </div>
                        {
                            (!Array.isArray(atrakcja?.warianty) || atrakcja.warianty.length === 0)
                                ? "Dodaj aby obliczyć"
                                : atrakcja?.cenaZwiedzania === 0
                                    ? "Bezpłatne"
                                    : atrakcja?.cenaZwiedzania != null
                                        ? `${Number(atrakcja.cenaZwiedzania)} zł / osoba`
                                        : ""
                        }

                    </div>

                    <div className="attractionResultMediumDetailRow">
                        <div className="detailRowElement">
                            <img src="../icons/icon-stars.svg" width="20px" alt="Ocena" /> {atrakcja.ocena}{" "}
                            <span>({atrakcja.liczbaOpinie})</span>
                        </div>
                        {atrakcja.stronaInternetowa &&
                            <div className="detailRowElement b">
                                <img src="../icons/link.svg" width="20px" alt="Link" />{" "}
                                <a href={atrakcja?.stronaInternetowa} target="_blank" rel="noreferrer">
                                    Witryna
                                </a>
                            </div>
                        }
                    </div>

                    <div className="attractionResultMediumDetailRow">
                        <div className="detailRowElement c">
                            <img src="../icons/success.svg" width="20px" alt="Przewodnik" /> Dostępne z przewodnikiem
                        </div>
                    </div>
                </div>
            }
            {atrakcja?.warianty && atrakcja.warianty.length > 1 &&
                <>
                    {/*
                <div className={wariantsOpened ? "wariantButton opened" : "wariantButton"} onClick={() => setWariantsOpened(!wariantsOpened)} ref={wariantButtonRef}>
                    <img src="../icons/filterViolet.svg" height={'15px'}></img>{atrakcja.chosenWariant && !wariantsOpened ? atrakcja.chosenWariant : "Wybierz wariant"}
                    <div className={wariantsOpened ? "wariantsResults opened" : "wariantsResults"}>
                        {atrakcja.warianty.map((wariant, idx) => (
                            <div className="wariantResult" key={atrakcja.googleId + "wariant" + idx} onClick={() => { setWariant(idx); setWariantsOpened(false); }}>
                                {wariant.nazwaWariantu}
                            </div>

                        ))}
                    </div>
                </div>*/}
                    <VariantButton variants={atrakcja.warianty} onSelect={setWariant} selectedVariantInit={selectedVariant} />
                </>
            }
            <div style={{ flex: 1 }} />
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
