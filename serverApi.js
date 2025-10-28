
const express = require("express");
const fetch = require("node-fetch");


const axios = require("axios");
const cors = require("cors"); // <--- import
const { default: mongoose } = require("mongoose");
require("dotenv").config();
const PQueue = require("p-queue").default;
const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });
console.log(process.env.OPENAI_API_KEY)
const fs = require("fs");
const cheerio = require("cheerio");

const app = express();
const PORT = 5006;

// użycie CORS dla wszystkich domen (dev)
app.use(cors());
app.use(express.json());

function computeTransitCost(transitRoute) {
    if (!Array.isArray(transitRoute) || transitRoute.length === 0) return 0;
    let localSum = 0;
    for (const seg of transitRoute) {
        if (seg?.type === 'TRANSIT') {
            const dur = Number(seg.durationMinutes) || 0;
            localSum += dur > 45 ? Math.min(Math.ceil(dur / 4), 150) : 4 ; // przykład taryfy
        }
    }
    return localSum;
}

async function computePrice({
    activitiesSchedule,
    liczbaUczestnikow,
    liczbaOpiekunow,
    routeSchedule,
    wybranyHotel,
    standardTransportu,
    chosenTransportSchedule
}) {
    if(liczbaUczestnikow ==0)return 0;
    // 1) suma aktywności
    let sumaAktywnosci = 0;
    for (let i = 0; i < activitiesSchedule.length; i++) {
        for (let j = 0; j < activitiesSchedule[i].length; j++) {
            const cena = Number(activitiesSchedule[i][j]?.cenaZwiedzania) || 0;
            if (cena > 0) sumaAktywnosci += cena;
        }
    }
    let aktywnosciPerUczestnik = Math.ceil(sumaAktywnosci * (liczbaOpiekunow + liczbaUczestnikow) / liczbaUczestnikow)
    // 2) osoby i hotel
    const hotelPrice = (Number(wybranyHotel?.cena) / Math.min(liczbaUczestnikow + liczbaOpiekunow, 30)) * (liczbaUczestnikow + liczbaOpiekunow) || 0;
    const perPerson = Number(liczbaUczestnikow) > 0 ? (x) => x / Number(liczbaUczestnikow) : (x) => x;

    // 3) wariant “tylko hotel + aktywności” (np. standardTransportu == 2)
    if (standardTransportu === 2) {
        return  aktywnosciPerUczestnik + perPerson(hotelPrice);
    }

    // 4) przejazdy
    let sumaPrzejazdow = 0;
    const dni = Array.isArray(activitiesSchedule) ? activitiesSchedule.length : 0;
    // autokar: stawka dzienna × liczba dni
    if (standardTransportu === 1) {
        
        sumaPrzejazdow += dni * 2500 / (liczbaUczestnikow); // przykładowa stawka
    }

    // transport publiczny wg chosenTransportSchedule (1 = transit)
    if (Array.isArray(chosenTransportSchedule) && Array.isArray(routeSchedule)) {
        for (let i = 0; i < chosenTransportSchedule.length; i++) {
            const row = chosenTransportSchedule[i];
            for (let j = 0; j < (row?.length || 0); j++) {
                if (row[j] === 1) {
                    const tr = routeSchedule[i]?.[j]?.transitRoute;
                    sumaPrzejazdow += computeTransitCost(tr);
                }
                else if(standardTransportu === 0 && row[j] === 2){
                    sumaPrzejazdow += Math.ceil((250 * routeSchedule[i][j]?.czasy[2] / 60) / liczbaUczestnikow)
                    console.log("TEST2",  Math.ceil((250 * routeSchedule[i][j]?.czasy[2] / 60) / liczbaUczestnikow), (250 * routeSchedule[i][j]?.czasy[2] / 60))
                }
            }
        }
    }
    
    let przejazdyPerUczestnik = Math.ceil(sumaPrzejazdow * (liczbaOpiekunow + liczbaUczestnikow) / (liczbaUczestnikow))
    console.log("Podzial ceny", sumaAktywnosci, aktywnosciPerUczestnik, hotelPrice, perPerson(hotelPrice), sumaPrzejazdow, przejazdyPerUczestnik, )
    const nettoResult = aktywnosciPerUczestnik + przejazdyPerUczestnik + perPerson(hotelPrice);
    const bruttoResult = Math.ceil(Math.max(50 + (dni - 1) * 35, nettoResult*1/10)) * 123 / 100 + nettoResult;
    // 5) wynik per osoba
    return bruttoResult 
}


app.post("/computePrice", async (req, res, next) => {
    try {
        const {
            activitiesSchedule,
            liczbaUczestnikow,
            liczbaOpiekunow,
            routeSchedule,
            wybranyHotel,
            chosenTransportSchedule,
            standardTransportu
        } = req.body;

        if (
            !Array.isArray(activitiesSchedule) ||
            typeof liczbaUczestnikow !== "number" ||
            typeof liczbaOpiekunow !== "number" ||
            !Array.isArray(routeSchedule) ||
            !wybranyHotel ||
            !Array.isArray(chosenTransportSchedule) ||
            typeof standardTransportu !== "number"
        ) {
            return res.status(400).json({ error: "Missing or invalid required fields" });
        }

        const rawPrice = await computePrice({
            activitiesSchedule,
            liczbaUczestnikow,
            liczbaOpiekunow,
            routeSchedule,
            wybranyHotel,
            chosenTransportSchedule,
            standardTransportu
        });

        // Bezpieczne rzutowanie + zaokrąglenie w górę
        const tripPrice = Math.ceil(Number(rawPrice) || 0);

        const insurancePrice = 10;
        return res.json({ tripPrice, insurancePrice });
    } catch (err) {
        next(err);
    }
});




app.get("/searchCity", async (req, res) => {
    const { query } = req.query;
    if (!query) {
        return res.status(400).json({ error: "Brak parametru 'query'" });
    }

    try {
        const response = await axios.get("https://nominatim.openstreetmap.org/search", {
            params: {
                q: query,
                format: "json",
                addressdetails: 1,
                limit: 15,
                countrycodes: "pl", // tylko Polska
                "accept-language": "pl",
                autocomplete: 1,    // <-- autouzupełnianie
                dedupe: 1           // <-- usuwanie duplikatów od strony Nominatim
            },
        });

        // deduplikacja
        const uniqueMap = new Map();

        response.data.forEach((place) => {
            const addr = place.address;
            const nazwa =
                addr.city ||
                addr.town ||
                addr.village ||
                addr.hamlet ||
                place.display_name.split(",")[0];

            if (!nazwa) return;

            const wojewodztwo = addr.state || "";
            const kraj = addr.country || "";

            const key = `${nazwa}-${wojewodztwo}-${kraj}`;

            if (!uniqueMap.has(key)) {
                // priorytet (city = 1, town = 2, village = 3, hamlet = 4, inne = 5)
                let priority = 5;
                if (addr.city) priority = 1;
                else if (addr.town) priority = 2;
                else if (addr.village) priority = 3;
                else if (addr.hamlet) priority = 4;

                uniqueMap.set(key, {
                    id: place.place_id,
                    nazwa,
                    wojewodztwo,
                    kraj,
                    priority,
                });
            }
        });

        // sortowanie po priorytecie
        const results = Array.from(uniqueMap.values()).sort((a, b) => a.priority - b.priority);

        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Błąd serwera" });
    }
});

const uri = "mongodb+srv://wiczjan:Karimbenzema9@cluster0.argoecr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Połączono z MongoDB"))
    .catch(err => console.error("Błąd MongoDB:", err));

const MiastoSchema = new mongoose.Schema({
    nazwa: { type: String, required: true },
    wojewodztwo: { type: String },
    kraj: { type: String },
    location: {
        lat: Number,
        lng: Number
    },
    googleId: String
});

const Miasto = mongoose.model("Miasto", MiastoSchema);

app.get("/getPlaceId", async (req, res) => {
    const { miasto, wojewodztwo, kraj } = req.query;

    if (!miasto || !wojewodztwo || !kraj) {
        return res.status(400).json({ error: "Podaj miasto, województwo i kraj w query params." });
    }

    try {
        // Najpierw sprawdzamy bazę
        const existingCity = await Miasto.findOne({ nazwa: miasto, wojewodztwo, kraj });
        if (existingCity) {
            return res.json(existingCity);
        }

        // Jeśli brak w bazie – pobieramy z Google Geocoding API
        const address = `${miasto}, ${wojewodztwo}, ${kraj}`;
        console.log("TEST1,", address)
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_API_KEY}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== "OK" || !data.results.length) {
            return res.status(404).json({ error: "Nie znaleziono miejsca." });
        }

        const result = data.results[0];
        const newCity = new Miasto({
            nazwa: miasto,
            wojewodztwo,
            kraj,
            location: result.geometry.location,
            googleId: result.place_id
        });
        await newCity.save();

        res.json(newCity);

    } catch (err) {
        console.error("Błąd w getPlaceId:", err);
        res.status(500).json({ error: "Błąd serwera." });
    }
});


const AttractionSchema = new mongoose.Schema({
    parentPlaceId: { type: String, required: true }, // ID miasta/placeId
    googleId: { type: String, required: true, unique: true },
    nazwa: String,
    adres: String,
    ocena: Number,
    liczbaOpinie: Number,

    lokalizacja: {
        lat: Number,
        lng: Number,
    },

    typy: [String],
    ikona: String,
    stronaInternetowa: String,
    photos: [String],

    // 🔹 Nowe pole: warianty oferty (analiza z AI)
    warianty: [
        {
            nazwaWariantu: { type: String, default: "Zwiedzanie" }, // np. "Trasa A"
            czasZwiedzania: { type: Number, default: null },        // w minutach
            cenaZwiedzania: { type: Number, default: null },        // bilet normalny
            cenaUlgowa: { type: Number, default: null },            // bilet ulgowy
            interval: { type: String, enum: ["jednorazowo", "za godzinę", "404"], default: "404" },
            godzinyOtwarcia: {
                type: [
                    {
                        type: [String], // np. ["09:00", "17:00"] lub null
                        default: null,
                    },
                ],

                default: [null, null, null, null, null, null, null],
            },
        },
    ],
});

const Attraction = mongoose.model("Attraction", AttractionSchema);
const getPlaceDetails = async (placeId) => {
    try {
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=website&key=${process.env.GOOGLE_API_KEY}`;
        const response = await axios.get(url);
        const data = response.data;

        if (data.status === "OK") {
            return data.result.website || null;
        }
        return null;
    } catch (err) {
        console.error("Błąd w getPlaceDetails:", err.message);
        return null;
    }
};
app.post("/addAttraction", async (req, res) => {
    try {
        const {
            parentPlaceId,
            googleId,
            nazwa,
            adres,
            ocena,
            liczbaOpinie,
            lokalizacja,
            typy,
            ikona,
            stronaInternetowa,
            photos
        } = req.body;

        if (!parentPlaceId || !googleId) {
            return res.status(400).json({ error: "parentPlaceId i googleId są wymagane." });
        }

        // Sprawdzenie, czy atrakcja już istnieje
        const existing = await Attraction.findOne({ googleId });
        if (existing) {
            return res.status(409).json({ error: "Atrakcja o podanym googleId już istnieje." });
        }

        const newAttraction = new Attraction({
            parentPlaceId,
            googleId,
            nazwa,
            adres,
            ocena,
            liczbaOpinie,
            lokalizacja,
            typy,
            ikona,
            stronaInternetowa,
            photos,
        });

        await newAttraction.save();

        res.status(201).json({ message: "Atrakcja dodana pomyślnie.", attraction: newAttraction });
    } catch (err) {
        console.error("Błąd przy dodawaniu atrakcji:", err);
        res.status(500).json({ error: "Błąd serwera." });
    }
});





app.get("/getAttractions", async (req, res) => {
    const { placeId, lat, lng } = req.query;
    const parentPlaceId = placeId;

    if (!placeId || !lat || !lng) {
        return res.status(400).json({ error: "Podaj placeId, lat i lng w query params." });
    }

    try {
        // 1️⃣ Sprawdzenie w bazie
        const attractionsFromDb = await Attraction.find({ parentPlaceId });
        if (attractionsFromDb.length >= 50) {
            console.log("ZWRACAM Z DB")
            return res.json(attractionsFromDb);
        }
        console.log("KAFELKUJE")
        // 2️⃣ Przygotowanie kafelków
        const R = 0.18; // ~20 km w stopniach
        const centerLat = parseFloat(lat);
        const centerLng = parseFloat(lng);

        const offsets = [
            { latOffset: 0, lngOffset: 0 },
            { latOffset: R, lngOffset: 0 },
            { latOffset: 0, lngOffset: R },
            { latOffset: R, lngOffset: R },
        ];

        const allGoogleAttractions = [];
        const types = ["tourist_attraction", "museum"]; // 🔹 typy do wyszukania

        for (const offset of offsets) {
            const tileLat = centerLat + offset.latOffset;
            const tileLng = centerLng + offset.lngOffset;

            // 🔁 dla każdego typu wyszukujemy osobno
            for (const type of types) {
                let nextPageToken = null;
                let page = 0;

                do {
                    let url;
                    if (nextPageToken) {
                        url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken=${nextPageToken}&language=pl&key=${process.env.GOOGLE_API_KEY}`;
                    } else {
                        url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${tileLat},${tileLng}&radius=10000&type=${type}&language=pl&key=${process.env.GOOGLE_API_KEY}`;
                    }

                    const response = await axios.get(url);
                    const data = response.data;

                    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") break;

                    // 🔹 Filtrowanie wyników — pomijamy hotele i galerie handlowe
                    const filteredResults = (data.results || []).filter(place => {
                        const types = place.types || [];
                        return !types.includes("shopping_mall") && !types.includes("lodging") && !types.includes("store") && !types.includes("furniture_store") && !types.includes("home_goods_store");
                    });

                    for (const place of filteredResults) {

                        // 🔹 unikalność po place_id
                        if (!allGoogleAttractions.some(a => a.googleId === place.place_id)) {
                            const website = await getPlaceDetails(place.place_id); // <- pobranie strony
                            allGoogleAttractions.push({
                                placeId,
                                googleId: place.place_id,
                                nazwa: place.name,
                                adres: place.vicinity || "",
                                ocena: place.rating || null,
                                liczbaOpinie: place.user_ratings_total || 0,
                                lokalizacja: place.geometry.location,
                                typy: place.types || [],
                                ikona: place.icon || null,
                                photos: [],
                                stronaInternetowa: website,
                            });
                        }
                    }

                    nextPageToken = data.next_page_token || null;
                    page++;

                    if (nextPageToken) {
                        // Google wymaga ~2s opóźnienia zanim next_page_token zacznie działać
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                } while (nextPageToken && page < 3);
            }
        }

        // 3️⃣ Zapis do bazy tylko nowych atrakcji
        const newAttractions = [];
        for (const attr of allGoogleAttractions) {
            const exists = await Attraction.findOne({ googleId: attr.googleId });
            if (!exists) {
                const newAttr = new Attraction({ ...attr, parentPlaceId: placeId });
                await newAttr.save();
                newAttractions.push(newAttr);
            }
        }

        // 4️⃣ Połączenie wyników
        const allAttractions = [
            ...attractionsFromDb.map(a => a.toObject()),
            ...newAttractions.map(a => a.toObject()),
        ];

        // 🔹 Sortowanie po liczbie opinii (najpopularniejsze na górze)
        allAttractions.sort((a, b) => (b.liczbaOpinie || 0) - (a.liczbaOpinie || 0));

        res.json(allAttractions);
    } catch (err) {
        console.error("Błąd w getAttractions:", err.response?.data || err.message);
        res.status(500).json({ error: "Błąd serwera." });
    }
});





// 1️⃣ Kolejka przetwarzająca max 20 zadań na sekundę
const queue = new PQueue({
    interval: 1000,    // okno 1 sekundy
    intervalCap: 20,   // max 20 zadań w tym oknie
});

// maksymalna długość kolejki (bez aktualnie wykonywanych)
const MAX_QUEUE_SIZE = 500;

app.get("/searchAttraction", async (req, res) => {
    // 2️⃣ Sprawdzenie długości kolejki
    if (queue.size >= MAX_QUEUE_SIZE) {
        return res.status(429).json({
            error: "Queue overloaded",
            message: "Zbyt wiele żądań w kolejce. Spróbuj ponownie za chwilę.",
        });
    }

    // 3️⃣ Dodanie zadania do kolejki – wykona się, gdy będzie slot
    queue.add(async () => {
        const { name, city } = req.query;
        if (!name || !city) {
            return res.status(400).json({ error: "Brak parametru 'name' lub 'city'." });
        }

        try {
            const query = encodeURIComponent(`${name} ${city}`);
            const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${process.env.GOOGLE_MAPS_KEY}`;
            const { data } = await axios.get(url);

            if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
                return res.status(500).json({
                    error: data.status,
                    message: data.error_message || "Błąd zapytania do Google Places API",
                });
            }

            // Mapowanie wyników do wymaganego formatu
            const resultsArray = data.results.map((place, idx) => ({
                placeId: idx + 1,
                googleId: place.place_id,
                nazwa: place.name,
                adres: place.vicinity || "",
                ocena: place.rating || null,
                liczbaOpinie: place.user_ratings_total || 0,
                lokalizacja: place.geometry?.location,
                typy: place.types || [],
                ikona: place.icon || null,
                photos: place.photos ? place.photos.map(p => p.photo_reference) : []
            }));

            res.json(resultsArray);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Internal server error" });
        }
    });
});

const geocodeQueue = new PQueue({ interval: 1000, intervalCap: 1 });

// Endpoint: GET /geocode?address=Sofoklesa 32
app.get("/geocode", async (req, res) => {
    const { address } = req.query;
    if (!address) {
        return res.status(400).json({ error: "Brak parametru 'address'." });
    }

    try {
        // Każde zapytanie do Nominatim dodajemy do kolejki
        const results = await geocodeQueue.add(async () => {
            const url = `https://nominatim.openstreetmap.org/search`;
            const { data } = await axios.get(url, {
                params: {
                    q: address,
                    format: "json",
                    addressdetails: 1,
                    limit: 10,
                },
                headers: {
                    "User-Agent": "WycieczkaZKlasa/1.0 (jan.kowalski@example.com)",
                    "Accept-Language": "pl"
                }
            });

            return data.map((place, idx) => ({
                id: idx + 1,
                displayName: place.display_name || "",
                lat: place.lat,
                lon: place.lon,
                country: place.address?.country || "",
                city:
                    place.address?.city ||
                    place.address?.town ||
                    place.address?.village ||
                    place.address?.municipality ||
                    "",
                state: place.address?.state || "",
                postcode: place.address?.postcode || "",
            }));
        });
        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Błąd podczas geokodowania." });
    }
});

app.get("/searchPlaces", async (req, res) => {
    const { query } = req.query;
    if (!query) {
        return res.status(400).json({ error: "Brak parametru 'query'." });
    }

    try {
        const url = `https://maps.googleapis.com/maps/api/place/textsearch/json`;
        const { data } = await axios.get(url, {
            params: {
                query,
                key: process.env.GOOGLE_API_KEY,
                language: "pl",
            },
        });

        if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
            console.error("Google error:", data);
            return res.status(500).json(data);
        }

        // Funkcja pomocnicza do pobrania place_id miasta
        async function getCityPlaceId(lat, lng) {
            const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json`;
            const { data: geoData } = await axios.get(geoUrl, {
                params: {
                    latlng: `${lat},${lng}`,
                    key: process.env.GOOGLE_API_KEY,
                    result_type: "locality", // zawęża do miasta
                    language: "pl",
                },
            });
            if (
                geoData.status === "OK" &&
                geoData.results.length &&
                geoData.results[0].place_id
            ) {
                return geoData.results[0].place_id;
            }
            return null;
        }

        // Funkcja pomocnicza do pobrania strony internetowej miejsca
        async function getPlaceWebsite(placeId) {
            try {
                const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json`;
                const { data: detailsData } = await axios.get(detailsUrl, {
                    params: {
                        place_id: placeId,
                        fields: "website",
                        key: process.env.GOOGLE_API_KEY,
                        language: "pl",
                    },
                });
                if (detailsData.status === "OK" && detailsData.result) {
                    return detailsData.result.website || null;
                }
            } catch (err) {
                console.error("Błąd pobierania strony:", err.message);
            }
            return null;
        }

        // Mapowanie wyników do wymaganego formatu wraz z parentPlaceId i stroną internetową
        const results = await Promise.all(
            data.results.map(async (place, idx) => {
                const lat = place.geometry?.location?.lat;
                const lng = place.geometry?.location?.lng;
                const parentPlaceId = lat && lng ? await getCityPlaceId(lat, lng) : null;

                // Pobranie strony internetowej
                const stronaInternetowa = await getPlaceWebsite(place.place_id);

                return {
                    localId: idx + 1,
                    googleId: place.place_id,
                    parentPlaceId,
                    nazwa: place.name,
                    adres: place.formatted_address || place.vicinity || "",
                    ocena: place.rating || null,
                    liczbaOpinie: place.user_ratings_total || 0,
                    lokalizacja: place.geometry?.location || {},
                    typy: place.types || [],
                    ikona: place.icon || null,
                    photos: place.photos ? place.photos.map(p => p.photo_reference) : [],
                    stronaInternetowa, // <- dodane pole
                };
            })
        );

        res.json(results);
    } catch (err) {
        console.error("Błąd w /searchPlaces:", err.message);
        res.status(500).json({ error: "Błąd serwera." });
    }
});




// 1️⃣ Schemat Mongoose dla tras
const TrasaSchema = new mongoose.Schema({
    fromLat: Number,
    fromLng: Number,
    toLat: Number,
    toLng: Number,
    createdAt: { type: Date, default: Date.now },
    driving: {
        durationMinutes: Number,
        distanceKm: Number,
    },
    walking: {
        durationMinutes: Number,
        distanceKm: Number,
    },
    transit: {
        durationMinutes: Number,
        segments: [
            {
                type: {
                    type: String,
                },
                distanceMeters: Number,
                durationMinutes: Number,
                startLocation: {
                    lat: Number,
                    lng: Number,
                },
                endLocation: {
                    lat: Number,
                    lng: Number,
                },
                from: String,
                to: String,
                instructions: String,
                vehicleType: String,
                vehicleName: String,
                line: String,
                agency: String,
                departureStop: String,
                arrivalStop: String,
                departureTime: String,
                arrivalTime: String,
                numStops: Number,
            },
        ],
    },

});

const Trasa = mongoose.model("Trasa", TrasaSchema);

// 2️⃣ Funkcje pomocnicze do pobierania danych
async function getOSRMRoute(mode, fromLat, fromLng, toLat, toLng) {
    const baseUrl =
        mode === "walking"
            ? "https://routing.openstreetmap.de/routed-foot"
            : "https://routing.openstreetmap.de/routed-car";

    const url = `${baseUrl}/route/v1/${mode}/${fromLng},${fromLat};${toLng},${toLat}?overview=false&geometries=geojson`;

    try {
        const { data } = await axios.get(url);
        if (data.routes?.length) {
            const route = data.routes[0];
            return {
                durationMinutes: Math.round(route.duration / 60),
                distanceKm: Math.round(route.distance / 1000),
            };
        }
    } catch (err) {
        console.error(`❌ Błąd OSRM (${mode}):`, err.message);
    }
    return null;
}

// 🔹 Pobieranie trasy komunikacją publiczną z Google
const googleQueue = new PQueue({
    interval: 1000,      // okno 1 sekundy
    intervalCap: 20,     // maks. 20 zapytań na sekundę
});

async function getTransitRoute(fromLat, fromLng, toLat, toLng) {
    try {
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${fromLat},${fromLng}&destination=${toLat},${toLng}&mode=transit&language=pl&key=${process.env.GOOGLE_API_KEY}`;

        // ✅ Ograniczenie szybkości zapytań dzięki kolejce
        const { data } = await googleQueue.add(() => axios.get(url));

        if (!data.routes?.length) {
            console.warn("⚠️ Brak wyników Google Directions API dla transit.");
            return null;
        }

        const route = data.routes[0];
        const leg = route.legs[0];
        const durationMinutes = Math.round(leg.duration.value / 60);

        const segments = leg.steps
            .map((s) => {
                if (s.travel_mode === "WALKING") {
                    return {
                        type: "WALK",
                        distanceMeters: s.distance?.value || null,
                        durationMinutes: Math.round((s.duration?.value || 0) / 60),
                        startLocation: s.start_location,
                        endLocation: s.end_location,
                        from: s.start_location
                            ? `${s.start_location.lat},${s.start_location.lng}`
                            : null,
                        to: s.end_location
                            ? `${s.end_location.lat},${s.end_location.lng}`
                            : null,
                        instructions:
                            s.html_instructions?.replace(/<[^>]+>/g, "") || "Spacer",
                    };
                }

                if (s.travel_mode === "TRANSIT") {
                    const t = s.transit_details;
                    return {
                        type: "TRANSIT",
                        vehicleType: t?.line?.vehicle?.type || null,
                        vehicleName: t?.line?.name || null,
                        line: t?.line?.short_name || t?.line?.name || null,
                        agency: t?.line?.agencies?.[0]?.name || null,
                        departureStop: t?.departure_stop?.name || null,
                        arrivalStop: t?.arrival_stop?.name || null,
                        departureTime: t?.departure_time?.text || null,
                        arrivalTime: t?.arrival_time?.text || null,
                        numStops: t?.num_stops || null,
                        durationMinutes: Math.round((s.duration?.value || 0) / 60),
                        distanceMeters: s.distance?.value || null,
                    };
                }
                return null;
            })
            .filter(Boolean);

        return {
            durationMinutes,
            segments,
        };
    } catch (err) {
        console.error("❌ Błąd pobierania trasy (Google Transit):", err.message);
        return null;
    }
}


function removeCommonEdges(texts) {
    if (!Array.isArray(texts) || texts.length === 0) return [];

    // Zamień każdy tekst na tablicę linii (oczyszczonych z nadmiarowych spacji)
    const splitTexts = texts.map(t =>
        (t || "")
            .split("\n")
            .map(line => line.trim())
            .filter(Boolean)
    );

    // 🔍 Zlicz występowanie każdej linii we wszystkich tekstach
    const lineFrequency = new Map();
    for (const lines of splitTexts) {
        const uniqueLines = new Set(lines); // liczymy tylko raz na dany tekst
        for (const line of uniqueLines) {
            lineFrequency.set(line, (lineFrequency.get(line) || 0) + 1);
        }
    }

    // 🧹 Linie, które występują we wszystkich tekstach, należy usunąć
    const totalTexts = splitTexts.length;
    const commonLines = new Set(
        Array.from(lineFrequency.entries())
            .filter(([_, count]) => count === totalTexts)
            .map(([line]) => line)
    );


    // 🪄 Usuń wspólne linie z każdego tekstu
    const cleanedTexts = splitTexts.map(lines =>
        lines.filter(line => !commonLines.has(line)).join("\n").trim()
    );

    return cleanedTexts;
}


function removeScriptSections(html) {
    if (typeof html !== "string") return "";

    // Regex usuwa dowolną zawartość pomiędzy <script ...> i </script>, nawet wieloliniowo
    return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "\n");
}


function removeHeadSection(html) {
    if (!html || typeof html !== "string") return "";

    // Usuwa wszystko pomiędzy <head> a </head> (wieloliniowo, bez względu na wielkość liter)
    return html.replace(/<head[\s\S]*?<\/head>/gi, "");
}

function replaceHTMLTagsWithPlaceholder(text) {
    if (!text || typeof text !== "string") return "";
    return text.replace(/<[^>]*>/g, "</>");
}
function stripHTMLTags(text) {
    if (!text || typeof text !== "string") return "";

    const fontTags = ["strong", "b", "i", "em", "u"];
    const tableTags = ["table", "tr", "td", "th", "thead", "tbody"];

    // Wyrażenie regularne do wykrywania wszystkich tagów HTML
    const regex = /<\/?([a-zA-Z0-9]+)(\s[^>]*)?>/g;

    return text.replace(regex, (match, tagName) => {
        const lower = tagName.toLowerCase();

        // 🔸 1. Jeśli znacznik czcionkowy — usuń go całkowicie
        if (fontTags.includes(lower)) {
            return "";
        }

        // 🔸 2. Jeśli znacznik tabeli — zachowaj nazwę tagu, ale usuń atrybuty
        if (tableTags.includes(lower)) {
            // sprawdzamy czy to znacznik zamykający
            if (match.startsWith("</")) {
                return `</${lower}>`;
            } else {
                return `<${lower}>`;
            }
        }

        // 🔸 3. Wszystkie inne znaczniki zastępuj znakiem nowej linii
        return "\n";
    });
}


function cleanWhitespacePreserveLines(text) {
    if (!text || typeof text !== "string") return "";

    return text
        .split("\n") // podział na linie
        .map(line => line.trim()) // usuń białe znaki na początku i końcu każdej linii
        .filter(line => line.length > 0) // usuń całkowicie puste linie
        .join("\n"); // połącz z powrotem w tekst
}

const puppeteer = require("puppeteer");
const { url } = require("inspector");
const { Console } = require("console");
const { render } = require("@testing-library/react");

function isDynamicHTML(html) {
    if (!html || typeof html !== "string") return true;

    // Jeśli body jest bardzo mały, pewnie JS go renderuje później
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const bodyContent = bodyMatch ? bodyMatch[1].trim() : "";

    const scriptCount = (html.match(/<script\b/gi) || []).length;

    // heurystyka: mało treści, dużo JS → strona dynamiczna
    if (bodyContent.length < 400 || scriptCount > 15) return true;

    // React / Next.js / Vue sygnatury
    if (/__NEXT_DATA__|id="root"|id="app"|ng-app|reactroot/i.test(html)) return true;

    return false;
}


async function returnWebPageHybrid(url) {
    try {
        // 🔹 1. Spróbuj pobrać stronę zwykłym axios
        const response = await axios.get(url, {
            headers: { "User-Agent": "Mozilla/5.0 (Node.js WebPageFetcher/Hybrid/1.0)" },
            timeout: 20000,
        });

        console.log("✅ Pobrano stronę:", url);

        const html = response.data;
        const dynamic = isDynamicHTML(html);

        if (!dynamic) {
            console.log("🟢 Strona wygląda na statyczną — zwracam bez renderowania.");
            return cleanWhitespacePreserveLines(
                stripHTMLTags(removeHeadSection(removeScriptSections(html)))
            );
        }

        // 🔸 2. Strona dynamiczna → użyj Puppeteera
        console.log("⚠️ Wykryto stronę dynamiczną — uruchamiam Puppeteera...");

        return await returnRenderedWebPage(url);
    } catch (err) {
        console.error("❌ Błąd w returnWebPageHybrid:", err.message);
        return null;
    }
}

/**
 * 🧭 Puppeteer fallback — renderuje w headless Chrome
 */
async function returnRenderedWebPage(url) {
    let browser;
    try {
        console.log("🌍 Otwieram stronę w headless Chrome:", url);

        browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });

        const page = await browser.newPage();
        await page.setUserAgent("Mozilla/5.0 (Node.js RenderedFetcher/1.0)");
        await page.goto(url, { waitUntil: "networkidle2", timeout: 45000 });

        const renderedHTML = await page.content();
        const filename = `test23.html`;
        fs.writeFileSync(filename, cleanWhitespacePreserveLines(
            stripHTMLTags(removeHeadSection(removeScriptSections(renderedHTML)))
        ), "utf8");
        console.log(`💾 Zapisano ${filename} (${renderedHTML.length} znaków)`);
        console.log("✅ Strona wyrenderowana pomyślnie.");
        return cleanWhitespacePreserveLines(
            stripHTMLTags(removeHeadSection(removeScriptSections(renderedHTML)))
        );
    } catch (err) {
        console.error("❌ Błąd podczas renderowania:", err.message);
        return null;
    } finally {
        if (browser) await browser.close();
    }
}









/** Normalizacja URL (https, bez #, bez końcowego / poza rootem) */
function normalizeUrl(u) {
    const url = new URL(u);
    if (url.protocol === "http:") url.protocol = "https:"; // opcjonalnie wymuś https
    url.hash = "";
    url.host = url.host.toLowerCase();
    if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
        url.pathname = url.pathname.slice(0, -1);
    }
    return url.href;
}

/** Usuwa pierwszy segment językowy (pl, en, de, pl-PL itd.) na potrzeby wyliczenia głębokości */
function stripLangPrefix(pathname) {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length === 0) return [];

    const langRe = /^[a-z]{2,5}(-[a-z]{2,5})?$/i; // np. pl, en, pl-PL, pt-BR
    if (langRe.test(parts[0])) {
        return parts.slice(1);
    }
    return parts;
}

/** Głębokość ścieżki liczona od „roota”, z pominięciem prefiksu językowego */
function depthFromRoot(pathname) {
    return stripLangPrefix(pathname).length;
}

/**
 * Crawl całej domeny (ten sam host) do głębokości maxDepth (od root, ignorując /pl, /en itp.).
 * Zwraca do `limit` unikalnych linków w domenie.
 */
async function crawlDomainLinks(
    startUrl,
    maxDepth = 2,
    excludeKeywords = ["aktualn", "blog", "news", "kontakt", "polityka", "regulamin", "kariera"],
    limit = 200
) {
    const start = new URL(startUrl);
    const startHost = start.host.toLowerCase();

    const visited = new Set();
    const collected = new Map(); // href -> { href, text }

    async function crawl(url) {
        if (collected.size >= limit) return;

        const normUrl = normalizeUrl(url);
        if (visited.has(normUrl)) return;
        visited.add(normUrl);

        const currentUrl = new URL(normUrl);
        const depth = depthFromRoot(currentUrl.pathname);
        if (depth > maxDepth) return;

        console.log(`🌐 [${depth}/${maxDepth}] Analizuję: ${normUrl}`);

        try {
            const resp = await axios.get(normUrl, {
                headers: { "User-Agent": "Mozilla/5.0 (Node.js Crawler/1.0)" },
                timeout: 15000,
                maxRedirects: 5,
                validateStatus: (s) => s < 500
            });

            const html = resp.data;
            if (typeof html !== "string") {
                console.debug(`⛔ Brak HTML (typ treści?): ${normUrl}`);
                return;
            }

            const $ = cheerio.load(html);

            // Obsługa <base href>
            let baseHref;
            const baseTag = $("base[href]").attr("href");
            if (baseTag) {
                try {
                    baseHref = new URL(baseTag, currentUrl).href;
                } catch { /* ignore */ }
            }

            $("a[href]").each((_, el) => {
                if (collected.size >= limit) return;

                const rawHref = $(el).attr("href");
                if (!rawHref) return;

                // pomiń anchory, tel:, mailto:, javascript:
                if (/^(#|tel:|mailto:|javascript:)/i.test(rawHref)) return;

                let absUrl;
                try {
                    // rozwiąż względem baseHref lub bieżącej strony
                    absUrl = new URL(rawHref, baseHref || currentUrl).href;
                } catch {
                    return;
                }

                absUrl = normalizeUrl(absUrl);
                const u = new URL(absUrl);

                // tylko ten sam host (ta sama domena, bez subdomen — jeśli chcesz dopuścić subdomeny, zmień to porównanie)
                if (u.host.toLowerCase() !== startHost) return;

                // wykluczenia fraz
                if (excludeKeywords.some((kw) => absUrl.toLowerCase().includes(kw))) return;

                // kontrola głębokości od root (ignorując prefiks językowy)
                const candidateDepth = depthFromRoot(u.pathname);
                if (candidateDepth > maxDepth) return;

                if (!collected.has(absUrl)) {
                    collected.set(absUrl, { href: absUrl, text: $(el).text().trim() });
                }
            });

            if (collected.size >= limit) return;

            // BFS-owate przechodzenie po zebranych linkach
            const nextLinks = Array.from(collected.keys())
                .filter((link) => !visited.has(normalizeUrl(link)))
                .slice(0, Math.max(0, limit - collected.size));

            for (const link of nextLinks) {
                if (collected.size >= limit) break;
                await crawl(link);
            }
        } catch (err) {
            console.warn(`⚠️ Błąd przy ${normUrl}: ${err.message}`);
        }
    }

    await crawl(startUrl);

    console.log(
        `✅ Zebrano ${collected.size} unikalnych linków (do głębokości ${maxDepth}, limit ${limit}).`
    );
    return Array.from(collected.values());
}

async function analyzeAttractionLinks(url) {
    try {
        console.log("🌐 Analiza atrakcji:", url);

        // 1️⃣ Pobierz linki z menu
        const menuLinks = await crawlDomainLinks(url);
        if (!Array.isArray(menuLinks) || menuLinks.length === 0) {
            console.log("⚠️ Brak linków w menu – zakończono.");
            return [];
        }

        console.log(`🔗 Znaleziono ${menuLinks.length} linków w menu.`);
        const linkList = menuLinks
            .map((l, i) => `${i + 1}. ${l.text || "(bez tekstu)"} → ${l.href}`)
            .join("\n");

        // 2️⃣ Przygotuj prompt do analizy AI
        const systemPrompt = `
            Jesteś ekspertem od stron atrakcji turystycznych.
            Dostałeś listę linków z menu danej witryny.
            Twoim zadaniem jest wskazanie, który link prowadzi do cennika zawierajacego ceny biletow i ewentualnie warianty oferty, dla pojedynczej osoby indywidualnej bez zadnych znizek. Priorytetem jest cena biletow, w przypadku niepewnosci mozesz zwroci wiecej niz jeden link.
            Najlepiej gdybys zwrocil tylko jeden link w ktorym bedzie oferta podstawowa (bez grupowych, szkolnych itp). W przypadku znaczacych watpliwosci czy wybrac np strone cennik czy zwiedzanie zwroc oba. Podobnie gdy zakladka zawierajaca potencjalnie ceny ma kolejne link, np /zwiedzanie/abcd zwroc rowniez te nastepne linki.
            Zwróć TYLKO tablicę linków w formacie JSON:
            {
            "relevantLinks": ["https://..."]
            }
            Nie dodawaj komentarzy ani tekstu poza JSON.
            `;

        console.log("🧠 Wysyłam listę linków do modelu...");

        // 3️⃣ Zapytaj OpenAI
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            temperature: 0.2,
            max_tokens: 500,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Strona główna: ${url}\n\nLinki w menu:\n${linkList}` },
            ],
            response_format: { type: "json_object" },
        });

        // 4️⃣ Odbierz i zinterpretuj wynik
        const parsed = JSON.parse(completion.choices[0].message.content);
        const result = parsed.relevantLinks || [];

        console.log("🤖 AI wskazało linki do przejrzenia:", result);

        return result;
    } catch (err) {
        console.error("❌ Błąd w analyzeAttractionLinks:", err.message);
        return [];
    }
}

async function analyzeOfferFromText(pageText, index = 0) {
    const prompt = `
Z podanego tekstu strony internetowej wyczytaj następujące dane:
- warianty oferty (np. trasa A, trasa B, lub "zwiedzanie" jeśli tylko jeden wariant)
- dla każdego wariantu:
  • cena biletu normalnego bez zniżek
  • cena biletu ulgowego dla ucznia
  • interwał płatności (np. za godzinę, jednorazowo)
  • czas zwiedzania atrakcji (w minutach)
  • godziny otwarcia atrakcji (tablica 7 elementów: pon–niedz)

Zwróć **jedynie wynik w czystym JSON**, bez komentarzy, opisu ani dodatkowego tekstu.

Struktura JSON:
[
  {
    "nazwaWariantu": "Zwiedzanie" lub np. "Trasa A",
    "czasZwiedzania": liczba lub null,
    "cenaZwiedzania": liczba lub null,
    "cenaUlgowa": liczba lub null,
    "interval": "jednorazowo" | "za godzinę" | "404",
    "godzinyOtwarcia": [
      ["09:00","17:00"], ["09:00","17:00"], ["09:00","17:00"], ["09:00","17:00"], ["09:00","17:00"], ["10:00","15:00"], null
    ]
  }
]

Nie zwracaj ofert grupowych jako osobnych wariantów. Najlepiej podaj ceny dla osoby indywidualnej bez zadnych znizek, jesli jednak podane beda tylko ceny grupowe podaj ja w przeliczeniu na osobe (powiedzmy w grupie 15 osobowej). Jesli nie znajdziesz zadnej informacji o cenach zwroc pusta tablice [].
Odpowiedź ma być **czystym JSON**, bez Markdowna ani komentarzy.
`;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-5-mini",
            messages: [
                { role: "system", content: "Jesteś asystentem analizującym oferty turystyczne i cenniki ze stron internetowych." },
                { role: "user", content: prompt },
                { role: "user", content: `Treść strony #${index}:\n${pageText.slice(0, 16000)}` },
            ],
        });

        const content = response.choices[0].message.content.trim();

        try {
            const parsed = JSON.parse(content);
            return { index, data: parsed };
        } catch (e) {
            console.warn(`⚠️ Nie udało się sparsować JSON dla strony #${index}`);
            return { index, data: null, raw: content };
        }
    } catch (err) {
        console.error(`❌ Błąd analizy strony #${index}:`, err.message);
        return { index, data: null };
    }
}

/**
 * Analizuje tablicę oczyszczonych stron (ciągów HTML) i zwraca tablicę struktur ofert.
 */
async function analyzeOffersFromCleanedPages(cleaned) {
    console.log(`🔍 Analizuję ${cleaned.length} stron...`);

    const results = [];
    for (let i = 0; i < cleaned.length; i++) {
        const pageText = cleaned[i];
        const result = await analyzeOfferFromText(pageText, i);
        results.push(result);
    }

    console.log("✅ Analiza zakończona.");
    return results;
}

const offerQueue = new PQueue({
    intervalCap: 10,      // maksymalnie 10 zadań
    interval: 1000,       // w oknie 1 sekundy
    carryoverConcurrencyCount: true,
});

app.get("/place-offer", async (req, res) => {
    const { links } = req.query;

    if (!links) {
        return res.status(400).json({ error: "Brak parametru ?links= (np. ?links=https://a.pl,https://b.pl)" });
    }

    // Każde wywołanie endpointu trafia do kolejki
    offerQueue.add(async () => {
        console.log("➡️ Przyjęto zadanie w kolejce /place-offer");

        const urls = links.split(",").map(u => u.trim()).filter(Boolean);
        console.log("➡️ Wywołano endpoint place-offer dla linków:", urls);

        let deleteSecond = false;
        let innerLinks = await analyzeAttractionLinks(urls[0]);
        console.log("➡️ Znalezione linki w menu:", innerLinks);
        if (!innerLinks.length) {
            return res.json({
                warianty: [{
                    nazwaWariantu: "def",
                    czasZwiedzania: 30,
                    cenaZwiedzania: -1,
                    cenaUlgowa: null,
                    interval: "404",
                    godzinyOtwarcia: [
                        [null, null], [null, null], [null, null],
                        [null, null], [null, null], [null, null], [null, null]
                    ]
                }]
            });
        }

        if (innerLinks.length === 1 && innerLinks[0] != urls[0]) {
            innerLinks.push(urls[0]);
            deleteSecond = true;
        }

        const results = [];
        for (const url of innerLinks) {
            console.log("TEST3", innerLinks)
            const html = await returnRenderedWebPage(url);
            if (html) results.push(html);

        }
        // zapisz wyniki do plików
        results.forEach((content, idx) => {
            const filename = `test${idx + 10}.html`;
            fs.writeFileSync(filename, content, "utf8");
            console.log(`💾 Zapisano ${filename} (${content.length} znaków)`);
        });
        if (results.length === 0) {
            return res.status(500).json({ error: "Nie udało się pobrać żadnej strony." });
        }

        let cleaned = [[]];
        if (results.length === 1 || (results.length == 2 && deleteSecond && results[0].length < 10000)) {
            cleaned = results;
            console.log("TUTAJ1")
        }
        else {
            cleaned = removeCommonEdges(results);
            console.log("TUTAJ2")

        }
        if (cleaned.length === 2 && deleteSecond) {
            cleaned = [cleaned[0]];
        }

        const wyniki = await analyzeOffersFromCleanedPages(cleaned[0].length < 500 ? [results[0]] : cleaned);

        console.log(JSON.stringify(wyniki, null, 2));

        // zapisz wyniki do plików
        cleaned.forEach((content, idx) => {
            const filename = `test${idx + 1}.html`;
            fs.writeFileSync(filename, content, "utf8");
            console.log(`💾 Zapisano ${filename} (${content.length} znaków ww)`);
        });

        res.json({
            success: true,
            warianty: wyniki,
        });
    }).catch(err => {
        console.error("❌ Błąd w kolejce offerQueue:", err);
        res.status(500).json({ error: "Błąd podczas przetwarzania żądania w kolejce." });
    });
});

app.get("/update-offer", async (req, res) => {
    const { googleId, link } = req.query;

    if (!googleId || !link) {
        return res.status(400).json({ error: "Brak wymaganych parametrów ?googleId= oraz ?link=" });
    }

    offerQueue.add(async () => {
        try {
            console.log(`🔍 Aktualizuję ofertę dla atrakcji ${googleId} z linku: ${link}`);

            // 🔹 1. Sprawdź, czy atrakcja istnieje
            const attraction = await Attraction.findOne({ googleId });
            if (!attraction) {
                return res.status(404).json({ error: `Nie znaleziono atrakcji o googleId: ${googleId}` });
            }

            // 🔹 2. Wywołaj /place-offer
            const response = await axios.get("http://localhost:5006/place-offer", {
                params: { links: link },
                timeout: 1200000,
            });

            const { warianty } = response.data;
            if (!warianty || warianty.length === 0) {
                return res.status(500).json({ error: "Brak wariantów oferty z /place-offer" });
            }

            // 🔹 3. Spłaszcz i zapisz
            const flattenedVariants = warianty.flatMap(w => w.data || w);
            attraction.warianty = flattenedVariants;
            await attraction.save();

            console.log(`✅ Zaktualizowano ofertę dla "${attraction.nazwa}" (${googleId})`);

            // ✅ Jedna odpowiedź na koniec
            return res.json({
                success: true,
                googleId,
                warianty: flattenedVariants,
            });

        } catch (err) {
            console.error("❌ Błąd w /update-offer:", err.message);
            if (!res.headersSent) {
                return res.status(500).json({ error: err.message });
            }
        }
    }).catch(err => {
        console.error("❌ Błąd w kolejce offerQueue:", err);
        if (!res.headersSent) {
            return res.status(500).json({ error: "Błąd podczas przetwarzania żądania w kolejce." });
        }
    });
});




// 3️⃣ Endpoint główny
app.get("/routeSummary", async (req, res) => {
    const { fromLat, fromLng, toLat, toLng } = req.query;
    if (!fromLat || !fromLng || !toLat || !toLng) {
        return res
            .status(400)
            .json({ error: "Brak parametrów lokalizacji (fromLat, fromLng, toLat, toLng)" });
    }

    try {
        // 1. Sprawdzenie cache (ważność: 240h)
        const existing = await Trasa.findOne({
            fromLat: parseFloat(fromLat),
            fromLng: parseFloat(fromLng),
            toLat: parseFloat(toLat),
            toLng: parseFloat(toLng),
        });

        if (existing) {
            const hoursSince =
                (Date.now() - new Date(existing.createdAt)) / (1000 * 60 * 60);
            if (hoursSince < 240) {
                //console.log("✅ Zwracam trasę z bazy (świeża)");
                return res.json({
                    driving: existing.driving,
                    walking: existing.walking,
                    transit: existing.transit,
                    source: "cache",
                });
            }
        }

        // 2. Jeśli nie istnieje lub przeterminowana → pobierz nowe dane
        console.log("🔄 Pobieram nowe dane tras...");
        const [driving, walking, transit] = await Promise.all([
            getOSRMRoute("driving", fromLat, fromLng, toLat, toLng),
            getOSRMRoute("walking", fromLat, fromLng, toLat, toLng),
            getTransitRoute(fromLat, fromLng, toLat, toLng),
        ]);

        // 3. Zapisz lub zaktualizuj wpis w bazie
        const newRoute = {
            fromLat: parseFloat(fromLat),
            fromLng: parseFloat(fromLng),
            toLat: parseFloat(toLat),
            toLng: parseFloat(toLng),
            createdAt: new Date(),
            driving,
            walking,
            transit,
        };

        if (existing) {
            await Trasa.updateOne({ _id: existing._id }, newRoute);
            console.log("♻️ Zaktualizowano trasę w bazie");
        } else {
            await new Trasa(newRoute).save();
            console.log("💾 Zapisano nową trasę do bazy");
        }

        res.json({
            driving,
            walking,
            transit,
            source: "fresh",
        });
    } catch (err) {
        console.error("❌ Błąd w /routeSummary:", err.message);
        res.status(500).json({ error: "Błąd serwera" });
    }
});

/*
app.use("/", scrapePriceRouter);

app.get("/placePrice", async (req, res) => {
    const { place_id } = req.query;

    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
    if (!place_id) {
        return res.status(400).json({ error: "Brak wymaganego parametru: place_id" });
    }
    if (!GOOGLE_API_KEY) {
        return res.status(500).json({ error: "Brak skonfigurowanego GOOGLE_API_KEY" });
    }

    try {
        console.log(`🌍 Pobieram dane z Google Places API dla place_id: ${place_id}`);

        const url = `https://maps.googleapis.com/maps/api/place/details/json`;
        const params = {
            place_id,
            key: GOOGLE_API_KEY,
            fields: "name,price_level,website,opening_hours,formatted_address,types,rating,user_ratings_total"
        };

        const { data } = await axios.get(url, { params });

        if (data.status !== "OK" || !data.result) {
            console.warn(`⚠️ Google API zwróciło status: ${data.status}`);
            return res.status(404).json({ error: "Nie znaleziono miejsca lub brak danych" });
        }

        const result = data.result;

        // Mapowanie price_level → orientacyjny opis
        const priceDescriptions = {
            0: "Bezpłatne",
            1: "Tanie",
            2: "Średnia cena",
            3: "Drogie",
            4: "Bardzo drogie"
        };

        const priceInfo = result.price_level !== undefined
            ? {
                level: result.price_level,
                description: priceDescriptions[result.price_level] || "Nieznane"
            }
            : null;

        const response = {
            found: true,
            place_id,
            name: result.name,
            address: result.formatted_address || null,
            website: result.website || null,
            rating: result.rating || null,
            user_ratings_total: result.user_ratings_total || null,
            price: priceInfo,
            opening_hours: result.opening_hours?.weekday_text || null,
            types: result.types || [],
            source: "google_places_api"
        };

        console.log(`✅ Znaleziono dane dla miejsca: ${result.name}`);
        return res.json(response);

    } catch (err) {
        console.error("❌ Błąd komunikacji z Google Places API:", err.response?.data || err.message);
        return res.status(500).json({
            error: "Błąd podczas pobierania danych z Google Places API",
            detail: err.message
        });
    }
});

/*
app.post("/scrape-offer", async (req, res) => {
    try {
        const { url } = req.body;
        const response = await fetch("http://localhost:5005/scrape", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url }),
        });

        const data = await response.json();
        res.status(response.status).json(data);
    } catch (err) {
        console.error("Error in /scrape-offer:", err);
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
});
*/

// ===================== 🔹 FUNKCJE POMOCNICZE 🔹 =====================

// Obliczanie dystansu w kilometrach (Haversine)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // promień Ziemi w km
    const toRad = deg => (deg * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return +(R * c).toFixed(2); // wynik w km
}

// Obliczanie punktacji hotelu
function calculateHotelScore(hotel, centerLat, centerLng) {
    if (!hotel?.property?.latitude || !hotel?.property?.longitude) return null;

    const hotelLat = parseFloat(hotel.property.latitude);
    const hotelLng = parseFloat(hotel.property.longitude);
    const price = Math.max(
        Number(hotel?.property?.priceBreakdown?.grossPrice?.value) || 0,
        Number(hotel?.property?.priceBreakdown?.strikethroughPrice?.value) || 0
    );
    const distance = calculateDistance(centerLat, centerLng, hotelLat, hotelLng);

    // wzór: cena - (distance ^ 1.5) * 500
    const score = -price - Math.pow(distance, 1.5) * 500;
    return parseFloat(score.toFixed(2));
}
// ===================== 🔹 FUNKCJA getHotels 🔹 =====================
async function getHotels({
    dest_id = "-523642",
    arrival_date = "2025-11-19",
    departure_date = "2025-11-22",
    adults = 2,
    room_qty = 1,
    sort_by = "price",
    stars = "class::2,class::3",
    property_types = "property_type::204",
    apartsAllowed = "false",
    max_pages = 5
} = {}) {
    const url = "https://booking-com15.p.rapidapi.com/api/v1/hotels/searchHotels";
    const headers = {
        "x-rapidapi-host": "booking-com15.p.rapidapi.com",
        "x-rapidapi-key":
            process.env.RAPIDAPI_KEY ||
            "5678365077msh7ef633b67e5a401p1ffa1fjsnd1d3fbe26a25",
    };

    const allHotels = [];

    try {
        console.log("TEST4", room_qty, adults, arrival_date, departure_date,)
        for (let page = 1; page <= max_pages; page++) {
            const params = {
                dest_id,
                search_type: "city",
                arrival_date,
                departure_date,
                adults,
                room_qty,
                page_number: page,
                sort_by,
                categories_filter: `${stars},${property_types}`,
                units: "metric",
                temperature_unit: "c",
                languagecode: "en-us",
                currency_code: "PLN",
                location: "US",
            };

            console.log(`🌍 Pobieram stronę ${page} z Booking.com API...`);
            const response = await axios.get(url, { params, headers, timeout: 20000 });

            const hotels = response.data.data?.hotels || [];
            console.log(`✅ Otrzymano ${hotels.length} hoteli z strony ${page}`);

            if (hotels.length === 0) break;

            // Dodaj unikalne
            for (const hotel of hotels) {
                if (!allHotels.some(h => h.property?.id === hotel.property?.id)) {
                    allHotels.push(hotel);
                }
            }

            // 🔹 krótka pauza, by nie przekroczyć limitów API
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log(`🏨 Zebrano ${allHotels.length} obiektów.`);

        // 🔹 Filtracja, jeśli aparthotele niedozwolone
        let filteredHotels = allHotels;
        if (apartsAllowed === "false" || apartsAllowed === false) {
            filteredHotels = allHotels.filter(
                h => h.property?.accuratePropertyClass && h.property.accuratePropertyClass > 0
            );
            console.log(`🚫 Odfiltrowano ${allHotels.length - filteredHotels.length} obiektów bez klasy gwiazdkowej.`);
        }

        console.log(`✅ Zwracam ${filteredHotels.length} hoteli po filtracji.`);
        return filteredHotels;
    } catch (error) {
        console.error("❌ Błąd w getHotels:", error.response?.data || error.message);
        throw new Error("Błąd przy pobieraniu danych z Booking.com");
    }
}
// ===================== 🔹 ENDPOINT findHotel 🔹 =====================

app.get("/findHotel", async (req, res) => {
    const {
        city,
        centerLat,
        centerLng,
        arrival_date,
        departure_date,
        sort_by = "price",
        stars = "class::3,class::4,class::5",
        property_types = "property_type::204",
        apartsAllowed = "false",
        max_pages = 3,
        uczestnicy = 20,
        opiekunowie = 2,
        pokojeOpiekunowie = 2
    } = req.query;

    if (!city || !centerLat || !centerLng) {
        return res.status(400).json({
            error: "Brak wymaganych parametrów: ?city=, ?centerLat=, ?centerLng="
        });
    }
    console.log("PARAMETRY: ", city,
        centerLat,
        centerLng,
        arrival_date,
        departure_date,
        sort_by,
        stars,
        property_types,
        uczestnicy,
        opiekunowie,
        pokojeOpiekunowie)
    try {
        console.log(`🏙️ Szukam hoteli w mieście: ${city}`);

        // 1️⃣ Pobranie dest_id
        const destResponse = await axios.get(
            "https://booking-com15.p.rapidapi.com/api/v1/hotels/searchDestination",
            {
                params: { query: city },
                headers: {
                    "x-rapidapi-host": "booking-com15.p.rapidapi.com",
                    "x-rapidapi-key":
                        process.env.RAPIDAPI_KEY ||
                        "5678365077msh7ef633b67e5a401p1ffa1fjsnd1d3fbe26a25",
                },
                timeout: 10000,
            }
        );

        const destinations = destResponse.data.data || [];
        if (!destinations.length) {
            return res.status(404).json({ error: `Nie znaleziono lokalizacji: ${city}` });
        }

        const dest_id = destinations[0].dest_id;
        console.log(`✅ dest_id dla ${city}: ${dest_id}`);

        // 2️⃣ Pobierz osobno hotele dla uczniów i opiekunów
        console.log("👨‍🏫 Pobieram hotele dla opiekunów...");
        const hotelsTab = await getHotels({
            dest_id,
            arrival_date,
            departure_date,
            adults: Number(opiekunowie) + Number(uczestnicy),
            room_qty: 1,
            sort_by,
            stars,
            property_types,
            apartsAllowed,
            max_pages
        });

        // 4️⃣ Oblicz scoring dla każdego hotelu
        const scoredHotels = hotelsTab.map(h => ({
            ...h,
            score: calculateHotelScore(h, parseFloat(centerLat), parseFloat(centerLng))
        }));

        let sortedHotels = scoredHotels
            .filter(h => h.score !== null)
            .sort((a, b) => b.score - a.score);
        

        res.json({
            success: true,
            total: sortedHotels.length,
            city,
            uczestnicy,
            opiekunowie,
            pokojeOpiekunowie,
            hotels: sortedHotels
        });

    } catch (error) {
        console.error("❌ Błąd w /findHotel:", error.response?.data || error.message);
        res.status(500).json({ error: "Błąd podczas wyszukiwania hoteli." });
    }
});

// === ENDPOINT: czat planujący wyjazd ===
// WYMAGANE: const OpenAI = require("openai"); const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/chat-planner", async (req, res) => {
    try {
        const {
            message,                    // string – nowa wiadomość użytkownika
            history = [],               // [{role:'user'|'assistant', content:'...'}]
            activitiesSchedule = [],    // tablica dni -> tablica aktywności [{idGoogle, nazwa}]
            attractions = [],           // tablica atrakcji [{idGoogle, nazwa}]
            miejsceDocelowe = null      // { nazwa, location:{lat,lng}, ... }
        } = req.body || {};

        if (!message || !miejsceDocelowe) {
            return res.status(400).json({ error: "Brak 'message' lub 'miejsceDocelowe' w body." });
        }

        // 🔹 Dane wejściowe są już odchudzone, ale kontrolnie odfiltrujmy zbędne pola
        const slimAttractions = attractions.slice(0, 50).map(a => ({
            googeleId: a.googleId || null,
            nazwa: a.nazwa || null
        }));

        const slimSchedule = activitiesSchedule.map(day =>
            Array.isArray(day)
                ? day.map(act => ({
                    googleId: act?.googleId || null,
                    nazwa: act?.nazwa || null
                }))
                : []
        );

        // 🔧 SYSTEM PROMPT
        const systemPrompt = `
Jesteś inteligentnym asystentem planowania szkolnego wyjazdu do miejsca "${miejsceDocelowe?.nazwa || "?"}".
Masz dostęp do:
- "activitiesSchedule": obecny plan dni i atrakcji (googleId + nazwa), aktywnosci baseHotelIn, baseHotelOut, baseRouteTo, baseRouteFrom sa sztywno ustawione na poczatku i koncu dnia, baseBookIn oraz baseBookOut moga byc przesuwane w ciagu dnia uwzgledniajac dobe hotelowa
- "attractions": dostępne atrakcje w miejscu docelowym (googleId + nazwa),
- funkcji, które możesz zaproponować w odpowiedzi:
  addActivity(dayIndex, activity) - dodajesz nowa aktywnosc na koniec planu, przed powrotem na nocleg.
  swapActivities(dayIndex, actIndexA, actIndexB) - zamieniasz aktywnosci o podanych indeksach 
  changeActivity(dayIndex, actIndex, activity) - zamieniasz aktywnosc o podanym indeksie na nowa, nie dziala dla aktywnosci podstawowych o googleId base...
  deleteActivity(dayIndex, actIndex) - usuwasz aktywnosc, nie dziala dla aktywnosci podstawowych o googleId base...


ZASADY:
-Zwracaj wielką uwage na googleId - jest to zdecydowanie najwazniejsze pole i nie moga pojawic sie w nim bledy!!
- Odpowiadaj po polsku, zwięźle (2–4 zdania), naturalnie i profesjonalnie.
- W odpowiedzi podaj:
   1️⃣ Krótką wiadomość tekstową.
   2️⃣ NOWĄ LINIĘ i linijkę w formacie:
       **commands** <komenda1>; <komenda2>; ...
- Jeśli nie masz komend, zwróć: **commands** (pusta lista).
- W komendach:
   • Jeśli atrakcja pochodzi z bazy (jest w "attractions"), zwracaj tylko { googleId, nazwa, czasZwiedzania }.
   • Jeśli AI wymyśla nową atrakcję, użyj { googleId:"aiGenerated", nazwa, adres, czasZwiedzania }.
- Jesli chcesz dodac jakas atrakcje, !!koniecznie sprawdz czy znajduje sie w tablicy atrakcji i przepisz jego id!!. Wymyslaj wlasne tylko w przypadku nieuniknionej koniecznosci.
- Jeśli użytkownik pisze coś niezwiązanego z planowaniem wyjazdu lub używa wulgaryzmów — nie podawaj żadnych komend i odpowiedz stosownym komunikatem.

PRZYKŁAD WYJŚCIA (w komendach nie uzywaj spacji):
"Świetny pomysł! Możemy dodać wizytę w Muzeum Narodowym w pierwszym dniu, by rozpocząć kulturalnie."
**commands** addActivity(0, { googleId:"123XYZ", nazwa:"Muzeum Narodowe", czasZwiedzania:90 }); deleteActivity(1, 0)
`;

        // 🔹 Zbudowanie promptu z historią i kontekstem
        const messagesForModel = [
            { role: "system", content: systemPrompt },
            ...history.slice(-10),
            {
                role: "user",
                content:
                    `KONTEKST:\n` +
                    `- Miejsce docelowe: ${miejsceDocelowe?.nazwa}\n` +
                    `- Atrakcje (skrót): ${JSON.stringify(slimAttractions)}\n` +
                    `- Obecny plan: ${JSON.stringify(slimSchedule)}\n\n` +
                    `WIADOMOŚĆ UŻYTKOWNIKA:\n${message}`
            }
        ];

        const completion = await openai.chat.completions.create({
            model: "gpt-5-mini",
            messages: messagesForModel,
        });

        let reply = (completion.choices?.[0]?.message?.content || "").trim();
        let messageAnswer = "";
        // 🔹 Usuń wszystko od linii zaczynającej się na "**commands**"
        if (reply.includes("**commands**")) {
            messageAnswer = reply.split("**commands**")[0].trim();
        }

        // 🔹 Ekstrakcja komend z linii **commands**
        let commandsLine = "";
        const lines = reply.split("\n");
        for (const ln of lines) {
            if (ln.trim().startsWith("**commands**")) {
                commandsLine = ln.trim();
                break;
            }
        }

        // Wytnij wszystko po "**commands**" i rozbij po średnikach
        let commands = [];
        if (commandsLine) {
            const afterMarker = commandsLine.replace("**commands**", "").trim();
            if (afterMarker.length > 0) {
                commands = afterMarker
                    .split(";")
                    .map(s => s.trim())
                    .filter(Boolean);
            }
        }

        return res.json({
            ok: true,
            reply: messageAnswer,    // pełny tekst konwersacji z linią **commands**
            commands, // lista samych komend jako tekst
        });

    } catch (err) {
        console.error("❌ /chat-planner błąd:", err?.response?.data || err.message);
        return res.status(500).json({ error: "Błąd generowania odpowiedzi czatu." });
    }
});



app.listen(PORT, () => {
    console.log(`Serwer działa na http://localhost:${PORT}`);
});
