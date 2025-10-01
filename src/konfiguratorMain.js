import { useEffect, useState, useCallback, use } from "react"
import axios from "axios";
import debounce from "lodash.debounce";
import styled from "styled-components"
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
import { AddActivityPanel } from "./konfigurator/addActivityPanel";

const testResults = [
    { nazwa: "Poznań", region: "Wielkopolska", kraj: "Polska" },
    { nazwa: "Luboń koło Poznania", region: "Wielkopolska", kraj: "Polska" },
    { nazwa: "Poznań", region: "Lubelskie", kraj: "Polska" },
    { nazwa: "Druzyna Poznańska", wojewodztwo: "Wielkopolska", kraj: "Polska" }


]


const KonfiguratorMainMainbox = styled.div`

    width: 100%;
    min-height: 1000px;
    display: flex;
    flex-direction: row;
    aling-items: stretch;
    justify-content: flex-start;
    position: relative;
    margin-top: 20px;
`
const KonfiguratorMainMainboxLeft = styled.div`

    width: 300px;
    border-right: 1px solid lightgray;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    overflow-y: auto;
    @media screen and (max-width: 800px){
        display: none;
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
    padding-right: 300px;
    @media screen and (max-width: 1000px){
        padding-right: 0;
    }
`

export const KonfiguratorRadioButton = styled.div`
    width: 45px;
    height: 45px;
    border-bottom: 1px solid #b0b0b0;
    transition: 0.3s ease-in-out;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    &.chosen{
    border-bottom: 3px solid orange;
    }
    &.chosenA{
        border-bottom: 3px solid #f42f25;
        &:hover{
            border-bottom: 3px solid #e31e14;
        }
    }
    &.chosenB{
        border-bottom: 3px solid #255ff4;
        &:hover{
            border-bottom: 3px solid #144ee3;
        }
    }
    &.chosenC{
        border-bottom: 3px solid #f49725;
        &:hover{
            border-bottom: 3px solid #e38614;
        }
    }
    &.chosenD{
        border-bottom: 3px solid #f42582;
        &:hover{
            border-bottom: 3px solid #e31471;
        }
    }
    &:hover{
       border-bottom: 3px solid orange;
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
    font-size: 12px;
    padding: 2px 5px;
    font-weight: 300;
    gap: 2px;
    &:hover, &.chosen{
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
        left: 50%;               /* ustawiamy na połowę szerokości SettingsButton */
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
  overflow-y: auto;     /* umożliwia scrollowanie wewnątrz panelu */
  padding-top: 20px;
  
`;

//inputpairb
//inputpairb
//inputpairb
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
    // Oczekiwany format: "HH:MM"
    const [hours, minutes] = timeString.split(":").map(Number);
    return hours * 60 + minutes;
}



export const KonfiguratorMain = ({ dataPrzyjazduInit, dataWyjazduInit, standardHoteluInit, standardTransportuInit, miejsceDoceloweInit, miejsceStartoweInit }) => {

    //dane poczatkowe
    const [dataPrzyjazdu, setDataPrzyjazdu] = useState(dataPrzyjazduInit)
    const [dataWyjazdu, setDataWyjazdu] = useState(dataWyjazduInit)
    const [standardHotelu, setStandardHotelu] = useState(standardHoteluInit)
    const [standardTransportu, setStandardTransportu] = useState(standardTransportuInit)
    const [miejsceDocelowe, setMiejsceDocelowe] = useState(() => {
        const saved = localStorage.getItem("miejsceDocelowe");
        return saved ? JSON.parse(saved) : miejsceDoceloweInit; // zwracamy obiekt albo null
    });

    const [miejsceStartowe, setMiejsceStartowe] = useState(miejsceStartoweInit || miejsceDocelowe)

    const [liczbaUczestnikow, setLiczbaUczestnikow] = useState(0)
    const [liczbaOpiekunów, setLiczbaOpiekunów] = useState(0)
    //dane lokalne
    const [settingsOpened, setSettingsOpened] = useState(false);
    const [leftOpened, setLeftOpened] = useState(false)
    const [radioChosen, setRadioChosen] = useState(0)

    const [attractionsSearching, setAttractionsSearching] = useState("");

    const [miejsceDoceloweSearching, setMiejsceDoceloweSearching] = useState("");
    const [miejsceDoceloweResults, setMiejsceDoceloweResults] = useState(testResults)
    const [miejsceDoceloweHovering, setMiejsceDoceloweHovering] = useState(false);
    const [miejsceDocelowePopupOpened, setMiejsceDocelowePopupOpened] = useState(false)

    const [wyborDatyOpened, setWyborDatyOpened] = useState(false)

    const [wyborGosciOpened, setWyborGosciOpened] = useState(false)

    const [wyborStandardHoteluOpened, setWyborStandardHoteluOpened] = useState(false);

    const [wyborStandardTransportuOpened, setWyborStandardTransportuOpened] = useState(false);
    const [activityPanelOpened, setActivityPanelOpened] = useState(false);
    const [modyfikacja, setModyfikacja] = useState({ flag: false, dayIdx: null, idx: null })

    useEffect(() => {
        if (!miejsceDoceloweSearching) return;

        // 1. od razu czyścimy poprzednie wyniki
        setMiejsceDoceloweResults([]);

        // 2. ustawiamy timer
        const timeoutId = setTimeout(async () => {
            try {
                const response = await fetch(
                    `http://localhost:5006/searchCity?query=${encodeURIComponent(
                        miejsceDoceloweSearching
                    )}`
                );
                const data = await response.json();

                if (data?.length > 0) {
                    // Wywołujemy getPlaceId dla każdego wyniku
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

                    setMiejsceDoceloweResults(resultsWithPlaceId);
                }
                else { setMiejsceDoceloweResults([{ kraj: "brak" }]) }// <-- zapisanie wyników

            } catch (error) {
                console.error("Błąd pobierania danych:", error);
            }
        }, 1000); // 1000ms = 1s

        // 3. czyszczenie timera przy zmianie inputa
        return () => clearTimeout(timeoutId);
    }, [miejsceDoceloweSearching]);

    //dane z serwera

    //atrakcje
    const [atrakcje, setAtrakcje] = useState([])
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
        [] // ważne: debounce nie powinno być tworzony przy każdym renderze
    );
    useEffect(() => {
        if (!miejsceDocelowe?.googleId || !miejsceDocelowe?.location) return;

        // na start ładujemy dane z localStorage
        const cached = localStorage.getItem("lsAtrakcje");

        if (cached) {
            setAtrakcje(JSON.parse(cached));
        }
        // wywołujemy zdebouncowaną funkcję
        fetchAttractions(
            miejsceDocelowe.googleId,
            miejsceDocelowe.location.lat,
            miejsceDocelowe.location.lng
        );
    }, [miejsceDocelowe, fetchAttractions]);


    //szukanie hotelu
    const [wybranyHotel, setWybranyHotel] = useState({ stars: 3, nazwa: "Ibis Budget", adres: "Koszalińska 45", checkIn: '14:00', checkOut: '11:00' })


    //planWyjazdu
    const [preActivitiesSchedule, setPreActivitiesSchedule] = useState([])
    const [activitiesSchedule, setActivitiesSchedule] = useState([])
    const [preRouteSchedule, setPreRouteSchedule] = useState([])
    const [routeSchedule, setRouteSchedule] = useState([])
    const [preTimeSchedule, setPreTimeSchedule] = useState([])
    const [timeSchedule, setTimeSchedule] = useState([])
    const [preChosenTransportSchedule, setPreChosenTransportSchedule] = useState([])
    const [chosenTransportSchedule, setChosenTransportSchedule] = useState([])

    const [liczbaDni, setLiczbaDni] = useState(0)
    const [startHours, setStartHours] = useState(
        Array.from({ length: liczbaDni }, () => 480)
    );
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
                if (activitiesSchedule[i][j]?.idGoogle == "baseBookOut" && timeSchedule[i][j] > timeToMinutes(wybranyHotel.checkOut)) {
                    console.log("TEST6", i, j, activitiesSchedule[i][j])
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
        if (lastDaySwap == 1) {
            changeStartHour(activitiesSchedule.lentgh - 1, 480)
        }
        lastDaySwap > -1 && swapActivities(activitiesSchedule.length - 1, 1, lastDaySwap);

        setLastDaySwap(-1)
    }, [lastDaySwap])

    function generateRouteSchedule(activitiesScheduleLocal) {
        if (!activitiesScheduleLocal) {
            activitiesScheduleLocal = activitiesSchedule;
            //console.log("TEST4", activitiesScheduleLocal)

        }
        ;
        let tabRoutesTmp = Array.from({ length: liczbaDni }, () => []);
        let tabTimeScheduleTmp = Array.from({ length: liczbaDni }, (_, i) => [startHours[i]]);
        activitiesScheduleLocal.map((day, dayIdx) => {
            day.slice(1).map((activity, actIdx) => {
                const czasy = [45, 30, 15];
                if (activitiesSchedule[dayIdx][actIdx]?.lokalizacja?.lat != activity?.lokalizacja?.lat && activitiesSchedule[dayIdx][actIdx]?.lokalizacja?.lng != activity?.lokalizacja?.lng) {

                    tabRoutesTmp[dayIdx].push({ start: day[actIdx], end: day[actIdx + 1], czasy })
                }
                else {
                    tabRoutesTmp[dayIdx].push({ start: day[actIdx], end: day[actIdx + 1], czasy: [0, 0, 0] })
                }


            })
        })

        activitiesScheduleLocal.map((day, dayIdx) => {
            day.slice(1).map((activity, actIdx) => {
                if (chosenTransportSchedule.length == activitiesSchedule.length) {
                    if (activity.idGoogle == "baseBookIn") {
                        const val = maximum(tabTimeScheduleTmp[dayIdx][actIdx] + activitiesSchedule[dayIdx][actIdx].czasZwiedzania + tabRoutesTmp[dayIdx][actIdx]?.czasy[chosenTransportSchedule[dayIdx][actIdx]], timeToMinutes(wybranyHotel.checkIn))
                        tabTimeScheduleTmp[dayIdx].push(val)

                    }
                    else {
                        tabTimeScheduleTmp[dayIdx].push(tabTimeScheduleTmp[dayIdx][actIdx] + activitiesSchedule[dayIdx][actIdx].czasZwiedzania + tabRoutesTmp[dayIdx][actIdx]?.czasy[chosenTransportSchedule[dayIdx][actIdx]])

                    }
                }


            })
        })



        if (1 == 1) {
            //console.log("TEST1", tabRoutesTmp, tabTimeScheduleTmp)
            setRouteSchedule(tabRoutesTmp)
            setTimeSchedule(tabTimeScheduleTmp)
            return true;
        }
        else {
            return false
        }


    }
    function verifyBaseActs(tab) {
        if (!tab.length) return tab;
        for (let i = 0; i < tab.length; i++) {

            if (tab.length && i === 0) {
                let baseRouteToToAdd = true;
                let baseBookInToAdd = tab.length > 1;
                for (let j = 0; j < tab[i].length; j++) {
                    if (tab[i][j]?.idGoogle == "baseRouteTo") baseRouteToToAdd = false;
                    if (tab[i][j]?.idGoogle == "baseBookIn") baseBookInToAdd = false;

                }

                if (baseRouteToToAdd) {


                    if (baseBookInToAdd) {

                        tab[i] = [
                            {
                                idGoogle: "baseRouteTo",
                                nazwa: "Wyjazd do miejsca docelowego",
                                adres: "",
                                czasZwiedzania: 0,
                                lokalizacja: {
                                    lat: 52,
                                    lng: 16
                                }
                            },
                            ...tab[i]
                        ];

                        tab[i] = [
                            {
                                idGoogle: "baseBookIn",
                                nazwa: "Zameldowanie w miejscu noclegu",
                                adres: "",
                                czasZwiedzania: 30,
                                lokalizacja: { lat: 52, lng: 16 }
                            },
                            ...tab[i],


                        ];
                    }
                    else if (tab.length) {

                        tab[i] = [
                            {
                                idGoogle: "baseRouteTo",
                                nazwa: "Wyjazd do miejsca docelowego",
                                adres: "",
                                czasZwiedzania: 0,
                                lokalizacja: {
                                    lat: 52,
                                    lng: 16
                                }
                            },
                            ...tab[i]
                        ];
                    }


                }

                if (!baseRouteToToAdd && baseBookInToAdd) {
                    tab[i] = [
                        tab[i][0],
                        {
                            idGoogle: "baseBookIn",
                            nazwa: "Zameldowanie w miejscu noclegu",
                            adres: "",
                            czasZwiedzania: 30,
                            lokalizacja: { lat: 52, lng: 16 }
                        },
                        ...tab[i].slice(1) // bez drugiego parametru = od indeksu 1 do końca
                    ];
                }



            }

            if (tab.length && i === tab.length - 1) {
                let baseRouteFromToAdd = true;
                let baseBookOutToAdd = tab.length > 1;

                for (let j = 0; j < tab[i].length; j++) {
                    if (tab[i][j]?.idGoogle == "baseRouteFrom") baseRouteFromToAdd = false;
                    if (tab[i][j]?.idGoogle == "baseBookOut") baseBookOutToAdd = false;

                }

                if (baseRouteFromToAdd) {


                    if (baseBookOutToAdd) {

                        tab[i] = [
                            ...tab[i],
                            {
                                idGoogle: "baseBookOut",
                                nazwa: "Wymeldowanie z miejsca noclegu",
                                adres: "",
                                czasZwiedzania: 30,
                                lokalizacja: { lat: 52, lng: 16 }
                            },
                            {
                                idGoogle: "baseRouteFrom",
                                nazwa: "Powrót do domu",
                                adres: "",
                                czasZwiedzania: 0,
                                lokalizacja: {
                                    lat: 52,
                                    lng: 16
                                }
                            }

                        ];

                    }
                    else if (tab.length) {

                        tab[i] = [
                            ...tab[i],
                            {
                                idGoogle: "baseRouteFrom",
                                nazwa: "Powrót do domu",
                                adres: "",
                                czasZwiedzania: 0,
                                lokalizacja: {
                                    lat: 52,
                                    lng: 16
                                }
                            }

                        ];
                    }


                }

                if (!baseRouteFromToAdd && baseBookOutToAdd) {
                    tab[i] = [
                        ...tab[i].slice(0, tab[i].length - 1),
                        tab[i][0],
                        {
                            idGoogle: "baseBookOut",
                            nazwa: "Wymeldowanie z miejsca noclegu",
                            adres: "",
                            czasZwiedzania: 30,
                            lokalizacja: { lat: 52, lng: 16 }
                        },
                        tab[i][tab[i].length] // bez drugiego parametru = od indeksu 1 do końca
                    ];
                }


            }

            if (i < tab.length - 1) {
                // Usuń ewentualne baseRouteFrom i baseBookOut
                tab[i] = tab[i].filter(
                    act => act.idGoogle !== "baseRouteFrom" && act.idGoogle !== "baseBookOut"
                );

                // Dodaj baseHotelIn tylko jeśli jeszcze go nie ma
                const hasHotelIn = tab[i].some(act => act.idGoogle === "baseHotelIn");
                if (!hasHotelIn) {
                    tab[i] = [
                        ...tab[i],
                        {
                            idGoogle: "baseHotelIn",
                            nazwa: "Powrót na nocleg",
                            adres: wybranyHotel.adres,
                            czasZwiedzania: 0,
                            lokalizacja: {
                                lat: 52,
                                lng: 16
                            }
                        }
                    ];
                }
            }
            if (i > 0) {
                tab[i] = tab[i].filter(
                    act => act.idGoogle !== "baseRouteTo" && act.idGoogle !== "baseBookIn"
                );

                // Dodaj baseHotelIn tylko jeśli jeszcze go nie ma
                const hasHotelOut = tab[i].some(act => act.idGoogle === "baseHotelOut");
                if (!hasHotelOut) {
                    tab[i] = [

                        {
                            idGoogle: "baseHotelOut",
                            nazwa: "Pobudka",
                            adres: wybranyHotel.adres,
                            czasZwiedzania: 0,
                            lokalizacja: {
                                lat: 52,
                                lng: 16
                            }
                        },
                        ...tab[i],
                    ];
                }
            }


        }
        return tab;

    }
    useEffect(() => {
        validateSchedule()

    }, [activitiesSchedule, timeSchedule])

    function addActivity(dayIndex, activity) {
        if (konfiguratorLoading) return; // nic nie rób dopóki trwa ładowanie

        setActivitiesSchedule(prev => {
            const updated = prev.map((dayActivities, idx) => {
                if (idx !== dayIndex) return dayActivities;

                // kopiujemy tablicę, aby nie mutować
                const newDay = [...dayActivities];

                // Sprawdzenie ostatniego elementu
                const last = newDay[newDay.length - 1];
                const newActivity = {
                    ...activity,
                    czasZwiedzania: activity?.czasZwiedzania || 60
                };

                if (last?.idGoogle === "baseRouteFrom" || last?.idGoogle === "baseHotelIn") {
                    // wstaw nową aktywność PRZED ostatnim elementem
                    newDay.splice(newDay.length - 1, 0, newActivity);
                } else {
                    // dodaj na koniec normalnie
                    newDay.push(newActivity);
                }

                return newDay;
            });

            return verifyBaseActs(updated); // zachowanie dotychczasowej logiki
        });
    }

    function deleteActivity(dayIndex, actIdx) {
        setActivitiesSchedule(prev =>
            prev.map((dayActivities, dIdx) =>
                dIdx === dayIndex
                    ? dayActivities.filter((_, aIdx) => aIdx !== actIdx)
                    : dayActivities
            )
        );
    }
    function swapActivities(dayIndex, act1, act2) {
        if (act1 == 0 || act2 == 0 || act1 == activitiesSchedule[wybranyDzien].length - 1 || act2 == activitiesSchedule[wybranyDzien].length - 1) return;
        // utwórz kopię całego harmonogramu
        const tmpActivities = activitiesSchedule.map(day => [...day]);

        // zamień miejscami atrakcje w wybranym dniu
        const day = tmpActivities[dayIndex];
        [day[act1], day[act2]] = [day[act2], day[act1]];

        // jeżeli chcesz warunkowo zapisać po weryfikacji
        if (generateRouteSchedule(tmpActivities)) {
            setActivitiesSchedule(tmpActivities);
            return true;
        }
        return false;
    }
    function changeActivity(dayIdx, idx, activity) {

        setActivitiesSchedule(prevSchedule =>
            prevSchedule.map((day, dIndex) =>
                dIndex === dayIdx
                    ? day.map((act, aIndex) =>
                        aIndex === idx ? { ...activity, czasZwiedzania: 20 } : act
                    )
                    : day
            )
        );
    }
    function changeStartHour(dayIdx, startTime) {
        if (startTime < 0) return;
        console.log("test121", startTime)
        dayIdx != activitiesSchedule.length - 1 && setStartHours(prev => {
            const tmpHours = [...prev]; // tworzymy kopię poprzedniego stanu
            tmpHours[dayIdx] = startTime; // modyfikujemy kopię
            return tmpHours; // ustawiamy nową tablicę w stanie
        });
        dayIdx == activitiesSchedule.length - 1 && setStartHours(prev => {
            const tmpHours = [...prev]; // tworzymy kopię poprzedniego stanu
            tmpHours[dayIdx] = minimum(startTime, timeToMinutes(wybranyHotel.checkOut) - 10); // modyfikujemy kopię
            return tmpHours; // ustawiamy nową tablicę w stanie
        });
    }

    function startModifyingAct(dayIdx, idx) {
        const modyfikacjaStruct = { flag: true, dayIdx, idx }
        setModyfikacja(modyfikacjaStruct)
    }
    useEffect(() => {
        if (modyfikacja.flag) setActivityPanelOpened(true);
    }, [modyfikacja])

    function changeActivityTime(dayIdx, actIdx, time) {
        const tmpActivities = activitiesSchedule.map((day, dIdx) =>
            day.map((activity, aIdx) =>
                dIdx === dayIdx && aIdx === actIdx
                    ? { ...activity, czasZwiedzania: time } // tworzysz kopię obiektu z nowym czasem
                    : activity
            )
        );

        if (generateRouteSchedule(tmpActivities)) {
            setActivitiesSchedule(tmpActivities);
            return true;
        }
        return false;
    }



    useEffect(() => {
        setKonfiguratorLoading(true)
        const handler = setTimeout(() => {
            const days = roznicaDni(dataPrzyjazdu, dataWyjazdu) > 0
                ? roznicaDni(dataPrzyjazdu, dataWyjazdu)
                : 1;

            setActivitiesSchedule(prev => {
                if (days < prev.length) {
                    // skrócenie do wymaganej liczby dni
                    let updated = verifyBaseActs(prev.slice(0, days));
                    setStartHours(prev => prev.slice(0, days));
                    return updated;
                } else if (days > prev.length) {
                    // dodanie brakujących dni jako pustych tablic
                    const extra = Array.from({ length: days - prev.length }, () => []);
                    let updated = verifyBaseActs([...prev, ...extra]);
                    setStartHours(prev => [...prev, ...Array.from({ length: days - prev.length }, () => 480)]);
                    return updated;
                }
                let updated = verifyBaseActs(prev);
                console.log("TEST1", updated);
                return updated; // bez zmian
            });

            setLiczbaDni(days);
            setKonfiguratorLoading(false);
        }, 3000);

        return () => clearTimeout(handler);
    }, [dataWyjazdu, dataPrzyjazdu]);

    useEffect(() => {
        console.log("TEST10", startHours)
    }, [startHours])
    useEffect(() => {

        setChosenTransportSchedule(prev => {
            let updated = [...prev];
            let localActivitiesSchedule = activitiesSchedule;

            // 1️⃣ Dostosowanie liczby dni

            if (activitiesSchedule.length > updated.length) {
                // dodaj brakujące dni (puste tablice)
                const extraDays = Array.from(
                    { length: activitiesSchedule.length - updated.length },
                    () => []
                );
                updated = [...updated, ...extraDays];
            } else if (activitiesSchedule.length < updated.length) {
                // usuń nadmiarowe dni
                updated = updated.slice(0, activitiesSchedule.length);
            }

            // 2️⃣ Dostosowanie liczby transportów w każdym dniu
            updated = updated.map((dayTransports, dayIdx) => {
                const targetLen = activitiesSchedule[dayIdx].length;
                const diff = targetLen - dayTransports.length - 1;

                if (diff > 0) {
                    // dodaj brakujące elementy (np. zera)
                    return [...dayTransports, ...Array(diff).fill(0)];
                } else if (diff < 0) {
                    // usuń nadmiar
                    return dayTransports.slice(0, targetLen);
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
    //temp
    useEffect(() => {
        setMiejsceStartowe(miejsceDocelowe)
    }, [miejsceDocelowe])
    //temp

    useEffect(() => {
        chosenTransportSchedule.length &&
            generateRouteSchedule();
    }, [chosenTransportSchedule, startHours]);

    const submitMiejsceDocelowe = (miejsceDoceloweWybor) => {
        setMiejsceDocelowe(miejsceDoceloweWybor);
        setMiejsceDoceloweSearching("")
        setMiejsceDoceloweResults([])

    }
    function formatDate(dateInput) {
        if (!dateInput) {
            return "dd/mm/rrrr"
        }
        const date = new Date(dateInput);

        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0"); // miesiące są od 0 do 11
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    }

    const setOffOthers = (s) => {
        if (s != 0) {
            setMiejsceDocelowePopupOpened(false)
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
    return (
        <>
            <TopKreatorSlider />


            <KonfiguratorMainSettings className={settingsOpened ? "opened" : "closed"}>
                <div className="iconEditBox" onClick={() => setSettingsOpened(!settingsOpened)}>
                    <img src="../icons/filter.svg" height={'60%'} />
                </div>
                <SettingsButton onClick={() => { setMiejsceDocelowePopupOpened(!miejsceDocelowePopupOpened); setOffOthers(0) }} className={miejsceDocelowePopupOpened ? "chosen" : ""}>

                    <img height="30px" width="30px" src="../icons/icon-rocket.svg" />
                    Miejsce początkowe:<span>{miejsceDocelowe ? miejsceDocelowe.nazwa : "..."} </span>
                    {miejsceDocelowePopupOpened && <div className="settingsPopup" onClick={(e) => e.stopPropagation()} >

                        <SearchBox value={miejsceDoceloweSearching} onChange={setMiejsceDoceloweSearching} results={miejsceDoceloweResults} searchAction={submitMiejsceDocelowe} disabled={miejsceDocelowe} />
                        {miejsceDocelowe && <>
                            <MapaBox key={`docelowe-${miejsceDocelowe.nazwa}`}>
                                <LeafletMap lat={miejsceDocelowe?.location?.lat || 52.5333} lng={miejsceDocelowe?.location?.lng || 16.9252} zoom={9} />

                            </MapaBox>
                            <MapaResultBox>


                                <PopupResult onClick={() => setMiejsceDocelowe("")} onMouseEnter={() => setMiejsceDoceloweHovering(true)} onMouseLeave={() => setMiejsceDoceloweHovering(false)}>
                                    <div className="popupResultTitle">
                                        {miejsceDocelowe.nazwa}
                                    </div>
                                    <div className="popupResultSubtitle">
                                        {miejsceDocelowe.wojewodztwo}, {miejsceDocelowe.kraj}
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
                                <div className={miejsceDoceloweHovering ? "changeInfo hovered" : "changeInfo"}>
                                    kliknij aby zmienić lokalizację
                                </div>
                            </MapaResultBox>

                        </>}
                        {!miejsceDocelowe &&
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

                <SettingsButton className={wyborDatyOpened ? "chosen" : ""} onClick={() => { setWyborGosciOpened(!wyborGosciOpened); setOffOthers(2) }}>

                    <img height="30px" width="30px" src="../icons/users.svg" />
                    {liczbaUczestnikow} uczestników, {liczbaOpiekunów} opiekunów
                    {wyborGosciOpened && <div className="settingsPopup" onClick={(e) => e.stopPropagation()} >
                        Liczba uczestników
                        <WyborUczestnikow uczestnicy={liczbaUczestnikow} setUczestnicy={setLiczbaUczestnikow} opiekunowie={liczbaOpiekunów} setOpiekunowie={setLiczbaOpiekunów} />
                    </div>}

                </SettingsButton>
                <SettingsButton className={wyborStandardHoteluOpened ? "chosen" : ""} onClick={() => { setWyborStandardHoteluOpened(!wyborStandardHoteluOpened); setOffOthers(3) }}>

                    <img height="30px" width="30px" src="../icons/icon-hotel.svg" />
                    Standard hotelu : {standardHotelu || "..."}
                    {wyborStandardHoteluOpened && <div className="settingsPopup" onClick={(e) => e.stopPropagation()} >
                        Standard hotelu
                        <Radio1
                            setWybor={setStandardHotelu}
                            value={standardHotelu}
                            name="hotel-standard"
                        />
                    </div>}
                </SettingsButton>
                <SettingsButton className={wyborStandardTransportuOpened ? "chosen" : ""} onClick={() => { setWyborStandardTransportuOpened(!wyborStandardTransportuOpened); setOffOthers(4) }}>

                    <img height="30px" width="30px" src="../icons/icon-transport.svg" />
                    Preferowany transport: {standardTransportu || "..."}
                    {wyborStandardTransportuOpened && <div className="settingsPopup" onClick={(e) => e.stopPropagation()} >
                        Forma transportu
                        <Radio1
                            options={[
                                { icon: "../icons/icon-private-bus.svg", label: "Wynajęty autokar" },
                                { icon: "../icons/icon-public-trannsport.svg", label: "Transport publiczny" },
                                { icon: "../icons/icon-own-transport.svg", label: "Własny" }
                            ]}
                            setWybor={setStandardTransportu}
                            value={standardTransportu}
                            name="transport-form"
                        />
                    </div>}
                </SettingsButton>
            </KonfiguratorMainSettings>

            <KonfiguratorMainMainbox>
                <KonfiguratorMainMainboxLeft>
                    <div className="mainboxLeftTitle">
                        Biblioteka atrakcji

                    </div>
                    <div className="mainboxLeftInput">
                        <img src="../icons/search-gray.svg" width={'20px'} />
                        <input type="text" placeholder="Wyszukaj atrakcje..." value={attractionsSearching} onChange={(e) => setAttractionsSearching(e.target.value)}/>
                    </div>
                    <>
                    {
                        atrakcje
                            .filter(atrakcja => atrakcja.nazwa.toLowerCase().includes(attractionsSearching.toLowerCase()) || atrakcja.adres.toLowerCase().includes(attractionsSearching.toLowerCase()))
                            .toSorted((a, b) => (b.liczbaOpinie || 0) - (a.liczbaOpinie || 0))
                            .map((atrakcja, idx) => (
                                <AttractionResultMedium key={atrakcja.googleId + "bok"}>
                                    <div className="attractionResultMediumTitleBox">
                                        <div className="titleIconBox">
                                            <img src="../icons/color-castle.svg" width="20px" />
                                        </div>
                                        <div className="titleTextBox">
                                            <div className="attractionResultMediumTitle">
                                                {atrakcja.nazwa}
                                            </div>
                                            <div className="attractionResultMediumSubtitle">
                                                {atrakcja.adres}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="attractionResultMediumDetails">
                                        <div className="attractionResultMediumDetailRow">
                                            <div className="detailRowElement">
                                                <img src="../icons/icon-time.svg" width="20px" />{" "}
                                                {atrakcja.czasZwiedzania || "1h 30min"}
                                            </div>
                                            <div className="detailRowElement">
                                                <img src="../icons/icon-ticket.svg" width="20px" />{" "}
                                                {atrakcja.cenaZwiedzania || "10zl/os"}
                                            </div>
                                        </div>
                                        <div className="attractionResultMediumDetailRow">
                                            <div className="detailRowElement">
                                                <img src="../icons/icon-stars.svg" width="20px" /> {atrakcja.ocena}{" "}
                                                <span>({atrakcja.liczbaOpinie})</span>
                                            </div>
                                            <div className="detailRowElement b">
                                                <img src="../icons/link.svg" width="20px" />{" "}
                                                <a href={atrakcja?.stronaInternetowa} target="_blank" rel="noreferrer">
                                                    Witryna
                                                </a>
                                            </div>
                                        </div>
                                        <div className="attractionResultMediumDetailRow">
                                            <div className="detailRowElement c">
                                                <img src="../icons/success.svg" width="20px" /> Dostępne z przewodnikiem
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        className="attractionResultMediumAddBox"
                                        onClick={() => addActivity(wybranyDzien, atrakcja)}
                                    >
                                        + Dodaj do dnia
                                    </div>
                                </AttractionResultMedium>
                            ))

                    }
                    </>
                </KonfiguratorMainMainboxLeft>

                {/*

                    zielona granica
                    zielona granicazielona granica
                    zielona granica
                    zielona granica
                    zielona granica
                    zielona granica

                */}

                <KonfiguratorMainMainboxRight>
                    <KonfiguratorWyjazduComp changeStartHour={changeStartHour} deleteActivity={deleteActivity} startModifyingAct={startModifyingAct} setActivityPanelOpened={setActivityPanelOpened} onAttractionTimeChange={changeActivityTime} swapActivities={swapActivities} onTransportChange={changeChosenTransport} timeSchedule={timeSchedule} routeSchedule={routeSchedule} chosenTransportSchedule={chosenTransportSchedule} loading={konfiguratorLoading} activitesSchedule={activitiesSchedule} liczbaDni={liczbaDni} key={`schedule-${liczbaDni}-${konfiguratorLoading}-${timeSchedule}`} wybranyDzien={wybranyDzien} setWybranyDzien={setWybranyDzien} addActivity={addActivity} />
                    {activityPanelOpened &&
                        <AddAttractionWrapper>
                            <AddActivityPanelContainer>
                                <AddActivityPanel key={`${modyfikacja}`} setModAct={setModyfikacja} dayIndex={wybranyDzien} closePanel={() => setActivityPanelOpened(false)} miejsceDocelowe={miejsceDocelowe.nazwa} modActIdx={modyfikacja.flag ? modyfikacja.idx : null} addActivity={modyfikacja.flag ? changeActivity : addActivity} />
                            </AddActivityPanelContainer>
                        </AddAttractionWrapper>
                    }
                </KonfiguratorMainMainboxRight>

            </KonfiguratorMainMainbox>
        </>

    )

}