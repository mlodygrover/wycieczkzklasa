import { useEffect, useState } from "react"
import { useSVGOverlay, useSVGOverlayElement } from "react-leaflet/SVGOverlay";
import styled from "styled-components"
import Loader from "../roots/loader";
import { AttractionResultFull, RouteResult } from "../roots/attractionResults";
import React from "react";
import { AddActivityPanel } from "./addActivityPanel";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const DroppableBox = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-end; 
  gap: 10px;
`;

const DraggableWrap = styled.div`
  width: 90%;            /* tak jak AttractionResultFullMainbox */
  max-width: 1000px;     /* tak jak wcześniej */
  margin: 0 auto;
  gap: 10px;
`;
const ScrollableListContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 100px;
  scroll-behavior: smooth;

  /* Upewnij się, że karty nie przyklejają się do krawędzi */
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 10px;
  }
`;


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
            padding-left: 15px;
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
        width: 90%;
        margin: 10px auto;
        margin-top: 0;
        a{
            display: none;
        }
    }

    
`
const NavBarButton = styled.label`
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 500;
    font-family: Inter, system-ui, -apple-system, sans-serif;
    flex: 1;
    height: 100%;
    border-radius: 999px;
    transition: background-color 0.3s ease-in-out, color 0.3s ease-in-out;
    color: black;
    background-color: inherit;
    margin-top: 1px;
    cursor: pointer;
    user-select: none;

    span {
        padding-left: 3px;
        font-weight: 400;
        font-size: 12px;
    }

    /* 🔹 Styl aktywnego radio (checked) */
    input[type="radio"]:checked + & {
        color: white;
        background-color: #008d73ff;
    }

    @media screen and (max-width: 800px) {
        a {
            display: none;
        }
    }
`;

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
        margin: auto;
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


export const KonfiguratorWyjazduComp = ({ changeStartHour, deleteActivity, startModifyingAct, setActivityPanelOpened, addActivity, onAttractionTimeChange, swapActivities, onTransportChange, timeSchedule, chosenTransportSchedule, loading, atrakcje, routeSchedule, activitesSchedule, liczbaDni, wybranyDzien, setWybranyDzien, checkOut }) => {
    //useEffect(() => { console.log("TEST3", activitesSchedule, routeSchedule, timeSchedule, chosenTransportSchedule) }, [activitesSchedule, routeSchedule, timeSchedule, chosenTransportSchedule])

    const [localWybranyDzien, setLocalWybranyDzien] = useState(wybranyDzien);
    const [scheduleLoading, setScheduleLoading] = useState(false);
    useEffect(() => {
        if (activitesSchedule.length <= localWybranyDzien) {
            setScheduleLoading(true);
            return;
        };
        setScheduleLoading(false);
        setWybranyDzien(localWybranyDzien);
    }, [localWybranyDzien, activitesSchedule]);
    return (
        <KonfiguratorWyjazduCompMainbox>
            <div className="konifuguratorMainboxTitle">
                Plan dnia
            </div>
            <KonfiguratorNavBar>
                {Array.from({ length: liczbaDni }, (_, i) => (
                    <React.Fragment key={i}>
                        <input
                            type="radio"
                            id={`day-${i}`}
                            name="daySelector"
                            value={i}
                            checked={localWybranyDzien === i}
                            onChange={() => setLocalWybranyDzien(i)}
                            style={{ display: "none" }} // ukrywamy sam input, stylujemy tylko label
                        />
                        <NavBarButton htmlFor={`day-${i}`}>
                            <a>{liczbaDni < 14 ? "Dzień" : ""}</a> <span>{i + 1}</span>
                        </NavBarButton>
                    </React.Fragment>
                ))}
            </KonfiguratorNavBar>
            <KonfiguratorWyjazduBottom>
                <KonfiguratorWyjazduOutbox>


                    {
                        !loading && !scheduleLoading && timeSchedule.length ? (
                            <>
                                <DragDropContext
                                    onDragEnd={(result) => {
                                        if (!result.destination) return;

                                        const sourceIndex = result.source.index;
                                        const destIndex = result.destination.index;
                                        const lastIdx = activitesSchedule[wybranyDzien].length - 1;

                                        // 🔒 Odrzuć przesunięcie na początek lub koniec
                                        if (destIndex === 0 || destIndex === lastIdx) return;

                                        // 🔒 Odrzuć przesunięcie samej pierwszej/ostatniej aktywności
                                        if (sourceIndex === 0 || sourceIndex === lastIdx) return;

                                        if (sourceIndex !== destIndex) {
                                            swapActivities(wybranyDzien, sourceIndex, destIndex);
                                        }
                                    }}
                                >
                                    <ScrollableListContainer>
                                        <Droppable droppableId="activities-list">
                                            {(provided) => (
                                                <DroppableBox ref={provided.innerRef} {...provided.droppableProps}>
                                                    {activitesSchedule.length == liczbaDni &&
                                                        activitesSchedule[wybranyDzien].map((atrakcja, idx) => {
                                                            const routeAbove =
                                                                idx > 0 ? (
                                                                    <RouteResult
                                                                        key={`route-${idx}`}
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
                                                                ) : null;

                                                            const lastIdx = activitesSchedule[wybranyDzien].length - 1;

                                                            return (
                                                                <React.Fragment key={`${atrakcja.googleId}${idx}` || idx}>
                                                                    {routeAbove}

                                                                    <Draggable
                                                                        key={`${atrakcja.googleId}_${idx}_${wybranyDzien}` || String(idx)}
                                                                        draggableId={atrakcja.googleId || String(idx)}
                                                                        index={idx}
                                                                        isDragDisabled={idx === 0 || idx === lastIdx} // 🔒 nie da się chwycić 1. ani ostatniej
                                                                    >
                                                                        {(provided, snapshot) => (
                                                                            <DraggableWrap
                                                                                ref={provided.innerRef}
                                                                                {...provided.draggableProps}
                                                                                {...provided.dragHandleProps}
                                                                                style={{
                                                                                    display: "flex",
                                                                                    flexDirection: "column",
                                                                                    justifyContent: "flex-start",
                                                                                    alignItems: "flex-end",
                                                                                    width: "100%",
                                                                                    maxWidth: "1000px",
                                                                                    margin: "0 auto",
                                                                                    transition: snapshot.isDragging
                                                                                        ? "transform 0.2s ease, box-shadow 0.2s ease"
                                                                                        : "box-shadow 0.2s ease",
                                                                                    borderRadius: "10px",
                                                                                    ...provided.draggableProps.style,
                                                                                }}
                                                                            >
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
                                                                                    checkOut={checkOut}
                                                                                />
                                                                            </DraggableWrap>
                                                                        )}
                                                                    </Draggable>
                                                                </React.Fragment>
                                                            );
                                                        })}
                                                    {provided.placeholder}
                                                </DroppableBox>
                                            )}
                                        </Droppable>
                                    </ScrollableListContainer>
                                </DragDropContext>


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

        </KonfiguratorWyjazduCompMainbox >

    )

}

const AddAttractionButtonMainbox = styled.div`
                height: 150px;
                width: 100%;
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