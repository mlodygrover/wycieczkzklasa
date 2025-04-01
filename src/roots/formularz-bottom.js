import React, { useState, useEffect, useMemo } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { InputText1 } from './inputtext1';
import { RadioStars } from '../components';
import { TransportChoice } from './TransportChoice';
import Checkbox1 from './checkbox1';
import ChoiceInput1 from './choiceinput1';
import { ArrowButton } from './CitySpot';
import { AddActivityButton } from './addnewactivity';
import { ProgramTile } from './programtile';
import { LoadScript } from '@react-google-maps/api';
import { TrashButton } from './TrashButton';
import { ArrowButton2 } from './ArrowButton2';
import { RouteChoice } from './RouteChoice';
import axios from 'axios';
import { set } from 'mongoose';
import { HotelsSearch } from './HotelSearch';
import { znajdzHotel } from './HotelSearch';

const API_URL = "http://localhost:5002/api/popular-attractions"; // 🔹 Adres backendu

const useCalcTime = (nazwa, adres) => {
  const [czasZwiedzania, setCzasZwiedzania] = useState(null);

  useEffect(() => {
    async function fetchCzasZwiedzania() {
      try {
        const response = await fetch(`http://localhost:5002/api/estimate-zwiedzanie?nazwa=${encodeURIComponent(nazwa)}&adres=${encodeURIComponent(adres)}`);
        const data = await response.json();
        setCzasZwiedzania(data.czasZwiedzania || 60); // Domyślnie 60 minut
      } catch (error) {
        console.error("Błąd pobierania czasu zwiedzania:", error);
        setCzasZwiedzania(60);
      }
    }

    fetchCzasZwiedzania();
  }, [nazwa, adres]);

  return czasZwiedzania;
};
async function getCzasZwiedzania(nazwa, adres) {
  try {

    const response = await fetch(`http://localhost:5002/api/estimate-zwiedzanie?nazwa=${encodeURIComponent(nazwa)}&adres=${encodeURIComponent(adres)}`);

    if (!response.ok) {

      throw new Error(`Błąd pobierania danych: ${response.status}`);
    }

    const data = await response.json();

    if (!data || !data.czasZwiedzania) {

      console.warn("Brak danych o czasie zwiedzania, ustawiam domyślnie 60 minut.");
      return 60; // Domyślna wartość, jeśli API nie zwróci danych
    }
    return data.czasZwiedzania;
  } catch (error) {
    console.error("Błąd pobierania czasu zwiedzania:", error);
    return 30; // Domyślna wartość w przypadku błędu
  }

}

export const usePopularAttractions = (city) => {
  const [attractions, setAttractions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAttractions = async (city = "Poznań") => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}?city=${encodeURIComponent(city)}`);
      if (!response.ok) {
        throw new Error(`Błąd HTTP: ${response.status}`);
      }
      const data = await response.json();
      setAttractions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { attractions, fetchAttractions, loading, error };
};


function parseDurationToMinutes(duration) {
  let totalMinutes = 0;

  const hourMatch = duration.match(/(\d+)\s*hour/);
  const minuteMatch = duration.match(/(\d+)\s*min/);

  if (hourMatch) {
    totalMinutes += parseInt(hourMatch[1], 10) * 60; // Zamiana godzin na minuty
  }
  if (minuteMatch) {
    totalMinutes += parseInt(minuteMatch[1], 10); // Dodanie minut
  }

  return totalMinutes;
}

function addMinutesToTime(timeString, minutesToAdd) {
  if (!minutesToAdd || !timeString) return "05:00";
  const [hours, minutes] = timeString.split(":").map(Number);
  let totalMinutes = hours * 60 + minutes + minutesToAdd;

  const newHours = Math.floor(totalMinutes / 60) % 24; // Obsługa przekroczenia doby
  const newMinutes = totalMinutes % 60;

  return `${String(newHours).padStart(2, "0")}:${String(newMinutes).padStart(2, "0")}`;
}


function formatMinutesToDuration(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours} h ${minutes} min`;
  } else if (hours > 0) {
    return `${hours} h`;
  } else {
    return `${minutes} min`;
  }
}
function roundTimeToNearest10(timeString) {
  let totalMinutes = parseDurationToMinutes(timeString); // Zamiana czasu na minuty
  totalMinutes = totalMinutes + 10 - (totalMinutes % 10); // Zaokrąglanie do 10 min w górę
  return formatMinutesToDuration(totalMinutes); // Zamiana z powrotem na "X h Y min"
}
async function fetchTravelInfo(origin, destination = "Poznan", date) {
  try {
    const response = await axios.get(`http://localhost:5002/api/travel-info`, {
      params: { origin, destination, date }
    });
    if (!response.data) {
      throw new Error("Brak danych w odpowiedzi");
    }
    return response.data;
  } catch (error) {
    throw error;
  }
}

async function policzOdleglosci(aktywnosci, dzien = 0) {
  let wyn = [];

  if (!aktywnosci || !aktywnosci[dzien]) {
    console.error("Nieprawidłowe dane aktywności");
    return wyn;
  }

  const d = aktywnosci[dzien].length;


  for (let i = 1; i < d; i++) {
    const origin = aktywnosci[dzien][i - 1].nazwa;
    const destination = aktywnosci[dzien][i].nazwa;
    let date = new Date().toISOString()
    //date = "2025-03-26T12:23:11.090Z"

    try {
      const res = await fetchTravelInfo(origin, destination, date);
      let { czasPieszo, czasAutem, czasKomunikacja, trasaKomunikacja } = res;

      czasPieszo = roundTimeToNearest10(czasPieszo);
      czasAutem = roundTimeToNearest10(czasAutem);
      czasKomunikacja = roundTimeToNearest10(czasKomunikacja);



      wyn.push({ czasPieszo, czasAutem, czasKomunikacja, trasaKomunikacja });

    } catch (error) {
      console.error(`Błąd w pobieraniu danych dla trasy ${origin} -> ${destination}:`, error);
      wyn.push({
        czasPieszo: "Błąd",
        czasAutem: "Błąd"
      });
    }

  }
  return wyn;
}



export const FormularzBottom = () => {

  const initialAktywnosci2 = [
    [
      {
        nazwa: "BazyWWWWlika Archikatedralna Świętych Apostołów Piotra i Pawła",
        adres: "Ostrów Tumski 17, Poznań",
        czasZwiedzania: 60,
        koszt: "4,50 zł (bilet normalny), 3,50 zł (bilet ulgowy)",
        godzinaRozpoczecia: "12:30",
        godzinaZakonczenia: "00:00",
        miejsceRozpoczecia: "!",
        miejsceZakonczenia: "!",
        wybranaTrasa: 1,
      },

      {
        nazwa: "Stadion lecha",
        adres: "Ostrów Tumski 17, Poznań",
        czasZwiedzania: 90,
        koszt: "4,50 zł (bilet normalny), 3,50 zł (bilet ulgowy)",
        godzinaRozpoczecia: "00:00",
        godzinaZakonczenia: "00:00",
        miejsceRozpoczecia: "!",
        miejsceZakonczenia: "!",
        wybranaTrasa: 1,
      },
      {
        nazwa: "Muzeum Wojska Poznań",
        adres: "Ostrów Tumski 17, Poznań",
        czasZwiedzania: 60,
        koszt: "4,50 zł (bilet normalny), 3,50 zł (bilet ulgowy)",
        godzinaRozpoczecia: "00:00",
        godzinaZakonczenia: "00:00",
        miejsceRozpoczecia: "!",
        miejsceZakonczenia: "!",
        wybranaTrasa: 1,
      },
    ],
  ];
  const testHotel = {
    nazwa: "Ładowanie...",
    adres: "Ładowanie...",
    czasZwiedzania: 60,
    koszt: "4,50 zł (bilet normalny), 3,50 zł (bilet ulgowy)",
    godzinaRozpoczecia: "12:30",
    godzinaZakonczenia: "00:00",
    miejsceRozpoczecia: "!",
    miejsceZakonczenia: "!",
    wybranaTrasa: 1,
  };


  const [standardHotel, setStandardHotel] = useState(() => {
    const stored = localStorage.getItem("standardHotel");
    return stored !== null ? Number(stored) : 2;
  });
  // Przechowywanie dat z localStorage w stanie
  const [startDate, setStartDate] = useState(localStorage.getItem("startDate"));
  const [endDate, setEndDate] = useState(localStorage.getItem("endDate"));
  const [dni, setDni] = useState(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMilliseconds = end - start;
    const diffDays = diffMilliseconds / (1000 * 60 * 60 * 24);
    return diffDays + 1;
  });
  const [wybranyDzien, setWybranyDzien] = useState(1);
  const [zmiana, setZmiana] = useState(false)
  const [aktywnosci, setAktywnosci] = useState(() => {
    const storedData = localStorage.getItem("aktywnosci");
    return storedData && storedData.length > 0 ? JSON.parse(storedData) : initialAktywnosci2;
  });
  const [schedule, setSchedule] = useState(() => {
    const storedData = localStorage.getItem("schedule");
    return storedData ? JSON.parse(storedData) : [];

  });
  const [chosenHotel, setChosenHotel] = useState(testHotel);
  const [fittedHotel, setFittedHotel] = useState(testHotel);
  const [baseTimes, setBaseTimes] = useState(["Abcd"])
  const [travelData, setTravelData] = useState([]);
  const [partNum, setPartNum] = useState(Number(localStorage.getItem("partNum")) || 0);
  const [hotelKey, setHotelKey] = useState(`hotel_Poznań_${startDate}_${endDate}_${partNum}_${standardHotel}`);
  const [miasto, setMiasto] = useState("Poznań")



  // Funkcja aktualizująca daty ze localStorage
  const updateStoredDates = () => {
    setStartDate(localStorage.getItem("startDate"));
    setEndDate(localStorage.getItem("endDate"));
    setPartNum(Number(localStorage.getItem("partNum")));
    setStandardHotel(Number(localStorage.getItem("standardHotel")));
    //", startDate, endDate, partNum, standardHotel)
  };



  const apiKey = "AIzaSyCgFponvaAfvr0TLaEabyBdVqzZ3gt-qxE"

  useEffect(() => {

    const storedAktywnosci = localStorage.getItem("aktywnosci") || initialAktywnosci2;
    setAktywnosci(JSON.parse(storedAktywnosci));
    if (storedAktywnosci) {
      try {
        const fixedElement = {
          nazwa: "Hotel Kalisz",
          adres: "Sofoklesa 32",
          czasZwiedzania: 60,
          koszt: "4,50 zł (bilet normalny), 3,50 zł (bilet ulgowy)",
          godzinaRozpoczecia: "12:30",
          godzinaZakonczenia: "00:00",
          miejsceRozpoczecia: "!",
          miejsceZakonczenia: "!",
          wybranaTrasa: 1,
        };

        const parsedAktywnosci = JSON.parse(storedAktywnosci);

        if (Array.isArray(parsedAktywnosci)) {
          setAktywnosci(parsedAktywnosci);
        } else {
          console.error("Dane w localStorage nie są poprawną tablicą:", parsedAktywnosci);
        }
      } catch (error) {
        console.error("Błąd parsowania JSON z localStorage:", error)
        setAktywnosci([[]])
      }
    }
  }, []);
  useEffect(() => {
    const storedAktywnosci = localStorage.getItem("hotele");

    if (storedAktywnosci) {
      try {
        const parsedAktywnosci = JSON.parse(storedAktywnosci);
        // Sprawdzamy, czy mamy obiekt i czy zawiera dane.hotels będące tablicą
        if (parsedAktywnosci && parsedAktywnosci.data && Array.isArray(parsedAktywnosci.data.hotels)) {
          const hotels = parsedAktywnosci.data.hotels;
          console.log("Tablica hoteli:", hotels);
        } else {
          console.error("Dane w localStorage nie zawierają poprawnej tablicy hoteli:", parsedAktywnosci);
        }
      } catch (error) {
        console.error("Błąd parsowania JSON z localStorage:", error);

      }
    }
  }, []);

  useEffect(() => {
    // Pobieranie harmonogramu z localStorage przy załadowaniu strony
    const storedSchedule = localStorage.getItem("schedule");


    if (storedSchedule) {
      try {
        const parsedSchedule = JSON.parse(storedSchedule);
        if (Array.isArray(parsedSchedule)) {
          setSchedule(parsedSchedule);
          //console.log("Załadowano schedule z localStorage:", parsedSchedule);
        } else {
          console.error("Dane w localStorage nie są poprawnym harmonogramem:", parsedSchedule);
        }
      } catch (error) {
        console.error("Błąd parsowania JSON z localStorage (schedule):", error);
      }
    }
  }, []);



















  useEffect(() => {
    // Nadpisanie metody setItem przy montowaniu komponentu
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function (key, value) {
      originalSetItem.apply(this, arguments);
      if (key === "startDate" || key === "endDate" || key == "standardHotel" || key == "partNum") {
        console.log("!!!!!TEST104")
        updateStoredDates();
      }
    };

    const handleStorageChange = (event) => {
      if (
        event.key === "startDate" ||
        event.key === "endDate" ||
        event.key === "standardHotel" ||
        event.key === "partNum"
      ) {
        updateStoredDates();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // Cleanup przy odmontowaniu komponentu
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      localStorage.setItem = originalSetItem;
    };
  }, []);
  // Aktualizacja stanu przy zmianie localStorage (np. w innej zakładce)
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "partNum") {
        setPartNum(Number(event.newValue) || 0);
      }
      if (event.key === "standardHotel") {
        setStandardHotel(Number(event.newValue) || 2);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);
  // Obliczanie liczby dni między datami przy każdej zmianie
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffMilliseconds = end - start;
      const diffDays = diffMilliseconds / (1000 * 60 * 60 * 24);
      setDni(diffDays + 1);
      // Opcjonalnie: resetowanie wybranego dnia, jeśli przekracza nową wartość dni
      if (wybranyDzien > diffDays) {
        setWybranyDzien(1);
      }
    }
  }, [startDate, endDate]);



  const moveActivityUp = (dayIndex, activityIndex) => {
    // Jeśli aktywność na pozycji 0 (fixed element) lub próbujemy przesunąć element, który
    // znajduje się zaraz poniżej fixed elementu, przerwij działanie.
    if (activityIndex === 0) return; // Element znajdujący się na początku nie może być przesunięty wyżej

    setAktywnosci(prev => {
      const newDays = [...prev];
      const dayActivities = [...newDays[dayIndex]];

      // Zamiana miejscami elementów
      [dayActivities[activityIndex - 1], dayActivities[activityIndex]] =
        [dayActivities[activityIndex], dayActivities[activityIndex - 1]];

      newDays[dayIndex] = dayActivities;
      return newDays;
    });
  };

  const moveActivityDown = (dayIndex, activityIndex) => {
    if (activityIndex >= aktywnosci[dayIndex].length - 1) return; // Nie można przesunąć ostatniej aktywności

    setAktywnosci(prev => {
      const newDays = [...prev];
      const dayActivities = [...newDays[dayIndex]];

      // Zamiana aktywności miejscami
      [dayActivities[activityIndex + 1], dayActivities[activityIndex]] =
        [dayActivities[activityIndex], dayActivities[activityIndex + 1]];

      newDays[dayIndex] = dayActivities;
      return newDays;
    });
    //setZmiana(true)
  };








  useEffect(() => {
    async function fetchDistances() {
      const result = await policzOdleglosci(aktywnosci, wybranyDzien - 1);

      setTravelData(result);
      setZmiana(true);
    }
    fetchDistances();
  }, [aktywnosci, wybranyDzien]);  // 🔥 Pobiera dane przy zmianie `aktywnosci` lub `wybranyDzien`



  // Funkcje do zmiany wybranego dnia
  const turnLeft = () => {

    if (wybranyDzien > 1) setWybranyDzien(wybranyDzien - 1);
  };

  const turnRight = () => {
    if (wybranyDzien < dni) setWybranyDzien(wybranyDzien + 1);
  };


  const handleRouteChange = (dayIndex, activityIndex, newValue) => {
    setAktywnosci(prev => {
      const newDays = [...prev]; // Kopiujemy dni
      const newActivities = [...newDays[dayIndex]]; // Kopiujemy aktywności dla danego dnia

      // Aktualizujemy wybraną trasę w odpowiedniej aktywności
      newActivities[activityIndex] = {
        ...newActivities[activityIndex],
        wybranaTrasa: newValue
      };
      aktywnosci[dayIndex][activityIndex].wybranaTrasa = newValue;
      newDays[dayIndex] = newActivities;
      return newDays;
    });
  };
  useEffect(() => {


    if (!aktywnosci.length || !travelData.length || !travelData[0]?.czasAutem) return;

    setSchedule((prevSchedule) => {
      if (!zmiana && prevSchedule.length > 0) {

        return prevSchedule;
      }
      setZmiana(false);   // Resetowanie zmiany
      let updatedSchedule = aktywnosci.map((dayActivities, dayIndex) => {
        let newDaySchedule = [];
        for (let j = 0; j < dayActivities.length; j++) {
          let travelTime = j === 0 ? baseTimes[dayIndex][0].czasAutem : parseDurationToMinutes(travelData[j - 1]?.czasAutem || "0 min");
          //if(j==0)console.log("test189", baseTimes[dayIndex])
          let rozp = j === 0 ? (prevSchedule[dayIndex].length > 0 ? prevSchedule[dayIndex][0].rozp : "06:00") : addMinutesToTime(newDaySchedule[j - 1].zak, travelTime);
          if (rozp != 1 && prevSchedule[dayIndex].length <= 0) console.log("CRITICAL TEST 2", addMinutesToTime(newDaySchedule[j - 1].zak, travelTime), newDaySchedule[j - 1].zak, travelTime)
          let zak = addMinutesToTime(rozp, dayActivities[j].czasZwiedzania);
          newDaySchedule.push({ rozp, zak });
        }
        return newDaySchedule;
      });

      return updatedSchedule;
    });
  }, [aktywnosci, travelData, zmiana]);

  useEffect(() => {
    const storedSchedule = localStorage.getItem("schedule");
    if (storedSchedule) {
      setSchedule(JSON.parse(storedSchedule));
    }
  }, []);



  const updateSchedule = (dayIndex, activityIndex, newTime) => {
    if (!/^\d{2}:\d{2}$/.test(newTime)) return; // Walidacja formatu HH:MM
    function parseTimeToMinutes(timeString) {
      const [hours, minutes] = timeString.split(":").map(Number);
      return hours * 60 + minutes;
    }

    setSchedule((prevSchedule) => {


      return prevSchedule.map((day, dIndex) => {
        if (dIndex !== dayIndex) return day; // Zmieniamy tylko wybrany dzień

        let updatedDay = [...day]; // Kopiujemy cały dzień
        let oldTime = updatedDay[activityIndex].rozp; // Pobieramy starą godzinę
        let offset = parseTimeToMinutes(newTime) - parseTimeToMinutes(oldTime); // Obliczamy przesunięcie

        console.log("Offset:", offset); // Debugowanie

        updatedDay[activityIndex] = {
          ...updatedDay[activityIndex],
          rozp: newTime,
          zak: addMinutesToTime(newTime, aktywnosci[dayIndex][activityIndex].czasZwiedzania),
        };

        // 🔹 **Propagowanie zmian do kolejnych aktywności**
        for (let i = activityIndex + 1; i < updatedDay.length; i++) {
          let prevZak = updatedDay[i - 1].zak; // Pobieramy nową godzinę zakończenia poprzedniej aktywności

          // Pobieramy czas przejazdu (jeśli dostępny, w przeciwnym razie domyślnie 0 min)
          const travelTime = parseDurationToMinutes(travelData[i - 1]?.czasAutem || "0 min");


          // Nowa godzina rozpoczęcia to koniec poprzedniej aktywności + czas przejazdu
          updatedDay[i].rozp = addMinutesToTime(prevZak, travelTime);
          updatedDay[i].zak = addMinutesToTime(updatedDay[i].rozp, aktywnosci[dayIndex][i].czasZwiedzania);
        }
        return updatedDay;
      });
    });

    // 🔹 **Opóźniona walidacja**
    setTimeout(() => {
      setSchedule((prevSchedule) => {
        return prevSchedule.map((day, dIndex) => {
          if (dIndex !== dayIndex) return day;

          let updatedDay = [...day];
          let prevZak = activityIndex > 0 ? updatedDay[activityIndex - 1].zak : "00:00"; // Pobranie zakończenia poprzedniej aktywności
          let travelTime = parseDurationToMinutes(travelData[activityIndex - 1]?.czasAutem || "0 min");

          // Pobranie aktualnie wpisanej godziny
          let currentTime = updatedDay[activityIndex].rozp;

          // 🔥 **Walidacja po 3 sekundach**
          if (parseTimeToMinutes(currentTime) < parseTimeToMinutes(prevZak) + travelTime) {
            console.warn("Wpisana godzina jest za wczesna! Resetuję do poprawnej wartości.");
            setZmiana(true);
            updatedDay[activityIndex].rozp = addMinutesToTime(prevZak, travelTime);
            updatedDay[activityIndex].zak = addMinutesToTime(updatedDay[activityIndex].rozp, aktywnosci[dayIndex][activityIndex].czasZwiedzania);
          }

          return updatedDay;
        });
      });
    }, 3000); // 3 sekundy opóźnienia
  };











  useEffect(() => {


    if (aktywnosci.length > 0) {

      localStorage.setItem("aktywnosci", JSON.stringify(aktywnosci));
      const storedData = localStorage.getItem("aktywnosci");
    }



  }, [aktywnosci]);
  useEffect(() => {
    if (schedule.length > 0) {
      localStorage.setItem("schedule", JSON.stringify(schedule));
    }
  }, [schedule]);

  const noweAktywnosciTest = [
    {
      nazwa: "Andersia Silver",
      adres: "Ostrów Tumski 17, Poznań",
      czasZwiedzania: 60,
      koszt: "4,50 zł (bilet normalny), 3,50 zł (bilet ulgowy)",
      godzinaRozpoczecia: "12:30",
      godzinaZakonczenia: "00:00",
      miejsceRozpoczecia: "!",
      miejsceZakonczenia: "!",
      wybranaTrasa: 1,
    },
    {
      nazwa: "Stary browar",
      adres: "Ostrów Tumski 17, Poznań",
      czasZwiedzania: 60,
      koszt: "4,50 zł (bilet normalny), 3,50 zł (bilet ulgowy)",
      godzinaRozpoczecia: "12:30",
      godzinaZakonczenia: "00:00",
      miejsceRozpoczecia: "!",
      miejsceZakonczenia: "!",
      wybranaTrasa: 1,
    },
  ]

  const addNewActivityFunction = async (wybranyDzien = 1) => {
    const num = Math.random() < 0.5 ? 0 : 1; // Ensure random selection of new activity
    const newActivity = noweAktywnosciTest[num]; // Select a random new activity

    setTravelData(prevTravelData => {
      const newTravelData = [...prevTravelData];

      // 🔹 Get the last activity of the selected day
      const dayActivities = aktywnosci[wybranyDzien - 1];
      if (dayActivities.length === 0) {
        console.warn("Brak wcześniejszych aktywności – dodajemy nową atrakcję bez podróży.");
      } else {
        const lastActivity = dayActivities[dayActivities.length - 1];
        try {
          // 🔹 Fetch travel time from lastActivity to newActivity
          axios.get(`http://localhost:5002/api/travel-info`, {
            params: { origin: lastActivity.nazwa, destination: newActivity.nazwa }
          }).then(response => {
            if (response.data) {
              let { czasPieszo, czasAutem, czasKomunikacja, trasaKomunikacja } = response.data;

              // 🔹 Add new travel data
              newTravelData.push({
                czasPieszo: roundTimeToNearest10(czasPieszo),
                czasAutem: roundTimeToNearest10(czasAutem),
                czasKomunikacja: roundTimeToNearest10(czasKomunikacja),
                trasaKomunikacja
              });

              setTravelData(newTravelData);
            } else {
              console.error("Błąd: brak danych podróży");
            }
          }).catch(error => {
            console.error("Błąd pobierania czasu podróży:", error);
          });
        } catch (error) {
          console.error("Błąd pobierania trasy:", error);
        }
      }

      return newTravelData;
    });

    // 🔹 Add the new activity **after** the travel data update! checked
    setTimeout(() => {
      setAktywnosci(prev => {
        const newDays = [...prev];
        newDays[wybranyDzien - 1] = [...newDays[wybranyDzien - 1], newActivity];
        setZmiana(true); // Trigger re-render
        return newDays;
      });
    }, 500) // Slight delay to ensure travelData updates first
  };

  const handleDeleteActivity = (activityIndex) => {
    if(aktywnosci[wybranyDzien - 1].length == 1)return;
    const dayIndex = wybranyDzien - 1;
    setAktywnosci(prev => {
      return prev.map((dayActivities, index) =>
        index === dayIndex
          ? dayActivities.filter((_, i) => i !== activityIndex) // Remove activity at activityIndex
          : dayActivities
      );
    });

    //setZmiana(true);
  };
  const addActivityFunction = async (element) => {

    const czasZwiedzania = await getCzasZwiedzania(element.name, element.address);
    const newActivity = {
      nazwa: element.name,
      adres: element.address,
      czasZwiedzania: czasZwiedzania,
      koszt: "4,50 zł (bilet normalny), 3,50 zł (bilet ulgowy)",
      godzinaRozpoczecia: aktywnosci[wybranyDzien-1].zak,
      godzinaZakonczenia: "00:00",
      miejsceRozpoczecia: "!",
      miejsceZakonczenia: "!",
      wybranaTrasa: 1,
    };


    setTravelData(prevTravelData => {
      const newTravelData = [...prevTravelData];

      const dayActivities = aktywnosci[wybranyDzien - 1];
      if (dayActivities.length === 0) {
        console.warn("Brak wcześniejszych aktywności – dodajemy nową atrakcję bez podróży.");
      } else {
        const lastActivity = dayActivities[dayActivities.length - 1];
        console.log("TEST2001", lastActivity.nazwa + miasto);
        try {
          axios.get(`http://localhost:5002/api/travel-info`, {
            params: { origin: lastActivity.nazwa + miasto , destination: newActivity.nazwa + miasto}
            
          }).then(response => {
            if (response.data) {
              let { czasPieszo, czasAutem, czasKomunikacja, trasaKomunikacja } = response.data;

              newTravelData.push({
                czasPieszo: roundTimeToNearest10(czasPieszo),
                czasAutem: roundTimeToNearest10(czasAutem),
                czasKomunikacja: roundTimeToNearest10(czasKomunikacja),
                trasaKomunikacja
              });

              setTravelData(newTravelData);
            } else {
              console.error("Błąd: brak danych podróży");
            }
          }).catch(error => {
            console.error("Błąd pobierania czasu podróży:", error);
          });
        } catch (error) {
          console.error("Błąd pobierania trasy:", error);
        }
      }

      return newTravelData;
    });

    // 🔹 **Dodanie aktywności po aktualizacji `setTravelData`**

    setAktywnosci(prev => {
      const newDays = [...prev];
      newDays[wybranyDzien - 1] = [...newDays[wybranyDzien - 1], newActivity];
      setZmiana(true);
      return newDays;
    });

  };

  const [requiredActivities, setRequiredActivities] = useState([])



  useEffect(() => {
    setAktywnosci(prevAktywnosci => {
      let updated = [...prevAktywnosci];

      if (updated.length < dni) {
        // Jeśli tablica jest krótsza niż dni, uzupełniamy brakujące elementy pustymi tablicami
        const missingDays = dni - updated.length;
        updated = updated.concat(Array.from({ length: missingDays }, () => []));
      }
      else if (dni > 0 && updated.length > dni) {
        // Jeśli tablica jest dłuższa, ustawiamy elementy od indeksu dni w górę jako puste tablice
        updated = updated.slice(0, dni);
        //updated = updated.map((item, index) => (index < dni ? item : []));
      }
      return updated;
    });
  }, [dni]);

  async function fetchTravelData(startP = "Wieza eiffla", stopP = "Sofoklesa 32", dateP = new Date().toISOString()) {
    const origin = startP;
    const destination = stopP;
    const date = dateP;
    try {

      const res = await fetchTravelInfo(origin, destination, date);
      return res
    } catch (error) {
      console.error(`Błąd w pobieraniu danych dla trasy ${origin} -> ${destination}:`, error);
    }
  }

  useEffect(() => {
    async function updateBaseTimes() {
      const stored = localStorage.getItem("baseTimes");
      let czyPobrane = false;

      if (stored && baseTimes[0] == "Abcd") {
        const parsed = JSON.parse(stored);
        setBaseTimes(parsed);
        czyPobrane = true;
        return;
      }
      let pom = Array.from({ length: dni }, () => [null, null]);

      // Upewnij się, że aktywności dla każdego dnia są dostępne.
      // W tym przykładzie pobieramy dane tylko, gdy istnieje co najmniej jeden element.
      for (let day = 0; day < dni; day++) {
        if (aktywnosci[day] && aktywnosci[day].length > 0) {
          // Dla danego dnia pobieramy dane dla pierwszego i ostatniego elementu.
          // Używamy Promise.all, aby równolegle pobrać oba wyniki.
          const firstActivity = aktywnosci[day][0];
          const lastActivity = aktywnosci[day][aktywnosci[day].length - 1];
          // Ustawianie parametrów dla zapytań:
          const startDataPromise = fetchTravelData(
            chosenHotel.nazwa,
            firstActivity.nazwa + firstActivity.adres
          );
          const endDataPromise = fetchTravelData(
            lastActivity.nazwa + lastActivity.adres,
            chosenHotel.nazwa
          );

          const [startData, endData] = await Promise.all([
            startDataPromise,
            endDataPromise
          ]);
          if (stored && baseTimes[0] != "Abcd") {
            startData.keyTime = baseTimes[day][0].keyTime
            //console.log("test190 ", endData.keyTime, aktywnosci[day], aktywnosci[day][aktywnosci[day].length - 1], schedule[day], schedule[day][schedule[day].length - 1].zak)
            
          }
          else {
            startData.keyTime = "04:12"
            
          }
          pom[day][0] = startData;
          console.log("test203", endData.czasAutem, parseDurationToMinutes(endData.czasAutem))
          endData.keyTime = addMinutesToTime(schedule[day][schedule[day].length - 1].zak, parseDurationToMinutes(endData.czasAutem));
          pom[day][1] = endData;

        }
      }

      // Po zakończeniu wszystkich asynchronicznych operacji ustaw stan baseTimes.
      setBaseTimes(pom);
    }

    updateBaseTimes();
  }, [dni, aktywnosci, chosenHotel, travelData, schedule]);

  const updateKeyTime = (val, day, index) => {
    setBaseTimes(prev => {
      // Tworzymy kopię całej tablicy
      const newBaseTimes = [...prev];
      // Kopiujemy podtablicę dla danego dnia
      newBaseTimes[day] = [...newBaseTimes[day]];
      // Kopiujemy obiekt, aby mieć nową referencję i aktualizujemy keyTime
      newBaseTimes[day][index] = {
        ...newBaseTimes[day][index],
        keyTime: val,
      };
      return newBaseTimes;
    });
  };

  useEffect(() => {
    setSchedule(prevSchedule =>
      prevSchedule.map((daySchedule, dayIndex) => {
        // Upewnij się, że dla danego dnia mamy dane w baseTimes oraz dzień posiada co najmniej jeden element
        if (baseTimes[dayIndex] && baseTimes[dayIndex][0] && daySchedule.length > 0) {
          let newRozp;
          if (baseTimes[dayIndex][0].keyTime && baseTimes[dayIndex][0].czasAutem) {
            newRozp = addMinutesToTime(
              baseTimes[dayIndex][0].keyTime,
              parseDurationToMinutes(baseTimes[dayIndex][0].czasAutem)
            );
            //console.log("WARNING1", baseTimes[dayIndex][0].keyTime, baseTimes[dayIndex][0].czasAutem, schedule, "ABCD", baseTimes[dayIndex][0].keyTime, baseTimes[dayIndex][0].czasAutem, newRozp ,addMinutesToTime("05:00", "22 mins"))
          } else {
            newRozp = daySchedule[0].rozp; // bez zmian
          }
          return [
            { ...daySchedule[0], rozp: newRozp },
            ...daySchedule.slice(1)
          ];
        }
        return daySchedule;
      })
    );
    if (baseTimes != "Abcd") {
      localStorage.setItem("baseTimes", JSON.stringify(baseTimes));
      // BASE TIMES", baseTimes)
    }
  }, [baseTimes]);
  

  











  useEffect(() => {
    async function fetchHotel() {
      setChosenHotel(testHotel)
      const city = "Poznań"
      let i = 0;
      try {
        const result = await znajdzHotel(city, startDate, endDate, partNum, standardHotel);
        let chosenHotel = null;
        console.log("test210", result)
        // Iteruj po hotelach, aż znajdziesz hotel, dla którego endpoint zwróci adres
        while (i < result.data.hotels.length) 
        {
          const currentHotel = result.data.hotels[i];
          // Łączymy nazwę hotelu z miastem – to przykładowe zapytanie, które wysyłamy do naszego endpointu
          const fullQuery = `${currentHotel.property.name} ${city}`;
          
          try {
            // Wywołanie endpointu, który zwraca adres dla danego obiektu
            const addressResponse = await axios.get("http://localhost:5002/api/object-address", {
              params: { name: fullQuery }
            });
            // Sprawdzamy, czy zwrócony adres jest prawidłowy (możesz dopasować warunek do swoich potrzeb)
            if (addressResponse.data && addressResponse.data.address) {
              chosenHotel = currentHotel;
              // Możesz też do zmiennej dodać pobrany adres, np.:
              chosenHotel.resolvedAddress = addressResponse.data.address;
              if(chosenHotel.resolvedAddress.includes("ul.") || chosenHotel.resolvedAddress.includes("ulica") || /\d/.test(chosenHotel.resolvedAddress))
                {
                  
                  break;

                }
              //break;
            }
          } catch (error) {
            console.error(`Błąd przy pobieraniu adresu dla ${fullQuery}:`, error);
            // Jeśli wystąpi błąd, kontynuujemy iterację
          }
          i++;
          
        }
        
        // Jeśli żaden hotel nie spełnia warunków, możesz np. użyć pierwszego hotelu z wyniku
        if (!chosenHotel && result.data.hotels.length > 0) {
          chosenHotel = result.data.hotels[0];
        }
        
        // Wyciągnij dane z wybranego hotelu
        const price = chosenHotel?.property?.priceBreakdown?.grossPrice?.value;
        const nazwa = chosenHotel?.property?.name;
        const stars = chosenHotel?.property?.propertyClass;
        const checkin = chosenHotel?.property?.checkin?.fromTime;
        const checkout = chosenHotel?.property?.checkout?.untilTime;
        const hotelId = chosenHotel?.hotel_id;
        
        // Utwórz unikalny klucz w oparciu o parametry
        const localKey = `hotel_${city}_${startDate}_${endDate}_${partNum}_${standardHotel}`;
        const dataToStore = {
          price,
          nazwa,
          stars,
          checkin,
          checkout,
          hotelId,
          adres: chosenHotel.resolvedAddress || null,
          savedAt: Date.now(),
        };
        setChosenHotel(dataToStore);
        //console.log("Zapisuję dane hotelu:", dataToStore, localKey);
        localStorage.setItem(localKey, JSON.stringify(dataToStore));
        //console.log("Zapisane dane:", JSON.parse(localStorage.getItem(localKey)));
      } catch (error) {
        console.error("Błąd podczas pobierania hoteli:", error);
      }
    }
    
    fetchHotel();
  }, [startDate, endDate, partNum, standardHotel /*przyjazd, wyjazd, goscie, standard*/]);




  
  //console.log("test202", baseTimes)
  return (
    <>  
      <div className='DaysSwitch'>
        <ArrowButton onclick={turnLeft} />
        <div className='DaysCounter'>
          Dzień {wybranyDzien}
        </div>
        <ArrowButton onclick={turnRight} a={true} />
      </div>
      <div className='aktywnosci-konfigurator'>








        <LoadScript googleMapsApiKey={apiKey}>
          <div className="ProgramTileContainer">
            <div className='ProgramTile--buttons'>
              <div className='controlling-buttons'>
                <ArrowButton2 />
                <TrashButton />
                <ArrowButton2 rot={180} />
              </div>
              <ProgramTile
                aktywnosc={chosenHotel}
                rozp={baseTimes[wybranyDzien - 1]?.[0]?.keyTime || "09:00"}
                onChangeRozp={(e) => updateKeyTime(e.target.value, wybranyDzien - 1, 0)}
                zak={"07:00"}
                typ={"hotel"}
              />
            </div>
            <div className='route-buttons'>
              <RouteChoice
                key={testHotel.nazwa}
                value={testHotel.wybranaTrasa}
                //busTime={210}
                //walkTime={120} 
                //carTime={320}
                walkTime={baseTimes[wybranyDzien - 1][0].czasPieszo ? baseTimes[wybranyDzien - 1][0].czasPieszo : "Ładowanie.."}
                carTime={baseTimes[wybranyDzien - 1][0].czasAutem ? baseTimes[wybranyDzien - 1][0].czasAutem : "Ładowanie.."}
                busTime={baseTimes[wybranyDzien - 1][0].czasKomunikacja ? baseTimes[wybranyDzien - 1][0].czasKomunikacja : "Ładowanie.."}

              />
            </div>
          </div>
          {aktywnosci[wybranyDzien - 1]?.map((akt, index) => (
            <div className="ProgramTileContainer" key={index}>
              <div className='ProgramTile--buttons'>
                <div className='controlling-buttons'>
                  <ArrowButton2 onClick={() => moveActivityUp(wybranyDzien - 1, index)} />
                  <TrashButton onClick={() => handleDeleteActivity(0, index)} />
                  <ArrowButton2 rot={180} onClick={() => moveActivityDown(wybranyDzien - 1, index)} />
                </div>
                <ProgramTile
                  aktywnosc={akt}
                  rozp={schedule[wybranyDzien - 1]?.[index]?.rozp || "07:00"}
                  onChangeRozp={(e) => updateSchedule(wybranyDzien - 1, index, e.target.value)}
                  zak={schedule[wybranyDzien - 1]?.[index]?.zak || "07:00"}
                  onChangeZak={(e) => updateSchedule(wybranyDzien - 1, index, e.target.value)}
                />
              </div>

              <div className='route-buttons'>
                <RouteChoice
                  key={akt.nazwa}
                  value={akt.wybranaTrasa}
                  onChange={(newValue) => handleRouteChange(wybranyDzien - 1, index, newValue)}
                  busTime={
                    index === aktywnosci[wybranyDzien - 1].length - 1
                      ? (baseTimes[wybranyDzien - 1][1]?.czasKomunikacja || "Ładowanie..")
                      : (travelData.length > index ? travelData[index].czasKomunikacja : "Ładowanie...")
                  }
                  walkTime={
                    index === aktywnosci[wybranyDzien - 1].length - 1
                      ? (baseTimes[wybranyDzien - 1][1]?.czasPieszo || "Ładowanie..")
                      : (travelData.length > index ? travelData[index].czasPieszo : "Ładowanie...")
                  }
                  carTime={
                    index === aktywnosci[wybranyDzien - 1].length - 1
                      ? (baseTimes[wybranyDzien - 1][1]?.czasAutem || "Ładowanie..")
                      : (travelData.length > index ? travelData[index].czasAutem : "Ładowanie...")
                  }
                  
                />
              </div>
            </div>
          ))}
          <div className="ProgramTileContainer">
            <div className='ProgramTile--buttons'>
              <div className='controlling-buttons'>
                <ArrowButton2 />
                <TrashButton />
                <ArrowButton2 rot={180} />
              </div>
              <ProgramTile
                aktywnosc={chosenHotel}
                rozp={baseTimes[wybranyDzien - 1]?.[1]?.keyTime || "09:00"}
                onChangeRozp={(e) => updateKeyTime(e.target.value, wybranyDzien - 1, 0)}
                zak={"07:00"}
                typ={"hotel"}
              />
            </div>
            <div className='route-buttons'>
              <RouteChoice
                key={testHotel.nazwa}
                value={testHotel.wybranaTrasa}
                //busTime={210}
                //walkTime={120} 
                //carTime={320}
                walkTime={baseTimes[wybranyDzien - 1][1].czasPieszo ? baseTimes[wybranyDzien - 1][1].czasPieszo : "Ładowanie.."}
                carTime={baseTimes[wybranyDzien - 1][1].czasAutem ? baseTimes[wybranyDzien - 1][1].czasAutem : "Ładowanie.."}
                busTime={baseTimes[wybranyDzien - 1][1].czasKomunikacja ? baseTimes[wybranyDzien - 1][1].czasKomunikacja : "Ładowanie.."}

              />
            </div>
          </div>
        </LoadScript>
      </div>

      <AddActivityButton addingFunction={(element) => addActivityFunction(element)} />
      <button onClick={() => addNewActivityFunction(wybranyDzien + 1)}>TEST123</button>
      {/*<HotelsSearch
        city="Poznań"
        przyjazd={startDate}
        wyjazd={endDate}
        goscie={partNum}
        opiekunowie={0}
        standard={standardHotel}
      />*/}
      

    </>
  );
};
