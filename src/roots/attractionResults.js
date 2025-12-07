import { act, use, useEffect, useState, useRef } from "react"
import styled from "styled-components"
import LeafletMap from "./googleMapViewer"
import { MapaBox } from "../konfiguratorWyjazdu"
import { da } from "date-fns/locale"
import { timeToMinutes } from "../konfiguratorMain"
import { minutesToTime } from "../konfigurator/konfiguratorWyjazduComp"
import React from "react"
import { Loader2 } from "../loader2"
import { Clock, MapPin, Ticket, Users, Bus, Car, Train, ChevronUp, ChevronDown, Trash2, RefreshCw, Route, Landmark, Drama, Brush, Shrub, Plane, Bed } from 'lucide-react';
import VariantButton from "../variantButton"

const GooglePopupCardMainbox = styled.div`
    position: absolute;
    top: 0;
    right: -100px;
    width: 100px;
    height: 20px;
    background-color: red;
`
export const GooglePopupCard = ({ }) => {
    return (
        <GooglePopupCardMainbox>

        </GooglePopupCardMainbox>
    )
}



const AttractionResultSmallMainbox = styled.div`
    width: 100%;
    min-height: ${props => (props.opened ? "300px" : "50px")};
    border-radius: 3px;
    background-color: #f4f4f4;
    border-left: 3px solid orange;
    transition: 0.3s ease-in-out;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: flex-start;;
    justify-content: flex-start;
    padding: 5px;
    gap: 2px;
    position: relative;

    .attractionResultSmallTop{
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        height: 50px;
        gap: 2px;
    }

    &:hover{
        border-left: 6px solid orange;
        background-color: #e9e9e9;
        padding-left: 3px;
        
    }

    .resultImg{
        width: 30px;
        height: 30px;
    }

    .resultBoxOpened{
        display: ${props => (props.opened ? "flex" : "none")};
        width: 100%;
        height: 100%;
        .buttonsBox{
    width: 90%;
    height: 30px;
    margin-top: 20px;
    padding: 10px;
    gap: 10px;
    display: flex;
    flex-direction: row;
    align-items: stretch;
    justify-content: flex-start;
    margin: auto;
    padding-bottom: 0;
    .operationButton{
        flex: 1;
        
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        cursor: pointer;
        transition: 0.3s ease-in-out;
        &.a{
            background-color: #e3e7ff;
            &:hover{
                background-color: #d2d6ee;
            }
        }
        &.b{
            background-color: #ffe3e6;
            &:hover{
                background-color: #eed2d5;
            }
        }
        &.c{
            background-color:  #fff4de;
            &:hover{
                background-color: #eee3cd;
            }
       
        }
    }
   }
    }

    .resultTextBox{
        height: 100%;
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        text-align: left;

        .attractionTitle{
            
            text-align: left;
            font-size: 15px;
            font-weight: 300;
            overflow: hidden;
            text-wrap: nowrap;
            max-width: 220px;
        }
        .attractionAdres{
            font-size: 12px;
            font-weight: 300;
            overflow: hidden;
            text-wrap: nowrap;
            max-width: 220px;
        }


        .attractionStats{
        display: flex;
        flex-direction: row;
        width: 100%;   
        gap: 5px; 
        margin-top: 3px;

        .attractionStat{
            flex: 1;
            max-width: fit-content;
            display: flex;
            align-items: center;
            justify-content: flex-start;

            span{
                margin-left: 2px;
                font-size: 10px;
                cursor: pointer;
                font-weight: 300;
                text-wrap: nowrap;
                overflow: hidden;
            }
            
        }
        

    }   
    
    
   
    
`



export const AttractionResultSmall = ({ icon = "../icons/castle.svg", attraction = { googleId: "abcd", nazwa: "Ratusz Poznański Ratusz Poznańsk Ratusz Poznańsk", adres: "Stary Rynek 40", czasZwiedzania: null, cenaZwiedzania: null }, onClick }) => {
    const [opened, setOpened] = useState(false)
    return (

        <AttractionResultSmallMainbox opened={opened}
            onClick={() => {
                setOpened(!opened);
                // wywołuje funkcję i przekazuje atrakcję
            }}
        >
            <div className="attractionResultSmallTop">
                <div className="resultImg">
                    <img src={icon} height={'100%'} />
                </div>
                <div className="resultTextBox">
                    <div className="attractionTitle">
                        {attraction.nazwa}
                    </div>
                    <div className="attractionAdres">
                        {attraction.adres}
                    </div>
                    <div className="attractionStats">
                        <div className="attractionStat">
                            <img src={"../icons/icon-time.svg"} width={'16px'} />

                            <span>{attraction.czasZwiedzania ? attraction.czasZwiedzania : "Kliknij aby sprawdzić"}</span>
                        </div>
                        <div className="attractionStat">
                            <img src={"../icons/icon-ticket.svg"} width={'16px'} />
                            <span>{attraction.cenasZwiedzania ? attraction.cenaZwiedzania : "Kliknij aby sprawdzić"}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="resultBoxOpened">
                <div className="buttonsBox">
                    <div className="operationButton a" onClick={() => onClick?.(attraction)}>
                        <img src="../icons/icon-plus.svg" height="20px" />
                    </div>
                    <div className="operationButton b">
                        <img src="../icons/icon-serce.svg" height="20px" />
                    </div>
                    <div className="operationButton c">
                        <img src="../icons/icon-mark1.svg" height="20px" />
                    </div>
                </div>

            </div>




        </AttractionResultSmallMainbox>

    )
}

const AttractionResultFullMainbox = styled.div`
  

    width: 100%;
    font-family: 'Inter';
    
    min-height: 150px;
    height: fit-content;
    display: flex;
    flex-direction: row;
    align-items: stretch;
    justify-content: flex-start;
    background-color: white;
    padding: 10px;
    border-radius: 10px;
    border: 1px solid lightgray;
    margin: 0;
    box-sizing: border-box;
    box-shadow: 0 0 5px lightgray;
    .buttonFullNav{
        display: flex;
        flex-direction: row;
        gap: 5px;
        flex-wrap: wrap;
        
    }
    &.baseAct{
        border-left: 5px solid #f42582;
    }
    input[type=range] {
        -webkit-appearance: none;
        /* Hides the slider so that custom slider can be made */
        appearance: none;
        width: 100%;
        /* Specific width is required for Firefox. */
        background: transparent;
        /* Otherwise white in Chrome */
    }

    input[type=range]::-webkit-slider-thumb {
        -webkit-appearance: none;
        background-color: #ffffff;
        height: 20px;
        width: 7px;
        border-radius: 90000px;
        border: 1px solid black;
        margin-top: -10px;
    }

    input[type=range]::-webkit-slider-runnable-track {
        width: 100%;
        height: 0px;
        border: 1px solid black;
        cursor: pointer;
        background: #a93030;
    }

    .photoPart{
        width: 30%;
        height: 150px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #f0f0f0;
        border-radius: 10px;
        position: relative;
        .photoSlide{
            width: 100%;
            height: 100%;
            border-radius: 10px;
            overflow: hidden;
            margin-left: auto;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .photoAddress{
            position: absolute;
            width: 98%;
            bottom: 5px;
            padding: 2px;
            box-shadow: 0 0 5px gray;;
            box-sizing: border-box;
            border: 1px solid lightgray;
            background-color: white;
            border-radius: 5px;
            z-index: 99999;
            font-size: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 500;
            color: #606060;

        }
            .mapOverlay {
                font-family: 'Inter';
                font-weight: 500;
                position: absolute;
                bottom: 8px;
                left: 8px;
                right: 8px;
                background: rgba(255, 255, 255, 0.95);
                padding: 6px 10px;
                border-radius: 6px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.34);
                z-index: 500;
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 12px;
                color: #666;
                backdrop-filter: blur(4px);
                
                svg {
                    width: 14px;
                    height: 14px;
                    color: #22c55e;
                    flex-shrink: 0;
                }
                
                span {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
            }
    }

    .descPart
    {
        margin-left: auto;
        width: 68%;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        gap: 2px;
        min-height: fit-content;
       
        .attractionStats{
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: 300;
            .activityTime {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 14px;
                font-weight: 600;
                color: #1aa04bff;
                background: #f0fdf4;
                padding: 6px 12px;
                border-radius: 8px;
            }
        }
        .attractionBorder{
            width: 100%;
            height: 1px;
            background-color: lightgray;
            margin: 6px auto;
        }
        .attractionTitle{
            font-size: 16px;
            color: #505050;
            font-weight: 500;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: flex-start;
            gap: 6px;
            text-align: left;
            .titlePic{
                background-color: #22c55e;
                padding: 3px;
                border-radius: 5px;    
                display: flex;
                align-items: center;
                justify-content: center;       
                color: white;
            }
           
        }
        .attractionAdres{
            font-size: 12px;
            font-weight: 300;
            color: #505050;

        }
        .inputEtykieta
        {
            flex: 1;
            font-size: 12px;
            text-wrap: nowrap;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: center;
            font-weight: 300;
            color: #505050;

            .zaplanowanyCzas{
                font-weight: 400;
            }

        }
        
    }
    
    .actionButtons {
        display: flex;
        gap: 4px;
        transition: opacity 0.2s;
    }
    
    .actionButton {
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #e0e0e0;
        background: white;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
        padding: 0;
        box-sizing: border-box;
        @media screen and (max-width: 600px){
            width: 40px;
            height: 40px;
        }
        
        svg {
        width: 16px;
        height: 16px;
        color: #666;
        }
        
        &:hover {
        border-color: #4ade80;
        background: #f0fdf4;
        
        svg {
            color: #22c55e;
        }
        }
        
        &.danger:hover {
        border-color: #ef4444;
        background: #fef2f2;
            
            svg {
                color: #ef4444;
            }
        }
        
        &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
        
        &:hover {
            border-color: #e0e0e0;
            background: white;
            
            svg {
                color: #666;
            }
        }
        
    }
    }

    @media screen and (max-width: 1200px)
    {   display: none;
        flex-direction: column;
        height: 450px;
        width: 100%;
        .photoPart
        {   height: 60%;
            width: 100%;
        }
        .descPart{
            margin-top: auto;
            height: 35%;
            min-height: fit-content;
            width: 100%;
        }
   
        
    }
    


`
const AttractionResultFullOutbox = styled.div`
    display: flex;
    flex-direction: row;
    align-items: stretch;
    justify-content: flex-end;
    width: 100%;
    
    gap: 10px;



`


const IncreaseButton = styled.div`
  aspect-ratio: 1 / 1;
  height: 75%;
  background-color: #1aa04bff;
  display: flex;
  align-items: center;   /* pionowe wyśrodkowanie */
  justify-content: center !important;  /* poziome wyśrodkowanie */
  text-align: center;   /* fallback dla samego tekstu */
  color: white;
  border-radius: 5px;
  margin: 2px;

  transition: 0.3s ease-in-out;

  &:hover{
    background-color: #127035ff;
    cursor: pointer;

  }

  /* upewnij się, że nic z rodzica nie psuje layoutu */
  flex-shrink: 0; /* nie pozwól, aby button się ściskał */
`;

const iconsTab = { baseHotelIn: "../icons/gosleep.svg" }
export const AttractionResultFull = ({
    changeStartHour,
    attractionTime,
    onAttractionTimeChange,
    lastIdx,
    dayIdx,
    actIdx,
    swapActivities,
    time,
    attraction,
    startModifyingAct,
    deleteActivity,
    checkOut = 720, 
    changeActivity
}) => {
    const [localTime, setLocalTime] = useState(attraction.czasZwiedzania === null ? 55 : attraction.czasZwiedzania);
    const [localStartTime, setLocalStartTime] = useState(timeToMinutes(time || "08:00"))
    useEffect(() => {
        if (actIdx == 0) {
            // Debounce: aktualizujemy globalny stan dopiero po 300ms od ostatniej zmiany
            const handler = setTimeout(() => {
                changeStartHour(dayIdx, localStartTime)
            }, 700);

            // Czyszczenie poprzedniego timeoutu przy każdej zmianie localTime
            return () => clearTimeout(handler);
        }
    }, [localStartTime]);
    useEffect(() => {
        setLocalStartTime(timeToMinutes(time))
    }, [time])

    const prevLocalTime = useRef(localTime);

    useEffect(() => {

        // jeśli wartość się nie zmieniła — zakończ efekt
        if (prevLocalTime.current === localTime) {
            return;
        }

        prevLocalTime.current = localTime; // aktualizujemy poprzednią wartość

        let isCancelled = false;
        const handler = setTimeout(async () => {
            try {
                if (!isCancelled && typeof onAttractionTimeChange === "function") {
                    await onAttractionTimeChange(dayIdx, actIdx, localTime);
                }
            } catch (err) {
                console.error("❌ Błąd przy aktualizacji czasu atrakcji:", err);
            }
        }, 700);

        return () => {
            isCancelled = true;
            clearTimeout(handler);
        };
    }, [localTime]);

    function changeVariant(idx){
        if(!attraction?.warianty || attraction?.warianty.length < idx + 1)return
        let tmpAttraction = attraction;
        tmpAttraction.czasZwiedzania = attraction.warianty[idx].czasZwiedzania || 60;
        tmpAttraction.cenaZwiedzania = attraction.warianty[idx].cenaZwiedzania || 0;
        tmpAttraction.selectedVariant = idx;
        changeActivity(dayIdx, actIdx, tmpAttraction);
    }


    return (
        <AttractionResultFullOutbox key={attraction.id || actIdx}>

            <AttractionResultFullMainbox className={attraction.googleId != "baseAct" ? "" : "baseAct"}>
                <div className="photoPart">
                    <div className="photoSlide" style={{ pointerEvents: "none" }}>
                        {attraction.googleId != "baseAct"
                            ?
                            attraction.googleId == "baseHotelIn" ?
                                <img src={"../icons/gosleep2.svg"} height={'70%'} style={{ margin: 'auto' }} />
                                :
                                attraction.googleId == "baseHotelOut" ?
                                    <img src={"../icons/wakeup.svg"} height={'70%'} style={{ margin: 'auto' }} />
                                    :
                                    attraction.googleId == "baseRouteTo" ?
                                        <img src={"../icons/departure.svg"} height={'70%'} style={{ margin: 'auto' }} />
                                        :
                                        attraction.googleId == "baseRouteFrom" ?
                                            <img src={"../icons/arrival.svg"} height={'70%'} style={{ margin: 'auto' }} />
                                            :
                                            attraction.googleId == "baseBookIn" ?
                                                <img src={"../icons/bookIn.svg"} height={'70%'} style={{ margin: 'auto' }} />
                                                :
                                                attraction.googleId == "baseBookOut" ?
                                                    <img src={"../icons/bookOut.svg"} height={'70%'} style={{ margin: 'auto' }} />
                                                    :

                                                    <LeafletMap
                                                        key={`${attraction?.lokalizacja?.lat}-${attraction?.lokalizacja?.lng}`}
                                                        lat={attraction?.lokalizacja?.lat || 52.5333}
                                                        lng={attraction?.lokalizacja?.lng || 16.9252}
                                                        zoom={9}
                                                    />
                            :
                            <img src={attraction.icon} height={'100%'} style={{ margin: 'auto' }} />
                        }
                        {!attraction.googleId?.includes("base") && !attraction.googleId?.includes("dAct_") &&(
                            <>

                                <div className="mapOverlay">
                                    <MapPin />
                                    <span>{attraction.adres}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
                <div className="descPart">

                    <div className="attractionTitle">
                        <div className="titlePic">{attraction.googleId.includes("event") ? <Drama size={20}/> : attraction.googleId.includes("dAct") ? <Shrub size={20}/> : attraction.googleId.includes("Route") ? <Plane size={20}/>:attraction.googleId.includes("Hotel") || attraction.googleId.includes("Book")? <Bed size={20}/>: <Landmark size={20}/>}</div>{attraction?.nazwa || "brak danych"}
                    </div>

                    <div className="attractionBorder">

                    </div>

                    <div className="attractionStats">
                        {actIdx == 0 && <IncreaseButton onClick={() => setLocalStartTime((localStartTime - 10) % 1440)}><img src="../icons/minus-white.svg" height={'15px'} /></IncreaseButton>}
                        <div className="activityTime">
                            <Clock size={16} />
                            {isNaN(minutesToTime(localStartTime)) ? minutesToTime(localStartTime % 1440) : <Loader2 />}
                        </div>

                        {actIdx == 0 && <IncreaseButton onClick={() => setLocalStartTime(localStartTime + 10 < checkOut ? (localStartTime + 10) % 1440 : localStartTime)} > <img src="../icons/plus-white.svg" height="15px" alt="Zwiększ" /> </IncreaseButton>}

                        {attraction?.czasZwiedzania != 0 &&
                            <>
                                <input
                                    type="range"
                                    max="360"
                                    step="10"
                                    value={localTime}
                                    onChange={(e) => setLocalTime(Number(e.target.value))}
                                />
                                <div className="inputEtykieta">
                                    <div>Zaplanowany czas</div>
                                    <div className="zaplanowanyCzas">{minutesToStringTime(localTime)}</div>
                                </div>
                            </>
                        }

                    </div>
                    <div className="attractionBorder">

                    </div>


                    {!["baseRouteTo", "baseRouteFrom", "baseHotelIn", "baseHotelOut"].includes(attraction.googleId) && (
                        <div className="buttonFullNav">
                            <div className="actionButtons">
                                <button
                                    className="actionButton"
                                    title="Przesuń w górę"
                                    disabled={actIdx <= 1}
                                    onClick={async () => {
                                        if (actIdx === 0) return;
                                        try {
                                            await swapActivities(dayIdx, actIdx, actIdx - 1);
                                        } catch (err) {
                                            console.error("❌ Błąd podczas zamiany atrakcji:", err);
                                        }
                                    }}
                                >
                                    <ChevronUp />
                                </button>

                                <button
                                    className="actionButton"
                                    title="Przesuń w dół"
                                    disabled={actIdx >= lastIdx - 1}   // jeżeli chcesz zablokować na końcu
                                    onClick={async () => {
                                        if (actIdx !== lastIdx) {
                                            try {
                                                await swapActivities(dayIdx, actIdx + 1, actIdx);
                                            } catch (err) {
                                                console.error("❌ Błąd zamiany w dół:", err);
                                            }
                                        }
                                    }}
                                >
                                    <ChevronDown />
                                </button>

                                <button
                                    title="Zamień na inną"
                                    className="actionButton"
                                    onClick={() => startModifyingAct(dayIdx, actIdx)}
                                    disabled={["baseBookOut", "baseBookIn"].includes(attraction.googleId)}
                                >
                                    <RefreshCw />
                                </button>

                                <button
                                    className="actionButton danger"
                                    title="Usuń"
                                    disabled={["baseBookOut", "baseBookIn"].includes(attraction.googleId)}
                                    onClick={() => deleteActivity(dayIdx, actIdx)}
                                >
                                    <Trash2 />
                                </button>

                            </div>
                            {
                                attraction?.warianty && attraction?.warianty.length > 1 ? <VariantButton variants={attraction.warianty} selectedVariantInit={attraction?.selectedVariant || attraction.selectedVariant === 0 ? attraction.selectedVariant : null} onSelect={changeVariant} source={true} /> : ""
                            }
                        </div>
                    )}



                </div>
            </AttractionResultFullMainbox>
        </AttractionResultFullOutbox>
    );
};


const RouteResultMainbox = styled.div`
    flex: 1;
     display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 5px;
    margin-left: -40px;
    
    
    
`
const RouteResultButton = styled.div`
    height: 40px;
    max-width: 50px;
    border-radius: 5px;
    cursor: pointer;
    flex: 1;
    text-wrap: nowrap;
    transition: 0.3s ease-in-out;
    
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    border-bottom: 2px solid transparent;
    border-bottom-right-radius: 0px;

        border-bottom-left-radius: 0px;
    &:hover, &.checked{
          border-bottom: 2px solid orange;
    }

`
const RouteResultOutbox = styled.div`
    width: 100%;
    max-width: 1000px;
    height: 50px;
    background-color: #fafafa;
    border-radius: 10px;
    border: 1px solid #eaeaea;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: 5px;
    
    .routeImgBox{
        width: 30px;
        height: 30px;
        margin-left: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        img{
        height: 100%;
        width: 100%;}
    
    }
    @media screen and (max-width: 1200px){
        width: 100%;
        height: 33px;
        background-color: transparent;
        border: none;
    }
`
const RouteResultButtonLabel = styled.label`
    height: 40px;
    max-width: 50px;
    border-radius: 5px;
    cursor: pointer;
    flex: 1;
    text-wrap: nowrap;
    transition: 0.3s ease-in-out;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    border-bottom: 2px solid transparent;
    border-bottom-right-radius: 0px;
    border-bottom-left-radius: 0px;

    &:hover {
        border-bottom: 2px solid #008d73ff;
    }

    input[type="radio"]:checked + & {
        border-bottom: 2px solid #008d73ff;
        
    }
    @media screen and (max-width: 1200px){
        height: 100%;
        font-size: 9px;
        border-radius: 5px;
        padding: 2px;
        box-sizing: border-box;
            &:hover {
                border-bottom: 2px solid transparent;
            }
        input[type="radio"]:checked + & {
            border-bottom: 2px solid transparent;
            background-color: #f0f0f0;
        }
    }
`;


export const minutesToStringTime = (t) => {
    if (t <= 60) {
        return `${t}min`;
    } else {
        const hours = Math.floor(t / 60);
        const minutes = t % 60;
        return minutes > 0
            ? `${hours}h ${minutes}min`
            : `${hours}h`;
    }
}
export const RouteResult = ({ routes, onTransportChange, actIdx, dayIdx, chosenTransport }) => {
    const [localChosen, setLocalChosen] = useState(chosenTransport);

    const handleChange = (idx) => {
        setLocalChosen(idx);
        onTransportChange(dayIdx, actIdx, idx);
    };

    if (!routes?.czasy || !routes.czasy.some((c) => c > 0)) {
        return null;
    }

    const options = [
        { idx: 0, icon: "../icons/pedestrian.svg", label: "Pieszo", visible: routes.czasy[0] < 180 },
        { idx: 1, icon: "../icons/icon-public-trannsport.svg", label: "Komunikacja" },
        { idx: 2, icon: "../icons/bus.svg", label: "Auto" },
    ];

    return (
        <RouteResultOutbox>
            <div className="routeImgBox">
                <Route size={25}/>
            </div>

            <RouteResultMainbox>
                {options.map(
                    (opt) =>
                        (opt.visible ?? true) && (
                            <React.Fragment key={opt.idx}>
                                <input
                                    type="radio"
                                    id={`transport-${dayIdx}-${actIdx}-${opt.idx}`}
                                    name={`transport-${dayIdx}-${actIdx}`}
                                    value={opt.idx}
                                    checked={localChosen === opt.idx}
                                    onChange={() => handleChange(opt.idx)}
                                    style={{ display: "none" }}
                                />
                                <RouteResultButtonLabel htmlFor={`transport-${dayIdx}-${actIdx}-${opt.idx}`}>
                                    <img src={opt.icon} height={"20px"} />
                                    {routes.czasy.length > opt.idx ? minutesToStringTime(routes.czasy[opt.idx]) : "..."}
                                </RouteResultButtonLabel>
                            </React.Fragment>
                        )
                )}
            </RouteResultMainbox>
        </RouteResultOutbox>
    );
};
