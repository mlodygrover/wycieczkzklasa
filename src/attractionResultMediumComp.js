
import { minutesToStringTime } from "./roots/attractionResults";

import VariantButton from "./variantButton";
// --- STYLES ---
import React, { use, useEffect, useRef, useState } from "react";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import styled from "styled-components";
// Usunąłem import VariantButton, bo zaimplementujemy przycisk i panel lokalnie
import { BadgeCheck, Drama, Landmark, Route, Ticket, Timer, Info, X, BookOpen, Camera, Map, Check, ChevronDown } from "lucide-react";
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


// --- STYLES (Główny kontener - bez zmian) ---
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
    overflow: hidden;

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
        background: linear-gradient(180deg, transparent 35%, rgba(0, 0, 0, 0.6) 60%);
        z-index: 1;
    }

    .verifiedLabels {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        margin-bottom: auto;
        position: relative;
        z-index: 2;

        .left-icons { display: flex; gap: 5px; }

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

        .infoButton {
            height: 35px;
            width: 35px;
            background-color: rgba(255, 255, 255, 0.95);
            border-radius: 50%;
            color: #008d73;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            &:hover { transform: scale(1.1); background-color: #fff; color: #006553; }
        }
    }
`;

/* --- PANEL OVERLAY (Wspólny styl dla Info i Wariantów) --- */
const OverlayPanel = styled.div`
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: linear-gradient(to bottom, #ffffff, #f8f9fa);
    z-index: 10;
    padding: 20px;
    display: flex;
    flex-direction: column;
    transform: translateY(${props => props.$isOpen ? '0' : '100%'});
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 15px;
    border-top: 4px solid #008d73;
    box-shadow: 0 -10px 25px rgba(0,0,0,0.15);

    &::after {
        content: ''; position: absolute; bottom: -20px; right: -20px; width: 120px; height: 120px;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23008d73' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z'/%3E%3Cpath d='M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z'/%3E%3C/svg%3E");
        background-repeat: no-repeat; opacity: 0.05; pointer-events: none; z-index: 0;
    }

    .overlay-header {
        width: 100%; display: flex; justify-content: space-between; align-items: center;
        margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px dashed #e2e8f0; z-index: 1;
        h4 {
            margin: 0; font-size: 15px; font-weight: 700; color: #1e293b; font-family: Inter, sans-serif;
            display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;
        }
        .close-btn { cursor: pointer; flex-shrink: 0;color: #94a3b8; transition: all 0.2s; &:hover { color: #ef4444; } }
    }

    .description-content {
        flex: 1; overflow-y: auto; padding-right: 5px; z-index: 1; margin-bottom: 10px;
        &::-webkit-scrollbar { width: 4px; }
        &::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 4px; }
    }

    .description-text {
        font-size: 13px; line-height: 1.6; color: #334155; font-weight: 400; text-align: left; white-space: pre-wrap;
    }

    .attribution-footer {
        margin-top: auto; padding-top: 10px; border-top: 1px solid #e2e8f0; z-index: 1; display: flex; flex-direction: column; gap: 6px;
        .attr-row {
            display: flex; align-items: center; gap: 6px; font-size: 10px; color: #64748b;
            svg { color: #008d73; width: 12px; height: 12px; }
            a { color: inherit; text-decoration: none; &:hover { text-decoration: underline; color: #008d73; } }
        }
    }
`;

/* --- LISTA WARIANTÓW (Stylizowana) --- */
const VariantList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
    z-index: 1;
    overflow-y: auto;
    padding-right: 5px;
    max-height: 100%;

    &::-webkit-scrollbar { width: 4px; }
    &::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 4px; }

    .variant-item {
        padding: 12px;
        background-color: #fff;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: all 0.2s;

        &:hover {
            border-color: #008d73;
            background-color: #f0fdf9;
        }

        &.active {
            border-color: #008d73;
            background-color: #ecfdf5;
            color: #008d73;
            font-weight: 600;
        }

        .var-name {
            font-size: 13px;
        }
        .var-price {
            font-size: 13px;
            font-weight: 600;
            color: #059669;
        }
    }
`;

/* --- BUTTON WYBORU WARIANTU (Styl podobny do VerifiedMediumMainbox) --- */
const VariantTriggerButton = styled.button`
    width: 100%;
    margin-bottom: 10px;
    height: 32px;
    background-color: #00b191; /* Odcień zieleni pasujący do kafelka */
    color: white;
    border: none;
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 12px;
    font-size: 13px;
    font-weight: 500;
    font-family: inherit;
    cursor: pointer;
    transition: background 0.3s;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);

    &:hover {
        background-color: #00967b;
    }

    svg { opacity: 0.8; }
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
        width: 100%; min-height: 50px; display: flex; flex-direction: row; align-items: stretch; justify-content: flex-start;
        .titleTextBox {
            flex: 1; display: flex; flex-direction: column; align-items: flex-start; justify-content: center; margin-bottom: 5px;
            .attractionResultMediumTitle {
                font-size: 16px; width: 100%; text-align: left; font-family: Inter, system-ui, -apple-system, sans-serif; font-weight: 700; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
            }
            .attractionResultMediumSubtitle {
                font-size: 12px; color: #e0e0e0; font-weight: 500; text-align: left; width: 100%; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
                &.b {
                    display: flex; flex-direction: row; align-items: center; justify-content: space-between; margin-top: 6px; gap: 2px;
                    a { text-decoration: none; color: inherit; }
                    span { display: flex; align-items: center; gap: 4px; }
                }
            }
        }
    }

    .attractionResultMediumAddBox {
        height: 30px; width: 100%; background-color: #008d73ff; color: #f0f0f0; border-radius: 5px;
        display: flex; align-items: center; justify-content: center; text-align: center; font-size: 14px; font-weight: 500; cursor: pointer; transition: 0.3s ease-in-out; box-sizing: border-box; margin: 0;
        &:hover { background-color: #007a61ff; }
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
        return null;
    }
}
const port = process.env.REACT_APP__SERVER_API_SOURCE || "https://wycieczkzklasa.onrender.com";
export function getOptimizedImage(url, w = 200, h = 200) {
    if (!url) return "";
    return `${port}/imgCompression?url=${encodeURIComponent(url)}&w=${300}&h=${300}`;
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

    // Stan paneli (tylko jeden otwarty na raz)
    const [activeOverlay, setActiveOverlay] = useState(null); // 'info' | 'variants' | null

    const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);

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

    let originalTargetUrl = FALLBACK_WALLPAPER;

    if (atrakcja?.wallpaper) {
        originalTargetUrl = atrakcja.wallpaper;
    } else if (typ === 2 && hasCoords) {
        originalTargetUrl = getStaticMapUrl(atrakcja.lokalizacja.lat, atrakcja.lokalizacja.lng, 14);
    } else if (typ === 2 && !hasCoords) {
        originalTargetUrl = atrakcja.wallpaper || FALLBACK_WALLPAPER;
    }

    // dobór rozmiaru zależnie od typu kafla
    const optimizedTargetUrl =
        typ === 1
            ? getOptimizedImage(originalTargetUrl, 500, 350)
            : typ === 2
                ? getOptimizedImage(originalTargetUrl, 700, 450)
                : getOptimizedImage(originalTargetUrl, 900, 500);


    // Wykrywanie źródeł
    const isWikipediaImage = originalTargetUrl.includes('wikimedia.org');
    const isUnsplashImage = originalTargetUrl.includes('unsplash.com');
    const isGoogleSource = atrakcja.dataSource === 'Google' || (atrakcja.googleId && !atrakcja.googleId.startsWith('custom_') && !atrakcja.googleId.startsWith('dAct_'));
    const googleMapsUrl = atrakcja.googleId
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(atrakcja.nazwa)}&query_place_id=${atrakcja.googleId}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(atrakcja.nazwa)}`;

    // Lazy Loading
    useEffect(() => {
        if (typ === 3 && hasCoords && originalTargetUrl === FALLBACK_WALLPAPER) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setBgImage(`url(${optimizedTargetUrl})`);

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

        return () => {
            if (containerRef.current) observer.unobserve(containerRef.current);
        };
    }, [optimizedTargetUrl, typ, hasCoords, description, atrakcja.nazwa, originalTargetUrl]);


    // Initial Variant Setup
    useEffect(() => {
        if (atrakcja?.warianty && atrakcja.warianty.length > 0) {
            updateVariantData(0); // Domyślnie pierwszy
        } else {
            atrakcja.czasZwiedzania = 60;
            atrakcja.cenaZwiedzania = 0;
        }
    }, [atrakcja]);

    const updateVariantData = (idx) => {
        if (!atrakcja.warianty || !atrakcja.warianty[idx]) return;

        setSelectedVariantIdx(idx);
        atrakcja.czasZwiedzania = atrakcja.warianty[idx].czasZwiedzania || 60;
        atrakcja.cenaZwiedzania = atrakcja.warianty[idx].cenaZwiedzania || 0;
        atrakcja.chosenWariant = atrakcja.warianty[idx].nazwaWariantu;
        atrakcja.selectedVariant = idx;
    };

    function formatDistanceKm(latA, lngA, latB, lngB) {
        const toRad = (deg) => (deg * Math.PI) / 180;
        const R = 6371;
        const dLat = toRad(latB - latA);
        const dLng = toRad(lngB - lngA);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(latA)) * Math.cos(toRad(latB)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return `${(R * c).toFixed(1)} km`;
    }

    const toggleOverlay = (type, e) => {
        e.stopPropagation();
        setActiveOverlay(activeOverlay === type ? null : type);
    };

    return (
        <AttractionResultMediumVerifiedComponentMainbox
            ref={containerRef}
            style={((typ === 1 || typ === 2 || typ === 3) && bgImage) ? { backgroundImage: bgImage } : { backgroundColor: '#f0f0f0' }}
        >
            {/* Tło Mapy */}
            {typ === 3 && hasCoords && originalTargetUrl === FALLBACK_WALLPAPER && (
                <div style={{ position: 'absolute', inset: 0, borderRadius: 15, overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
                    <MapContainer center={[atrakcja.lokalizacja.lat, atrakcja.lokalizacja.lng]} zoom={13} style={{ width: '100%', height: '100%' }} scrollWheelZoom={false} dragging={false} doubleClickZoom={false} zoomControl={false} attributionControl={false}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Marker position={[atrakcja.lokalizacja.lat, atrakcja.lokalizacja.lng]} />
                    </MapContainer>
                </div>
            )}

            {/* --- GÓRNA BELKA --- */}
            <div className="verifiedLabels">
                <div className="left-icons">
                    <div className="categoryIcon">
                        {atrakcja?.googleId?.includes("dAct_event") ? <Drama /> : <Landmark />}
                    </div>
                    {typ === 1 && <div className="categoryIcon b"><BadgeCheck /></div>}
                </div>

                <div className="infoButton" onClick={(e) => toggleOverlay('info', e)} title="Pokaż szczegóły">
                    <Info size={20} />
                </div>
            </div>

            {/* --- PANEL INFO --- */}
            <OverlayPanel $isOpen={activeOverlay === 'info'}>
                <div className="overlay-header">
                    <h4>{atrakcja.nazwa}</h4>
                    <X size={20} className="close-btn" onClick={(e) => toggleOverlay('info', e)} />
                </div>
                <div className="description-content">
                    <div className="description-text">
                        {description || "Brak opisu dla tej atrakcji."}
                    </div>
                </div>
                <div className="attribution-footer">
                    {description && (
                        <div className="attr-row">
                            <BookOpen />
                            <span>Opis: <a href={`https://pl.wikipedia.org/wiki/${encodeURIComponent(atrakcja.nazwa)}`} target="_blank" rel="noreferrer">Wikipedia</a></span>
                        </div>
                    )}
                    {isGoogleSource && (
                        <div className="attr-row">
                            <Map />
                            <span>Dane: <a href={googleMapsUrl} target="_blank" rel="noreferrer">Google Maps</a></span>
                        </div>
                    )}
                    {isWikipediaImage && (
                        <div className="attr-row">
                            <Camera />
                            <span>
                                Zdjęcie: <a href={originalTargetUrl} target="_blank" rel="noreferrer">Wikimedia Commons</a>
                            </span>
                        </div>
                    )}
                    {isUnsplashImage && <div className="attr-row"><Camera /><span>Zdjęcie: <a href="https://unsplash.com/" target="_blank" rel="noreferrer">Unsplash</a></span></div>}
                </div>
            </OverlayPanel>

            {/* --- PANEL WARIANTÓW (ZAMIAST DROPDOWNA) --- */}
            <OverlayPanel $isOpen={activeOverlay === 'variants'}>
                <div className="overlay-header">
                    <h4>Wybierz wariant</h4>
                    <X size={20} className="close-btn" onClick={(e) => toggleOverlay('variants', e)} />
                </div>

                <VariantList>
                    {atrakcja.warianty?.map((wariant, idx) => (
                        <div
                            key={idx}
                            className={`variant-item ${selectedVariantIdx === idx ? 'active' : ''}`}
                            onClick={() => {
                                updateVariantData(idx);
                                setActiveOverlay(null); // Zamknij po wyborze
                            }}
                        >
                            <span className="var-name">{wariant.nazwaWariantu}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {wariant.cenaZwiedzania != null && (
                                    <span className="var-price">{wariant.cenaZwiedzania} zł</span>
                                )}
                                {selectedVariantIdx === idx && <Check size={16} />}
                            </div>
                        </div>
                    ))}
                </VariantList>
            </OverlayPanel>

            {/* --- GŁÓWNA ZAWARTOŚĆ --- */}
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

                {/* PRZYCISK WYBORU WARIANTU (JEŚLI WIĘCEJ NIŻ 1) */}
                {atrakcja?.warianty && atrakcja.warianty.length > 1 && (
                    <VariantTriggerButton onClick={(e) => toggleOverlay('variants', e)}>
                        {atrakcja.warianty[selectedVariantIdx]?.nazwaWariantu || "Wybierz wariant"}
                        <ChevronDown size={16} />
                    </VariantTriggerButton>
                )}

                <div className="attractionResultMediumAddBox" onClick={() => addActivity(wybranyDzien, atrakcja)}>
                    + Dodaj do dnia
                </div>
            </VerifiedMediumMainbox>
        </AttractionResultMediumVerifiedComponentMainbox>
    );
};