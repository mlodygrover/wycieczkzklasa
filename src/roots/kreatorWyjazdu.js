import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
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
import { AktwnoscSlider } from './aktywnoscSlider.js';
import Timer from './timerAnimation.js';
import { AktywnosciNaw } from './aktywnosciNaw.js';
import { AktywnoscPlan } from './aktywnoscPlan.js';
import { HotelPlan } from './hotelPlan.js';
import { HotelPlanEnd } from './hotelEnd.js';
import { HotelMeldowanie } from './hotelMeldowanie.js';
import MapLocationPicker from './wyborLokalizacji.js';
import { RoutePlan, RoutePlanBack } from './RoutePlan.js';
import { DodawaniePlan } from './dodawaniePlan.js';
import { useSchedule } from './ScheduleContext.js';
import { PodsumowanieKreator } from './podsumowanieKreator.js';
const startingHotel = {
    nazwa: "Ładowanie...",
    adres: "Ładowanie...",
    zameldowanie: "16:00",
    wymeldowanie: "11:00",
};
const podstawoweAktywnosci = [
    {
        item: {
            rodzaj: "Czas wolny",
            adres: "",
            nazwa: "Czas wolny",
            cenaZwiedzania: "0",
            czasZwiedzania: 60,
            idGoogle: "FREE",
        },
    },
    {
        item: {
            rodzaj: "Posiłek",
            adres: "",
            nazwa: "Obiad / Lunch",
            cenaZwiedzania: "0",
            czasZwiedzania: 60,
            idGoogle: "FREE",
        },
    },
    {
        item: {
            rodzaj: "Przekąska / kawa",
            adres: "",
            nazwa: "Przerwa na kawę",
            cenaZwiedzania: "0",
            czasZwiedzania: 30,
            idGoogle: "FREE",
        },
    },
    {
        item: {
            rodzaj: "Grupowy spacer",
            adres: "",
            nazwa: "Spacer po okolicy",
            cenaZwiedzania: "0",
            czasZwiedzania: 90,
            idGoogle: "FREE",
        },
    },
    {
        item: {
            rodzaj: "Wizyta w muzeum",
            adres: "",
            nazwa: "Muzeum / wystawa",
            cenaZwiedzania: "0",
            czasZwiedzania: 120,
            idGoogle: "FREE",
        },
    },
    {
        item: {
            rodzaj: "Zakupy pamiątek",
            adres: "",
            nazwa: "Zakupy",
            cenaZwiedzania: "0",
            czasZwiedzania: 60,
            idGoogle: "FREE",
        },
    },
    {
        item: {
            rodzaj: "Gra zespołowa",
            adres: "",
            nazwa: "Zabawy integracyjne",
            cenaZwiedzania: "0",
            czasZwiedzania: 60,
            idGoogle: "FREE",
        },
    },
    {
        item: {
            rodzaj: "Sesja zdjęciowa",
            adres: "",
            nazwa: "Zdjęcia grupowe",
            cenaZwiedzania: "0",
            czasZwiedzania: 30,
            idGoogle: "FREE",
        },
    },
    {
        item: {
            rodzaj: "Prezentacja / wykład",
            adres: "",
            nazwa: "Prelekcja",
            cenaZwiedzania: "0",
            czasZwiedzania: 45,
            idGoogle: "FREE",
        },
    },
    {
        item: {
            rodzaj: "Warsztat",
            adres: "",
            nazwa: "Warsztaty tematyczne",
            cenaZwiedzania: "0",
            czasZwiedzania: 90,
            idGoogle: "FREE",
        },
    },
    {
        item: {
            rodzaj: "Odpoczynek",
            adres: "",
            nazwa: "Przerwa / relaks",
            cenaZwiedzania: "0",
            czasZwiedzania: 30,
            idGoogle: "FREE",
        },
    },
    {
        item: {
            rodzaj: "Program wieczorny",
            adres: "",
            nazwa: "Wieczorne spotkanie",
            cenaZwiedzania: "0",
            czasZwiedzania: 120,
            idGoogle: "FREE",
        },
    },
];


function formatTime(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0) {
        return `${hours} godz ${minutes} min`;
    }
    return `${minutes} min`;
}

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
    const hours = Math.floor(minutes / 60) % 24;
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

export const fetchPriceInfo = async (atrakcja_bas, miasto) => {
    const atrakcja = atrakcja_bas.item.nazwa;
    const now = Date.now();
    const THROTTLE_INTERVAL = 3000; // 3 sekundy
    /*if (now - lastFetchTime < THROTTLE_INTERVAL) {
        console.warn("Funkcja fetchPriceInfo została zablokowana (limit 1 wywołanie na 3 sekundy)");
        return;
    }*/

    lastFetchTime = now;

    const prompt = `Ile kosztuje zwiedzanie ${atrakcja} w ${miasto} dla jednej osoby?`;

    try {
        const response = await axios.post('http://localhost:5002/ask', {
            question: prompt,
            idGoogle: atrakcja_bas.item.idGoogle,

        });
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
function validateOrOffset(dateStr, offsetDays = 0) {
    // sparsuj wejściowy string
    const [y, m, d] = dateStr.split('-').map(Number);
    const inputDate = new Date(y, m - 1, d);
    // ustaw dziś na 00:00
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    // jeśli wejściowa data jest niepoprawna lub < dziś
    if (isNaN(inputDate) || inputDate < today) {
      const result = new Date(today);
      result.setDate(result.getDate() + offsetDays);
      return result;
    }
  
    // w przeciwnym razie zwróć oryginalną datę
    return inputDate;
  }
  
export const KreatorWyjazdu = ({ tyt = "Zaplanuj Wasz wyjazd do Poznania!" }) => {
    // Inicjalizacja stanów
    const [dataPrzyjazdu, setDataPrzyjazdu] = useState(() => {
        // pobieramy z localStorage albo ustawiamy domyślnie
        const stored = validateOrOffset(localStorage.getItem("dataPrzyjazdu") || '2025-06-20');
       
        return stored;
    });
    const [dataWyjazdu, setDataWyjazdu] = useState(() => {
        // pobieramy z localStorage albo ustawiamy domyślnie
        const storedDate = validateOrOffset(localStorage.getItem("dataWyjazdu") || '2025-06-22', 1);
        return storedDate;
    });

    const [startLok, setStartLok] = useState(null);
    const [liczbaUczestnikow, setLiczbaUczestnikow] = useState(10);
    const [liczbaOpiekunów, setLiczbaOpiekunów] = useState(0/*() => localStorage.getItem("liczbaOpiekunów") || ""*/);
    const [hotelStandard, setHotelStandard] = useState(() => localStorage.getItem("hotelStandard") || "");
    const [rodzajTransportu, setRodzajTransportu] = useState(() => localStorage.getItem("rodzajTransportu") || "");
    const [miasto, setMiasto] = useState(() => localStorage.getItem("miasto") || "Poznań");

    // Nawigacja i dane strony
    const [wybranaKat, setWybranaKat] = useState(1);

    const [godzinaWyjazdStart, setGodzinaWyjazdStart] = useState(10 * 60)
    const [aktywnosciWMiescie, setAktywnosciWMiescie] = useState();
    const [wybranyDzien, setWybranyDzien] = useState(0);
    const [daysCount, setDaysCount] = useState(calculateDays(dataWyjazdu, dataPrzyjazdu) > 1 ? calculateDays(dataWyjazdu, dataPrzyjazdu) : 1);
    const [godzinyStart, setGodzinyStart] = useState(() =>
        Array(daysCount).fill(8 * 60)
    );
    const [validGodzinyStart, setValidGodzinyStart] = useState([]);
    useEffect(() => {
        setGodzinyStart(prev => {
            // jeśli długość się nie zmieniła, zwróć prev i nic nie rób
            if (prev.length === daysCount) return prev;
            const next = [...prev];
            while (next.length < daysCount) next.push(8 * 60);
            return next.slice(0, daysCount);
        });
    }, [daysCount]);
    const [aktywnosci, setAktywnosci] = useState(() =>
        Array.from({ length: daysCount + 1 }, () => initialDayObject(startingHotel))
    );
    const [validAktywnosci, setValidAktywnosci] = useState([]);
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
    // Aktualizacja baseActivityStart i baseActivityEnd przy zmianie hotelu lub miejsca zbiórki
    useEffect(() => {
        setAktywnosci(prevDays =>
            prevDays.map((day, idx) => {
                // przygotuj bazową strukturę
                const selectedTransport = day.baseActivityStart?.selectedTransport || "czasAutem";

                // dla dnia 0 – start z miejsca zbiórki
                const baseStart = idx === 0 && startLok
                    ? {
                        nazwa: startLok.title,
                        adres: startLok.subtitle,
                        selectedTransport,
                    }
                    : {
                        nazwa: wybranyHotel.nazwa,
                        adres: wybranyHotel.adres,
                        selectedTransport,
                    };

                // koniec dnia zawsze w hotelu
                const baseEnd = idx === daysCount - 1 && startLok
                    ? {
                        nazwa: startLok.title,
                        adres: startLok.subtitle,

                    }
                    : {
                        nazwa: wybranyHotel.nazwa,
                        adres: wybranyHotel.adres,
                    };

                const updatedDay = {
                    ...day,
                    baseActivityStart: baseStart,
                    baseActivityEnd: baseEnd,
                };

                // hotelActivity (zameldowanie / wymeldowanie) tylko pierwszego i ostatniego dnia
                if (idx === 0 || idx === prevDays.length - 1) {
                    updatedDay.hotelActivity = {
                        minGodzina: idx === 0
                            ? wybranyHotel.zameldowanie
                            : wybranyHotel.wymeldowanie,
                        godzina: "23:00",
                    };
                }
                return updatedDay;
            })
        );
    }, [wybranyHotel, startLok]);


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
                const storageKey = "atrakcj222e" + miasto;
                const cachedJson = localStorage.getItem(storageKey);

                if (cachedJson) {
                    let cachedData = JSON.parse(cachedJson);
                    setAktywnosciWMiescie(cachedData);

                    // TODO: uzupełnij brakujące ceny
                    const updatedData = await Promise.all(
                        cachedData.map(async (atrakcja) => {
                            if (atrakcja.cenaZwiedzania == null) {
                                // wywołaj fetchPriceInfo
                                const price = await fetchPriceInfo({ item: atrakcja }, miasto);
                                // jeśli fetch zwróci liczbę, ustaw w obiekcie
                                if (typeof price === "number") {
                                    atrakcja.cenaZwiedzania = price;
                                }
                            }
                            return atrakcja;
                        })
                    );

                    // Zaktualizowany stan i localStorage
                    setAktywnosciWMiescie(updatedData);
                    localStorage.setItem(storageKey, JSON.stringify(updatedData));

                    return;
                }
                try {
                    const response = await fetch(
                        `http://localhost:5002/api/pobierz-atrakcje?miasto=${encodeURIComponent(miasto)}`
                    );
                    let data = await response.json();

                    // 4) Ustawiamy początkowy stan
                    setAktywnosciWMiescie(data);

                    // 5) Weryfikujemy brakujące pola na nowo pobranych danych
                    const verified = await Promise.all(
                        data.map(async (atrakcja) => {
                            if (atrakcja.cenaZwiedzania == null) {
                                const price = await fetchPriceInfo({ item: atrakcja }, miasto);
                                if (typeof price === "number") {
                                    atrakcja.cenaZwiedzania = price;
                                }
                            }
                            if (!atrakcja.dataDodania) {
                                atrakcja.dataDodania = new Date().toISOString().slice(0, 10);
                            }
                            return atrakcja;
                        })
                    );

                    // 6) Zapis do stanu i cache
                    setAktywnosciWMiescie(verified);
                    localStorage.setItem(storageKey, JSON.stringify(verified));
                } catch (error) {
                    console.error("Błąd pobierania atrakcji:", error);
                }
            };
            handleFetchAtrakcje();
        }, 1000); // debouncer 1 sekunda

        return () => clearTimeout(timeoutId);
    }, [miasto]);


    const [scheduleLoading, setScheduleLoading] = useState(false);
    const [scheduleLoadingStart, setScheduleLoadingStart] = useState(true);
    const scheduleTimeoutRef = useRef(null);

    const { setScheduleLoadingGlobal } = useSchedule();
    useEffect(() => {
        setScheduleLoadingGlobal(scheduleLoading);
    }, [scheduleLoading, setScheduleLoadingGlobal]);


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
        function timeStringToMinutes(timeStr) {
            // Rozdzielamy string według dwukropka.
            const parts = timeStr.split(':');
            if (parts.length !== 2) {
                throw new Error('Invalid time format. Expected "HH:MM".');
            }

            // Parsujemy godziny i minuty.
            const hours = parseInt(parts[0], 10);
            const minutes = parseInt(parts[1], 10);

            // Zwracamy sumaryczną liczbę minut.
            return hours * 60 + minutes;
        }
        // Funkcja zaokrąglająca w górę do najbliższej dziesiątki
        const zaokr = (licz) => {
            return licz % 10 === 0 ? licz + 10 : licz - (licz % 10) + 10;
        };
        const maxim = (a, b) => {
            if (a > b) return a
            return b
        }

        setScheduleLoading(true);
        if (scheduleTimeoutRef.current) clearTimeout(scheduleTimeoutRef.current);
        scheduleTimeoutRef.current = setTimeout(async () => {
            const godzinaZameldowania = wybranyHotel.zameldowanie;
            const godzinaWymeldowania = wybranyHotel.wymeldowanie
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
                    let currentTimeMinutes = godzinyStart[i]; // początek dnia: 08:00

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
                            let segmentStartTime = minutesToTimeString(currentTimeMinutes);
                            if (day.dayActivities[j - 1].idGoogle == "ABCD") {

                                segmentStartTime = minutesToTimeString(maxim(timeStringToMinutes(segmentStartTime), timeStringToMinutes(godzinaZameldowania)));
                                currentTimeMinutes = timeStringToMinutes(segmentStartTime)

                            }

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
                        let segmentStartTime = minutesToTimeString(currentTimeMinutes);
                        if (lastActivity.idGoogle == "ABCD") {
                            segmentStartTime = minutesToTimeString(maxim(timeStringToMinutes(segmentStartTime), timeStringToMinutes(godzinaZameldowania)));
                            currentTimeMinutes = timeStringToMinutes(segmentStartTime)

                        }
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
                console.log("Obliczony harmonogram:", newSchedule, "aktywnosci", aktywnosci, "poprzednie", validAktywnosci);
                let dcbaIdx;
                const lastDayActivities = aktywnosci[daysCount - 1].dayActivities;
                for (let i = 0; i < lastDayActivities.length; i++) {
                    if (lastDayActivities[i]?.idGoogle == "DCBA") {
                        dcbaIdx = i + 1;
                        break;          // opcjonalnie, jeśli szukasz tylko pierwszego wystąpienia
                    }
                }
                //console.log("TEST103,", timeStringToMinutes(newSchedule[daysCount-1][dcbaIdx]?.startTime || ),newSchedule[daysCount-1][dcbaIdx]?.startTime, godzinaZameldowania, godzinaWymeldowania, wybranyHotel);
                if (newSchedule[daysCount - 1][dcbaIdx]?.startTime && timeStringToMinutes(newSchedule[daysCount - 1][dcbaIdx]?.startTime) <= timeStringToMinutes(godzinaWymeldowania)) {
                    setSchedule(newSchedule);
                    setValidAktywnosci(aktywnosci);
                    setValidGodzinyStart(godzinyStart);

                }
                else if (daysCount > 1 && newSchedule[daysCount - 1][dcbaIdx]?.startTime) {
                    setAktywnosci(validAktywnosci)
                    setGodzinyStart(validGodzinyStart)
                }
                else {
                    setSchedule(newSchedule);
                }
                //setSchedule(newSchedule);
                setScheduleLoading(false);
                setScheduleLoadingStart(false)
            }
            await computeSchedule();
        }, 3000);
        return () => {
            if (scheduleTimeoutRef.current) clearTimeout(scheduleTimeoutRef.current);
        };
    }, [aktywnosci, daysCount, godzinyStart, validGodzinyStart]);


    function dodajAktywnosc(nowaAktywnosc) {
        if (Array.isArray(nowaAktywnosc.item)) {
            console.log("Nowa aktywność musi być pojedynczym obiektem, nie tablicą");
            nowaAktywnosc.item.forEach((akt, idx) => {
                dodajAktywnoscM({ item: akt });
            });
            return;
        }
        const cena = fetchPriceInfo(nowaAktywnosc, miasto);
        if (!scheduleLoading) {
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

    }
    function dodajAktywnoscM(nowaAktywnosc) {
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
    function dodajAktywnoscD(nowaAktywnosc, d) {
        setAktywnosci((prev) => {
            const updated = [...prev];
            const dayObject = { ...updated[d] };
            dayObject.dayActivities = [
                ...dayObject.dayActivities,
                {
                    ...nowaAktywnosc.item,
                    godzinaRozpoczecia: "08:00",
                }
            ];
            updated[d] = dayObject;
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
    function swapAttractions(dayIndex, activityIndex, dir = -1) {
        setAktywnosci(prevState => {
            // 1) Wyciągamy poprzednie aktywności danego dnia
            const previousActivities = prevState;
            // zapisujemy je do validAktywnosci
            setValidAktywnosci(previousActivities);

            // 2) Teraz wykonujemy faktyczną zamianę
            const updatedState = [...prevState];
            const currentDay = { ...updatedState[dayIndex] };
            const activities = [...currentDay.dayActivities];

            // check boundary
            if ((activityIndex === 0 && dir === -1) ||
                (activityIndex === activities.length - 1 && dir === 1)) {
                return prevState;
            }

            // swap
            const tmp = activities[activityIndex + dir];
            activities[activityIndex + dir] = activities[activityIndex];
            activities[activityIndex] = tmp;

            currentDay.dayActivities = activities;
            updatedState[dayIndex] = currentDay;
            return updatedState;
        });
    }
    useEffect(() => {
        function removeActivityById(dayIndex, id) {
            setAktywnosci(prevState => {
                // Tworzymy kopię tablicy dla danego dnia, usuwając elementy o podanym id.
                const updatedDays = [...prevState];
                updatedDays[dayIndex] = {
                    ...updatedDays[dayIndex],
                    dayActivities: updatedDays[dayIndex].dayActivities.filter(
                        activity => activity.idGoogle !== id
                    ),
                };
                return updatedDays;
            });
        }
        const timer = setTimeout(() => {
            const testMeldowanieHotel = {
                item: {
                    rodzaj: "Zameldowanie w hotelu",
                    adres: wybranyHotel.adres,
                    nazwa: wybranyHotel.nazwa,
                    cenaZwiedzania: "100zl",
                    czasZwiedzania: 30,
                    idGoogle: "ABCD",
                    godzinaZameldowania: "15:00",
                    godzinaWymeldowania: "11:00"

                },
            };
            const startWymeldowanieHotel = {
                item: {
                    rodzaj: "Wymeldowanie z hotelu",
                    adres: wybranyHotel.adres,
                    nazwa: wybranyHotel.nazwa,
                    cenaZwiedzania: "100zl",
                    czasZwiedzania: 30,
                    idGoogle: "DCBA",
                    godzinaZameldowania: "15:00",
                    godzinaWymeldowania: "10:00"

                },
            };
            const powrotStart = {
                item: {
                    rodzaj: "uGABUGA",
                    adres: startLok?.subtitle || "Błąd adresu",
                    nazwa: startLok?.title || "Błąd adresu",
                    cenaZwiedzania: "100zl",
                    czasZwiedzania: 30,
                    idGoogle: "CBA",
                    godzinaZameldowania: "15:00",
                    godzinaWymeldowania: "10:00"

                },
            };
            if (wybranyHotel.adres !== "Ładowanie...") {
                // Usuwamy ewentualne wcześniejsze aktywności z idGoogle "ABCD" z pierwszego dnia (indeks 0) lub dowolnego innego, który Cię interesuje
                for (let i = 0; i < daysCount; i++) {
                    removeActivityById(i, "ABCD");
                    removeActivityById(i, "DCBA");
                }
                removeActivityById(0, "ABCD");
                removeActivityById(daysCount - 1, "DCBA");
                //removeActivityById(daysCount - 1, "CBA");
                // Następnie dodajemy nową aktywność
                if (daysCount > 1) {
                    dodajAktywnoscD(testMeldowanieHotel, 0);
                    dodajAktywnoscD(startWymeldowanieHotel, daysCount - 1);
                    //dodajAktywnoscD(powrotStart, daysCount - 1)
                }


            }
        }, 500); // Opóźnienie 500 ms // Opóźnienie 500 ms

        // Funkcja czyszcząca
        return () => clearTimeout(timer);
    }, [wybranyHotel, startLok]);



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
                                <img height="30px" width="30px" src="../icons/icon-rocket.svg" />
                            </div>
                            <div className="poleWybor-picker">
                                <MapLocationPicker startLoK={startLok} setStartLok={setStartLok} />
                            </div>

                        </div>
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



                    </div>
                </div>



                <div className='kreatorBottomBoxG'>
                    <div className='kreatorBottomBox'>
                        <div className='kreatorBottomBox-left'>
                            <div className='kreatorBottomBox-title'>
                                Szybkie dodawanie aktywności
                                <ChromeTabs wybranaKat={wybranaKat} setWybranaKat={setWybranaKat} />
                            </div>
                            <div className='wynikiAktywnosci' style={{ zIndex: '20' }} key={wybranaKat}>

                                {wybranaKat == 1
                                    ? (
                                        aktywnosciWMiescie && aktywnosciWMiescie.length > 0
                                            ? (
                                                <>
                                                    {aktywnosciWMiescie.slice(0, visibleCount).map((item, index) => (
                                                        <WyborPoleAtrakcja
                                                            key={item.idGoogle || index}
                                                            atrakcja={item}
                                                            onClick={() => dodajAktywnosc({ item })}
                                                        />
                                                    ))}
                                                    {visibleCount < aktywnosciWMiescie.length && (
                                                        <LoadMoreButton onClick={() => setVisibleCount(visibleCount + 20)}>
                                                            Load More
                                                        </LoadMoreButton>
                                                    )}
                                                </>
                                            )
                                            : <Loader />
                                    )
                                    : (
                                        <>

                                            {podstawoweAktywnosci.map(({ item }, idx) => (

                                                <WyborPoleAtrakcja
                                                    key={item.nazwa || idx}
                                                    atrakcja={item}
                                                    onClick={() => dodajAktywnosc({ item })}
                                                    typ={2}
                                                />
                                            ))}
                                        </>
                                    )
                                }

                                {/*aktywnosciWMiescie && aktywnosciWMiescie.length > 0 ? (
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
                            )*/}
                            </div>


                        </div>




                        <div className='kreatorBottomBox-right'>

                            <div className='nawigacjaDni'>
                                <div className='nawButton' onClick={() => setWybranyDzien((wybranyDzien - 1 + daysCount) % daysCount)}>
                                    <img src="./icons/icon-arrow.svg" style={{ transform: 'rotate(-90deg)', width: '15px', height: '15px' }} />
                                </div>

                                <div className='nawigacjaDni-dzien'>Wybrany dzień: <span className='liczba'>{wybranyDzien + 1}</span></div>

                                <div className='nawButton' onClick={() => setWybranyDzien((wybranyDzien + 1) % daysCount)}>
                                    <img src="./icons/icon-arrow.svg" style={{ transform: 'rotate(90deg)', width: '15px', height: '15px' }} />
                                </div>
                            </div>
                            {scheduleLoadingStart
                                ? <div style={{ width: '100%', textAlign: 'center', padding: '20px' }}><Loader /></div>
                                : (
                                    <KreatorMainbox>

                                        <div style={{ width: '100%' }}>
                                            {aktywnosci && aktywnosci.length > 0 ? (
                                                (() => {
                                                    const dayItem = aktywnosci[wybranyDzien];
                                                    return (
                                                        <div key={wybranyDzien} style={{ marginBottom: '10px', width: '100%' }}>


                                                            <div style={{ fontSize: '10px', marginLeft: '10px' }}>
                                                                {wybranyDzien === 0
                                                                    ? <RoutePlan

                                                                        hotel={aktywnosci[wybranyDzien].baseActivityStart}
                                                                        startValue={godzinyStart[wybranyDzien]}
                                                                        setGodzinaStart={newMin => {
                                                                            setGodzinyStart(prev => {
                                                                                // jeśli user wybrał tę samą wartość co już w state — nic nie rób
                                                                                if (prev[wybranyDzien] === newMin) return prev;
                                                                                const arr = [...prev];
                                                                                arr[wybranyDzien] = newMin;
                                                                                return arr;
                                                                            });

                                                                        }}
                                                                    />
                                                                    : <HotelPlan
                                                                        hotel={wybranyHotel}
                                                                        startValue={godzinyStart[wybranyDzien]}
                                                                        setGodzinaStart={newMin => {
                                                                            setGodzinyStart(prev => {
                                                                                // jeśli user wybrał tę samą wartość co już w state — nic nie rób
                                                                                if (prev[wybranyDzien] === newMin) return prev;
                                                                                //if(wybranyDzien == daysCount - 1)return prev;
                                                                                const arr = [...prev];
                                                                                arr[wybranyDzien] = newMin;
                                                                                return arr;
                                                                            });

                                                                        }}
                                                                    />
                                                                }
                                                                <div className='wyborTransportuPlan'>
                                                                    <img src="../icons/next-route.svg" style={{ height: '40px', width: '40px', objectFit: 'fill' }} />
                                                                    <div
                                                                        className={dayItem.baseActivityStart.selectedTransport === "czasAutem" ? 'typTransportu chosen' : 'typTransportu'}
                                                                        onClick={() => handleBaseTransportChange(wybranyDzien, "czasAutem")}
                                                                        style={{ cursor: 'pointer' }}
                                                                    >

                                                                        <img src="../icons/icon-private-bus.svg" style={{ filter: 'invert(100%)' }} height={'20px'} />
                                                                        <div>
                                                                            Autokar
                                                                            <a style={{ fontSize: '9px' }}>
                                                                                {(scheduleLoading ||
                                                                                    !schedule?.[wybranyDzien] ||
                                                                                    schedule[wybranyDzien].length < 1 ||
                                                                                    !schedule?.[wybranyDzien]?.[0]?.travelInfo?.czasAutem) ? (
                                                                                    <span className="blinking"> chwila...</span>
                                                                                ) : (
                                                                                    <span> {schedule[wybranyDzien][0].travelInfo.czasAutem}</span>
                                                                                )}
                                                                            </a>
                                                                        </div>

                                                                    </div>

                                                                    <div
                                                                        className={dayItem.baseActivityStart.selectedTransport === "czasKomunikacja" ? 'typTransportu chosen' : 'typTransportu'}
                                                                        onClick={() => handleBaseTransportChange(wybranyDzien, "czasKomunikacja")}
                                                                        style={{ cursor: 'pointer' }}
                                                                    >

                                                                        <img src="../icons/icon-public-trannsport.svg" style={{ filter: 'invert(100%)' }} height={'20px'} fill={'white'} />
                                                                        <div>
                                                                            Komunikacja
                                                                            <a style={{ fontSize: '9px' }}>
                                                                                {(scheduleLoading ||
                                                                                    !schedule?.[wybranyDzien] ||
                                                                                    schedule[wybranyDzien].length < 1 ||
                                                                                    !schedule?.[wybranyDzien]?.[0]?.travelInfo?.czasKomunikacja) ? (
                                                                                    <span className="blinking"> chwila...</span>
                                                                                ) : (
                                                                                    <span> {schedule[wybranyDzien][0].travelInfo.czasKomunikacja}</span>
                                                                                )}
                                                                            </a>
                                                                        </div>
                                                                    </div>

                                                                    <div
                                                                        className={dayItem.baseActivityStart.selectedTransport === "czasPieszo" ? 'typTransportu chosen' : 'typTransportu'}
                                                                        onClick={() => handleBaseTransportChange(wybranyDzien, "czasPieszo")}
                                                                        style={{ cursor: 'pointer' }}
                                                                    >

                                                                        <img src="../icons/icon-walk.svg" style={{ filter: 'invert(100%)' }} height={'20px'} />
                                                                        <div>
                                                                            Pieszo
                                                                            <a style={{ fontSize: '9px' }}>
                                                                                {(scheduleLoading ||
                                                                                    !schedule?.[wybranyDzien] ||
                                                                                    schedule[wybranyDzien].length < 1 ||
                                                                                    !schedule?.[wybranyDzien]?.[0]?.travelInfo?.czasPieszo) ? (
                                                                                    <span className="blinking"> chwila...</span>
                                                                                ) : (
                                                                                    <span> {schedule[wybranyDzien][0].travelInfo.czasPieszo}</span>
                                                                                )}
                                                                            </a>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                            </div>

                                                            {dayItem.dayActivities && dayItem.dayActivities.length > 0 ? (
                                                                dayItem.dayActivities.map((activity, activityIndex) => (
                                                                    <div key={activityIndex} style={{
                                                                        width: '100%',
                                                                        fontSize: '10px',



                                                                    }}>
                                                                        {activity.idGoogle == "ABCD" || activity.idGoogle == "DCBA" || activity.idGoogle == "CBA" ?
                                                                            <HotelMeldowanie wybranyDzien={wybranyDzien} dayIndex={wybranyDzien} activityIndex={activityIndex} swapAttractions={swapAttractions} activity={activity} schedule={schedule} handleCzasZwiedzaniaChange={handleCzasZwiedzaniaChange} formatTime={formatTime} scheduleLoading={scheduleLoading} />
                                                                            : <AktywnoscPlan wybranyDzien={wybranyDzien} dayIndex={wybranyDzien} activityIndex={activityIndex} swapAttractions={swapAttractions} activity={activity} schedule={schedule} handleCzasZwiedzaniaChange={handleCzasZwiedzaniaChange} formatTime={formatTime} scheduleLoading={scheduleLoading} />
                                                                        }


                                                                        <div className='wyborTransportuPlan'>
                                                                            <img src="../icons/next-route.svg" style={{ height: '40px', width: '40px', objectFit: 'fill' }} />

                                                                            <div
                                                                                className={!activity.selectedTransport || activity.selectedTransport === "czasAutem" ? 'typTransportu chosen' : 'typTransportu'}
                                                                                onClick={() => handleTransportModeChange(wybranyDzien, activityIndex, "czasAutem")}
                                                                                style={{ cursor: 'pointer' }}
                                                                            >
                                                                                <img src="../icons/icon-private-bus.svg" style={{ filter: 'invert(100%)' }} height={'20px'} />
                                                                                <div>
                                                                                    Autokar
                                                                                    <a style={{ fontSize: '9px' }}>
                                                                                        {(scheduleLoading ||
                                                                                            !schedule?.[wybranyDzien] ||
                                                                                            schedule[wybranyDzien].length < activityIndex + 1 ||
                                                                                            !schedule?.[wybranyDzien]?.[activityIndex + 1]?.travelInfo?.czasAutem) ? (
                                                                                            <span className="blinking"> chwila...</span>
                                                                                        ) : (
                                                                                            <span> {schedule[wybranyDzien][activityIndex + 1].travelInfo.czasAutem}</span>
                                                                                        )}
                                                                                    </a>
                                                                                </div>
                                                                            </div>

                                                                            <div
                                                                                className={activity.selectedTransport === "czasKomunikacja" ? 'typTransportu chosen' : 'typTransportu'}
                                                                                onClick={() => handleTransportModeChange(wybranyDzien, activityIndex, "czasKomunikacja")}
                                                                                style={{ cursor: 'pointer' }}
                                                                            >
                                                                                <img src="../icons/icon-public-trannsport.svg" style={{ filter: 'invert(100%)' }} height={'20px'} />
                                                                                <div>
                                                                                    Komunikacja
                                                                                    <a style={{ fontSize: '9px' }}>
                                                                                        {(scheduleLoading ||
                                                                                            !schedule?.[wybranyDzien] ||
                                                                                            schedule[wybranyDzien].length < activityIndex + 1 ||
                                                                                            !schedule?.[wybranyDzien]?.[activityIndex + 1]?.travelInfo?.czasKomunikacja) ? (
                                                                                            <span className="blinking"> chwila...</span>
                                                                                        ) : (
                                                                                            <span> {schedule[wybranyDzien][activityIndex + 1].travelInfo.czasKomunikacja}</span>
                                                                                        )}
                                                                                    </a>
                                                                                </div>
                                                                            </div>

                                                                            <div
                                                                                className={activity.selectedTransport === "czasPieszo" ? 'typTransportu chosen' : 'typTransportu'}
                                                                                onClick={() => handleTransportModeChange(wybranyDzien, activityIndex, "czasPieszo")}
                                                                                style={{ cursor: 'pointer' }}
                                                                            >
                                                                                <img src="../icons/icon-walk.svg" style={{ filter: 'invert(100%)' }} height={'20px'} />
                                                                                <div>
                                                                                    Pieszo
                                                                                    <a style={{ fontSize: '9px' }}>
                                                                                        {(scheduleLoading ||
                                                                                            !schedule?.[wybranyDzien] ||
                                                                                            schedule[wybranyDzien].length < activityIndex + 1 ||
                                                                                            !schedule?.[wybranyDzien]?.[activityIndex + 1]?.travelInfo?.czasPieszo) ? (
                                                                                            <span className="blinking"> chwila...</span>
                                                                                        ) : (
                                                                                            <span> {schedule[wybranyDzien][activityIndex + 1].travelInfo.czasPieszo}</span>
                                                                                        )}
                                                                                    </a>
                                                                                </div>
                                                                            </div>
                                                                        </div>


                                                                    </div>

                                                                ))

                                                            ) : (
                                                                <div style={{ fontSize: '10px', marginLeft: '10px' }}>
                                                                    Brak atrakcji dodanych w tym dniu.
                                                                </div>
                                                            )}
                                                            {wybranyDzien != daysCount - 1 ?
                                                                <HotelPlanEnd
                                                                    godzinaEnd={
                                                                        schedule?.[wybranyDzien]
                                                                            ? schedule[wybranyDzien][schedule[wybranyDzien].length - 1]?.startTime
                                                                            : "08:00"
                                                                    }
                                                                /> :
                                                                <RoutePlanBack

                                                                    hotel={aktywnosci[daysCount - 1].baseActivityEnd}
                                                                    startValue={
                                                                        (scheduleLoading || !schedule[wybranyDzien][schedule[wybranyDzien].length - 1]?.startTime)
                                                                            ? "chwila..."
                                                                            : schedule[wybranyDzien][schedule[wybranyDzien].length - 1]?.startTime
                                                                    }
                                                                    setGodzinaStart={newMin => {
                                                                        setGodzinyStart(prev => {
                                                                            // jeśli user wybrał tę samą wartość co już w state — nic nie rób
                                                                            if (prev[wybranyDzien] === newMin) return prev;
                                                                            const arr = [...prev];
                                                                            arr[wybranyDzien] = newMin;
                                                                            return arr;
                                                                        });

                                                                    }}
                                                                />
                                                            }

                                                        </div>
                                                    );
                                                })()
                                            ) : (
                                                "Brak aktywności"
                                            )}
                                            <DodawaniePlan onAddActivity={dodajAktywnosc} katP={wybranaKat == 5} key={wybranaKat == 5} />
                                        </div>

                                    </KreatorMainbox>
                                )
                            }




                        </div>


                    </div>
                </div>



            </div>
            <PodsumowanieKreator key={scheduleLoading} schedule={schedule} aktywnosci={aktywnosci} wait={scheduleLoading}/>
        </>
    )
};


const KreatorMainbox = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: flex-start;
  align-items: flex-start;
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