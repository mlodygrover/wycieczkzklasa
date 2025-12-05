import { ArrowUpNarrowWide, ChevronDown, ChevronUp, Clock, Loader2 } from "lucide-react";
import styled from "styled-components";
import { minutesToTime } from "../konfigurator/konfiguratorWyjazduComp";
import { useEffect, useRef, useState } from "react";
import { timeToMinutes } from "../konfiguratorMain";

const MobileResultMainbox = styled.div`
    @media screen and (min-width: 1201px){
        display: none;
    }
    width: 100%;
    min-height: 50px;
    display: flex;
    flex-direction:column;
    align-items: center;
    justify-content: flex-start;
    border: 1px solid #f0f0f0;
    border-radius: 10px;
    padding: 2px 0px;
    box-sizing: border-box;
    .toggleView{
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        min-height: 50px;
        gap: 4px;
        .activityTime {
            text-wrap: nowrap;
            display: flex;
            align-items: center;
            gap: 3px;
            font-size: 12px;
            font-weight: 600;
            color: #1aa04bff;
            background: #f0fdf4;
            padding: 3px 6px;
            border-radius: 4px;
        }
        .toggleViewActName{
            font-size: 14px;
            font-weight: 500;
            text-align: left;
        }
        .toggleViewIcon{
            width: 25px;
            height: 25px;
            background-color: #f6f6f6;
            color: #606060;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 5px;
            margin-left: 5px;
            flex-shrink: 0;
            }
    }

`

export const MobileResult = ({ changeStartHour,
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
    changeActivity
}) => {
    const [localTime, setLocalTime] = useState(!attraction?.czasZwiedzania || attraction.czasZwiedzania === null ? 55 : attraction.czasZwiedzania);
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

    function changeVariant(idx) {
        if (!attraction?.warianty || attraction?.warianty.length < idx + 1) return
        let tmpAttraction = attraction;
        tmpAttraction.czasZwiedzania = attraction.warianty[idx].czasZwiedzania || 60;
        tmpAttraction.cenaZwiedzania = attraction.warianty[idx].cenaZwiedzania || 0;
        tmpAttraction.selectedVariant = idx;
        changeActivity(dayIdx, actIdx, tmpAttraction);
    }
    return (
        <MobileResultMainbox>
            <div className="toggleView">
                <div className="toggleViewIcon">

                    <ChevronDown size={20}/>
                </div>
                <div className="activityTime">
                    <Clock size={16} />
                    {isNaN(minutesToTime(localStartTime)) ? minutesToTime(localStartTime % 1440) : <Loader2 />}

                </div>
                <div className="toggleViewActName">
                    {attraction?.nazwa || "Brak nazwy atrakcji"}
                </div>
            </div>
        </MobileResultMainbox>
    )
}