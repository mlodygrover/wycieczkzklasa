import { useEffect, useState, useCallback, use, useRef } from "react"
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
import RouteMap from "./routeMap";
import { parseJSON } from "date-fns";
import AttractionResultMediumComponent from "./attractionResultMediumComp";
import { Checkbox2 } from "./checkbox1";
import { AlertsBox } from "./konfigurator/alertsBox";

const testResults = [
    { nazwa: "Poznań", region: "Wielkopolska", kraj: "Polska" },
    { nazwa: "Luboń koło Poznania", region: "Wielkopolska", kraj: "Polska" },
    { nazwa: "Poznań", region: "Lubelskie", kraj: "Polska" },
    { nazwa: "Druzyna Poznańska", wojewodztwo: "Wielkopolska", kraj: "Polska" }


]
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
`
const KonfiguratorMainMainboxLeft = styled.div`

    width: 300px;
    border-right: 1px solid lightgray;
    &.right{
        border-right: none;
        border-left: 1px solid lightgray;
    }
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
  overflow-y: auto;     /* umożliwia scrollowanie wewnątrz panelu */
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
export function toBookingDateFormat(dateInput) {
    const date = new Date(dateInput);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}



export const KonfiguratorMain = ({ dataPrzyjazduInit, dataWyjazduInit, standardHoteluInit, standardTransportuInit, miejsceDoceloweInit, miejsceStartoweInit, liczbaUczestnikowInit, liczbaOpiekunówInit, pokojeOpiekunowieInit }) => {

    //dane poczatkowe
    const [dataPrzyjazdu, setDataPrzyjazdu] = useState(() => {
        if (dataPrzyjazduInit) return new Date(dataPrzyjazduInit);
        const saved = localStorage.getItem("dataPrzyjazdu");
        return saved ? new Date(saved) : new Date();
    });

    const [dataWyjazdu, setDataWyjazdu] = useState(() => {
        if (dataWyjazduInit) return new Date(dataWyjazduInit);
        const saved = localStorage.getItem("dataWyjazdu");
        return saved ? new Date(saved) : new Date();
    });

    const [standardHotelu, setStandardHotelu] = useState(
        standardHoteluInit ?? Number(localStorage.getItem("standardHotelu")) ?? 0
    );

    const [standardTransportu, setStandardTransportu] = useState(
        standardTransportuInit ?? Number(localStorage.getItem("standardTransportu")) ?? 0
    );

    // --- efekty zapisu do localStorage ---

    useEffect(() => {
        localStorage.setItem("standardTransportu", standardTransportu);
    }, [standardTransportu]);

    useEffect(() => {
        localStorage.setItem("standardHotelu", standardHotelu);
    }, [standardHotelu]);

    useEffect(() => {
        if (dataWyjazdu instanceof Date && !isNaN(dataWyjazdu)) {
            localStorage.setItem("dataWyjazdu", dataWyjazdu.toISOString());
        }
    }, [dataWyjazdu]);

    useEffect(() => {
        if (dataPrzyjazdu instanceof Date && !isNaN(dataPrzyjazdu)) {
            localStorage.setItem("dataPrzyjazdu", dataPrzyjazdu.toISOString());
        }
    }, [dataPrzyjazdu]);

    const [miejsceDocelowe, setMiejsceDocelowe] = useState(

        () => {
            const saved = localStorage.getItem("miejsceDocelowe");
            return saved ? JSON.parse(saved) : miejsceDoceloweInit; // zwracamy obiekt albo null
        }

    );
    const [miejsceStartowe, setMiejsceStartowe] = useState(

        () => {
            const saved = localStorage.getItem("miejsceStartowe");
            return saved ? JSON.parse(saved) : miejsceStartoweInit; // zwracamy obiekt albo null
        }

    );



    const [liczbaUczestnikow, setLiczbaUczestnikow] = useState(
        liczbaUczestnikowInit ?? Number(localStorage.getItem("liczbaUczestnikow")) ?? 0
    );
    const [liczbaOpiekunów, setLiczbaOpiekunów] = useState(
        liczbaOpiekunówInit ?? Number(localStorage.getItem("liczbaOpiekunów")) ?? 0
    );
    useEffect(() => {
        localStorage.setItem("liczbaUczestnikow", liczbaUczestnikow)
    }, [liczbaUczestnikow])
    useEffect(() => {
        localStorage.setItem("liczbaOpiekunów", liczbaOpiekunów)
    }, [liczbaOpiekunów])
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

        // 1. od razu czyścimy poprzednie wyniki
        setMiejsceStartoweResults([]);

        // 2. ustawiamy timer
        const timeoutId = setTimeout(async () => {
            try {
                const response = await fetch(
                    `http://localhost:5006/searchCity?query=${encodeURIComponent(
                        miejsceStartoweSearching
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

                    setMiejsceStartoweResults(resultsWithPlaceId);
                }
                else { setMiejsceStartoweResults([{ kraj: "brak" }]) }// <-- zapisanie wyników

            } catch (error) {
                console.error("Błąd pobierania danych:", error);
            }
        }, 1000); // 1000ms = 1s

        // 3. czyszczenie timera przy zmianie inputa
        return () => clearTimeout(timeoutId);
    }, [miejsceStartoweSearching]);

    //test test test test
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


    //test test test
    //dane z serwera

    //atrakcje
    const [atrakcje, setAtrakcje] = useState([]);

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

        miejsceDocelowe && localStorage.setItem("miejsceDocelowe", JSON.stringify(miejsceDocelowe))
    }, [miejsceDocelowe])
    useEffect(() => {
        miejsceStartowe && localStorage.setItem("miejsceStartowe", JSON.stringify(miejsceStartowe))
    }, [miejsceStartowe])

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
    function addRouteAlert(dayIdx) {
        console.log("TEST8", routeSchedule[routeSchedule.length - 1][routeSchedule[routeSchedule.length - 1].length - 1]?.transitRoute);
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
        return Math.ceil((num + 0.0001) / 5) * 5; // dodanie małej wartości, by np. 20 -> 25
    }

    async function generateRouteSchedule(activitiesScheduleProps) {
        if (activitiesSchedule.length != chosenTransportSchedule.length && activitiesSchedule != timeSchedule.length) {
            return;
        }

        // ⏱️ odblokowanie po 1 sekundzie

        const activitiesScheduleLocal = structuredClone(activitiesScheduleProps)
        const tabRoutesTmp = Array.from({ length: liczbaDni }, () => []);
        const tabTimeScheduleTmp = Array.from({ length: liczbaDni }, (_, i) => [startHours[i]]);

        // 🔹 Pętla po dniach
        for (let dayIdx = 0; dayIdx < activitiesScheduleLocal.length; dayIdx++) {
            const day = activitiesScheduleLocal[dayIdx];
            // 🔹 Pętla po aktywnościach
            for (let actIdx = 0; actIdx < day.length - 1; actIdx++) {
                let current = day[actIdx];
                let next = day[actIdx + 1];

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

        // 🔹 Obliczanie czasu dla każdego dnia
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
                    if (activity.idGoogle === "baseBookIn") {
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

        //console.log("✅ Nowe trasy:", tabRoutesTmp);
        //console.log("🕒 Harmonogram:", tabTimeScheduleTmp);

        return true;
    }

    function verifyBaseActs(tab) {
        if (!tab.length || !miejsceDocelowe || !miejsceStartowe) return tab;
        const newTab = tab.map(day => [...day]);
        for (let i = 0; i < tab.length; i++) {

            if (tab.length && i === 0) {
                let baseRouteToToAdd = true;
                let baseBookInToAdd = tab.length > 1;
                let baseRouteToId = -1;
                for (let j = 0; j < tab[i].length; j++) {
                    if (tab[i][j]?.idGoogle == "baseRouteTo") {
                        baseRouteToToAdd = false;
                        baseRouteToId = j;
                    }

                    if (tab[i][j]?.idGoogle == "baseBookIn") {
                        baseBookInToAdd = false;
                    }

                }
                if (!baseRouteToToAdd) {
                    tab[i][baseRouteToId] = {
                        idGoogle: "baseRouteTo",
                        nazwa: "Wyjazd do miejsca docelowego",
                        adres: "",
                        czasZwiedzania: 0,
                        lokalizacja: {
                            lat: miejsceStartowe?.location?.lat || 52.40567859999999,
                            lng: miejsceStartowe?.location?.lng || 16.9312766
                        }
                    }
                    //console.log("TEST11", tab[i][baseRouteToId])

                }
                if (baseRouteToToAdd) {


                    if (baseBookInToAdd) {

                        tab[i] = [
                            {
                                idGoogle: "baseBookIn",
                                nazwa: "Zameldowanie w miejscu noclegu",
                                adres: "",
                                czasZwiedzania: 30,
                                lokalizacja: {
                                    lat: miejsceDocelowe?.location?.lat || 52.40567859999999,
                                    lng: miejsceDocelowe?.location?.lng || 16.9312766
                                }
                            },
                            ...tab[i],


                        ];

                        tab[i] = [
                            {
                                idGoogle: "baseRouteTo",
                                nazwa: "Wyjazd do miejsca docelowego",
                                adres: "",
                                czasZwiedzania: 0,
                                lokalizacja: {
                                    lat: miejsceStartowe?.location?.lat || 52.40567859999999,
                                    lng: miejsceStartowe?.location?.lng || 16.9312766
                                }
                            },
                            ...tab[i]
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
                                    lat: miejsceStartowe?.location?.lat || 52.40567859999999,
                                    lng: miejsceStartowe?.location?.lng || 16.9312766
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
                            lokalizacja: {
                                lat: miejsceDocelowe?.location?.lat || 52.40567859999999,
                                lng: miejsceDocelowe?.location?.lng || 16.9312766
                            }
                        },
                        ...tab[i].slice(1) // bez drugiego parametru = od indeksu 1 do końca
                    ];
                }



            }

            if (tab.length && i === tab.length - 1) {
                let baseRouteFromToAdd = true;
                let baseBookOutToAdd = tab.length > 1;
                let baseRouteFromId = -1;
                
                for (let j = 0; j < tab[i].length; j++) {
                    if (tab[i][j]?.idGoogle == "baseRouteFrom"){ baseRouteFromToAdd = false; baseRouteFromId = j};
                    if (tab[i][j]?.idGoogle == "baseBookOut") baseBookOutToAdd = false;

                }
                if (!baseRouteFromToAdd) {
                    tab[i][baseRouteFromId] = {
                        idGoogle: "baseRouteFrom",
                        nazwa: "Powrót do domu",
                        adres: "",
                        czasZwiedzania: 0,
                        lokalizacja: {
                            lat: miejsceStartowe?.location?.lat || 52.40567859999999,
                            lng: miejsceStartowe?.location?.lng || 16.9312766
                        }
                    }
                    //console.log("TEST11", tab[i][baseRouteToId])

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
                                lokalizacja: {
                                    lat: miejsceDocelowe?.location?.lat || 52.40567859999999,
                                    lng: miejsceDocelowe?.location?.lng || 16.9312766
                                }
                            },
                            {
                                idGoogle: "baseRouteFrom",
                                nazwa: "Powrót do domu",
                                adres: "",
                                czasZwiedzania: 0,
                                lokalizacja: {
                                    lat: miejsceStartowe?.location?.lat || 52.40567859999999,
                                    lng: miejsceStartowe?.location?.lng || 16.9312766
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
                                    lat: miejsceStartowe?.location?.lat || 52.40567859999999,
                                    lng: miejsceStartowe?.location?.lng || 16.9312766
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
                            lokalizacja: {
                                lat: miejsceDocelowe?.location?.lat || 52.40567859999999,
                                lng: miejsceDocelowe?.location?.lng || 16.9312766
                            }
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
                                lat: miejsceDocelowe?.location?.lat || 52.40567859999999,
                                lng: miejsceDocelowe?.location?.lng || 16.9312766
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
                                lat: miejsceDocelowe?.location?.lat || 52.40567859999999,
                                lng: miejsceDocelowe?.location?.lng || 16.9312766
                            }
                        },
                        ...tab[i],
                    ];
                }
            }


        }
        if (tab && tab.length > 1) {
            for (let i = 0; i < tab.length; i++) {
                if (tab[i][0].idGoogle != "baseRouteTO") {
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
            const toReturn = verifyBaseActs(updated);
            console.log("TEST2", toReturn, updated)
            return toReturn; // zachowanie dotychczasowej logiki
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
    async function swapActivities(dayIndex, act1, act2) {
        // 🧩 Blokada — nie zamieniamy hotelu lub pustych elementów
        if (
            act1 === 0 ||
            act2 === 0 ||
            act1 === activitiesSchedule[wybranyDzien].length - 1 ||
            act2 === activitiesSchedule[wybranyDzien].length - 1
        ) {
            return;
        }

        // 🔹 Utwórz kopię harmonogramu
        const tmpActivities = activitiesSchedule.map(day => [...day]);

        // 🔹 Zamiana miejscami atrakcji w danym dniu
        const day = tmpActivities[dayIndex];
        [day[act1], day[act2]] = [day[act2], day[act1]];

        // 🔹 Wygeneruj ponownie harmonogram tras
        const success = true;//await generateRouteSchedule(tmpActivities);

        if (success) {
            setActivitiesSchedule(tmpActivities);
            return true;
        } else {
            console.warn("⚠️ Nie udało się zaktualizować tras po zamianie atrakcji");
            return false;
        }
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
        dayIdx != activitiesSchedule.length - 1 && setStartHours(prev => {
            const tmpHours = [...prev]; // tworzymy kopię poprzedniego stanu
            tmpHours[dayIdx] = startTime; // modyfikujemy kopię
            return tmpHours; // ustawiamy nową tablicę w stanie
        });
        dayIdx == activitiesSchedule.length - 1 && setStartHours(prev => {
            console.log("TEST6", minimum(startTime, timeToMinutes(wybranyHotel.checkOut) - 10))
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

    async function changeActivityTime(dayIdx, actIdx, time) {
        console.log("TEST3");
        // 🔹 Utwórz głęboką kopię harmonogramu i zaktualizuj wybrany czas
        const tmpActivities = activitiesSchedule.map((day, dIdx) =>
            day.map((activity, aIdx) =>
                dIdx === dayIdx && aIdx === actIdx
                    ? { ...activity, czasZwiedzania: time }
                    : activity
            )
        );
        console.log("TEST4", actIdx, tmpActivities)
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
                return updated; // bez zmian
            });

            setLiczbaDni(days);
            setKonfiguratorLoading(false);
        }, 3000);

        return () => clearTimeout(handler);
    }, [dataWyjazdu, dataPrzyjazdu]);


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
                    return [...dayTransports, ...Array(diff).fill(standardTransportu == 0 ? 1 : 2)];
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
        setActivitiesSchedule(prev => {
            const updated = verifyBaseActs(structuredClone(prev)); // 🔹 pełna kopia
            return updated;
        });
    }, [miejsceStartowe]);





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
        const month = String(date.getMonth() + 1).padStart(2, "0"); // miesiące są od 0 do 11
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    }
    //temp temp temp
    useEffect(()=>{
        setMiejsceDocelowe(miejsceStartowe)
    }, [miejsceStartowe])
    /*
    const link1 = "https://ogrod.amu.edu.pl/";

    useEffect(() => {
        const fetchOffer = async () => {
            try {
                const response = await fetch(`http://localhost:5006/place-offer?links=${encodeURIComponent(link1)}`);
                const data = await response.json();
                console.log("✅ Odpowiedź z backendu:", data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchOffer();
    }, []);
    
    const googleIdTest = "ChIJSW5ASGlbBEcR9aAyoa6e1Qg";
    const linkTest = "http://www.bramapoznania.pl/";
    
    useEffect(() => {
        if (!googleIdTest || !linkTest) return; // ⛔ brak wymaganych danych — nie wywołujemy API

        const handler = setTimeout(async () => {
            try {
                console.log(`🔄 Aktualizuję ofertę dla ${googleIdTest} z linku ${linkTest}...`);

                const response = await axios.get("http://localhost:5006/update-offer", {
                    params: { googleId: googleIdTest, link: linkTest },
                    timeout: 120000, // 2 minuty
                });

                console.log("✅ Oferta zaktualizowana:", response.data);
            } catch (err) {
                console.error("❌ Błąd przy aktualizacji oferty:", err.message);
            }
        }, 1000); // ⏱️ 1 sekunda opóźnienia

        // 🧹 Wyczyść timeout przy zmianie zależności lub unmount
        return () => clearTimeout(handler);
    }, [googleIdTest, linkTest]);*/



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

        // 🔍 Sprawdzenie localStorage
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

        const handler = setTimeout(async () => {
            try {
                console.log("🌍 Pobieram hotel z API /findHotel...");
                const response = await axios.get("http://localhost:5006/findHotel", {
                    params: {
                        city: nazwa,
                        centerLat: lat,
                        centerLng: lng,
                        arrival_date: toBookingDateFormat(dataPrzyjazdu),
                        departure_date: toBookingDateFormat(dataWyjazdu),
                        stars: standardHotelu == 0 ? "class::0,class::1" : standardHotelu == 1 ? "class::2,class::3" : "class::4,class::5",
                        property_types: "property_type::204",
                        apartsAllowed: standardHotelu > 0 ? false : true,
                        max_pages: 3,
                        uczestnicy: liczbaUczestnikow,
                        opiekunowie: liczbaOpiekunów,
                        pokojeOpiekunowie: pokojeOpiekunowie
                    }
                });

                console.log("✅ Wynik zapytania /findHotel:", response.data);

                const winningHotel = Array.isArray(response.data.hotels)
                    ? response.data.hotels[0]
                    : response.data[0];

                if (!winningHotel) {
                    console.warn("⚠️ Nie znaleziono hoteli dla podanych parametrów.");
                    return;
                }

                const hotelData = {
                    nazwa: winningHotel.property.name,
                    adres: winningHotel.property.address || "",
                    stars: winningHotel.property.accuratePropertyClass,
                    checkIn: winningHotel.property.checkin?.fromTime || "N/A",
                    checkOut: winningHotel.property.checkout?.untilTime || "N/A",
                    cena: winningHotel.property.priceBreakdown?.grossPrice?.value || 0,
                    lat: winningHotel.property.latitude,
                    lng: winningHotel.property.longitude,
                    cachedAt: new Date().toISOString(),
                };

                // 💾 Zapisz w localStorage
                localStorage.setItem(key, JSON.stringify(hotelData));
                console.log(`💾 Zapisano hotel w localStorage jako "${key}"`);

                setWybranyHotel(hotelData);

            } catch (error) {
                console.error("❌ Błąd podczas pobierania hoteli:", error.message);
            }
        }, 1000);

        return () => clearTimeout(handler);

    }, [
        miejsceDocelowe,
        dataPrzyjazdu,
        dataWyjazdu,
        standardHotelu,
        liczbaUczestnikow,
        liczbaOpiekunów,
        pokojeOpiekunowie
    ]);



    useEffect(() => {
        //console.log("test10", routeSchedule, activitiesSchedule)
    }, [routeSchedule])


    //temp temp temp
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
                // Kliknięto poza całym KonfiguratorMainSettings → zamknij wszystkie popupy
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

    //useEffect(() => { console.log("TEST2", activitiesSchedule, activitiesSchedule[wybranyDzien]) }, [activitiesSchedule])

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
                <KonfiguratorMainMainboxLeft>
                    <div className="mainboxLeftTitle">
                        Biblioteka atrakcji

                    </div>

                    <div className="mainboxLeftInput">
                        <img src="../icons/search-gray.svg" width={'20px'} />
                        <input type="text" placeholder="Wyszukaj atrakcje..." value={attractionsSearching} onChange={(e) => setAttractionsSearching(e.target.value)} />
                    </div>
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
                    <>
                        {
                            atrakcje
                                .filter(atrakcja => atrakcja.nazwa.toLowerCase().includes(attractionsSearching.toLowerCase()) || atrakcja.adres.toLowerCase().includes(attractionsSearching.toLowerCase()))
                                .toSorted((a, b) => (b.liczbaOpinie * b.ocena || 0) - (a.liczbaOpinie * a.ocena || 0))
                                .map((atrakcja, idx) => (
                                    <AttractionResultMediumComponent key={`${atrakcja.idGoogle}${idx}`} atrakcja={atrakcja} wybranyDzien={wybranyDzien} addActivity={addActivity} />

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
                    <KonfiguratorWyjazduComp checkOut={timeToMinutes(wybranyHotel?.checkOut) || 720} changeStartHour={changeStartHour} deleteActivity={deleteActivity} startModifyingAct={startModifyingAct} setActivityPanelOpened={setActivityPanelOpened} onAttractionTimeChange={changeActivityTime} swapActivities={swapActivities} onTransportChange={changeChosenTransport} timeSchedule={timeSchedule} routeSchedule={routeSchedule} chosenTransportSchedule={chosenTransportSchedule} loading={konfiguratorLoading} activitesSchedule={activitiesSchedule} liczbaDni={liczbaDni} key={`schedule-${liczbaDni}-${konfiguratorLoading}-${timeSchedule}`} wybranyDzien={wybranyDzien} setWybranyDzien={setWybranyDzien} addActivity={addActivity} />
                    {activityPanelOpened &&
                        <AddAttractionWrapper>
                            <AddActivityPanelContainer>
                                <AddActivityPanel key={`${modyfikacja}`} setModAct={setModyfikacja} dayIndex={wybranyDzien} closePanel={() => setActivityPanelOpened(false)} miejsceDocelowe={miejsceDocelowe.nazwa} modActIdx={modyfikacja.flag ? modyfikacja.idx : null} addActivity={modyfikacja.flag ? changeActivity : addActivity} />
                            </AddActivityPanelContainer>
                        </AddAttractionWrapper>
                    }
                </KonfiguratorMainMainboxRight>
                <KonfiguratorMainMainboxLeft className="right">
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
                        {routeToPrint && routeToPrint.length > 0 ?
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
                        }


                    </SummaryInfoBox>
                    <SummaryInfoBox className="b">

                        <div className="summaryInfoBoxTitle">
                            <img src="../icons/hotel-white.svg" width="20px" />
                            Powrót do {miejsceStartowe?.nazwa}
                        </div>
                        {routeFromPrint && routeFromPrint.length > 0 ?
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
                        }



                    </SummaryInfoBox>
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
            {alertsTable && alertsTable.length &&
                <AlertsBox key={alertsTable} alertsTable={alertsTable} deleteAlert={deleteAlert} />
            }
        </>

    )

}