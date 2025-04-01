import React, { useState, useEffect, useRef } from 'react';
import axios from "axios";
import styled from 'styled-components';
import TopKreatorSlider from './topKreatorSlider';
import BookingDatePicker from './wybordaty';
import BookingGuestsPicker from './uczestnicyWybor';
import HotelStandardSelector from './hotelandtransport';
import TransportSelector from './transportWybor.js';
import ChromeTabs from './testkarty.js';
import { WyborPoleAtrakcja } from './wyborPoleAtrakcja.js';
import Loader from './loader.js';
import { LoadScript } from '@react-google-maps/api';
const startingHotel = {
    nazwa: "Ładowanie...",
    adres: "Ładowanie...",
    zameldowanie: "16:00",
    wymeldowanie: "11:00",
};


function initialDayObject(hotel) {
    return {
        baseActivityStart: {
            nazwa: hotel.nazwa,
            adres: hotel.adres,
            selectedTransport: "czasAutem"  // domyślny wybór
        },
        dayActivities: [],
        baseActivityEnd: { nazwa: hotel.nazwa, adres: hotel.adres },
    };
}

function minutesToTimeString(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

const znajdzIdMiasta = async (city) => {
    try {
        const response = await axios.request({
            method: 'GET',
            url: 'https://booking-com15.p.rapidapi.com/api/v1/hotels/searchDestination',
            params: { query: city },
            headers: {
                'x-rapidapi-key': '3e185849d0msh78832870d32d14dp124c7bjsn09a7015a7635',
                'x-rapidapi-host': 'booking-com15.p.rapidapi.com'
            }
        });
        return response.data.data[0].dest_id;
    } catch (error) {
        console.error('Błąd podczas wyszukiwania ID miasta:', error);
        throw error;
    }
};
let lastFetchTime = 0;

const fetchPriceInfo = async (atrakcja, miasto) => {

    const now = Date.now();
    const THROTTLE_INTERVAL = 3000; // 3 sekundy

    if (now - lastFetchTime < THROTTLE_INTERVAL) {
        console.warn("Funkcja fetchPriceInfo została zablokowana (limit 1 wywołanie na 3 sekundy)");
        return;
    }

    lastFetchTime = now;

    const prompt = `Ile kosztuje zwiedzanie ${atrakcja} w ${miasto} dla jednej osoby?`;

    try {
        const response = await axios.post('http://localhost:5002/ask', {
            question: prompt
        });
        console.log(`Cena zwiedzania dla "${atrakcja}" w "${miasto}":`, response.data.answer);
        return response.data.answer;
    } catch (error) {
        console.error("Błąd podczas wywoływania endpointa:", error);
        return null;
    }
};

const znajdzDostepneHotele = async (idMiasta = "-523642", przyjazd, wyjazd, lGosci, hStandard) => {
    const options = {
        method: 'GET',
        url: 'https://booking-com15.p.rapidapi.com/api/v1/hotels/searchHotels',
        params: {
            dest_id: idMiasta,
            search_type: 'CITY',
            arrival_date: przyjazd,
            departure_date: wyjazd,
            adults: lGosci,
            page_number: '1',
            categories_filter: hStandard,
            units: 'metric',
            temperature_unit: 'c',
            languagecode: 'pl',
            currency_code: 'PLN'
        },
        headers: {
            'x-rapidapi-key': '3e185849d0msh78832870d32d14dp124c7bjsn09a7015a7635',
            'x-rapidapi-host': 'booking-com15.p.rapidapi.com'
        }
    };

    try {
        const response = await axios.request(options);
        return response.data;
    } catch (error) {
        console.error('Błąd podczas wyszukiwania dostępnych hoteli:', error);
        throw error;
    }
};

const znajdzHotel = async (
    city = "Poznań",
    przyjazd,
    wyjazd,
    goscie,
    hStandard
) => {
    const filterStandard =
        Number(hStandard) === 1
            ? "class::0, class::1"
            : Number(hStandard) === 2
                ? "class::2, class::3"
                : "class::4, class::5";

    try {
        const idMiastaBooking = await znajdzIdMiasta(city);
        const hotele = await znajdzDostepneHotele(
            idMiastaBooking,
            przyjazd,
            wyjazd,
            goscie,
            filterStandard
        );
        return hotele;
    } catch (error) {
        console.error("Błąd w funkcji znajdzHotel:", error);
        throw error;
    }
};

async function hotelsearch(dataWyjazdu, dataPrzyjazdu, liczbaUczestnikow, liczbaOpiekunów, hotelStandard, miasto) {
    const saveName = `${new Date().toISOString().slice(0, 10)}_${dataWyjazdu}-${dataPrzyjazdu}-${liczbaUczestnikow}-${liczbaOpiekunów}-${hotelStandard}-${miasto}`;
    const prevHotele = localStorage.getItem(saveName);
    if (!prevHotele) {
        try {
            const result = await znajdzHotel(miasto, dataWyjazdu, dataPrzyjazdu, liczbaUczestnikow, hotelStandard);
            localStorage.setItem(saveName, JSON.stringify(result));
            return result;
        } catch (error) {
            console.error(`Błąd przy pobieraniu hotelu dla ${miasto}, ${dataWyjazdu}, ${dataPrzyjazdu}:`, error);
        }
    } else {
        console.log("Używam hoteli zapisanych lokalnie");
        return JSON.parse(prevHotele);
    }
    return saveName;
}

function calculateDays(dataWyjazdu, dataPrzyjazdu) {
    const start = new Date(dataPrzyjazdu);
    const end = new Date(dataWyjazdu);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

const ParametryWyjazdu = ({
    dataPrzyjazdu,
    dataWyjazdu,
    liczbaUczestnikow,
    liczbaOpiekunów,
    hotelStandard,
    rodzajTransportu,
    setDataPrzyjazdu,
    setDataWyjazdu,
    setLiczbaUczestnikow,
    setLiczbaOpiekunów,
    setHotelStandard,
    setRodzajTransportu,
}) => {
    return (
        <>

            Przyj: <input
                type="date"
                value={dataPrzyjazdu}
                onChange={(e) => setDataPrzyjazdu(e.target.value)}
            />
            Wyj: <input
                type="date"
                value={dataWyjazdu}
                onChange={(e) => setDataWyjazdu(e.target.value)}
            />
            Ucz: <input
                type="number"
                value={liczbaUczestnikow}
                onChange={(e) => setLiczbaUczestnikow(e.target.value)}
            />
            Op: <input
                type="number"
                value={liczbaOpiekunów}
                onChange={(e) => setLiczbaOpiekunów(e.target.value)}
            />
            Hot: <input
                type="number"
                value={hotelStandard}
                onChange={(e) => setHotelStandard(e.target.value)}
            />
            Trans: <input
                type="number"
                value={rodzajTransportu}
                onChange={(e) => setRodzajTransportu(e.target.value)}
            />
        </>
    );
};

export const KreatorWyjazdu = ({ tyt = "Zaplanuj Wasz wyjazd do Poznania!" }) => {
    // Inicjalizacja stanów
    const [dataPrzyjazdu, setDataPrzyjazdu] = useState(() => localStorage.getItem("dataPrzyjazdu") || "");
    const [dataWyjazdu, setDataWyjazdu] = useState(() => localStorage.getItem("dataWyjazdu") || "");

    const [liczbaUczestnikow, setLiczbaUczestnikow] = useState(10);
    const [liczbaOpiekunów, setLiczbaOpiekunów] = useState(() => localStorage.getItem("liczbaOpiekunów") || "");
    const [hotelStandard, setHotelStandard] = useState(() => localStorage.getItem("hotelStandard") || "");
    const [rodzajTransportu, setRodzajTransportu] = useState(() => localStorage.getItem("rodzajTransportu") || "");
    const [miasto, setMiasto] = useState(() => localStorage.getItem("miasto") || "Poznań");

    // Nawigacja i dane strony
    const [aktywnosciWMiescie, setAktywnosciWMiescie] = useState();
    const [wybranyDzien, setWybranyDzien] = useState(0);
    const [daysCount, setDaysCount] = useState(calculateDays(dataWyjazdu, dataPrzyjazdu));
    const [aktywnosci, setAktywnosci] = useState(() =>
        Array.from({ length: daysCount + 1 }, () => initialDayObject(startingHotel))
    );
    const [schedule, setSchedule] = useState([]);
    const [wybranyHotel, setWybranyHotel] = useState(startingHotel);

    const [visibleCount, setVisibleCount] = useState(20);

    // Zapis do localStorage
    useEffect(() => { localStorage.setItem("dataWyjazdu", dataWyjazdu); }, [dataWyjazdu]);
    useEffect(() => { localStorage.setItem("dataPrzyjazdu", dataPrzyjazdu); }, [dataPrzyjazdu]);
    useEffect(() => { localStorage.setItem("liczbaUczestnikow", liczbaUczestnikow); }, [liczbaUczestnikow]);
    useEffect(() => { localStorage.setItem("liczbaOpiekunów", liczbaOpiekunów); }, [liczbaOpiekunów]);
    useEffect(() => { localStorage.setItem("hotelStandard", hotelStandard); }, [hotelStandard]);
    useEffect(() => { localStorage.setItem("rodzajTransportu", rodzajTransportu); }, [rodzajTransportu]);
    useEffect(() => { localStorage.setItem("miasto", miasto); }, [miasto]);

    useEffect(() => {
        const lDni = calculateDays(dataWyjazdu, dataPrzyjazdu);
        setDaysCount(lDni + 1);
    }, [dataWyjazdu, dataPrzyjazdu]);

    useEffect(() => {
        setAktywnosci((prevDays) => {
            let updatedDays = [...prevDays];
            const lDni = daysCount;
            const prevLength = updatedDays.length;

            if (prevLength < lDni) {
                const newDays = Array.from(
                    { length: lDni - prevLength },
                    () => initialDayObject(wybranyHotel)
                );
                updatedDays = [...updatedDays, ...newDays];
            } else if (prevLength > lDni) {
                updatedDays = updatedDays.slice(0, lDni);
            }

            updatedDays = updatedDays.map((day, idx, arr) => {
                const newDay = {
                    ...day,
                    baseActivityStart: {
                        nazwa: wybranyHotel.nazwa,
                        adres: wybranyHotel.adres,
                        selectedTransport: day.baseActivityStart?.selectedTransport || "czasAutem"
                    },
                    baseActivityEnd: {
                        nazwa: wybranyHotel.nazwa,
                        adres: wybranyHotel.adres,
                    },
                };

                if (arr.length === 1) {
                    delete newDay.hotelActivity;
                } else {
                    if (idx === 0 || idx === arr.length - 1) {
                        newDay.hotelActivity = {
                            minGodzina: idx === 0 ? wybranyHotel.zameldowanie : wybranyHotel.wymeldowanie,
                            godzina: "23:00",
                        };
                    } else {
                        delete newDay.hotelActivity;
                    }
                }
                return newDay;
            });

            return updatedDays;
        });
    }, [daysCount, wybranyHotel]);

    // Aktualizacja baseActivityStart i baseActivityEnd przy zmianie hotelu
    useEffect(() => {
        setAktywnosci((prevDays) =>
            prevDays.map((day, idx) => {
                let updatedDay = {
                    ...day,
                    baseActivityStart: {
                        nazwa: wybranyHotel.nazwa,
                        adres: wybranyHotel.adres,
                        selectedTransport: day.baseActivityStart?.selectedTransport || "czasAutem"
                    },
                    baseActivityEnd: {
                        nazwa: wybranyHotel.nazwa,
                        adres: wybranyHotel.adres,
                    },
                };
                if (idx === 0 || idx === prevDays.length - 1) {
                    updatedDay.hotelActivity = {
                        minGodzina: idx === 0 ? wybranyHotel.zameldowanie : wybranyHotel.wymeldowanie,
                        godzina: "23:00",
                    };
                }
                return updatedDay;
            })
        );
    }, [wybranyHotel]);

    // Debouncing hotelsearch
    const debounceTimer = useRef(null);
    useEffect(() => {

        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(async () => {
            try {
                const result = await hotelsearch(
                    dataPrzyjazdu,
                    dataWyjazdu,
                    liczbaUczestnikow,
                    liczbaOpiekunów,
                    hotelStandard,
                    miasto
                );
                console.log("SZUKAM HOTELU", dataPrzyjazdu, dataWyjazdu, result)
                setWybranyHotel({
                    nazwa: result?.data?.hotels[0]?.property.name,
                    adres: result?.data?.hotels[0]?.property.name,
                    gwiazdki: result?.data?.hotels[0]?.property.propertyClass,
                    zameldowanie: result?.data?.hotels[0]?.property.checkin.fromTime || "16:00",
                    wymeldowanie: result?.data?.hotels[0]?.property.checkout?.untilTime || "11:00",
                });
            } catch (error) {
                console.error("Błąd w hotelsearch:", error);
            }
        }, 3000);
        return () => clearTimeout(debounceTimer.current);
    }, [dataWyjazdu, dataPrzyjazdu, liczbaUczestnikow, liczbaOpiekunów, hotelStandard, miasto]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
          const handleFetchAtrakcje = async () => {
            const storageKey = "atrakcje" + miasto;
            const cachedData = localStorage.getItem(storageKey);
            if (cachedData) {
              setAktywnosciWMiescie(JSON.parse(cachedData));
              console.log("Using cached data", JSON.parse(cachedData));
              return;
            }
            try {
              const response = await fetch(
                `http://localhost:5002/api/pobierz-atrakcje?miasto=${encodeURIComponent(miasto)}`
              );
              const data = await response.json();
              setAktywnosciWMiescie(data);
              localStorage.setItem(storageKey, JSON.stringify(data));
              console.log("Fetched data", data);
            } catch (error) {
              console.error("Błąd pobierania atrakcji:", error);
            }
          };
          handleFetchAtrakcje();
        }, 1000); // debouncer 1 sekunda
      
        return () => clearTimeout(timeoutId);
      }, [miasto]);
      

    const [scheduleLoading, setScheduleLoading] = useState(false);
    const scheduleTimeoutRef = useRef(null);

    // Funkcja aktualizująca trasę z uwzględnieniem wybranych opcji transportu
    useEffect(() => {
        // Cache dla wyników wywołań API
        const routeCache = {};

        // Funkcja pomocnicza, która pobiera informacje o trasie i wykorzystuje cache
        async function getRouteInfo(origin, destination, selectedMode, departureDate) {
            // Klucz cache'u – można go dostosować, uwzględniając np. środki transportu
            const key = `${origin}_${destination}_${selectedMode}`;
            if (routeCache[key]) {
                return routeCache[key];
            }
            try {
                console.log("probuje dla: ", origin, " oraz ", destination)
                const response = await axios.get('http://localhost:5002/api/travel-info', {
                    params: {
                        origin,
                        destination,
                        date: departureDate.toISOString()
                    }
                });
                const travelInfo = response.data;
                routeCache[key] = travelInfo;
                return travelInfo;
            } catch (err) {
                console.error("Błąd pobierania informacji o trasie:", err);
                throw err;
            }
        }

        // Funkcja wyciągająca minuty z tekstu, np. "1 hour 7 mins" → 67, "18 mins" → 18
        const wyciagnijMinuty = (godz) => {
            const hourMatch = godz.match(/(\d+)\s*hour/);
            const minMatch = godz.match(/(\d+)\s*min/);
            let totalMinutes = 0;
            if (hourMatch) {
                totalMinutes += parseInt(hourMatch[1], 10) * 60;
            }
            if (minMatch) {
                totalMinutes += parseInt(minMatch[1], 10);
            }
            return totalMinutes;
        };

        // Funkcja zaokrąglająca w górę do najbliższej dziesiątki
        const zaokr = (licz) => {
            return licz % 10 === 0 ? licz + 10 : licz - (licz % 10) + 10;
        };

        setScheduleLoading(true);
        if (scheduleTimeoutRef.current) clearTimeout(scheduleTimeoutRef.current);
        scheduleTimeoutRef.current = setTimeout(async () => {
            async function computeSchedule() {
                const newSchedule = [];
                for (let i = 0; i < daysCount; i++) {
                    const day = aktywnosci[i];
                    // Jeśli w danym dniu nie ma aktywności – nie wykonujemy obliczeń
                    if (!day.dayActivities || day.dayActivities.length === 0) {
                        newSchedule.push([]);
                        continue;
                    }
                    const daySchedule = [];
                    let currentTimeMinutes = 8 * 60; // początek dnia: 08:00

                    // Pierwszy segment: z baseActivityStart do pierwszej aktywności
                    let originAddress = day.baseActivityStart.adres;
                    let originName = day.baseActivityStart.nazwa;
                    let firstActivity = day.dayActivities[0];
                    let selectedMode = day.baseActivityStart.selectedTransport || "czasAutem";
                    let departureDate = new Date();
                    departureDate.setHours(Math.floor(currentTimeMinutes / 60));
                    departureDate.setMinutes(currentTimeMinutes % 60);
                    try {
                        const travelInfo = await getRouteInfo(originName + " " + originAddress, firstActivity.nazwa + " " + firstActivity.adres, selectedMode, departureDate);
                        let travelTimeMinutes = wyciagnijMinuty(travelInfo[selectedMode] || "");
                        travelTimeMinutes = zaokr(travelTimeMinutes);
                        const segmentStartTime = minutesToTimeString(currentTimeMinutes);
                        daySchedule.push({ startTime: segmentStartTime, travelInfo });
                        currentTimeMinutes += travelTimeMinutes;
                        originAddress = firstActivity.adres;
                        originName = firstActivity.nazwa;

                    } catch (err) {
                        console.error("Błąd pobierania informacji o trasie:", err);
                    }

                    // Segmenty między kolejnymi aktywnościami
                    for (let j = 1; j < day.dayActivities.length; j++) {
                        let previousActivity = day.dayActivities[j - 1];
                        let activity = day.dayActivities[j];
                        let selectedMode = previousActivity.selectedTransport || "czasAutem";
                        let departureDate = new Date();
                        departureDate.setHours(Math.floor(currentTimeMinutes / 60));
                        departureDate.setMinutes(currentTimeMinutes % 60);
                        try {
                            const travelInfo = await getRouteInfo(originName + " " + originAddress, activity.nazwa + " " + activity.adres, selectedMode, departureDate);
                            let travelTimeMinutes = wyciagnijMinuty(travelInfo[selectedMode] || "");
                            travelTimeMinutes = zaokr(travelTimeMinutes);
                            const segmentStartTime = minutesToTimeString(currentTimeMinutes);
                            daySchedule.push({ startTime: segmentStartTime, travelInfo });
                            currentTimeMinutes += travelTimeMinutes + (parseInt(previousActivity.czasZwiedzania, 10) || 0);
                            originAddress = activity.adres;
                            originName = activity.nazwa;
                        } catch (err) {
                            console.error("Błąd pobierania informacji o trasie:", err);
                        }
                    }

                    // Ostatni segment: z ostatniej aktywności do baseActivityEnd
                    let lastActivity = day.dayActivities[day.dayActivities.length - 1];
                    let selectedModeFinal = lastActivity.selectedTransport || "czasAutem";
                    let departureDateFinal = new Date();
                    departureDateFinal.setHours(Math.floor(currentTimeMinutes / 60));
                    departureDateFinal.setMinutes(currentTimeMinutes % 60);
                    try {
                        const travelInfo = await getRouteInfo(
                            originName + " " + originAddress,
                            day.baseActivityEnd.nazwa + " " + day.baseActivityEnd.adres,
                            selectedModeFinal,
                            departureDateFinal
                        );
                        let travelTimeMinutes = wyciagnijMinuty(travelInfo[selectedModeFinal] || "");
                        travelTimeMinutes = zaokr(travelTimeMinutes);
                        // Dodajemy element dla segmentu przed dotarciem do baseActivityEnd
                        const segmentStartTime = minutesToTimeString(currentTimeMinutes);
                        daySchedule.push({ startTime: segmentStartTime, travelInfo });

                        // Aktualizujemy czas – to będzie czas przybycia do baseActivityEnd
                        currentTimeMinutes += travelTimeMinutes + (parseInt(lastActivity.czasZwiedzania, 10) || 0);

                        // Dodajemy dodatkowy element harmonogramu z godziną rozpoczęcia baseActivityEnd
                        const baseStartTime = minutesToTimeString(currentTimeMinutes);
                        daySchedule.push({ startTime: baseStartTime, travelInfo: null });
                    } catch (err) {
                        console.error("Błąd pobierania finalnego segmentu:", err);
                    }
                    newSchedule.push(daySchedule);
                }
                console.log("Obliczony harmonogram:", newSchedule);
                setSchedule(newSchedule);
                setScheduleLoading(false);
            }
            await computeSchedule();
        }, 3000);
        return () => {
            if (scheduleTimeoutRef.current) clearTimeout(scheduleTimeoutRef.current);
        };
    }, [aktywnosci, daysCount]);


    function dodajAktywnosc(nowaAktywnosc) {
        setAktywnosci((prev) => {
            const updated = [...prev];
            const dayObject = { ...updated[wybranyDzien] };
            dayObject.dayActivities = [
                ...dayObject.dayActivities,
                {
                    ...nowaAktywnosc.item,
                    godzinaRozpoczecia: "08:00",
                }
            ];
            updated[wybranyDzien] = dayObject;
            return updated;
        });
    }

    function handleCzasZwiedzaniaChange(dayIndex, activityIndex, newValue) {
        setAktywnosci((prev) => {
            const updated = [...prev];
            const dayObject = { ...updated[dayIndex] };
            const updatedActivities = [...dayObject.dayActivities];
            const activityToUpdate = { ...updatedActivities[activityIndex] };
            activityToUpdate.czasZwiedzania = newValue;
            updatedActivities[activityIndex] = activityToUpdate;
            dayObject.dayActivities = updatedActivities;
            updated[dayIndex] = dayObject;
            return updated;
        });
    }

    function handleTransportModeChange(dayIndex, activityIndex, newMode) {
        setAktywnosci((prev) => {
            const updated = [...prev];
            const dayObject = { ...updated[dayIndex] };
            const updatedActivities = [...dayObject.dayActivities];
            const updatedActivity = {
                ...updatedActivities[activityIndex],
                selectedTransport: newMode,
            };
            updatedActivities[activityIndex] = updatedActivity;
            dayObject.dayActivities = updatedActivities;
            updated[dayIndex] = dayObject;
            return updated;
        });
    }

    // Funkcja zmieniająca wybór transportu dla baseActivityStart
    function handleBaseTransportChange(dayIndex, newMode) {
        setAktywnosci((prev) => {
            const updated = [...prev];
            const dayObject = { ...updated[dayIndex] };
            dayObject.baseActivityStart = {
                ...dayObject.baseActivityStart,
                selectedTransport: newMode,
            };
            updated[dayIndex] = dayObject;
            return updated;
        });
    }
    useEffect(() => {
        console.log("test6")
    }, [])

    /*
    return (
        <>
            <ParametryWyjazdu
                dataWyjazdu={dataWyjazdu}
                dataPrzyjazdu={dataPrzyjazdu}
                liczbaUczestnikow={liczbaUczestnikow}
                liczbaOpiekunów={liczbaOpiekunów}
                hotelStandard={hotelStandard}
                rodzajTransportu={rodzajTransportu}
                setDataWyjazdu={setDataWyjazdu}
                setDataPrzyjazdu={setDataPrzyjazdu}
                setLiczbaUczestnikow={setLiczbaUczestnikow}
                setLiczbaOpiekunów={setLiczbaOpiekunów}
                setHotelStandard={setHotelStandard}
                setRodzajTransportu={setRodzajTransportu}
            />
            <input type="number" max={daysCount} min={0} value={wybranyDzien} onChange={(e) => setWybranyDzien(e.target.value)} />

            <KreatorMainbox>
                <div>
                    <h4>Atrakcje w mieście {miasto} (kliknij, żeby dodać):</h4>
                    {aktywnosciWMiescie ? (
                        aktywnosciWMiescie.map((item, index) => (
                            <div
                                key={index}
                                style={{ fontSize: '10px', cursor: 'pointer' }}
                                onClick={() => dodajAktywnosc({ item })}
                            >
                                {item.nazwa}, {item.adres}, {item.czasZwiedzania}
                            </div>
                        ))
                    ) : (
                        "Brak danych"
                    )}
                </div>
                <div>
                    <h4>Atrakcje w dniach:</h4>
                    {aktywnosci && aktywnosci.length > 0 ? (
                        aktywnosci.map((dayItem, dayIndex) => (
                            <div key={dayIndex} style={{ marginBottom: '10px' }}>
                                <strong>Dzień {dayIndex + 1}</strong>
                                <div style={{ fontSize: '10px', marginLeft: '10px' }}>
                                    <em>Start:</em> {dayItem.baseActivityStart.nazwa}, {dayItem.baseActivityStart.adres}
                                    <div>
                                        <label>
                                            <input
                                                type="radio"
                                                name={`transport-base-${dayIndex}`}
                                                value="czasAutem"
                                                checked={!dayItem.baseActivityStart.selectedTransport || dayItem.baseActivityStart.selectedTransport === "czasAutem"}
                                                onChange={(e) => handleBaseTransportChange(dayIndex, e.target.value)}
                                            />
                                            Samochód
                                        </label>
                                        <label>
                                            <input
                                                type="radio"
                                                name={`transport-base-${dayIndex}`}
                                                value="czasKomunikacja"
                                                checked={dayItem.baseActivityStart.selectedTransport === "czasKomunikacja"}
                                                onChange={(e) => handleBaseTransportChange(dayIndex, e.target.value)}
                                            />
                                            Komunikacja
                                        </label>
                                        <label>
                                            <input
                                                type="radio"
                                                name={`transport-base-${dayIndex}`}
                                                value="czasPieszo"
                                                checked={dayItem.baseActivityStart.selectedTransport === "czasPieszo"}
                                                onChange={(e) => handleBaseTransportChange(dayIndex, e.target.value)}
                                            />
                                            Pieszo
                                        </label>
                                    </div>
                                    {(dayIndex === 0 || dayIndex === aktywnosci.length - 1) && dayItem.hotelActivity && (
                                        <span>
                                            {" "}
                                            - Hotel: {dayItem.hotelActivity.minGodzina} - {dayItem.hotelActivity.godzina}
                                        </span>
                                    )}
                                </div>
                                {dayItem.dayActivities && dayItem.dayActivities.length > 0 ? (
                                    dayItem.dayActivities.map((activity, activityIndex) => (
                                        <div key={activityIndex} style={{ fontSize: '10px', marginLeft: '10px' }}>
                                            {activity.nazwa}, {activity.adres}, {activity.czasZwiedzania}
                                            <input
                                                type="range"
                                                max="360"
                                                step="10"
                                                value={activity.czasZwiedzania}
                                                onChange={(e) =>
                                                    handleCzasZwiedzaniaChange(dayIndex, activityIndex, e.target.value)
                                                }
                                            />
                                            <div>
                                                <label>
                                                    <input
                                                        type="radio"
                                                        name={`transport-${dayIndex}-${activityIndex}`}
                                                        value="czasAutem"
                                                        checked={!activity.selectedTransport || activity.selectedTransport === "czasAutem"}
                                                        onChange={(e) =>
                                                            handleTransportModeChange(dayIndex, activityIndex, e.target.value)
                                                        }
                                                    />
                                                    Samochód
                                                </label>
                                                <label>
                                                    <input
                                                        type="radio"
                                                        name={`transport-${dayIndex}-${activityIndex}`}
                                                        value="czasKomunikacja"
                                                        checked={activity.selectedTransport === "czasKomunikacja"}
                                                        onChange={(e) =>
                                                            handleTransportModeChange(dayIndex, activityIndex, e.target.value)
                                                        }
                                                    />
                                                    Komunikacja
                                                </label>
                                                <label>
                                                    <input
                                                        type="radio"
                                                        name={`transport-${dayIndex}-${activityIndex}`}
                                                        value="czasPieszo"
                                                        checked={activity.selectedTransport === "czasPieszo"}
                                                        onChange={(e) =>
                                                            handleTransportModeChange(dayIndex, activityIndex, e.target.value)
                                                        }
                                                    />
                                                    Pieszo
                                                </label>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ fontSize: '10px', marginLeft: '10px' }}>
                                        Brak atrakcji dodanych w tym dniu.
                                    </div>
                                )}
                                <div style={{ fontSize: '10px', marginLeft: '10px' }}>
                                    <em>Koniec:</em> {dayItem.baseActivityEnd.nazwa}, {dayItem.baseActivityEnd.adres}
                                </div>
                            </div>
                        ))
                    ) : (
                        "Brak aktywności"
                    )}
                </div>
            </KreatorMainbox>
        </>
    );*/
    return (
        <>

            <TopKreatorSlider />
            <div className='formularzMainbox'>

                <div className='formularzSliderMainbox'>
                    <div className='tytul'>
                        <a><div className="spotlight">{tyt}</div></a>
                        <div className='titleButtonsContainer'>
                            <button className='basicButton'>Zmień miasto</button>
                            <button className='basicButton'>Poradnik</button>
                            <button className='basicButton'>Regulamin</button>
                        </div>

                    </div>
                    <div className='SliderContainer-polaWyboru'>
                        <div className='poleWybor'>
                            <div className='poleWybor-icon'>
                                <img height="30px" width="30px" src="../icons/calendar-svgrepo-com.svg" />
                            </div>
                            <div className="poleWybor-picker">
                                <BookingDatePicker
                                    dataPrzyjazdu={dataPrzyjazdu}
                                    dataWyjazdu={dataWyjazdu}
                                    setDataPrzyjazdu={setDataPrzyjazdu}
                                    setDataWyjazdu={setDataWyjazdu}
                                />
                            </div>

                        </div>
                        <div className='poleWybor'>
                            <div className='poleWybor-icon'>
                                <img height="30px" width="30px" src="../icons/users.svg" />
                            </div>
                            <div className="poleWybor-picker">
                                <BookingGuestsPicker
                                    lGosci={liczbaUczestnikow}
                                    setLGosci={setLiczbaUczestnikow}
                                    lOpiekunow={liczbaOpiekunów}
                                    setLOpiekunow={setLiczbaOpiekunów}
                                />
                            </div>

                        </div>
                        <div className='poleWybor'>
                            <div className='poleWybor-icon'>
                                <img height="30px" width="30px" src="../icons/icon-hotel.svg" />
                            </div>
                            <div className="poleWybor-picker">
                                <HotelStandardSelector
                                    standard={hotelStandard}
                                    setStandard={setHotelStandard}
                                />
                            </div>

                        </div>
                        <div className='poleWybor'>
                            <div className='poleWybor-icon'>
                                <img height="30px" width="30px" src="../icons/icon-transport.svg" />
                            </div>
                            <div className="poleWybor-picker">
                                <TransportSelector
                                    transport={rodzajTransportu}
                                    setTransport={setRodzajTransportu}
                                />
                            </div>

                        </div>
                        <div className='poleWybor'>
                            <div className='poleWybor-icon'>
                                <img height="30px" width="30px" src="../icons/filter.svg" />
                            </div>
                            <div className="poleWybor-picker">
                                <TransportSelector />
                            </div>

                        </div>


                    </div>
                </div>
                <div className='kreatorBottomBox'>
                    <div className='kreatorBottomBox-left'>
                        <div className='kreatorBottomBox-title'>
                            Wybierz aktywność
                            <ChromeTabs />
                        </div>
                        <div className='wynikiAktywnosci'>
                            {aktywnosciWMiescie && aktywnosciWMiescie.length > 0 ? (
                                <>
                                    {aktywnosciWMiescie.slice(0, visibleCount).map((item, index) => (
                                        <WyborPoleAtrakcja key={item.idGoogle || index} atrakcja={item} onClick={() => dodajAktywnosc({ item })} />
                                    ))}
                                    {visibleCount < aktywnosciWMiescie.length && (
                                        <LoadMoreButton onClick={() => setVisibleCount(visibleCount + 20)}>
                                            Load More
                                        </LoadMoreButton>
                                    )}
                                </>
                            ) : (
                                <div><Loader /></div>
                            )}
                        </div>


                    </div>
                    <div className='kreatorBottomBox-right'>
                        <div className='nawigacja'>

                        </div>
                        <KreatorMainbox>

                            <div>
                                <h4>Atrakcje w dniach:</h4>
                                {aktywnosci && aktywnosci.length > 0 ? (
                                    aktywnosci.map((dayItem, dayIndex) => (
                                        <div key={dayIndex} style={{ marginBottom: '10px' }}>
                                            <strong>Dzień {dayIndex + 1}</strong>
                                            <div style={{ fontSize: '10px', marginLeft: '10px' }}>
                                                <em>Start:</em> {dayItem.baseActivityStart.nazwa}, {dayItem.baseActivityStart.adres}
                                                <div className='wyborTransportuPlan'>
                                                    <img src="../icons/next-route.svg" style={{ height: '40px', width: '40px', objectFit: 'fill' }} />
                                                    <div
                                                        className={dayItem.baseActivityStart.selectedTransport === "czasAutem" ? 'typTransportu chosen' : 'typTransportu'}
                                                        onClick={() => handleBaseTransportChange(dayIndex, "czasAutem")}
                                                        style={{ cursor: 'pointer' }}
                                                    >

                                                        <img src="../icons/icon-private-bus.svg" height={'20px'} />
                                                        Autokar

                                                    </div>

                                                    <div
                                                        className={dayItem.baseActivityStart.selectedTransport === "czasKomunikacja" ? 'typTransportu chosen' : 'typTransportu'}
                                                        onClick={() => handleBaseTransportChange(dayIndex, "czasKomunikacja")}
                                                        style={{ cursor: 'pointer' }}
                                                    >

                                                        <img src="../icons/icon-public-trannsport.svg" height={'20px'} />
                                                        Komunikacja
                                                    </div>

                                                    <div
                                                        className={dayItem.baseActivityStart.selectedTransport === "czasPieszo" ? 'typTransportu chosen' : 'typTransportu'}
                                                        onClick={() => handleBaseTransportChange(dayIndex, "czasPieszo")}
                                                        style={{ cursor: 'pointer' }}
                                                    >

                                                        <img src="../icons/icon-walk.svg" height={'20px'} />
                                                        Pieszo
                                                    </div>
                                                </div>
                                                {(dayIndex === 0 || dayIndex === aktywnosci.length - 1) && dayItem.hotelActivity && (
                                                    <span>
                                                        {" "}
                                                        - Hotel: {dayItem.hotelActivity.minGodzina} - {dayItem.hotelActivity.godzina}
                                                    </span>
                                                )}
                                            </div>

                                            <input type="range"/>
                                            {dayItem.dayActivities && dayItem.dayActivities.length > 0 ? (
                                                dayItem.dayActivities.map((activity, activityIndex) => (
                                                    <div key={activityIndex} style={{ backgroundColor: 'blue', fontSize: '10px', marginLeft: '10px' }}>
                                                        <div className='aktywnoscPlan'>

                                                            <div className='atrybut'><label>Nazwa <img src="../icons/icon-location.svg" height={'15px'}/></label><a>{activity.nazwa}</a></div>
                                                            <div className='atrybut'><label>Adres<img src="../icons/icon-location.svg" height={'15px'}/></label><a>{activity.adres}</a></div>
                                                            <div className='atrybut'><label>Cena biletu<img src="../icons/icon-ticket.svg" height={'15px'}/></label><a>24zł</a></div>
                                                            <div className='atrybut'><label>Godziny otwarcia<img src="../icons/icon-ticket.svg" height={'15px'}/></label><a>9:00-18:30</a></div>

                                                            <div className='atrybut'><label>Czas trwania<img src="../icons/icon-ticket.svg" height={'15px'}/></label><a><input
                                                                type="range"
                                                                max="360"
                                                                step="10"
                                                                value={activity.czasZwiedzania}
                                                                onChange={(e) =>
                                                                    handleCzasZwiedzaniaChange(dayIndex, activityIndex, e.target.value)
                                                                }
                                                            /></a></div>
                                                            {activity.nazwa}, {activity.adres}, {activity.czasZwiedzania}
                                                            <input
                                                                type="range"
                                                                max="360"
                                                                step="10"
                                                                value={activity.czasZwiedzania}
                                                                onChange={(e) =>
                                                                    handleCzasZwiedzaniaChange(dayIndex, activityIndex, e.target.value)
                                                                }
                                                            />
                                                        </div>



                                                        <div className='wyborTransportuPlan'>
                                                            <img src="../icons/next-route.svg" style={{ height: '40px', width: '40px', objectFit: 'fill' }} />

                                                            <div
                                                                className={!activity.selectedTransport || activity.selectedTransport === "czasAutem" ? 'typTransportu chosen' : 'typTransportu'}
                                                                onClick={() => handleTransportModeChange(dayIndex, activityIndex, "czasAutem")}
                                                                style={{ cursor: 'pointer' }}
                                                            >
                                                                <img src="../icons/icon-private-bus.svg" height={'20px'} />
                                                                Autokar
                                                            </div>

                                                            <div
                                                                className={activity.selectedTransport === "czasKomunikacja" ? 'typTransportu chosen' : 'typTransportu'}
                                                                onClick={() => handleTransportModeChange(dayIndex, activityIndex, "czasKomunikacja")}
                                                                style={{ cursor: 'pointer' }}
                                                            >
                                                                <img src="../icons/icon-public-trannsport.svg" height={'20px'} />
                                                                Komunikacja
                                                            </div>

                                                            <div
                                                                className={activity.selectedTransport === "czasPieszo" ? 'typTransportu chosen' : 'typTransportu'}
                                                                onClick={() => handleTransportModeChange(dayIndex, activityIndex, "czasPieszo")}
                                                                style={{ cursor: 'pointer' }}
                                                            >
                                                                <img src="../icons/icon-walk.svg" height={'20px'} />
                                                                Pieszo
                                                            </div>
                                                        </div>

                                                    </div>
                                                ))
                                            ) : (
                                                <div style={{ fontSize: '10px', marginLeft: '10px' }}>
                                                    Brak atrakcji dodanych w tym dniu.
                                                </div>
                                            )}
                                            <div style={{ fontSize: '10px', marginLeft: '10px' }}>
                                                <em>Koniec:</em> {dayItem.baseActivityEnd.nazwa}, {dayItem.baseActivityEnd.adres}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    "Brak aktywności"
                                )}
                            </div>
                        </KreatorMainbox>


                    </div>


                </div>



            </div>
        </>
    )
};

const KreatorMainbox = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: flex-start;
  align-items: flex-start;
  color: red;
`;
const LoadMoreButton = styled.button`
  margin: 10px auto;
  padding: 5px 10px;
  background-color: #255FF4;
  color: #fff;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  transition: 0.3s ease-in-out;

  &:hover {
    background-color: #174bd0;
  }
`;