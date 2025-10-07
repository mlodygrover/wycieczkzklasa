import React, { useState, useEffect } from "react";
import axios from "axios";


const znajdzIdMiasta = async (city) => {
  try {
    const response = await axios.request({
      method: 'GET',
      url: 'https://booking-com15.p.rapidapi.com/api/v1/hotels/searchDestination',
      params: { query: city },
      headers: {
        'x-rapidapi-key': '0782357000mshc6b75c7b25bfe26p1e9edfjsn2ce535c3093c',
        'x-rapidapi-host': 'booking-com15.p.rapidapi.com'
      }
    });
    return response.data.data[0].dest_id;
  } catch (error) {
    console.error('Błąd podczas wyszukiwania ID miasta:', error);
    throw error;
  }

};
const znajdzDostepneHotele = async (idMiasta="-523642", przyjazd = '2025-03-22', wyjazd = '2025-03-24', lGosci = 2, hStandard = 'class::2, class::3') => {
    //console.log("test192", idMiasta, przyjazd, wyjazd, hStandard)
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

        /*
        dest_id: '-523642',
        search_type: 'CITY',
        arrival_date: '2025-03-22',
        departure_date: '2025-03-24',
        adults: lGosci,
        room_qty: '1',
        page_number: '1',
        sort_by: 'price',
        categories_filter: hStandard,
        units: 'metric',
        temperature_unit: 'c',
        languagecode: 'pl',
        currency_code: 'PLN'
        */
      },
      headers: {
        'x-rapidapi-key': '0782357000mshc6b75c7b25bfe26p1e9edfjsn2ce535c3093c',
        'x-rapidapi-host': 'booking-com15.p.rapidapi.com'
      }
    };
  
    try {
      const response = await axios.request(options);
      //console.log(response.data);
      return response.data;
    } catch (error) {
      console.error('Błąd podczas wyszukiwania dostępnych hoteli:', error);
      throw error;
    }
  };







  export const znajdzHotel = async (
    city = "Poznań",
    przyjazd = "2025-03-22",
    wyjazd = "2025-03-24",
    goscie = 30,
    hStandard = 2
  ) => {
    
    //console.log("test201",city, przyjazd,wyjazd,goscie,hStandard)
    // Ustal filtrowanie standardu hoteli na podstawie przekazanego hStandard
    const filterStandard =
      hStandard === 1
        ? "class::0, class::1"
        : hStandard === 2
        ? "class::2, class::3"
        : "class::4, class::5";
  
    // Utwórz klucz lokalnego magazynu zawierający parametry zapytania
    const localKey = `hotele_${city}_${przyjazd}_${wyjazd}_${goscie}_${hStandard}`;
    // Ustal okres ważności danych (np. 24 godziny)
    const expirationTime = 24 * 60 * 60 * 1000; // 24h w ms
    
    // Sprawdź, czy w localStorage znajdują się już zapisane dane dla tego klucza
    const storedDataString = localStorage.getItem(localKey);
    if (storedDataString) {
      //console.log("W1!!!", localKey)
      const storedData = JSON.parse(storedDataString);
      // Jeśli dane mają timestamp i nie są przedawnione, użyj ich
      if (storedData.timestamp && Date.now() - storedData.timestamp < expirationTime) {
        //console.log("Używam zapisanych danych hoteli z localStorage", storedData);
        return storedData.data;
      }
    }
    
    try {
      // Pobierz ID miasta
      const idMiastaBooking = await znajdzIdMiasta(city);
      //console.log("ID miasta:", idMiastaBooking);
  
      // Pobierz dostępne hotele dla danego ID, dat, liczby gości oraz filtra standardu
      const hotele = await znajdzDostepneHotele(
        idMiastaBooking,
        przyjazd,
        wyjazd,
        goscie,
        filterStandard
      );
      //console.log("test203", city, przyjazd, wyjazd, goscie, filterStandard)
      console.log("Dostępne hotele222:", hotele.data);
  
      // Przygotuj obiekt do zapisania w localStorage
      const toStore = {
        timestamp: Date.now(),
        data: hotele,
        params: { city, przyjazd, wyjazd, goscie, hStandard }
        
      };
      
      localStorage.setItem(localKey, JSON.stringify(toStore));
      return hotele;
    } catch (error) {
      console.error("Błąd w funkcji znajdzHotel:", error);
      throw error;
    }
  };
  
  export const HotelsSearch = ({
    city = "Poznań",
    przyjazd = localStorage.getItem("startDate"),
    wyjazd = localStorage.getItem("endDate"),
    goscie = Number(localStorage.getItem("partNum")),
    opiekunowie = 0,
    standard = Number(localStorage.getItem("standardHotel")),
  }) => {
    useEffect(() => {
      async function fetchHotel() {
        let i = 0;
        try {
          const result = await znajdzHotel(city, przyjazd, wyjazd, goscie, standard);
          let chosenHotel = null;
          console.log("test2001", result)
          // Iteruj po hotelach, aż znajdziesz hotel, dla którego endpoint zwróci adres
          while (i < result.data.hotels.length) {
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
                if(chosenHotel.resolvedAddress.includes("ul.") || chosenHotel.resolvedAddress.includes("ulica") )
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
          const localKey = `hotel_${city}_${przyjazd}_${wyjazd}_${goscie}_${standard}`;
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
          
          //console.log("Zapisuję dane hotelu:", dataToStore, localKey);
          localStorage.setItem(localKey, JSON.stringify(dataToStore));
          //console.log("Zapisane dane:", JSON.parse(localStorage.getItem(localKey)));
        } catch (error) {
          console.error("Błąd podczas pobierania hoteli:", error);
        }
      }
      
      fetchHotel();
    }, [city, przyjazd, wyjazd, goscie, standard]);
    
    return;
  };
  
