import { useEffect, useState } from "react"
import styled from "styled-components";
import Radio1 from "./roots/radio1";
import Loader from "./roots/loader";
import GoogleMapViewer, { LeafletMap } from "./roots/googleMapViewer";
import { GoogleMap } from "@react-google-maps/api";
import MonthCalendarSquare from "./monthCalendar";
import { format } from "url";

const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};
const KonfiguratorMainbox = styled.div`
    width: 100%;
    max-width: 1200px;
    min-height: 300px;
    background-color: #fafafa;
    border-radius: 25px;
    border: 1px solid lightgray;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    

    a{
        font-size: 20px;
    }
        .nextEventQuestion{
            font-weight: 200;
            font-size: 26px;
            color: #a0a0a0;
        }
`
const KonfiguratorNavBar = styled.div`
    width: 100%;
    height: 80px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 5px;

`

const KonfiguratorNavElement = styled.div`
    min-width: 60px;
    height: 40px;
     display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    border-radius: 5px;
    background-color: white;
    border: ${props => props.finished ? props => props.chosen ? "2px solid #cc7200" : "2px solid #ffa500" : props => props.chosen ? "1px solid gray" : "1px solid lightgray"};
    box-shadow: ${props => props.finished ? "0" : props => props.chosen ? "2px 2px 2px gray" : "2px 2px 2px lightgray"};
    cursor: pointer;
    color: #505050;
    font-weight: 400;
    transition: 0.3s ease-in-out;

    &:hover{
        border: ${props => props.finished ? "2px solid #cc7200" : "1px solid gray"}
    }
`
const KonfiguratorOpisyBox = styled.div`
    padding: 10px;
    border-radius: 10px;
    width: 95%;
    max-width: 600px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin: 10px;
    box-sizing: border-box;
`
const KonfiguratorOpisy = styled.div`

    width: 100%;
    min-height: 50px;
    display: flex;
    flex-direction: row;
    align-items: stretch;
    justify-content: center;
    gap: 10px;
    padding: 10px;
    box-sizing: border-box;
    border-left: 2px solid orange;

`
const KonfiguratorOpisyIcon = styled.div`

width: 50px;
height: 50px;
display: flex;
align-items: center;
jusitfy-content: center;
`
const KonfiguratorOpisyTeksty = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    text-align: left;
    .konfiguratorOpisyTekstNazwa{
       font-size: 22px;
       font-weight: 300;
       color: #606060;
    }
    .konfiguratorOpisyTekstTekst{
        font-size: 16px;
        font-weight: 300;
        color: #505050;
        
    }
`

const KonfiguratorOpis = ({ icon = "../icons/icon-info.svg", nazwa = "Rower", tekst = "Rower jest najszybszy i wgl" }) => {
    return (

        <KonfiguratorOpisy>
            <KonfiguratorOpisyIcon>
                <img src={icon} width={'100%'} />
            </KonfiguratorOpisyIcon>
            <KonfiguratorOpisyTeksty>
                <div className="konfiguratorOpisyTekstNazwa">
                    {nazwa}
                </div>
                <div className="konfiguratorOpisyTekstTekst">
                    {tekst}
                </div>
            </KonfiguratorOpisyTeksty>
        </KonfiguratorOpisy>

    )
}


const SearchBoxMainbox = styled.div`
    width: 95%;
    max-width: 600px;
    min-height: 50px;
    background-color: white;
    box-sizing: border-box;
    border-radius: ${props => !props.klasa ? "15px" : ""};

    border-top-right-radius: 15px;
    border-top-left-radius: 15px;
    border: 1px solid lightgray;
    border-bottom: ${props => !props.klasa ? "" : "0px solid black;"};
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: stretch;
    position: relative;
    z-index: 10000;
    box-sizing: border-box;
    box-shadow: ${props => !props.klasa ? "" : "4px 4px 4px lightgray"};


    input{
    flex: 1;
    border: none;
    outline: none;
    border-radius: 15px;
    padding-left: 10px;
    
    
    }
    input:disabled{
        background-color: white;
        cursor: not-allowed;
    }
    .button{
    width: 60px;
    height: 40px;
    border:none;
    margin: auto 10px;
    border-radius: 10px;
    background-color: orange;
    color: red;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: 0.3s ease-in-out;
    position: relative;
    }
    .button.disabled{
        background-color: gray;
    }
    .button:hover{
    
    }
    .popup{
    position: absolute;
    width: 100%;
    min-height: 100px;
    background-color: white;
    top: 49px;
    border-bottom-left-radius: 15px;
    border-bottom-right-radius: 15px;
      border: 1px solid lightgray;
      border-top: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: 5px;
    padding: 10px;
    box-sizing: border-box;
    box-shadow: 4px 4px 4px lightgray;
    }
    
`
export const PopupResult = styled.div`
     width: 100%;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        border-radius: 5px;
        padding: 5px 20px; 
        box-sizing: border-box;
        cursor: pointer;
        transition: 0.3s ease-in-out;
        border-left: 2px solid orange;
        background-color: #fcfcfc;
        z-index: 99999;
        position: relative;
        &:hover{
        border-left: 5px solid orange;
        background-color: #f4f4f4;

    }
        @media screen and (max-width: 800px){
        width: 90%;}
    .popupResultTitle{
    font-size: 18px;
    border-left: 17px;
    font-weight: 300;   

    }
    .popupResultSubtitle{
        font-size: 14px;
        font-weight: 300;   
    }
    
    
`
const MapWrapper = styled.div`
  width: 100%;
  height: 400px; // <-- wysokość musi być określona
  margin-top: 10px;
`;
const testResults = [
    { nazwa: "Poznań", region: "Wielkopolska", kraj: "Polska" },
    { nazwa: "Luboń koło Poznania", region: "Wielkopolska", kraj: "Polska" },
    { nazwa: "Poznań", region: "Lubelskie", kraj: "Polska" },
    { nazwa: "Druzyna Poznańska", wojewodztwo: "Wielkopolska", kraj: "Polska" }


]
export const SearchBox = ({ placeholder = "Wyszukaj miasto", value = "", onChange, results = { testResults }, searchAction, disabled = "" }) => {

    const [popupOpen, setPopupOpen] = useState(false)

    return (
        <SearchBoxMainbox klasa={popupOpen && !disabled ? 1 : 0} onClick={() => setPopupOpen(!popupOpen)}>
            <input placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} />
            <div className={disabled ? "button disabled" : "button"}><img src="../icons/icon-search.svg" height={'70%'} />

            </div>

            {
                popupOpen && !disabled &&
                <div className="popup">
                    {results && results[0]?.kraj != "brak" && results.map((res, idx) => {
                        return (

                            <PopupResult onClick={() => searchAction(res)} key={idx}>
                                <div className="popupResultTitle">
                                    {res.nazwa}
                                </div>
                                <div className="popupResultSubtitle">
                                    {res.wojewodztwo}, {res.kraj}
                                </div>
                            </PopupResult>


                        )

                    }
                    )}
                    {results?.length === 0 && <Loader />}
                    {<a style={{ color: "gray", fontWeight: "200", fontSize: "14px" }}>{results[0]?.kraj === "brak" && "Brak wyników dla " + value}</a>}
                </div>
            }
        </SearchBoxMainbox>
    )
}
export const MapaBox = styled.div`
margin-top: 10px;
width: 95%;
    max-width: 600px;
    height: 300px;
    border-radius: 15px;
    overflow: hidden;
    box-sizing: border-box;
    .brakMapy{
    width: 100%;
    height: 100%;
    background-color: #f2f2f2;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #b0b0b0;
    font-size: 24px;
    font-weight: 400;
    

    }
`

export const MapaResultBox = styled.div`
 box-sizing: border-box;
    width: 100%;
    max-width: 600px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    margin: 10px auto;
    .changeInfo{
        color: #ffa60000;
        transition: 0.2s ease-in-out;
        width: 100%;
        font-size: 12px;
        font-weight: 200;
    }
        .changeInfo.hovered{
            color: #202020;
        }
    
`

const DataWyborMainbox = styled.div`
    width: 95%;
    max-width: 600px;
    min-height: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 20px;
    .monthCalendarOutbox{
        width: 250px;
        height: 250px;
    }
    input{
        width: 300px;
        height: 40px;
        font-family: Inter, system-ui, -apple-system, sans-serif;
        font-weight: 300;
        padding: 0px 10px;
        border-radius: 15px;
        border: 1px solid gray;
        outline: none;
        border: 1px solid lightgray;
    }
        input:focus {
  border: 1px solid #d0d0d0; /* kolor i grubość obramowania */
  box-shadow: 0 0 2px black; /* opcjonalny cień */
}
`
const InputPair = styled.div`
display: flex;
flex-direction: column;
align-items: flex-start;
justify-content: center;
gap: 2px;
a{
    font-size: 12px;
    margin-left: 15px;
    
}
`
const FinishButton = styled.div`
    width: 100%;
    background-color: black;
    color: white;
    border-radius: 2222px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    min-height: 40px;
    font-weight: 300;
    cursor: pointer;
    gap: 5px;
    transition: 0.5s ease-in-out;
    &:hover{
        background-color: #dd8311;
    }
`

export const DataWybor = ({ dataStart, dataEnd, setDataStart, setDataEnd }) => {

    const today = new Date();
    const currentMonth = today.getMonth() + 1; // 1–12
    const currentYear = today.getFullYear();

    return (
        <DataWyborMainbox>
            <InputPair>
                <a>Data wyjazdu</a>
                <input
                    type="date"
                    value={formatDate(dataStart)}
                    onChange={(e) => {
                        if (!e.target.value) {
                            setDataStart(null);
                            return;
                        }
                        const [year, month, day] = e.target.value.split("-").map(Number);
                        const newDate = new Date(year, month - 1, day);
                        setDataStart(newDate);
                    }}
                />
            </InputPair>
            <InputPair>
                <a>Data powrotu</a>

                <input
                    type="date"
                    value={formatDate(dataEnd)}
                    onChange={(e) => {
                        if (!e.target.value) {
                            setDataEnd(null);
                            return;
                        }
                        const [year, month, day] = e.target.value.split("-").map(Number);
                        const newDate = new Date(year, month - 1, day);
                        setDataEnd(newDate);
                    }}
                />
            </InputPair>


            <div className="monthCalendarOutbox">
                <MonthCalendarSquare year={currentYear} month={currentMonth} dateEnd={dataEnd} dateStart={dataStart} setDateStart={setDataStart} setDateEnd={setDataEnd} />
            </div>



        </DataWyborMainbox>
    )
}
export const KonfiguratorWyjazdu = ({ }) => {
    //miejsce docelowe
    const [miejsceDoceloweSearching, setMiejsceDoceloweSearching] = useState("");
    const [miejsceDoceloweResults, setMiejsceDoceloweResults] = useState(testResults)
    const [miejsceDocelowe, setMiejsceDocelowe] = useState("");
    //miejsce rozpoczecia
    const [miejsceStartSearching, setMiejsceStartSearching] = useState("");
    const [miejsceStartResults, setMiejsceStartResults] = useState(testResults)
    const [miejsceStart, setMiejsceStart] = useState("");

    const [dataWyjazdu, setDataWyjazdu] = useState(null);
    const [dataPowrotu, setDataPowrotu] = useState(null);
    const [standardHotelu, setStandardHotelu] = useState("");
    const [formaTransportu, setFormaTransportu] = useState("")
    const [liczbaUczestnikow, setLiczbaUczestnikow] = useState(0)
    const [liczbaOpiekunów, setLiczbaOpiekunów] = useState(0)

    const [chosenStep, setChosenStep] = useState(0)
    const [oneFilled, setOneFilled] = useState([false, false, false, false, false])
    const [formFinished, setFormFinished] = useState(false);
    const nextStep = (n) => {
        if (n == 1) {
            miejsceDocelowe ? setChosenStep(1) : setChosenStep(0);
        }
        if (n == 2) {
            miejsceStart ? setChosenStep(n) : nextStep(n - 1);
        }
        if (n == 3) {
            dataWyjazdu && dataPowrotu ? setChosenStep(n) : nextStep(n - 1);
        }
        if (n == 4) {
            standardHotelu ? setChosenStep(n) : nextStep(n - 1);
        }

    }
    const submitMiejsceDocelowe = (miejsceDoceloweWybor) => {
        setMiejsceDocelowe(miejsceDoceloweWybor);
        setMiejsceDoceloweSearching("")
        setMiejsceDoceloweResults([])

    }
    const submitMiejsceStart = (miejsceDoceloweWybor) => {
        setMiejsceStart(miejsceDoceloweWybor);
        setMiejsceStartSearching("")
        setMiejsceStartResults([])

    }


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
    useEffect(() => {
        if (!miejsceStartSearching) return;

        // 1. od razu czyścimy poprzednie wyniki
        setMiejsceStartResults([]);

        // 2. ustawiamy timer
        const timeoutId = setTimeout(async () => {
            try {
                const response = await fetch(
                    `http://localhost:5006/searchCity?query=${encodeURIComponent(
                        miejsceStartSearching
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

                    setMiejsceStartResults(resultsWithPlaceId);
                }
                else { setMiejsceStartResults([{ kraj: "brak" }]) }// <-- zapisanie wyników

            } catch (error) {
                console.error("Błąd pobierania danych:", error);
            }
        }, 1000); // 1000ms = 1s

        // 3. czyszczenie timera przy zmianie inputa
        return () => clearTimeout(timeoutId);
    }, [miejsceStartSearching]);

    useEffect(() => {
        setHovering(false)
    }, [chosenStep])

    useEffect(() => {
        if (miejsceDocelowe) {
            localStorage.setItem("miejsceDocelowe", JSON.stringify(miejsceDocelowe));
        }
    }, [miejsceDocelowe]);

    const [hovering, setHovering] = useState(false);
    const pola = [
        <>
            <SearchBox value={miejsceDoceloweSearching} onChange={setMiejsceDoceloweSearching} results={miejsceDoceloweResults} searchAction={submitMiejsceDocelowe} disabled={miejsceDocelowe} />
            {miejsceDocelowe && <>
                <MapaBox key={`docelowe-${miejsceDocelowe.nazwa}`} >
                    <LeafletMap lat={miejsceDocelowe?.location?.lat || 52.5333} lng={miejsceDocelowe?.location?.lng || 16.9252} zoom={9}
                    />

                </MapaBox>
                <MapaResultBox>


                    <PopupResult onClick={() => setMiejsceDocelowe("")} onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}>
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
                    <div className={hovering ? "changeInfo hovered" : "changeInfo"}>
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

        </>,

        <>
            <SearchBox value={miejsceStartSearching} onChange={setMiejsceStartSearching} results={miejsceStartResults} searchAction={submitMiejsceStart} disabled={miejsceStart} />
            {miejsceStart && <>
                <MapaBox key={`start-${miejsceStart.nazwa}`}>
                    <LeafletMap lat={miejsceStart?.location?.lat || 52.5333} lng={miejsceStart?.location?.lng || 16.9252} zoom={9} />

                </MapaBox>

                <MapaResultBox>


                    <PopupResult onClick={() => setMiejsceStart("")} onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}>
                        <div className="popupResultTitle">
                            {miejsceStart.nazwa}
                        </div>
                        <div className="popupResultSubtitle">
                            {miejsceStart.wojewodztwo}, {miejsceStart.kraj}
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
                    <div className={hovering ? "changeInfo hovered" : "changeInfo"}>
                        kliknij aby zmienić lokalizację
                    </div>
                </MapaResultBox>

            </>}
            {!miejsceStart &&
                <MapaBox>
                    <div className="brakMapy">
                        Wyszukaj lokalizacje w polu wyszukiwania
                        <img src="../icons/icon-location-gray.svg" width={'100px'} />
                    </div>
                </MapaBox>}
        </>,
        <>
            <DataWybor dataStart={dataWyjazdu} dataEnd={dataPowrotu} setDataEnd={setDataPowrotu} setDataStart={setDataWyjazdu} />
        </>,
        <>
            <Radio1
                setWybor={setStandardHotelu}
                value={standardHotelu}
                name="hotel-standard"
            />


        </>,
        <>
            <Radio1
                options={[
                    { icon: "../icons/icon-private-bus.svg", label: "Wynajęty autokar" },
                    { icon: "../icons/icon-public-trannsport.svg", label: "Transport publiczny" },
                    { icon: "../icons/icon-own-transport.svg", label: "Własny" }
                ]}
                setWybor={setFormaTransportu}
                value={formaTransportu}
                name="transport-form"
            />
        </>,
        <Loader />

    ]
    const opisy = [[{ icon: "../icons/destination-gray.svg", nazwa: "Miejsce docelowe", tekst: "Wybierz miejsce docelowe, które planujecie zwiedzić. Naturalnie nic nie stoi na przeszkodzie, zeby wyjeżdżać poza jego obszar. Nasz system jest elastycznym narzędziem pozwalającym ustalić dowolny harmonogram atrakcji!" }],
    [{ icon: "../icons/start-gray.svg", nazwa: "Miejsce rozpoczęcia wyjazdu", tekst: "Wybierz miejsce docelowe, które planujecie zwiedzić. Naturalnie nic nie stoi na przeszkodzie, zeby wyjeżdżać poza jego obszar. Nasz system jest elastycznym narzędziem pozwalającym ustalić dowolny harmonogram atrakcji!" }],
    [{ icon: "../icons/upcoming.svg", nazwa: "Data wyjazdu i data powrotu", tekst: "Wybierz miejsce docelowe, które planujecie zwiedzić. Naturalnie nic nie stoi na przeszkodzie, zeby wyjeżdżać poza jego obszar. Nasz system jest elastycznym narzędziem pozwalającym ustalić dowolny harmonogram atrakcji!" }],
    [{ icon: "../icons/osrodek-gray.svg", nazwa: "Ośrodki kolonijne", tekst: "Wybierz miejsce docelowe, które planujecie zwiedzić. Naturalnie nic nie stoi na przeszkodzie, zeby wyjeżdżać poza jego obszar. Nasz system jest elastycznym narzędziem pozwalającym ustalić dowolny harmonogram atrakcji!" }, { icon: "../icons/icon-hotel.svg", nazwa: "Hotele 2/3 gwiazdkowe", tekst: "Wybierz miejsce docelowe, które planujecie zwiedzić. Naturalnie nic nie stoi na przeszkodzie, zeby wyjeżdżać poza jego obszar. Nasz system jest elastycznym narzędziem pozwalającym ustalić dowolny harmonogram atrakcji!" }, { icon: "../icons/iconHotelFive-gray.svg", nazwa: "Hotele premium", tekst: "Wybierz miejsce docelowe, które planujecie zwiedzić. Naturalnie nic nie stoi na przeszkodzie, zeby wyjeżdżać poza jego obszar. Nasz system jest elastycznym narzędziem pozwalającym ustalić dowolny harmonogram atrakcji!" }],
    [{ icon: "../icons/bus-gray.svg", nazwa: "Autokar", tekst: "Wybierz miejsce docelowe, które planujecie zwiedzić. Naturalnie nic nie stoi na przeszkodzie, zeby wyjeżdżać poza jego obszar. Nasz system jest elastycznym narzędziem pozwalającym ustalić dowolny harmonogram atrakcji!" }, { icon: "../icons/publicTransport-gray.svg", nazwa: "Transport publiczny", tekst: "Wybierz miejsce docelowe, które planujecie zwiedzić. Naturalnie nic nie stoi na przeszkodzie, zeby wyjeżdżać poza jego obszar. Nasz system jest elastycznym narzędziem pozwalającym ustalić dowolny harmonogram atrakcji!" }, { icon: "../icons/ownTransport-gray.svg", nazwa: "Własny", tekst: "Wybierz miejsce docelowe, które planujecie zwiedzić. Naturalnie nic nie stoi na przeszkodzie, zeby wyjeżdżać poza jego obszar. Nasz system jest elastycznym narzędziem pozwalającym ustalić dowolny harmonogram atrakcji!" }],

    ]

    const setChosenStepVal = (num) => {
        setChosenStep(num);

    }


    useEffect(() => {

        if (miejsceDocelowe && !oneFilled[0]) {
            const timer1 = setTimeout(() => setChosenStep(5), 1000);
            const timer2 = setTimeout(() => nextStep(1), 3000);
            setOneFilled(prev => {
                const newState = [...prev];
                newState[0] = true;
                return newState;
            });
            return () => {
                clearTimeout(timer1);
                clearTimeout(timer2);
            };
        }
        else if (miejsceDocelowe) {
            nextStep(1);
        }
    },
        [miejsceDocelowe]);
    useEffect(() => {
        if (miejsceStart && !oneFilled[1]) {
            const timer1 = setTimeout(() => setChosenStep(5), 1000);
            const timer2 = setTimeout(() => nextStep(2), 3000);

            setOneFilled(prev => {
                const newState = [...prev];
                newState[1] = true;
                return newState;
            });

            return () => {
                clearTimeout(timer1);
                clearTimeout(timer2);
            };
        } else if (miejsceStart) {
            nextStep(2);
        }
    }, [miejsceStart]);

    useEffect(() => {
        if (dataWyjazdu && dataPowrotu && !oneFilled[2]) {
            const timer1 = setTimeout(() => setChosenStep(5), 1000);
            const timer2 = setTimeout(() => nextStep(3), 3000);

            setOneFilled(prev => {
                const newState = [...prev];
                newState[2] = true;
                return newState;
            });

            return () => {
                clearTimeout(timer1);
                clearTimeout(timer2);
            };
        } else if (dataWyjazdu && dataPowrotu) {
            nextStep(3);
        }
    }, [dataWyjazdu, dataPowrotu]);

    useEffect(() => {
        if (standardHotelu && !oneFilled[3]) {
            const timer1 = setTimeout(() => setChosenStep(5), 1000);
            const timer2 = setTimeout(() => nextStep(4), 3000);

            setOneFilled(prev => {
                const newState = [...prev];
                newState[3] = true;
                return newState;
            });

            return () => {
                clearTimeout(timer1);
                clearTimeout(timer2);
            };
        } else if (standardHotelu) {
            nextStep(4);
        }
    }, [standardHotelu]);


    useEffect(() => {
        if (miejsceDocelowe && miejsceStart && dataWyjazdu && dataPowrotu && standardHotelu && formaTransportu) setFormFinished(true);
        else setFormFinished(false)

    }, [miejsceDocelowe, miejsceStart, dataWyjazdu, dataPowrotu, standardHotelu, formaTransportu])

    return (
        <KonfiguratorMainbox>

            <KonfiguratorNavBar>
                <KonfiguratorNavElement onClick={() => setChosenStepVal(0)} chosen={chosenStep === 0 ? 1 : 0} finished={miejsceDocelowe ? 1 : 0}>1</KonfiguratorNavElement>
                <KonfiguratorNavElement onClick={() => nextStep(1)} chosen={chosenStep === 1 ? 1 : 0} finished={miejsceStart ? 1 : 0}>2</KonfiguratorNavElement>
                <KonfiguratorNavElement onClick={() => nextStep(2)} chosen={chosenStep === 2 ? 1 : 0} finished={dataWyjazdu && dataPowrotu ? 1 : 0}>3</KonfiguratorNavElement>
                <KonfiguratorNavElement onClick={() => nextStep(3)} chosen={chosenStep === 3 ? 1 : 0} finished={standardHotelu ? 1 : 0}>4</KonfiguratorNavElement>
                <KonfiguratorNavElement onClick={() => nextStep(4)} chosen={chosenStep === 4 ? 1 : 0} finished={formaTransportu ? 1 : 0}> 5</KonfiguratorNavElement>

            </KonfiguratorNavBar>

            {
                <>
                    {pola[chosenStep % pola.length]}
                    {chosenStep == 5 ? <div className="nextEventQuestion">Mamy kolejne pytanie...</div> : ""}

                </>





            }

            <KonfiguratorOpisyBox>
                {formFinished &&
                    <FinishButton>
                        Przejdz do konfiguratora <img src="../icons/gears-white-2.svg" width={'30px'} />
                    </FinishButton>
                }
                {
                    opisy[chosenStep % opisy.length].map((opis, opisIdx) => (
                        <KonfiguratorOpis
                            key={`${opisIdx}`}
                            icon={opis.icon}
                            nazwa={opis.nazwa}
                            tekst={opis.tekst}
                        />
                    ))
                }
            </KonfiguratorOpisyBox>




        </KonfiguratorMainbox>
    )
}