import { useEffect, useState, useCallback, use, useRef } from "react";
import axios from "axios";
import debounce from "lodash.debounce";
import styled from "styled-components";
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
import { KonfiguratorWyjazduComp, roznicaDni } from "./konfigurator/konfiguratorWyjazduComp";
import { AddActivityNavButton, AddActivityPanel, AddActivityPanelNav, PanelBoxNav } from "./konfigurator/addActivityPanel";
import RouteMap from "./routeMap";
import { parseJSON } from "date-fns";
import AttractionResultMediumComponent from "./attractionResultMediumComp";
import { Checkbox2 } from "./checkbox1";
import { AlertsBox } from "./konfigurator/alertsBox";
import { ChatBox } from "./konfigurator/chatBox";
import { ChatBox2 } from "./konfigurator/chatBox2";
import { CostSummary } from "./konfigurator/costSummary";
import { time } from "framer-motion";

// === user store (global auth) ===
import useUserStore, { fetchMe } from "./usercontent";

const testResults = [
    { nazwa: "Poznań", region: "Wielkopolska", kraj: "Polska" },
    { nazwa: "Luboń koło Poznania", region: "Wielkopolska", kraj: "Polska" },
    { nazwa: "Poznań", region: "Lubelskie", kraj: "Polska" },
    { nazwa: "Druzyna Poznańska", wojewodztwo: "Wielkopolska", kraj: "Polska" }
]
const basicActivities = [
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
    min-height: 1000px;
    display: flex;
    flex-direction: row;
    aling-items: stretch;
    justify-content: flex-start;
    position: relative;
    margin-top: 20px;
    @media screen and (max-width: 1000px){
        flex-direction: column;
    }
`
const KonfiguratorMainMainboxLeft = styled.div`
    width: 300px;
    border-right: 1px solid lightgray;
    &.right{
        border-right: none;
        border-left: 1px solid lightgray;
    }
    .listBox {
        width: 100%;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 5px;
        align-items: center;
        justify-content: flex-start;
    }
    .listBox--hidden {
        display: none;
    }
    .googleLogoDiv{
        margin-top: 5px;
        width: 90%;
        display: flex;
        align-items: center;
    }
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    overflow-y: auto;
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
                    &:hover{
                        background-color: red;
                    }
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
`;
const AttractionResultMedium = styled.div`
    width: 90%;
    max-width: 300px;
    min-height: 200px;
    background-color: #fbfbfb;
    border-radius: 15px;
    border: 1px solid lightgray;
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
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
                    border-radius: 999px; 
                    border: 1px solid #008d73ff;
                    background-color: #cfffe4ff;
                    color: black;
                    font-weight: 400;
                }
            }
        }
    }
    .attractionResultMediumAddBox{
        height: 30px;
        width: 90%;
        background-color: #008d73ff;
        margin: 10px auto;
        box-sizing: border-box;
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
        &:hover{
            background-color: #007a61ff;
        }
    }
`
const KonfiguratorMainMainboxRight = styled.div`
    flex: 1;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
`
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
    width: 200px;
    height: 50px;
    position: relative;
    cursor: pointer;
    border-bottom: 3px solid lightgray;
    transition: 0.3s ease-in-out;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: left;
    font-size: 12px;
    padding: 2px 5px;
    font-weight: 300;
    gap: 2px;
    &.chosen{
        border-bottom: 3px solid #008d73ff;
    }
    &:hover{
        border-bottom: 3px solid #008d73ff;
    }
    @media screen and (max-width: 1100px){
        border-bottom: none;
        border-left: 2px solid lightgray;
        &:hover{
            border-bottom: none;
            border-left: 2px solid #008d73ff;
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
    background-color: #f6f6f6;
    border-bottom: 1px solid lightgray;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 8px;
    flex-wrap: wrap;
    transition: 0.3s ease-in-out;
    .iconEditBox{
        width: 45px;
        height: 45px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    @media screen and (max-width: 1200px){
        flex-direction: column;
        justify-content: flex-start;
        min-height: 0;
        &.opened{
            height: 400px;
        }
        &.closed{
            height: 45px;
            overflow: hidden;
        }
        .iconEditBox{
            width: 100%;
            transition: 0.3s ease-in-out;
            &:hover{
                background-color: #e0e0e0;
                cursor: pointer;
            }
        }
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

export const KonfiguratorMain = ({ activitiesScheduleInit, chosenTransportScheduleInit, dataPrzyjazduInit, dataWyjazduInit, standardHoteluInit, standardTransportuInit, miejsceDoceloweInit, miejsceStartoweInit, liczbaUczestnikowInit, liczbaOpiekunówInit, pokojeOpiekunowieInit }) => {

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

    const [liczbaOpiekunów, setLiczbaOpiekunów] = useState(() => {
        const fromURL = getInt(readURL().searchParams.get("guardians"));
        if (fromURL != null) return fromURL;
        try {
            const raw = localStorage.getItem("liczbaOpiekunów");
            if (raw != null) {
                const n = Number(raw);
                if (Number.isFinite(n)) return n;
            }
        } catch { }
        return (liczbaOpiekunówInit ?? 0);
    });

    const [tripId, setTripId] = useState(() => {
        const fromURL = getStr(readURL().searchParams.get("tripId"));
        if (fromURL != null) return fromURL;
        return "";
    });

    // ===== EFEKTY: zapis do URL + regularny zapis do localStorage =====
    // tripId -> URL
    useEffect(() => {
        writeStringParam("tripId", tripId);
        console.log("Ustawiam tripId w LS:", tripId);
    }, [tripId]);

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
        writeNumberParam("guardians", liczbaOpiekunów);
        localStorage.setItem("liczbaOpiekunów", String(liczbaOpiekunów));
    }, [liczbaOpiekunów]);

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
        console.log("TEST1", miejsceDocelowe, miejsceStartowe)
        miejsceDocelowe && localStorage.setItem("miejsceDocelowe", JSON.stringify(miejsceDocelowe))
    }, [miejsceDocelowe])

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

    const libraryFilters = ["Muzeum",]
    const [filtersChosen, setFiltersChosen] = useState()
    const [alertsTable, setAlertsTable] = useState([])

    useEffect(() => {
        if (!miejsceStartoweSearching) return;
        setMiejsceStartoweResults([]);
        const timeoutId = setTimeout(async () => {
            try {
                const response = await fetch(
                    `http://localhost:5006/searchCity?query=${encodeURIComponent(
                        miejsceStartoweSearching
                    )}`
                );
                const data = await response.json();

                if (data?.length > 0) {
                    const resultsWithPlaceId = await Promise.all(
                        data.map(async (item) => {
                            try {
                                const placeIdRes = await fetch(
                                    `http://localhost:5006/getPlaceId?miasto=${encodeURIComponent(item.nazwa)}&wojewodztwo=${encodeURIComponent(item.wojewodztwo || "")}&kraj=${encodeURIComponent(item.kraj)}`
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

                const url = `http://localhost:5006/routeSummary?fromLat=${fromLat}&fromLng=${fromLng}&toLat=${toLat}&toLng=${toLng}`;
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
                const res = await axios.get("http://localhost:5006/getAttractions", {
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

    useEffect(() => {
        const lat = Number(miejsceDocelowe?.location?.lat);
        const lng = Number(miejsceDocelowe?.location?.lng);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

        const controller = new AbortController();
        const cached = localStorage.getItem("lsAtrakcje");

        if (cached) {
            setAtrakcje(JSON.parse(cached));
        }
        (async () => {
            try {
                const url = `http://localhost:5006/attractions/nearby?lat=${encodeURIComponent(
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
                console.log("✅ /attractions/nearby result:", JSON.parse(cached), data);
                setAtrakcje(data);
            } catch (err) {
                if (err.name !== "AbortError") {
                    console.error("❌ /attractions/nearby error:", err);
                }
            }
        })();

        return () => controller.abort();
    }, [miejsceDocelowe?.location?.lat, miejsceDocelowe?.location?.lng]);

    const [wybranyHotel, setWybranyHotel] = useState({ stars: 3, nazwa: "Ibis Budget", adres: "Koszalińska 45", checkIn: '14:00', checkOut: '11:00', cena: 100 })

    const [routeSchedule, setRouteSchedule] = useState([])
    const [timeSchedule, setTimeSchedule] = useState([])
    const [activitiesSchedule, setActivitiesSchedule] = useState([[]]);

    const [tripPrice, setTripPrice] = useState(0);
    const [insurancePrice, setInsurancePrice] = useState(0);
    const [computingPrice, setComputingPrice] = useState(false)
    const userIdFromStore = useUserStore(s => s.user?._id);

    useEffect(() => {
        let aborted = false;

        const getFallbackActivities = () => {
            if (activitiesScheduleInit != null) return activitiesScheduleInit;
            return [[]]
            const tripKey = makeTripKey("activitiesSchedule", miejsceDocelowe, dataPrzyjazdu, dataWyjazdu);
            try {
                const raw = localStorage.getItem(tripKey);
                if (raw) return JSON.parse(raw);
            } catch { return [[]] }
            return [[]];
        };

        const fallback = () => {
            if (!aborted) {
                console.log("Używam fallbacku dla activitiesSchedule");
                setActivitiesSchedule(getFallbackActivities());
            }
        };

        (async () => {
            if (!tripId || String(tripId).trim() === "") {
                return fallback();
            }

            console.log("Próbuję pobrać plan wyjazdu z API dla tripId:", tripId);

            let userId =
                userIdFromStore ??
                useUserStore.getState?.().user?._id ??
                null;

            if (!userId) {
                try {
                    const me = await fetchMe().catch(() => null);
                    userId = me?._id ?? useUserStore.getState?.().user?._id ?? null;
                } catch { }
            }

            console.log("Używam userId:", userId);

            if (!userId) {
                return fallback();
            }

            try {
                const url = `http://localhost:5007/api/trip-plans/${encodeURIComponent(tripId)}/by-author/${encodeURIComponent(userId)}`;
                const resp = await fetch(url, { credentials: "include" });

                if (!aborted && resp.ok) {
                    const data = await resp.json();
                    if (Array.isArray(data?.activitiesSchedule)) {
                        setActivitiesSchedule(data.activitiesSchedule);
                        console.log("Pobrano plan wyjazdu z API dla tripId:", data.activitiesSchedule);
                        return;
                    }
                }
                return fallback();
            } catch {
                return fallback();
            }
        })();

        return () => {
            aborted = true;
        };
    }, []);

    const saveTimerRef = useRef(null);
    const saveControllerRef = useRef(null);

    const canSave = () =>
        !!tripId &&
        String(tripId).trim().length > 0 &&
        Array.isArray(activitiesSchedule);

    const saveTripPlan = useCallback(async (opts = {}) => {
        if (!canSave()) return;
        const { signal } = opts;

        try {
            let userId = useUserStore.getState?.().user?._id ?? null;
            if (!userId) {
                try {
                    const me = await fetchMe().catch(() => null);
                    userId = me?._id ?? useUserStore.getState?.().user?._id ?? null;
                } catch { /* cicho */ }
            }
            if (!userId) return;

            const url = `http://localhost:5007/api/trip-plans/${encodeURIComponent(
                tripId
            )}/by-author/${encodeURIComponent(userId)}`;

            const payload = {
                activitiesSchedule,
                computedPrice: (tripPrice ?? 0) + (insurancePrice ?? 0),
            };

            const resp = await fetch(url, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
                signal,
            });

            if (!resp.ok) {
                console.warn("PUT trip plan failed:", resp.status, await resp.text());
                return;
            }
        } catch (err) {
            if (err?.name !== "AbortError") {
                console.error("PUT trip plan error:", err);
            }
        }
    }, [
        tripId,
        activitiesSchedule,
        tripPrice,
        insurancePrice,
    ]);

    const queueTripPlanSave = useCallback(() => {
        if (!canSave()) return;

        if (saveTimerRef.current) {
            clearTimeout(saveTimerRef.current);
            saveTimerRef.current = null;
        }
        if (saveControllerRef.current) {
            try { saveControllerRef.current.abort(); } catch { }
            saveControllerRef.current = null;
        }

        saveControllerRef.current = new AbortController();

        saveTimerRef.current = setTimeout(() => {
            const ctrl = saveControllerRef.current;
            saveTimerRef.current = null;
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
        };
    }, [JSON.stringify(activitiesSchedule), tripPrice, insurancePrice]);

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

    const [startHours, setStartHours] = useState(() => {
        try {
            const raw = localStorage.getItem("startHours");
            const parsed = raw ? JSON.parse(raw) : null;
            if (Array.isArray(parsed) && parsed.every(v => Number.isFinite(v))) {
                return parsed;
            }
        } catch { }
        return Array.from({ length: (Array.isArray(activitiesSchedule) ? activitiesSchedule.length : 0) }, () => 480);
    });

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

    const [liczbaDni, setLiczbaDni] = useState(0)
    const [wybranyDzien, setWybranyDzien] = useState(0)
    const [konfiguratorLoading, setKonfiguratorLoading] = useState(false);
    const [lastDaySwap, setLastDaySwap] = useState(-1)
    const tmpWybranaOpcja = 2;

    const validateSchedule = () => {
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
    useEffect(() => {
        const timer = setTimeout(() => {
            addAlert("guidance", "");
        }, 5);
        return () => clearTimeout(timer);
    }, []);
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
                if (next?.googleId?.includes("dAct_")) {
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
                        `http://localhost:5006/routeSummary?fromLat=${current.lokalizacja.lat}&fromLng=${current.lokalizacja.lng}&toLat=${next.lokalizacja.lat}&toLng=${next.lokalizacja.lng}`
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
                        lat: wybranyHotel?.lat || wybranyHotel?.location?.lat || 52.2297,
                        lng: wybranyHotel?.lng || wybranyHotel?.location?.lng || 21.0122,
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

    async function updateOffer({ googleId, link, delayMs = 1000 }) {
        if (!googleId || !link) return;
        if (delayMs > 0) {
            await new Promise((resolve) => setTimeout(resolve, delayMs));
        }

        try {
            console.log(`🔄 Aktualizuję ofertę dla ${googleId} z linku ${link}...`);

            const response = await axios.get("http://localhost:5006/update-offer", {
                params: { googleId, link },
                timeout: 120000,
            });

            console.log("✅ Oferta zaktualizowana:", response.data);
            return response.data;
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

        if (!activity?.warianty?.length && activity?.stronaInternetowa) {
            console.log("Aktualizuje oferte dla ", activity.nazwa);

            updateOffer({
                googleId: activity.googleId,
                link: activity.stronaInternetowa,
                delayMs: 0,
            }).catch((err) => {
                console.error("❌ updateOffer error:", err?.message || err);
            });

            setChangeActivities(prev =>
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
            act1 === activitiesSchedule[wybranyDzien].length - 1 ||
            act2 === activitiesSchedule[wybranyDzien].length - 1
        ) {
            return;
        }

        const tmpActivities = activitiesSchedule.map(day => [...day]);
        const day = tmpActivities[dayIndex];
        [day[act1], day[act2]] = [day[act2], day[act1]];

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
            typeof liczbaOpiekunów === "number" &&
            routeSchedule &&
            wybranyHotel;

        if (!hasAll) return;
        setComputingPrice(true)
        const controller = new AbortController();

        const timer = setTimeout(async () => {
            try {
                const { data } = await axios.post(
                    "http://localhost:5006/computePrice",
                    {
                        activitiesSchedule,
                        liczbaUczestnikow,
                        liczbaOpiekunow: liczbaOpiekunów,
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
        liczbaOpiekunów,
        routeSchedule,
        wybranyHotel,
    ]);

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

        const key = `Hotel-${nazwa}-${dataPrzyjazdu}-${dataWyjazdu}-${standardHotelu}-${liczbaUczestnikow}-${liczbaOpiekunów}-${pokojeOpiekunowie}`;

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
                const response = await axios.get("http://localhost:5006/findHotel", {
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
                        opiekunowie: liczbaOpiekunów,
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
                console.log(`💾 Zapisano hotel w localStorage jako "${key}"`);

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
        liczbaOpiekunów,
        pokojeOpiekunowie
    ]);

    const setOffOthers = (s) => {
        if (s != 0) {
            setMiejsceStartowePopupOpened(false)
        }
        if (s != 1) {
            setWyborDatyOpened(false)
        }
        if (s !== 2) {
            setWyborGosciOpened(false)
        }
        if (s != 3) {
            setWyborStandardHoteluOpened(false)
        }
        if (s != 4) {
            setWyborStandardTransportuOpened(false)
        }
    }

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
    useEffect(() => {
        console.log(miejsceDocelowe)
    }, [miejsceDocelowe])
    return (
        <>
            <TopKreatorSlider />

            <KonfiguratorMainSettings ref={settingsRef} className={settingsOpened ? "opened" : "closed"}>
                <div className="iconEditBox" onClick={() => setSettingsOpened(!settingsOpened)}>
                    <img src="../icons/filter.svg" height={'60%'} />
                </div>
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
                    {liczbaUczestnikow} uczestników, {liczbaOpiekunów} opiekunów
                    {wyborGosciOpened && <div className="settingsPopup" onClick={(e) => e.stopPropagation()} >
                        Liczba uczestników
                        <WyborUczestnikow uczestnicy={liczbaUczestnikow} setUczestnicy={setLiczbaUczestnikow} opiekunowie={liczbaOpiekunów} setOpiekunowie={setLiczbaOpiekunów} />
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
            </KonfiguratorMainSettings>

            <KonfiguratorMainMainbox>
                <KonfiguratorMainMainboxLeft className="a">
                    <div className="mainboxLeftTitle">
                        Biblioteka atrakcji
                    </div>
                    <PanelBoxNav className="a">
                        {[
                            { id: 0, icon: "../icons/castle.svg", label: "Podstawowe" },
                            { id: 1, icon: "../icons/park.svg", label: "Parki" },
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
                                <img src={option.icon} width="25px" alt={option.label} />
                            </label>
                        ))}
                    </PanelBoxNav>
                    <div className="mainboxLeftInput">
                        <img src="../icons/search-gray.svg" width={'20px'} />
                        <input type="text" placeholder="Wyszukaj aktywność..." value={attractionsSearching} onChange={(e) => setAttractionsSearching(e.target.value)} />
                    </div>

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
                        <div className="googleLogoDiv">
                            <img src="googlelogo.svg" />
                        </div>
                        {atrakcje
                            .filter(atrakcja =>
                                atrakcja.nazwa.toLowerCase().includes(attractionsSearching.toLowerCase()) ||
                                atrakcja.adres.toLowerCase().includes(attractionsSearching.toLowerCase())
                            )
                            .toSorted((a, b) => (b.liczbaOpinie * b.ocena || 0) - (a.liczbaOpinie * a.ocena || 0))
                            .map((atrakcja, idx) => (
                                <AttractionResultMediumComponent
                                    key={`${atrakcja.googleId}${idx}`}
                                    atrakcja={atrakcja}
                                    wybranyDzien={wybranyDzien}
                                    addActivity={addActivity}
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
                </KonfiguratorMainMainboxLeft>

                <KonfiguratorMainMainboxRight>
                    <KonfiguratorWyjazduComp computedPrice={tripPrice + insurancePrice} computingPrice={computingPrice} miejsceDocelowe={miejsceDocelowe} changeActivity={changeActivity} checkOut={timeToMinutes(wybranyHotel?.checkOut) || 720} changeStartHour={changeStartHour} deleteActivity={deleteActivity} startModifyingAct={startModifyingAct} setActivityPanelOpened={setActivityPanelOpened} onAttractionTimeChange={changeActivityTime} swapActivities={swapActivities} onTransportChange={changeChosenTransport} timeSchedule={timeSchedule} routeSchedule={routeSchedule} chosenTransportSchedule={chosenTransportSchedule} loading={konfiguratorLoading} activitiesSchedule={activitiesSchedule} liczbaDni={liczbaDni} key={`schedule-${liczbaDni}-${konfiguratorLoading}-${timeSchedule}`} wybranyDzien={wybranyDzien} setWybranyDzien={setWybranyDzien} addActivity={addActivity} />
                    {activityPanelOpened &&
                        <AddAttractionWrapper>
                            <AddActivityPanelContainer>
                                <AddActivityPanel key={`${modyfikacja}`} setModAct={setModyfikacja} dayIndex={wybranyDzien} closePanel={() => setActivityPanelOpened(false)} miejsceDocelowe={miejsceDocelowe.nazwa} modActIdx={modyfikacja.flag ? modyfikacja.idx : null} addActivity={modyfikacja.flag ? changeActivity : addActivity} />
                            </AddActivityPanelContainer>
                        </AddAttractionWrapper>
                    }
                </KonfiguratorMainMainboxRight>

                <KonfiguratorMainMainboxLeft className="right">
                    <ChatBox2 activitiesSchedule={activitiesSchedule} basicActivities={basicActivities} miejsceDocelowe={miejsceDocelowe} attractions={atrakcje} addActivity={addActivity} swapActivities={swapActivities} changeActivity={changeActivity} deleteActivity={deleteActivity} />
                    <div className="mainboxLeftTitle">
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

                    <CostSummary tripPrice={tripPrice} insurancePrice={insurancePrice} liczbaOpiekunow={liczbaOpiekunów} liczbaUczestnikow={liczbaUczestnikow} />
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

            {alertsTable && alertsTable.length ?
                <AlertsBox key={alertsTable} alertsTable={alertsTable} deleteAlert={deleteAlert} />
                :
                null
            }
        </>
    )
}
