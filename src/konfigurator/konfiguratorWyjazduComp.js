import { useEffect, useState } from "react"
import { useSVGOverlay, useSVGOverlayElement } from "react-leaflet/SVGOverlay";
import styled from "styled-components"
import Loader from "../roots/loader";
import { AttractionResultFull, RouteResult } from "../roots/attractionResults";
import React from "react";
import { AddActivityPanel } from "./addActivityPanel";
const KonfiguratorWyjazduCompMainbox = styled.div`
    width: 95%;
    min-height: 1000px;
    max-width: 1200px; 
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    padding-top: 10px;
    @media screen and (max-width: 800px){
    width: 100%;
    }
    .konifuguratorMainboxTitle{
        font-size: 24px;
        font-weight: 500;
        font-family: Inter, system-ui, -apple-system, sans-serif;
        width: 100%;
        margin: 0 auto;
        text-align: left;
        padding-bottom: 10px;
        border-bottom: 1px solid lightgray;
        margin-bottom: 10px;
        @media screen and (max-width: 800px){
            padding-left: 5px;
        }
    }
    
   
`
const KonfiguratorNavBar = styled.div`
    height: 30px;
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    border-radius: 999px;
    gap: 5px;
    background-color: #f6f6f6;
    padding: 5px;
    @media screen and (max-width: 800px){
       
        a{
            display: none;
        }
    }
    
`
const NavBarButton = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 500;
    font-family: Inter, system-ui, -apple-system, sans-serif;
    flex: 1;
    max-width: 120px;
    height: 100%;
    border-radius: 999px;
    transition: 0.3s ease-in-out;
    color: ${props => props.wybranydzien == props.i ? "white" : "black"};
    background-color: ${props => props.wybranydzien == props.i ? "#008d73ff" : "inherit"};
    margin-top: 1px;
    cursor: pointer;

    span{
        padding-left: 3px;
        font-weight: 400;
        font-size: 12px;
    }
`
const KonfiguratorWyjazduBottom = styled.div`
    width: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: 5px;

`
const KonfiguratorWyjazduOutbox = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: center;
    width: 90%;
    max-width: 1000px;
    gap: 5px;
    margin-top: 20px;
    padding-bottom: 100px;

    @media screen and (max-width: 800px){
        width: 95%;
        margin-right: auto;
        margin-left: 5px;
    }
`
const AddAttractionWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0,0,0,0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AddActivityPanelContainer = styled.div`
  width: 100%;
  max-height: 100%;      
  border-radius: 10px;
  overflow-y: auto;     /* umożliwia scrollowanie wewnątrz panelu */
  padding-top: 20px;
  
`;

export function roznicaDni(startStr, endStr) {
    // Zamiana tekstu na obiekty Date
    const start = new Date(startStr);
    const end = new Date(endStr);

    // Różnica w milisekundach
    const diffMs = end.getTime() - start.getTime();

    // 1 dzień = 24 * 60 * 60 * 1000 ms
    return Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
}
export function minutesToTime(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    // dodaje wiodące zera do formatu hh:mm
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}


export const KonfiguratorWyjazduComp = ({ changeStartHour, deleteActivity, startModifyingAct, setActivityPanelOpened, addActivity, onAttractionTimeChange, swapActivities, onTransportChange, timeSchedule, chosenTransportSchedule, loading, atrakcje, routeSchedule, activitesSchedule, liczbaDni, wybranyDzien, setWybranyDzien }) => {
    //useEffect(() => { console.log("TEST3", activitesSchedule, routeSchedule, timeSchedule, chosenTransportSchedule) }, [activitesSchedule, routeSchedule, timeSchedule, chosenTransportSchedule])

    return (
        <KonfiguratorWyjazduCompMainbox>
            <div className="konifuguratorMainboxTitle">
                Plan dnia
            </div>
            <KonfiguratorNavBar>
                {Array.from({ length: liczbaDni }, (_, i) => (
                    <NavBarButton key={i} onClick={() => setWybranyDzien(i)} i={i} wybranydzien={wybranyDzien}>
                        {/* tutaj ewentualna zawartość przycisku */}
                        <a>{liczbaDni < 14 ? "Dzień" : ""}</a> <span>{i + 1}</span>
                    </NavBarButton>
                ))}
            </KonfiguratorNavBar>

            <KonfiguratorWyjazduBottom>
                <KonfiguratorWyjazduOutbox>


                    {
                        !loading && timeSchedule.length ? (
                            <>
                                {activitesSchedule.length > 0 &&
                                    activitesSchedule[wybranyDzien].map((atrakcja, idx) => (
                                        <React.Fragment key={atrakcja.idGoogle || idx}>
                                            {idx !== 0 && (
                                                <RouteResult
                                                    routes={routeSchedule[wybranyDzien][idx - 1]}
                                                    onTransportChange={onTransportChange}
                                                    dayIdx={wybranyDzien}
                                                    actIdx={idx - 1}
                                                    chosenTransport={
                                                        chosenTransportSchedule[wybranyDzien].length >= idx
                                                            ? chosenTransportSchedule[wybranyDzien][idx - 1]
                                                            : -1
                                                    }
                                                />
                                            )}

                                            <AttractionResultFull
                                                onAttractionTimeChange={onAttractionTimeChange}
                                                lastIdx={activitesSchedule[wybranyDzien].length - 1}
                                                dayIdx={wybranyDzien}
                                                actIdx={idx}
                                                swapActivities={swapActivities}
                                                attraction={atrakcja}
                                                time={minutesToTime(timeSchedule[wybranyDzien][idx])}
                                                startModifyingAct={startModifyingAct}
                                                deleteActivity={deleteActivity}
                                                changeStartHour={changeStartHour}
                                                key={`${changeStartHour}-${atrakcja.idGoogle}-${wybranyDzien}`}
                                                
                                            
                                            />
                                        </React.Fragment>
                                    ))}
                                <AddAttractionButton click={() => setActivityPanelOpened(true)} />
                            </>
                        ) : (
                            <div style={{ margin: "10px auto" }}>
                                <Loader />
                            </div>
                        )
                    }

                </KonfiguratorWyjazduOutbox>



            </KonfiguratorWyjazduBottom>

        </KonfiguratorWyjazduCompMainbox>

    )

}

const AddAttractionButtonMainbox = styled.div`
    height: 150px;
    width: 90%;
    max-width: 1000px;
    background-color: #f0f0f0;
    border-radius: 10px;
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: 0.3s ease-in-out;
    color: #606060;
    border: 1px solid lightgray;
    box-shadow: 2px 2px 2px lightgray;
    &:hover{
        background-color: #e8e8e8;
        box-shadow: 0px 0px 2px lightgray;
    }
    @media screen and (max-width: 800px)
    {
    width: 100%;
    }
`
const AddAttractionButton = ({ click }) => {
    return (
        <AddAttractionButtonMainbox onClick={() => click()}>
            <img src="../icons/icon-plus.svg" height={'50px'} />
            Dodaj aktywność
        </AddAttractionButtonMainbox>
    )
}