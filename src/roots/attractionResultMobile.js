import { ChevronDown, Clock, Loader2, MapPin, Trash2, RefreshCw, MoveUp, MoveDown, Euro, Navigation, ChevronUp, Ticket } from "lucide-react";
import styled from "styled-components";
import { useEffect, useRef, useState } from "react";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import VariantButton from "../variantButton";
import { minutesToStringTime } from "./attractionResults";

const MobileResultMainbox = styled.div`
 @media screen and (min-width: 1200px){
        display: none;
    }
    width: 100%;
    min-height: 40px;
    display: flex;
    flex-direction:column;
    align-items: center;
    justify-content: flex-start;
    border: 1px solid #e5e5e5;
    border-radius: 8px;
    padding: 0;
    box-sizing: border-box;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    background: white;
    
    .toggleView{
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        min-height: 40px;
        gap: 6px;
        cursor: pointer;
        padding: 6px 10px;
        box-sizing: border-box;
        transition: background-color 0.2s ease;
        border-radius: 8px;
        
        
        .activityTime {
            text-wrap: nowrap;
            display: flex;
            align-items: center;
            gap: 3px;
            font-size: 11px;
            font-weight: 600;
            color: #1aa04bff;
            background: #f0fdf4;
            padding: 2px 5px;
            border-radius: 4px;
        }
        .toggleViewActName{
            font-size: 13px;
            font-weight: 500;
            text-align: left;
            flex: 1;
        }
        .toggleViewIcon{
            width: 22px;
            height: 22px;
            background-color: #f6f6f6;
            color: #606060;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 5px;
            flex-shrink: 0;
            transition: transform 0.3s ease;
            
            &.expanded {
                transform: rotate(180deg);
            }
        }
    }
`

const ExpandedContent = styled.div`
    width: 100%;
    transition: max-height 0.3s ease, opacity 0.3s ease;
    max-height: ${props => props.$isExpanded ? '600px' : '0'};

    overflow: ${props => props.$isExpanded ? 'visible' : 'hidden'};
    opacity: ${props => props.$isExpanded ? '1' : '0'};
    .content-wrapper {
        padding: 8px 10px 10px 10px;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
`

const MapWrapper = styled.div`
    width: 100%;
    height: 180px;
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid #e5e5e5;
    position: relative;
    background-color: #f0f0f0;

    /* Bardzo ważne dla react-leaflet */
    .leaflet-container {
        width: 100%;
        height: 100%;
    }

    &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 50%;
        background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.79));
        pointer-events: none;
        z-index: 998;
    }
`;

const MapOverlay = styled.div`
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    z-index: 999;
`;
const OverlayRow = styled.div`
    display: flex;
    gap: 6px;
    align-items: center;
    justify-conent: space-between;
`

const OverlayInfo = styled.div`
    padding: 4px 0;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    text-align: left;
    gap: 4px;
    font-size: 11px;
    font-weight: 600;
    color: white;
    text-shadow: 0 1px 3px rgba(0,0,0,0.8);
    flex: 1;
    
    svg {
        flex-shrink: 0;
        filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));
    }
`

const OverlayAddress = styled.div`
    padding: 4px 0;
    font-size: 12px;
    font-weight: 600;
    color: white;
    text-shadow: 0 1px 3px rgba(0,0,0,0.8);
    display: flex;
    align-items: center;
    gap: 4px;
    
    svg {
        flex-shrink: 0;
        filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));
    }
`

const ActionButtons = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 6px;
    margin-top: 2px;
`

const ActionButton = styled.button`
    padding: 8px;
    border: 1px solid #e5e5e5;
    background: white;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:active {
        transform: scale(0.95);
    }
    
    
    &.change, &.move-down, &.move-up {
       color: black;
       &:hover {
            background: #f6f6f6;
        }
    }
    
    &.delete {
        color: #ef4444;
        &:hover {
            background: #fef2f2;
            border-color: #ef4444;
        }
    }
    
    &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
        &:hover {
            background: white;
            border-color: #e5e5e5;
        }
    }
`


const TimeSliderWrapper = styled.div`
    width: 100%;
    padding: 12px;
    background: #f9f9f9;
    border-radius: 6px;
    border: 1px solid #e5e5e5;
    box-sizing: border-box;
`

const SliderLabel = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    
    .label-text {
        font-size: 12px;
        font-weight: 600;
        color: #606060;
        display: flex;
        align-items: center;
        gap: 4px;
    }
    
    .time-value {
        font-size: 13px;
        font-weight: 700;
        color: #1aa04bff;
        background: #f0fdf4;
        padding: 3px 8px;
        border-radius: 4px;
    }
`

const Slider = styled.input`
    width: 100% ;
    height: 6px;
    border-radius: 3px;
    background: linear-gradient(to right, 
        #1aa04bff 0%, 
        #1aa04bff ${props => ((props.value - 10) / (480 - 10)) * 100}%, 
        #e5e5e5 ${props => ((props.value - 10) / (480 - 10)) * 100}%, 
        #e5e5e5 100%
    );
    outline: none;
    -webkit-appearance: none;
    appearance: none;
    cursor: pointer;
    
    &::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: white;
        border: 3px solid #1aa04bff;
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0,0,0,0.15);
        transition: all 0.2s ease;
        
        &:hover {
            transform: scale(1.1);
            box-shadow: 0 3px 6px rgba(0,0,0,0.2);
        }
        
        &:active {
            transform: scale(0.95);
        }
    }
    
    &::-moz-range-thumb {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: white;
        border: 3px solid #1aa04bff;
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0,0,0,0.15);
        transition: all 0.2s ease;
        
        &:hover {
            transform: scale(1.1);
            box-shadow: 0 3px 6px rgba(0,0,0,0.2);
        }
        
        &:active {
            transform: scale(0.95);
        }
    }
`

const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

const timeToMinutes = (time) => {
    if (!time) return 0;
    const [hours, mins] = time.split(':').map(Number);
    return hours * 60 + mins;
}

export const MobileResult = ({
    changeStartHour,
    attractionTime,
    onAttractionTimeChange,
    lastIdx,
    dayIdx,
    actIdx,
    swapActivities,
    time = "08:00",
    attraction,
    startModifyingAct,
    deleteActivity,
    checkOut = 720,
    changeActivity,
    openedInit = false,
    activitiesSchedule = []
}) => {
    const [isExpanded, setIsExpanded] = useState(openedInit);
    const [localTime, setLocalTime] = useState(!attraction?.czasZwiedzania || attraction.czasZwiedzania === null ? 55 : attraction.czasZwiedzania);
    const [localStartTime, setLocalStartTime] = useState(timeToMinutes(time || "08:00"))

    useEffect(() => {
        if (actIdx == 0) {
            const handler = setTimeout(() => {
                changeStartHour && changeStartHour(dayIdx, localStartTime)
            }, 700);
            return () => clearTimeout(handler);
        }
    }, [localStartTime]);

    useEffect(() => {
        setLocalStartTime(timeToMinutes(time))
    }, [time])

    const prevLocalTime = useRef(localTime);

    useEffect(() => {
        if (prevLocalTime.current === localTime) {
            return;
        }

        prevLocalTime.current = localTime;

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

    function changeVariant(idx) {
        if (!attraction?.warianty || attraction?.warianty.length < idx + 1) return
        let tmpAttraction = attraction;
        tmpAttraction.czasZwiedzania = attraction.warianty[idx].czasZwiedzania || 60;
        tmpAttraction.cenaZwiedzania = attraction.warianty[idx].cenaZwiedzania || 0;
        tmpAttraction.selectedVariant = idx;
        setLocalTime(attraction.warianty[idx].czasZwiedzania || 60)
        changeActivity && changeActivity(dayIdx, actIdx, tmpAttraction);
    }

    const toggleExpanded = () => {
        if (attraction.googleId.includes("base")) return;
        setIsExpanded(!isExpanded);

    }

    const selectedVariant = attraction?.warianty?.[attraction?.selectedVariant || 0] || attraction?.warianty?.[0];

    // Generowanie URL dla statycznej mapy OpenStreetMap
    const getStaticMapUrl = (lat, lng) => {
        const zoom = 15;
        const width = 600;
        const height = 400;
        // Używamy StaticMap API z OpenStreetMap
        return `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+ef4444(${lng},${lat})/${lng},${lat},${zoom}/${width}x${height}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw`;
    }

    return (
        <MobileResultMainbox>
            <div className="toggleView" onClick={toggleExpanded}>
                <div className={`toggleViewIcon ${isExpanded ? 'expanded' : ''}`}>
                    {!attraction.googleId.includes("base") ? <ChevronDown size={20} /> : ""}
                </div>
                <div className="activityTime">
                    <Clock size={16} />
                    {minutesToTime(localStartTime % 1440)}
                </div>
                <div className="toggleViewActName">
                    {attraction?.nazwa || "Brak nazwy atrakcji"}
                </div>
            </div>

            <ExpandedContent $isExpanded={isExpanded}>
                <div className="content-wrapper">
                    {/* Mapa */}
                    {attraction?.lokalizacja && (
                        <MapWrapper>
                            {/* Mapa jako tło */}
                            <MapContainer
                                center={[
                                    attraction.lokalizacja.lat,
                                    attraction.lokalizacja.lng,
                                ]}
                                zoom={13}
                                scrollWheelZoom={false}
                                dragging={false}
                                doubleClickZoom={false}
                                boxZoom={false}
                                keyboard={false}
                                zoomControl={false}
                                attributionControl={true}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution="&copy; OpenStreetMap contributors"
                                />
                                <Marker
                                    position={[
                                        attraction.lokalizacja.lat,
                                        attraction.lokalizacja.lng,
                                    ]}
                                />
                            </MapContainer>

                            {/* Overlay na wierzchu mapy */}
                            <MapOverlay>
                                {attraction?.adres && (
                                    <OverlayAddress>
                                        <MapPin size={14} />
                                        {attraction.adres}
                                    </OverlayAddress>
                                )}
                                <OverlayRow>
                                    <OverlayInfo>
                                        <Clock size={14} />
                                        {attraction?.czasZwiedzania || localTime} min
                                    </OverlayInfo>
                                    <OverlayInfo>
                                        <Ticket size={14} />
                                        {(!Array.isArray(attraction?.warianty) ||
                                            attraction.warianty.length === 0)
                                            ? 'Dodaj aby obliczyć'
                                            : attraction?.cenaZwiedzania === 0
                                                ? 'Bezpłatne'
                                                : attraction?.cenaZwiedzania != null
                                                    ? `${Number(
                                                        attraction.cenaZwiedzania
                                                    )} zł / osoba`
                                                    : ''}
                                    </OverlayInfo>
                                    <OverlayInfo>
                                        <Navigation size={14} />
                                        2.5 km
                                    </OverlayInfo>
                                </OverlayRow>
                            </MapOverlay>
                        </MapWrapper>
                    )}

                    {
                        attraction?.warianty && attraction?.warianty.length > 1 ? <VariantButton variants={attraction.warianty} selectedVariantInit={attraction?.selectedVariant || attraction.selectedVariant === 0 ? attraction.selectedVariant : null} onSelect={changeVariant} typ={2} sourcePlace={true} /> : null
                    }
                    <TimeSliderWrapper>
                        <SliderLabel>
                            <span className="label-text">
                                <Clock size={14} />
                                Czas zwiedzania
                            </span>
                            <span className="time-value">{minutesToStringTime(localTime)}</span>
                        </SliderLabel>
                        <Slider
                            type="range"
                            min="10"
                            max="480"
                            step="5"
                            value={localTime}
                            onChange={(e) => setLocalTime(parseInt(e.target.value))}
                        />
                    </TimeSliderWrapper>
                    {/* Przyciski akcji */}
                    <ActionButtons>
                        <ActionButton
                            className="move-up"
                            disabled={actIdx === 0}
                            onClick={(e) => {
                                e.stopPropagation();
                                swapActivities(dayIdx, actIdx, actIdx - 1)
                            }}
                            title="W górę"
                        >
                            <ChevronUp size={16} />
                        </ActionButton>

                        <ActionButton
                            className="move-down"
                            disabled={actIdx === lastIdx}
                            onClick={(e) => {
                                e.stopPropagation();
                                swapActivities(dayIdx, actIdx, actIdx + 1)
                            }}
                            title="W dół"
                        >
                            <ChevronDown size={16} />
                        </ActionButton>

                        <ActionButton
                            className="change"
                            onClick={(e) => {
                                e.stopPropagation();
                                // startModifyingAct(dayIdx, actIdx)
                            }}
                            title="Zmień atrakcję"
                        >
                            <RefreshCw size={16} />
                        </ActionButton>

                        <ActionButton
                            className="delete"
                            onClick={(e) => {
                                e.stopPropagation();
                                deleteActivity(dayIdx, actIdx)
                            }}
                            title="Usuń"
                        >
                            <Trash2 size={16} />
                        </ActionButton>
                    </ActionButtons>
                </div>
            </ExpandedContent>
        </MobileResultMainbox>
    )
}