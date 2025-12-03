// index.js
require('dotenv').config();

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
const cors = require('cors');
const { data } = require('react-router-dom');
const { number } = require('framer-motion');
const FacebookStrategy = require('passport-facebook').Strategy;
const axios = require("axios");

const app = express();

/* =========================
   1) Połączenie z MongoDB
   ========================= */
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('Mongo error:', err));

/* =========================
   2) Schemat i model User
   ========================= */
const userSchema = new mongoose.Schema(
    {
        // Pola „lokalne” (niewymagane przy social login)
        username: { type: String, trim: true, index: true },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            unique: true,
            sparse: true, // pozwala mieć wiele dokumentów bez emaila
        },
        phoneNumber: { type: String, trim: true, unique: true, sparse: true },
        hashedPassword: { type: String, select: false },

        // Social login
        facebookId: { type: String, index: true },

        // Inne
        profilePic: { type: String, trim: true },
        credits: { type: Number, default: 0, min: 0 },
    },
    { timestamps: true, versionKey: false }
);

const User = mongoose.model('User', userSchema);

/* =========================
   3) Middleware
   ========================= */
app.use(express.json());
app.use(
    cors({
        origin: ["https://timely-cranachan-10fff6.netlify.app", "http://localhost:3000"], // np. http://localhost:3000
        credentials: true,
    })
);

app.use(
    session({
        name: 'sid',
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false, // DEV: false; PROD: true (HTTPS)
            sameSite: 'lax',
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());

/* =========================
   4) Passport serialize/deserialize
   ========================= */
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (e) {
        done(e);
    }
});

/* =========================
   5) Facebook Strategy
   ========================= */
passport.use(
    new FacebookStrategy(
        {
            clientID: process.env.FACEBOOK_APP_ID,
            clientSecret: process.env.FACEBOOK_APP_SECRET,
            callbackURL: process.env.FACEBOOK_CALLBACK_URL,
            // Request a large profile picture directly
            profileFields: [
                'id',
                'displayName',
                'emails',
                'picture.width(512).height(512)' // or 'picture.type(large)'
            ],
        },
        async (_accessToken, _refreshToken, profile, done) => {
            try {
                // NEW: prefer the high-res picture provided by the field above
                const photo =
                    profile.photos?.[0]?.value ||
                    `https://graph.facebook.com/${profile.id}/picture?width=512&height=512`;

                const email = profile.emails?.[0]?.value?.toLowerCase();

                let user = await User.findOne({ facebookId: profile.id });
                if (user) {
                    // update stored picture if it’s empty
                    if (!user.profilePic && photo) {
                        user.profilePic = photo;
                        await user.save();
                    }
                    return done(null, user);
                }

                if (email) {
                    user = await User.findOne({ email });
                    if (user) {
                        user.facebookId = profile.id;
                        if (!user.profilePic && photo) user.profilePic = photo;
                        if (!user.username && profile.displayName) user.username = profile.displayName;
                        await user.save();
                        return done(null, user);
                    }
                }

                user = await User.create({
                    username: profile.displayName || (email ? email.split('@')[0] : 'Użytkownik'),
                    email,
                    facebookId: profile.id,
                    profilePic: photo,
                });

                done(null, user);
            } catch (err) {
                done(err);
            }
        }
    )
);


/* =========================
   6) Trasy
   ========================= */
app.get('/testEndpoint', (req, res) => {
    console.log('ABCD');
    res.send('OK');
});

// Start flow Facebook
app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['public_profile', 'email'] }));

// Callback Facebook
app.get(
    '/auth/facebook/callback',
    passport.authenticate('facebook', {
        failureRedirect: `${process.env.CLIENT_URL}/login?error=facebook`,
        session: true,
    }),
    (req, res) => {
        // Po sukcesie – przekieruj na front (np. /)
        res.redirect(`${process.env.CLIENT_URL}/`);
    }
);

// Informacja o zalogowanym użytkowniku (sesja)
app.get('/api/me', (req, res) => {
    if (!req.user) {
        return res
            .status(200)
            .json({ authenticated: false, user: null });
    }
    res.status(200).json({ authenticated: true, user: req.user });
});

// Logout (Passport 0.6)
app.post('/auth/logout', (req, res) => {
    req.logout(() => {
        req.session.destroy(() => res.clearCookie('sid').json({ ok: true }));
    });
});

// Health-check (opcjonalnie)
app.get('/healthz', (_req, res) => res.send('OK'));

// ==== Schematy i model TripPlan z ceną ====
// ===================== MODELE I SCHEMATY =====================

const WariantSchema = new mongoose.Schema(
    {
        nazwaWariantu: { type: String, required: true, trim: true },
        czasZwiedzania: { type: Number },
        cenaZwiedzania: { type: Number },
        interval: { type: String },
    },
    { _id: false }
);

const LokalizacjaSchema = new mongoose.Schema(
    {
        lat: { type: Number, required: true, min: -90, max: 90 },
        lng: { type: Number, required: true, min: -180, max: 180 },
    },
    { _id: false }
);

const ActivityItemSchema = new mongoose.Schema(
    {
        nazwa: { type: String, required: true, trim: true },
        adres: { type: String, trim: true },
        googleId: { type: String },
        parentPlaceId: { type: String },
        stronaInternetowa: { type: String, trim: true },

        ocena: { type: Number },
        liczbaOpinie: { type: Number },

        lokalizacja: { type: LokalizacjaSchema, required: true },

        czasZwiedzania: { type: Number, default: 10 },
        cenaZwiedzania: { type: Number, default: 0 },
        selectedVariant: { type: Number },
        warianty: { type: [WariantSchema], default: [] },
    },
    { _id: false }
);

const DaySchema = new mongoose.Schema(
    {
        activities: { type: [ActivityItemSchema], default: [] },
    },
    { _id: false }
);

const MiejsceSchema = new mongoose.Schema(
    {
        id: { type: Number },
        nazwa: { type: String, required: true, trim: true },
        kraj: { type: String, trim: true },
        wojewodztwo: { type: String, trim: true },
        priority: { type: Number, default: 0, min: 0 },
        location: { type: LokalizacjaSchema, required: true },
    },
    { _id: false }
);
const TripPlanSchema = new mongoose.Schema(
    {
        computedPrice: { type: Number, default: 0 },
        authors: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", index: true }],

        miejsceDocelowe: { type: MiejsceSchema, required: true },

        // NOWE POLE – BEZ default, bo i tak ustawimy je w kodzie endpointu
        nazwa: { type: String, trim: true },

        miejsceStartowe: { type: MiejsceSchema, required: true },
        dataPrzyjazdu: { type: Date, required: true },
        dataWyjazdu: { type: Date, required: true },
        standardTransportu: { type: Number, required: true, min: 0, max: 2 },
        standardHotelu: { type: Number, required: true, min: 0, max: 3 },

        liczbaUczestnikow: { type: Number, required: true, min: 1 },
        liczbaOpiekunow: { type: Number, required: true, min: 0, default: 0 },

        activitiesSchedule: { type: [DaySchema], default: [] },
        photoLink: { type: String, default: null },

        public: { type: Boolean, default: true },
        startHours: {
            type: [Number],
            default: [],
        },

    },
    { timestamps: true, versionKey: false }
);


const TripPlan = mongoose.model("TripPlan", TripPlanSchema);

// ===================== AUTORYZACJA =====================

function requireAuth(req, res, next) {
    if (!req.user?._id) {
        return res.status(401).json({ error: "Unauthenticated" });
    }
    next();
}

// ===================== HELPERY =====================

function isValidLatLng(obj) {
    const lat = Number(obj?.lat);
    const lng = Number(obj?.lng);
    return (
        Number.isFinite(lat) &&
        Number.isFinite(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180
    );
}

function validatePlace(place, { fieldName }) {
    if (!place?.nazwa || !place?.location || !isValidLatLng(place.location)) {
        console.log("Blad ", place)
        return {
            ok: false,
            message: `${fieldName} wymaga: nazwa, location.lat, location.lng (poprawne współrzędne).`,
        };
    }
    return { ok: true };
}

function toDateOrNull(v) {
    if (!v) return null;
    const d = v instanceof Date ? v : new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
}

function validateDates(dataPrzyjazdu, dataWyjazdu) {
    const a = toDateOrNull(dataPrzyjazdu);
    const b = toDateOrNull(dataWyjazdu);
    if (!a || !b) {
        return {
            ok: false,
            message: "Wymagane poprawne daty: dataPrzyjazdu oraz dataWyjazdu (ISO/Date).",
        };
    }
    if (a.getTime() > b.getTime()) {
        return { ok: false, message: "dataPrzyjazdu nie może być późniejsza niż dataWyjazdu." };
    }
    return { ok: true, a, b };
}

function clampInt(n, min, max) {
    const v = Number(n);
    if (!Number.isFinite(v)) return null;
    const iv = Math.trunc(v);
    if (iv < min || iv > max) return null;
    return iv;
}

function validateParticipants(ucz, opiek) {
    const u = clampInt(ucz, 1, 10000); // sensowny zakres
    const o = clampInt(opiek, 0, 10000);
    if (u === null) return { ok: false, message: "liczbaUczestnikow musi być liczbą całkowitą ≥ 1." };
    if (o === null) return { ok: false, message: "liczbaOpiekunow musi być liczbą całkowitą ≥ 0." };
    return { ok: true, u, o };
}

function packDays(arrayOfArrays) {
    if (!Array.isArray(arrayOfArrays)) return [];
    return arrayOfArrays.map((dayArr) => ({
        activities: Array.isArray(dayArr) ? dayArr : [],
    }));
}

function unpackDays(arrayOfDayObjects) {
    if (!Array.isArray(arrayOfDayObjects)) return [];
    return arrayOfDayObjects.map((dayObj) =>
        Array.isArray(dayObj?.activities) ? dayObj.activities : []
    );
}

function num(n) {
    const v = Number(n);
    return Number.isFinite(v) ? v : 0;
}

function computePriceFromAoA(activitiesScheduleAoA) {
    if (!Array.isArray(activitiesScheduleAoA)) return 0;
    let sum = 0;
    for (const day of activitiesScheduleAoA) {
        if (!Array.isArray(day)) continue;
        for (const act of day) sum += num(act?.cenaZwiedzania);
    }
    return sum;
}

// ===================== UNSPLASH =====================

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

/**
 * Pobiera link do zdjęcia z Unsplash dla podanej frazy (np. nazwy miejsca).
 * Best-effort; w razie błędu zwraca null.
 */
async function fetchUnsplashPhotoLinkForDestination(
    destName,
    { timeoutMs = 5000, orientation = "landscape" } = {}
) {
    if (!destName || !String(destName).trim()) return null;
    if (!UNSPLASH_ACCESS_KEY) {
        console.warn("[Unsplash] Brak UNSPLASH_ACCESS_KEY w env.");
        return null;
    }

    try {
        const url = new URL("https://api.unsplash.com/search/photos");
        url.searchParams.set("query", destName);
        url.searchParams.set("per_page", "1");
        url.searchParams.set("page", "1");
        if (orientation) url.searchParams.set("orientation", orientation);

        const { data } = await axios.get(url.toString(), {
            headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
            timeout: timeoutMs,
        });

        const photo = Array.isArray(data?.results) ? data.results[0] : null;
        if (!photo) return null;

        return (
            photo?.urls?.regular ||
            photo?.urls?.small ||
            photo?.urls?.thumb ||
            photo?.urls?.full ||
            null
        );
    } catch (err) {
        console.warn("[Unsplash photo fetch warning]", err?.response?.status || "", err?.message || err);
        return null;
    }
}

// ===================== ENDPOINTY TRIP PLANS =====================
// ===================== GET /download/trip-plan =====================
// GET /download/trip-plan?tripId=<ObjectId>
app.get("/download/trip-plan", async (req, res) => {
    try {
        const { tripId } = req.query;

        if (!tripId || !mongoose.Types.ObjectId.isValid(tripId)) {
            return res.status(400).json({ error: "InvalidObjectId", which: "tripId" });
        }

        const doc = await TripPlan.findOne({
            _id: new mongoose.Types.ObjectId(tripId),
            authors: req.user._id,
        })
            .select(
                "computedPrice miejsceDocelowe standardTransportu standardHotelu activitiesSchedule photoLink nazwa startHours"
            )
            .lean();

        if (!doc) {
            return res.status(404).json({ error: "NotFound" });
        }

        const activitiesAoA = Array.isArray(doc.activitiesSchedule)
            ? doc.activitiesSchedule.map((d) =>
                Array.isArray(d?.activities) ? d.activities : []
            )
            : [];

        res.status(200).json({
            computedPrice: typeof doc.computedPrice === "number" ? doc.computedPrice : 0,
            miejsceDocelowe: doc.miejsceDocelowe || null,
            standardTransportu: doc.standardTransportu,
            standardHotelu: doc.standardHotelu,
            activitiesSchedule: activitiesAoA,
            photoLink: doc.photoLink ?? null,
            nazwa: doc.nazwa ?? null,
            startHours: Array.isArray(doc.startHours) ? doc.startHours : [],
        });
    } catch (err) {
        console.error("GET /download/trip-plan error:", err);
        res.status(500).json({ error: "ServerError" });
    }
});




/**
 * POST /api/trip-plans
 * Tworzy nowy plan z pełnym schematem oraz photoLink z Unsplash (best-effort).
 */
app.post("/api/trip-plans", async (req, res) => {
    try {
        const {
            activitiesSchedule,
            miejsceDocelowe,
            miejsceStartowe,
            dataPrzyjazdu,
            dataWyjazdu,
            standardTransportu,
            standardHotelu,
            liczbaUczestnikow,
            liczbaOpiekunow,
            computedPrice,
            public: publicFromClient,
            nazwa,       // <-- nazwa planu
            startHours,  // <-- NOWE POLE: tablica minut (Number[])
        } = req.body || {};

        if (!req.user?._id) {
            return res.status(401).json({ error: "Unauthorized", message: "Musisz być zalogowany." });
        }

        // activitiesSchedule – opcjonalne
        let packedSchedule;
        if (typeof activitiesSchedule !== "undefined") {
            if (!Array.isArray(activitiesSchedule)) {
                return res
                    .status(400)
                    .json({ error: "BadPayload", message: "activitiesSchedule musi być tablicą tablic." });
            }
            if (!activitiesSchedule.every(Array.isArray)) {
                return res
                    .status(400)
                    .json({ error: "BadPayload", message: "Każdy dzień w activitiesSchedule musi być tablicą." });
            }
            packedSchedule = packDays(activitiesSchedule);
        }

        // startHours – opcjonalne, ale jeżeli jest, musi być tablicą liczb całkowitych minut
        let startHoursToSave;
        if (typeof startHours !== "undefined") {
            if (!Array.isArray(startHours)) {
                return res
                    .status(400)
                    .json({ error: "BadPayload", message: "startHours musi być tablicą liczb (minuty)." });
            }

            const normalized = [];
            for (const v of startHours) {
                const n = Number(v);
                if (!Number.isFinite(n)) {
                    return res.status(400).json({
                        error: "BadPayload",
                        message: "startHours może zawierać tylko liczby.",
                    });
                }
                const iv = Math.trunc(n);
                // zakres 0–1439 minut (cała doba); w razie potrzeby można poluzować
                if (iv < 0 || iv > 24 * 60 - 1) {
                    return res.status(400).json({
                        error: "BadPayload",
                        message: "Każda wartość w startHours musi być w zakresie 0–1439 (minuty).",
                    });
                }
                normalized.push(iv);
            }

            // jeżeli mamy activitiesSchedule, dopilnujmy aby długość się zgadzała z liczbą dni
            if (typeof activitiesSchedule !== "undefined" && normalized.length !== activitiesSchedule.length) {
                return res.status(400).json({
                    error: "BadPayload",
                    message: "Długość startHours musi być równa liczbie dni w activitiesSchedule.",
                });
            }

            startHoursToSave = normalized;
        }

        const destVal = validatePlace(miejsceDocelowe, { fieldName: "miejsceDocelowe" });
        if (!destVal.ok) return res.status(400).json({ error: "BadPayload", message: destVal.message });

        const startVal = validatePlace(miejsceStartowe, { fieldName: "miejsceStartowe" });
        if (!startVal.ok) return res.status(400).json({ error: "BadPayload", message: startVal.message });

        const dv = validateDates(dataPrzyjazdu, dataWyjazdu);
        if (!dv.ok) return res.status(400).json({ error: "BadPayload", message: dv.message });

        const trStd = clampInt(standardTransportu, 0, 2);
        const hoStd = clampInt(standardHotelu, 0, 3);
        if (trStd === null) {
            return res
                .status(400)
                .json({ error: "BadPayload", message: "standardTransportu musi być liczbą całkowitą 0–2." });
        }
        if (hoStd === null) {
            return res
                .status(400)
                .json({ error: "BadPayload", message: "standardHotelu musi być liczbą całkowitą 0–3." });
        }

        const pv = validateParticipants(liczbaUczestnikow, liczbaOpiekunow);
        if (!pv.ok) {
            return res.status(400).json({ error: "BadPayload", message: pv.message });
        }

        // Cena
        const clientPrice = Number(computedPrice);
        const hasClientPrice = Number.isFinite(clientPrice) && clientPrice >= 0;

        let serverPrice = null;
        if (typeof activitiesSchedule !== "undefined") {
            serverPrice = computePriceFromAoA(activitiesSchedule);
        }

        let priceToSave;
        if (hasClientPrice) {
            priceToSave = clientPrice;
            if (serverPrice != null && clientPrice !== serverPrice) {
                console.warn("[PRICE MISMATCH] client:", clientPrice, "server:", serverPrice);
            }
        } else {
            priceToSave = serverPrice != null ? serverPrice : undefined;
        }

        const photoLink = await fetchUnsplashPhotoLinkForDestination(miejsceDocelowe.nazwa);

        // public: domyślnie true, ale jeśli klient prześle false → nadpisujemy
        let publicValue;
        if (typeof publicFromClient === "boolean") {
            publicValue = publicFromClient;
        }

        // --- NAZWA PLANU ---
        let nameToSave = null;
        if (typeof nazwa === "string" && nazwa.trim() !== "") {
            nameToSave = nazwa.trim();
        } else if (miejsceDocelowe?.nazwa) {
            nameToSave = `Wyjazd do ${miejsceDocelowe.nazwa}`;
        }

        const createDoc = {
            authors: [req.user._id],
            miejsceDocelowe,
            miejsceStartowe,
            dataPrzyjazdu: dv.a,
            dataWyjazdu: dv.b,
            standardTransportu: trStd,
            standardHotelu: hoStd,
            liczbaUczestnikow: pv.u,
            liczbaOpiekunow: pv.o,
            computedPrice: priceToSave,
            photoLink: photoLink || null,
        };

        if (typeof packedSchedule !== "undefined") {
            createDoc.activitiesSchedule = packedSchedule;
        }
        if (typeof publicValue === "boolean") {
            createDoc.public = publicValue;
        }
        if (nameToSave) {
            createDoc.nazwa = nameToSave;
        }
        if (typeof startHoursToSave !== "undefined") {
            createDoc.startHours = startHoursToSave;
        }

        const created = await TripPlan.create(createDoc);

        return res.status(201).json({ _id: created._id });
    } catch (err) {
        if (err?.name === "ValidationError") {
            return res.status(400).json({ error: "ValidationError", details: err.errors });
        }
        console.error("POST /api/trip-plans error:", err);
        return res.status(500).json({ error: "ServerError" });
    }
});


/**
 * GET /api/trip-plans
 * Lista planów z nowymi polami (w tym startHours).
 */
app.get("/api/trip-plans", async (_req, res) => {
    try {
        const docs = await TripPlan.find().sort({ createdAt: -1 }).lean();

        const out = docs.map((d) => {
            const aoa = unpackDays(d.activitiesSchedule);
            const price =
                typeof d.computedPrice === "number"
                    ? d.computedPrice
                    : computePriceFromAoA(aoa);

            // Bezpieczne wystawienie startHours jako tablicy liczb
            const startHours =
                Array.isArray(d.startHours)
                    ? d.startHours.map((v) => {
                        const n = Number(v);
                        return Number.isFinite(n) ? Math.trunc(n) : 0;
                    })
                    : [];

            return {
                _id: d._id,
                createdAt: d.createdAt,
                updatedAt: d.updatedAt,
                authors: d.authors,
                miejsceDocelowe: d.miejsceDocelowe,
                miejsceStartowe: d.miejsceStartowe,
                dataPrzyjazdu: d.dataPrzyjazdu,
                dataWyjazdu: d.dataWyjazdu,
                standardTransportu: d.standardTransportu,
                standardHotelu: d.standardHotelu,
                liczbaUczestnikow: d.liczbaUczestnikow,
                liczbaOpiekunow: d.liczbaOpiekunow,
                activitiesSchedule: aoa,
                computedPrice: num(price),
                photoLink: d.photoLink ?? null,
                public: typeof d.public === "boolean" ? d.public : true,
                nazwa: d.nazwa ?? null,
                startHours, // <-- NOWE POLE W ODPOWIEDZI
            };
        });

        return res.json(out);
    } catch (err) {
        console.error("GET /api/trip-plans error:", err);
        return res.status(500).json({ error: "ServerError" });
    }
});


/**
 * GET /api/trip-plans/:id
 * Pojedynczy plan (z obsługą startHours).
 */
app.get("/api/trip-plans/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "InvalidObjectId" });
        }

        const doc = await TripPlan.findById(id).lean();
        if (!doc) return res.status(404).json({ error: "NotFound" });

        const aoa = unpackDays(doc.activitiesSchedule);
        const price =
            typeof doc.computedPrice === "number"
                ? doc.computedPrice
                : computePriceFromAoA(aoa);

        // Bezpieczne wystawienie startHours jako tablicy liczb (minuty)
        const startHours = Array.isArray(doc.startHours)
            ? doc.startHours.map((v) => {
                const n = Number(v);
                return Number.isFinite(n) ? Math.trunc(n) : 0;
            })
            : [];

        return res.json({
            _id: doc._id,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            authors: doc.authors,
            miejsceDocelowe: doc.miejsceDocelowe,
            miejsceStartowe: doc.miejsceStartowe,
            dataPrzyjazdu: doc.dataPrzyjazdu,
            dataWyjazdu: doc.dataWyjazdu,
            standardTransportu: doc.standardTransportu,
            standardHotelu: doc.standardHotelu,
            liczbaUczestnikow: doc.liczbaUczestnikow,
            liczbaOpiekunow: doc.liczbaOpiekunow,
            activitiesSchedule: aoa,
            computedPrice: num(price),
            photoLink: doc.photoLink ?? null,
            public: typeof doc.public === "boolean" ? doc.public : true,
            nazwa: doc.nazwa ?? null,
            startHours, // <-- NOWE POLE W ODPOWIEDZI
        });
    } catch (err) {
        console.error("GET /api/trip-plans/:id error:", err);
        return res.status(500).json({ error: "ServerError" });
    }
});


/**
 * DELETE /api/trip-plans/:id
 * Usuwa plan.
 */
app.delete("/api/trip-plans/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "InvalidObjectId" });
        }

        const deleted = await TripPlan.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ error: "NotFound" });

        return res.json({ ok: true, deletedId: id });
    } catch (err) {
        console.error("DELETE /api/trip-plans/:id error:", err);
        return res.status(500).json({ error: "ServerError" });
    }
});

/**
 * GET /api/trip-plans/by-author/:userId
 * Lista planów konkretnego autora (paginacja) – pełne pola.
 */
// Wersja z autoryzacją – tylko właściciel może zobaczyć swoje plany
app.get("/api/trip-plans/by-author/:userId", requireAuth, async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "InvalidObjectId" });
        }

        if (!req.user?._id) {
            return res.status(401).json({ error: "Unauthenticated" });
        }
        if (String(req.user._id) !== String(userId)) {
            return res.status(403).json({ error: "Forbidden" });
        }

        const page = Math.max(parseInt(req.query.page ?? "1", 10) || 1, 1);
        const limitRaw = parseInt(req.query.limit ?? "50", 10) || 50;
        const limit = Math.min(Math.max(limitRaw, 1), 100);
        const skip = (page - 1) * limit;

        const query = { authors: new mongoose.Types.ObjectId(userId) };

        const [items, total] = await Promise.all([
            TripPlan.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            TripPlan.countDocuments(query),
        ]);

        const out = items.map((d) => {
            const aoa = unpackDays(d.activitiesSchedule);
            const price =
                typeof d.computedPrice === "number"
                    ? d.computedPrice
                    : computePriceFromAoA(aoa);

            const startHours = Array.isArray(d.startHours)
                ? d.startHours.map((v) => {
                    const n = Number(v);
                    return Number.isFinite(n) ? Math.trunc(n) : 0;
                })
                : [];

            return {
                _id: d._id,
                createdAt: d.createdAt,
                updatedAt: d.updatedAt,
                authors: d.authors,
                miejsceDocelowe: d.miejsceDocelowe,
                miejsceStartowe: d.miejsceStartowe,
                dataPrzyjazdu: d.dataPrzyjazdu,
                dataWyjazdu: d.dataWyjazdu,
                standardTransportu: d.standardTransportu,
                standardHotelu: d.standardHotelu,
                liczbaUczestnikow: d.liczbaUczestnikow,
                liczbaOpiekunow: d.liczbaOpiekunow,
                activitiesSchedule: aoa,
                computedPrice: num(price),
                photoLink: d.photoLink ?? null,
                public: typeof d.public === "boolean" ? d.public : true,
                nazwa: d.nazwa ?? null,
                startHours, // <-- NOWE POLE
            };
        });

        return res.json({
            total,
            page,
            limit,
            count: out.length,
            items: out,
        });
    } catch (err) {
        console.error("GET /api/trip-plans/by-author/:userId error:", err);
        return res.status(500).json({ error: "ServerError" });
    }
});

// Publiczna lista planów konkretnego autora – tylko te z public: true
app.get("/api/trip-plans/public/by-author/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "InvalidObjectId" });
        }

        const page = Math.max(parseInt(req.query.page ?? "1", 10) || 1, 1);
        const limitRaw = parseInt(req.query.limit ?? "50", 10) || 50;
        const limit = Math.min(Math.max(limitRaw, 1), 100);
        const skip = (page - 1) * limit;

        const query = {
            authors: new mongoose.Types.ObjectId(userId),
            public: true,
        };

        const [items, total] = await Promise.all([
            TripPlan.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            TripPlan.countDocuments(query),
        ]);

        const out = items.map((d) => {
            const aoa = unpackDays(d.activitiesSchedule);
            const price =
                typeof d.computedPrice === "number"
                    ? d.computedPrice
                    : computePriceFromAoA(aoa);

            const startHours = Array.isArray(d.startHours)
                ? d.startHours.map((v) => {
                    const n = Number(v);
                    return Number.isFinite(n) ? Math.trunc(n) : 0;
                })
                : [];

            return {
                _id: d._id,
                createdAt: d.createdAt,
                updatedAt: d.updatedAt,
                authors: d.authors,
                miejsceDocelowe: d.miejsceDocelowe,
                miejsceStartowe: d.miejsceStartowe,
                dataPrzyjazdu: d.dataPrzyjazdu,
                dataWyjazdu: d.dataWyjazdu,
                standardTransportu: d.standardTransportu,
                standardHotelu: d.standardHotelu,
                liczbaUczestnikow: d.liczbaUczestnikow,
                liczbaOpiekunow: d.liczbaOpiekunow,
                activitiesSchedule: aoa,
                computedPrice: num(price),
                photoLink: d.photoLink ?? null,
                public: typeof d.public === "boolean" ? d.public : true,
                nazwa: d.nazwa ?? null,
                startHours, // <-- NOWE POLE
            };
        });

        return res.json({
            total,
            page,
            limit,
            count: out.length,
            items: out,
        });
    } catch (err) {
        console.error("GET /api/trip-plans/public/by-author/:userId error:", err);
        return res.status(500).json({ error: "ServerError" });
    }
});
/**
 * GET /api/trip-plans/:tripId/by-author/:userId
 * Zwraca plan, jeśli userId ∈ authors; inaczej null.
 */
app.get("/api/trip-plans/:tripId/by-author/:userId", async (req, res) => {
    try {
        const { tripId, userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(tripId)) {
            return res.status(400).json({ error: "InvalidObjectId", which: "tripId" });
        }
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "InvalidObjectId", which: "userId" });
        }

        const doc = await TripPlan.findOne({
            _id: new mongoose.Types.ObjectId(tripId),
            authors: new mongoose.Types.ObjectId(userId),
        }).lean();

        if (!doc) {
            return res.json(null);
        }

        const aoa = unpackDays(doc.activitiesSchedule);
        const price =
            typeof doc.computedPrice === "number"
                ? doc.computedPrice
                : computePriceFromAoA(aoa);

        const startHours = Array.isArray(doc.startHours)
            ? doc.startHours.map((v) => {
                const n = Number(v);
                return Number.isFinite(n) ? Math.trunc(n) : 0;
            })
            : [];

        return res.json({
            _id: doc._id,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            authors: doc.authors,
            miejsceDocelowe: doc.miejsceDocelowe,
            miejsceStartowe: doc.miejsceStartowe,
            dataPrzyjazdu: doc.dataPrzyjazdu,
            dataWyjazdu: doc.dataWyjazdu,
            standardTransportu: doc.standardTransportu,
            standardHotelu: doc.standardHotelu,
            liczbaUczestnikow: doc.liczbaUczestnikow,
            liczbaOpiekunow: doc.liczbaOpiekunow,
            activitiesSchedule: aoa,
            computedPrice: num(price),
            photoLink: doc.photoLink ?? null,
            public: typeof doc.public === "boolean" ? doc.public : true,
            nazwa: doc.nazwa ?? null,
            startHours, // <-- NOWE POLE
        });
    } catch (err) {
        console.error("GET /api/trip-plans/:tripId/by-author/:userId error:", err);
        return res.status(500).json({ error: "ServerError" });
    }
});
/**
 * PUT /api/trip-plans/:tripId
 * Aktualizuje plan, walidując nowe pola (w tym uczestników/opiekunów).
 */
app.put("/api/trip-plans/:tripId", requireAuth, async (req, res) => {
    try {
        const { tripId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(tripId)) {
            return res.status(400).json({ error: "InvalidObjectId", which: "tripId" });
        }

        const plan = await TripPlan.findOne({
            _id: new mongoose.Types.ObjectId(tripId),
            authors: new mongoose.Types.ObjectId(req.user._id),
        });

        if (!plan) {
            return res.status(404).json({ error: "NotFound" });
        }

        const {
            activitiesSchedule,
            computedPrice,
            miejsceDocelowe,
            miejsceStartowe,
            dataPrzyjazdu,
            dataWyjazdu,
            standardTransportu,
            standardHotelu,
            liczbaUczestnikow,
            liczbaOpiekunow,
            public: publicFromClient,
            nazwa, // <-- nazwa planu
            startHours, // <-- NOWE POLE W BODY
        } = req.body || {};

        const updates = {};
        let aoaForPrice = null;

        const isAoA = (x) => Array.isArray(x) && x.every(Array.isArray);
        const samePlace = (a, b) => {
            if (!a || !b) return false;
            const n1 = (a.nazwa || "").trim().toLowerCase();
            const n2 = (b.nazwa || "").trim().toLowerCase();
            const la = Number(a?.location?.lat),
                lb = Number(b?.location?.lat);
            const ga = Number(a?.location?.lng),
                gb = Number(b?.location?.lng);
            const sameName = n1 === n2 && n1.length > 0;
            const sameCoords =
                Number.isFinite(la) &&
                Number.isFinite(lb) &&
                Number.isFinite(ga) &&
                Number.isFinite(gb) &&
                la === lb &&
                ga === gb;
            return sameName && sameCoords;
        };
        const makeSlug = (s) =>
            String(s || "")
                .normalize("NFKD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-zA-Z0-9\s-]/g, "")
                .trim()
                .replace(/\s+/g, "-")
                .toLowerCase()
                .slice(0, 80);

        // activitiesSchedule
        if (Object.prototype.hasOwnProperty.call(req.body, "activitiesSchedule")) {
            if (!isAoA(activitiesSchedule)) {
                return res.status(400).json({
                    error: "BadPayload",
                    message: "activitiesSchedule musi być tablicą tablic (dni).",
                });
            }
            updates.activitiesSchedule = packDays(activitiesSchedule);
            aoaForPrice = activitiesSchedule;
        }

        // startHours – jednowymiarowa tablica minut
        if (Object.prototype.hasOwnProperty.call(req.body, "startHours")) {
            if (!Array.isArray(startHours)) {
                return res.status(400).json({
                    error: "BadPayload",
                    message: "startHours musi być tablicą liczb (minuty od północy).",
                });
            }

            const normalized = startHours
                .map((v) => {
                    const n = Number(v);
                    return Number.isFinite(n) ? Math.trunc(n) : null;
                })
                .filter((v) => v !== null);

            updates.startHours = normalized;
        }

        // miejsceDocelowe
        let destinationChanged = false;
        if (Object.prototype.hasOwnProperty.call(req.body, "miejsceDocelowe")) {
            const v = validatePlace(miejsceDocelowe, { fieldName: "miejsceDocelowe" });
            if (!v.ok) return res.status(400).json({ error: "BadPayload", message: v.message });

            destinationChanged = !samePlace(plan.miejsceDocelowe, miejsceDocelowe);
            updates.miejsceDocelowe = miejsceDocelowe;
        }

        // miejsceStartowe
        if (Object.prototype.hasOwnProperty.call(req.body, "miejsceStartowe")) {
            const v = validatePlace(miejsceStartowe, { fieldName: "miejsceStartowe" });
            if (!v.ok) return res.status(400).json({ error: "BadPayload", message: v.message });
            updates.miejsceStartowe = miejsceStartowe;
        }

        // daty
        const hasArr = Object.prototype.hasOwnProperty.call(req.body, "dataPrzyjazdu");
        const hasDep = Object.prototype.hasOwnProperty.call(req.body, "dataWyjazdu");
        if (hasArr || hasDep) {
            const a = hasArr ? dataPrzyjazdu : plan.dataPrzyjazdu;
            const b = hasDep ? dataWyjazdu : plan.dataWyjazdu;
            const dv = validateDates(a, b);
            if (!dv.ok) return res.status(400).json({ error: "BadPayload", message: dv.message });
            updates.dataPrzyjazdu = dv.a;
            updates.dataWyjazdu = dv.b;
        }

        // standardTransportu
        if (Object.prototype.hasOwnProperty.call(req.body, "standardTransportu")) {
            const trStd = clampInt(standardTransportu, 0, 2);
            if (trStd === null) {
                return res.status(400).json({
                    error: "BadPayload",
                    message: "standardTransportu musi być liczbą całkowitą 0–2.",
                });
            }
            updates.standardTransportu = trStd;
        }

        // standardHotelu
        if (Object.prototype.hasOwnProperty.call(req.body, "standardHotelu")) {
            const hoStd = clampInt(standardHotelu, 0, 3);
            if (hoStd === null) {
                return res.status(400).json({
                    error: "BadPayload",
                    message: "standardHotelu musi być liczbą całkowitą 0–3.",
                });
            }
            updates.standardHotelu = hoStd;
        }

        // uczestnicy / opiekunowie
        if (
            Object.prototype.hasOwnProperty.call(req.body, "liczbaUczestnikow") ||
            Object.prototype.hasOwnProperty.call(req.body, "liczbaOpiekunow")
        ) {
            const pv = validateParticipants(
                Object.prototype.hasOwnProperty.call(req.body, "liczbaUczestnikow")
                    ? liczbaUczestnikow
                    : plan.liczbaUczestnikow,
                Object.prototype.hasOwnProperty.call(req.body, "liczbaOpiekunow")
                    ? liczbaOpiekunow
                    : plan.liczbaOpiekunow
            );
            if (!pv.ok) return res.status(400).json({ error: "BadPayload", message: pv.message });
            updates.liczbaUczestnikow = pv.u;
            updates.liczbaOpiekunow = pv.o;
        }

        // nazwa – jeśli przysłana
        if (Object.prototype.hasOwnProperty.call(req.body, "nazwa")) {
            if (typeof nazwa === "string" && nazwa.trim() !== "") {
                updates.nazwa = nazwa.trim();
            } else {
                // pusta nazwa → domyślna na podstawie miejsca docelowego
                const base =
                    miejsceDocelowe?.nazwa ??
                    plan.miejsceDocelowe?.nazwa ??
                    "";
                if (base) {
                    updates.nazwa = `Wyjazd do ${base}`;
                }
            }
        }

        // computedPrice
        if (Object.prototype.hasOwnProperty.call(req.body, "computedPrice")) {
            const clientPrice = Number(computedPrice);
            if (Number.isFinite(clientPrice) && clientPrice >= 0) {
                updates.computedPrice = clientPrice;
            } else if (aoaForPrice) {
                updates.computedPrice = computePriceFromAoA(aoaForPrice);
            }
        } else if (aoaForPrice) {
            updates.computedPrice = computePriceFromAoA(aoaForPrice);
        }

        // public
        if (Object.prototype.hasOwnProperty.call(req.body, "public")) {
            if (typeof publicFromClient === "boolean") {
                updates.public = publicFromClient;
            } else {
                return res.status(400).json({
                    error: "BadPayload",
                    message: "Pole 'public' musi być typu boolean (true/false).",
                });
            }
        }

        // jeżeli zmieniło się miejsce docelowe → odśwież zdjęcie, slug i ewentualnie domyślną nazwę
        if (destinationChanged && miejsceDocelowe?.nazwa) {
            try {
                const photoLink = await fetchUnsplashPhotoLinkForDestination(
                    miejsceDocelowe.nazwa
                );
                if (photoLink) {
                    updates.photoLink = photoLink;
                }
            } catch (e) {
                console.warn(
                    "Nie udało się pobrać photoLink dla nowego miejsca docelowego:",
                    e?.message || e
                );
            }

            const slug = makeSlug(miejsceDocelowe.nazwa);
            updates.urlSlug = slug;

            // jeśli klient NIE przesłał 'nazwa' w body, zaktualizuj domyślną nazwę
            if (!Object.prototype.hasOwnProperty.call(req.body, "nazwa")) {
                updates.nazwa = `Wyjazd do ${miejsceDocelowe.nazwa}`;
            }
        }

        if (!Object.keys(updates).length) {
            return res
                .status(400)
                .json({ error: "NoValidFields", message: "Brak pól do aktualizacji." });
        }

        const updated = await TripPlan.findByIdAndUpdate(
            plan._id,
            { $set: updates },
            {
                new: true,
                runValidators: true,
            }
        ).lean();

        const aoa = updated.activitiesSchedule ? unpackDays(updated.activitiesSchedule) : null;
        const priceOut =
            typeof updated.computedPrice === "number"
                ? updated.computedPrice
                : aoa
                    ? computePriceFromAoA(aoa)
                    : null;

        const startHoursOut = Array.isArray(updated.startHours)
            ? updated.startHours.map((v) => {
                const n = Number(v);
                return Number.isFinite(n) ? Math.trunc(n) : 0;
            })
            : [];

        return res.json({
            _id: updated._id,
            createdAt: updated.createdAt,
            updatedAt: updated.updatedAt,
            authors: updated.authors,
            miejsceDocelowe: updated.miejsceDocelowe,
            miejsceStartowe: updated.miejsceStartowe,
            dataPrzyjazdu: updated.dataPrzyjazdu,
            dataWyjazdu: updated.dataWyjazdu,
            standardTransportu: updated.standardTransportu,
            standardHotelu: updated.standardHotelu,
            liczbaUczestnikow: updated.liczbaUczestnikow,
            liczbaOpiekunow: updated.liczbaOpiekunow,
            activitiesSchedule: aoa,
            computedPrice: priceOut != null ? num(priceOut) : null,
            photoLink: updated.photoLink ?? null,
            public: typeof updated.public === "boolean" ? updated.public : true,
            urlSlug: updated.urlSlug ?? undefined,
            publicUrl: updated.publicUrl ?? undefined,
            nazwa: updated.nazwa ?? null,
            startHours: startHoursOut, // <-- NOWE POLE W ODPOWIEDZI
        });
    } catch (err) {
        console.error("PUT /api/trip-plans/:tripId error:", err);
        return res.status(500).json({ error: "ServerError" });
    }
});




// ===================== POMOCNICZY ENDPOINT USER (bez zmian) =====================

app.get("/api/users/:userId/name", async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "InvalidObjectId" });
        }

        const user = await User.findById(userId, { username: 1 }).lean();
        if (!user) {
            return res.status(404).json({ error: "NotFound" });
        }

        return res.json({ _id: user._id, username: user.username || null });
    } catch (err) {
        console.error("GET /api/users/:userId/name error:", err);
        return res.status(500).json({ error: "ServerError" });
    }
});
const HighlightedPlanSchema = new mongoose.Schema(
    {
        tripPlanId: { type: String, required: true, unique: true, index: true },
        position: { type: Number, required: true, index: true },
    },
    { timestamps: true }
);

const HighlightedPlan = mongoose.model("HighlightedPlan", HighlightedPlanSchema);


// pomocniczo: ustalenie kolejnej pozycji (max + 1)
async function getNextPosition() {
    const last = await HighlightedPlan.findOne().sort({ position: -1 }).lean();
    return last ? last.position + 1 : 1;
}

/**
 * POST /highlighted-plans
 * body: { tripPlanId: string }
 * Dodaje plan do listy wyróżnionych, na koniec kolejki (najwyższa pozycja).
 * Jeśli już istnieje – zwraca istniejący dokument (idempotentnie).
 */
// GET /highlighted-plans
// Zwraca wszystkie wyróżnione plany posortowane po 'position' (rosnąco)
app.get("/highlighted-plans", async (req, res) => {
    try {
        const items = await HighlightedPlan
            .find({})
            .sort({ position: 1 })       // klucz: tutaj jest sortowanie
            .lean();

        return res.json({ success: true, data: items });
    } catch (err) {
        console.error("GET /highlighted-plans error:", err);
        return res.status(500).json({ error: "ServerError" });
    }
});

/**
 * DELETE /highlighted-plans/:tripPlanId
 * Usuwa plan z listy wyróżnionych oraz porządkuje pozycje (kompaktuje luki).
 */
app.delete("/highlighted-plans/:tripPlanId", async (req, res) => {
    try {
        const { tripPlanId } = req.params;
        const deleted = await HighlightedPlan.findOneAndDelete({ tripPlanId });

        if (!deleted) {
            return res.status(404).json({ error: "Nie znaleziono wpisu dla podanego tripPlanId." });
        }

        // kompaktowanie pozycji po usunięciu (przesunięcie wszystkiego powyżej w dół o 1)
        await HighlightedPlan.updateMany(
            { position: { $gt: deleted.position } },
            { $inc: { position: -1 } }
        );

        return res.json({ success: true, removed: deleted });
    } catch (err) {
        console.error("DELETE /highlighted-plans/:tripPlanId error:", err);
        return res.status(500).json({ error: "ServerError" });
    }
});

/**
 * POST /highlighted-plans/swap
 * body: { tripPlanIdA: string, tripPlanIdB: string }
 * Zamienia miejscami kolejność dwóch wyróżnionych planów.
 */
app.post("/highlighted-plans/swap", async (req, res) => {
    const { tripPlanIdA, tripPlanIdB } = req.body || {};
    if (
        !tripPlanIdA || !tripPlanIdB ||
        typeof tripPlanIdA !== "string" || typeof tripPlanIdB !== "string" ||
        !tripPlanIdA.trim() || !tripPlanIdB.trim()
    ) {
        return res.status(400).json({ error: "Parametry 'tripPlanIdA' i 'tripPlanIdB' są wymagane." });
    }
    if (tripPlanIdA === tripPlanIdB) {
        return res.status(400).json({ error: "Podano identyczne tripPlanId – nie ma czego zamieniać." });
    }

    const session = await HighlightedPlan.startSession();
    session.startTransaction();
    try {
        const [a, b] = await Promise.all([
            HighlightedPlan.findOne({ tripPlanId: tripPlanIdA }).session(session),
            HighlightedPlan.findOne({ tripPlanId: tripPlanIdB }).session(session),
        ]);

        if (!a || !b) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ error: "Nie znaleziono jednego lub obu planów do zamiany." });
        }

        const posA = a.position;
        const posB = b.position;

        // bezkolizyjna zamiana pozycji w transakcji
        await HighlightedPlan.updateOne({ _id: a._id }, { $set: { position: -posA } }).session(session);
        await HighlightedPlan.updateOne({ _id: b._id }, { $set: { position: posA } }).session(session);
        await HighlightedPlan.updateOne({ _id: a._id }, { $set: { position: posB } }).session(session);

        await session.commitTransaction();
        session.endSession();

        const after = await HighlightedPlan.find({
            tripPlanId: { $in: [tripPlanIdA, tripPlanIdB] },
        }).sort({ position: 1 });

        return res.json({ success: true, data: after });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.error("POST /highlighted-plans/swap error:", err);
        return res.status(500).json({ error: "ServerError" });
    }
});
const port = process.env.PORT || 5007;

app.listen(port, () => {
    console.log(`Serwer nasłuchuje na http://localhost:${port}`);
});
