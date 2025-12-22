import { useEffect, useState, useCallback, use, useRef } from "react";
import axios from "axios";
import debounce from "lodash.debounce";
import styled, { keyframes } from "styled-components";

import { AttractionResultSmall, minutesToStringTime } from "./roots/attractionResults";
import TopKreatorSlider from "./roots/topKreatorSlider";
import { DataWybor, MapaBox, MapaResultBox, PopupResult, SearchBox } from "./konfiguratorWyjazdu";
import TransportSelector from "./roots/transportWybor";
import HotelStandardSelector from "./roots/hotelandtransport";
import BookingGuestsPicker from "./roots/uczestnicyWybor";
import BookingDatePicker from "./roots/wybordaty";
import MapLocationPicker from "./roots/wyborLokalizacji";
import LeafletMap from "./roots/googleMapViewer";
import { WyborUczestnikow } from "./konfigurator/wyborUczestnikow";
import Radio1 from "./roots/radio1";
import { KonfiguratorWyjazduComp, roznicaDni, SaveButton } from "./konfigurator/konfiguratorWyjazduComp";
import { AddActivityNavButton, AddActivityPanel, AddActivityPanelNav, PanelBoxNav } from "./konfigurator/addActivityPanel";
import RouteMap from "./routeMap";
import { parseJSON } from "date-fns";
import AttractionResultMediumComponent, { AttractionResultMediumVerifiedComponent } from "./attractionResultMediumComp";
import { Checkbox2 } from "./checkbox1";
import { AlertsBox } from "./konfigurator/alertsBox";
import { ChatBox } from "./konfigurator/chatBox";
import { ChatBox2 } from "./konfigurator/chatBox2";
import { CostSummary } from "./konfigurator/costSummary";
import { time } from "framer-motion";

// === user store (global auth) ===
import useUserStore, { fetchMe } from "./usercontent";
import { data, useNavigate } from "react-router-dom";
import AttractionsMap from "./attractionMap";
import { Bed, Calendar, CalendarDays, ChevronLeft, Drama, Edit, Edit2, Hotel, Landmark, Loader2, Moon, Rocket, Shrub, TramFront, Users } from "lucide-react";
import Loader from "./roots/loader";
import { PopupManager } from "./konfigurator/popupManager";
import { AddActivityNew } from "./addActivityNew";
import { format } from "url";
import { FeaturesSection } from "./brandTiles";


const port = process.env.REACT_APP__SERVER_API_SOURCE || "https://wycieczkzklasa.onrender.com";
const portacc = process.env.REACT_APP_API_SOURCE || "https://api.draftngo.com";

const testResults = [
    { nazwa: "Poznań", region: "Wielkopolska", kraj: "Polska" },
    { nazwa: "Luboń koło Poznania", region: "Wielkopolska", kraj: "Polska" },
    { nazwa: "Poznań", region: "Lubelskie", kraj: "Polska" },
    { nazwa: "Druzyna Poznańska", wojewodztwo: "Wielkopolska", kraj: "Polska" }
]
export const basicActivities = [
    {
        googleId: "dAct_przyjazdNaMiejsce",
        nazwa: "Przyjazd / zbiórka w miejscu docelowym",
        adres: "",
        ocena: 0,
        liczbaOpinie: 0,
        cenaZwiedzania: 0,
        czasZwiedzania: 45,
    },
    {
        googleId: "dAct_zakwaterowanie",
        nazwa: "Zakwaterowanie / przydział pokoi",
        adres: "",
        ocena: 0,
        liczbaOpinie: 0,
        cenaZwiedzania: 0,
        czasZwiedzania: 45,
    },
    {
        googleId: "dAct_spotkanieOrganizacyjne",
        nazwa: "Spotkanie organizacyjne / omówienie planu dnia",
        adres: "",
        ocena: 0,
        liczbaOpinie: 0,
        cenaZwiedzania: 0,
        czasZwiedzania: 45,
    },
    {
        googleId: "dAct_przerwaSniadaniowa",
        nazwa: "Przerwa śniadaniowa",
        adres: "",
        ocena: 0,
        liczbaOpinie: 0,
        cenaZwiedzania: 0,
        czasZwiedzania: 45,
    },
    {
        googleId: "dAct_przerwaObiadowa",
        nazwa: "Przerwa obiadowa",
        adres: "",
        ocena: 0,
        liczbaOpinie: 0,
        cenaZwiedzania: 0,
        czasZwiedzania: 45,
    },
    {
        googleId: "dAct_przerwaKawiarniana",
        nazwa: "Przerwa kawiarniana / na napoje",
        adres: "",
        ocena: 0,
        liczbaOpinie: 0,
        cenaZwiedzania: 0,
        czasZwiedzania: 45,
    },
    {
        googleId: "dAct_spacerOkolica",
        nazwa: "Spacer po okolicy (bez wstępów)",
        adres: "",
        ocena: 0,
        liczbaOpinie: 0,
        cenaZwiedzania: 0,
        czasZwiedzania: 45,
    },
    {
        googleId: "dAct_czasWolnyCentrum",
        nazwa: "Czas wolny w centrum miasta",
        adres: "",
        ocena: 0,
        liczbaOpinie: 0,
        cenaZwiedzania: 0,
        czasZwiedzania: 45,
    },
    {
        googleId: "dAct_sesjaZdjec",
        nazwa: "Czas na zdjęcia / pamiątki",
        adres: "",
        ocena: 0,
        liczbaOpinie: 0,
        cenaZwiedzania: 0,
        czasZwiedzania: 45,
    },
    {
        googleId: "dAct_przejscieMiedzyPunktami",
        nazwa: "Przejście piesze między punktami programu",
        adres: "",
        ocena: 0,
        liczbaOpinie: 0,
        cenaZwiedzania: 0,
        czasZwiedzania: 45,
    },
    {
        googleId: "dAct_czasNaToalete",
        nazwa: "Czas na toaletę / odświeżenie",
        adres: "",
        ocena: 0,
        liczbaOpinie: 0,
        cenaZwiedzania: 0,
        czasZwiedzania: 45,
    },
    {
        googleId: "dAct_integracjaGrupowa",
        nazwa: "Integracja grupowa / gry bezpłatne",
        adres: "",
        ocena: 0,
        liczbaOpinie: 0,
        cenaZwiedzania: 0,
        czasZwiedzania: 45,
    },
    {
        googleId: "dAct_wieczornyOdpoczynek",
        nazwa: "Wieczorny odpoczynek w hotelu",
        adres: "",
        ocena: 0,
        liczbaOpinie: 0,
        cenaZwiedzania: 0,
        czasZwiedzania: 45,
    },
    {
        googleId: "dAct_wykwaterowanie",
        nazwa: "Wykwaterowanie / zdanie pokoi",
        adres: "",
        ocena: 0,
        liczbaOpinie: 0,
        cenaZwiedzania: 0,
        czasZwiedzania: 45,
    },
    {
        googleId: "dAct_podsumowanieWyjazdu",
        nazwa: "Podsumowanie wyjazdu / informacja przed wyjazdem",
        adres: "",
        ocena: 0,
        liczbaOpinie: 0,
        cenaZwiedzania: 0,
        czasZwiedzania: 45,
    }
];

const namesTransportTab = ["Transport zbiorowy", "Wynajęty autokar", "Własny"]
const namesHotelsTab = ["Ośrodki kolonijne", "Hotele 2/3 gwiazdkowe", "Hotele premium", "Własny"]
const KonfiguratorMainMainbox = styled.div`
    width: 100%;
    
    display: flex;
    flex-direction: row;
    align-items: stretch;          /* <=== poprawka */
    justify-content: flex-start;
    position: relative;
    margin-top: 20px;
    border-top: 1px solid lightgray;
    @media screen and (max-width: 1000px){
        flex-direction: column;
        margin-top: 5px;
    }
`;

const KonfiguratorMainMainboxLeft = styled.div`
    width: 300px;
    flex: 0 0 300px;
    border-right: 1px solid lightgray;
    position: relative;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;


    &.right{
    padding-top: 10px;
        border-right: none;
        border-left: 1px solid lightgray;
    }
    height: fit-content;!important;
    /* ważne: lewa kolumna ma stałą wysokość z JS, a nadmiar treści przewija się w .listBox     overflow: hidden;*/


    .listBox {
        width: 100%;
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 5px;
        align-items: center;
        justify-content: flex-start;
        /* Firefox */
        scrollbar-width: none;

        /* Internet Explorer / stary Edge */
        -ms-overflow-style: none;
    }

    /* Chrome, Safari, nowy Edge (webkit) */
    .listBox::-webkit-scrollbar {
        display: none;
    }
    .listBox--hidden {
        display: none;
    }

    .googleLogoDiv{
        margin-top: 15px;
        border-top: 1px solid #d4d4d4;
        padding-top: 5px;
        width: 90%;
        display: flex;
        align-items: center;
        font-weight: 600;
        font-family: 'Inter';
        font-size: 22px;
        &.b{
            color: #5E5E5E;
            border-bottom: 1px solid  #d0d0d0;
        }
    }

    @media screen and (max-width: 1000px){
        width: 100%;
        &.a{
            display: none;
        }
    }

    .mainboxLeftTitle{
        width: 90%;
        display: flex;
        align-items: flex-start;
        justify-content: flex-start;
        padding: 10px 0;
        font-size: 18px;
        font-weight: 400;
    }  

    .mainboxLeftInput{
        width: 90%;
        height: 35px;
        background-color: #f6f6f6;
        border-radius: 10px;
        display: flex;
        flex-direction: row;
        align-items: stretch;
        justify-content: flex-start;
        padding-left: 10px;
        box-sizing: border-box;
        flex-shrink: 0;
        input{
            box-sizing: border-box;
            flex: 1;
            height: 100%;
            border: none;
            background-color: transparent;
            outline: none;
            padding-left: 10px;
            color: #606060;
        }
    }  
    .mainboxLeftFilterButtons{
        width: 90%;
        height: 35px;
        display: flex;
        flex-direction: row;
        align-items: stretch;
        justify-content: flex-start;
        margin: 5px auto;
        gap: 5px;

        flex-shrink: 0;
        .mainboxLeftFilterHeader{
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
        }
        .mainboxLeftFilterButton{
            flex: 1;
            background-color: #f6f6f6;
            border-radius: 10px;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            color: #606060;
            font-size: 13px;
            font-weight: 400;
            gap: inherit;
            transition: 0.3s ease;
            cursor: pointer;
            position: relative;
            .mainboxLeftFilterResults{
                font-weight: 400;
                position: absolute;
                height: 0px;
                width: 100%;
                left: 0;
                top: 100%;
                background-color: #f6f6f6;
                transition: 0.3s ease;
                overflow: hidden;
        
                .mainboxLeftFilterResult{
                    display: flex;
                    align-items: center;
                    justify-content: flex-start;
                    flex-direction: row;
                    width: 80%;
                    margin: 0 auto;
                    font-size: 14px;
                    color: black;
                    gap: 10px;
                    flex-shrink: 0;
                    margin-bottom: 5px;
                 
                }
            }
            img{
                transition: 0.3s ease;
            }
            &.opened{
                box-shadow: 2px 2px 2px lightgray;
                border-bottom-left-radius: 0;
                border-bottom-right-radius: 0;
                img{
                    transform: rotate(180deg);
                }
                .mainboxLeftFilterResults{
                    padding-top: 5px;
                    height: 100px;
                    box-shadow: 2px 2px 2px lightgray;
                    border-bottom-left-radius: 10px;
                    border-bottom-right-radius: 10px;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    justify-content: flex-start;
                }
            }
            &:hover{
                background-color: #f0f0f0;
            }
        }
    }
    .bottomGradient{
        position: absolute;
        bottom: 0;
        width: 100%;
        left: 0;
        background: #ffffff;
        background: linear-gradient(0deg,rgba(255, 255, 255, 1) 30%, rgba(255, 255, 255, 0.01) 100%);
        height: 60px;
        z-index: 10;
    }
`;

const KonfiguratorMainMainboxRight = styled.div`
    flex: 1;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    align-self: stretch;      /* <=== dopilnuj rozciągnięcia */
    @media screen and (max-height: 1000px){
        height: fit-content;
    }
`;

export const KonfiguratorRadioButton = styled.div`
    width: 45px;
    height: 45px;
    border-bottom: 3px solid #b0b0b0;
    transition: 0.3s ease-in-out;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    &.chosen{
        border-bottom: 3px solid #008d73ff;
    }
    &:hover{
       border-bottom: 3px solid #008d73ff;
    }
`
const SettingsButton = styled.div`
    flex: 1;
    height: 50px;
    position: relative;
    cursor: pointer;
    border-bottom: 3px solid white;
    transition: 0.3s ease-in-out;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: left;
    font-size: 15px;
    padding: 2px 5px;
    font-weight: 600;
    gap: 2px;
    color: white;
    svg{
        flex-shrink: 0;
    }
    &.chosen{
        border-bottom: 3px solid #008d73ff;
    }
    &:hover{
        border-bottom: 3px solid #008d73ff;
    }
    @media screen and (max-width: 1400px){
        font-size: 12px;
       
    }
    @media screen and (max-width: 1100px){
     svg {
            width: 20px;
            height: 20px;
        }
    }
    .settingsPopup{
        position: absolute;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        max-width: 400px;
        width: 95vw;
        min-height: 150px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background-color: #f9f9f9;
        padding: 10px;
        border-radius: 25px;
        box-shadow: 0px 0px 5px lightgray;
        z-index: 9993;
    }
`
const KonfiguratorMainSettings = styled.div`
    width: 100%;
    min-height: 80px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    transition: 0.3s ease-in-out;
    @media screen and (max-width: 1000px){
        display: none;
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
  overflow-y: auto;
  padding-top: 20px;
`;
const SummaryInfoBox = styled.div`
    background: linear-gradient(90deg, #008d73ff 0%, #22af95ff 100%);
    width: 90%;
    min-height: 100px;
    border-radius: 15px;
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    color: white;
    padding: 15px 5px;
    box-sizing: border-box;
     .googleLogoDiv{
        margin-top: 5px;
        width: 90%;
        display: flex;
        align-items: center;
    }
    .summaryInfoBoxTitle{
        margin: 0 auto;
        margin-bottom: 5px;
        font-size: 24px;
        width: 90%;
        text-align: left;
        font-family: Inter, system-ui, -apple-system, sans-serif;
        font-weight: 500;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: 10px;
        &.b{
            margin: 0 auto;
            font-size: 14px;
            font-weight: 400;
            margin-bottom: 5px;
        }
    }
    &.b{
        background: linear-gradient(90deg, rgba(184, 104, 0, 1) 0%, rgba(219, 187, 72, 1) 100%);
        .summaryInfoBoxTitle{
            font-size: 18px;
            &.b{
                font-size: 14px;
            }
        }
        .routeSummaryRow{
            box-sizing: border-box;
            padding: 10px;
            border-radius: 10px;
            width: 90%;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: flex-start;
            background-color: #00000011;
            margin: 2px auto;
            gap: 5px;
            text-align: left;
            .routeSummaryRowContent{
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                justify-content: center;
                font-size: 12px;
                a{
                    text-align: left;
                    font-weight: 600;
                }
            }
        }
    }
    .summaryInfoBoxMoreButton{
        color: #fefefe;
        font-weight: 400;
        font-size: 14px;
        margin-top: 5px;
        transition: 0.3s ease;
        cursor: pointer;
        text-decoration: underline;
        &:hover{
            color: #e0e0e0;
        }
    }
`

const InputPairBMainbox = styled.div`
    min-width: 150px;
    height: 60px;
    background-color: white;
    border: 1px solid lightgray;
    border-radius: 10px;
    position: relative;
    .inputPairDesc{
        position: absolute;
        left: 10px;
        top: -10px;
        font-size: 12px;
    }
`
const backgroundKenBurns = keyframes`
  0% {
    background-size: 105%;
    background-position: 50% 50%;
  }
  50% {
    background-size: 115%;
    background-position: 52% 48%;
  }
  100% {
    background-size: 105%;
    background-position: 50% 50%;
  }
`;

const KonfiguratorPhotoWithSettings = styled.div`
    margin-top: 85px;
    width: 98%;
    background-color: #f0f0f0;
    height: 600px;
    max-height: 50vh;
    border-radius: 50px;
    /* zamiast 'cover' dajemy konkretną wartość – animacja i tak będzie ją zmieniać */
    background-size: 105%;
    background-position: center;
    background-repeat: no-repeat;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-end;
    padding: 20px;
    box-sizing: border-box;
    @media (max-width: 600px) {
        /* tło ma zawsze pokryć cały box */
        background-size: cover;
        /* opcjonalnie – żeby uniknąć szarpania na mobile */
        animation: none;
        /* dodatkowo możesz ustawić stałą wysokość, jeśli chcesz */
        height: 300px;
    }
    /* 🔁 delikatne, cykliczne przesuwanie i zoom */
    animation: ${backgroundKenBurns} 40s ease-in-out infinite;

    &::before {
        border-radius: inherit;
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, transparent 50%, rgba(0, 0, 0, 0.56) 90%);
        /* gradient jest nad zdjęciem, ale pod treścią */
        z-index: 1;
    }

    /* treść nad gradientem i tłem */
    > * {
        position: relative;
        z-index: 2;
    }
    .wyjazdNazwaButtons{
        width: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        gap: 5px;
    }
    .wyjazdNazwa {
        width: 100%;
        color: white;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        text-align: left;
        font-size: 52px;
        font-weight: 900;
        z-index: 3;
        gap: 10px;
        text-shadow: 0 2px 14px rgba(0, 0, 0, 1);
        max-width: 100%;
        svg{
            flex-shrink: 0;
        }
        @media screen and (max-width: 600px){
            font-size: 25px;
            svg{
                width: 20px;
            }
        }
    }

    .wyjazdNazwaInput {
        display: inline-block;
        max-width: 100%;
        white-space: normal;
        font: inherit;
        color: white;
        outline: none;
        direction: ltr;
        text-align: left;
        svg{
            flex-shrink: 0;
        }
    }
`;


const MobileNavButtons = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: stretch;
    align-items: center;
    width: 100%;
    flex-wrap: wrap;
    padding: 2px 10px;
    box-sizing: border-box;
    gap: 5px;
    margin-top: 5px;
    .mobileNavButton{
        height: 35px;
        flex: 1;
        min-width: 200px;
        border: 1px solid #f0f0f0;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 500;
        font-size: 14px;
        font-family: 'Inter', sans-serif;
        gap: 2px;
        cursor: pointer;
        transition: 0.3s ease-in-out;
        &.b{
            color: white;
            background:  #008d73ff;
            &:hover { 
                box-shadow: 0 8px 20px rgba(0,0,0,.06); 
                background: #006a57ff;
            }
            @media screen and   (max-width: 800px){
                background-color: black;
                &:hover{
                    background-color: #404040;
                }
            }
        }
        &:hover { 
            box-shadow: 0 8px 20px rgba(0,0,0,.06); 
            background: #dfdfdfff; 
        }
    }
    @media screen and (min-width: 1199px){
        display: none;

    }
`
const minimum = (a, b) => {
    if (a < b) return a;
    return b;
}
const maximum = (a, b) => {
    if (a < b) return b;
    return a;
}

export function timeToMinutes(timeString) {
    const [hours, minutes] = timeString.split(":").map(Number);
    return hours * 60 + minutes;
}
export function toBookingDateFormat(dateInput) {
    const date = (dateInput instanceof Date) ? dateInput : new Date(dateInput);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

// ===== URL PARAM HELPERS (no libs) =====
const readURL = () => new URL(window.location.href);
const commitURL = (url) => window.history.replaceState({}, "", url.toString());

const getNum = (v, def = null) => {
    if (v == null) return def;
    const n = Number(v);
    return Number.isFinite(n) ? n : def;
};
const getInt = (v, def = null) => {
    if (v == null) return def;
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : def;
};

// Dates in YYYY-MM-DD
const getDateFromParam = (v) => {
    if (!v) return null;
    const d = new Date(v);
    return isNaN(d) ? null : d;
};
const setDateParam = (url, key, date) => {
    if (!date) { url.searchParams.delete(key); return; }
    const d = new Date(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    url.searchParams.set(key, `${y}-${m}-${day}`);
};

// START PLACE
const readStartFromParams = () => {
    const p = readURL().searchParams;
    const name = p.get("startName");
    if (!name) return null;
    const lat = getNum(p.get("startLat"));
    const lng = getNum(p.get("startLng"));
    return {
        nazwa: name || undefined,
        kraj: p.get("startCountry") || undefined,
        wojewodztwo: p.get("startRegion") || undefined,
        googleId: p.get("startGoogleId") || undefined,
        id: getInt(p.get("startId")),
        location: (lat != null && lng != null) ? { lat, lng } : undefined,
    };
};
const writeStartToParams = (m) => {
    const url = readURL();
    const keys = ["startName", "startLat", "startLng", "startCountry", "startRegion", "startId", "startGoogleId"];
    if (!m) {
        keys.forEach(k => url.searchParams.delete(k));
        commitURL(url);
        return;
    }
    if (m.nazwa) url.searchParams.set("startName", m.nazwa); else url.searchParams.delete("startName");
    if (m.location && m.location.lat != null) url.searchParams.set("startLat", String(m.location.lat)); else url.searchParams.delete("startLat");
    if (m.location && m.location.lng != null) url.searchParams.set("startLng", String(m.location.lng)); else url.searchParams.delete("startLng");
    if (m.kraj) url.searchParams.set("startCountry", m.kraj); else url.searchParams.delete("startCountry");
    if (m.wojewodztwo) url.searchParams.set("startRegion", m.wojewodztwo); else url.searchParams.delete("startRegion");
    if (Number.isFinite(m.id)) url.searchParams.set("startId", String(m.id)); else url.searchParams.delete("startId");
    if (m.googleId) url.searchParams.set("startGoogleId", m.googleId); else url.searchParams.delete("startGoogleId");
    commitURL(url);
};

// DESTINATION — analogicznie jak START
const readDestFromParams = () => {
    const p = readURL().searchParams;
    const name = p.get("destName");
    if (!name) return null;
    const lat = getNum(p.get("destLat"));
    const lng = getNum(p.get("destLng"));
    return {
        nazwa: name || undefined,
        kraj: p.get("destCountry") || undefined,
        wojewodztwo: p.get("destRegion") || undefined,
        googleId: p.get("destGoogleId") || undefined,
        id: getInt(p.get("destId")),
        location: (lat != null && lng != null) ? { lat, lng } : undefined,
    };
};
const writeDestToParams = (m) => {
    const url = readURL();
    const keys = ["destName", "destLat", "destLng", "destCountry", "destRegion", "destId", "destGoogleId"];
    if (!m) {
        keys.forEach(k => url.searchParams.delete(k));
        commitURL(url);
        return;
    }
    if (m.nazwa) url.searchParams.set("destName", m.nazwa); else url.searchParams.delete("destName");
    if (m.location && m.location.lat != null) url.searchParams.set("destLat", String(m.location.lat)); else url.searchParams.delete("destLat");
    if (m.location && m.location.lng != null) url.searchParams.set("destLng", String(m.location.lng)); else url.searchParams.delete("destLng");
    if (m.kraj) url.searchParams.set("destCountry", m.kraj); else url.searchParams.delete("destCountry");
    if (m.wojewodztwo) url.searchParams.set("destRegion", m.wojewodztwo); else url.searchParams.delete("destRegion");
    if (Number.isFinite(m.id)) url.searchParams.set("destId", String(m.id)); else url.searchParams.delete("destId");
    if (m.googleId) url.searchParams.set("destGoogleId", m.googleId); else url.searchParams.delete("destGoogleId");
    commitURL(url);
};

const writeNumberParam = (key, val) => {
    const url = readURL();
    if (val == null || !Number.isFinite(val)) url.searchParams.delete(key);
    else url.searchParams.set(key, String(val));
    commitURL(url);
};

const pad2 = (n) => String(n).padStart(2, "0");
const toKeyDate = (d) => {
    if (!d) return "NA";
    const dt = new Date(d);
    if (isNaN(dt)) return "NA";
    return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`;
};

const makeTripKey = (prefix, miejsceDocelowe, dataPrzyjazdu, dataWyjazdu) => {
    const destId =
        (miejsceDocelowe && (miejsceDocelowe.googleId || miejsceDocelowe.id || miejsceDocelowe.nazwa)) || "NO_DEST";
    const dep = toKeyDate(dataPrzyjazdu);
    const arr = toKeyDate(dataWyjazdu);
    return `${prefix}__${destId}__${arr}__${dep}`;
};
const getStr = (v, def = null) => {
    return (v == null || v === "") ? def : String(v);
};
const writeStringParam = (key, val) => {
    const url = readURL();
    if (val == null || String(val).trim() === "") url.searchParams.delete(key);
    else url.searchParams.set(key, String(val));
    commitURL(url);
};

export const KonfiguratorMain = ({ activitiesScheduleInit, chosenTransportScheduleInit, dataPrzyjazduInit, dataWyjazduInit, standardHoteluInit, standardTransportuInit, miejsceDoceloweInit, miejsceStartoweInit, liczbaUczestnikowInit, liczbaOpiekunowInit, pokojeOpiekunowieInit }) => {

    // ===== INICJALIZACJA STANÓW (z URL -> localStorage -> inity) =====

    // --- dates ---
    const [dataPrzyjazdu, setDataPrzyjazdu] = useState(() => {
        const fromURL = getDateFromParam(readURL().searchParams.get("arr")); // arrival
        if (fromURL) return fromURL;
        try {
            const raw = localStorage.getItem("dataPrzyjazdu");
            if (raw) {
                const d = new Date(raw);
                if (!isNaN(d)) return d;
            }
        } catch { }
        if (dataPrzyjazduInit) return new Date(dataPrzyjazduInit);
        return new Date();
    });

    const [dataWyjazdu, setDataWyjazdu] = useState(() => {
        const fromURL = getDateFromParam(readURL().searchParams.get("dep")); // departure
        if (fromURL) return fromURL;
        try {
            const raw = localStorage.getItem("dataWyjazdu");
            if (raw) {
                const d = new Date(raw);
                if (!isNaN(d)) return d;
            }
        } catch { }
        if (dataWyjazduInit) return new Date(dataWyjazduInit);
        return new Date();
    });

    // --- standards ---
    const [standardHotelu, setStandardHotelu] = useState(() => {
        const fromURL = getInt(readURL().searchParams.get("hotelStd"));
        if (fromURL != null) return fromURL;
        try {
            const raw = localStorage.getItem("standardHotelu");
            if (raw != null) {
                const n = Number(raw);
                if (Number.isFinite(n)) return n;
            }
        } catch { }
        return (standardHoteluInit ?? 0);
    });

    const [standardTransportu, setStandardTransportu] = useState(() => {
        const fromURL = getInt(readURL().searchParams.get("transportStd"));
        if (fromURL != null) return fromURL;
        try {
            const raw = localStorage.getItem("standardTransportu");
            if (raw != null) {
                const n = Number(raw);
                if (Number.isFinite(n)) return n;
            }
        } catch { }
        return (standardTransportuInit ?? 0);
    });

    // --- destination: TERAZ z URL -> localStorage -> init
    const [miejsceDocelowe, setMiejsceDocelowe] = useState(() => {
        // 1) URL
        const fromURL = readDestFromParams();
        if (fromURL) return fromURL;

        // 2) localStorage
        try {
            const saved = localStorage.getItem("miejsceDocelowe");
            if (saved) return JSON.parse(saved);
        } catch { }

        // 3) init
        return miejsceDoceloweInit;
    });

    // --- start place: URL -> localStorage -> init
    const [miejsceStartowe, setMiejsceStartowe] = useState(() => {
        const fromURL = readStartFromParams();
        if (fromURL) return fromURL;
        try {
            const saved = localStorage.getItem("miejsceStartowe");
            if (saved) return JSON.parse(saved);
        } catch { }
        return miejsceStartoweInit;
    });

    // --- counts ---
    const [liczbaUczestnikow, setLiczbaUczestnikow] = useState(() => {
        const fromURL = getInt(readURL().searchParams.get("guests"));
        if (fromURL != null) return fromURL;
        try {
            const raw = localStorage.getItem("liczbaUczestnikow");
            if (raw != null) {
                const n = Number(raw);
                if (Number.isFinite(n)) return n;
            }
        } catch { }
        return (liczbaUczestnikowInit ?? 0);
    });

    const [liczbaOpiekunow, setLiczbaOpiekunow] = useState(() => {
        const fromURL = getInt(readURL().searchParams.get("guardians"));
        if (fromURL != null) return fromURL;
        try {
            const raw = localStorage.getItem("liczbaOpiekunow");
            if (raw != null) {
                const n = Number(raw);
                if (Number.isFinite(n)) return n;
            }
        } catch { }
        return (liczbaOpiekunowInit ?? 0);
    });

    const [tripId, setTripId] = useState(() => {
        const fromURL = getStr(readURL().searchParams.get("tripId"));
        if (fromURL != null) return fromURL;
        return "";
    });
    const [downloadPlan, setDownloadPlan] = useState(() => {
        const fromURL = getStr(readURL().searchParams.get("downloadPlan"));
        if (fromURL != null) {
            return fromURL
        }
        return "";
    });
    const [nazwaWyjazdu, setNazwaWyjazdu] = useState(() => {
        const fromURL = getStr(readURL().searchParams.get("nw"));
        if (fromURL != null) {
            return fromURL
        }
        return "";
    })
    const [liczbaDni, setLiczbaDni] = useState(() => {
        if (!(dataPrzyjazdu instanceof Date) || isNaN(dataPrzyjazdu)) return 0;
        if (!(dataWyjazdu instanceof Date) || isNaN(dataWyjazdu)) return 0;

        // liczymy dni kalendarzowe (inkl. start i koniec), ignorując godzinę
        const start = new Date(
            dataPrzyjazdu.getFullYear(),
            dataPrzyjazdu.getMonth(),
            dataPrzyjazdu.getDate()
        );
        const end = new Date(
            dataWyjazdu.getFullYear(),
            dataWyjazdu.getMonth(),
            dataWyjazdu.getDate()
        );

        if (end < start) return 0;

        const MS_PER_DAY = 24 * 60 * 60 * 1000;
        const diffDays = Math.round((end.getTime() - start.getTime()) / MS_PER_DAY);

        return diffDays + 1;
    });


    // ===== EFEKTY: zapis do URL + regularny zapis do localStorage =====


    // DESTINATION -> URL + LS
    useEffect(() => {
        writeDestToParams(miejsceDocelowe);
        if (miejsceDocelowe) {
            localStorage.setItem("miejsceDocelowe", JSON.stringify(miejsceDocelowe));
        } else {
            localStorage.removeItem("miejsceDocelowe");
        }
    }, [miejsceDocelowe]);

    // START -> URL + LS
    useEffect(() => {
        writeStartToParams(miejsceStartowe);
        if (miejsceStartowe) {
            localStorage.setItem("miejsceStartowe", JSON.stringify(miejsceStartowe));
        } else {
            localStorage.removeItem("miejsceStartowe");
        }
    }, [miejsceStartowe]);

    // dates -> URL + LS
    useEffect(() => {
        const url = readURL();
        setDateParam(url, "arr", dataPrzyjazdu);
        commitURL(url);
        if (dataPrzyjazdu instanceof Date && !isNaN(dataPrzyjazdu)) {
            localStorage.setItem("dataPrzyjazdu", dataPrzyjazdu.toISOString());
        }
    }, [dataPrzyjazdu]);

    useEffect(() => {
        const url = readURL();
        setDateParam(url, "dep", dataWyjazdu);
        commitURL(url);
        if (dataWyjazdu instanceof Date && !isNaN(dataWyjazdu)) {
            localStorage.setItem("dataWyjazdu", dataWyjazdu.toISOString());
        }
    }, [dataWyjazdu]);

    // counts -> URL + LS
    useEffect(() => {
        writeNumberParam("guests", liczbaUczestnikow);
        localStorage.setItem("liczbaUczestnikow", String(liczbaUczestnikow));
    }, [liczbaUczestnikow]);

    useEffect(() => {
        writeNumberParam("guardians", liczbaOpiekunow);
        localStorage.setItem("liczbaOpiekunow", String(liczbaOpiekunow));
    }, [liczbaOpiekunow]);

    // standards -> URL + LS
    useEffect(() => {
        writeNumberParam("hotelStd", standardHotelu);
        localStorage.setItem("standardHotelu", String(standardHotelu));
    }, [standardHotelu]);

    useEffect(() => {
        writeNumberParam("transportStd", standardTransportu);
        localStorage.setItem("standardTransportu", String(standardTransportu));
    }, [standardTransportu]);
    useEffect(() => {

        writeNumberParam("nw", nazwaWyjazdu);
        localStorage.setItem("nazwaWyjazdu", nazwaWyjazdu);
    }, [nazwaWyjazdu])
    useEffect(() => {
        miejsceDocelowe && localStorage.setItem("miejsceDocelowe", JSON.stringify(miejsceDocelowe))
    }, [miejsceDocelowe, miejsceStartowe])

    useEffect(() => {
        const lat = miejsceDocelowe?.location?.lat;
        const lng = miejsceDocelowe?.location?.lng;
        //console.log("Rozpoczynam probe")
        if (
            tripId ||
            downloadPlan ||
            !miejsceDocelowe?.nazwa ||
            lat == null ||
            lng == null
        ) {
            //console.log("Nie pobieram")
            return;
        }
        if (!nazwaWyjazdu) setNazwaWyjazdu(`Wyjazd do ${miejsceDocelowe.nazwa}`)
        const controller = new AbortController();

        const fetchPhoto = async () => {
            //console.log("Rozpoczynam probe 2")
            try {
                const url =
                    `${portacc}/getPhotoOfCity` +
                    `?nazwa=${encodeURIComponent(miejsceDocelowe.nazwa)}` +
                    `&lat=${encodeURIComponent(lat)}` +
                    `&lng=${encodeURIComponent(lng)}`;

                const res = await fetch(url, { signal: controller.signal });

                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }

                const data = await res.json();
                console.log("otrzymane ", data)
                if (data && data.photoUrl) {
                    setPhotoWallpaper(data.photoUrl);
                }
            } catch (err) {
                if (err.name === "AbortError") return;
                console.error("Błąd przy pobieraniu tła miasta:", err);
            }
        };

        // 🔹 debounce 3 sekundy
        const timeoutId = setTimeout(() => {
            fetchPhoto();
        }, 100);

        return () => {
            controller.abort();
            clearTimeout(timeoutId);
        };
    }, [
        tripId,
        downloadPlan,
        miejsceDocelowe?.nazwa,
        miejsceDocelowe?.location?.lat,
        miejsceDocelowe?.location?.lng,
        portacc,
    ]);

    //dane lokalne
    const [settingsOpened, setSettingsOpened] = useState(false);
    const [leftOpened, setLeftOpened] = useState(false)
    const [radioChosen, setRadioChosen] = useState(0)

    const [attractionsSearching, setAttractionsSearching] = useState("");
    const [miejsceStartoweSearching, setMiejsceStartoweSearching] = useState("");
    const [miejsceStartoweResults, setMiejsceStartoweResults] = useState(testResults);
    const [miejsceStartoweHovering, setMiejsceStartoweHovering] = useState(false);
    const [miejsceStartowePopupOpened, setMiejsceStartowePopupOpened] = useState(false);

    const [wyborDatyOpened, setWyborDatyOpened] = useState(false)
    const [wyborGosciOpened, setWyborGosciOpened] = useState(false)
    const [wyborStandardHoteluOpened, setWyborStandardHoteluOpened] = useState(false);
    const [wyborStandardTransportuOpened, setWyborStandardTransportuOpened] = useState(false);
    const [activityPanelOpened, setActivityPanelOpened] = useState(false);
    const [modyfikacja, setModyfikacja] = useState({ flag: false, dayIdx: null, idx: null })

    const [redirecting, setRedirecting] = useState(false)
    const libraryFilters = ["Muzeum",]
    const [filtersChosen, setFiltersChosen] = useState()
    const [alertsTable, setAlertsTable] = useState([])
    const [popupPickerOpened, setPopupPickerOpened] = useState(-1);
    useEffect(() => {
        if (!miejsceStartoweSearching) return;
        setMiejsceStartoweResults([]);
        const timeoutId = setTimeout(async () => {
            try {
                const response = await fetch(
                    `${port}/searchCity?query=${encodeURIComponent(
                        miejsceStartoweSearching
                    )}`
                );
                const data = await response.json();

                if (data?.length > 0) {
                    const resultsWithPlaceId = await Promise.all(
                        data.map(async (item) => {
                            try {
                                const placeIdRes = await fetch(
                                    `${port}/getPlaceId?miasto=${encodeURIComponent(item.nazwa)}&wojewodztwo=${encodeURIComponent(item.wojewodztwo || "")}&kraj=${encodeURIComponent(item.kraj)}`
                                );
                                const placeData = await placeIdRes.json();
                                return { ...item, ...placeData };
                            } catch (err) {
                                console.error("Błąd pobierania placeId:", err);
                                return item;
                            }
                        })
                    );
                    setMiejsceStartoweResults(resultsWithPlaceId);
                }
                else { setMiejsceStartoweResults([{ kraj: "brak" }]) }
            } catch (error) {
                console.error("Błąd pobierania danych:", error);
            }
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, [miejsceStartoweSearching]);

    useEffect(() => {
        const fetchRouteData = async () => {
            try {
                const fromLat = 50.06465009999999;
                const fromLng = 19.9449799;
                const toLat = 52.411542;
                const toLng = 16.9487706;

                const url = `${port}/routeSummary?fromLat=${fromLat}&fromLng=${fromLng}&toLat=${toLat}&toLng=${toLng}`;
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }

                const data = await response.json();

            } catch (error) {
                console.error("❌ Błąd podczas pobierania trasy:", error);
            }
        };
        fetchRouteData();
    }, [miejsceDocelowe, miejsceStartowe]);

    const [changedActivities, setChangeActivities] = useState([])

    const fetchAttractions = useCallback(
        debounce(async (placeId, lat, lng) => {
            try {
                const res = await axios.get(`${port}/getAttractions`, {
                    params: { placeId, lat, lng },
                });
                setAtrakcje(res.data);
                localStorage.setItem("lsAtrakcje", JSON.stringify(res.data));
            } catch (err) {
                console.error("Błąd przy pobieraniu atrakcji:", err);
            }
        }, 1000),
        []
    );

    const [atrakcje, setAtrakcje] = useState([]);
    const [events, setEvents] = useState(null)
    useEffect(() => {
        const lat = Number(miejsceDocelowe?.location?.lat);
        const lng = Number(miejsceDocelowe?.location?.lng);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

        const controller = new AbortController();
        const cached = localStorage.getItem("lsAtrakcje");

        (async () => {
            try {
                //console.log("Probuje pobrac z nearby");
                const url = `${port}/attractions/nearby?lat=${encodeURIComponent(
                    lat
                )}&lng=${encodeURIComponent(lng)}&radiusKm=70`;

                const resp = await fetch(url, {
                    method: "GET",
                    headers: { Accept: "application/json" },
                    signal: controller.signal,
                });

                if (!resp.ok) {
                    const text = await resp.text().catch(() => "");
                    throw new Error(`HTTP ${resp.status}: ${text || resp.statusText}`);
                }

                const data = await resp.json();
                //console.log("wynik z nearby", data)
                setAtrakcje(data);
            } catch (err) {
                if (err.name !== "AbortError") {
                    console.error("❌ /attractions/nearby error:", err);
                }
            }
        })();

        return () => controller.abort();
    }, [miejsceDocelowe?.location?.lat, miejsceDocelowe?.location?.lng]);

    const [wybranyHotel, setWybranyHotel] = useState({ stars: 3, nazwa: "Hotel w Mieście", adres: "", checkIn: '14:00', checkOut: '11:00', cena: 100 * liczbaDni * (liczbaOpiekunow + liczbaUczestnikow) * ((standardHotelu + 1) % 4) })

    const [routeSchedule, setRouteSchedule] = useState([])
    const [timeSchedule, setTimeSchedule] = useState([])
    const [activitiesSchedule, setActivitiesSchedule] = useState([[]]);
    const [startHours, setStartHours] = useState(() => {

        return Array.from({ length: (Array.isArray(activitiesSchedule) ? activitiesSchedule.length : 0) }, () => 480);
    });
    const [photoWallpaper, setPhotoWallpaper] = useState("https://images.unsplash.com/photo-1633268456308-72d1c728943c?auto=format&fit=crop&w=1600&q=80")
    const [tripPrice, setTripPrice] = useState(0);
    const [insurancePrice, setInsurancePrice] = useState(0);
    const [computingPrice, setComputingPrice] = useState(false)
    const userIdFromStore = useUserStore(s => s.user?._id);

    useEffect(() => {
        let aborted = false;

        // Bezpieczna konwersja daty → Date (lokalnie godz. 12:00)
        const toLocalDateNoon = (v) => {
            if (!v) return null;
            const d = v instanceof Date ? v : new Date(v);
            if (Number.isNaN(d.getTime())) return null;
            return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0, 0);
        };

        // policz liczbę dni na podstawie aktualnie wybranych dat
        const computeDaysFromDates = (start, end, fallbackLen = 1) => {
            if (!start || !end) return fallbackLen || 1;
            const diff = roznicaDni(start, end); // istniejąca funkcja
            return diff > 0 ? diff : (fallbackLen || 1);
        };

        // dopasowanie activitiesSchedule do liczby dni
        const fitScheduleToDays = (schedule, daysCount) => {
            if (!Array.isArray(schedule) || schedule.length === 0) {
                return Array.from({ length: daysCount }, () => []);
            }

            if (daysCount < schedule.length) {
                // utnij od końca
                return schedule.slice(0, daysCount);
            }
            if (daysCount > schedule.length) {
                // dopisz puste dni na końcu
                const extra = Array.from(
                    { length: daysCount - schedule.length },
                    () => []
                );
                return [...schedule, ...extra];
            }
            return schedule;
        };

        // dopasowanie startHours do liczby dni (identyczna logika)
        const fitStartHoursToDays = (hours, daysCount) => {
            if (!Array.isArray(hours) || hours.length === 0) {
                // brak danych → wypełnij nullami (lub 0, jeżeli wolisz)
                return Array.from({ length: daysCount }, () => null);
            }

            if (daysCount < hours.length) {
                return hours.slice(0, daysCount);
            }
            if (daysCount > hours.length) {
                const extra = Array.from(
                    { length: daysCount - hours.length },
                    () => null
                );
                return [...hours, ...extra];
            }
            return hours;
        };

        const getFallbackActivities = () => {
            if (activitiesScheduleInit != null) return activitiesScheduleInit;

            const tripKey = makeTripKey(
                "activitiesSchedule",
                miejsceDocelowe,
                dataPrzyjazdu,
                dataWyjazdu
            );

            try {
                const raw = localStorage.getItem(tripKey);
                if (raw) return JSON.parse(raw);
            } catch {
                /* ignore */
            }
            return [[]];
        };

        const fallback = () => {
            if (!aborted) {
                const base = getFallbackActivities();
                const daysCount = computeDaysFromDates(
                    dataPrzyjazdu,
                    dataWyjazdu,
                    base.length || 1
                );
                const adjustedSchedule = fitScheduleToDays(base, daysCount);
                const adjustedStartHours = fitStartHoursToDays([], daysCount); // brak danych → null-e

                setActivitiesSchedule(adjustedSchedule);
                setStartHours(adjustedStartHours);
            }
        };

        (async () => {
            const hasTripId = !!tripId && String(tripId).trim() !== "";
            const hasDownloadPlan = !!downloadPlan && String(downloadPlan).trim() !== "";

            // flaga: czy udało się załadować harmonogram z downloadPlan
            let hasActivitiesFromDownloadPlan = false;

            // 1) PRIORYTET: downloadPlan
            if (hasDownloadPlan) {
                try {
                    console.log("Pobieram plan (downloadPlan):", downloadPlan);
                    const url = `${portacc}/download/trip-plan/?tripId=${encodeURIComponent(downloadPlan)}`;
                    const resp = await fetch(url, { method: "GET", credentials: "include" });

                    if (!aborted && resp.ok) {
                        const data = await resp.json();

                        if (typeof data?.nazwa === "string") {
                            setNazwaWyjazdu(data.nazwa);
                        }

                        if (Array.isArray(data?.activitiesSchedule)) {
                            const baseSchedule = data.activitiesSchedule;
                            const baseStartHours = Array.isArray(data.startHours)
                                ? data.startHours
                                : [];

                            // liczba dni wg WYBRANYCH przez użytkownika dat
                            const daysCount = computeDaysFromDates(
                                dataPrzyjazdu,
                                dataWyjazdu,
                                baseSchedule.length || baseStartHours.length || 1
                            );

                            const adjustedSchedule = fitScheduleToDays(baseSchedule, daysCount);
                            const adjustedStartHours = fitStartHoursToDays(baseStartHours, daysCount);

                            setActivitiesSchedule(adjustedSchedule);
                            setStartHours(adjustedStartHours);

                            hasActivitiesFromDownloadPlan = true;
                        } else {
                            hasActivitiesFromDownloadPlan = false;
                        }

                        if (data?.miejsceDocelowe) {
                            setMiejsceDocelowe(data.miejsceDocelowe);
                        }

                        // czyścimy parametr downloadPlan w URL
                        writeStringParam("downloadPlan", "");
                    }
                } catch (err) {
                    console.error("Błąd pobierania downloadPlan:", err);
                    // jeśli downloadPlan padnie, spróbujemy jeszcze tripId lub fallback
                }
            }

            // 2) Następnie tripId (plan autora)
            if (hasTripId) {
                try {
                    let userId = userIdFromStore ?? useUserStore.getState?.().user?._id ?? null;
                    if (!userId) {
                        try {
                            const me = await fetchMe().catch(() => null);
                            userId = me?._id ?? useUserStore.getState?.().user?._id ?? null;
                        } catch { /* ignore */ }
                    }

                    if (!userId) {
                        if (!hasActivitiesFromDownloadPlan) {
                            return fallback();
                        }
                        return;
                    }

                    const url = `${portacc}/api/trip-plans/${encodeURIComponent(
                        tripId
                    )}/by-author/${encodeURIComponent(userId)}`;

                    const resp = await fetch(url, { credentials: "include" });
                    if (!aborted && resp.ok) {
                        const data = await resp.json();

                        // 1) Harmonogram – TYLKO jeśli NIE mamy już go z downloadPlan
                        if (!hasActivitiesFromDownloadPlan) {
                            if (
                                Array.isArray(data?.activitiesSchedule) &&
                                data.activitiesSchedule.every(Array.isArray) &&
                                data.activitiesSchedule.length > 0
                            ) {
                                const backendStart = toLocalDateNoon(data?.dataPrzyjazdu) || dataPrzyjazdu;
                                const backendEnd = toLocalDateNoon(data?.dataWyjazdu) || dataWyjazdu;

                                const baseSchedule = data.activitiesSchedule;
                                const baseStartHours = Array.isArray(data.startHours)
                                    ? data.startHours
                                    : [];

                                const daysCount = computeDaysFromDates(
                                    backendStart,
                                    backendEnd,
                                    baseSchedule.length || baseStartHours.length || 1
                                );

                                const adjustedSchedule = fitScheduleToDays(baseSchedule, daysCount);
                                const adjustedStartHours = fitStartHoursToDays(baseStartHours, daysCount);

                                setActivitiesSchedule(adjustedSchedule);
                                setStartHours(adjustedStartHours);
                            } else {
                                fallback();
                            }
                        }

                        // 2) Daty
                        const start = toLocalDateNoon(data?.dataPrzyjazdu);
                        const end = toLocalDateNoon(data?.dataWyjazdu);
                        if (start) setDataPrzyjazdu(start);
                        if (end) setDataWyjazdu(end);

                        // 3) Miejsca
                        if (data?.miejsceDocelowe) setMiejsceDocelowe(data.miejsceDocelowe);
                        if (data?.miejsceStartowe) setMiejsceStartowe(data.miejsceStartowe);

                        // 4) Standardy
                        if (typeof data?.standardTransportu === "number") {
                            setStandardTransportu(data.standardTransportu);
                        }
                        if (typeof data?.standardHotelu === "number") {
                            setStandardHotelu(data.standardHotelu);
                        }

                        // 5) Liczebności
                        if (typeof data?.liczbaUczestnikow === "number") {
                            setLiczbaUczestnikow(data.liczbaUczestnikow);
                        }
                        if (typeof data?.liczbaOpiekunow === "number") {
                            setLiczbaOpiekunow(data.liczbaOpiekunow);
                        }

                        // 6) Zdjęcie (opcjonalnie)
                        if (typeof data?.photoLink === "string") {
                            setPhotoWallpaper?.(data.photoLink);
                        }
                        if (typeof data?.nazwa === "string" && !hasActivitiesFromDownloadPlan) {
                            setNazwaWyjazdu(data.nazwa);
                        }

                        return; // zakończ po obsłudze tripId
                    }

                    if (!hasActivitiesFromDownloadPlan) {
                        return fallback();
                    }
                    return;
                } catch {
                    if (!hasActivitiesFromDownloadPlan) {
                        return fallback();
                    }
                    return;
                }
            }

            // 3) Brak obu identyfikatorów → fallback
            if (!hasActivitiesFromDownloadPlan) {
                return fallback();
            }
        })();

        return () => {
            aborted = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);






    const saveTimerRef = useRef(null);
    const saveControllerRef = useRef(null);

    const canSave = () =>
        !!tripId &&
        String(tripId).trim().length > 0 &&
        Array.isArray(activitiesSchedule);

    // zakładam, że masz w stanie: miejsceDocelowe, miejsceStartowe, dataWyjazdu (start), dataPowrotu (koniec),
    // standardTransportu, standardHotelu, activitiesSchedule, tripPrice, insurancePrice, tripId
    // oraz helper formatYMDLocal(d: Date|string) -> "YYYY-MM-DD" (jak w Twoim kodzie)
    /**
 * Zwraca datę w formacie "YYYY-MM-DD" z użyciem CZASU LOKALNEGO,
 * bez przesunięć strefowych (nie używa UTC).
 * Przyjmuje Date, timestamp lub parsowalny string; dla niepoprawnego wejścia zwraca "".
 */
    function formatYMDLocal(input) {
        if (!input) return "";

        const d = input instanceof Date ? input : new Date(input);
        if (isNaN(d)) return "";

        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");

        return `${y}-${m}-${day}`;
    }
    const [hasPendingAutoSave, setHasPendingAutoSave] = useState(false);


    const saveTripPlan = useCallback(
        async (opts = {}) => {
            if (!canSave() || !tripId) return;
            const { signal } = opts;

            const toIntOrUndef = (v) => {
                const n = Number(v);
                return Number.isFinite(n) ? Math.trunc(n) : undefined;
            };
            const safeParticipants = (() => {
                const n = toIntOrUndef(liczbaUczestnikow);
                return n !== undefined && n >= 1 ? n : undefined;
            })();
            const safeGuardians = (() => {
                const n = toIntOrUndef(liczbaOpiekunow);
                return n !== undefined && n >= 0 ? n : undefined;
            })();

            try {
                // Nie pobieramy/meblujemy userId – serwer korzysta z req.user
                const url = `${portacc}/api/trip-plans/${encodeURIComponent(tripId)}`;

                const payload = {
                    activitiesSchedule,
                    computedPrice: (tripPrice ?? 0) + (insurancePrice ?? 0),
                    miejsceDocelowe: miejsceDocelowe
                        ? {
                            nazwa: String(miejsceDocelowe.nazwa || "").trim(),
                            kraj: miejsceDocelowe.kraj ?? undefined,
                            wojewodztwo: miejsceDocelowe.wojewodztwo ?? undefined,
                            priority: miejsceDocelowe.priority ?? 0,
                            location: {
                                lat: Number(miejsceDocelowe.location?.lat),
                                lng: Number(miejsceDocelowe.location?.lng),
                            },
                        }
                        : undefined,
                    miejsceStartowe: miejsceStartowe
                        ? {
                            nazwa: String(miejsceStartowe.nazwa || "").trim(),
                            kraj: miejsceStartowe.kraj ?? undefined,
                            wojewodztwo: miejsceStartowe.wojewodztwo ?? undefined,
                            priority: miejsceStartowe.priority ?? 0,
                            location: {
                                lat: Number(miejsceStartowe.location?.lat),
                                lng: Number(miejsceStartowe.location?.lng),
                            },
                        }
                        : undefined,
                    dataPrzyjazdu: dataPrzyjazdu ? formatYMDLocal(dataPrzyjazdu) : undefined,
                    dataWyjazdu: dataWyjazdu ? formatYMDLocal(dataWyjazdu) : undefined,
                    standardTransportu: typeof standardTransportu === "number" ? standardTransportu : undefined,
                    standardHotelu: typeof standardHotelu === "number" ? standardHotelu : undefined,
                    liczbaUczestnikow: safeParticipants,
                    liczbaOpiekunow: safeGuardians,
                    nazwa: nazwaWyjazdu ? nazwaWyjazdu.trim() : undefined,
                    startHours: Array.isArray(startHours) ? startHours : [],
                };

                const resp = await fetch(url, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        // (opcjonalnie) CSRF:
                        // "X-CSRF-Token": getCsrfTokenSomehow(),
                    },
                    credentials: "include",
                    body: JSON.stringify(payload),
                    signal,
                });

                if (!resp.ok) {
                    console.warn("PUT trip plan failed:", resp.status, await resp.text());
                }
            } catch (err) {
                if (err?.name !== "AbortError") {
                    console.error("PUT trip plan error:", err);
                }
            }
        },
        [
            tripId,
            activitiesSchedule,
            tripPrice,
            insurancePrice,
            miejsceDocelowe,
            miejsceStartowe,
            dataWyjazdu,
            dataPrzyjazdu,
            standardTransportu,
            standardHotelu,
            liczbaUczestnikow,
            liczbaOpiekunow,
            nazwaWyjazdu,
            startHours
        ]
    );
    // === RĘCZNY ZAPIS (bez naruszania autozapisu dla istniejącego tripId) ===
    const API_BASE = `${portacc}`;

    // ⬇️ NOWE: anulowanie oczekującego autozapisu
    const cancelQueuedAutoSave = useCallback(() => {
        if (saveTimerRef.current) {
            clearTimeout(saveTimerRef.current);
            saveTimerRef.current = null;
        }
        if (saveControllerRef.current) {
            try { saveControllerRef.current.abort(); } catch { }
            saveControllerRef.current = null;
        }
        setHasPendingAutoSave(false); // ⬅️ nowa linia
    }, []);
    const buildTripPayload = useCallback(() => {
        const toIntOrUndef = (v) => {
            const n = Number(v);
            return Number.isFinite(n) ? Math.trunc(n) : undefined;
        };

        const safeParticipants = (() => {
            const n = toIntOrUndef(liczbaUczestnikow);
            return n !== undefined && n >= 1 ? n : undefined;
        })();

        const safeGuardians = (() => {
            const n = toIntOrUndef(liczbaOpiekunow);
            return n !== undefined && n >= 0 ? n : undefined;
        })();

        return {
            activitiesSchedule,
            computedPrice: (tripPrice ?? 0) + (insurancePrice ?? 0),
            miejsceDocelowe: miejsceDocelowe
                ? {
                    nazwa: String(miejsceDocelowe.nazwa || "").trim(),
                    kraj: miejsceDocelowe.kraj ?? undefined,
                    wojewodztwo: miejsceDocelowe.wojewodztwo ?? undefined,
                    priority: miejsceDocelowe.priority ?? 0,
                    location: {
                        lat: Number(miejsceDocelowe.location?.lat),
                        lng: Number(miejsceDocelowe.location?.lng),
                    },
                }
                : undefined,
            miejsceStartowe: miejsceStartowe
                ? {
                    nazwa: String(miejsceStartowe.nazwa || "").trim(),
                    kraj: miejsceStartowe.kraj ?? undefined,
                    wojewodztwo: miejsceStartowe.wojewodztwo ?? undefined,
                    priority: miejsceStartowe.priority ?? 0,
                    location: {
                        lat: Number(miejsceStartowe.location?.lat),
                        lng: Number(miejsceStartowe.location?.lng),
                    },
                }
                : undefined,
            dataPrzyjazdu: dataPrzyjazdu ? formatYMDLocal(dataPrzyjazdu) : undefined,
            dataWyjazdu: dataWyjazdu ? formatYMDLocal(dataWyjazdu) : undefined,
            standardTransportu:
                typeof standardTransportu === "number" ? standardTransportu : undefined,
            standardHotelu:
                typeof standardHotelu === "number" ? standardHotelu : undefined,
            liczbaUczestnikow: safeParticipants,
            liczbaOpiekunow: safeGuardians,
            nazwa: nazwaWyjazdu ? nazwaWyjazdu.trim() : undefined,

            // startHours – jeżeli nie jest tablicą, wyślij pustą
            startHours: Array.isArray(startHours) ? startHours : [],
        };
    }, [
        activitiesSchedule,
        tripPrice,
        insurancePrice,
        miejsceDocelowe,
        miejsceStartowe,
        dataPrzyjazdu,
        dataWyjazdu,
        standardTransportu,
        standardHotelu,
        liczbaUczestnikow,
        liczbaOpiekunow,
        nazwaWyjazdu,
        startHours,
    ]);


    async function checkMe() {
        try {
            const r = await fetch(`${API_BASE}/api/me`, { credentials: "include" });
            if (!r.ok) return null;
            return await r.json(); // { authenticated, user }
        } catch {
            return null;
        }
    }

    /**
     * Ręczny zapis:
     * - jeśli jest tripId → natychmiast PUT (korzystamy z istniejącego saveTripPlan)
     * - jeśli brak tripId i user zalogowany → POST (tworzymy nowy), ustawiamy tripId w stanie + URL
     * - jeśli user niezalogowany → zachowujemy payload w localStorage i przekierowujemy na /login
     */
    const handleSaveClick = useCallback(async () => {
        // ⬇️ ANULUJ autozapis zanim wykonasz ręczny zapis
        cancelQueuedAutoSave();

        const me = await checkMe();
        const payload = buildTripPayload();

        // 1) mamy tripId → natychmiastowa aktualizacja
        if (tripId && String(tripId).trim() !== "") {
            const ctrl = new AbortController();
            await saveTripPlan({ signal: ctrl.signal });
            return;
        }

        // 2) brak tripId
        if (!me?.authenticated) {
            localStorage.setItem("pendingTripPayload", JSON.stringify(payload));
            localStorage.setItem("pendingRedirectAfterLogin", window.location.href);
            window.location.href = "/login";
            return;
        }

        // 3) zalogowany → utwórz nowy plan
        try {
            const resp = await fetch(`${API_BASE}/api/trip-plans`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });
            const created = await resp.json().catch(() => null);

            if (!resp.ok) {
                console.warn("POST /api/trip-plans failed:", resp.status, created || (await resp.text()));
                return;
            }
            if (created?._id) {
                setTripId(created._id);
                writeStringParam("tripId", created._id);
            }
        } catch (err) {
            console.error("Manual save (POST) error:", err);
        }
    }, [tripId, buildTripPayload, saveTripPlan, cancelQueuedAutoSave]);

    // Autozapis pozostaje bez zmian
    const queueTripPlanSave = useCallback(() => {
        if (!canSave()) {
            // nic do zapisania → brak oczekującego autozapisu
            setHasPendingAutoSave(false);
            return;
        }

        if (saveTimerRef.current) {
            clearTimeout(saveTimerRef.current);
            saveTimerRef.current = null;
        }
        if (saveControllerRef.current) {
            try { saveControllerRef.current.abort(); } catch { }
            saveControllerRef.current = null;
        }

        saveControllerRef.current = new AbortController();
        setHasPendingAutoSave(true); // ⬅️ mamy zaplanowany autozapis

        saveTimerRef.current = setTimeout(() => {
            const ctrl = saveControllerRef.current;
            saveTimerRef.current = null;
            // autozapis startuje – traktujemy jak „już nie oczekuje”
            setHasPendingAutoSave(false); // ⬅️ autozapis się wykonuje/wykonał

            saveTripPlan({ signal: ctrl?.signal }).finally(() => {
                saveControllerRef.current = null;
            });
        }, 20000);
    }, [saveTripPlan]);



    useEffect(() => {
        queueTripPlanSave();
        return () => {
            if (saveTimerRef.current) {
                clearTimeout(saveTimerRef.current);
                saveTimerRef.current = null;
            }
            if (saveControllerRef.current) {
                try { saveControllerRef.current.abort(); } catch { }
                saveControllerRef.current = null;
            }
            setHasPendingAutoSave(false);
        };
    }, [JSON.stringify(activitiesSchedule), dataWyjazdu, dataPrzyjazdu, standardHotelu, standardTransportu, liczbaUczestnikow, liczbaOpiekunow, tripPrice, insurancePrice, nazwaWyjazdu]);

    const [chosenTransportSchedule, setChosenTransportSchedule] = useState(() => {
        if (chosenTransportScheduleInit != null) return chosenTransportScheduleInit;

        const tripKey = makeTripKey("chosenTransport", miejsceDocelowe, dataPrzyjazdu, dataWyjazdu);

        try {
            const raw = localStorage.getItem(tripKey);
            if (raw) return JSON.parse(raw);
        } catch { }

        try {
            const rawLegacy = localStorage.getItem("chosenTransport");
            return rawLegacy ? JSON.parse(rawLegacy) : [];
        } catch {
            return [];
        }
    });
    useEffect(() => {
        const handleBeforeUnload = (event) => {
            // "Niebezpieczne" wyjście tylko wtedy,
            // gdy faktycznie coś czeka na autozapis
            const hasSomethingPending =
                hasPendingAutoSave ||
                !!saveTimerRef.current ||
                (saveControllerRef.current &&
                    !saveControllerRef.current.signal.aborted);

            if (!hasSomethingPending) {
                return; // brak niezapisanych zmian → nie pokazujemy dialogu
            }

            event.preventDefault();
            event.returnValue = ""; // wymagane, żeby przeglądarka pokazała popup
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [hasPendingAutoSave]);



    useEffect(() => {
        if (!miejsceDocelowe || !dataPrzyjazdu || !dataWyjazdu) return;

        const isValid =
            Array.isArray(activitiesSchedule) &&
            Array.isArray(chosenTransportSchedule) &&
            activitiesSchedule.length === chosenTransportSchedule.length &&
            activitiesSchedule.every((dayActs, i) =>
                Array.isArray(dayActs) &&
                Array.isArray(chosenTransportSchedule[i]) &&
                chosenTransportSchedule[i].length === Math.max(0, dayActs.length - 1)
            );

        if (!isValid) return;

        try {
            localStorage.setItem(
                makeTripKey("activitiesSchedule", miejsceDocelowe, dataPrzyjazdu, dataWyjazdu),
                JSON.stringify(activitiesSchedule)
            );
            localStorage.setItem(
                makeTripKey("chosenTransport", miejsceDocelowe, dataPrzyjazdu, dataWyjazdu),
                JSON.stringify(chosenTransportSchedule)
            );
        } catch (err) {
            console.warn("localStorage write failed:", err);
        }
    }, [
        activitiesSchedule,
        chosenTransportSchedule,
        miejsceDocelowe,
        dataPrzyjazdu,
        dataWyjazdu,
    ]);

    useEffect(() => {
        if (
            Array.isArray(activitiesSchedule) &&
            Array.isArray(startHours) &&
            activitiesSchedule.length === startHours.length
        ) {
            try {
                localStorage.setItem("startHours", JSON.stringify(startHours));
            } catch (err) {
                console.warn("localStorage write failed (startHours):", err);
            }
        }
    }, [activitiesSchedule, startHours]);

    const [wybranyDzien, setWybranyDzien] = useState(0)
    const [konfiguratorLoading, setKonfiguratorLoading] = useState(false);
    const [lastDaySwap, setLastDaySwap] = useState(-1)
    const tmpWybranaOpcja = 2;

    const validateSchedule = () => {

        //todo toupdate torethink
        return true;
        let toChange = -1;
        const i = activitiesSchedule.length - 1;
        if (!activitiesSchedule.length) return;
        for (let j = 0; j < activitiesSchedule[i].length; j++) {
            if (timeSchedule.length && Array.isArray(timeSchedule[i])) {
                if (activitiesSchedule[i][j]?.googleId == "baseBookOut" && timeSchedule[i][j] > timeToMinutes(wybranyHotel.checkOut)) {
                    toChange = j;
                }
            }
        }
        if (toChange > -1) {
            setLastDaySwap(toChange);
        }
        return true;
    }
    useEffect(() => {
        if (lastDaySwap <= -1 || !activitiesSchedule?.length) return;

        const handleSwap = async () => {
            try {
                if (lastDaySwap === 1) {
                    changeStartHour(wybranyDzien, 480);
                }

                await swapActivities(wybranyDzien, 1, lastDaySwap);
                setLastDaySwap(-1);
                setAlertsTable(prev => {
                    if (prev.some(alert => alert.id === "invalidCheckout")) return prev;
                    return [
                        ...prev,
                        {
                            id: "invalidCheckout",
                            content: `Nalezy wymeldować sie z  hotelu do godziny ${wybranyHotel.checkOut}! 
                            Musiałem poprawić plan dnia.`,
                            type: "error"
                        },
                    ];
                });
            } catch (err) {
                console.error("❌ Błąd przy automatycznej zamianie atrakcji:", err);
            }
        };

        handleSwap();
    }, [lastDaySwap]);
    function addAlert(type, content) {
        setAlertsTable(prev => ([
            ...(Array.isArray(prev) ? prev : []),
            { id: "mainError", type, content }
        ]));
    }
    /* temp temp temp
    useEffect(() => {
        const timer = setTimeout(() => {
            addAlert("guidance", "");
        }, 5);
        return () => clearTimeout(timer);
    }, []);
    */
    function addRouteAlert(dayIdx) {
        dayIdx != 0 && setAlertsTable(prev => {
            if (prev.some(alert => alert.id === "routeFromFull")) return prev;
            return [
                ...prev,
                {
                    id: "routeFromFull",
                    route: routeSchedule[routeSchedule.length - 1][routeSchedule[routeSchedule.length - 1].length - 1]?.transitRoute,
                    type: "route"
                },
            ];
        });
        dayIdx == 0 && setAlertsTable(prev => {
            if (prev.some(alert => alert.id === "routeFromFull")) return prev;
            return [
                ...prev,
                {
                    id: "routeFromFull",
                    route: routeSchedule[0][0]?.transitRoute,
                    type: "route"
                },
            ];
        });
    }
    function deleteAlert(alertId) {
        setAlertsTable(prev =>
            prev.filter(alert => alert.id !== alertId)
        );
    }

    function roundFive(num) {
        if (num <= 0) return 0;
        return Math.ceil((num + 0.0001) / 5) * 5;
    }

    async function generateRouteSchedule(activitiesScheduleProps) {
        if (activitiesSchedule.length != chosenTransportSchedule.length && activitiesSchedule != timeSchedule.length) {
            return;
        }

        const activitiesScheduleLocal = structuredClone(activitiesScheduleProps)
        const tabRoutesTmp = Array.from({ length: activitiesSchedule.length }, () => []);
        const tabTimeScheduleTmp = Array.from({ length: activitiesSchedule.length }, (_, i) => [startHours[i] || 480]);

        for (let dayIdx = 0; dayIdx < activitiesScheduleLocal.length; dayIdx++) {
            const day = activitiesScheduleLocal[dayIdx];
            for (let actIdx = 0; actIdx < day.length - 1; actIdx++) {
                let current = day[actIdx];
                let next = day[actIdx + 1];
                if (next?.googleId?.includes("dAct_") && !next?.googleId?.includes("event")) {
                    next.lokalizacja = current.lokalizacja;
                }
                const sameLocation =
                    current?.lokalizacja?.lat === next?.lokalizacja?.lat &&
                    current?.lokalizacja?.lng === next?.lokalizacja?.lng;

                if (sameLocation) {
                    tabRoutesTmp[dayIdx].push({
                        start: current,
                        end: next,
                        czasy: [0, 0, 0],
                        transitRoute: null,
                    });
                    continue;
                }
                try {
                    const res = await fetch(
                        `${port}/routeSummary?fromLat=${current.lokalizacja.lat}&fromLng=${current.lokalizacja.lng}&toLat=${next.lokalizacja.lat}&toLng=${next.lokalizacja.lng}`
                    );

                    const data = await res.json();

                    if (!res.ok || !data) {
                        console.warn("⚠️ Nie udało się pobrać trasy:", res.statusText);
                        tabRoutesTmp[dayIdx].push({
                            start: current,
                            end: next,
                            czasy: [0, 0, 0],
                            transitRoute: null,
                        });
                        continue;
                    }

                    const walking = roundFive(data.walking?.durationMinutes || 0);
                    const transit = roundFive(data.transit?.durationMinutes || 0);
                    const driving = roundFive(data.driving?.durationMinutes || 0);
                    const transitRoute = data.transit?.segments || null;

                    tabRoutesTmp[dayIdx].push({
                        start: current,
                        end: next,
                        czasy: [walking, transit, driving],
                        transitRoute,
                    });
                } catch (err) {
                    console.error("❌ Błąd pobierania trasy:", err);
                    tabRoutesTmp[dayIdx].push({
                        start: current,
                        end: next,
                        czasy: [0, 0, 0],
                        transitRoute: null,
                    });
                }
            }
        }

        for (let dayIdx = 0; dayIdx < activitiesScheduleLocal.length; dayIdx++) {
            const day = activitiesScheduleLocal[dayIdx];

            for (let actIdx = 0; actIdx < day.length - 1; actIdx++) {
                const activity = day[actIdx + 1];
                let transportCzas;
                if (chosenTransportSchedule[dayIdx][actIdx] == 0 && tabRoutesTmp[dayIdx][actIdx]?.czasy[chosenTransportSchedule[dayIdx][actIdx]] < 180) {
                    transportCzas = tabRoutesTmp[dayIdx][actIdx]?.czasy[chosenTransportSchedule[dayIdx][actIdx]];
                }
                else if (chosenTransportSchedule[dayIdx][actIdx] == 0 && tabRoutesTmp[dayIdx][actIdx]?.czasy[chosenTransportSchedule[dayIdx][actIdx]] >= 180) {
                    const newChoice = standardTransportu === "Transport publiczny" ? 1 : 2;

                    setChosenTransportSchedule(prev => {
                        const updated = [...prev];
                        updated[dayIdx][actIdx] = newChoice;
                        return updated;
                    });
                    transportCzas = tabRoutesTmp[dayIdx][actIdx]?.czasy[newChoice];

                }
                else {
                    transportCzas = tabRoutesTmp[dayIdx][actIdx]?.czasy[chosenTransportSchedule[dayIdx][actIdx]];
                }
                if (chosenTransportSchedule.length === activitiesSchedule.length) {
                    if (activity.googleId === "baseBookIn") {
                        const val = maximum(
                            tabTimeScheduleTmp[dayIdx][actIdx] +
                            activitiesSchedule[dayIdx][actIdx].czasZwiedzania +
                            transportCzas,
                            timeToMinutes(wybranyHotel.checkIn)
                        );
                        tabTimeScheduleTmp[dayIdx].push(val);
                    } else {
                        tabTimeScheduleTmp[dayIdx].push(
                            tabTimeScheduleTmp[dayIdx][actIdx] +
                            activitiesSchedule[dayIdx][actIdx].czasZwiedzania +
                            transportCzas
                        );
                    }
                }
            }
        }

        setRouteSchedule(tabRoutesTmp);
        setTimeSchedule(tabTimeScheduleTmp);
        return true;
    }

    function verifyBaseActs(tab) {
        if (!tab?.length || !miejsceDocelowe || !miejsceStartowe) return tab;

        const newTab = structuredClone(tab);
        const hotelIds = ["baseHotelIn", "baseHotelOut", "baseBookIn", "baseBookOut"];
        if (newTab.length === 1) {
            newTab[0] = (newTab[0] || []).filter(
                act => act && !hotelIds.includes(act.googleId)
            );
        }
        for (let i = 0; i < newTab.length; i++) {
            for (let j = 0; j < newTab[i].length; j++) {
                const act = newTab[i][j];
                if (hotelIds.includes(act.googleId)) {
                    act.lokalizacja = {
                        lat: wybranyHotel?.lat || wybranyHotel?.location?.lat || miejsceDocelowe?.location?.lat || 52.2297,
                        lng: wybranyHotel?.lng || wybranyHotel?.location?.lng || miejsceDocelowe?.location?.lng || 21.0122,
                    };
                    act.adres = wybranyHotel?.adres || wybranyHotel?.nazwa || miejsceDocelowe?.nazwa || "";
                }
            }

            if (newTab.length && i === 0) {
                let baseRouteToToAdd = true;
                let baseBookInToAdd = newTab.length > 1;
                let baseRouteToId = -1;
                let baseBookInToDel = false;
                for (let j = 0; j < newTab[i].length; j++) {
                    if (newTab[i][j]?.googleId === "baseRouteTo") {
                        baseRouteToToAdd = false;
                        baseRouteToId = j;
                    }
                    if (newTab[i][j]?.googleId === "baseBookIn") {
                        baseBookInToAdd = false;
                        baseBookInToDel = newTab.length == 1;
                    }
                }

                if (!baseRouteToToAdd) {
                    newTab[i][baseRouteToId] = {
                        googleId: "baseRouteTo",
                        nazwa: "Wyjazd do miejsca docelowego",
                        adres: "",
                        czasZwiedzania: 0,
                        lokalizacja: {
                            lat: miejsceStartowe?.location?.lat || 52.4056786,
                            lng: miejsceStartowe?.location?.lng || 16.9312766,
                        },
                    };
                }

                if (baseRouteToToAdd) {
                    if (baseBookInToAdd) {
                        newTab[i] = [
                            {
                                googleId: "baseBookIn",
                                nazwa: "Zameldowanie w miejscu noclegu",
                                adres: wybranyHotel?.adres || wybranyHotel?.nazwa || miejsceDocelowe?.nazwa,
                                czasZwiedzania: 30,
                                lokalizacja: {
                                    lat: wybranyHotel?.lat || 52.4056785,
                                    lng: wybranyHotel?.lng || 16.9312766,
                                },
                            },
                            ...newTab[i],
                        ];

                        newTab[i] = [
                            {
                                googleId: "baseRouteTo",
                                nazwa: "Wyjazd do miejsca docelowego",
                                adres: "",
                                czasZwiedzania: 0,
                                lokalizacja: {
                                    lat: miejsceStartowe?.location?.lat || 52.4056786,
                                    lng: miejsceStartowe?.location?.lng || 16.9312766,
                                },
                            },
                            ...newTab[i],
                        ];
                    } else {
                        newTab[i] = [
                            {
                                googleId: "baseRouteTo",
                                nazwa: "Wyjazd do miejsca docelowego",
                                adres: "",
                                czasZwiedzania: 0,
                                lokalizacja: {
                                    lat: miejsceStartowe?.location?.lat || 52.4056786,
                                    lng: miejsceStartowe?.location?.lng || 16.9312766,
                                },
                            },
                            ...newTab[i],
                        ];
                    }
                }

                if (!baseRouteToToAdd && baseBookInToAdd) {
                    newTab[i] = [
                        newTab[i][0],
                        {
                            googleId: "baseBookIn",
                            nazwa: "Zameldowanie w miejscu noclegu",
                            adres: wybranyHotel?.adres || wybranyHotel?.nazwa || miejsceDocelowe?.nazwa,
                            czasZwiedzania: 30,
                            lokalizacja: {
                                lat: wybranyHotel?.lat || 52.4056785,
                                lng: wybranyHotel?.lng || 16.9312766,
                            },
                        },
                        ...newTab[i].slice(1),
                    ];
                }
            }

            if (newTab.length && i === newTab.length - 1) {
                let baseRouteFromToAdd = true;
                let baseBookOutToAdd = newTab.length > 1;
                let baseRouteFromId = -1;

                for (let j = 0; j < newTab[i].length; j++) {
                    if (newTab[i][j]?.googleId === "baseRouteFrom") {
                        baseRouteFromToAdd = false;
                        baseRouteFromId = j;
                    }
                    if (newTab[i][j]?.googleId === "baseBookOut") baseBookOutToAdd = false;
                }

                if (!baseRouteFromToAdd) {
                    newTab[i][baseRouteFromId] = {
                        googleId: "baseRouteFrom",
                        nazwa: "Powrót do domu",
                        adres: "",
                        czasZwiedzania: 0,
                        lokalizacja: {
                            lat: miejsceStartowe?.location?.lat || 52.4056786,
                            lng: miejsceStartowe?.location?.lng || 16.9312766,
                        },
                    };
                }

                if (baseRouteFromToAdd) {
                    if (baseBookOutToAdd) {
                        newTab[i] = [
                            ...newTab[i],
                            {
                                googleId: "baseBookOut",
                                nazwa: "Wymeldowanie z miejsca noclegu",
                                adres: wybranyHotel?.adres || wybranyHotel?.nazwa || miejsceDocelowe?.nazwa,
                                czasZwiedzania: 30,
                                lokalizacja: {
                                    lat: wybranyHotel?.lat || 52.4056786,
                                    lng: wybranyHotel?.lng || 16.9312766,
                                },
                            },
                            {
                                googleId: "baseRouteFrom",
                                nazwa: "Powrót do domu",
                                adres: "",
                                czasZwiedzania: 0,
                                lokalizacja: {
                                    lat: miejsceStartowe?.location?.lat || 52.4056786,
                                    lng: miejsceStartowe?.location?.lng || 16.9312766,
                                },
                            },
                        ];
                    } else {
                        newTab[i] = [
                            ...newTab[i],
                            {
                                googleId: "baseRouteFrom",
                                nazwa: "Powrót do domu",
                                adres: "",
                                czasZwiedzania: 0,
                                lokalizacja: {
                                    lat: miejsceStartowe?.location?.lat || 52.4056786,
                                    lng: miejsceStartowe?.location?.lng || 16.9312766,
                                },
                            },
                        ];
                    }
                }
            }

            if (i < newTab.length - 1) {
                newTab[i] = newTab[i].filter(
                    (act) => act.googleId !== "baseRouteFrom" && act.googleId !== "baseBookOut"
                );

                const hasHotelIn = newTab[i].some((act) => act.googleId === "baseHotelIn");
                if (!hasHotelIn) {
                    newTab[i].push({
                        googleId: "baseHotelIn",
                        nazwa: "Powrót na nocleg",
                        adres: wybranyHotel?.adres || wybranyHotel?.nazwa,
                        czasZwiedzania: 0,
                        lokalizacja: {
                            lat: wybranyHotel?.lat || 52.4056786,
                            lng: wybranyHotel?.lng || 16.9312766,
                        },
                    });
                }
            }

            if (i > 0) {
                newTab[i] = newTab[i].filter(
                    (act) => act.googleId !== "baseRouteTo" && act.googleId !== "baseBookIn"
                );

                const hasHotelOut = newTab[i].some((act) => act.googleId === "baseHotelOut");
                if (!hasHotelOut) {
                    newTab[i].unshift({
                        googleId: "baseHotelOut",
                        nazwa: "Pobudka",
                        adres: wybranyHotel?.adres || wybranyHotel?.nazwa,
                        czasZwiedzania: 0,
                        lokalizacja: {
                            lat: wybranyHotel?.lat || 52.4056786,
                            lng: wybranyHotel?.lng || 16.9312766,
                        },
                    });
                }
            }
        }

        return newTab;
    }

    useEffect(() => {
        validateSchedule()
    }, [activitiesSchedule, timeSchedule])

    async function updateOffer({ googleId, link = "", delayMs = 1000, nazwa }) {
        if (!googleId) return null;

        if (delayMs > 0) {
            await new Promise((r) => setTimeout(r, delayMs));
        }

        try {
            console.log(`🔄 Aktualizuję ofertę dla ${googleId} z linku ${link || "(brak)"}...`);

            // 0) ZŁAP POPRZEDNIĄ WERSJĘ ATRAKCJI (z lokalnego stanu), żeby znać "stary" domyślny czas
            const prevAttr = Array.isArray(atrakcje)
                ? atrakcje.find(a => a && a.googleId === googleId)
                : null;

            const prevDefaultTime =
                (prevAttr?.czasZwiedzania != null ? prevAttr.czasZwiedzania : null) ??
                (prevAttr?.warianty?.[0]?.czasZwiedzania != null ? prevAttr.warianty[0].czasZwiedzania : null);

            // 1) Aktualizacja po stronie serwera (może pójść bez linku – backend powinien to wspierać)
            const { data: updateRes } = await axios.get(`${port}/update-offer`, {
                params: { googleId, link, miasto: miejsceDocelowe?.nazwa ?? "", nazwa },
                timeout: 240000,
            });

            // 2) Pobranie świeżej wersji
            const { data: freshAttraction } = await axios.get(
                `${port}/getOneAttraction/${encodeURIComponent(googleId)}`,
                { timeout: 120000 }
            );

            // Wyznacz nowy domyślny czas i cenę z pierwszego wariantu (jeśli jest)
            const newDefaultTime =
                (freshAttraction?.czasZwiedzania != null ? freshAttraction.czasZwiedzania : null) ??
                (freshAttraction?.warianty?.[0]?.czasZwiedzania != null ? freshAttraction.warianty[0].czasZwiedzania : null) ??
                60;

            const newDefaultPrice =
                (freshAttraction?.warianty?.[0]?.cenaZwiedzania != null ? freshAttraction.warianty[0].cenaZwiedzania : null) ??
                (freshAttraction?.cenaZwiedzania != null ? freshAttraction.cenaZwiedzania : null) ??
                0;

            // 3) Zaktualizuj listę atrakcje (immutably)
            setAtrakcje(prev =>
                Array.isArray(prev)
                    ? prev.map(a => (a?.googleId === googleId ? { ...a, ...freshAttraction } : a))
                    : prev
            );

            // 4) Podmień wystąpienia w activitiesSchedule:
            //    - jeśli user NIE edytował czasu (tj. czas == poprzedni domyślny), ustaw nowy domyślny
            //    - jeśli user edytował (czas różny od poprzedniego domyślnego), zostaw nietknięty
            setActivitiesSchedule(prev => {
                if (!Array.isArray(prev)) return prev;

                return prev.map(day => {
                    if (!Array.isArray(day)) return day;

                    return day.map(act => {
                        if (!act || act.googleId !== googleId) return act;

                        const preserved = Number.isFinite(act.czasZwiedzania) ? act.czasZwiedzania : null;
                        const userOverrode =
                            preserved != null &&
                            prevDefaultTime != null &&
                            preserved !== prevDefaultTime;

                        const nextTime =
                            preserved == null
                                ? newDefaultTime                           // wcześniej brak – daj nowy default
                                : (userOverrode ? preserved : newDefaultTime); // user zmieniał? zachowaj; inaczej nadpisz

                        // scal dane atrakcji, ustaw domyślną cenę z wariantu #1
                        const merged = { ...act, ...freshAttraction };
                        merged.cenaZwiedzania = newDefaultPrice;
                        merged.czasZwiedzania = Number.isFinite(nextTime) ? nextTime : 60;

                        return merged;
                    });
                });
            });

            console.log("✅ Oferta zaktualizowana:", updateRes);
            return { update: updateRes, attraction: freshAttraction };
        } catch (err) {
            console.error("❌ Błąd przy aktualizacji oferty:", err?.message || err);
            throw err;
        }
    }

    function addActivity(dayIndex, activity, botAuthor = false) {
        if (konfiguratorLoading) return;
        if (activity?.googleId?.includes("base")) return;
        if (!activity?.lokalizacja) {
            activity.lokalizacja = activitiesSchedule[dayIndex][activitiesSchedule[dayIndex].length > 1 ? activitiesSchedule[dayIndex].length - 2 : activitiesSchedule[dayIndex].length - 1].lokalizacja
        }
        const needsAlert = !activity?.warianty?.length && !botAuthor && !activity?.googleId.includes("dAct_");

        const isUnverified = !activity?.warianty?.length; // true dla undefined lub []
        const isBase = typeof activity?.googleId === "string" && activity.googleId.startsWith("dAct_");

        if (isUnverified && !isBase) {
            console.log("Aktualizuję ofertę dla", activity?.nazwa);

            updateOffer({
                googleId: activity.googleId,
                link: activity.stronaInternetowa ?? null,
                delayMs: 0,
                nazwa: activity.nazwa,
            }).catch((err) => {
                console.error("❌ updateOffer error:", err?.message || err);
            });

            setChangeActivities((prev) =>
                prev.includes(activity.googleId) ? prev : [...prev, activity.googleId]
            );
        }

        setActivitiesSchedule(prev => {
            const updated = prev.map((dayActivities, idx) => {
                if (idx !== dayIndex) return dayActivities;

                const newDay = [...dayActivities];
                const last = newDay[newDay.length - 1];
                const newActivity = {
                    ...activity,
                    czasZwiedzania: activity?.czasZwiedzania || 60,
                };
                if (last?.googleId === "baseRouteFrom" || last?.googleId === "baseHotelIn") {
                    newDay.splice(newDay.length - 1, 0, newActivity);
                } else {
                    newDay.push(newActivity);
                }
                return newDay;
            });

            return verifyBaseActs(updated);
        });

        if (needsAlert) {
            addAlert(
                "error",
                "Uwaga! Podana aktywność nie ma zweryfikowanej oferty, nasz support niebawem ją zweryfikuje."
            );
        }
    }

    function deleteActivity(dayIndex, actIdx) {
        if (activitiesSchedule[dayIndex][actIdx]?.googleId?.includes("base")) return;
        setActivitiesSchedule(prev =>
            prev.map((dayActivities, dIdx) =>
                dIdx === dayIndex
                    ? dayActivities.filter((_, aIdx) => aIdx !== actIdx)
                    : dayActivities
            )
        );
    }
    async function swapActivities(dayIndex, act1, act2) {
        if (
            act1 === 0 ||
            act2 === 0 ||
            act1 === activitiesSchedule[dayIndex].length - 1 ||
            act2 === activitiesSchedule[dayIndex].length - 1
        ) {

            return;
        }

        const tmpActivities = activitiesSchedule.map(day => [...day]);
        const day = tmpActivities[dayIndex];
        [day[act1], day[act2]] = [day[act2], day[act1]];
        tmpActivities[dayIndex][act2].openedInit = true;
        const success = true;
        if (success) {
            setActivitiesSchedule(tmpActivities);
            return true;
        } else {
            console.warn("⚠️ Nie udało się zaktualizować tras po zamianie atrakcji");
            return false;
        }
    }

    function changeActivity(dayIdx, idx, activity) {
        if (activitiesSchedule[dayIdx][idx]?.googleId?.includes("base")) return;
        setActivitiesSchedule(prevSchedule =>
            prevSchedule.map((day, dIndex) =>
                dIndex === dayIdx
                    ? day.map((act, aIndex) =>
                        aIndex === idx ? { ...activity, czasZwiedzania: activity?.czasZwiedzania ? activity.czasZwiedzania : 60 } : act
                    )
                    : day
            )
        );
    }
    function changeStartHour(dayIdx, startTime) {
        if (startTime < 0) return;
        dayIdx != activitiesSchedule.length - 1 && setStartHours(prev => {
            const tmpHours = [...prev];
            tmpHours[dayIdx] = startTime;
            return tmpHours;
        });
        dayIdx == activitiesSchedule.length - 1 && setStartHours(prev => {
            const tmpHours = [...prev];
            tmpHours[dayIdx] = minimum(startTime, timeToMinutes(wybranyHotel.checkOut) - 10);
            return tmpHours;
        });
    }

    function startModifyingAct(dayIdx, idx) {
        const modyfikacjaStruct = { flag: true, dayIdx, idx }
        setModyfikacja(modyfikacjaStruct)
    }
    useEffect(() => {
        if (modyfikacja.flag) setActivityPanelOpened(true);
    }, [modyfikacja])

    async function changeActivityTime(dayIdx, actIdx, time) {
        const tmpActivities = activitiesSchedule.map((day, dIdx) =>
            day.map((activity, aIdx) =>
                dIdx === dayIdx && aIdx === actIdx
                    ? { ...activity, czasZwiedzania: time }
                    : activity
            )
        );
        setActivitiesSchedule(tmpActivities);
        return true;
    }

    useEffect(() => {
        if (!dataPrzyjazdu || !dataWyjazdu) return;

        setKonfiguratorLoading(true)
        const handler = setTimeout(() => {
            const days = roznicaDni(dataPrzyjazdu, dataWyjazdu) > 0
                ? roznicaDni(dataPrzyjazdu, dataWyjazdu)
                : 1;

            setActivitiesSchedule(prev => {
                if (days < prev.length) {
                    let updated = verifyBaseActs(prev.slice(0, days));
                    setStartHours(prev => prev.slice(0, days));
                    return updated;
                } else if (days > prev.length) {
                    const extra = Array.from({ length: days - prev.length }, () => []);
                    let updated = verifyBaseActs([...prev, ...extra]);
                    setStartHours(prev => [...prev, ...Array.from({ length: days - prev.length }, () => 480)]);
                    return updated;
                }
                let updated = verifyBaseActs(prev);
                return updated;
            });

            setLiczbaDni(days);
            setKonfiguratorLoading(false);
        }, 3000);

        return () => clearTimeout(handler);
    }, [dataWyjazdu, dataPrzyjazdu]);

    useEffect(() => {
        setChosenTransportSchedule(prev => {
            let updated = [...prev];

            if (activitiesSchedule.length > updated.length) {
                const extraDays = Array.from(
                    { length: activitiesSchedule.length - updated.length },
                    () => []
                );
                updated = [...updated, ...extraDays];
            } else if (activitiesSchedule.length < updated.length) {
                updated = updated.slice(0, activitiesSchedule.length);
            }

            updated = updated.map((dayTransports, dayIdx) => {
                const targetLen = activitiesSchedule[dayIdx].length;
                const diff = targetLen - dayTransports.length - 1;
                if (diff > 0) {
                    return [...dayTransports, ...Array(diff).fill(standardTransportu == 0 ? 1 : 2)];
                } else if (diff < 0) {
                    return dayTransports.slice(0, targetLen + diff);
                }
                return dayTransports;
            });
            return updated;
        });
    }, [activitiesSchedule]);

    function changeChosenTransport(dayIdx, actIdx, value) {
        setChosenTransportSchedule(prev => {
            const updated = prev.map((day, dIdx) =>
                dIdx === dayIdx
                    ? day.map((transport, aIdx) =>
                        aIdx === actIdx ? value : transport
                    )
                    : day
            );
            return updated;
        });
    }

    const prevValues = useRef({
        chosenTransportSchedule,
        startHours,
        activitiesSchedule,
    });

    useEffect(() => {
        if (!miejsceDocelowe || !miejsceStartowe) return;

        const prev = prevValues.current;
        const changed =
            JSON.stringify(prev.chosenTransportSchedule) !== JSON.stringify(chosenTransportSchedule) ||
            JSON.stringify(prev.startHours) !== JSON.stringify(startHours) ||
            JSON.stringify(prev.activitiesSchedule) !== JSON.stringify(activitiesSchedule)

        if (!changed) return;

        prevValues.current = {
            chosenTransportSchedule,
            startHours,
            miejsceStartowe,
            miejsceDocelowe,
        };

        const recalculate = async () => {
            const cloned = structuredClone(activitiesSchedule);
            await generateRouteSchedule(cloned);
        };

        recalculate();
    }, [chosenTransportSchedule, startHours, activitiesSchedule]);

    useEffect(() => {
        const timer = setTimeout(() => {
            console.log("Correcting hotel's informations.", wybranyHotel)
            setActivitiesSchedule(prev => verifyBaseActs(structuredClone(prev)));
        }, 10000);
        return () => clearTimeout(timer);
    }, [miejsceStartowe, wybranyHotel]);

    const submitMiejsceStartowe = (miejsceStartoweWybor) => {
        setMiejsceStartowe(miejsceStartoweWybor);
        setMiejsceStartoweSearching("")
        setMiejsceStartoweResults([]);
    }
    function formatDate(dateInput) {
        if (!dateInput) {
            return "dd/mm/rrrr"
        }
        const date = new Date(dateInput);

        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    }

    useEffect(() => {
        const hasAll =
            Array.isArray(activitiesSchedule) &&
            typeof liczbaUczestnikow === "number" &&
            typeof liczbaOpiekunow === "number" &&
            routeSchedule &&
            wybranyHotel;

        if (!hasAll) return;
        setComputingPrice(true)
        const controller = new AbortController();

        const timer = setTimeout(async () => {
            try {
                const { data } = await axios.post(
                    `${port}/computePrice`,
                    {
                        activitiesSchedule,
                        liczbaUczestnikow,
                        liczbaOpiekunow: liczbaOpiekunow,
                        routeSchedule,
                        wybranyHotel,
                        chosenTransportSchedule,
                        standardTransportu
                    },
                    { signal: controller.signal }
                );
                setTripPrice(data?.tripPrice ?? 0);
                setInsurancePrice(data?.insurancePrice ?? 0);
            } catch (err) {
                if (err.name !== "CanceledError" && err.name !== "AbortError") {
                    console.error("❌ /computePrice error:", err?.message || err);
                }
            }
        }, 1000);
        setComputingPrice(false)
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [
        activitiesSchedule,
        liczbaUczestnikow,
        liczbaOpiekunow,
        routeSchedule,
        wybranyHotel,
    ]);

    useEffect(() => {
        console.log("wybrany hotel", wybranyHotel, dataWyjazdu, dataPrzyjazdu, liczbaDni, (liczbaOpiekunow + liczbaUczestnikow), ((standardHotelu + 1) % 4))
    }, [wybranyHotel, liczbaDni])
    const pokojeOpiekunowie = 2;
    useEffect(() => {
        if (
            !miejsceDocelowe?.nazwa ||
            !miejsceDocelowe?.location?.lat ||
            !miejsceDocelowe?.location?.lng ||
            !liczbaUczestnikow
        ) return;

        const {
            nazwa,
            location: { lat, lng },
        } = miejsceDocelowe;

        const key = `Hotel-${nazwa}-${formatDate(dataPrzyjazdu)}-${formatDate(dataWyjazdu)}-${standardHotelu}-${liczbaUczestnikow}-${liczbaOpiekunow}-${pokojeOpiekunowie}`;

        const cachedHotel = localStorage.getItem(key);
        if (cachedHotel) {
            try {
                const parsed = JSON.parse(cachedHotel);
                console.log("💾 Załadowano hotel z localStorage:", parsed);
                setWybranyHotel(parsed);
                return;
            } catch {
                console.warn("⚠️ Błąd przy odczycie danych z localStorage, pobieram z API...");
            }
        }

        let initialTimer;
        let retryTimer;
        let cancelled = false;

        const fetchHotel = async (attempt = 0) => {
            try {
                console.log(`🌍 Pobieram hotel z API /findHotel... (attempt ${attempt + 1})`);
                const response = await axios.get(`${port}/findHotel`, {
                    params: {
                        city: nazwa,
                        centerLat: lat,
                        centerLng: lng,
                        arrival_date: toBookingDateFormat(dataPrzyjazdu),
                        departure_date: toBookingDateFormat(dataWyjazdu),
                        stars:
                            standardHotelu == 0
                                ? "class::0,class::1"
                                : standardHotelu == 1
                                    ? "class::2,class::3"
                                    : "class::4,class::5",
                        property_types: "property_type::204",
                        apartsAllowed: standardHotelu > 0 ? false : true,
                        max_pages: 3,
                        uczestnicy: liczbaUczestnikow,
                        opiekunowie: liczbaOpiekunow,
                        pokojeOpiekunowie: pokojeOpiekunowie,
                    },
                });

                if (cancelled) return;

                console.log("✅ Wynik zapytania /findHotel:", response.data);

                const winningHotel = Array.isArray(response.data?.hotels)
                    ? response.data.hotels[Math.min(response.data.hotels.length - 1, 2)]
                    : response.data?.[0];

                if (!winningHotel) {
                    console.warn("⚠️ Nie znaleziono hoteli dla podanych parametrów.");
                    return;
                }

                const pb = winningHotel?.property?.priceBreakdown;

                const hotelData = {
                    nazwa: winningHotel.property.name,
                    adres: winningHotel.property.address || "",
                    stars: winningHotel.property.accuratePropertyClass,
                    checkIn: winningHotel.property.checkin?.fromTime || "N/A",
                    checkOut: winningHotel.property.checkout?.untilTime || "N/A",
                    cena:
                        (Number(pb?.strikethroughPrice?.value) || 0) > 0
                            ? Number(pb.strikethroughPrice.value)
                            : (Number(pb?.grossPrice?.value) || 0),
                    lat: winningHotel.property.latitude,
                    lng: winningHotel.property.longitude,
                    cachedAt: new Date().toISOString(),
                };

                localStorage.setItem(key, JSON.stringify(hotelData));

                setWybranyHotel(hotelData);
            } catch (error) {
                if (cancelled) return;
                console.error("❌ Błąd podczas pobierania hoteli:", error?.message || error);

                if (attempt === 0) {
                    console.log("⏳ Ponawiam próbę pobrania hotelu za 5 s...");
                    retryTimer = setTimeout(() => fetchHotel(1), 5000);
                }
            }
        };

        initialTimer = setTimeout(() => fetchHotel(0), 1000);

        return () => {
            cancelled = true;
            if (initialTimer) clearTimeout(initialTimer);
            if (retryTimer) clearTimeout(retryTimer);
        };
    }, [
        miejsceDocelowe,
        dataPrzyjazdu,
        dataWyjazdu,
        standardHotelu,
        liczbaUczestnikow,
        liczbaOpiekunow,
        pokojeOpiekunowie
    ]);

    // UPEWNIJ SIĘ, ŻE MASZ: const [atrakcje, setAtrakcje] = useState([]);

    const wallpaperFillRunningRef = useRef(false);
    const wallpaperDoneRef = useRef(new Set()); // żeby nie odpalać ponownie dla tych samych googleId w trakcie sesji

    useEffect(() => {
        if (!Array.isArray(atrakcje) || atrakcje.length === 0) return;
        if (wallpaperFillRunningRef.current) return;

        const first50 = atrakcje.slice(0, 50);

        // bierzemy tylko te bez wallpaper oraz takie, których jeszcze nie próbowaliśmy w tej sesji
        const missing = first50.filter((a) => {
            const gid = a?.googleId;
            const hasWallpaper = !!a?.wallpaper && String(a.wallpaper).trim().length > 0;
            const alreadyTried = gid ? wallpaperDoneRef.current.has(gid) : true;
            return !hasWallpaper && !alreadyTried;
        });

        if (missing.length === 0) return;

        wallpaperFillRunningRef.current = true;
        const controller = new AbortController();

        const fetchWallpaper = async (a) => {
            const nazwa = (a?.nazwa || "").trim();

            // Miasto: bierzemy ostatnią część po przecinku, a jeśli brak przecinka – cały adres
            // Przykłady:
            // "Gaudeegasse 1, Wien" -> "Wien"
            // "Rynek Główny, Kraków" -> "Kraków"
            // "Wiedeń" -> "Wiedeń"
            const city = (() => {
                const raw = (a?.adres || "").trim();
                if (!raw) return "";
                const parts = raw.split(",").map(s => s.trim()).filter(Boolean);
                return parts.length ? parts[parts.length - 1] : "";
            })();

            // Format: "Smok Wawelski w Krakow"
            const nameWithCity = city ? `${nazwa} w ${city}` : nazwa;

            const params = new URLSearchParams({
                name: nameWithCity,
                googleId: a.googleId,
                lang: "pl",
                thumbWidth: "1200",
            });
            console.log(nameWithCity)
            const res = await fetch(`${port}/api/wiki-image?${params.toString()}`, {
                method: "GET",
                headers: { Accept: "application/json" },
                signal: controller.signal,
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) return { googleId: a?.googleId, imageUrl: null };

            return { googleId: a?.googleId, imageUrl: data?.imageUrl || null };
        };


        const run = async () => {
            try {
                const concurrency = 5; // limit równoległych requestów
                const queue = [...missing];

                const workers = Array.from({ length: concurrency }, async () => {
                    while (queue.length) {
                        const a = queue.shift();
                        if (!a) return;

                        const gid = a?.googleId;
                        if (!gid) continue;

                        // oznacz jako "próbowane" (żeby nie zapętlać requestów przy kolejnych renderach)
                        wallpaperDoneRef.current.add(gid);

                        // jeżeli w międzyczasie już dostało wallpaper, pomiń
                        const current = atrakcje.find((x) => x?.googleId === gid);
                        if (current?.wallpaper) continue;

                        const { imageUrl } = await fetchWallpaper(a);

                        if (imageUrl) {
                            setAtrakcje((prev) =>
                                prev.map((x) =>
                                    x?.googleId === gid ? { ...x, wallpaper: imageUrl } : x
                                )
                            );

                            // Jeśli chcesz też persist do DB:
                            // await fetch(`${port}/api/attractions/${encodeURIComponent(gid)}`, { method:"PATCH", ... })
                        }
                    }
                });

                await Promise.all(workers);
            } catch (err) {
                if (err?.name !== "AbortError") console.error("Wallpaper fill error:", err);
            } finally {
                wallpaperFillRunningRef.current = false;
            }
        };

        run();

        return () => {
            controller.abort();
            wallpaperFillRunningRef.current = false;
        };
    }, [atrakcje, port]);
    useEffect(() => {
        function handleClickOutside(event) {
            if (settingsRef.current && !settingsRef.current.contains(event.target)) {
                setSettingsOpened(false);
                setMiejsceStartowePopupOpened(false);
                setWyborDatyOpened(false);
                setWyborGosciOpened(false);
                setWyborStandardHoteluOpened(false);
                setWyborStandardTransportuOpened(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    const settingsRef = useRef(null);

    const [routeToPrint, setRouteToPrint] = useState([]);
    const [routeFromPrint, setRouteFromPrint] = useState([])

    useEffect(() => {
        if (!routeSchedule || !routeSchedule.length) return;
        const routeToPlan = routeSchedule[0][0]?.transitRoute || [];
        const routeFromPlan = routeSchedule[routeSchedule.length - 1][routeSchedule[routeSchedule.length - 1].length - 1]?.transitRoute || [];
        let tmpRouteToPrint = [];
        let tmpRouteFromPrint = [];
        for (let i = 0; i < routeToPlan.length; i++) {
            if (routeToPlan[i].vehicleType != 'WALK' && routeToPlan[i].vehicleType != 'TRAM' && routeToPlan[i].durationMinutes > 30) {
                tmpRouteToPrint.push({ line: routeToPlan[i].line, time: routeToPlan[i].durationMinutes, depart: routeToPlan[i].departureStop, arrival: routeToPlan[i].arrivalStop, type: routeToPlan[i].vehicleType })
            }
        }
        for (let i = 0; i < routeFromPlan.length; i++) {
            if (routeFromPlan[i].vehicleType != 'WALK' && routeFromPlan[i].vehicleType != 'TRAM' && routeFromPlan[i].durationMinutes > 30) {
                tmpRouteFromPrint.push({ line: routeFromPlan[i].line, time: routeFromPlan[i].durationMinutes, depart: routeFromPlan[i].departureStop, arrival: routeFromPlan[i].arrivalStop, type: routeFromPlan[i].vehicleType })
            }
        }
        setRouteToPrint(tmpRouteToPrint)
        setRouteFromPrint(tmpRouteFromPrint);

    }, [routeSchedule])

    const [filtersLeftOpened, setFiltersLeftOpened] = useState(false)
    const [chosenFilters, setChosenFilters] = useState([])
    const mainRef = useRef(null);
    const leftRef = useRef(null);
    const centerRef = useRef(null); // KonfiguratorMainMainboxRight
    const rightRef = useRef(null);  // prawa kolumna (KonfiguratorMainMainboxLeft z className="right")

    const [leftHeight, setLeftHeight] = useState(1500);
    useEffect(() => {
        const updateHeights = () => {
            if (!centerRef.current && !rightRef.current) return;

            const centerH = centerRef.current?.scrollHeight || 0;
            const rightH = rightRef.current?.scrollHeight || 0;

            const otherColsHeight = Math.max(centerH, rightH);

            // Minimalnie 1500, ale jeśli inne kolumny wyższe – dopasuj się do nich
            const target = Math.max(1500, otherColsHeight || 0);

            setLeftHeight(target);
        };

        updateHeights();
        window.addEventListener("resize", updateHeights);

        return () => window.removeEventListener("resize", updateHeights);
    }, [
        activitiesSchedule,
        routeSchedule,
        timeSchedule,
        liczbaUczestnikow,
        liczbaOpiekunow,
        standardHotelu,
        standardTransportu,
        miejsceDocelowe,
        miejsceStartowe,
    ]);
    const titleRef = useRef(null);

    useEffect(() => {
        // ustaw wartość początkową TYLKO raz (lub gdy zewnętrznie ją zmienisz)
        if (titleRef.current && !titleRef.current.textContent) {
            titleRef.current.textContent = nazwaWyjazdu;
        }
    }, []); // zależności puste – bez aktualizacji na każdy input

    useEffect(() => {
        if (!titleRef.current) return;

        // Nie nadpisuj, gdy użytkownik aktualnie edytuje tytuł
        if (document.activeElement === titleRef.current) return;

        titleRef.current.textContent = nazwaWyjazdu ?? "";
    }, [nazwaWyjazdu]);


    function toYMD(value) {
        if (!value) return null;

        // jeśli to już string "YYYY-MM-DD" albo dłuższy – przytnij
        if (typeof value === "string") {
            const m = value.match(/^\d{4}-\d{2}-\d{2}/);
            return m ? m[0] : null;
        }

        // jeśli to Date
        if (value instanceof Date && !isNaN(value.getTime())) {
            const y = value.getFullYear();
            const m = String(value.getMonth() + 1).padStart(2, "0");
            const d = String(value.getDate()).padStart(2, "0");
            return `${y}-${m}-${d}`;
        }

        return null;
    }

    useEffect(() => {
        const lat = miejsceDocelowe?.location?.lat;
        const lng = miejsceDocelowe?.location?.lng;

        const startDate = toYMD(dataPrzyjazdu);
        const endDate = toYMD(dataWyjazdu);

        // Brak pełnych danych – nie wywołujemy endpointu
        if (
            lat == null ||
            lng == null ||
            !startDate ||
            !endDate
        ) {
            return;
        }

        // SSR safeguard (jeśli używasz Next/SSR)
        if (typeof window === "undefined") {
            return;
        }

        const controller = new AbortController();

        // prosty, jednoznaczny klucz cache
        const key = `tm_${startDate}_${endDate}_${lat}_${lng}`;

        async function fetchTicketmasterEvents() {
            try {
                const res = await fetch(
                    `${port}/ticketmasterEvents` +
                    `?lat=${encodeURIComponent(lat)}` +
                    `&lng=${encodeURIComponent(lng)}` +
                    `&startDate=${encodeURIComponent(startDate)}` +
                    `&endDate=${encodeURIComponent(endDate)}`,
                    { signal: controller.signal }
                );

                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }

                const data = await res.json();

                const events = data.events || [];

                // 🔹 zapis do localStorage – zawsze STRING
                try {
                    localStorage.setItem(key, JSON.stringify(events));
                } catch (e) {
                }

                setEvents(events);
            } catch (err) {
                if (err.name === "AbortError") return;
                console.error("Ticketmaster events error:", err);
            }
        }

        // 🔹 najpierw próbujemy cache z localStorage
        try {
            const raw = localStorage.getItem(key);
            if (raw) {
                const cachedEvents = JSON.parse(raw);
                setEvents(Array.isArray(cachedEvents) ? cachedEvents : []);
                return; // nie wywołujemy API
            }
        } catch (e) {
            console.warn("Błąd odczytu z localStorage:", e);
        }

        // brak cache → wołamy API
        fetchTicketmasterEvents();

        return () => {
            controller.abort();
        };
    }, [
        miejsceDocelowe?.location?.lat,
        miejsceDocelowe?.location?.lng,
        // jeśli Date, bierzemy getTime jako zależność
        dataPrzyjazdu instanceof Date ? dataPrzyjazdu.getTime() : dataPrzyjazdu,
        dataWyjazdu instanceof Date ? dataWyjazdu.getTime() : dataWyjazdu,
    ]);

    const navigate = useNavigate()
    const redirectToSettings = async () => {
        try {
            if (hasPendingAutoSave) {
                setRedirecting(true);
                // 🔽 zakładamy, że handleSaveClick zwraca Promise
                await handleSaveClick();
            }

            const url = new URL(window.location.href);
            const params = url.search || ""; // np. "?tripId=123&arr=2025-05-01..."

            const redirectLink = `/konfigurator-lounge${params}`;
            navigate(redirectLink);
        } finally {
            setRedirecting(false);
        }
    };
    return (
        redirecting ? <div style={{ height: '100vh', width: '100vw', postion: 'fixed', left: '0', top: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader /></div> :
            <>
                <KonfiguratorPhotoWithSettings style={photoWallpaper ? { backgroundImage: `url(${photoWallpaper})`, } : { backgroundImage: `url(${'https://images.unsplash.com/photo-1716481631637-e2d4fd2456e2?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'})`, }}>

                    <div className="wyjazdNazwa">
                        <div
                            className="wyjazdNazwaInput"
                            contentEditable
                            suppressContentEditableWarning
                            ref={titleRef}
                            onInput={(e) => {
                                setNazwaWyjazdu(e.currentTarget.textContent);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();       // brak nowej linii
                                    e.stopPropagation();      // opcjonalnie: nie puszczamy dalej
                                    e.currentTarget.blur();   // „zamknięcie” pola
                                    handleSaveClick();        // zapis
                                }
                            }}
                        />
                        <Edit2 size={40} />
                        <div style={{ flex: '1' }} />
                        <SaveButton
                            className="c"

                            onClick={() => redirectToSettings()}
                        >

                            <ChevronLeft size={16} />Ustawienia wyjazdu
                        </SaveButton>
                        <SaveButton
                            className="b c"

                        >
                            Zarezerwuj wyjazd<Rocket size={16} />
                        </SaveButton>
                    </div>


                    <KonfiguratorMainSettings ref={settingsRef} className={settingsOpened ? "opened" : "closed"}>

                        <SettingsButton onClick={() => setPopupPickerOpened(0)} className={miejsceStartowePopupOpened ? "chosen def" : "def"}>
                            <Rocket size={30} />
                            Miejsce początkowe:<span>{miejsceStartowe ? miejsceStartowe.nazwa : "..."} </span>
                            {miejsceStartowePopupOpened && <div className="settingsPopup" onClick={(e) => e.stopPropagation()} >
                                <SearchBox value={miejsceStartoweSearching} onChange={setMiejsceStartoweSearching} results={miejsceStartoweResults} searchAction={submitMiejsceStartowe} disabled={miejsceStartowe} />
                                {miejsceStartowe && <>
                                    <MapaBox key={`startowe-${miejsceStartowe.nazwa}`}>
                                        <LeafletMap lat={miejsceStartowe?.location?.lat || 52.5333} lng={miejsceStartowe?.location?.lng || 16.9252} zoom={9} />
                                    </MapaBox>
                                    <MapaResultBox>
                                        <PopupResult onClick={() => setMiejsceStartowe("")} onMouseEnter={() => setMiejsceStartoweHovering(true)} onMouseLeave={() => setMiejsceStartoweHovering(false)}>
                                            <div className="popupResultTitle">
                                                {miejsceStartowe.nazwa}
                                            </div>
                                            <div className="popupResultSubtitle">
                                                {miejsceStartowe.wojewodztwo}, {miejsceStartowe.kraj}
                                            </div>
                                            <img
                                                src={"../icons/swap.svg"}
                                                width={'5%'}
                                                style={{
                                                    position: 'absolute',
                                                    right: '10px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)'
                                                }}
                                            />
                                        </PopupResult>
                                        <div className={miejsceStartoweHovering ? "changeInfo hovered" : "changeInfo"}>
                                            kliknij aby zmienić lokalizację
                                        </div>
                                    </MapaResultBox>
                                </>}
                                {!miejsceStartowe &&
                                    <MapaBox>
                                        <div className="brakMapy">
                                            Wyszukaj lokalizacje w polu wyszukiwania
                                            <img src="../icons/icon-location-gray.svg" width={'100px'} />
                                        </div>
                                    </MapaBox>}
                            </div>}
                        </SettingsButton>

                        <SettingsButton onClick={() => setPopupPickerOpened(1)} className={miejsceStartowePopupOpened ? "chosen def" : "def"}>
                            <CalendarDays size={30} />
                            {formatDate(dataPrzyjazdu || "")} - {formatDate(dataWyjazdu || "")}
                            {wyborDatyOpened && <div className="settingsPopup" onClick={(e) => e.stopPropagation()} >
                                <DataWybor dataStart={dataPrzyjazdu} dataEnd={dataWyjazdu} setDataEnd={setDataWyjazdu} setDataStart={setDataPrzyjazdu} />
                            </div>}
                        </SettingsButton>

                        <SettingsButton onClick={() => setPopupPickerOpened(2)} className={miejsceStartowePopupOpened ? "chosen def" : "def"}>
                            <Users size={30} />
                            {liczbaUczestnikow} uczestników, {liczbaOpiekunow} opiekunów
                            {wyborGosciOpened && <div className="settingsPopup" onClick={(e) => e.stopPropagation()} >
                                Liczba uczestników
                                <WyborUczestnikow uczestnicy={liczbaUczestnikow} setUczestnicy={setLiczbaUczestnikow} opiekunowie={liczbaOpiekunow} setOpiekunowie={setLiczbaOpiekunow} />
                            </div>}
                        </SettingsButton>

                        <SettingsButton onClick={() => setPopupPickerOpened(3)} className={miejsceStartowePopupOpened ? "chosen def" : "def"}>
                            <Moon size={30} />
                            Nocleg: {standardHotelu || standardHotelu == 0 ? namesHotelsTab[standardHotelu] : "..."}
                            {wyborStandardHoteluOpened && <div className="settingsPopup" onClick={(e) => e.stopPropagation()} >
                                Standard hotelu
                                <Radio1
                                    setWybor={setStandardHotelu}
                                    value={standardHotelu}
                                    name="hotel-standard"
                                    key={standardHotelu}
                                />
                            </div>}
                        </SettingsButton>

                        <SettingsButton onClick={() => setPopupPickerOpened(4)} className={miejsceStartowePopupOpened ? "chosen def" : "def"}>
                            <TramFront size={30} />
                            Preferowany transport: {standardTransportu || standardTransportu == 0 ? namesTransportTab[standardTransportu] : "..."}
                            {wyborStandardTransportuOpened && <div className="settingsPopup" onClick={(e) => e.stopPropagation()} >
                                Forma transportu
                                <Radio1
                                    options={[
                                        { value: 1, icon: "../icons/icon-private-bus.svg", label: "Wynajęty autokar" },
                                        { value: 0, icon: "../icons/icon-public-trannsport.svg", label: "Transport publiczny" },
                                        { value: 2, icon: "../icons/icon-own-transport.svg", label: "Własny" }
                                    ]}
                                    setWybor={setStandardTransportu}
                                    value={standardTransportu}
                                    name="transport-form"
                                />
                            </div>}
                        </SettingsButton>
                    </KonfiguratorMainSettings>

                </KonfiguratorPhotoWithSettings>

                {/*<KonfiguratorMainSettings ref={settingsRef} className={settingsOpened ? "opened" : "closed"}>

                <SettingsButton onClick={() => { setMiejsceStartowePopupOpened(!miejsceStartowePopupOpened); setOffOthers(0) }} className={miejsceStartowePopupOpened ? "chosen" : ""}>
                    <img height="30px" width="30px" src="../icons/icon-rocket.svg" />
                    Miejsce początkowe:<span>{miejsceStartowe ? miejsceStartowe.nazwa : "..."} </span>
                    {miejsceStartowePopupOpened && <div className="settingsPopup" onClick={(e) => e.stopPropagation()} >
                        <SearchBox value={miejsceStartoweSearching} onChange={setMiejsceStartoweSearching} results={miejsceStartoweResults} searchAction={submitMiejsceStartowe} disabled={miejsceStartowe} />
                        {miejsceStartowe && <>
                            <MapaBox key={`startowe-${miejsceStartowe.nazwa}`}>
                                <LeafletMap lat={miejsceStartowe?.location?.lat || 52.5333} lng={miejsceStartowe?.location?.lng || 16.9252} zoom={9} />
                            </MapaBox>
                            <MapaResultBox>
                                <PopupResult onClick={() => setMiejsceStartowe("")} onMouseEnter={() => setMiejsceStartoweHovering(true)} onMouseLeave={() => setMiejsceStartoweHovering(false)}>
                                    <div className="popupResultTitle">
                                        {miejsceStartowe.nazwa}
                                    </div>
                                    <div className="popupResultSubtitle">
                                        {miejsceStartowe.wojewodztwo}, {miejsceStartowe.kraj}
                                    </div>
                                    <img
                                        src={"../icons/swap.svg"}
                                        width={'5%'}
                                        style={{
                                            position: 'absolute',
                                            right: '10px',
                                            top: '50%',
                                            transform: 'translateY(-50%)'
                                        }}
                                    />
                                </PopupResult>
                                <div className={miejsceStartoweHovering ? "changeInfo hovered" : "changeInfo"}>
                                    kliknij aby zmienić lokalizację
                                </div>
                            </MapaResultBox>
                        </>}
                        {!miejsceStartowe &&
                            <MapaBox>
                                <div className="brakMapy">
                                    Wyszukaj lokalizacje w polu wyszukiwania
                                    <img src="../icons/icon-location-gray.svg" width={'100px'} />
                                </div>
                            </MapaBox>}
                    </div>}
                </SettingsButton>

                <SettingsButton className={wyborDatyOpened ? "chosen" : ""} onClick={() => { setWyborDatyOpened(!wyborDatyOpened); setOffOthers(1) }}>
                    <img height="30px" width="30px" src="../icons/calendar-svgrepo-com.svg" />
                    {formatDate(dataPrzyjazdu || "")} - {formatDate(dataWyjazdu || "")}
                    {wyborDatyOpened && <div className="settingsPopup" onClick={(e) => e.stopPropagation()} >
                        <DataWybor dataStart={dataPrzyjazdu} dataEnd={dataWyjazdu} setDataEnd={setDataWyjazdu} setDataStart={setDataPrzyjazdu} />
                    </div>}
                </SettingsButton>

                <SettingsButton className={wyborGosciOpened ? "chosen" : ""} onClick={() => { setWyborGosciOpened(!wyborGosciOpened); setOffOthers(2) }}>
                    <img height="30px" width="30px" src="../icons/users.svg" />
                    {liczbaUczestnikow} uczestników, {liczbaOpiekunow} opiekunów
                    {wyborGosciOpened && <div className="settingsPopup" onClick={(e) => e.stopPropagation()} >
                        Liczba uczestników
                        <WyborUczestnikow uczestnicy={liczbaUczestnikow} setUczestnicy={setLiczbaUczestnikow} opiekunowie={liczbaOpiekunow} setOpiekunowie={setLiczbaOpiekunow} />
                    </div>}
                </SettingsButton>

                <SettingsButton className={wyborStandardHoteluOpened ? "chosen" : ""} onClick={() => { setWyborStandardHoteluOpened(!wyborStandardHoteluOpened); setOffOthers(3) }}>
                    <img height="30px" width="30px" src="../icons/icon-hotel.svg" />
                    Standard hotelu : {standardHotelu || standardHotelu == 0 ? namesHotelsTab[standardHotelu] : "..."}
                    {wyborStandardHoteluOpened && <div className="settingsPopup" onClick={(e) => e.stopPropagation()} >
                        Standard hotelu
                        <Radio1
                            setWybor={setStandardHotelu}
                            value={standardHotelu}
                            name="hotel-standard"
                            key={standardHotelu}
                        />
                    </div>}
                </SettingsButton>

                <SettingsButton className={wyborStandardTransportuOpened ? "chosen" : ""} onClick={() => { setWyborStandardTransportuOpened(!wyborStandardTransportuOpened); setOffOthers(4) }}>
                    <img height="30px" width="30px" src="../icons/icon-transport.svg" />
                    Preferowany transport: {standardTransportu || standardTransportu == 0 ? namesTransportTab[standardTransportu] : "..."}
                    {wyborStandardTransportuOpened && <div className="settingsPopup" onClick={(e) => e.stopPropagation()} >
                        Forma transportu
                        <Radio1
                            options={[
                                { value: 1, icon: "../icons/icon-private-bus.svg", label: "Wynajęty autokar" },
                                { value: 0, icon: "../icons/icon-public-trannsport.svg", label: "Transport publiczny" },
                                { value: 2, icon: "../icons/icon-own-transport.svg", label: "Własny" }
                            ]}
                            setWybor={setStandardTransportu}
                            value={standardTransportu}
                            name="transport-form"
                        />
                    </div>}
                </SettingsButton>
            </KonfiguratorMainSettings>*/}
                <MobileNavButtons>
                    <div className="mobileNavButton"
                        onClick={() => redirectToSettings()}>
                        <ChevronLeft size={16} />Ustawienia wyjazdu
                    </div>
                    <div className="mobileNavButton b">

                        Zarezerwuj wyjazd<Rocket size={16} />
                    </div>
                </MobileNavButtons>
                <KonfiguratorMainMainbox>
                    <KonfiguratorMainMainboxLeft
                        ref={leftRef}
                        className="a"
                        style={{ height: `${leftHeight}px` }}
                    >
                        <div className="mainboxLeftTitle">
                            Biblioteka atrakcji
                        </div>
                        <PanelBoxNav className="a">
                            {[
                                { id: 0, icon: Landmark, label: "Podstawowe" },
                                { id: 2, icon: Drama, label: "Wydarzenia" },
                                { id: 1, icon: Shrub, label: "Parki" },
                            ].map(option => (
                                <label
                                    key={option.id}
                                    className={radioChosen === option.id ? "panelBoxNavButton chosen" : "panelBoxNavButton"}
                                >
                                    <input
                                        type="radio"
                                        name="navChoice"
                                        value={option.id}
                                        checked={radioChosen === option.id}
                                        onChange={() => setRadioChosen(option.id)}
                                        style={{ display: "none" }}
                                    />
                                    <option.icon />
                                </label>
                            ))}
                        </PanelBoxNav>

                        {radioChosen < 2 && <div className="mainboxLeftInput">
                            <img src="../icons/search-gray.svg" width={'20px'} />
                            <input type="text" placeholder="Wyszukaj aktywność..." value={attractionsSearching} onChange={(e) => setAttractionsSearching(e.target.value)} />
                        </div>}

                        <div className={radioChosen === 0 ? "listBox" : "listBox listBox--hidden"}>
                            <div className="mainboxLeftFilterButtons">
                                <div className={filtersLeftOpened ? "mainboxLeftFilterButton opened" : "mainboxLeftFilterButton"}>
                                    <div className="mainboxLeftFilterHeader" onClick={() => setFiltersLeftOpened(!filtersLeftOpened)}>
                                        <img src="../icons/arrow-down.svg" height="15px" alt="arrow" /> Wybierz
                                    </div>

                                    <div className="mainboxLeftFilterResults" onClick={(e) => e.stopPropagation()}>
                                        <div className="mainboxLeftFilterResult">
                                            <Checkbox2 /> Muzeum
                                        </div>
                                        <div className="mainboxLeftFilterResult">
                                            <Checkbox2 /> Park
                                        </div>
                                        <div className="mainboxLeftFilterResult">
                                            <Checkbox2 /> Zamek
                                        </div>
                                    </div>
                                </div>

                                <div className="mainboxLeftFilterButton">

                                </div>
                            </div>

                            {atrakcje
                                .filter(atrakcja =>
                                    atrakcja.dataSource !== "Bot" && (
                                        atrakcja.nazwa.toLowerCase().includes(attractionsSearching.toLowerCase()) ||
                                        atrakcja.adres.toLowerCase().includes(attractionsSearching.toLowerCase()))
                                )
                                .toSorted((a, b) => (b.liczbaOpinie * b.ocena || 0) - (a.liczbaOpinie * a.ocena || 0))
                                .map((atrakcja, idx) => (
                                    <AttractionResultMediumVerifiedComponent
                                        key={`${atrakcja.googleId}${idx}${atrakcja?.wallpaper}`}
                                        atrakcja={atrakcja}
                                        wybranyDzien={wybranyDzien}
                                        addActivity={addActivity}
                                        typ={1}
                                        latMD={miejsceDocelowe.location.lat}
                                        lngMD={miejsceDocelowe.location.lng}
                                    />
                                ))}
                            {atrakcje.length === 0 && <><Loader />Wczytywanie atrakcji...</> ||
                                <div className="googleLogoDiv">
                                    <img src="googlelogo.svg" />
                                </div>}
                            {atrakcje
                                .filter(atrakcja =>
                                    atrakcja.dataSource === "Bot" && (
                                        atrakcja.nazwa.toLowerCase().includes(attractionsSearching.toLowerCase()) ||
                                        atrakcja.adres.toLowerCase().includes(attractionsSearching.toLowerCase()))
                                )
                                .toSorted((a, b) => (b.liczbaOpinie * b.ocena || 0) - (a.liczbaOpinie * a.ocena || 0))
                                .map((atrakcja, idx) => (
                                    <AttractionResultMediumVerifiedComponent
                                        key={`${atrakcja.googleId}${idx}${atrakcja?.wallpaper}`}
                                        atrakcja={atrakcja}
                                        wybranyDzien={wybranyDzien}
                                        addActivity={addActivity}
                                        typ={3}
                                        latMD={miejsceDocelowe.location.lat}
                                        lngMD={miejsceDocelowe.location.lng}
                                    />
                                ))}
                        </div>
                        <div className={radioChosen === 1 ? "listBox" : "listBox listBox--hidden"}>
                            {basicActivities
                                .filter(atrakcja => {
                                    const search = attractionsSearching.toLowerCase();
                                    const name = (atrakcja.nazwa || "").toLowerCase();
                                    const address = (atrakcja.adres || "").toLowerCase();
                                    return name.includes(search) || address.includes(search);
                                })
                                .toSorted((a, b) =>
                                    (a.nazwa || "").localeCompare(b.nazwa || "", "pl", { sensitivity: "base" })
                                )
                                .map((atrakcja, idx) => (
                                    <AttractionResultMediumComponent
                                        key={`${atrakcja.googleId}${idx}`}
                                        atrakcja={atrakcja}
                                        wybranyDzien={wybranyDzien}
                                        addActivity={addActivity}
                                        baseVersion={true}
                                    />
                                ))}
                        </div>
                        <div className={radioChosen === 2 ? "listBox" : "listBox listBox--hidden"}>
                            {Array.isArray(events) && events
                                .map((atrakcja, idx) => (
                                    <AttractionResultMediumVerifiedComponent
                                        key={`${atrakcja.googleId}${idx}${atrakcja?.wallpaper}`}
                                        atrakcja={atrakcja}
                                        wybranyDzien={wybranyDzien}
                                        addActivity={addActivity}
                                        typ={1}
                                        latMD={miejsceDocelowe.location.lat}
                                        lngMD={miejsceDocelowe.location.lng}
                                    />
                                ))}
                        </div>
                        <div className="bottomGradient"></div>
                    </KonfiguratorMainMainboxLeft>

                    <KonfiguratorMainMainboxRight ref={centerRef}>

                        <KonfiguratorWyjazduComp redirecting={redirecting} setRedirecting={setRedirecting} handleSaveClick={handleSaveClick} hasPendingAutoSave={hasPendingAutoSave} dataPrzyjazdu={dataPrzyjazdu} dataWyjazdu={dataWyjazdu} standardHotelu={standardHotelu} standardTransportu={standardTransportu} liczbaOpiekunow={liczbaOpiekunow} liczbaUczestnikow={liczbaUczestnikow} tripId={tripId} miejsceStartowe={miejsceStartowe} computedPrice={tripPrice + insurancePrice} computingPrice={computingPrice} miejsceDocelowe={miejsceDocelowe} changeActivity={changeActivity} checkOut={timeToMinutes(wybranyHotel?.checkOut) || 720} changeStartHour={changeStartHour} deleteActivity={deleteActivity} startModifyingAct={startModifyingAct} setActivityPanelOpened={setActivityPanelOpened} onAttractionTimeChange={changeActivityTime} swapActivities={swapActivities} onTransportChange={changeChosenTransport} timeSchedule={timeSchedule} routeSchedule={routeSchedule} chosenTransportSchedule={chosenTransportSchedule} loading={konfiguratorLoading} activitiesSchedule={activitiesSchedule} liczbaDni={liczbaDni} key={`schedule-${liczbaDni}-${konfiguratorLoading}-${activitiesSchedule}`} wybranyDzien={wybranyDzien} setWybranyDzien={setWybranyDzien} addActivity={addActivity} />
                        {activityPanelOpened && 1 == 2 &&
                            <AddAttractionWrapper>
                                <AddActivityPanelContainer>
                                    <AddActivityPanel atrakcje={atrakcje} key={`${modyfikacja}${atrakcje}`} setModAct={setModyfikacja} dayIndex={wybranyDzien} closePanel={() => setActivityPanelOpened(false)} miejsceDocelowe={miejsceDocelowe.nazwa} modActIdx={modyfikacja.flag ? modyfikacja.idx : null} addActivity={modyfikacja.flag ? changeActivity : addActivity} />
                                </AddActivityPanelContainer>
                            </AddAttractionWrapper>
                        }
                        {//<AttractionsMap attractions={atrakcje}/>
                        }
                        {activityPanelOpened &&
                            <AddActivityNew
                                miejsceDocelowe={miejsceDocelowe}
                                atrakcje={atrakcje}
                                setActivityPanelOpened={setActivityPanelOpened}
                                wybranyDzien={wybranyDzien}
                                addActivity={addActivity}
                                events={events}>
                            </AddActivityNew>}

                    </KonfiguratorMainMainboxRight>

                    <KonfiguratorMainMainboxLeft ref={rightRef} className="right">
                        <section style={{ margin: '0 auto', display: 'flex', justifyContent: 'center' }} id="chatbox">
                            <ChatBox2 activitiesSchedule={activitiesSchedule} basicActivities={basicActivities} miejsceDocelowe={miejsceDocelowe} attractions={atrakcje} addActivity={addActivity} swapActivities={swapActivities} changeActivity={changeActivity} deleteActivity={deleteActivity} />


                        </section><div className="mainboxLeftTitle">
                            Podsumowanie wyjazdu
                        </div>
                        <SummaryInfoBox>
                            <div className="summaryInfoBoxTitle">
                                <img src="../icons/hotel-white.svg" width="20px" />
                                {standardHotelu != 0 && standardHotelu != 3 ? "Hotel" : "Nocleg"}
                            </div>
                            {standardHotelu != 3 &&
                                <>
                                    <div className="summaryInfoBoxTitle b" >
                                        <img src="../icons/hotelName-white.svg" width="20px" />
                                        Nazwa: {wybranyHotel.nazwa}
                                    </div>
                                    <div className="summaryInfoBoxTitle b" >
                                        <img src="../icons/time-white.svg" width="20px" />
                                        Doba hotelowa: {wybranyHotel.checkIn} - {wybranyHotel.checkOut}
                                    </div>
                                </>
                            }
                        </SummaryInfoBox>

                        <SummaryInfoBox className="b">
                            <div className="summaryInfoBoxTitle">
                                <img src="../icons/hotel-white.svg" width="20px" />
                                Przejazd do {miejsceDocelowe?.nazwa}
                            </div>
                            {
                                standardTransportu == 0 ?
                                    routeToPrint && routeToPrint.length > 0 ?
                                        <>
                                            {
                                                routeToPrint.map((rt, rtIdx) => (
                                                    <div className="routeSummaryRow" key={`${rt.line}_${rtIdx}`}>
                                                        <img src="../icons/train-white.svg" height={'20px'} />
                                                        <div className="routeSummaryRowContent">{rt.line}, {minutesToStringTime(rt.time)}<a>{rt.depart} - {rt.arrival}</a></div>
                                                    </div>
                                                ))
                                            }
                                            <div className="summaryInfoBoxMoreButton" onClick={() => addRouteAlert(0)}>
                                                Pokaż całą trasę
                                            </div>
                                        </>
                                        :
                                        "To nie będzie ciężki przejazd"
                                    :
                                    standardTransportu == 1 ?
                                        <>
                                            <img src="../icons/bus-white.svg" height="30px" />
                                        </>
                                        :
                                        <>
                                            <img src="../icons/ownTransport-white.svg" height="30px" />
                                            Własny transport
                                        </>
                            }
                        </SummaryInfoBox>

                        <SummaryInfoBox className="b">
                            <div className="summaryInfoBoxTitle">
                                <img src="../icons/hotel-white.svg" width="20px" />
                                Powrót do {miejsceStartowe?.nazwa}
                            </div>
                            {
                                standardTransportu == 0 ?
                                    routeFromPrint && routeFromPrint.length > 0 ?
                                        <>
                                            {
                                                routeFromPrint.map((rt, rtIdx) => (
                                                    <div className="routeSummaryRow" key={`${rt.line}_${rtIdx}`}>
                                                        <img src="../icons/train-white.svg" height={'20px'} />
                                                        <div className="routeSummaryRowContent">{rt.line}, {minutesToStringTime(rt.time)}<a>{rt.depart} - {rt.arrival}</a></div>
                                                    </div>
                                                ))
                                            }
                                            <div className="summaryInfoBoxMoreButton" onClick={() => addRouteAlert(routeSchedule.length - 1)}>
                                                Pokaż całą trasę
                                            </div>
                                        </>
                                        :
                                        "To nie będzie ciężki przejazd"
                                    :
                                    standardTransportu == 1 ?
                                        <>
                                            <img src="../icons/bus-white.svg" height="30px" />
                                        </>
                                        :
                                        <>
                                            <img src="../icons/ownTransport-white.svg" height="30px" />
                                            Własny transport
                                        </>
                            }
                        </SummaryInfoBox>

                        <CostSummary tripPrice={tripPrice} insurancePrice={insurancePrice} liczbaOpiekunow={liczbaOpiekunow} liczbaUczestnikow={liczbaUczestnikow} />
                        <div className="mainboxLeftTitle" style={{ paddingTop: '10px', marginTop: '20px', borderTop: '1px solid #ccc' }}>
                            Podsumowanie dnia
                        </div>
                        <div style={{ pointerEvents: "none", height: '270px', width: '90%', borderRadius: '15px', overflow: 'hidden', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <RouteMap
                                schedule={activitiesSchedule[wybranyDzien]}
                                key={JSON.stringify(activitiesSchedule[wybranyDzien])}
                            />
                        </div>
                    </KonfiguratorMainMainboxLeft>
                </KonfiguratorMainMainbox>
                {popupPickerOpened !== -1 &&
                    <PopupManager
                        dataPrzyjazdu={dataPrzyjazdu} setDataPrzyjazdu={setDataPrzyjazdu} dataWyjazdu={dataWyjazdu} setDataWyjazdu={setDataWyjazdu}
                        standardTransportu={standardTransportu} setStandardTransportu={setStandardTransportu} standardHotelu={standardHotelu} setStandardHotelu={setStandardHotelu} field={popupPickerOpened} setPopupPickerOpened={setPopupPickerOpened} miejsceDocelowe={miejsceStartowe} setMiejsceDocelowe={setMiejsceStartowe} setLiczbaOpiekunow={setLiczbaOpiekunow} liczbaOpiekunow={liczbaOpiekunow} liczbaUczestnikow={liczbaUczestnikow} setLiczbaUczestnikow={setLiczbaUczestnikow}>
                    </PopupManager>}
                {alertsTable && alertsTable.length ?
                    <AlertsBox key={alertsTable} alertsTable={alertsTable} deleteAlert={deleteAlert} />
                    :
                    null
                }
            </>
    )
}
