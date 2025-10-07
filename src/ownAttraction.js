import { useState, useEffect, useRef } from "react"
import styled from "styled-components"
import Loader from "./roots/loader"
import { minutesToStringTime } from "./roots/attractionResults"
import { AtrakcjaResultMid, SuccessAlert } from "./konfigurator/addActivityPanel"
import LeafletMap from "./roots/googleMapViewer"
import { StarRating } from "./roots/wyborPoleAtrakcja"

const OwnAttractionMainbox = styled.div`
    width: 100%;
    background-color: #eaeaea;
    min-height: 300px;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    padding: 10px 25px;
    box-sizing: border-box;
    .alertsBox{
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 5px;
    }
    
`
const OwnAttractionTitle = styled.div`
    font-size: 20px;
    font-weight: 300;
    color: #404040;
    text-align: left;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: 5px;
    &.b{
        padding-bottom: 10px;
        box-sizing: border-box;
        border-bottom: 1px solid gray;
        font-size: 14px;
        color: #606060;

    }
    @media screen and (max-width: 800px){
        font-size: 16px;
        &.b{
            font-size: 12px;
            color: #404040;
        }
    }
`
const OwnAttractionContent = styled.div`
    width: 100%;
    min-height: 100px;
    display: flex;
    flex-direction: row;
    align-items: stretch;
    justify-content: space-between;
    gap: 5px;
    margin-top: 20px;
    @media screen and (max-width: 800px){
        flex-direction: column;
    }

`
const OwnAttractionLeft = styled.div`
   flex: 1;
   border-left: 2px solid orange;
   box-shadow: 0px 0px 5px lightgray;
   display: flex;
   flex-direction: column;
   justify-content: flex-start;
   align-items: flex-start; 
   padding: 10px;

   .ownAttrTitle{
        
        font-size: 16px;
        font-weight: 300;
        color: #404040;
    
   }
    .paraInputAttr{
        margin-right: 100px;
        margin-bottom: 5px;
        width: 100%;
        min-height: 35px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;
        gap: 2px;
        box-sizing: border-box;
        position: relative;

        .priceWrapper{
            width: 100%;
            height: 40px;
            position: relative;
            display: inline-block;
            input{
                height: 35px;
                padding-right: 35px;
            }
         
        }
        .priceWrapperC{
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: flex-start;
            padding-right: 10px;
            height: 35px;
            width: 100%;
            box-sizing: border-box;
            height: 40px;
            border-radius: 5px;
            font-size: 14px;
            font-weight: 400;
            gap: 10px;
            color: #505050;
            background-color: #eeeeee;
            border: 1px solid lightgray;
            a{
                width: 70px;
                font-size: 12px;
            }   
            input{
            
            border: none;}
        }
        .priceWrapper::after {
            content: "zł";
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            color: #555;
            pointer-events: none; /* nie blokuje kliknięć w input */
            font-size: 12px;
        }
        .priceWrapper.b::after {
            content: "min";
            
            
        }
        .searchButtonParaInputWrapper{
            position: absolute;
            right: 0px;
            bottom: 0%;
            height: 35px;
            width: 45px;
            display: flex;
            align-items: center;
            justify-content: center;

            .searchButtonParaInput{
                height: 25px;
                width: 35px;
                background-color: #f49725;
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
                border-radius: 5px;
                cursor: pointer;
                transition: 0.3s ease-in-out;
                &:hover{
                    background-color: #e38614;
                }

            }
        }
       
        input{
            width: 100%;
            box-sizing: border-box;
            outline: none;
            border: none;
            height: 35px;
            border-radius: 5px;
            padding-left: 10px;
            font-size: 14px;
            font-weight: 400;
            color: #505050;
            background-color: #eeeeee;
            border: 1px solid lightgray;
          
            &.opened{
                border-bottom: 0;
                border-bottom-left-radius: 0;
                border-bottom-right-radius: 0;
                  box-shadow: 4px 4px 4px lightgray;
            }

        }
        .paraInputTitle{
            font-size: 14px;
            font-weight: 400;
            color: #505050;
            padding-left: 1px;
        }
        .paraInputAttrResults {
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            color: #404040;
            z-index: 999;
            pointer-events: none;
            /* początkowy stan */
            height: 0;
            min-height: 0;
            transition: 0.3s ease;   /* animacja */

            /* opcjonalnie: delikatny efekt przesuwania w dół */
            opacity: 0;
            background-color:  #eeeeee;
            box-shadow: 4px 4px 4px lightgray;
            border: 1px solid lightgray;
            border-top: 0;
            border-bottom-left-radius: 5px;
            border-bottom-right-radius: 5px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: flex-start;
            gap: 2px;
        }

        .paraInputAttrResults.open {
            min-height: 500px; /* docelowa wysokość */
            opacity: 1;
            pointer-events: auto; 
        }
        .searchingAdressResult{
            width: 98%;
            height: 40px;
            background-color: #dadada;
            border-top-right-radius: 10px;
            border-bottom-right-radius: 10px;
            transition: 0.3s ease-in-out;
            cursor: pointer;
            display: flex;
            flex-direction: row;
            align-items: stretch;
            justify-content: flex-start;
            gap: 10px;
            .resultLeftBorder{
                width: 5px;
                transition: 0.3s ease-in-out;
                border-top-right-radius: 6px;
                border-bottom-right-radius: 6px;
                background-color: #d0d0d0;;
            }
            &:hover{
                background-color: #d4d4d4;
                .resultLeftBorder{
                    background-color: #f49725;

                }
            }
            .resultsRightContent{
                display: flex;
                flex: 1;
                flex-direction: column;
                align-items: flex-start;
                justify-content: center;
                overflow: hidden;
                
                .resultRightContentName {
                    font-size: 15px;
                    font-weight: 400;
                    white-space: nowrap;  /* zapobiega zawijaniu tekstu */
                    overflow: hidden;     /* ukrywa tekst wychodzący poza kontener */
                    text-overflow: ellipsis; /* opcjonalnie – dodaje "..." na końcu jeśli tekst nie mieści się w divie */
                    overflow: hidden;
                }
                .resultRightContentDesc{
                     font-size: 13px;
                     text-wrap: no-wrap;
                    overflow: hidden;
                
                }

            }

        }
    }
`
const OwnAttractionBorder = styled.div`
    border-left: 0px solid gray;
`
const OwnAttractionRight = styled.div`
    
    flex: 1;
    border-left: 2px solid orange;
    box-shadow: 0px 0px 5px lightgray;
    border-radius: 2px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start; 
    padding: 10px;
    height: fit-content;
    .ownAttrTitle{
            
            font-size: 16px;
            font-weight: 300;
            color: #404040;
        
    }
    .emptyResults{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;

    a{
        color: #404040;
        font-weight: 300;
    }

    }
    .paraInputAttr{
        margin-right: 100px;
        margin-bottom: 5px;
        width: 100%;
        min-height: 35px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;
        gap: 2px;
        box-sizing: border-box;
        position: relative;

        .priceWrapper{
            width: 100%;
            height: 40px;
            position: relative;
            display: inline-block;
            input{
                height: 35px;
                padding-right: 35px;
            }
         
        }
        .priceWrapperC{
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: flex-start;
            padding-right: 10px;
            height: 35px;
            width: 100%;
            box-sizing: border-box;
            height: 40px;
            border-radius: 5px;
            font-size: 14px;
            font-weight: 400;
            gap: 10px;
            color: #505050;
            background-color: #eeeeee;
            border: 1px solid lightgray;
            a{
                width: 70px;
                font-size: 12px;
            }   
            input{
            
            border: none;}
        }
        .priceWrapper::after {
            content: "zł";
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            color: #555;
            pointer-events: none; /* nie blokuje kliknięć w input */
            font-size: 12px;
        }
        .priceWrapper.b::after {
            content: "min";
            
            
        }
        .searchButtonParaInputWrapper{
            position: absolute;
            right: 0px;
            bottom: 0%;
            height: 35px;
            width: 45px;
            display: flex;
            align-items: center;
            justify-content: center;

            .searchButtonParaInput{
                height: 25px;
                width: 35px;
                background-color: #f49725;
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
                border-radius: 5px;
                cursor: pointer;
                transition: 0.3s ease-in-out;
                &:hover{
                    background-color: #e38614;
                }

            }
        }
       
        input{
            width: 100%;
            box-sizing: border-box;
            outline: none;
            border: none;
            height: 35px;
            border-radius: 5px;
            padding-left: 10px;
            font-size: 14px;
            font-weight: 400;
            color: #505050;
            background-color: #eeeeee;
            border: 1px solid lightgray;
            
            &.opened{
                border-bottom: 0;
                border-bottom-left-radius: 0;
                border-bottom-right-radius: 0;
                  box-shadow: 4px 4px 4px lightgray;
            }

        }
        .paraInputTitle{
            font-size: 14px;
            font-weight: 400;
            color: #505050;
            padding-left: 1px;
        }
        .paraInputAttrResults {
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            color: #404040;
            z-index: 999;
            pointer-events: none;
            /* początkowy stan */
            height: 0;
            min-height: 0;
            transition: 0.3s ease;   /* animacja */

            /* opcjonalnie: delikatny efekt przesuwania w dół */
            opacity: 0;
            background-color:  #eeeeee;
            box-shadow: 4px 4px 4px lightgray;
            border: 1px solid lightgray;
            border-top: 1px;
            border-bottom-left-radius: 5px;
            border-bottom-right-radius: 5px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: flex-start;
            gap: 2px;
        }
        .paraInputAttrResults.b{
            align-items: stretch;
            justify-content: center;
            gap: 15px;
            padding-top: 5px;
        }

        .paraInputAttrResults.open {
            min-height: 500px; /* docelowa wysokość */
            height: fit-content;
            opacity: 1;
            pointer-events: auto; 
        }
        .paraInputAttrResults.b.open{
            min-height: 300px;
            max-height: 500px;
            overflow-y: auto;
            div{
                flex-shrink: 0;
            }
        }

        .searchingAdressResult{
            width: 98%;
            height: 40px;
            background-color: #dadada;
            border-top-right-radius: 10px;
            border-bottom-right-radius: 10px;
            transition: 0.3s ease-in-out;
            cursor: pointer;
            display: flex;
            flex-direction: row;
            align-items: stretch;
            justify-content: flex-start;
            gap: 10px;
            .resultLeftBorder{
                width: 5px;
                transition: 0.3s ease-in-out;
                border-top-right-radius: 6px;
                border-bottom-right-radius: 6px;
                background-color: #d0d0d0;;
            }
            &:hover{
                background-color: #d4d4d4;
                .resultLeftBorder{
                    background-color: #f49725;

                }
            }
            .resultsRightContent{
                display: flex;
                flex: 1;
                flex-direction: column;
                align-items: flex-start;
                justify-content: center;
                overflow: hidden;
                
                .resultRightContentName {
                    font-size: 15px;
                    font-weight: 400;
                    white-space: nowrap;  /* zapobiega zawijaniu tekstu */
                    overflow: hidden;     /* ukrywa tekst wychodzący poza kontener */
                    text-overflow: ellipsis; /* opcjonalnie – dodaje "..." na końcu jeśli tekst nie mieści się w divie */
                    overflow: hidden;
                }
                .resultRightContentDesc{
                     font-size: 13px;
                     text-wrap: no-wrap;
                    overflow: hidden;
                
                }

            }

        }
    }
    .addButtonOwn{
        width: 100%;
        border-radius: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 35px;
        background-color: red;
        background-color: #e3e7ff;
        transition: 0.3s ease;
        cursor: pointer;
        border: 1px solid #c1c5dd;
        &:hover{
            background-color: #d2d6ee;
        }
    }
`
function maxDoDrugiegoPrzecinka(str) {
    const parts = str.split(',');
    return parts.length > 2 ? parts.slice(0, 2).join(',') : str;
}
export const OwnAttraction = ({ miejsceDocelowe="Poznan", setModAct, modActIdx, dayIndex, closePanel, addActivity, wybraneMiasto }) => {
    const [searchingAdressValue, setSearchingAdressValue] = useState("");
    const [searchingLocationValue, setSearchingLocationValue] = useState("");
    const [creatingNameValue, setCreatingNameValue] = useState("");
    const [searchingAdressOpened, setSearchingAdressOpened] = useState(false);
    const [searchingAdressResults, setSearchingAdressResults] = useState([]);
    const [searchingLocationResults, setSearchingLocationResults] = useState([]);
    const [searchingLocationOpened, setSearchingLocationOpened] = useState(false);
    const [creatingTime, setCreatingTime] = useState(60)
    const [ownAttraction, setOwnAttracion] = useState({})
    const [creatingPriceValue, setCreatingPriceValue] = useState(0)
    const containerRef = useRef(null);
    const [alerts, setAlerts] = useState([])
    // zamykanie dropdownu po kliknięciu poza nim
    const locationRef = useRef(null);
    const addressRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (locationRef.current && !locationRef.current.contains(e.target)) {
                setSearchingLocationOpened(false);
            }
            if (addressRef.current && !addressRef.current.contains(e.target)) {
                setSearchingAdressOpened(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    useEffect(() => {
        if (ownAttraction?.adres) {
            setSearchingAdressValue(ownAttraction?.adres)
            setSearchingAdressOpened(false)
        }

    }, [ownAttraction])

    useEffect(() => {
        setOwnAttracion(prev => ({
            ...prev,
            nazwa: creatingNameValue
        }))
    }, [creatingNameValue])

    useEffect(() => {
        setOwnAttracion(prev => ({
            ...prev,
            cenaZwiedzania: creatingPriceValue,
        }))
    }, [creatingPriceValue])
    useEffect(() => {
        setOwnAttracion(prev => ({
            ...prev,
            czasZwiedzania: creatingTime,
        }))
    }, [creatingTime])

    // >>> nowa funkcja wywołująca backend
    const handleSearchAddress = async () => {
        const query = searchingAdressValue.trim();
        if (!query) {
            setSearchingAdressResults([]);
            return;
        }
        try {
            const resp = await fetch(
                `http://localhost:5006/geocode?address=${encodeURIComponent(query)}`
            );
            if (!resp.ok) throw new Error("Błąd serwera");
            const data = await resp.json();
            console.log("TEST6", data)
            setSearchingAdressResults(data);
        } catch (err) {
            console.error("Geocode error:", err);
        }
    };
    const handleSearchLocation = async () => {
        const query = searchingLocationValue.trim();
        if (!query) {
            setSearchingLocationResults([]);
            return;
        }
        console.log("TEST20", encodeURIComponent(query + " " + miejsceDocelowe))
        try {
            const resp = await fetch(
                `http://localhost:5006/searchPlaces?query=${encodeURIComponent(query + " " + miejsceDocelowe)}`
            );
            if (!resp.ok) throw new Error("Błąd serwera");
            const data = await resp.json();
            console.log("TEST60", data)
            setSearchingLocationResults(data);
        } catch (err) {
            console.error("Geocode error:", err);
        }
    };
 

    function addActivityLocal() {
        if (!ownAttraction?.nazwa || ownAttraction?.nazwa == null) {
            setAlerts(prev => [
                ...prev,
                { tresc: "Dodaj nazwę aktywności", success: 0 }
            ]);
            return
        }
        if (!ownAttraction?.adres || ownAttraction?.adres == null) {
            setAlerts(prev => [
                ...prev,
                { tresc: "Dodaj adres aktywności", success: 0 }
            ]);
            return
        }
        if (!ownAttraction?.lokalizacja || ownAttraction?.lokalizacja == null) {
            setAlerts(prev => [
                ...prev,
                { tresc: "Dodaj adres aktywności", success: 0 }
            ]);
            return
        }
        if (!ownAttraction?.czasZwiedzania) {
            setAlerts(prev => [
                ...prev,
                { tresc: "Dodaj cenę aktywności", success: 0 }
            ]);
            return
        }
        setAlerts(prev => [
            ...prev,
            { tresc: "Dodano " + ownAttraction.nazwa + " do planu wyjazdu", success: 1 }
        ]);

        setModAct({ flag: false, dayIdx: null, idx: null });
        if (!modActIdx && modActIdx !== 0) {
            addActivity(dayIndex, ownAttraction);
        } else {
            addActivity(dayIndex, modActIdx, ownAttraction);
            closePanel();
        }


    }
    function deleteAlert(idx) {
        setAlerts(prevAlerts => prevAlerts.filter((_, i) => i !== idx));
    }
    useEffect(() => {

        if (!searchingAdressValue) {
            setSearchingAdressResults([])
        }
    }, [searchingAdressValue])

    
    async function dodajAtrakcjeDoBazy(atrakcja) {
        addActivity(dayIndex, atrakcja);
        try {
            const response = await fetch("http://localhost:5006/addAttraction", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(atrakcja),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("Błąd przy dodawaniu atrakcji:", data.error);
                return;
            }

            console.log("Atrakcja dodana pomyślnie:", data.attraction);
        } catch (err) {
            console.error("Błąd sieci:", err);
        }
    }
    return (
        <OwnAttractionMainbox>
            <div className="alertsBox">
                {alerts && alerts.map((alert, idx) => (
                    alert.success ?
                        <SuccessAlert key={idx}>
                            <div className="successAlertIcon">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                    className="w-6 h-6"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m4.5 12.75 6 6 9-13.5"
                                    ></path>
                                </svg>
                            </div>
                            <div className="successAlertTextbox">
                                <div className="successAlertTitle">
                                    Sukces!
                                </div>
                                <div className="successAlertDesc">
                                    {alert.tresc}
                                </div>
                            </div>
                            <div className="successAlertCloseButton" onClick={() => deleteAlert(idx)}>
                                <img src="../icons/icon-close-white.svg" height={'20px'} />
                            </div>
                        </SuccessAlert>
                        :
                        <SuccessAlert key={idx} className="c" >
                            <div className="successAlertIcon">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                    className="w-6 h-6"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M16 16L12 12M12 12L8 8M12 12L16 8M12 12L8 16"
                                    >
                                    </path>
                                </svg>

                            </div>
                            <div className="successAlertTextbox">
                                <div className="successAlertTitle">
                                    Błąd przy dodawaniu aktywności
                                </div>
                                <div className="successAlertDesc">
                                    {alert.tresc}
                                </div>
                            </div>
                            <div className="successAlertCloseButton" onClick={() => deleteAlert(idx)}>
                                <img src="../icons/icon-close-white.svg" height={'20px'} />
                            </div>
                        </SuccessAlert>


                ))}
            </div>

            <OwnAttractionContent>
                <OwnAttractionRight>
                    <div className="ownAttrTitle">
                        <img src="../icons/fileSearch.svg" height="30px" />
                    </div>
                    <div className="paraInputAttr" ref={locationRef}>
                        <div className="paraInputTitle">
                            Wyszukaj aktywność na mapie
                        </div>
                        <input
                            placeholder="Adres"
                            className={searchingLocationOpened ? "opened" : ""}
                            type="text"
                            value={searchingLocationValue}
                            onFocus={() => setSearchingLocationOpened(true)}
                            onChange={(e) => setSearchingLocationValue(e.target.value)}

                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleSearchLocation();   // ← wysyłka zapytania po Enter
                                }
                            }}
                        />
                        <div className="searchButtonParaInputWrapper">
                            <div className="searchButtonParaInput" onClick={() => handleSearchLocation()}>
                                <img src="../icons/icon-search.svg" height={'20px'} />
                            </div>
                        </div>
                        <div
                            className={`paraInputAttrResults b ${searchingLocationOpened ? "open" : ""}`}
                        >

                            {!searchingLocationResults.length &&
                                <div className="emptyResults">
                                    <Loader />
                                    <a>Wyszukaj aktywność</a>
                                </div>
                            }

                            {searchingLocationOpened && searchingLocationResults.map((res, idx) => (


                                <AtrakcjaResultMid key={res.googleId}>
                                    <div className="mapBox" style={{ pointerEvents: "none" }}>
                                        <LeafletMap
                                            lat={res?.lokalizacja?.lat || 52.5333}
                                            lng={res?.lokalizacja?.lng || 16.9252}
                                            zoom={11}
                                        />
                                    </div>
                                    <div className="titleBox">
                                        <img src="../icons/castle.svg" height="15px" />
                                        {res.nazwa}
                                    </div>
                                    <div className="adresBox">
                                        <img src="../icons/icon-adres.svg" height="15px" />
                                        {res.adres}
                                    </div>
                                    <div className="ratingBox">
                                        <StarRating rating={res.ocena} />
                                        {res.ocena} <a>({res.liczbaOpinie})</a>
                                    </div>
                                    <div className="timeBox">
                                        <img src="../icons/icon-time.svg" height="15px" />
                                        {res?.czasZwiedzania || "60min"}
                                    </div>
                                    <div className="timeBox">
                                        <img src="../icons/icon-ticket.svg" height="15px" />
                                        {res?.cenaZwiedzania || "Bezpłatne"}
                                    </div>
                                    <div className="buttonsBox">
                                        <div
                                            className="operationButton a"
                                            onClick={() => dodajAtrakcjeDoBazy(res)}
                                        >
                                            <img src="../icons/icon-plus.svg" height="20px" />
                                        </div>
                                        <div
                                            className="operationButton b"
                                        >
                                            <img src="../icons/icon-serce.svg" height="20px" />
                                        </div>
                                        <div className="operationButton c">
                                            <img src="../icons/icon-mark1.svg" height="20px" />
                                        </div>
                                    </div>
                                </AtrakcjaResultMid>


                            ))}
                        </div>

                    </div>
                </OwnAttractionRight>

                <OwnAttractionBorder />

                <OwnAttractionRight>
                    <div className="ownAttrTitle">
                        <img src="../icons/pencil-gray.svg" height="30px" />
                    </div>

                    <div className="paraInputAttr">
                        <div className="paraInputTitle">
                            Nazwa
                        </div>
                        <input
                            placeholder="Nazwa"
                            type="text"
                            value={creatingNameValue}
                            onChange={(e) => setCreatingNameValue(e.target.value)}
                        />
                    </div>

                    <div className="paraInputAttr" ref={addressRef}>
                        <div className="paraInputTitle">
                            Adres (wyszukiwanie)
                        </div>
                        <input
                            placeholder="Adres"
                            className={searchingAdressOpened ? "opened" : ""}
                            type="text"
                            value={searchingAdressValue}
                            onFocus={() => setSearchingAdressOpened(true)}
                            onChange={(e) => setSearchingAdressValue(e.target.value)}

                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleSearchAddress();   // ← wysyłka zapytania po Enter
                                }
                            }}
                        />
                        <div className="searchButtonParaInputWrapper">
                            <div className="searchButtonParaInput" onClick={() => handleSearchAddress()}>
                                <img src="../icons/icon-search.svg" height={'20px'} />
                            </div>
                        </div>
                        <div
                            className={`paraInputAttrResults ${searchingAdressOpened ? "open" : ""}`}
                        >

                            {!searchingAdressResults.length &&
                                <div className="emptyResults">
                                    <Loader />
                                    <a>Wyszukaj adres...</a>
                                </div>
                            }

                            {searchingAdressOpened && searchingAdressResults.map((res, idx) => (

                                <div className="searchingAdressResult" key={idx}
                                    onClick={() =>
                                        setOwnAttracion(prev => ({
                                            ...prev,
                                            adres: maxDoDrugiegoPrzecinka(res.displayName),
                                            lokalizacja: {
                                                lat: res.lat,
                                                lng: res.lon,
                                            }
                                        }))
                                    }
                                >
                                    <div className="resultLeftBorder" />
                                    <div className="resultsRightContent">
                                        <div className="resultRightContentName">
                                            {maxDoDrugiegoPrzecinka(res.displayName)}
                                        </div>
                                        <div className="resultRightContentDesc">
                                            {res.city}, {res.country}
                                        </div>
                                    </div>

                                </div>

                            ))}
                        </div>

                    </div>
                    <div className="paraInputAttr">
                        <div className="paraInputTitle">
                            Cena aktywności / 1 os
                        </div>
                        <div className="priceWrapper">
                            <input
                                placeholder="Cena zwiedzania"
                                type="number"
                                value={creatingPriceValue}
                                onChange={(e) => setCreatingPriceValue(e.target.value)}
                            />

                        </div>
                    </div>
                    <div className="paraInputAttr">
                        <div className="paraInputTitle">
                            Przeznaczony czas
                        </div>
                        <div className="priceWrapperC">
                            <input
                                type="range"
                                max="360"
                                step="10"
                                value={creatingTime}
                                onChange={(e) => setCreatingTime(e.target.value)}
                            />
                            <a>
                                {minutesToStringTime(creatingTime)}
                            </a>
                        </div>
                    </div>
                    <div className="addButtonOwn" onClick={() => addActivityLocal()}>
                        <img src="../icons/icon-plus.svg" height="20px" />
                    </div>
                </OwnAttractionRight>
            </OwnAttractionContent>
        </OwnAttractionMainbox>
    );
};
