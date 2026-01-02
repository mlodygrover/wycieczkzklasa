
import { minutesToStringTime } from "./roots/attractionResults";

import React, { use, useEffect, useRef, useState } from "react";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import styled from "styled-components";
import VariantButton from "./variantButton";
import { BadgeCheck, Drama, Landmark, Route, Ticket, Timer, Info, X } from "lucide-react";

const AttractionResultMedium = styled.div`
    width: 90%;
    max-width: 300px;
    min-width: 250px;
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

// --- STYLES ---

const AttractionResultMediumVerifiedComponentMainbox = styled.div`
    max-width: 300px;
    min-width: 250px;
    width: 90%;
    min-height: 300px;
    border-radius: 15px;
    background-size: cover;
    background-position: center;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    padding: 10px;
    position: relative;
    transition: background-image 0.3s ease-in-out;
    background-color: #f0f0f0;
    overflow: hidden; /* Ważne dla overlay */

    .leaflet-bottom.leaflet-right {
        display: block;
        background-color: rgba(255, 0, 0, 0);
        color: black;
        margin-bottom: auto;
        a { color: black; }
    }

    .leaflet-top.leaflet-left { display: block; }

    &::before {
        border-radius: 15px;
        content: '';
        position: absolute;
        inset: 0;
        /* Lżejszy gradient, bo opis jest teraz w overlay */
        background: linear-gradient(180deg, transparent 40%, rgba(0, 0, 0, 0.4) 70%, rgba(0, 0, 0, 0.8) 100%);
        z-index: 1;
    }

    .verifiedLabels {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between; /* Rozstrzelenie elementów (kategorie po lewej, info po prawej) */
        width: 100%;
        margin-bottom: auto;
        position: relative;
        z-index: 2; /* Musi być nad overlay */

        .left-icons {
            display: flex;
            gap: 5px;
        }

        .categoryIcon {
            height: 35px;
            min-width: 35px;
            background-color: #008d73ff;
            border-radius: 8px;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);

            img { filter: brightness(0) invert(1); }
            &.b { background-color: #0026ffff; }
        }

        /* Przycisk Info */
        .infoButton {
            height: 35px;
            width: 35px;
            background-color: rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(4px);
            border-radius: 50%;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: background-color 0.2s;
            border: 1px solid rgba(255,255,255,0.3);

            &:hover {
                background-color: rgba(255, 255, 255, 0.4);
            }
        }
    }
`;

/* --- INFO OVERLAY STYLE --- */
const InfoOverlay = styled.div`
    position: absolute;
    inset: 0;
    background-color: rgba(20, 20, 20, 0.95); /* Ciemne tło dla czytelności */
    z-index: 10; /* Nad wszystkim innym */
    padding: 20px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    color: white;
    transform: translateY(${props => props.$isOpen ? '0' : '100%'}); /* Animacja wysuwania */
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 15px;
    overflow-y: auto; /* Scroll jeśli opis długi */

    .overlay-header {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        border-bottom: 1px solid rgba(255,255,255,0.1);
        padding-bottom: 10px;

        h4 {
            margin: 0;
            font-size: 14px;
            font-weight: 600;
            color: #008d73;
        }

        .close-btn {
            cursor: pointer;
            color: #aaa;
            &:hover { color: white; }
        }
    }

    .description-text {
        font-size: 13px;
        line-height: 1.5;
        color: #e0e0e0;
        font-weight: 300;
        text-align: left;
        white-space: pre-wrap; /* Zachowuje akapity */
    }
`;

const VerifiedMediumMainbox = styled.div`
    width: 100%;
    border-radius: 15px;
    color: white;
    padding: 10px 2px;
    font-size: 14px;
    font-weight: 600;
    z-index: 3;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
    box-sizing: border-box;
    position: relative;

    .attractionResultMediumTitleBox {
        width: 100%;
        min-height: 50px;
        display: flex;
        flex-direction: row;
        align-items: stretch;
        justify-content: flex-start;

        .titleTextBox {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: center;
            margin-bottom: 5px;
            
            .attractionResultMediumTitle {
                font-size: 16px;
                width: 100%;
                text-align: left;
                font-family: Inter, system-ui, -apple-system, sans-serif;
                font-weight: 700;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
            }

            .attractionResultMediumSubtitle {
                font-size: 12px;
                color: #e0e0e0;
                font-weight: 500;
                text-align: left;
                width: 100%;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);

                &.b {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    justify-content: space-between;
                    margin-top: 6px;
                    gap: 2px;
                    a { text-decoration: none; color: inherit; }
                    span {
                        display: flex;
                        align-items: center;
                        gap: 4px;
                    }
                }
            }
        }
    }

    .attractionResultMediumAddBox {
        height: 30px;
        width: 100%;
        background-color: #008d73ff;
        color: #f0f0f0;
        border-radius: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: 0.3s ease-in-out;
        box-sizing: border-box;
        margin: 0;

        &:hover {
            background-color: #007a61ff;
        }
    }
`;

// --- HELPER FUNCTION ---
async function getWikipediaDescription(attractionName, lang = 'pl') {
    try {
        const encodedName = encodeURIComponent(attractionName.trim());
        const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodedName}`;
        const response = await fetch(url);
        if (!response.ok) return null;
        const data = await response.json();
        return data.extract;
    } catch (error) {
        console.error("Błąd pobierania opisu:", error);
        return null;
    }
}

// --- COMPONENT ---

export const AttractionResultMediumVerifiedComponent = ({
    atrakcja,
    wybranyDzien,
    addActivity,
    typ = 1,
    latMD,
    lngMD,
    sourcePlace = false
}) => {
    const containerRef = useRef(null);
    const [bgImage, setBgImage] = useState(null);
    const [description, setDescription] = useState(atrakcja.opis || null);
    
    // Stan do obsługi panelu informacyjnego
    const [isInfoOpen, setIsInfoOpen] = useState(false);

    const [wariantsOpened, setWariantsOpened] = useState(false);
    const wariantButtonRef = useRef(null);
    const [selectedVariant, setSelectedVariant] = useState(null);

    const FALLBACK_WALLPAPER = 'https://images.unsplash.com/photo-1716481631637-e2d4fd2456e2?q=80&w=870&auto=format&fit=crop';
    
    const hasCoords = atrakcja?.lokalizacja && 
                      typeof atrakcja.lokalizacja.lat === 'number' && 
                      typeof atrakcja.lokalizacja.lng === 'number';

    function getStaticMapUrl(lat, lng, zoom = 10) {
        const latRad = (lat * Math.PI) / 180;
        const n = Math.pow(2, zoom);
        const xTile = Math.floor(((lng + 180) / 360) * n);
        const yTile = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n);
        return `https://tile.openstreetmap.org/${zoom}/${xTile}/${yTile}.png`;
    }

    let targetUrl = FALLBACK_WALLPAPER;
    if (atrakcja?.wallpaper) {
        targetUrl = atrakcja.wallpaper;
    } else if (typ === 2 && hasCoords) {
        targetUrl = getStaticMapUrl(atrakcja.lokalizacja.lat, atrakcja.lokalizacja.lng, 14);
    } else if (typ === 2 && !hasCoords) {
        targetUrl = atrakcja.wallpaper || FALLBACK_WALLPAPER;
    }

    // Lazy Loading
    useEffect(() => {
        if (typ === 3 && hasCoords && targetUrl === FALLBACK_WALLPAPER) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setBgImage(`url(${targetUrl})`);
                        if (!description && atrakcja.nazwa) {
                            getWikipediaDescription(atrakcja.nazwa).then(desc => {
                                if (desc) setDescription(desc);
                            });
                        }
                        observer.unobserve(entry.target);
                    }
                });
            },
            { rootMargin: "100px", threshold: 0.01 }
        );

        if (containerRef.current) observer.observe(containerRef.current);
        return () => { if (containerRef.current) observer.unobserve(containerRef.current); };
    }, [targetUrl, typ, hasCoords, description, atrakcja.nazwa]);

    // Variant Logic
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wariantButtonRef.current && !wariantButtonRef.current.contains(event.target)) {
                setWariantsOpened(false);
            }
        };
        if (wariantsOpened) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [wariantsOpened]);

    useEffect(() => {
        if (atrakcja?.warianty && atrakcja.warianty.length > 0) {
            atrakcja.czasZwiedzania = atrakcja.warianty[0].czasZwiedzania || 60;
            atrakcja.cenaZwiedzania = atrakcja.warianty[0].cenaZwiedzania || 0;
        } else {
            atrakcja.czasZwiedzania = 60;
            atrakcja.cenaZwiedzania = 0;
        }
    }, [atrakcja]);

    function setWariant(idx) {
        setSelectedVariant(idx);
        atrakcja.czasZwiedzania = atrakcja.warianty[idx].czasZwiedzania || 60;
        atrakcja.cenaZwiedzania = atrakcja.warianty[idx].cenaZwiedzania || 0;
        atrakcja.chosenWariant = atrakcja.warianty[idx].nazwaWariantu;
        atrakcja.selectedVariant = idx;
    }

    function formatDistanceKm(latA, lngA, latB, lngB) {
        const toRad = (deg) => (deg * Math.PI) / 180;
        const R = 6371; 
        const dLat = toRad(latB - latA);
        const dLng = toRad(lngB - lngA);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(latA)) * Math.cos(toRad(latB)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return `${(R * c).toFixed(1)} km`;
    }

    // Toggle Info Panel
    const toggleInfo = (e) => {
        e.stopPropagation(); // Zapobiegamy innym akcjom
        setIsInfoOpen(!isInfoOpen);
    };

    return (
        <AttractionResultMediumVerifiedComponentMainbox
            ref={containerRef}
            style={((typ === 1 || typ === 2 || typ === 3) && bgImage) ? { backgroundImage: bgImage } : { backgroundColor: '#f0f0f0' }}
        >
            {/* Tło Mapy (tylko dla typ=3) */}
            {typ === 3 && hasCoords && targetUrl === FALLBACK_WALLPAPER && (
                <div style={{ position: 'absolute', inset: 0, borderRadius: 15, overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
                    <MapContainer center={[atrakcja.lokalizacja.lat, atrakcja.lokalizacja.lng]} zoom={13} style={{ width: '100%', height: '100%' }} scrollWheelZoom={false} dragging={false} doubleClickZoom={false} zoomControl={false} attributionControl={false}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Marker position={[atrakcja.lokalizacja.lat, atrakcja.lokalizacja.lng]} />
                    </MapContainer>
                </div>
            )}

            {/* --- GÓRNA BELKA (Ikony + Info) --- */}
            <div className="verifiedLabels">
                <div className="left-icons">
                    <div className="categoryIcon">
                        {atrakcja?.googleId?.includes("dAct_event") ? <Drama /> : <Landmark />}
                    </div>
                    {typ === 1 && <div className="categoryIcon b"><BadgeCheck /></div>}
                </div>

                {/* Przycisk Info - widoczny tylko jeśli jest opis */}
                {description && (
                    <div className="infoButton" onClick={toggleInfo} title="Pokaż opis">
                        <Info size={20} />
                    </div>
                )}
            </div>

            {/* --- PANEL INFORMACYJNY (Overlay) --- */}
            <InfoOverlay $isOpen={isInfoOpen} onClick={toggleInfo}>
                <div className="overlay-header">
                    <h4>Informacje o atrakcji</h4>
                    <X size={18} className="close-btn" />
                </div>
                <div className="description-text">
                    {description}
                </div>
            </InfoOverlay>

            {/* --- GŁÓWNA ZAWARTOŚĆ KAFELKA --- */}
            <VerifiedMediumMainbox>
                <div className="attractionResultMediumTitleBox">
                    <div className="titleTextBox">
                        <div className="attractionResultMediumTitle">{atrakcja?.nazwa ?? 'Atrakcja turystyczna'}</div>
                        <div className="attractionResultMediumSubtitle">{atrakcja?.adres ?? 'Adres atrakcji'}</div>
                        
                        <div className="attractionResultMediumSubtitle b">
                            <span><Timer size={15} /> {atrakcja.czasZwiedzania != null ? ` ${atrakcja.czasZwiedzania} min` : ''}</span>
                            <span><Ticket size={15} /> {(!Array.isArray(atrakcja?.warianty) || atrakcja.warianty.length === 0) ? 'Dodaj aby obliczyć' : atrakcja?.cenaZwiedzania === 0 ? 'Bezpłatne' : atrakcja?.cenaZwiedzania != null ? `${Number(atrakcja.cenaZwiedzania)} zł` : ''}</span>
                            {(atrakcja?.lokalizacja && typeof latMD === 'number' && typeof lngMD === 'number') && (
                                <span><Route size={15} /> <a href={atrakcja.stronaInternetowa} target="_blank" rel="noreferrer">{formatDistanceKm(atrakcja.lokalizacja.lat, atrakcja.lokalizacja.lng, latMD, lngMD)}</a></span>
                            )}
                        </div>
                    </div>
                </div>

                {atrakcja?.warianty && atrakcja.warianty.length > 1 && (
                    <div ref={wariantButtonRef} style={{marginBottom: '10px'}}>
                        <VariantButton variants={atrakcja.warianty} onSelect={setWariant} selectedVariantInit={selectedVariant} typ={2} sourcePlace={sourcePlace} />
                    </div>
                )}

                <div className="attractionResultMediumAddBox" onClick={() => addActivity(wybranyDzien, atrakcja)}>
                    + Dodaj do dnia
                </div>
            </VerifiedMediumMainbox>
        </AttractionResultMediumVerifiedComponentMainbox>
    );
};