
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

// użycie CORS dla wszystkich domen (dev)
app.use(cors());
app.use(express.json());


function computeTransitCost(transitRoute, czas = 0) {
    const CAP = 150;     // maksymalna opłata
    const UNIT = 4;      // jednostka taryfowa (np. co 4 min)

    const costFromDuration = (minutes) => {
        const m = Math.max(0, Number(minutes) || 0);
        if (m === 0) return 0;
        return Math.min(Math.ceil(m / UNIT), CAP);
    };

    // Brak szczegółów trasy – licz z całkowitego czasu przejazdu
    if (!Array.isArray(transitRoute) || transitRoute.length === 0) {
        return costFromDuration(czas);
    }

    // Sumuj po segmentach TRANSIT
    let total = 0;
    for (const seg of transitRoute) {
        if (seg?.type === 'TRANSIT') {
            const dur = Number(seg.durationMinutes) || 0;
            total += dur > 45 ? costFromDuration(dur) : 4; // minimalna opłata dla krótkich odcinków
        }
    }
    return total;
}

async function computePrice({
    activitiesSchedule,
    liczbaUczestnikow,
    liczbaOpiekunow,
    routeSchedule,
    wybranyHotel,
    chosenTransportSchedule,
    standardTransportu,

    standardHotelu,
}) {
    console.log(chosenTransportSchedule, standardTransportu, standardHotelu)
    //console.log(activitiesSchedule, liczbaOpiekunow, liczbaUczestnikow, routeSchedule, wybranyHotel, standardTransportu, chosenTransportSchedule)
    if (liczbaUczestnikow == 0) return 0;
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
    const hotelPrice = standardHotelu === 3 ? 0 : (Number(wybranyHotel?.cena) / Math.min(liczbaUczestnikow + liczbaOpiekunow, 30)) * (liczbaUczestnikow + liczbaOpiekunow) || 0;
    const perPerson = Number(liczbaUczestnikow) > 0 ? (x) => x / Number(liczbaUczestnikow) : (x) => x;

    // 3) wariant “tylko hotel + aktywności” (np. standardTransportu == 2)


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
                    const czas = routeSchedule[i]?.[j]?.czasy[2];
                    sumaPrzejazdow += computeTransitCost(tr, czas);
                }
                else if (standardTransportu === 0 && row[j] === 2) {
                    sumaPrzejazdow += Math.ceil((250 * routeSchedule[i][j]?.czasy[2] / 60) / liczbaUczestnikow)
                    console.log("TEST2", Math.ceil((250 * routeSchedule[i][j]?.czasy[2] / 60) / liczbaUczestnikow), (250 * routeSchedule[i][j]?.czasy[2] / 60))
                }
            }
        }
    }

    let przejazdyPerUczestnik = Math.ceil(sumaPrzejazdow * (liczbaOpiekunow + liczbaUczestnikow) / (liczbaUczestnikow))

    // console.log("Podzial ceny", sumaAktywnosci, aktywnosciPerUczestnik, hotelPrice, perPerson(hotelPrice), sumaPrzejazdow, przejazdyPerUczestnik, )
    const nettoResult = aktywnosciPerUczestnik + przejazdyPerUczestnik + perPerson(hotelPrice);
    console.log("Calkowita cena netto per osoba:",
        aktywnosciPerUczestnik,
        przejazdyPerUczestnik,
        perPerson(hotelPrice),
        Math.ceil(Math.min(Math.max(50 + (dni - 1) * 35, nettoResult * 1 / 20), nettoResult * 1 / 10) * 123 / 100)
    )
    const bruttoResult = Math.ceil(Math.min(Math.max(50 + (dni - 1) * 35, nettoResult * 1 / 20), nettoResult * 1 / 10) * 123 / 100) + nettoResult;
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
            standardTransportu,
            standardHotelu = 3,
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
            standardTransportu,
            standardHotelu,
        });

        // Bezpieczne rzutowanie + zaokrąglenie w górę
        const tripPrice = Math.ceil(Number(rawPrice) || 0);

        const insurancePrice = 10;
        return res.json({ tripPrice, insurancePrice });
    } catch (err) {
        next(err);
    }
});



app.get("/searchCityNew", async (req, res) => {
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
                countrycodes: "pl,de,cz,sk,lt,fr,at",
                "accept-language": "pl",
                autocomplete: 1,
                dedupe: 1
            },
            headers: {
                "User-Agent": "WycieczkaZKlasa/1.0 (twoj.mail@twojadomena.pl)",
                "Accept-Language": "pl"
            }
        });

        const uniqueMap = new Map();

        response.data.forEach((place) => {
            const addr = place.address || {};
            const nazwa =
                addr.city ||
                addr.town ||
                addr.village ||
                addr.hamlet ||
                (place.display_name ? place.display_name.split(",")[0] : "");

            if (!nazwa) return;

            const wojewodztwo = addr.state || "";
            const kraj = addr.country || "";
            const key = `${nazwa}-${wojewodztwo}-${kraj}`;

            if (!uniqueMap.has(key)) {
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
                    location: {
                        lat: place.lat ? Number(place.lat) : null,
                        lng: place.lon ? Number(place.lon) : null,
                    },
                });
            }
        });

        const results = Array.from(uniqueMap.values()).sort((a, b) => a.priority - b.priority);
        res.json(results);
    } catch (error) {
        console.error("Nominatim 403:", error.response?.status, error.response?.data);
        res.status(500).json({ error: "Błąd serwera (Nominatim)" });
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
                countrycodes: "pl,de,cz,sk,lt,fr, at",
                "accept-language": "pl",
                autocomplete: 1,    // <-- autouzupełnianie
                dedupe: 1           // <-- usuwanie duplikatów od strony Nominatim
            },
            headers: {
                "User-Agent": "WycieczkaZKlasa/1.0 (twoj.mail@twojadomena.pl)",
                "Accept-Language": "pl"
            }
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
mongoose
    .connect(uri /* w nowych wersjach możesz pominąć useNewUrlParser/useUnifiedTopology */)
    .then(async () => {
        console.log("Połączono z MongoDB");

        const port = process.env.PORT || 5006;

        app.listen(port, () => {
            console.log("VERSION 0.1")
            console.log(`Serwer nasłuchuje na porcie ${port}`);
        });
    })
    .catch((err) => {
        console.error("Błąd MongoDB:", err);
        process.exit(1);
    });
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
    parentPlaceId: { type: String }, // ID miasta/placeId
    googleId: { type: String, required: true, unique: true },
    nazwa: String,
    adres: String,
    ocena: Number,
    liczbaOpinie: Number,

    lokalizacja: {
        lat: Number,
        lng: Number,
    },
    locationGeo: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            // [lng, lat]
            type: [Number],
            index: '2dsphere',
        },
    },

    typy: [String],
    ikona: String,
    stronaInternetowa: String,
    wallpaper: String,
    photos: [String],

    // 🔹 NOWE: źródło lokalizacji
    locationSource: {
        type: String,
        enum: ["Google", "Owner", "Mod", "Admin"],
        default: "Google",
    },

    // 🔹 NOWE: źródło danych (np. wariantów oferty)
    dataSource: {
        type: String,
        enum: ["Bot", "Mod", "Owner", "Admin"],
        default: "Bot",
    },

    // 🔹 NOWE: daty dodania i ostatniej aktualizacji
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },

    // 🔹 Warianty oferty
    warianty: [
        {
            nazwaWariantu: { type: String, default: "Zwiedzanie" },
            czasZwiedzania: { type: Number, default: null },        // w minutach
            cenaZwiedzania: { type: Number, default: null },        // bilet normalny
            cenaUlgowa: { type: Number, default: null },            // bilet ulgowy
            interval: {
                type: String,
                enum: ["jednorazowo", "za godzinę", "404"],
                default: "404",
            },
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

AttractionSchema.index({ locationGeo: '2dsphere' });

// 🔹 aktualizacja updatedAt przy każdym .save()
AttractionSchema.pre("save", function (next) {
    this.updatedAt = new Date();
    if (!this.createdAt) {
        this.createdAt = this.updatedAt;
    }
    next();
});

const Attraction = mongoose.model("Attraction", AttractionSchema);

app.get("/getOneAttraction/:googleId", async (req, res) => {
    try {
        const { googleId } = req.params;
        if (!googleId || !googleId.trim()) {
            return res.status(400).json({ error: "Parametr :googleId jest wymagany." });
        }

        // Opcjonalna projekcja, aby nie zwracać pól technicznych, których nie potrzebujesz
        const projection = {
            _id: 0,
            __v: 0,
        };

        // Jeżeli masz indeks unikalny na googleId, wyszukiwanie będzie O(log n)
        const attraction = await Attraction.findOne({ googleId }, projection).lean().exec();

        if (!attraction) {
            return res.status(404).json({ error: `Nie znaleziono atrakcji dla googleId=${googleId}.` });
        }

        // (opcjonalnie) Cache krótkoterminowy po stronie klienta/proxy
        res.set("Cache-Control", "public, max-age=60");

        return res.json(attraction);
    } catch (err) {
        console.error("GET /attractions/:googleId error:", err);
        return res.status(500).json({ error: "Wewnętrzny błąd serwera." });
    }
});
/**
 * GET /attractions/nearby?lat=..&lng=..&radiusKm=70
 * Zwraca atrakcje posortowane wg odległości (domyślnie 70 km).
 */
const buildNearbyPipeline = (lat, lng, maxDistanceMeters, limit = 300) => ([
    {
        $geoNear: {
            near: { type: 'Point', coordinates: [lng, lat] }, // [lng, lat]
            key: 'locationGeo',
            spherical: true,
            distanceField: 'distanceMeters',
            maxDistance: maxDistanceMeters,
            query: { locationGeo: { $exists: true } },
        },
    },
    {
        $addFields: {
            distanceKm: { $round: [{ $divide: ['$distanceMeters', 1000] }, 2] },
            verified: { $ne: ['$dataSource', 'Bot'] },
        },
    },
    {
        $match: {
            $or: [
                { liczbaOpinie: { $gte: 150 } }, // ogólny próg
                { typy: 'museum' },              // wyjątek: muzea
            ],
        },
    },
    { $sort: { liczbaOpinie: -1 } },
    { $limit: limit },
    {
        $project: {
            createdAt: 0,
            updatedAt: 0,
            locationSource: 0,
        },
    },
]);
async function fetchAndStoreGoogleAttractionsAround(lat, lng, radiusKm = 70) {
    const centerLat = parseFloat(lat);
    const centerLng = parseFloat(lng);

    if (!Number.isFinite(centerLat) || !Number.isFinite(centerLng)) {
        return [];
    }

    const R = 0.18; // ~20 km
    const offsets = [
        { latOffset: 0, lngOffset: 0 },
        { latOffset: R, lngOffset: 0 },
        { latOffset: 0, lngOffset: R },
        { latOffset: R, lngOffset: R },
    ];
    const types = ["tourist_attraction", "museum"];

    const allGoogleAttractions = [];

    for (const offset of offsets) {
        const tileLat = centerLat + offset.latOffset;
        const tileLng = centerLng + offset.lngOffset;

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

                const filteredResults = (data.results || []).filter(place => {
                    const types = place.types || [];
                    return !types.includes("shopping_mall")
                        && !types.includes("lodging")
                        && !types.includes("store")
                        && !types.includes("furniture_store")
                        && !types.includes("home_goods_store");
                });

                for (const place of filteredResults) {
                    if (!allGoogleAttractions.some(a => a.googleId === place.place_id)) {
                        const website = null;

                        const latNum = place.geometry.location.lat;
                        const lngNum = place.geometry.location.lng;

                        allGoogleAttractions.push({
                            googleId: place.place_id,
                            nazwa: place.name,
                            adres: place.vicinity || "",
                            ocena: place.rating || null,
                            liczbaOpinie: place.user_ratings_total || 0,
                            lokalizacja: {
                                lat: latNum,
                                lng: lngNum,
                            },
                            locationGeo: {
                                type: "Point",
                                coordinates: [lngNum, latNum], // [lng, lat]
                            },
                            typy: place.types || [],
                            ikona: null,
                            photos: [],
                            stronaInternetowa: website,
                            locationSource: "Google",
                            dataSource: "Bot",
                        });
                    }
                }

                nextPageToken = data.next_page_token || null;
                page++;

                if (nextPageToken) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            } while (nextPageToken && page < 3);
        }
    }

    // Zapis tylko nowych atrakcji (po googleId)
    for (const attr of allGoogleAttractions) {
        const exists = await Attraction.findOne({ googleId: attr.googleId }).select("_id").lean();
        if (!exists) {
            const newAttr = new Attraction(attr);
            await newAttr.save();
        }
    }

    // 🔙 Na końcu zwracamy listę z promienia radiusKm (np. 70 km), już z bazy
    const maxDistanceMeters = Math.max(1, Math.round((radiusKm || 70) * 1000));
    const items = await Attraction.aggregate(
        buildNearbyPipeline(centerLat, centerLng, maxDistanceMeters, 300)
    );
    return items;
}
app.get('/attractions/nearby', async (req, res) => {
    try {
        const lat = Number(req.query.lat);
        const lng = Number(req.query.lng);
        const radiusKm = Number(req.query.radiusKm) || 70;

        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
            return res.status(400).json({ error: 'Wymagane parametry: lat, lng (Number)' });
        }

        // --- LOGIKA HYBRYDOWA ---
        // Sprawdzamy, czy klient prosi o paginację
        const explicitPage = req.query.page;
        const explicitLimit = req.query.limit;
        const usePagination = explicitPage !== undefined || explicitLimit !== undefined;

        let skip = 0;
        let limit = 300; // Domyślny limit "dla wszystkich" (zabezpieczenie przed overloadem)

        if (usePagination) {
            const pageVal = parseInt(explicitPage) || 1;
            const limitVal = parseInt(explicitLimit) || 20;
            skip = (pageVal - 1) * limitVal;
            limit = limitVal;
        }
        // ------------------------

        const maxDistanceMetersAll = Math.max(1, Math.round(radiusKm * 1000));

        // Budowanie Pipeline'u MongoDB
        const geoStage = {
            $geoNear: {
                near: { type: 'Point', coordinates: [lng, lat] },
                key: 'locationGeo',
                spherical: true,
                distanceField: 'distanceMeters',
                maxDistance: maxDistanceMetersAll,
                query: { locationGeo: { $exists: true } },
            },
        };

        const commonStages = [
            {
                $addFields: {
                    distanceKm: { $round: [{ $divide: ['$distanceMeters', 1000] }, 2] },
                    verified: { $ne: ['$dataSource', 'Bot'] },
                },
            },
            {
                $match: {
                    $or: [
                        { liczbaOpinie: { $gte: 150 } },
                        { typy: 'museum' },
                    ],
                },
            },
            { $sort: { liczbaOpinie: -1 } }, // Sortowanie np. po popularności
            {
                $project: {
                    createdAt: 0,
                    updatedAt: 0,
                    locationSource: 0,
                },
            }
        ];

        // Dodajemy paginację na końcu pipeline'u
        const finalPipeline = [geoStage, ...commonStages];

        if (usePagination) {
            // Tryb Admina / Load More: ścisła paginacja
            finalPipeline.push({ $skip: skip });
            finalPipeline.push({ $limit: limit });
        } else {
            // Tryb Legacy: zwracamy "wszystkie" (do bezpiecznego limitu 300)
            finalPipeline.push({ $limit: 300 });
        }

        // 1. Wykonanie zapytania
        const items = await Attraction.aggregate(finalPipeline);

        // --- OBSŁUGA DOGRYWANIA Z GOOGLE (Opcjonalna optymalizacja) ---
        // Jeśli to pierwsza strona (lub brak paginacji) i wyników jest mało,
        // możemy spróbować dociągnąć z Google.
        // Uwaga: Jeśli używasz paginacji, dociąganie z Google jest skomplikowane,
        // bo zmienia offsety. Tutaj zostawiam prostą logikę:
        // Jeśli tryb "legacy" i mało wyników -> dociągnij.

        if (!usePagination && items.length < 20) {
            // Tu ewentualnie logika fetchAndStoreGoogleAttractionsAround...
            // Ale dla prostoty i wydajności w trybie paginacji admina zazwyczaj polegamy na tym co jest w bazie.
        }

        return res.json(items);

    } catch (err) {
        console.error('GET /attractions/nearby error:', err);
        return res.status(500).json({ error: 'ServerError' });
    }
});
/**
 * Fetches a representative image URL for a given attraction name from Wikipedia.
 *
 * Strategy:
 * 1) Use Wikipedia REST "page/summary" via search result (best-effort, simple).
 * 2) If summary has no image, fallback to MediaWiki API (pageimages).
 *
 * Notes:
 * - This returns a single best-effort image URL (often the infobox lead image).
 * - For production, you should also fetch license/attribution from MediaWiki/Commons if you plan to display the image publicly.
 *
 * Requirements:
 * - Node.js 18+ (global fetch available). For Node <18, install node-fetch and replace fetch import accordingly.
 */

/**
 * Express endpoint that calls getWikipediaImageUrl(...)
 *
 * GET /api/wiki-image?name=BMW%20Museum%20Munich&lang=en&thumbWidth=1200
 * Response:
 * 200 { name, lang, thumbWidth, imageUrl }
 * 404 { name, lang, thumbWidth, imageUrl: null, error }
 */
// ---- Your function (unchanged) ----
async function getWikipediaImageUrl(attractionName, options = {}) {
    const {
        lang = "pl",
        thumbWidth = 300,
        userAgent = "MyApp/1.0 (contact: your-email@example.com)",
        timeoutMs = 12_000,
    } = options;

    if (!attractionName || typeof attractionName !== "string") {
        throw new TypeError("attractionName must be a non-empty string");
    }

    const baseWiki = `https://${lang}.wikipedia.org`;
    const api = `${baseWiki}/w/api.php`;

    // Small helper: fetch with timeout
    const fetchWithTimeout = async (url) => {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), timeoutMs);
        try {
            const res = await fetch(url, {
                signal: ctrl.signal,
                headers: {
                    "User-Agent": userAgent,
                    Accept: "application/json",
                },
            });
            if (!res.ok) {
                const text = await res.text().catch(() => "");
                throw new Error(
                    `HTTP ${res.status} from ${url}${text ? `: ${text.slice(0, 200)}` : ""}`
                );
            }
            return res.json();
        } finally {
            clearTimeout(t);
        }
    };

    // 1) Search the best matching page title
    const searchUrl =
        `${api}?action=query&format=json&origin=*` +
        `&list=search&srsearch=${encodeURIComponent(attractionName)}` +
        `&srlimit=1&srprop=`;

    const searchJson = await fetchWithTimeout(searchUrl);
    const hit = searchJson?.query?.search?.[0];
    if (!hit?.title) return null;

    const title = hit.title; // e.g., "BMW Museum"

    // 2) Try REST summary (often includes thumbnail/originalimage)
    const summaryUrl = `${baseWiki}/api/rest_v1/page/summary/${encodeURIComponent(
        title.replace(/ /g, "_")
    )}`;

    try {
        const summaryJson = await fetchWithTimeout(summaryUrl);

        const urlFromSummary =
            summaryJson?.originalimage?.source ||
            summaryJson?.thumbnail?.source ||
            null;

        if (urlFromSummary) return urlFromSummary;
    } catch {
        // Ignore REST errors and fallback to MediaWiki API
    }

    // 3) Fallback: MediaWiki pageimages (lets you request a specific thumb size)
    const pageImagesUrl =
        `${api}?action=query&format=json&origin=*` +
        `&prop=pageimages&piprop=thumbnail|original` +
        `&pithumbsize=${encodeURIComponent(String(thumbWidth))}` +
        `&titles=${encodeURIComponent(title)}`;

    const pageJson = await fetchWithTimeout(pageImagesUrl);
    const pages = pageJson?.query?.pages;
    if (!pages) return null;

    const firstPage = pages[Object.keys(pages)[0]];
    const urlFromPageImages =
        firstPage?.original?.source || firstPage?.thumbnail?.source || null;

    return urlFromPageImages;
}
// Async function (backend) – given place name + location, returns exact Wikipedia title using Perplexity
// Usage: const title = await getWikipediaExactTitle({ name, location: { lat, lng }, city, address });

async function getWikipediaExactTitle(nameWithCity) {

    const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
    if (!PERPLEXITY_API_KEY) throw new Error("Missing PERPLEXITY_API_KEY");

    if (!nameWithCity || typeof nameWithCity !== "string" || !nameWithCity.trim()) {
        throw new Error("Missing 'name'");
    }

    const prompt =
        `Podaj dokładny tytuł artykułu Wikipedii dla: ${nameWithCity.trim()}.\n` +
        `Zwróć wyłącznie JSON w formacie: {"title":"...","lang":"pl"}.\n` +
        `Lang to skrót języka Wikipedii (np. pl, en, de).
         Zwroc nazwe z wikipedii w ktorej jest dany obiekt, jak cos jest z niemiec to zwroc po niemiecku, jak z polski to polska nazwe na wikipedii itp`;

    const body = {
        model: "sonar-pro",
        temperature: 0,
        messages: [
            {
                role: "system",
                content:
                    "Zwracaj WYŁĄCZNIE poprawny JSON zgodny ze schematem. Bez komentarzy, bez Markdowna.",
            },
            { role: "user", content: prompt },
        ],
        response_format: {
            type: "json_schema",
            json_schema: {
                name: "wiki_title_lang",
                schema: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                        title: { type: "string" },
                        lang: { type: "string" },
                    },
                    required: ["title", "lang"],
                },
            },
        },
    };

    const resp = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify(body),
    });

    const data = await resp.json().catch(() => null);
    if (!resp.ok) {
        throw new Error(
            data?.error?.message ||
            data?.error ||
            `Perplexity request failed (${resp.status})`
        );
    }

    const content = data?.choices?.[0]?.message?.content;

    const normalize = (t) => {
        if (!t) return "";
        let s = String(t).trim();
        s = s.replace(/^["'„”]+|["'„”]+$/g, "").trim();
        s = s.split("\n").map((x) => x.trim()).filter(Boolean)[0] || "";
        return s;
    };

    let title = "";
    let lang = "";

    if (typeof content === "string") {
        const parsed = JSON.parse(content);
        title = normalize(parsed?.title);
        lang = normalize(parsed?.lang).toLowerCase();
    } else if (content && typeof content === "object") {
        title = normalize(content?.title);
        lang = normalize(content?.lang).toLowerCase();
    }

    if (!title) throw new Error("Empty title returned from Perplexity");
    if (!lang) lang = "pl";

    // sanity: lang jak "pl", "en", "de", "pt-br"
    if (!/^[a-z]{2,3}(-[a-z]{2,3})?$/i.test(lang)) lang = "pl";

    return { title, lang };
}


// ---- Endpoint ----
// zakładam, że masz model Attraction w tym pliku:
// const Attraction = mongoose.model("Attraction", AttractionSchema);

app.get("/api/wiki-image", async (req, res) => {
    try {
        let name = String(req.query.name || "").trim();
        let lang = String(req.query.lang || "pl").trim();
        const googleId = String(req.query.googleId || "").trim();

        if (!name) {
            return res.status(400).json({
                error: "Missing required query param: name",
                example:
                    "/api/wiki-image?name=Smok%20Wawelski%20w%20Krakow&lang=pl&thumbWidth=300&googleId=YOUR_GOOGLE_ID",
            });
        }

        const thumbWidth = req.query.thumbWidth ? Number(req.query.thumbWidth) : 300;
        if (!Number.isFinite(thumbWidth) || thumbWidth <= 0) {
            return res.status(400).json({ error: "thumbWidth must be a positive number" });
        }

        // 1) Perplexity -> tytuł + język
        //const { title, lang: detectedLang } = await getWikipediaExactTitle(name);
        const title = name;
        const detectedLang = "pl";
        name = String(title || "").trim();
        lang = (detectedLang || lang || "pl").trim();

        // ✅ Ciche zakończenie: brak tytułu
        if (!name) {
            return res.status(200).json({
                ok: true,
                name: null,
                lang,
                thumbWidth,
                imageUrl: null,
                googleId: googleId || null,
                saved: false,
            });
        }

        // 2) Wikipedia -> obrazek
        const imageUrl = await getWikipediaImageUrl(name, {
            lang,
            thumbWidth,
            userAgent: process.env.WIKI_UA || "MyApp/1.0 (contact: your-email@example.com)",
            timeoutMs: process.env.WIKI_TIMEOUT_MS ? Number(process.env.WIKI_TIMEOUT_MS) : 12_000,
        });

        // ✅ Ciche zakończenie: brak obrazka
        if (!imageUrl) {
            return res.status(200).json({
                ok: true,
                name,
                lang,
                thumbWidth,
                imageUrl: null,
                googleId: googleId || null,
                saved: false,
            });
        }

        // 3) (Opcjonalnie) zapis do bazy
        let saved = false;
        // if (googleId) {
        //     const updated = await Attraction.findOneAndUpdate(
        //         { googleId },
        //         {
        //             $set: {
        //                 wallpaper: imageUrl,
        //                 updatedAt: new Date(),
        //             },
        //         },
        //         { new: true, projection: { _id: 0, googleId: 1, wallpaper: 1 } }
        //     )
        //         .lean()
        //         .catch(() => null);

        //     saved = Boolean(updated);
        // }

        return res.status(200).json({
            ok: true,
            name,
            lang,
            thumbWidth,
            imageUrl,
            googleId: googleId || null,
            saved,
        });
    } catch (err) {
        const msg = err?.message || String(err);

        // Błędy walidacji -> 400
        const isBadRequest =
            msg.includes("Missing 'name'") || msg.includes("Missing") || msg.includes("invalid");

        if (isBadRequest) {
            return res.status(400).json({ ok: false, error: msg });
        }

        // Pozostałe -> 500 (tu już realny błąd serwera / integracji)
        return res.status(500).json({
            ok: false,
            error: "Failed to fetch Wikipedia image",
            details: msg,
        });
    }
});





// Endpoint: awaryjne dodanie atrakcji z wyliczeniem locationGeo
app.post('/emergencyAddAttraction', async (req, res) => {
    try {
        const {
            parentPlaceId,
            googleId,
            nazwa,
            adres,
            ocena,
            liczbaOpinie,
            lokalizacja,        // { lat, lng }
            typy,
            ikona,
            stronaInternetowa,
            photos,
            warianty,
            dataSource,
        } = req.body || {};

        if (!parentPlaceId || !googleId) {
            return res.status(400).json({ error: 'parentPlaceId i googleId są wymagane.' });
        }

        const lat = Number(lokalizacja?.lat);
        const lng = Number(lokalizacja?.lng);
        if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            return res.status(422).json({ error: 'Nieprawidłowe współrzędne lokalizacji (lat/lng).' });
        }

        const exists = await Attraction.findOne({ googleId }).lean();
        if (exists) {
            return res.status(409).json({ error: 'Atrakcja o podanym googleId już istnieje.' });
        }

        const locationGeo = { type: 'Point', coordinates: [lng, lat] };

        // Bezpieczna normalizacja źródeł
        const allowedLocationSources = ["Google", "Owner", "Mod", "Admin"];
        const allowedDataSources = ["Bot", "Mod", "Owner", "Admin"];

        const normalizedLocationSource = allowedLocationSources.includes(locationSource)
            ? locationSource
            : undefined; // użyje domyślnej wartości ze schematu

        const normalizedDataSource = allowedDataSources.includes(dataSource)
            ? dataSource
            : undefined; // użyje domyślnej wartości ze schematu

        const doc = new Attraction({
            parentPlaceId,
            googleId,
            nazwa,
            adres,
            ocena,
            liczbaOpinie,
            lokalizacja,
            locationGeo,
            typy,
            ikona,
            stronaInternetowa,
            photos,
            warianty,
            locationSource: normalizedLocationSource,
            dataSource: normalizedDataSource,
            // createdAt / updatedAt ustawi pre('save')
        });

        await doc.save();
        return res.status(201).json(doc);
    } catch (err) {
        console.error('POST /emergencyAddAttraction error:', err);
        return res.status(500).json({ error: 'ServerError' });
    }
});



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
            lokalizacja,       // { lat, lng }
            typy,
            ikona,
            stronaInternetowa,
            photos
        } = req.body;

        if (!parentPlaceId || !googleId) {
            return res.status(400).json({ error: "parentPlaceId i googleId są wymagane." });
        }

        // Unikalność po googleId
        const existing = await Attraction.findOne({ googleId }).lean();
        if (existing) {
            return res.status(409).json({ error: "Atrakcja o podanym googleId już istnieje." });
        }

        // Zbuduj locationGeo z lokalizacja.lat/lng (jeśli podano poprawne liczby)
        let locationGeo = undefined;
        const lat = Number(lokalizacja?.lat);
        const lng = Number(lokalizacja?.lng);
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
            if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                locationGeo = { type: "Point", coordinates: [lng, lat] };
            } else {
                return res.status(422).json({ error: "Nieprawidłowy zakres współrzędnych lat/lng." });
            }
        }

        const newAttraction = new Attraction({
            parentPlaceId,
            googleId,
            nazwa,
            adres,
            ocena,
            liczbaOpinie,
            lokalizacja,
            locationGeo,
            typy,
            ikona,
            stronaInternetowa,
            photos,
            // Automatycznie z Google → oznaczamy źródła:
            locationSource: "Google",
            dataSource: "Bot",      // dane (np. warianty) uzupełniane przez bota/AI
            // createdAt / updatedAt ustawi pre('save')
        });

        await newAttraction.save();

        return res
            .status(201)
            .json({ message: "Atrakcja dodana pomyślnie.", attraction: newAttraction });
    } catch (err) {
        console.error("Błąd przy dodawaniu atrakcji:", err);
        return res.status(500).json({ error: "Błąd serwera." });
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
            return res.json(attractionsFromDb);
        }

        console.log("KAFELKUJE");
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
        const types = ["tourist_attraction", "museum"];

        for (const offset of offsets) {
            const tileLat = centerLat + offset.latOffset;
            const tileLng = centerLng + offset.lngOffset;

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

                    const filteredResults = (data.results || []).filter(place => {
                        const types = place.types || [];
                        !types.includes("lodging")
                            && !types.includes("store")
                            && !types.includes("furniture_store")
                            && !types.includes("home_goods_store")
                            && !types.includes("food");
                    });

                    for (const place of filteredResults) {

                        if (!allGoogleAttractions.some(a => a.googleId === place.place_id)) {
                            const website = null;
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
                const newAttr = new Attraction({
                    ...attr,
                    parentPlaceId: placeId,
                    // Źródła: dane i lokalizacja z Google/bota
                    locationSource: "Google",
                    dataSource: "Bot",
                    // createdAt / updatedAt ustawi pre('save')
                });
                await newAttr.save();
                newAttractions.push(newAttr);
            }
        }

        // 4️⃣ Połączenie wyników
        const allAttractions = [
            ...attractionsFromDb.map(a => a.toObject()),
            ...newAttractions.map(a => a.toObject()),
        ];

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

// --- ENDPOINTY ADMINA DO ZARZĄDZANIA ATRAKCJAMI ---

/**
 * GET /admin/attractions
 * Pobiera listę atrakcji z paginacją i filtrowaniem.
 * Query params:
 * - page (default 1)
 * - limit (default 20)
 * - search (szukanie po nazwie)
 * - city (szukanie po adresie - proste filtrowanie miasta)
 */
app.get("/admin/attractions", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || "";
        const city = req.query.city || "";

        const query = {};

        // Filtrowanie po nazwie
        if (search) {
            query.nazwa = { $regex: search, $options: "i" };
        }

        // Filtrowanie po mieście (szukamy w polu adres)
        if (city) {
            query.adres = { $regex: city, $options: "i" };
        }

        const total = await Attraction.countDocuments(query);
        const attractions = await Attraction.find(query)
            .sort({ updatedAt: -1 }) // Najpierw ostatnio edytowane
            .skip((page - 1) * limit)
            .limit(limit)
            .select("googleId nazwa adres warianty locationSource dataSource updatedAt stronaInternetowa");

        res.json({
            data: attractions,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (err) {
        console.error("GET /admin/attractions error:", err);
        res.status(500).json({ error: "Błąd serwera podczas pobierania atrakcji." });
    }
});

/**
 * PUT /admin/attractions/:googleId
 * Edycja atrakcji przez admina.
 * Wymusza zmianę dataSource na 'Admin' lub 'Mod'.
 */
app.put("/admin/attractions/:googleId", async (req, res) => {
    try {
        const { googleId } = req.params;
        const updateData = req.body;

        // --- ZMIANA: Obsługa źródła danych ---
        // Jeśli frontend przysłał dataSource/locationSource, używamy ich.
        // Jeśli nie, zostawiamy bez zmian (nie nadpisujemy na siłę).
        // Ewentualnie, jeśli chcesz wymusić 'Admin' TYLKO gdy pole jest puste:
        if (!updateData.dataSource) {
            updateData.dataSource = "Admin";
        }
        // -------------------------------------

        // Usuwamy pola systemowe, których nie chcemy edytować ręcznie
        delete updateData._id;
        delete updateData.__v;
        delete updateData.createdAt;
        // updatedAt zaktualizuje się samo (w pre-save hooku lub przez ustawienia mongoose)

        const updatedAttraction = await Attraction.findOneAndUpdate(
            { googleId },
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedAttraction) {
            return res.status(404).json({ error: "Nie znaleziono atrakcji." });
        }

        res.json({ message: "Atrakcja zaktualizowana", attraction: updatedAttraction });
    } catch (err) {
        console.error("PUT /admin/attractions error:", err);
        res.status(500).json({ error: "Błąd serwera podczas edycji." });
    }
});
/**
 * POST /admin/attractions
 * Ręczne tworzenie nowej atrakcji przez Admina.
 */
app.post("/admin/attractions", async (req, res) => {
    try {
        const {
            googleId,
            nazwa,
            adres,
            lat,
            lng,
            stronaInternetowa,
            wallpaper,
            warianty,
            // Pobieramy pola źródła z body
            dataSource,
            locationSource
        } = req.body;

        if (!nazwa || !adres) {
            return res.status(400).json({ error: "Nazwa i adres są wymagane." });
        }

        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
        let lokalizacja = {};
        let locationGeo = undefined;

        if (!isNaN(latitude) && !isNaN(longitude)) {
            lokalizacja = { lat: latitude, lng: longitude };
            locationGeo = { type: "Point", coordinates: [longitude, latitude] };
        }

        let finalGoogleId = googleId && String(googleId).trim().length > 0
            ? String(googleId).trim()
            : `manual_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

        const newAttraction = new Attraction({
            googleId: finalGoogleId,
            parentPlaceId: "manual_entry",
            nazwa,
            adres,
            lokalizacja,
            locationGeo,
            stronaInternetowa,
            wallpaper,
            warianty: warianty || [],

            // --- ZMIANA: Używamy danych z frontu lub domyślnie 'Admin' ---
            dataSource: dataSource || "Admin",
            locationSource: locationSource || "Admin",
            // -------------------------------------------------------------

            ocena: 0,
            liczbaOpinie: 0,
            typy: ["custom"],
            photos: []
        });

        await newAttraction.save();

        res.status(201).json({
            message: "Atrakcja utworzona pomyślnie",
            attraction: newAttraction
        });

    } catch (err) {
        console.error("POST /admin/attractions error:", err);
        if (err.code === 11000) {
            return res.status(409).json({ error: "Atrakcja o takim ID już istnieje." });
        }
        res.status(500).json({ error: "Błąd serwera podczas tworzenia atrakcji." });
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
        //console.log("Directions status:", data?.status, data?.error_message);
        if (!data.routes?.length) {
            //console.warn("⚠️ Brak wyników Google Directions API dla transit.");
            return null;
        }

        const route = data.routes[0];
        const leg = route.legs[0];
        const durationMinutes = Math.round(leg.duration.value / 60);
        if (data.routes[0].fare) {
            const fare = data.routes[0].fare;
            console.log(`Koszt przejazdu: ${fare.value} ${fare.currency}`);
        } else {
            console.log("Informacja o taryfie nie jest dostępna.");
        }
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

Nie zwracaj ofert grupowych jako osobnych wariantów. Najlepiej podaj ceny dla osoby indywidualnej bez zadnych znizek, jesli jednak podane beda tylko ceny grupowe podaj ja w przeliczeniu na osobe (powiedzmy w grupie 15 osobowej). Jesli nie znajdziesz zadnej informacji o cenach zwroc pusta tablice [] bez zadnej struktury!!.
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
            console.log("AI ZWRACA!", parsed)
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
            return res.json([]);
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



const PPLX_ENDPOINT = "https://api.perplexity.ai/chat/completions";
// Aktualne, wspierane modele – kolejność = priorytet/fallback
const PPLX_MODELS = [
    "sonar-pro",
    "sonar",
];

function buildPrompt(nazwa) {
    return `
ile kosztuje wejscie do ${nazwa} (lub okolicy) i jakie sa warianty.
zwróc informacje o wariantach, cenach, ich nazwach i potencjalnym czasie trwania
w kontekscie osoby kupujacej bilet normalny bez znizek wchodzacej samemu –
interesuje nas tylko stala oferta, pomijaj okresowe wydarzenia.
Interesuje nas tylko oferta dotyczaca tego obiektu, zadnego innego z nim powiazanego.
Jesli caly obiekt opiera sie jedynie na okresowych wydarzeniach zwroc obiekt {"nazwa":"defEvents"}. Pomijaj oferty wspolne z innymi obiektami - interesuje nas tylko i wylacznie oferta wspomnianego. Jesli znajdziesz w danym miejscu 
rozne sprzeczne wersje cenowe ZWROC DROZSZA ale w sytuacji gdy sa rozne warianty oferty (np. trasy zwiedzania) zwroc kazdy z nich osobno. Bardzo wazne jest zeby otrzymac wynik!!  W przypadku innej waluty niz PLN przelicz cene na zlotowki. 
Dodatkowo na koniec kiedy miejsce ma jakas oferte tzn nie jest nazwa "free", dodaj wariant "Punkt na trasie" z cena 0 i oszacuj czas zwiedzania jaki mozna poswiecic na ogladanie miejsca "z zewnatrz".
Dane zwroc jako CZYSTY JSON bez komentarzy i tekstu pobocznego,
w formacie jednej z trzech struktur:

1) {"warianty":[{"nazwa":"…","cena":123.45,"czasZwiedzania":90}, ...]}
   - cena liczba (0 jesli bezplatne), czasZwiedzania liczba w minutach
   - czasZwiedzania min. 10
2) {"nazwa":"defEvents"}  // gdy brak stalej oferty stalej, a sa tylko wydarzenia okresowe
3) {"nazwa":"noInfo"}    // gdy brak jakichkolwiek informacji o cenach i wariantach
4) {"nazwa":"free", cenaZwiedzania: 0, czasZwiedzania: (oszacuj ile mozna tam spedzic w mintuach)}      // gdy obiekt jest calkowicie bezplatny bo jest to np przestrzen publiczna

Wartosci MUSZA byc liczbami tam, gdzie wymagane. Nie dodawaj wyjasnien ani tekstu poza JSON.
`.trim();
}

function toNumberOrNull(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
}
function coerceMinutes(v) {
    const n = Number(v);
    if (Number.isFinite(n) && n > 0) return Math.round(n);
    return 60;
}
function extractJson(text) {
    if (!text) return null;
    const fenced = text.match(/```json\s*([\s\S]*?)\s*```/i);
    if (fenced) return fenced[1].trim();
    const brace = text.match(/\{[\s\S]*\}$/);
    if (brace) return brace[0];
    return text.trim();
}

/**
 * Zwraca:
 *  - []                        // brak informacji
 *  - [{ nazwa: "defEvents" }]  // obiekt dziala tylko w trybie wydarzen okresowych
 *  - lub [{ nazwaWariantu, cenaZwiedzania, czasZwiedzania }, ...]
 */
async function askPerplexityForAttraction(nazwaObiektu) {
    if (!nazwaObiektu || !String(nazwaObiektu).trim()) {
        throw new Error("nazwaObiektu jest wymagana");
    }
    const API_KEY = process.env.PERPLEXITY_API_KEY;
    if (!API_KEY) {
        throw new Error("Brak klucza PERPLEXITY_API_KEY w zmiennych środowiskowych");
    }

    const prompt = buildPrompt(nazwaObiektu);

    let lastErr;
    for (const model of PPLX_MODELS) {
        try {
            const { data } = await axios.post(
                PPLX_ENDPOINT,
                {
                    model,
                    temperature: 0,
                    max_tokens: 800,
                    return_citations: false,
                    messages: [
                        {
                            role: "system",
                            content: "Jestes asystentem ekstrakcji danych. Zwracasz WYLACZNIE surowy JSON zgodny ze schematem uzytkownika.",
                        },
                        { role: "user", content: prompt },
                    ],
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${API_KEY}`,
                    },
                    timeout: 90_000,
                }
            );

            const raw = data?.choices?.[0]?.message?.content;
            if (!raw) return [];

            const jsonStr = extractJson(raw);
            if (!jsonStr) return [];

            let parsed;
            try {
                parsed = JSON.parse(jsonStr);
            } catch (e) {
                console.error("Nieudany JSON.parse. Odpowiedź:", raw);
                return [];
            }

            // tylko wydarzenia okresowe
            if (parsed && parsed.nazwa === "defEvents") {
                return [{ nazwa: "defEvents" }];
            }

            // normalizacja
            const input = Array.isArray(parsed?.warianty) ? parsed.warianty : [];
            const normalized = input
                .map((it) => {
                    const nazwaWariantu = String(it.nazwa ?? it.nazwaWariantu ?? "Zwiedzanie").trim();
                    let cenaZwiedzania = toNumberOrNull(it.cena ?? it.cenaZwiedzania);
                    if (cenaZwiedzania == null) cenaZwiedzania = 0;
                    let czasZwiedzania = toNumberOrNull(it.czasZwiedzania);
                    if (czasZwiedzania == null) czasZwiedzania = coerceMinutes(it.czas || it.dlugosc || it.duration);
                    return { nazwaWariantu, cenaZwiedzania, czasZwiedzania };
                })
                .filter(
                    (v) =>
                        v &&
                        typeof v.nazwaWariantu === "string" &&
                        Number.isFinite(v.cenaZwiedzania) &&
                        Number.isFinite(v.czasZwiedzania)
                );

            // jeżeli po normalizacji nic sensownego – "brak informacji"
            return normalized.length ? normalized : [];
        } catch (err) {
            lastErr = err;
            const status = err?.response?.status;
            const body = err?.response?.data;
            console.error(`Perplexity error (model=${model}) status=${status}`, body || err.message);
            // lecimy do kolejnego modelu
        }
    }

    // wszystkie modele zawiodły → przekaż kontekst błędu wyżej (do logów)
    throw lastErr || new Error("Nie udało się pobrać danych z Perplexity.");
}
// Zakładam, że masz zainicjalizowanego klienta OpenAI jako `openai`
// np. const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function askChatIfStatic(nazwa) {
    if (!nazwa || !String(nazwa).trim()) return 0;

    const systemPrompt =
        "Jesteś asystentem decyzyjnym. Zwracasz wyłącznie surowy JSON, bez komentarzy ani dodatkowych treści.";
    const userPrompt = `
Czy "${nazwa}" jest atrakcją turystyczną biletowaną, czy ponad wszelką wątpliwość nie?
Przykład: wejście do parku/placu/pomnika nie wymaga biletu; to punkt do obejrzenia bez zakupu wejściówki.
Jesli obiekt jest pomnikiem lub parkiem praktycznie na pewno mozesz oszacowac czas jaki warto na niego poswiecic.
Zasady:
- Jeśli masz pewność, że to publiczna przestrzeń/obiekt niewymagający biletu - pomnnik, park czy inna przestrzen publiczna, zwróć szacowany czas w minutach, jaki warto poświęcić (np. 10–60 minut).
- Jeśli nie masz pewności (brak danych, możliwe bilety, obiekt muzealny itp.), zwróć 0.

Format odpowiedzi (STRICT JSON):
{"czasMinut": <liczba_calkowita>}
`.trim();

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-5-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ],
        });

        const content = (response?.choices?.[0]?.message?.content || "").trim();

        // Spróbuj sparsować JSON
        let minutes = 0;
        try {
            const obj = JSON.parse(content);
            minutes = Number(obj?.czasMinut);
            if (!Number.isFinite(minutes) || minutes < 0) minutes = 0;
        } catch {
            // Fallback: spróbuj wydobyć pierwszą liczbę całkowitą z odpowiedzi
            const m = content.match(/\b\d+\b/);
            minutes = m ? Number(m[0]) : 0;
            if (!Number.isFinite(minutes) || minutes < 0) minutes = 0;
        }

        // Zaokrąglenie i sanity-check
        minutes = Math.round(minutes);
        if (minutes > 0 && minutes < 5) minutes = 5; // minimalny sensowny czas
        if (minutes > 8 * 60) minutes = 8 * 60;      // górny bezpieczny limit

        return minutes;
    } catch (err) {
        console.error("askChatIfStatic error:", err?.message || err);
        return 0;
    }
}

function flattenWarianty(warianty) {
    if (!Array.isArray(warianty)) return [];
    return warianty
        .flatMap(w => {
            if (w && Array.isArray(w.data)) return w.data;  // [{ index, data: [...] }, ...]
            if (Array.isArray(w)) return w;                 // [[...], ...]
            if (w && typeof w === "object") return [w];     // [{...}, ...]
            return [];
        })
        .filter(Boolean);
}

app.get("/update-offer", async (req, res) => {
    const { googleId, link, miasto, nazwa } = req.query;

    if (!googleId) {
        return res.status(400).json({ error: "Brak wymaganego parametru ?googleId=" });
    }

    // --- PRE-TEST: statyczna / darmowa atrakcja ---
    try {
        if (nazwa) {
            const label = [nazwa, miasto].filter(Boolean).join(" w ");
            const preTest = await askChatIfStatic(label);
            if (Number.isFinite(preTest) && preTest > 0) {
                const attraction = await Attraction.findOne({ googleId });
                if (!attraction) {
                    return res.status(404).json({ error: `Nie znaleziono atrakcji o googleId: ${googleId}` });
                }
                attraction.warianty = [{ nazwa: "bezplatne", cenaZwiedzania: 0, czasZwiedzania: preTest }];

                // 🔹 dane pochodzą z bota (AI), aktualizujemy metadane:
                attraction.dataSource = "Bot";
                attraction.updatedAt = new Date();

                await attraction.save();
                return res.json({
                    success: true,
                    googleId,
                    warianty: attraction.warianty,
                });
            }
        }
    } catch (e) {
        console.error("askChatIfStatic pre-check error:", e?.message || e);
        // kontynuujemy normalny przepływ
    }

    // --- GŁÓWNY PRZEPŁYW W KOLEJCE ---
    offerQueue
        .add(async () => {
            try {
                const attraction = await Attraction.findOne({ googleId });
                if (!attraction) {
                    return res.status(404).json({ error: `Nie znaleziono atrakcji o googleId: ${googleId}` });
                }

                let flattenedVariants = [];

                if (link && 1 == 2) {
                    // a) Próba parsera /place-offer z limitem 2 min
                    try {
                        const controller = new AbortController();
                        const timer = setTimeout(() => controller.abort("PLACE_OFFER_TIMEOUT"), 120_000);

                        let response;
                        try {
                            response = await axios.get("http://localhost:5006/place-offer", {
                                params: { links: link },
                                timeout: 120_000,
                                signal: controller.signal,
                            });
                        } finally {
                            clearTimeout(timer);
                        }

                        const { warianty } = response?.data || {};
                        flattenedVariants = flattenWarianty(warianty);
                    } catch (e) {
                        const isTimeout =
                            e === "PLACE_OFFER_TIMEOUT" ||
                            e?.code === "ECONNABORTED" ||
                            /aborted|timeout/i.test(String(e?.message || e));
                        if (isTimeout) {
                            console.warn("place-offer timeout po 2 minutach — uruchamiam fallback Perplexity");
                        } else {
                            console.error("place-offer error:", e?.message || e);
                        }
                        flattenedVariants = [];
                    }

                    // b) Fallback: Perplexity, jeśli parser nic nie zwrócił
                    if (!Array.isArray(flattenedVariants) || flattenedVariants.length === 0) {
                        const qName = [nazwa, miasto].filter(Boolean).join(" w ") || attraction.nazwa || "obiekt";
                        try {
                            const alt = await askPerplexityForAttraction(qName);
                            flattenedVariants = Array.isArray(alt) ? flattenWarianty(alt) : [];
                            console.log("Perplexity (fallback) wynik:", flattenedVariants);
                        } catch (e) {
                            console.error("Perplexity fallback error:", e?.message || e);
                            flattenedVariants = [];
                        }
                    }
                } else {
                    // Brak linku → od razu Perplexity
                    const qName = [nazwa, miasto].filter(Boolean).join(" w ") || attraction.nazwa || "obiekt";
                    try {
                        const alt = await askPerplexityForAttraction(qName);
                        flattenedVariants = Array.isArray(alt) ? flattenWarianty(alt) : [];
                        console.log("Perplexity (no-link) wynik:", flattenedVariants);
                    } catch (e) {
                        console.error("Perplexity (no-link) error:", e?.message || e);
                        flattenedVariants = [];
                    }
                }

                attraction.warianty = flattenedVariants;

                // 🔹 metadane: dane ofertowe pochodzą od bota
                attraction.dataSource = "Bot";
                attraction.updatedAt = new Date();

                await attraction.save();

                return res.json({
                    success: Array.isArray(flattenedVariants) && flattenedVariants.length > 0,
                    googleId,
                    warianty: flattenedVariants,
                });
            } catch (err) {
                console.error("❌ /update-offer error:", err.message);
                if (!res.headersSent) {
                    return res.status(500).json({ error: err.message });
                }
            }
        })
        .catch((err) => {
            console.error("❌ offerQueue error:", err);
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
        const drivingPromise = getOSRMRoute("driving", fromLat, fromLng, toLat, toLng);
        const walkingPromise = getOSRMRoute("walking", fromLat, fromLng, toLat, toLng);

        const transitPromise = getTransitRoute(fromLat, fromLng, toLat, toLng)
            .catch(() => null)                       // w razie błędu traktuj jak brak
            .then(res => res ? res : getOSRMRoute("driving", fromLat, fromLng, toLat, toLng));

        const [driving, walking, transit] = await Promise.all([
            drivingPromise,
            walkingPromise,
            transitPromise,
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
            //console.log("💾 Zapisano nową trasę do bazy");
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
                languagecode: "pl",
                currency_code: "PLN",
                location: "PL",
            };

            console.log(`🌍 Pobieram stronę ${page} z Booking.com API...`);
            const response = await axios.get(url, { params, headers, timeout: 40000 });

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
            "https://booking-com15.p.rapidapi.com/api/v1/hotels/getNearbyCities",
            {
                params: { latitude: centerLat, longitude: centerLng },
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
            miejsceDocelowe = null,      // { nazwa, location:{lat,lng}, ... }
            basicActivities
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
                    nazwa: act?.nazwa || null,
                    czasZwiedzania: act?.czasZwiedzania || 0,
                    godzinaRozpoczecia: act?.godzinaRozpoczecia || null,
                }))
                : []
        );

        // 🔧 SYSTEM PROMPT
        const systemPrompt = `
Jesteś inteligentnym asystentem planowania szkolnego wyjazdu do miejsca "${miejsceDocelowe?.nazwa || "?"}".
Masz dostęp do:
- "activitiesSchedule": obecny plan dni i atrakcji (googleId + nazwa + ustawiony czas zwiedzania + godzinaRozpoczecia, ktora jest niemodyfikowalna przez usera - jest obliczana na bazie calego planu, dodana pogladowo), aktywnosci baseHotelIn, baseHotelOut, baseRouteTo, baseRouteFrom sa sztywno ustawione na poczatku i koncu dnia, baseBookIn oraz baseBookOut moga byc przesuwane w ciagu dnia uwzgledniajac dobe hotelowa
- "attractions": dostępne atrakcje w miejscu docelowym (googleId + nazwa),
- "basicActivities": aktywnosci podstawowe, pojawiajace sie w ciagu dnia wyjazdu turystycznego - obslugiwane podobnie do attractions
- funkcji, które możesz zaproponować w odpowiedzi:
  addActivity(dayIndex, activity) - dodajesz nowa aktywnosc na koniec planu, przed powrotem na nocleg.
  swapActivities(dayIndex, actIndexA, actIndexB) - zamieniasz aktywnosci o podanych indeksach 
  changeActivity(dayIndex, actIndex, activity) - zamieniasz aktywnosc o podanym indeksie na nowa, nie dziala dla aktywnosci podstawowych o googleId base...
  deleteActivity(dayIndex, actIndex) - usuwasz aktywnosc, nie dziala dla aktywnosci podstawowych o googleId base...


ZASADY:
-Zwracaj wielką uwage na googleId - jest to zdecydowanie najwazniejsze pole i nie moga pojawic sie w nim bledy!!
- Odpowiadaj po polsku, zwięźle (2–4 zdania), naturalnie i profesjonalnie.
-Nie podawaj w odpowiedziach w czacie googleId, jest to informacja wzglednie poufna.
- W odpowiedzi podaj:
   1️⃣ Krótką wiadomość tekstową.
   2️⃣ NOWĄ LINIĘ i linijkę w formacie:
       **commands** <komenda1>; <komenda2>; ...
- Jeśli nie masz komend, zwróć: **commands** (pusta lista).
- W komendach:
   • Jeśli atrakcja pochodzi z bazy (jest w "attractions" lub "basicActivities"), zwracaj tylko { googleId, nazwa, czasZwiedzania }.
   • Nie wolno ci wymyslac wlasnych aktywnosci lub atrakcji spoza bazy.
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
                    `- Podstawowe aktywnosci: ${JSON.stringify(basicActivities)}\n` +
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

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const APP_NAME = process.env.UNSPLASH_APP_NAME || "YourApp";

if (!UNSPLASH_ACCESS_KEY) {
    console.warn("[Unsplash] Brak UNSPLASH_UNSPLASH_ACCESS_KEY w zmiennych środowiskowych.");
}

/**
 * GET /api/unsplash/photo?q=poznan
 * Zwraca jeden wynik wyszukiwania + atrybucję + download_location.
 */
app.get("/photo", async (req, res) => {
    try {
        const q = String(req.query.q || "").trim();
        if (!q) return res.status(400).json({ error: "Parametr 'q' jest wymagany." });

        const url = new URL("https://api.unsplash.com/search/photos");
        url.searchParams.set("query", q);
        url.searchParams.set("per_page", "30");
        url.searchParams.set("page", "1");
        url.searchParams.set("order_by", "popular");

        // opcjonalnie:
        // url.searchParams.set("orientation", "landscape");

        const r = await fetch(url, {
            headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
        });

        if (!r.ok) {
            const text = await r.text().catch(() => "");
            return res.status(r.status).json({ error: text || r.statusText });
        }

        const data = await r.json();
        const results = Array.isArray(data.results) ? data.results : [];

        // posortuj po likes malejąco
        results.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        const photo = results[0];
        if (!photo) return res.status(404).json({ error: "Brak wyników dla podanej frazy." });

        // Atrybucja (linki z UTM)
        const photographerLink = `${photo.user?.links?.html}?utm_source=${encodeURIComponent(APP_NAME)}&utm_medium=referral`;
        const unsplashLink = `https://unsplash.com/?utm_source=${encodeURIComponent(APP_NAME)}&utm_medium=referral`;

        return res.json({
            id: photo.id,
            alt: photo.alt_description || "",
            src: {
                thumb: photo.urls.thumb,
                small: photo.urls.small,
                regular: photo.urls.regular,
                full: photo.urls.full,
            },
            attribution: {
                text: `Photo by ${photo.user?.name} on Unsplash`,
                photographerName: photo.user?.name,
                photographerProfile: photographerLink,
                unsplashHomepage: unsplashLink,
            },
            // ten adres należy wywołać PRZY pobraniu/ zapisie – to wymóg Unsplash
            download_location: photo.links?.download_location,
        });
    } catch (err) {
        console.error("/api/unsplash/photo error:", err);
        return res.status(500).json({ error: "ServerError" });
    }
});

/**
 * POST /api/unsplash/download
 * Body/Query: download_location=<URL z poprzedniego endpointu>
 * Rejestruje pobranie w Unsplash (wymóg regulaminu).
 */
app.post("/download", express.json(), async (req, res) => {
    try {
        const downloadLocation =
            req.body?.download_location || req.query?.download_location;
        if (!downloadLocation) {
            return res.status(400).json({ error: "Parametr 'download_location' jest wymagany." });
        }

        const r = await fetch(downloadLocation, {
            headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
        });

        if (!r.ok) {
            const text = await r.text().catch(() => "");
            return res.status(r.status).json({ error: text || r.statusText });
        }

        const data = await r.json();
        return res.json({ success: true, data });
    } catch (err) {
        console.error("/api/unsplash/download error:", err);
        return res.status(500).json({ error: "ServerError" });
    }
});
async function backupAttractionsCollection() {
    const db = mongoose.connection.db;

    const source = db.collection("attractions");
    const backupName = `attractions_backup_${new Date().toISOString().slice(0, 10).replace(/-/g, "")}`;
    const backup = db.collection(backupName);

    // Jeżeli backup już istnieje i coś w nim jest – nie rób drugiego
    const existingCount = await backup.countDocuments().catch(() => 0);
    if (existingCount > 0) {
        console.log(`ℹ️ Backup ${backupName} już istnieje, pomijam kopiowanie.`);
        return;
    }

    console.log(`📦 Tworzę backup kolekcji attractions → ${backupName}...`);

    const cursor = source.find({});
    const batch = [];
    const BATCH_SIZE = 1000;

    while (await cursor.hasNext()) {
        const doc = await cursor.next();
        batch.push(doc);

        if (batch.length >= BATCH_SIZE) {
            await backup.insertMany(batch);
            batch.length = 0;
        }
    }
    if (batch.length > 0) {
        await backup.insertMany(batch);
    }

    console.log(`✅ Backup ukończony: ${backupName}`);
}

// 🔹 MIGRACJA META-DANYCH ATTRACTION
// Uruchom JEDNORAZOWO (np. po starcie serwera w trybie maintenance, albo w osobnym skrypcie)
async function migrateAttractionMeta() {
    const now = new Date();

    // 1️⃣ Najpierw backup
    await backupAttractionsCollection();

    // 2️⃣ Dopiero potem migracja pól
    await Attraction.updateMany(
        { createdAt: { $exists: false } },
        { $set: { createdAt: now } }
    );

    await Attraction.updateMany(
        { updatedAt: { $exists: false } },
        { $set: { updatedAt: now } }
    );

    await Attraction.updateMany(
        { locationSource: { $exists: false } },
        { $set: { locationSource: "Google" } }
    );

    await Attraction.updateMany(
        { dataSource: { $exists: false } },
        { $set: { dataSource: "Bot" } }
    );

    console.log("✅ Migracja AttractionMeta zakończona.");
}
function toTicketmasterDate(dateStr, endOfDay = false) {
    if (typeof dateStr !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return null;
    }
    return endOfDay
        ? `${dateStr}T23:59:59Z`
        : `${dateStr}T00:00:00Z`;
}

// Prosty slug z nazwy wydarzenia
function makeDynamicGoogleId(prefix, name) {
    const base = String(name || "event")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "");
    return `dAct_event_${prefix}_${base}`;
}

/**
 * Normalizacja eventu Ticketmaster -> "attraction-like" kształt
 */
function normalizeTicketmasterEvent(ev) {
    const venue = ev._embedded?.venues?.[0];

    const lat = venue?.location?.latitude
        ? Number(venue.location.latitude)
        : null;
    const lng = venue?.location?.longitude
        ? Number(venue.location.longitude)
        : null;

    const addr = [
        venue?.address?.line1,
        venue?.city?.name,
        venue?.country?.name,
    ]
        .filter(Boolean)
        .join(", ");

    // pola daty/godziny
    const start = ev.dates?.start || {};
    const end = ev.dates?.end || {};

    const data = start.localDate
        || (start.dateTime ? start.dateTime.slice(0, 10) : null);
    const godzinaRozpoczecia = start.localTime
        || (start.dateTime ? start.dateTime.slice(11, 16) : null);

    const dataZakonczenia = end?.localDate
        || (end?.dateTime ? end.dateTime.slice(0, 10) : null);
    const godzinaZakonczenia = end?.localTime
        || (end?.dateTime ? end.dateTime.slice(11, 16) : null);

    // cena = najwyższa wartość z priceRanges, jeśli jest, inaczej -1
    let cenaZwiedzania = -1;
    if (Array.isArray(ev.priceRanges) && ev.priceRanges.length > 0) {
        const maxVals = ev.priceRanges
            .map(r => (r.max != null ? Number(r.max) : Number(r.min)))
            .filter(v => Number.isFinite(v));
        if (maxVals.length > 0) {
            cenaZwiedzania = Math.max(...maxVals);
        }
    }

    const firstImage = Array.isArray(ev.images) && ev.images.length > 0
        ? ev.images[0].url
        : null;

    const kategoria = ev.classifications?.[0]?.segment?.name || null;

    // opis / notatki z Ticketmastera
    const opis = ev.info || null;
    const notes = ev.pleaseNote || null;

    return {
        parentPlaceId: null, // możesz tu wstawić placeId miasta, jeśli je znasz
        googleId: makeDynamicGoogleId("tm", ev.name),
        nazwa: ev.name || "",
        adres: addr || "",
        ocena: 0,
        liczbaOpinie: 0,

        lokalizacja: lat != null && lng != null ? { lat, lng } : null,
        locationGeo: lat != null && lng != null
            ? {
                type: "Point",
                coordinates: [lng, lat],
            }
            : null,

        typy: kategoria ? [kategoria] : [],
        ikona: null,

        stronaInternetowa: ev.url || null,
        wallpaper: firstImage,

        // meta
        locationSource: "ticketmaster",
        dataSource: "ticketmaster",

        // oferta
        warianty: [],
        cenaZwiedzania,

        // czas / daty
        data,                  // data rozpoczęcia (YYYY-MM-DD lub null)
        godzinaRozpoczecia,    // godzina rozpoczęcia (HH:MM lub null)
        dataZakonczenia,       // opcjonalnie data zakończenia
        godzinaZakonczenia,    // opcjonalnie godzina zakończenia
        czasZwiedzania: 120,   // stałe 120 minut

        // nowe pola tekstowe
        opis,
        notes,
    };
}

/**
 * Pobranie i normalizacja wydarzeń z Ticketmaster Discovery API
 */
async function fetchTicketmasterEventsNormalized({
    latNum,
    lngNum,
    startDateTime,
    endDateTime,
    radiusNum,
}) {
    const apiKey = process.env.TM_API_KEY;
    if (!apiKey) {
        throw new Error("Brak TM_API_KEY w zmiennych środowiskowych");
    }

    const TM_URL = "https://app.ticketmaster.com/discovery/v2/events.json";

    const response = await axios.get(TM_URL, {
        params: {
            apikey: apiKey,
            latlong: `${latNum},${lngNum}`,
            radius: radiusNum,
            unit: "km",
            startDateTime,
            endDateTime,
            sort: "date,asc",
        },
    });

    const events = response.data?._embedded?.events || [];
    return events.map(normalizeTicketmasterEvent);
}
// Endpoint do wybudzania/podtrzymywania serwera na Render (serverApi)
app.get('/wakeup', (req, res) => {
    res.status(200).json({
        ok: true,
        message: "serverApi is awake!",
        timestamp: new Date()
    });
});
/**
 * GET /ticketmasterEvents
 */
app.get("/ticketmasterEvents", async (req, res) => {
    try {
        const {
            lat,
            lng,
            startDate,
            endDate,
            radius = 50,
        } = req.query;

        if (!lat || !lng || !startDate || !endDate) {
            return res.status(400).json({
                error: "Wymagane parametry: lat, lng, startDate, endDate",
            });
        }

        const latNum = Number(lat);
        const lngNum = Number(lng);
        const radiusNum = Number(radius);

        if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
            return res.status(400).json({
                error: "Parametry lat i lng muszą być liczbami",
            });
        }

        const startDateTime = toTicketmasterDate(startDate, false);
        const endDateTime = toTicketmasterDate(endDate, true);

        if (!startDateTime || !endDateTime) {
            return res.status(400).json({
                error: "Parametry startDate i endDate muszą być w formacie YYYY-MM-DD",
            });
        }

        const tmEvents = await fetchTicketmasterEventsNormalized({
            latNum,
            lngNum,
            startDateTime,
            endDateTime,
            radiusNum,
        }).catch(err => {
            console.error("Ticketmaster error:", err?.response?.data || err.message);
            return [];
        });

        return res.json({
            count: tmEvents.length,
            events: tmEvents,
        });
    } catch (err) {
        console.error("Ticketmaster events error:", err.response?.data || err.message);

        if (err.response) {
            return res.status(err.response.status || 500).json({
                error: "Błąd podczas pobierania danych z Ticketmastera",
                details: err.response.data || null,
            });
        }

        return res.status(500).json({
            error: "Wewnętrzny błąd serwera podczas pobierania wydarzeń",
        });
    }
});
