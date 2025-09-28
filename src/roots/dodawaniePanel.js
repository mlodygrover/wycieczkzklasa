import React, { useState, useEffect, use, useContext, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { AktywnosciNaw } from './aktywnosciNaw.js';
import { StarRating } from './wyborPoleAtrakcja.js';
import MapLocationPicker from './wyborLokalizacji.js';
import DodawanieAtrakcji from './dodawanieAtrakcjiMapa.js';
import { useSchedule } from './ScheduleContext.js';
import { LittleLoader } from './littleLoader.js';
import { LoadScript } from '@react-google-maps/api';
import Loader from './loader.js';
import { fetchPriceInfo } from './kreatorWyjazdu.js';

const podstawoweAktywnosci = [

    {
        rodzaj: "Czas wolny",
        adres: "",
        nazwa: "Czas wolny",
        cenaZwiedzania: "0",
        czasZwiedzania: 60,
        idGoogle: "FREE",

        img: "../icons/icon-freetime.svg"
    },
    {
        rodzaj: "Posiłek",
        adres: "",
        nazwa: "Obiad / Lunch",
        cenaZwiedzania: "0",
        czasZwiedzania: 60,
        idGoogle: "FREE",
        img: "../icons/icon-posilek.svg"
    },
    {
        rodzaj: "Przekąska / kawa",
        adres: "",
        nazwa: "Przerwa na kawę",
        cenaZwiedzania: "0",
        czasZwiedzania: 30,
        idGoogle: "FREE",
        img: "../icons/park.svg"
    },
    {
        rodzaj: "Grupowy spacer",
        adres: "",
        nazwa: "Spacer po okolicy",
        cenaZwiedzania: "0",
        czasZwiedzania: 90,
        idGoogle: "FREE",
        img: "../icons/park.svg"
    },
    {
        rodzaj: "Wizyta w muzeum",
        adres: "",
        nazwa: "Muzeum / wystawa",
        cenaZwiedzania: "0",
        czasZwiedzania: 120,
        idGoogle: "FREE",
        img: "../icons/park.svg"
    },
    {
        rodzaj: "Zakupy pamiątek",
        adres: "",
        nazwa: "Zakupy",
        cenaZwiedzania: "0",
        czasZwiedzania: 60,
        idGoogle: "FREE",
        img: "../icons/park.svg"
    },
    {
        rodzaj: "Gra zespołowa",
        adres: "",
        nazwa: "Zabawy integracyjne",
        cenaZwiedzania: "0",
        czasZwiedzania: 60,
        idGoogle: "FREE",
        img: "../icons/park.svg"
    },
    {
        rodzaj: "Sesja zdjęciowa",
        adres: "",
        nazwa: "Zdjęcia grupowe",
        cenaZwiedzania: "0",
        czasZwiedzania: 30,
        idGoogle: "FREE",
        img: "../icons/park.svg"
    },
    {
        rodzaj: "Prezentacja / wykład",
        adres: "",
        nazwa: "Prelekcja",
        cenaZwiedzania: "0",
        czasZwiedzania: 45,
        idGoogle: "FREE",
        img: "../icons/park.svg"
    },
    {
        rodzaj: "Warsztat",
        adres: "",
        nazwa: "Warsztaty tematyczne",
        cenaZwiedzania: "0",
        czasZwiedzania: 90,
        idGoogle: "FREE",
        img: "../icons/park.svg"
    },
    {
        rodzaj: "Odpoczynek",
        adres: "",
        nazwa: "Przerwa / relaks",
        cenaZwiedzania: "0",
        czasZwiedzania: 30,
        idGoogle: "FREE",
        img: "../icons/park.svg"
    },


];


export const DodajAtrakcjePrzycisk = ({ onClick }) => {
    const { scheduleLoadingGlobal, setScheduleLoadingGlobal } = useSchedule();
    const klasa = scheduleLoadingGlobal ? 'przyciskDodajPlan b loading' : 'przyciskDodajPlan b'
    return (

        <div className={klasa} onClick={onClick}>
            Dodaj do twojego planu
        </div>
    )
}
const KreatorAtrakcji = ({ onAddActivity }) => {

    const [nazwa, setNazwa] = useState("");
    const [adres, setAdres] = useState("");
    const [czasZwiedzania, setCzasZwiedzania] = useState(60);
    const [cenaZwiedzania, setCenaZwiedzania] = useState(0);
    const [lok, setLok] = useState();
    const [nazwa1, setNazwa1] = useState("")
    const [adres1, setAdres1] = useState("")
    const [czasZwiedzania1, setCzasZwiedzania1] = useState(60);
    const [cenaZwiedzania1, setCenaZwiedzania1] = useState(0);
    const [atrakcja, setAtrakcja] = useState()
    const [atrakcja1, setAtrakcja1] = useState()

    const { scheduleLoadingGlobal, setScheduleLoadingGlobal } = useSchedule();

    useEffect(() => {
        const pom = {
            nazwa,
            adres,
            czasZwiedzania,
            cenaZwiedzania,
            idGoogle: "OWN",
            
        }
        setAtrakcja(pom);
    }, [nazwa, adres, czasZwiedzania, cenaZwiedzania])
    useEffect(() => {
       
        const pom = {
            nazwa: nazwa1,
            adres: adres1,
            czasZwiedzania: czasZwiedzania1,
            cenaZwiedzania: cenaZwiedzania1,
            idGoogle: "OWN",
            location: {
              lat: lok?.coords.lat || null,
              lng: lok?.coords.lng || null,
            }
          };
        setAtrakcja1(pom);
    }, [nazwa1, adres1, czasZwiedzania1, cenaZwiedzania1, lok])
    useEffect(() => {

        setNazwa1(lok?.title);
        setAdres1(lok?.address)
    }, [lok])

    const handleAdd = (kt = 1) => {
        kt == 1 && onAddActivity({ item: atrakcja });
        kt == 2 && onAddActivity({ item: atrakcja1 });
        // resetujemy pola
        console.log("test2", kt, atrakcja, atrakcja1)
        setNazwa("");
        setAdres("");
        setCzasZwiedzania(60);
        setCenaZwiedzania(0);
        setLok(null);
    };
    return (
        <div className='kreatorAtrakcjiMainbox'>
            <div className='kreatorAtrakcjiAtrybuty'>
                <div className='kreatorName'>
                    Dodaj atrakcję turystyczną według własnych kryteriów.
                </div>
                <div className='paraInputDiv'>
                    <div className='paraTyt'>
                        Podaj nazwę
                    </div>
                    <div className='paraInput'>
                        <input type="text" value={nazwa} onChange={(e) => setNazwa(e.target.value)} />
                    </div>
                </div>
                <div className='paraInputDiv'>
                    <div className='paraTyt'>
                        Podaj adres
                    </div>
                    <div className='paraInput'>
                        <input type="text" value={adres} onChange={(e) => setAdres(e.target.value)} />
                    </div>
                </div>
                <div className='paraInputDiv'>
                    <div className='paraTyt'>
                        Podaj czas zwiedzania
                    </div>
                    <div className='paraInput b'>
                        <input
                            type="range"
                            max="360"
                            step="10"
                            value={czasZwiedzania}
                            onChange={(e) => setCzasZwiedzania(e.target.value)}
                        />
                        {czasZwiedzania} min
                    </div>

                </div>

                <div className='paraInputDiv'>
                    <div className='paraTyt'>
                        Podaj cenę / osoba
                    </div>
                    <div className='paraInput'>
                        <input type="number" value={cenaZwiedzania} onChange={(e) => setCenaZwiedzania(e.target.value)} />
                    </div>
                </div>

                <DodajAtrakcjePrzycisk onClick={handleAdd} />
            </div>

            <div className='linia'></div>
            <div className='kreatorAtrakcjiAtrybuty'>
                <div className='kreatorName'>
                    Dodaj atrakcję turystyczną wyszukując ją na mapach.
                </div>
                <div className='paraInputDiv'>
                    <div className='paraTyt'>
                        Wyszukaj lokalizację
                    </div>
                    <div className='paraInput c'>
                        <DodawanieAtrakcji setStartLok={setLok} />

                    </div>
                </div>

                <div className='paraInputDiv'>
                    <div className='paraTyt'>
                        Nazwa
                    </div>
                    <div className='paraInput d'>
                        <input disabled type="text" value={nazwa1} onChange={(e) => setNazwa1(e.target.value)} />
                    </div>
                </div>
                <div className='paraInputDiv'>
                    <div className='paraTyt'>
                        Adres
                    </div>
                    <div className='paraInput d'>
                        <input disabled type="text" value={adres1} onChange={(e) => setAdres1(e.target.value)} />
                    </div>
                </div>
                <div className='paraInputDiv'>
                    <div className='paraTyt'>
                        Podaj czas zwiedzania
                    </div>
                    <div className='paraInput b'>
                        <input
                            type="range"
                            max="360"
                            step="10"
                            value={czasZwiedzania1}
                            onChange={(e) => setCzasZwiedzania1(e.target.value)}
                        />
                        {czasZwiedzania1} min
                    </div>
                </div>
                <div className='paraInputDiv'>
                    <div className='paraTyt'>
                        Podaj cenę / osoba
                    </div>
                    <div className='paraInput'>
                        <input type="number" value={cenaZwiedzania1} onChange={(e) => setCenaZwiedzania1(e.target.value)} />
                    </div>
                </div>
                <DodajAtrakcjePrzycisk onClick={() => handleAdd(2)} />
            </div>


        </div>
    )
}


const DodawanieResult = ({ item, idx, onAddActivity, markAdd, markDel, zazn }) => {

    const { scheduleLoadingGlobal, setScheduleLoadingGlobal } = useSchedule();
    const [klik, setKlik] = useState(zazn)
    const [price, setPrice] = useState(item.cenaZwiedzania || null)
    const handleAdd = () => {
        onAddActivity({ item: item });

    };

    useEffect(() => {
        if (klik && item.idGoogle != "FREE") {
            markAdd(item);
        }
        else if (!klik && item.idGoogle != "FREE") {
            markDel(item);
        }
    }, [klik])
    if (item.idGoogle != "FREE")

        return (
            <div className={klik ? "resultBox k" : "resultBox"} key={item.idGoogle || idx} onClick={() => setKlik(!klik)}>
                <div className='resultBox-left'>
                    <img src="../miasta/poznan.jpg" width={'90%'} height={'90%'} />

                </div>
                <div className='resultBox-right'>
                    <div className='resultTyt'><img src="../icons/icon-attraction.svg" width={'15px'} />{item.nazwa}</div>
                    <div className='resultTyt atr'><img src="../icons/icon-location.svg" width={'15px'} />{item.adres}</div>
                    <div className='resultTyt atr'><img src="../icons/icon-time.svg" width={'15px'} />{item.czasZwiedzania}</div>
                    <div className='resultTyt atr'><img src="../icons/icon-ticket.svg" width={'15px'} />{price} zł</div>
                    <div className='resultTyt atr'><img src="../icons/icon-stars.svg" width={'15px'} /><StarRating />({item.ocenaGoogle})</div>
                    <div className='resultPrzyciski'>
                        <div
                            className='resultPrzycisk'
                            onClick={e => {
                                e.stopPropagation();
                            }}
                        >
                            <img src="../icons/icon-eye.svg" width='15px' /><div>Opis</div>
                        </div>
                        {scheduleLoadingGlobal ? <LittleLoader /> : <div
                            className='resultPrzycisk'
                            onClick={e => {
                                e.stopPropagation();
                                handleAdd();
                            }}
                        >
                            <img src="../icons/icon-plus2.svg" width='18px' /><div>Dodaj</div>
                        </div>
                        }

                        <div
                            className={klik ? "resultPrzycisk k" : "resultPrzycisk"}
                            onClick={() => {
                                setKlik(k => !k);

                            }}
                        >
                            <img src="../icons/icon-mark1.svg" width='15px' /><div>Zaznacz</div>
                        </div>

                        <div
                            className='resultPrzycisk'
                            onClick={e => {
                                e.stopPropagation();
                            }}
                        >
                            <img src="../icons/icon-serce.svg" width='15px' /><div>Ulubione</div>
                        </div>
                    </div>
                </div>

            </div>

        )
    else return (

        <div className={klik ? "resultBox b k" : "resultBox b"} key={item.idGoogle || idx} onClick={() => setKlik(!klik)}>
            <div className='resultBox-left'>
                <img src={item.img} width={'90%'} height={'90%'} />

            </div>
            <div className='resultBox-right'>
                <div className='resultTyt'><img src="../icons/icon-attraction.svg" width={'15px'} />{item.nazwa}</div>
                <div className='resultTyt atr'><img src="../icons/icon-time.svg" width={'15px'} />Dostosuj czas do swojego pomysłu</div>
                <div className='resultPrzyciski'>


                    <div
                        className='resultPrzycisk'
                        onClick={e => {
                            e.stopPropagation();
                        }}
                    >
                        <img src="../icons/icon-plus2.svg" width='18px' /><div>Dodaj</div>
                    </div>

                    <div
                        className={klik ? "resultPrzycisk k" : "resultPrzycisk"}
                        onClick={() => setKlik(k => !k)}

                    >
                        <img src="../icons/icon-mark1.svg" width='15px' /><div>Zaznacz</div>
                    </div>

                    <div
                        className='resultPrzycisk'
                        onClick={e => {
                            e.stopPropagation();
                        }}
                    >
                        <img src="../icons/icon-serce.svg" width='15px' /><div>Ulubione</div>
                    </div>
                </div>
            </div>

        </div>

    )
}
export const DodawaniePanel = ({ onAddActivity }) => {



    const options = useRef([
        // Warszawa
        "Zamek Królewski w Warszawie",
        "Pałac Kultury i Nauki",
        "Łazienki Królewskie",
        // Poznań
        "Stary Rynek w Poznaniu",
        "Ostrów Tumski",
        // Gdańsk
        "Długi Targ",
        "Żuraw nad Motławą",
        // Wrocław
        "Rynek we Wrocławiu",
        "Hala Stulecia",
        // wspólna (panoramy/ciekawe punkty widokowe)
        "Taras widokowy Sky Tower"
    ]).current;

    // Stan dla wyświetlanego tekstu (bez kursora)
    const [tekstAnimacja, setTekstAnimacja] = useState("");
    // Ref z indeksem bieżącej frazy
    const idxRef = useRef(-1);

    useEffect(() => {
        let timeouts = [];
        let intervalId;

        const cycle = () => {
            // Przejście do kolejnej frazy
            idxRef.current = (idxRef.current + 1) % options.length;
            const fullText = options[idxRef.current];

            // Czyścimy poprzednie timery
            timeouts.forEach(clearTimeout);
            timeouts = [];

            // Resetujemy tekst
            setTekstAnimacja("");

            // Obliczamy odstęp między literami: 500ms / liczba znaków
            const charInterval = 1000 / fullText.length;

            // Harmonogram wpisywania liter
            fullText.split("").forEach((char, i) => {
                const t = setTimeout(() => {
                    // Dodajemy kolejną literę do tekstu
                    setTekstAnimacja(prev => prev + char);
                }, i * charInterval);
                timeouts.push(t);
            });
        };

        // Uruchamiamy animację od razu i potem co 5s
        cycle();
        intervalId = setInterval(cycle, 5000);

        return () => {
            clearInterval(intervalId);
            timeouts.forEach(clearTimeout);
        };
    }, []);

    // Pomocnicza funkcja: usuwa diakrytyki i zamienia tekst na małe litery
    const normalizeText = (text = "") =>
        text
            .normalize("NFD")                    // rozbijamy znaki z diakrytykami
            .replace(/\p{M}/gu, "")              // usuwamy znaki mark (diakrytyki)
            .toLowerCase();                      // małe litery

    const handleSearch = () => {
        // 0) Zasygnalizuj początek ładowania
        setSearchLoaded(false);

        // 1) Po pół sekundy wykonaj faktyczne filtrowanie
        setTimeout(() => {
            const source = wybKat < 3 ? aktywnosciWMiescie : podstawoweAktywnosci;
            const q = normalizeText(searchQuery.trim());

            if (!q) {
                setFilteredLok([]);
                setLokWyswietlanie(source);
            } else {
                const resultsName = source.filter(item =>
                    normalizeText(item.nazwa).includes(q)
                );
                const afterName = source.filter(item => !resultsName.includes(item));
                const resultsAddress = afterName.filter(item =>
                    normalizeText(item.adres).includes(q)
                );
                const rest = afterName.filter(item => !resultsAddress.includes(item));
                const merged = [...resultsName, ...resultsAddress, ...rest];

                setFilteredLok(resultsName);
                setLokWyswietlanie(merged);
            }

            // 2) Zakończ ładowanie
            setSearchLoaded(true);
        }, 500);
    };



    const [aktywnosciWMiescie, setAktywnosciWMiescie] = useState([])
    const [wybKat, setWybKat] = useState(1);
    const [lokWyswietlanie, setLokWyswietlanie] = useState([]);
    const [searchLoaded, setSearchLoaded] = useState(true)
    // Nowy stan dla frazy wyszukiwania
    const [searchQuery, setSearchQuery] = useState("");
    // Nowy stan dla listy po filtrze
    const [filteredLok, setFilteredLok] = useState([]);
    const [zaznaczone, setZaznaczone] = useState([]);

    useEffect(() => {
        const storageKey = "atrakcj222e" + "Poznań";
        const cachedData = localStorage.getItem(storageKey);
        if (cachedData) {
            setAktywnosciWMiescie(JSON.parse(cachedData))

        }
    }, [])

    useEffect(() => {
        if (wybKat == 1 || wybKat == 2) {
            setLokWyswietlanie(aktywnosciWMiescie)
        }
        else {
            setLokWyswietlanie(podstawoweAktywnosci)
        }
        setFilteredLok([]);
        setSearchQuery("");
    }, [wybKat, aktywnosciWMiescie])

    function dodajDoZaznaczonych(atrakcja) {
        setZaznaczone(prev => {
            // jeśli już istnieje atrakcja o tym idGoogle, nie dodawaj ponownie
            const exists = prev.some(a => a.idGoogle === atrakcja.idGoogle);
            if (exists) return prev;
            return [...prev, atrakcja];
        });
    }
    function usunZZaznaczonych(atrakcja) {
        setZaznaczone(prev =>
            prev.filter(a => a.idGoogle !== atrakcja.idGoogle)
        );
    }
    const { scheduleLoadingGlobal, setScheduleLoadingGlobal } = useSchedule();
    return (
        <div className='dodawaniePanelMainbox'>
            <div className='dodawanieTyt'>
                Dodawanie aktywności
            </div>
            <div className='dodawanieWyborKategorii'>
                <div className={wybKat == 1 ? 'dodawanieWybor k' : 'dodawanieWybor'} onClick={() => setWybKat(1)}>
                    Popularne<img src="../icons/trend.svg" height={'18px'} style={{ filter: 'invert(100%)' }} />
                </div>
                <div className={wybKat == 2 ? 'dodawanieWybor k' : 'dodawanieWybor'} onClick={() => setWybKat(2)}>
                    Atrakcje<img src="../icons/castle.svg" height={'18px'} style={{ filter: 'invert(100%)' }} />
                </div>
                <div className={wybKat == 3 ? 'dodawanieWybor k' : 'dodawanieWybor'} onClick={() => setWybKat(3)}>
                    Podstawowe<img src="../icons/park.svg" height={'18px'} style={{ filter: 'invert(100%)' }} />
                </div>
                <div className={wybKat == 4 ? 'dodawanieWybor k' : 'dodawanieWybor'} onClick={() => setWybKat(4)}>
                    Polubione<img src="../icons/serce.svg" height={'18px'} style={{ filter: 'invert(100%)' }} />
                </div>
                <div className={wybKat == 5 ? 'dodawanieWybor k' : 'dodawanieWybor'} onClick={() => setWybKat(5)}>
                    Własne<img src="../icons/icon-configuration.svg" height={'18px'} style={{ filter: 'invert(100%)' }} />
                </div>
            </div>
            {wybKat < 5 ?
                <div className='dodawanieWyszukiwanieBox'>
                    <div className='pasekWyszukiwania'>
                        <input
                            type="text"
                            placeholder={tekstAnimacja}
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter') {
                                    handleSearch();
                                }
                            }}
                        />
                        <div className='wyszukiwanieBut' onClick={handleSearch}>
                            <div className='searchButton'>
                                <img width='20px' src="../icons/icon-search.svg" alt="search" />
                            </div>
                        </div>
                    </div>
                </div> : ""}

            <div className="dodawanieZaznaczoneBox">
                {zaznaczone.length > 0 && (
                    <>
                        <div className="dodawanieZaznaczone">
                            {zaznaczone.map((item, idx) => (
                                <div key={idx}>{item.nazwa},</div>
                            ))}
                        </div>

                        {scheduleLoadingGlobal
                            ? <LittleLoader />
                            : (
                                <div
                                    className="dodawanieDodaj"
                                    onClick={() => onAddActivity({ item: zaznaczone })}
                                >
                                    <img src="../icons/icon-plus2.svg" width="18px" />
                                    Dodaj
                                </div>
                            )
                        }

                        <div
                            className="dodawanieZaznaczoneReset"
                            onClick={() => setZaznaczone([])}
                        >
                            <img
                                src="../icons/icon-plus3.svg"
                                width="18px"
                                style={{ transform: 'rotate(45deg)' }}
                            />
                        </div>
                    </>
                )}
            </div>




            <div className='dodawanieResults' key={zaznaczone}>
                {searchLoaded
                    ? (
                        wybKat < 5
                            ? lokWyswietlanie.map((item, idx) => (
                                <DodawanieResult
                                    key={item.idGoogle == "FREE" ? item.nazwa : item.idGoogle}
                                    item={item}
                                    idx={idx}
                                    onAddActivity={onAddActivity}
                                    markAdd={dodajDoZaznaczonych}
                                    markDel={usunZZaznaczonych}
                                    zazn={zaznaczone.includes(item)}
                                />
                            ))
                            : <KreatorAtrakcji onAddActivity={onAddActivity} />
                    )
                    : <Loader />
                }
            </div>
        </div>


    )

}