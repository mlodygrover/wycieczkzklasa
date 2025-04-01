const express = require('express');
const axios = require('axios');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = 5002;

app.use(cors());
app.use(express.json());
const API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_API_KEY = API_KEY;
const OPENAI_API_KEY = "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"
const uri = "mongodb+srv://admin:Karimbenzema9@cluster0.1u4tl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const SERPAPI_KEY = "0b128158989c3289368318d44c823dae1118db7c50c2a06e6f06de41403d49c4"
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Połączono z MongoDB w chmurze"))
    .catch((err) => console.error("Błąd połączenia z MongoDB:", err));

/**
 * Pobiera trasę komunikacją miejską dla podanej godziny.
 * Uwzględnia dojście do przystanku i z przystanku.
 * @param {string} origin - Punkt początkowy
 * @param {string} destination - Punkt docelowy
 * @param {string} departureTime - Czas w formacie UNIX timestamp
 * @returns {Object} Obiekt zawierający trasę i łączny czas przejazdu komunikacją miejską
 */
async function getTransitRoute(origin, destination, departureTime) {
    try {
        const response = await axios.get(`https://maps.googleapis.com/maps/api/directions/json`, {
            params: {
                origin: origin,
                destination: destination,
                key: API_KEY,
                mode: "transit",
                transit_mode: "bus|subway|train|tram",
                departure_time: departureTime // Godzina przejazdu
            }
        });

        const transitRoutes = response.data.routes || [];

        if (transitRoutes.length === 0) {
            return { czasKomunikacja: "Brak danych", trasaKomunikacja: [] };
        }

        const firstRoute = transitRoutes[0].legs[0]; // Pobranie pierwszej dostępnej trasy
        const routeSteps = [];
        let totalTransitTime = 0; // Czas całkowity podróży komunikacją

        firstRoute.steps.forEach(step => {
            if (step.travel_mode === "WALKING") {
                routeSteps.push({
                    typ: "Pieszo",
                    start: step.start_location,
                    koniec: step.end_location,
                    czasPrzejazdu: step.duration.text,
                    opis: step.html_instructions.replace(/<[^>]+>/g, '') // Usunięcie znaczników HTML
                });
            } else if (step.travel_mode === "TRANSIT") {
                routeSteps.push({
                    typ: step.transit_details.line.vehicle.type || "Nieznany",
                    linia: step.transit_details.line.short_name || "Brak danych",
                    przystanekStart: step.transit_details.departure_stop.name,
                    przystanekKoniec: step.transit_details.arrival_stop.name,
                    czasPrzejazdu: step.duration.text
                });
            }

            // Dodanie czasu do całkowitego czasu komunikacji
            if (step.duration?.value) {
                totalTransitTime += step.duration.value;
            }
        });

        return {
            czasKomunikacja: totalTransitTime > 0 ? `${Math.round(totalTransitTime / 60)} min` : "Brak danych",
            trasaKomunikacja: routeSteps
        };
    } catch (error) {
        console.error("Błąd podczas pobierania trasy komunikacją miejską:", error);
        return { czasKomunikacja: "Błąd", trasaKomunikacja: [] };
    }
}




// Endpoint do pobierania informacji o podróży
const routeSchema = new mongoose.Schema({
    start: { type: String, required: true },
    end: { type: String, required: true },
    date: { type: Date, default: Date.now },
    czasAutem: String,
    czasPieszo: String,
    czasKomunikacja: String,
    trasaKomunikacja: Array
});
const Route = mongoose.model('Route', routeSchema, "TRASY");
app.get('/api/travel-info', async (req, res) => {
    try {

        const { origin, destination, date } = req.query;
        if (!origin || !destination) {
            return res.status(400).json({ error: "Brak wymaganych parametrów" });
        }

        // Sprawdzamy, czy rekord już istnieje w bazie (przyjmujemy, że w polu start zapisujemy wartość origin, a w end – destination)
        const cachedRoute = await Route.findOne({ start: origin, end: destination });
        if (cachedRoute) {
            console.log("Znaleziono zapis w bazie");
            return res.json(cachedRoute);

            
        }
        /*
        // Jeśli rekord nie istnieje, obliczamy trasę
        const departureTime = date
            ? Math.floor(new Date(date).getTime() / 1000)
            : Math.floor(Date.now() / 1000);

        // Pobieranie czasu przejazdu samochodem
        const drivingResponse = await axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json`, {
            params: {
                origins: origin,
                destinations: destination,
                key: API_KEY,
                mode: "driving"
            }
        });

        // Pobieranie czasu przejścia pieszo
        const walkingResponse = await axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json`, {
            params: {
                origins: origin,
                destinations: destination,
                key: API_KEY,
                mode: "walking"
            }
        });

        // Pobieranie trasy komunikacją miejską
        const { czasKomunikacja, trasaKomunikacja } = await getTransitRoute(origin, destination, departureTime);

        const driving = drivingResponse.data.rows[0]?.elements[0] || {};
        const walking = walkingResponse.data.rows[0]?.elements[0] || {};
        */
        const randomN = () => Math.floor(Math.random() * (20 - 5 + 1)) + 5;
        const randint = randomN();
        console.log("TEST3", randint, 3 * randint, 2 * randint)
        const result = {
            start: origin,
            end: destination,
            czasAutem: String(randint) + "mins",//driving.duration?.text || "Brak danych",
            czasPieszo: String(3 * randint) + "mins",//walking.duration?.text || "Brak danych",
            czasKomunikacja: String(2 * randint) + "mins",//,
            trasaKomunikacja: []
        };

        // Zapisujemy wynik w bazie
        const newRoute = new Route(result);
        await newRoute.save();
        console.log("Trasa została pomyślnie zapisana w bazie:", result);

        res.json(result);
    } catch (error) {
        console.error("Błąd w /api/travel-info:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Błąd serwera" });
    }
});



app.get('/api/popular-attractions', async (req, res) => {
    try {
        const { city } = req.query;

        if (!city) {
            return res.status(400).json({ error: "City parameter is required" });
        }

        console.log(`Fetching popular attractions in ${city} (Polish language) - Fetching all pages`);

        let attractions = [];
        let nextPageToken = null;

        do {
            // Wysyłamy zapytanie do Google API
            const response = await axios.get(`https://maps.googleapis.com/maps/api/place/textsearch/json`, {
                params: {
                    query: `popularne atrakcje turystyczne w ${city}`,
                    key: API_KEY,
                    language: "pl",
                    pagetoken: nextPageToken // Jeśli istnieje token, pobieramy kolejne strony
                }
            });

            if (!response.data.results) {
                return res.status(404).json({ error: "No results found" });
            }

            // Dodajemy nowe wyniki do listy atrakcji
            attractions.push(...response.data.results.map(place => ({
                name: place.name,
                address: place.formatted_address,
                rating: place.rating || "Brak oceny",
                user_ratings_total: place.user_ratings_total || 0,
                place_id: place.place_id,
                location: place.geometry.location,
                photo_reference: place.photos ? place.photos[0].photo_reference : null
            })));

            // Pobieramy next_page_token
            nextPageToken = response.data.next_page_token;

            // Google API wymaga odczekania 2 sekund przed użyciem next_page_token!
            if (nextPageToken) {
                console.log("Next page token found, waiting 2 seconds...");
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

        } while (nextPageToken); // Jeśli jest kolejna strona, kontynuujemy pobieranie

        res.json({ city, attractions });
    } catch (error) {
        console.error("Error fetching tourist attractions:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});



async function estimateZwiedzanieNonReviews(nazwa, adres) {
    try {
        // Zapytanie do OpenAI o oszacowanie czasu zwiedzania
        const gptResponse = await axios.post("https://api.openai.com/v1/chat/completions", {
            model: "gpt-4o",
            messages: [
                { role: "system", content: "Jesteś ekspertem od podróży. Oszacuj czas zwiedzania atrakcji turystycznej." },
                { role: "user", content: `Podaj szacowany czas zwiedzania atrakcji: ${nazwa} znajdującej się pod adresem: ${adres}. Wynik zwróć w minutach jako samą liczbę. Jeśli nie masz danych, zwróć '45'` }
            ]
        }, {
            headers: { "Authorization": `Bearer ${OPENAI_API_KEY}` }
        });

        let estimatedTime = gptResponse.data.choices[0]?.message?.content?.trim();

        if (!estimatedTime || estimatedTime.toLowerCase().includes("brak") || isNaN(parseInt(estimatedTime))) {
            console.warn("Nie udało się uzyskać poprawnego oszacowania czasu zwiedzania.");
            return 1; // Domyślnie zwraca 45 minut
        }

        return parseInt(estimatedTime, 10);
    } catch (error) {
        console.error("Błąd w estimateZwiedzanieNonReviews:", error.response?.data || error.message);
        return 2; // W razie błędu zwracamy domyślnie 45 minut
    }
}

async function estimateZwiedzanie(nazwa, adres) {

    try {
        // Pobranie place_id z Google Places API
        const googleResponse = await axios.get(`https://maps.googleapis.com/maps/api/place/findplacefromtext/json`, {
            params: {
                input: `${nazwa}, ${adres}`,
                inputtype: "textquery",
                fields: "place_id",
                key: API_KEY
            }
        });

        const placeId = googleResponse.data.candidates[0]?.place_id;
        if (!placeId) {
            console.warn("Nie znaleziono miejsca w Google API.");
            return estimateZwiedzanieNonReviews(nazwa, adres);
        }

        // Pobranie recenzji miejsca
        const detailsResponse = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json`, {
            params: {
                place_id: placeId,
                fields: "reviews",
                key: API_KEY
            }
        });

        const reviews = detailsResponse.data.result?.reviews || [];
        if (reviews.length === 0) {
            console.warn("Brak recenzji dla tego miejsca.");
            return estimateZwiedzanieNonReviews(nazwa, adres);
        }
        console.log("1 test", reviews)
        const allReviewsText = reviews.map(r => r.text).join(" ");

        // Analiza recenzji przez OpenAI
        const gptResponse = await axios.post("https://api.openai.com/v1/chat/completions", {
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "Jesteś ekspertem od podróży. Oszacuj czas zwiedzania na podstawie recenzji." },
                { role: "user", content: `Recenzje: ${allReviewsText}. Ile zajmuje zwiedzanie tej atrakcji w minutach? Jeśli brak danych, zwróć sam oszacuj ten czas na bazie dostepnych dla ciebie danych. Wynikiem niech będzie sama liczba!!` }
            ]
        }, {
            headers: { "Authorization": `Bearer ${OPENAI_API_KEY}` }
        });

        let estimatedTime = gptResponse.data.choices[0]?.message?.content?.trim();

        if (!estimatedTime || estimatedTime.toLowerCase().includes("brak") || isNaN(parseInt(estimatedTime))) {
            console.log("blad1", estimatedTime)
            return "BRAK";
        }

        return parseInt(estimatedTime, 10);
    } catch (error) {
        console.error("Błąd w estimateZwiedzanie:", error.response?.data || error.message);
        console.log("blad2")
        return "BRAK";
    }
}

app.get('/api/estimate-zwiedzanie', async (req, res) => {
    const { nazwa, adres } = req.query;

    if (!nazwa || !adres) {
        return res.status(400).json({ error: "Brak wymaganych parametrów." });
    }

    const czasZwiedzania = await estimateZwiedzanie(nazwa, adres);
    console.log("2 test", czasZwiedzania)
    res.json({ czasZwiedzania });
});




const RAPIDAPI_KEY = '5678365077msh7ef633b67e5a401p1ffa1fjsnd1d3fbe26a25';
const RAPIDAPI_HOST = 'hotels-com6.p.rapidapi.com';

/**
 * Pobiera destinationId dla podanego miasta
 */
async function getDestinationId(city) {
    console.log("6 test", city)
    return "2858";
    try {
        const response = await axios.get(`https://hotels-com6.p.rapidapi.com/locations/search`, {
            params: { query: city, locale: "pl_PL" }, // Może być też countryCode: "PL"
            headers: {
                "X-RapidAPI-Key": RAPIDAPI_KEY,
                "X-RapidAPI-Host": RAPIDAPI_HOST
            }
        });

        console.log("Pełna odpowiedź API:", response.data);

        if (response.data?.suggestions?.length > 0) {
            const destination = response.data.suggestions[0].entities[0]; // Pobierz pierwsze pasujące miejsce
            console.log("3 test!!", destination.destinationId, city);
            return destination.destinationId;
        } else {
            console.warn("Brak danych dla miasta:", city);
            return null;
        }
    } catch (error) {
        console.error("Błąd podczas pobierania destinationId:", error);
        return null;
    }
}

/**
 * Pobiera listę hoteli na podstawie miasta, dat i liczby osób
 */
async function getHotels(city, checkIn, checkOut, guests) {
    const destinationId = await getDestinationId(city); // Pobierz destinationId

    if (!destinationId) {
        console.error("Błąd: Nie znaleziono destinationId dla miasta:", city);
        return { error: "Nie znaleziono destinationId dla miasta" };
    }

    try {
        const response = await axios.get(`https://hotels-com6.p.rapidapi.com/hotels/search`, {
            params: {
                locale: "pl_PL",
                currency: "PLN",
                checkinDate: '2025-03-05',  // Data w formacie YYYY-MM-DD
                checkoutDate: "2025-03-16",
                adults_number: guests,
                locationId: '2858', // Upewnij się, że to poprawne ID
                sort_order: "RECOMMENDED" // Sortowanie np. według popularności
            },
            headers: {
                "X-RapidAPI-Key": RAPIDAPI_KEY,
                "X-RapidAPI-Host": RAPIDAPI_HOST
            }
        });

        console.log("7 test", response.data);

        return response.data?.properties || [];
    } catch (error) {
        console.error("Błąd podczas pobierania hoteli:", error.response?.data || error.message);
        return { error: "Nie udało się pobrać danych o hotelach" };
    }
}


// Endpoint API do pobierania hoteli
app.get('/api/hotels', async (req, res) => {
    const { city, checkIn, checkOut, guests } = req.query;

    if (!city || !checkIn || !checkOut || !guests) {
        return res.status(400).json({ error: "Brak wymaganych parametrów" });
    }

    const hotels = await getHotels(city, checkIn, checkOut, guests);
    console.log("8 test", hotels)
    res.json(hotels);
});

// Dodaj ten kod do swojego pliku serwera, np. server.js

// Endpoint, który dla podanej nazwy obiektu zwraca jego adres
app.get('/api/object-address', async (req, res) => {
    const { name } = req.query;

    if (!name) {
        return res.status(400).json({ error: 'Parametr "name" jest wymagany' });
    }

    try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
                address: name,          // Szukamy adresu dla podanej nazwy
                key: GOOGLE_API_KEY     // Używamy klucza API pobranego z .env (lub innego źródła)
            }
        });

        if (response.data.status === 'OK' && response.data.results.length > 0) {
            const formattedAddress = response.data.results[0].formatted_address;
            return res.json({ address: formattedAddress });
        } else {
            return res.status(404).json({ error: 'Nie znaleziono adresu dla podanej nazwy.' });
        }
    } catch (error) {
        console.error('Błąd podczas pobierania adresu:', error);
        return res.status(500).json({ error: 'Błąd serwera' });
    }
});
const atrakcjaSchema = new mongoose.Schema(
    {
        dataDodania: { type: String, required: true },
        miasto: { type: String, required: true },
        nazwa: { type: String, required: true },
        adres: { type: String, required: true },
        czasZwiedzania: { type: Number },
        cenaOsoba: { type: Number },
        idGoogle: { type: String },
        ocenaGoogle: { type: Number },
        liczbaOcen: { type: Number },
        zdjecia: { type: [String] },
        location: {
            lat: Number,
            lng: Number
        }

    }
)
const Atrakcja = mongoose.model("Atrakcja", atrakcjaSchema);

async function updatePopularAttractions(tablePopular, miasto) {
    // Iterujemy po każdej atrakcji z tablePopular
    for (const attraction of tablePopular) {
        // Pobieramy googleId z pola place_id
        const googleId = attraction.place_id;
        try {
            // Sprawdzamy, czy atrakcja z danym googleId już istnieje
            const existing = await Atrakcja.findOne({ idGoogle: googleId });
            if (!existing) {

                const czas = await estimateZwiedzanie(attraction.name, attraction.address);
                // Jeśli nie istnieje, tworzymy nowy dokument
                const newAtrakcja = new Atrakcja({
                    dataDodania: new Date().toISOString().slice(0, 10), // format YYYY-MM-DD
                    miasto: miasto,
                    nazwa: attraction.name,
                    adres: attraction.address,
                    // Jeśli nie masz danych dla tych pól, możesz ustawić domyślne wartości (np. 0)
                    czasZwiedzania: typeof czas === 'number' ? czas : 452,
                    cenaOsoba: 0,
                    idGoogle: googleId,
                    ocenaGoogle: attraction.rating || 0,
                    liczbaOcen: attraction.user_ratings_total || 0
                });
                await newAtrakcja.save();
                console.log(`Dodano nową atrakcję: ${attraction.name}`);
            } else {
                console.log(`Atrakcja z googleId ${googleId} już istnieje.`);
            }
        } catch (error) {
            console.error(`Błąd przy aktualizacji atrakcji ${attraction.name}:`, error);
        }
    }
}
async function fetchMuseumsInCity(city) {
    console.log(`Fetching museums in ${city} (Polish language) - Fetching all pages`);
    let museums = [];
    let nextPageToken = null;

    do {
        // Wywołanie Google Places z parametrem "muzea w {city}"
        const response = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
            params: {
                query: `muzea w ${city}`,  // modyfikujemy query
                key: API_KEY,              // klucz API
                language: 'pl',
                pagetoken: nextPageToken,  // jeśli Google zwraca kolejny token
            }
        });

        if (!response.data.results) {
            break;
        }

        // Przekształcamy wyniki w taki sam format, co w fetchPopularAttractions
        museums.push(
            ...response.data.results.map(place => ({
                name: place.name,
                address: place.formatted_address,
                rating: place.rating || "Brak oceny",
                user_ratings_total: place.user_ratings_total || 0,
                place_id: place.place_id,
                location: place.geometry.location,
                photo_reference: place.photos ? place.photos[0].photo_reference : null
            }))
        );

        nextPageToken = response.data.next_page_token;
        if (nextPageToken) {
            console.log("Next page token found for museums, waiting 2 seconds...");
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    } while (nextPageToken);

    return museums;
}

async function fetchPopularAttractions(city) {
    console.log(`Fetching popular attractions in ${city} (Polish language) - Fetching all pages`);
    let attractions = [];
    let nextPageToken = null;

    do {
        const response = await axios.get(`https://maps.googleapis.com/maps/api/place/textsearch/json`, {
            params: {
                query: `popularne atrakcje turystyczne w ${city}`,
                key: API_KEY,
                language: "pl",
                pagetoken: nextPageToken // Jeśli istnieje token, pobieramy kolejne strony
            }
        });

        if (!response.data.results) {
            break;
        }

        attractions.push(...response.data.results.map(place => ({
            name: place.name,
            address: place.formatted_address,
            rating: place.rating || "Brak oceny",
            user_ratings_total: place.user_ratings_total || 0,
            place_id: place.place_id,
            location: place.geometry.location,
            photo_reference: place.photos ? place.photos[0].photo_reference : null
        })));

        nextPageToken = response.data.next_page_token;
        if (nextPageToken) {
            console.log("Next page token found, waiting 2 seconds...");
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    } while (nextPageToken);

    return { city, attractions };
}

// Endpoint pobierający atrakcje z bazy, a jeśli brak wyników – popularne atrakcje z Google API
app.get('/api/pobierz-atrakcje', async (req, res) => {
    const { miasto } = req.query;

    if (!miasto) {
        return res.status(400).json({ error: "Parametr 'miasto' jest wymagany." });
    }

    try {
        const atrakcje = await Atrakcja.find({ miasto });
        if (atrakcje.length > 0) {
            res.json(atrakcje);
        } else {
            // Pobieramy popularne atrakcje
            const popular = await fetchPopularAttractions(miasto);
            let tablePopular = popular.attractions; // tablica atrakcji

            // Dodatkowo pobieramy muzea
            const museums = await fetchMuseumsInCity(miasto);

            // Łączymy wyniki popularnych atrakcji z muzeami
            // Możesz je dodać na końcu, na początku lub przefiltrować duplikaty według place_id
            tablePopular = [...tablePopular, ...museums];

            // Aktualizujemy bazę, dodając nowe atrakcje, jeśli ich wcześniej nie było
            await updatePopularAttractions(tablePopular, miasto);

            res.json(tablePopular);
        }
    } catch (error) {
        console.error("Błąd pobierania atrakcji:", error);
        res.status(500).json({ error: "Błąd serwera" });
    }
});

app.post('/ask', async (req, res) => {
    const userQuestion = req.body.question;
    if (!userQuestion) {
        return res.status(400).json({ error: 'Missing "question" in request body.' });
    }
    const randomN = () => Math.floor(Math.random() * (20 - 5 + 1)) + 5;
    const randint = randomN();


    try {
        /*
      // Krok 1: Wyszukiwanie w Internecie (SerpAPI)
      const serpResponse = await axios.get('https://serpapi.com/search.json', {
        params: {
          q: userQuestion,
          api_key: SERPAPI_KEY,
        },
      });
  
      const organicResults = serpResponse.data.organic_results || [];
      const snippets = organicResults.map(r => r.snippet).filter(Boolean).join('\n');
  
      // Krok 2: Zapytanie do GPT-4 z wynikami wyszukiwania
      const gptResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Jesteś pomocnym agentem. Odpowiadaj krótko i precyzyjnie, na podstawie danych z wyszukiwania, w odpowiedzi podaj tylko liczbę. Jeśli sa ceny normalne, ulgowe itp - podaj normalny. Jeśli w wynikach wyszukiwania nie ma odpowiednich wyników oszacuj sam.  Jeśli nie masz zadnej wiedzy, zwroc 10',
          },
          {
            role: 'user',
            content: `Oto wyniki wyszukiwania:\n${snippets}\n\nNa ich podstawie odpowiedz na pytanie: ${userQuestion}`,
          },
        ],
      }, {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });
        */
        const answer = randint;//gptResponse.data.choices[0].message.content.trim();
        res.json({ answer });

    } catch (err) {
        console.error('Błąd:', err.response?.data || err.message);
        res.status(500).json({ error: 'Wystąpił błąd podczas przetwarzania zapytania.' });
    }
});
app.get('/api/attraction-photos', async (req, res) => {
    const { idGoogle } = req.query;
    if (!idGoogle) {
        return res.status(400).json({ error: "Parametr 'idGoogle' jest wymagany." });
    }

    try {
        // Szukamy atrakcji w bazie danych
        const attraction = await Atrakcja.findOne({ idGoogle });
        if (!attraction) {
            return res.status(404).json({ error: "Nie znaleziono atrakcji o podanym idGoogle." });
        }

        // Jeśli atrakcja ma już zapisane linki do zdjęć, zwracamy je
        if (attraction.zdjecia && Array.isArray(attraction.zdjecia) && attraction.zdjecia.length > 0) {
            return res.json({ imageLinks: attraction.zdjecia });
        }

        // Jeśli nie ma zdjęć, pobieramy je z Google Places API (Place Details)
        const detailsResponse = await axios.get(
            'https://maps.googleapis.com/maps/api/place/details/json',
            {
                params: {
                    place_id: idGoogle,
                    fields: "photos",
                    key: GOOGLE_API_KEY
                }
            }
        );

        const photos = detailsResponse.data.result?.photos;
        if (!photos || photos.length === 0) {
            return res.status(404).json({ error: "Nie znaleziono zdjęć dla tej atrakcji." });
        }

        // Budujemy linki do zdjęć (możesz ograniczyć ich liczbę, np. do 3 pierwszych)
        const photoLinks = photos.map(photo => {
            return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${GOOGLE_API_KEY}`;
        });

        // Zapisujemy linki do zdjęć w bazie
        attraction.zdjecia = photoLinks;
        await attraction.save();

        return res.json({ imageLinks: photoLinks });
    } catch (error) {
        console.error("Błąd pobierania zdjęć atrakcji:", error.response?.data || error.message);
        return res.status(500).json({ error: "Błąd serwera" });
    }
});

app.get('/api/attraction-location', async (req, res) => {
    const { idGoogle } = req.query;
    if (!idGoogle) {
        return res.status(400).json({ error: "Parametr 'idGoogle' jest wymagany." });
    }

    try {
        // Szukamy atrakcji w bazie po idGoogle
        const attraction = await Atrakcja.findOne({ idGoogle });
        if (!attraction) {
            return res.status(404).json({ error: "Atrakcja o podanym idGoogle nie została znaleziona." });
        }

        // Jeśli lokalizacja już została zapisana, zwracamy ją
        if (attraction.location && attraction.location.lat && attraction.location.lng) {
            return res.json({ location: attraction.location });
        }

        // Jeśli nie, pobieramy lokalizację za pomocą Google Geocoding API
        const addressEncoded = encodeURIComponent(attraction.nazwa + " " + attraction.miasto)
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${addressEncoded}&key=${GOOGLE_API_KEY}`;
        const response = await axios.get(geocodeUrl);

        if (response.data.status === "OK" && response.data.results.length > 0) {
            const location = response.data.results[0].geometry.location;
            // Zapisujemy uzyskaną lokalizację w bazie danych
            attraction.location = location;
            await attraction.save();
            return res.json({ location });
        } else {
            return res.status(404).json({ error: "Nie udało się uzyskać lokalizacji z Google Geocoding API." });
        }
    } catch (error) {
        console.error("Błąd w endpoint /api/attraction-location:", error.response?.data || error.message);
        return res.status(500).json({ error: "Błąd serwera." });
    }
});


app.listen(PORT, () => {
    console.log(`Serwer działa na porcie ${PORT}`);
});
