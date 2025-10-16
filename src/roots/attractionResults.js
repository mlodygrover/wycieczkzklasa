import { act, use, useEffect, useState, useRef } from "react"
import styled from "styled-components"
import LeafletMap from "./googleMapViewer"
import { MapaBox } from "../konfiguratorWyjazdu"
import { da } from "date-fns/locale"
import { timeToMinutes } from "../konfiguratorMain"
import { minutesToTime } from "../konfigurator/konfiguratorWyjazduComp"
import React from "react"
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



export const AttractionResultSmall = ({ icon = "../icons/castle.svg", attraction = { idGoogle: "abcd", nazwa: "Ratusz Poznański Ratusz Poznańsk Ratusz Poznańsk", adres: "Stary Rynek 40", czasZwiedzania: null, cenaZwiedzania: null }, onClick }) => {
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
  

    width: calc(100% - 50px);
    
    height: 150px;
    display: flex;
    flex-direction: row;
    align-items: stretch;
    justify-content: flex-start;
    background-color: white;
    padding: 10px;
    border-radius: 10px;
    border: 1px solid lightgray;
    border-left: 5px solid red;
    margin: 0;
    box-shadow: 2px 2px 2px lightgray;
    box-sizing: border-box;
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
        height: 100%;
        
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #f0f0f0;
        border-radius: 10px;

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
        
        div{
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: flex-start;
            gap: 2px;
            text-align: left;
        }
        .attractionStats{
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: 300;
        }
        .attractionBorder{
            width: 100%;
            height: 1px;
            background-color: lightgray;
            margin: 5px auto;
        }
        .attractionTitle{
            font-size: 16px;
            color: #505050;
            font-weight: 300;
           
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
  

    @media screen and (max-width: 600px)
    {
        flex-direction: column;
        height: 300px;
        width: 100%;
        .photoPart
        {   height: 60%;
            width: 100%;
        }
        .descPart{
            margin-top: auto;
            height: 35%;
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
const AttractionResultFullNav = styled.div`
    
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 5px;
    .buttonFullNav{
        flex: 1;
        max-width: 40px;
        max-height: 40px;
        border-radius: 5px;
        cursor: pointer;
        transition: 0.3s ease-in-out;
        display: flex;
        align-items: center;
        justify-content: center;
        &.nav{
            background-color: #e0e0e0;
        
            &:hover{
                background-color:  #a0a0a0;
            
            }
        } 
        &.swap{
            background-color: #e6e9ff;
            &:hover{
                background-color: #3d54ff;
            
            }
            
        }
        &.del{
            background-color: #ffeded;
            &:hover{
                background-color: #dd0000;
            
            }
            
        }
        &.off{
            opacity: 0;          /* całkowicie przezroczysty */
            pointer-events: none; 
        }
        
    }
        @media screen and (max-width: 800px){
        display: none;}


`

const IncreaseButton = styled.div`
  width: 15px;
  height: 15px;
  background-color: black;
  display: flex;
  align-items: center;   /* pionowe wyśrodkowanie */
  justify-content: center !important;  /* poziome wyśrodkowanie */
  text-align: center;   /* fallback dla samego tekstu */
  color: white;
  border-radius: 2222px;
  margin: 2px;

  transition: 0.3s ease-in-out;

  &:hover{
    background-color: #606060;
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
    checkOut = 720
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





    return (
        <AttractionResultFullOutbox key={attraction.id || actIdx}>
            <AttractionResultFullNav>
                {attraction.idGoogle != "baseRouteTo" && attraction.idGoogle != "baseRouteFrom" && attraction.idGoogle != "baseHotelIn" && attraction.idGoogle != "baseHotelOut" && <>
                    <div className={actIdx === 1 ? "buttonFullNav off" : "buttonFullNav nav"}>
                        <img
                            src={"../icons/icon-arrow.svg"}
                            height={'30px'}
                            onClick={async () => {
                                if (actIdx === 0) return;
                                try {
                                    await swapActivities(dayIdx, actIdx, actIdx - 1);
                                } catch (err) {
                                    console.error("❌ Błąd podczas zamiany atrakcji:", err);
                                }
                            }}

                        />
                    </div>
                    <div className={attraction.idGoogle !== "baseBookOut" && attraction.idGoogle !== "baseBookIn" ? "buttonFullNav swap" : "buttonFullNav off"} onClick={() => startModifyingAct(dayIdx, actIdx)}>
                        <img src={"../icons/swap-white.svg"} height={'30px'} style={{ transform: 'rotate(90deg)' }} />
                    </div>
                    <div className={attraction.idGoogle !== "baseBookOut" && attraction.idGoogle !== "baseBookIn" ? "buttonFullNav del" : "buttonFullNav off"} onClick={() => deleteActivity(dayIdx, actIdx)}>
                        <img src={"../icons/icon-trash.svg"} height={'30px'} />
                    </div>
                    <div className={actIdx === lastIdx - 1 ? "buttonFullNav off" : "buttonFullNav nav"}>
                        <img
                            src={"../icons/icon-arrow.svg"}
                            height={'30px'}
                            style={{ transform: 'rotate(180deg)' }}
                            onClick={async () => {
                                if (actIdx !== lastIdx) {
                                    try {
                                        await swapActivities(dayIdx, actIdx + 1, actIdx);
                                    } catch (err) {
                                        console.error("❌ Błąd zamiany w dół:", err);
                                    }
                                }
                            }}
                        />
                    </div>
                </>
                }
            </AttractionResultFullNav>
            <AttractionResultFullMainbox className={attraction.idGoogle != "baseAct" ? "" : "baseAct"}>
                <div className="photoPart">
                    <div className="photoSlide" style={{ pointerEvents: "none" }}>
                        {attraction.idGoogle != "baseAct"
                            ?
                            attraction.idGoogle == "baseHotelIn" ?
                                <img src={"../icons/gosleep2.svg"} height={'70%'} style={{ margin: 'auto' }} />
                                :
                                attraction.idGoogle == "baseHotelOut" ?
                                    <img src={"../icons/wakeup.svg"} height={'70%'} style={{ margin: 'auto' }} />
                                    :
                                    attraction.idGoogle == "baseRouteTo" ?
                                        <img src={"../icons/departure.svg"} height={'70%'} style={{ margin: 'auto' }} />
                                        :
                                        attraction.idGoogle == "baseRouteFrom" ?
                                            <img src={"../icons/arrival.svg"} height={'70%'} style={{ margin: 'auto' }} />
                                            :
                                            attraction.idGoogle == "baseBookIn" ?
                                                <img src={"../icons/bookIn.svg"} height={'70%'} style={{ margin: 'auto' }} />
                                                :
                                                attraction.idGoogle == "baseBookOut" ?
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
                    </div>
                </div>
                <div className="descPart">

                    <div className="attractionTitle">
                        <img src={"../icons/castle.svg"} height={'20px'} /> {attraction?.nazwa || "brak danych"}
                    </div>
                    <div className="attractionAdres">
                        <img src={"../icons/icon-location.svg"} height={'20px'} />{attraction?.adres || "brak danych"}
                    </div>
                    <div className="attractionBorder">

                    </div>

                    <div className="attractionStats">
                        <img src="../icons/icon-time.svg" height={'20px'} />
                        {actIdx == 0 && <IncreaseButton onClick={() => setLocalStartTime((localStartTime - 10) % 1440)}><img src="../icons/minus-white.svg" height={'15px'} /></IncreaseButton>}
                        {minutesToTime(localStartTime) || "00"}
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
    width: calc(100% - 50px);
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
        img{
        height: 100%;
        width: 100%;}
    
    }
    @media screen and (max-width: 800px){
        width: 100%;
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
        return <RouteResultOutbox />;
    }

    const options = [
        { idx: 0, icon: "../icons/pedestrian.svg", label: "Pieszo", visible: routes.czasy[0] < 180 },
        { idx: 1, icon: "../icons/icon-public-trannsport.svg", label: "Komunikacja" },
        { idx: 2, icon: "../icons/bus.svg", label: "Auto" },
    ];

    return (
        <RouteResultOutbox>
            <div className="routeImgBox">
                <img src="../icons/route.svg" />
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
