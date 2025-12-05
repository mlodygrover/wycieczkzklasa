import { useEffect, useState } from "react"
import styled from "styled-components"
import Loader from "../roots/loader";
import React from "react";
import { AddActivityPanel } from "./addActivityPanel";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { AttractionResultFull, RouteResult } from "../roots/attractionResults";
import { Plus, Save } from "lucide-react";
import { MobileResult } from "../roots/attractionResultMobile";

const portacc = process.env.REACT_APP_API_SOURCE || "https://api.draftngo.com";

const DroppableBox = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-end; 
  gap: 10px;
`;
const DraggableWrap = styled.div`
  width: 90%;
  max-width: 1000px;
  margin: 0 auto;
  gap: 10px;
  @media screen and (max-width: 1200px){
    gap: 0px;
  } 
`;
const ScrollableListContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 100px;
  scroll-behavior: smooth;
  &::-webkit-scrollbar { width: 8px; }
  &::-webkit-scrollbar-thumb { background-color: #ccc; border-radius: 10px; }
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
  @media screen and (max-width: 800px){ width: 100%; }

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
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: 12px;
    justify-content: space-between;

    @media screen and (max-width: 800px){
      padding-left: 15px;
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
  }

  .title-left,
  .title-right {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }
`;



const SaveButton = styled.button`
  height: 40px;
  padding: 0px 20px;
  border-radius: 8px;
  border: 2px solid #000000ff;
  background: #ffffff;
  color: #000000ff;
  font-family: Inter, system-ui, -apple-system, sans-serif;
  font-weight: 500 !important;
  cursor: pointer;
  transition:.2s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  &:hover { box-shadow: 0 8px 20px rgba(0,0,0,.06); background: #f9fafb; }
  &:active { transform: scale(.99); }
  &:disabled { opacity: .6; cursor: not-allowed; border: 2px solid lightgray; }
`;

const KonfiguratorNavBar = styled.div`
  height: 30px; 
  width: 90%;
  display: flex; 
  align-items: center;
  gap: 5px; background-color: #f6f6f6; padding: 5px; border-radius: 5px;
  @media (max-width: 800px){
    margin: 10px auto 0;
    width: 95%;
    a{ display:none; }
  }
`;
const NavBarButton = styled.label`
  display:flex; align-items:center; justify-content:center;
  box-sizig: border-box;
  font-size:12px; 
  font-weight:500;
  font-family: Inter, system-ui, -apple-system, sans-serif;
  flex:1; height:100%; border-radius: 5px; color:black; background:inherit; margin-top:1px;
  cursor:pointer; user-select:none; transition: background-color .3s, color .3s;
  span{ padding-left:3px; font-weight:500; font-size:14px; }
  input[type="radio"]:checked + &{ color:white; background-color:#008d73ff; }
  @media (max-width: 800px){ a{ display:none; } }
`;

const KonfiguratorWyjazduBottom = styled.div`
  width: 100%; flex: 1; display:flex; flex-direction:column; 
  align-items:center; 
  justify-content: flex-start;
   gap:5px; margin-top: 10px;
`;
const KonfiguratorWyjazduOutbox = styled.div`
  display:flex; 
  flex-direction:column; 
  align-items:flex-end; 
    justify-content:flex-start;
  width:90%; 
  max-width:1000px;
  gap:5px; 
  margin-top:20px; 
  padding-bottom:100px;
  @media (max-width:800px){ width:95%; }
`;

const AddAttractionButtonMainbox = styled.div`
  height: 150px;
   width: 100%; 
   max-width: 1000px;
  background-color: #f0f0f0; 
  border-radius: 10px; 
  margin-top: 20px;
  display:flex; 
  flex-direction:column; 
  align-items:center; 
  justify-content:center;
  cursor:pointer; 
  transition: .3s ease-in-out; 
  color:#606060; 
  border:1px solid lightgray; 
  &:hover{ 
    background-color:#e8e8e8; 
    box-shadow:0 0 2px lightgray; 
  }
  @media (max-width:800px){ 
    width:100%; 
    height: 80px;
  }
`;
const AddAttractionButton = ({ click }) => (
    <AddAttractionButtonMainbox onClick={click}>
        <Plus size={30} />
        Dodaj aktywność
    </AddAttractionButtonMainbox>
);

// ===== utils =====
export function roznicaDni(startStr, endStr) {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const diffMs = end.getTime() - start.getTime();
    return Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
}
export function minutesToTime(totalMinutes) {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
const fmtPLN = (n) =>
    new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 }).format(Number(n || 0));

export const KonfiguratorWyjazduComp = ({
    computedPrice = 0,
    computingPrice = false,
    miejsceDocelowe,
    changeActivity, changeStartHour, deleteActivity, startModifyingAct,
    setActivityPanelOpened, addActivity, onAttractionTimeChange, swapActivities,
    onTransportChange, timeSchedule, chosenTransportSchedule,
    loading, atrakcje, routeSchedule, activitiesSchedule,
    liczbaDni, wybranyDzien, setWybranyDzien, checkOut, miejsceStartowe, liczbaUczestnikow, liczbaOpiekunow, standardTransportu, standardHotelu, dataPrzyjazdu, dataWyjazdu, hasPendingAutoSave, handleSaveClick,
}) => {

    const [localWybranyDzien, setLocalWybranyDzien] = useState(wybranyDzien);
    const [scheduleLoading, setScheduleLoading] = useState(false);

    useEffect(() => {
        setWybranyDzien(Math.min(localWybranyDzien, activitiesSchedule.length - 1));
    }, [localWybranyDzien, activitiesSchedule, setWybranyDzien]);

    // Zapis – minimalnie jak wcześniej (bez zmian w kontrakcie)
    const API_BASE = `${portacc}`;

    function validateMiejsceDocelowe(md) {
        if (!md) return 'miejsceDocelowe jest wymagane.';
        if (!md.nazwa) return 'miejsceDocelowe.nazwa jest wymagana.';
        if (!md.location || typeof md.location !== 'object') return 'miejsceDocelowe.location jest wymagane.';
        const { lat, lng } = md.location;
        if (typeof lat !== 'number' || typeof lng !== 'number') {
            return 'miejsceDocelowe.location.lat i miejsceDocelowe.location.lng muszą być liczbami.';
        }
        return null;
    }

    /**
     * Zapisuje plan wraz z computedPrice.
     * Wymaga: activitiesSchedule (array-of-arrays), miejsceDocelowe (obiekt), computedPrice (number).
     */
    async function saveActivitiesSchedule(activitiesSchedule, miejsceDocelowe, miejsceStartowe, dataPrzyjazdu, dataWyjazdu, liczbaUczestnikow, liczbaOpiekunow, standardHotelu, standardTransportu, computedPrice) {
        if (!Array.isArray(activitiesSchedule)) {
            throw new Error('Parametr "activitiesSchedule" musi być tablicą.');
        }
        const mdError = validateMiejsceDocelowe(miejsceDocelowe);
        if (mdError) throw new Error(mdError);

        // Walidacja/normalizacja ceny
        const priceNum = Number(computedPrice);
        if (!Number.isFinite(priceNum) || priceNum < 0) {
            throw new Error('ComputedPrice musi być nieujemną liczbą.');
        }

        const res = await fetch(`${API_BASE}/api/trip-plans`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                activitiesSchedule,
                miejsceDocelowe,
                computedPrice: priceNum, // <-- wysyłamy cenę
                miejsceStartowe,
                dataPrzyjazdu,
                dataWyjazdu,
                liczbaUczestnikow,
                liczbaOpiekunow,
                standardHotelu,
                standardTransportu

            }),
        });

        let payload = null;
        try { payload = await res.json(); } catch { }

        if (res.status === 401) throw new Error('Musisz być zalogowany, aby zapisać plan.');
        if (!res.ok) {
            const msg = payload?.message || payload?.error || `Nie udało się zapisać planu. Kod HTTP: ${res.status}`;
            throw new Error(msg);
        }
        return payload;
    }

    const [saving, setSaving] = useState(false);

    // ✅ Zapis możliwy tylko, gdy nic się nie liczy/nie ładuje i cena jest gotowa/liczbowa
    const priceReady = !computingPrice && Number.isFinite(Number(computedPrice)) && Number(computedPrice) >= 0;
    const canSave = !saving && !loading && !scheduleLoading && priceReady;

    const handleSave = async () => {
        if (!canSave) return; // bezpieczeństwo
        try {
            setSaving(true);
            const doc = await saveActivitiesSchedule(activitiesSchedule, miejsceDocelowe, miejsceStartowe, dataPrzyjazdu, dataWyjazdu, liczbaUczestnikow, liczbaOpiekunow, standardHotelu, standardTransportu, computedPrice);
            console.log("Zapisano", doc)
        } catch (e) {
            alert(e.message || 'Wystąpił błąd podczas zapisu planu.');
        } finally {
            setSaving(false);
        }
    };

    const lastIdx = activitiesSchedule[Math.min(wybranyDzien, activitiesSchedule.length - 1)].length - 1;

    return (
        <KonfiguratorWyjazduCompMainbox>
            <div className="konifuguratorMainboxTitle">
                <div className="title-left">Plan dnia</div>
                <div className="title-right">


                    <SaveButton
                        onClick={handleSaveClick}
                        disabled={!hasPendingAutoSave}
                        title={
                            computingPrice
                                ? 'Poczekaj aż zakończy się liczenie ceny'
                                : (loading || scheduleLoading)
                                    ? 'Poczekaj aż zakończy się wczytywanie planu'
                                    : 'Zapisz aktualny plan'
                        }
                    >
                        {saving
                            ? 'Zapisywanie…'
                            : computingPrice
                                ? 'Czekaj na cenę…'
                                : (loading || scheduleLoading)
                                    ? 'Ładowanie…'
                                    : <><Save size={20} />Zapisz</>}
                    </SaveButton>
                </div>
            </div>

            {/* Nawigacja po dniach */}
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
                            style={{ display: "none" }}
                        />
                        <NavBarButton htmlFor={`day-${i}`}>
                            <a>{liczbaDni < 14 ? "Dzień" : ""}</a> <span>{i + 1}</span>
                        </NavBarButton>
                    </React.Fragment>
                ))}
            </KonfiguratorNavBar>

            <KonfiguratorWyjazduBottom>
                <KonfiguratorWyjazduOutbox key={activitiesSchedule}>
                    {(!loading && !scheduleLoading && timeSchedule.length) ? (
                        <>
                            <DragDropContext
                                onDragEnd={(result) => {
                                    if (!result.destination) return;
                                    const sourceIndex = result.source.index;
                                    const destIndex = result.destination.index;
                                    if (destIndex === 0 || destIndex === lastIdx) return;
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
                                                {liczbaDni > 0 &&
                                                    activitiesSchedule.length === liczbaDni &&
                                                    wybranyDzien < liczbaDni &&
                                                    activitiesSchedule[Math.min(wybranyDzien, activitiesSchedule.length - 1)]
                                                        .map((atrakcja, idx) => {
                                                            // Bezpieczny indeks dnia w kontekście wszystkich tablic
                                                            const safeDayIndex = Math.min(
                                                                wybranyDzien,
                                                                activitiesSchedule.length - 1
                                                            );

                                                            // Bezpieczne „wiersze” z innych struktur – jeśli brak, dostajemy pustą tablicę
                                                            const routeDay = routeSchedule?.[safeDayIndex] || [];
                                                            const chosenTransportDay =
                                                                chosenTransportSchedule?.[safeDayIndex] || [];
                                                            const timeDay = timeSchedule?.[safeDayIndex] || [];

                                                            // Bezpieczny time – jeśli brak, niech będzie np. 0 minut
                                                            const timeMinutes =
                                                                typeof timeDay[idx] === "number" ? timeDay[idx] : 0;

                                                            // Czy w ogóle mamy trasę powyżej?
                                                            const hasRouteAbove =
                                                                idx > 0 && Array.isArray(routeDay) && routeDay[idx - 1];

                                                            // Bezpieczny chosenTransport – jeżeli brak danych, -1
                                                            const chosenTransportValue =
                                                                idx > 0 &&
                                                                    Array.isArray(chosenTransportDay) &&
                                                                    chosenTransportDay.length >= idx
                                                                    ? chosenTransportDay[idx - 1]
                                                                    : -1;

                                                            const routeAbove = hasRouteAbove ? (
                                                                <RouteResult
                                                                    key={`route-${safeDayIndex}-${idx}`}
                                                                    routes={routeDay[idx - 1]}
                                                                    onTransportChange={onTransportChange}
                                                                    dayIdx={safeDayIndex}
                                                                    actIdx={idx - 1}
                                                                    chosenTransport={chosenTransportValue}
                                                                />
                                                            ) : null;

                                                            return (
                                                                <React.Fragment
                                                                    key={`${atrakcja.googleId}-${safeDayIndex}-${idx}`}
                                                                >
                                                                    {routeAbove}
                                                                    <Draggable
                                                                        draggableId={`${atrakcja.googleId}-${safeDayIndex}-${idx}`} // UNIKALNE W OBRĘBIE LISTY
                                                                        index={idx}
                                                                        isDragDisabled={idx === 0 || idx === lastIdx}
                                                                    >
                                                                        {(provided, snapshot) => (
                                                                            <DraggableWrap
                                                                                ref={provided.innerRef}
                                                                                {...provided.draggableProps}
                                                                                {...provided.dragHandleProps}
                                                                                style={{
                                                                                    display: "flex",
                                                                                    flexDirection: "column",
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
                                                                                    lastIdx={lastIdx}
                                                                                    dayIdx={safeDayIndex}
                                                                                    actIdx={idx}
                                                                                    swapActivities={swapActivities}
                                                                                    attraction={atrakcja}
                                                                                    time={minutesToTime(timeMinutes)}
                                                                                    startModifyingAct={startModifyingAct}
                                                                                    deleteActivity={deleteActivity}
                                                                                    changeStartHour={changeStartHour}
                                                                                    checkOut={checkOut}
                                                                                    changeActivity={changeActivity}
                                                                                />
                                                                                <MobileResult
                                                                                    onAttractionTimeChange={onAttractionTimeChange}
                                                                                    lastIdx={lastIdx}
                                                                                    dayIdx={safeDayIndex}
                                                                                    actIdx={idx}
                                                                                    swapActivities={swapActivities}
                                                                                    attraction={atrakcja}
                                                                                    time={minutesToTime(timeMinutes)}
                                                                                    startModifyingAct={startModifyingAct}
                                                                                    deleteActivity={deleteActivity}
                                                                                    changeStartHour={changeStartHour}
                                                                                    checkOut={checkOut}
                                                                                    changeActivity={changeActivity}
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
                    )}
                </KonfiguratorWyjazduOutbox>
            </KonfiguratorWyjazduBottom>
        </KonfiguratorWyjazduCompMainbox>
    );
};
