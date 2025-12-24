import { useDebugValue, useEffect, useState } from "react";
import styled from "styled-components"
import { getStr, readURL } from "./konfiguratorMain";
import { fetchTripPlanById, PreConfigureHeader } from "./preConfigure";
import { TripTimeline } from "./activitiesTable";
import { RealizationInfoCard } from "./stepsInfo";
import { FileX } from "lucide-react";
import { RealizationActionCard } from "./confirmationPopup";
import { TermsAndConditionsCard } from "./regulaminTile";
import { useNavigate } from "react-router-dom";

const RealizationPageMainbox = styled.div`
    width: 100%;
    min-height: 100vw;
    margin-top: 100px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-direction: column;
    gap: 10px;
    
`
export const TilesRowWrapper = styled.div`
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: center;
    width: 90%;
    gap: 10px;
    flex-wrap: wrap; /* To sprawi, że jeśli się nie zmieszczą, to spadną */
    max-width: 1600px;

    /* ✅ Tutaj media query zadziała poprawnie */
    &.b{
        padding: 0 16px;
        box-sizing: border-box;
        gap: 20px;
    }
    @media screen and (max-width: 800px){
        flex-direction: column;
        align-items: stretch; /* W kolumnie zazwyczaj chcemy centrować elementy */
    }
`
export const RealizationPage = () => {

    const navigate = useNavigate();

    const [tripId, setTripId] = useState(() => {
        const fromURL = getStr(readURL().searchParams.get("tripId"));
        if (fromURL != null) return fromURL;
        return "";
    });
    const [photoWallpaper, setPhotoWallpaper] = useState(
        "https://images.unsplash.com/photo-1633268456308-72d1c728943c?auto=format&fit=crop&w=1600&q=80"
    );
    const [nazwaWyjazdu, setNazwaWyjazdu] = useState("Twój wyjazd")
    const [synchronisedPlan, setSynchronisedPlan] = useState(null);
    const [planLoading, setPlanLoading] = useState(false);
    const [planReady, setPlanReady] = useState(false);
    const [planError, setPlanError] = useState(null);
    const [activitiesSchedule, setActivitiesSchedule] = useState(null)
    useEffect(() => {
        const id = String(tripId || "").trim();

        if (!id) {
            setSynchronisedPlan(null);
            setPlanLoading(false);
            setPlanError(null);
            setPlanReady(true);
            return;
        }

        const ac = new AbortController();
        setPlanLoading(true);
        setPlanError(null);
        setPlanReady(false);

        (async () => {
            try {
                const plan = await fetchTripPlanById(id, { signal: ac.signal });
                setSynchronisedPlan(plan); // plan albo null (gdy 404)
            } catch (e) {
                if (e?.name !== "AbortError") {
                    setPlanError(e?.message || "Fetch error");
                }
            } finally {
                if (!ac.signal.aborted) {
                    setPlanLoading(false);
                    setPlanReady(true);
                }
            }
        })();

        return () => ac.abort();
    }, [tripId]);

    useEffect(() => {
        if (synchronisedPlan?.realizationStatus) {
            navigate(`/konfigurator-lounge/?tripId=${tripId}`);
            return; // opcjonalnie, żeby nie ustawiać state po redirect
        }
        console.log(synchronisedPlan)
        setNazwaWyjazdu(synchronisedPlan?.nazwa || "Twój wyjazd")
        setPhotoWallpaper(synchronisedPlan?.photoLink || "https://images.unsplash.com/photo-1633268456308-72d1c728943c?auto=format&fit=crop&w=1600&q=80")
        setActivitiesSchedule(synchronisedPlan?.activitiesSchedule || null)
    }, [synchronisedPlan])
    return (

        <RealizationPageMainbox>
            <PreConfigureHeader>
                <div
                    className="preConfigureHeaderImage"
                    style={{ backgroundImage: `url(${photoWallpaper})` }}
                >
                    <div className="wyjazdNazwa">
                        <div
                            className="wyjazdNazwaInput"

                        >
                            {nazwaWyjazdu ?? ""}
                        </div>
                    </div>
                </div>

            </PreConfigureHeader>
            <TilesRowWrapper>
                <RealizationInfoCard />
                {activitiesSchedule && <TripTimeline activitiesSchedule={activitiesSchedule} />}
            </TilesRowWrapper>
            <TilesRowWrapper>
                <RealizationActionCard
                    tripName={nazwaWyjazdu}
                    dates="29.11 - 02.12.2025" // Podepnij dane z synchronisedPlan
                    participantsCount={3}      // Podepnij dane z synchronisedPlan
                    estimatedCost={450}        // Podepnij dane z synchronisedPlan
                    tripId={tripId}
                />
                <TermsAndConditionsCard />
            </TilesRowWrapper>

        </RealizationPageMainbox>
    )
}