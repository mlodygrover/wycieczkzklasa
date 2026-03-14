// index.js
require('dotenv').config();

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
const cors = require('cors');
const FacebookStrategy = require('passport-facebook').Strategy;
const axios = require("axios");
const OpenAI = require("openai");
const bcrypt = require('bcryptjs');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
const app = express();

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

// Endpoint do wybudzania/podtrzymywania serwera na Render (serverAcc)
app.get('/wakeup', (req, res) => {
    res.status(200).json({
        ok: true,
        message: "serverAcc is awake!",
        timestamp: new Date()
    });
});
// bardzo ważne dla Render / Heroku / proxy
app.set('trust proxy', 1);
/* =========================
   1) Połączenie z MongoDB
   ========================= */
mongoose
    .connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log("MongoDB connected");
    })
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

function validateEmail(email) {
    if (typeof email !== 'string') return false;
    const trimmed = email.trim().toLowerCase();
    // bardzo prosty regex; w razie potrzeby można zaostrzyć
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

function validatePassword(password) {
    if (typeof password !== 'string') return false;
    // minimalnie: 8 znaków; można dodać wymagania typu cyfra/duża litera itd.
    return password.length >= 8;
}
function idEquals(a, b) {
    if (!a || !b) return false;
    return String(a) === String(b);
}
/* =========================
   3) Middleware
   ========================= */
app.use(express.json());
app.use(
    cors({
        origin: ["https://timely-cranachan-10fff6.netlify.app", "http://localhost:3000", "https://draftngo.com"], // np. http://localhost:3000
        credentials: true,
    })
);
const isProd = process.env.REACT_APP_API_SOURCE == "http://localhost:5007";// process.env.NODE_ENV === 'production';
console.log(isProd)
app.use(session({
    name: 'sid',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: !isProd,         // PROD: true, DEV: false
        sameSite: !isProd ? 'None' : 'Lax', // PROD: None, DEV: Lax
    },
}));

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
// Start flow Facebook
// Start flow Facebook
app.get('/auth/facebook', (req, res, next) => {
    const { redirect } = req.query;

    // Kodujemy adres powrotu do base64, aby bezpiecznie przeszedł przez URL Facebooka
    // Jeśli brak redirect, state jest undefined (Passport wygeneruje własny domyślny)
    const state = redirect
        ? Buffer.from(redirect).toString('base64')
        : undefined;

    console.log("Wywolane z (zakodowane w state): ", redirect);

    // Przekazujemy 'state' w opcjach autentykacji
    passport.authenticate('facebook', {
        scope: ['public_profile', 'email'],
        state: state
    })(req, res, next);
});
// Callback Facebook
// Callback Facebook
// Callback Facebook
app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        failureRedirect: `${process.env.CLIENT_URL}/login?error=facebook_failed`
    }),
    (req, res) => {
        // === LOGIN SUCCESS ===


        // 1. Pobieramy i dekodujemy parametr state zwrócony przez Facebooka
        let returnToPath = '/';
        const { state } = req.query;

        if (state) {
            try {
                // Odkodowanie z Base64
                const decodedState = Buffer.from(state, 'base64').toString('utf-8');
                // Proste zabezpieczenie: akceptujemy tylko ścieżki wewnątrz serwisu (zaczynające się od /)
                // Ignorujemy, jeśli ktoś próbuje wstrzyknąć pełny URL (np. http://zla-strona.com)
                if (decodedState.startsWith('/')) {
                    returnToPath = decodedState;
                }
            } catch (e) {
                console.error('Błąd dekodowania state:', e);
            }
        }

        console.log("W callbacku (z parametru state): ", returnToPath);

        // 2. Logujemy użytkownika w sesji (req.login robi to automatycznie w Passporcie, ale warto upewnić się że sesja jest zapisana)
        req.session.save((err) => {
            if (err) {
                console.error('Session save error in callback:', err);
                return res.redirect(`${CLIENT_URL}/`);
            }

            // 3. Budujemy finalny URL
            // Upewniamy się, że nie ma podwójnych slashy
            const safePath = returnToPath.startsWith('/') ? returnToPath : `/${returnToPath}`;
            const finalRedirectUrl = `${CLIENT_URL}${safePath === '/' ? '' : safePath}`;

            console.log(`[Auth] Redirecting facebook user to: ${finalRedirectUrl}`);
            res.redirect(finalRedirectUrl);
        });
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
/**
 * POST /auth/register
 * Rejestracja konta lokalnego: email + hasło (+ opcjonalnie username)
 */
app.post('/auth/register', async (req, res) => {
    try {
        let { email, password, username } = req.body || {};

        if (!validateEmail(email)) {
            return res.status(400).json({ error: "InvalidEmail", message: "Podaj poprawny adres email." });
        }
        if (!validatePassword(password)) {
            return res.status(400).json({
                error: "WeakPassword",
                message: "Hasło musi mieć co najmniej 8 znaków."
            });
        }

        email = email.trim().toLowerCase();

        const existing = await User.findOne({ email }).lean();
        if (existing) {
            // Można tu rozróżnić: konto lokalne / tylko facebook.
            return res.status(409).json({
                error: "EmailTaken",
                message: "Użytkownik z takim adresem email już istnieje."
            });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const user = await User.create({
            email,
            username: username && username.trim() ? username.trim() : email.split('@')[0],
            hashedPassword,
        });

        // od razu logujemy po rejestracji
        req.login(user, (err) => {
            if (err) {
                console.error("req.login error after register:", err);
                return res.status(500).json({ error: "ServerError" });
            }
            // nie zwracamy hashedPassword
            const safeUser = {
                _id: user._id,
                email: user.email,
                username: user.username,
                profilePic: user.profilePic,
                credits: user.credits,
            };
            return res.status(201).json({ ok: true, user: safeUser });
        });
    } catch (err) {
        console.error("POST /auth/register error:", err);
        return res.status(500).json({ error: "ServerError" });
    }
});
/**
 * POST /auth/login
 * Logowanie lokalne: email + hasło
 */
app.post('/auth/login', async (req, res) => {
    try {
        let { email, password } = req.body || {};

        if (!validateEmail(email) || typeof password !== 'string') {
            return res.status(400).json({
                error: "InvalidCredentials",
                message: "Nieprawidłowy email lub hasło."
            });
        }

        email = email.trim().toLowerCase();

        // hashedPassword jest select:false -> trzeba jawnie dołączyć
        const user = await User.findOne({ email }).select('+hashedPassword');
        if (!user || !user.hashedPassword) {
            // brak konta lokalnego -> można zasugerować logowanie przez FB
            return res.status(400).json({
                error: "InvalidCredentials",
                message: "Nieprawidłowy email lub hasło."
            });
        }

        const ok = await bcrypt.compare(password, user.hashedPassword);
        if (!ok) {
            return res.status(400).json({
                error: "InvalidCredentials",
                message: "Nieprawidłowy email lub hasło."
            });
        }

        // poprawne hasło -> zakładamy sesję
        req.login(user, (err) => {
            if (err) {
                console.error("req.login error in /auth/login:", err);
                return res.status(500).json({ error: "ServerError" });
            }

            const safeUser = {
                _id: user._id,
                email: user.email,
                username: user.username,
                profilePic: user.profilePic,
                credits: user.credits,
            };
            return res.json({ ok: true, user: safeUser });
        });
    } catch (err) {
        console.error("POST /auth/login error:", err);
        return res.status(500).json({ error: "ServerError" });
    }
});
/**
 * POST /auth/set-password
 * Ustawia lub zmienia hasło lokalne dla zalogowanego użytkownika.
 * - jeżeli użytkownik nie ma jeszcze hasła (konto wyłącznie FB) -> wystarczy newPassword
 * - jeżeli ma hasło -> wymagamy currentPassword (+ weryfikacja)
 */
app.post('/auth/set-password', requireAuth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body || {};

        if (!validatePassword(newPassword)) {
            return res.status(400).json({
                error: "WeakPassword",
                message: "Nowe hasło musi mieć co najmniej 8 znaków."
            });
        }

        // pobieramy pełnego usera z hasłem
        const user = await User.findById(req.user._id).select('+hashedPassword');
        if (!user) {
            return res.status(404).json({ error: "NotFound" });
        }

        if (user.hashedPassword) {
            // użytkownik już ma hasło -> wymagamy currentPassword
            if (typeof currentPassword !== 'string' || !currentPassword.length) {
                return res.status(400).json({
                    error: "CurrentPasswordRequired",
                    message: "Podaj obecne hasło."
                });
            }

            const ok = await bcrypt.compare(currentPassword, user.hashedPassword);
            if (!ok) {
                return res.status(400).json({
                    error: "InvalidCurrentPassword",
                    message: "Nieprawidłowe obecne hasło."
                });
            }
        }

        const saltRounds = 10;
        const newHash = await bcrypt.hash(newPassword, saltRounds);
        user.hashedPassword = newHash;
        await user.save();

        return res.json({ ok: true });
    } catch (err) {
        console.error("POST /auth/set-password error:", err);
        return res.status(500).json({ error: "ServerError" });
    }
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
        users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", index: true }],

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
        realizationStatus: { type: Number, default: 0, min: 0 },
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
const wallpaperSchema = new mongoose.Schema(
    {
        // dotychczasowe – wygodne do prostego użycia w kodzie
        location: {
            lat: { type: Number, required: true },
            lng: { type: Number, required: true },
        },

        // NOWE: GeoJSON Point pod 2dsphere
        locationGeo: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
            },
            coordinates: {
                // [lng, lat]
                type: [Number],
                required: true,
            },
        },

        photoLink: { type: String, required: true },
    },
    { timestamps: true }
);

// Indeks geosferyczny dla optymalnego wyszukiwania w promieniu
wallpaperSchema.index({ locationGeo: "2dsphere" });

const Wallpaper = mongoose.model("Wallpaper", wallpaperSchema);

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

/**
 * Pobiera link do zdjęcia z Unsplash dla podanej frazy (np. nazwy miejsca).
 * Best-effort; w razie błędu zwraca null.
 */
async function translateCityNameToEnglish(cityName) {
    if (!cityName || !String(cityName).trim()) return null;

    try {
        const prompt = `
Przetlumacz polska nazwe miasta na angielska. Zwroc tylko i wylacznie przetlumaczona nazwe miasta.
Polska nazwa: "${cityName}"
`;

        const resp = await openai.chat.completions.create({
            model: "gpt-4o-mini",  // możesz zmienić na inny model
            messages: [
                { role: "system", content: "You are a concise translation assistant." },
                { role: "user", content: prompt },
            ],
            max_tokens: 20,
            temperature: 0,
        });

        let translated = resp.choices?.[0]?.message?.content || "";
        translated = translated.trim();

        // Na wszelki wypadek zdejmij cudzysłowy, jeśli model je doda
        translated = translated.replace(/^["']|["']$/g, "");

        return translated || cityName;
    } catch (err) {
        console.error("[OpenAI translate error]", err?.response?.data || err?.message || err);
        // W razie błędu wracamy do oryginalnej nazwy
        return cityName;
    }
}

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
async function fetchUnsplashPhotoLinkWithTranslation(
    destName,
    lat,
    lng,
    { timeoutMs = 5000, orientation = "landscape" } = {}
) {
    if (!destName || !String(destName).trim()) return null;

    const latNum = Number(lat);
    const lngNum = Number(lng);

    // 1) Jeśli współrzędne są poprawne – najpierw spróbuj cache z DB w promieniu ~2 km
    if (Number.isFinite(latNum) && Number.isFinite(lngNum)) {
        try {
            const existing = await Wallpaper.findOne({
                locationGeo: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [lngNum, latNum], // [lng, lat]
                        },
                        $maxDistance: 2000, // 2 km
                    },
                },
            }).lean();

            if (existing && existing.photoLink) {
                return existing.photoLink;
            }
        } catch (err) {
            console.error(
                "[Wallpaper] Błąd przy odczycie z DB (geo $near):",
                err?.message || err
            );
            // przy błędzie db i tak lecimy dalej na Unsplash
        }
    } else {
        console.warn(
            "[Wallpaper] Nieprawidłowe współrzędne, pomijam cache w DB (2dsphere)"
        );
    }

    // 2) Tłumaczenie nazwy miasta na angielski (OpenAI)
    const translated = await translateCityNameToEnglish(destName);
    console.log("[Unsplash] original:", destName, "translated:", translated);

    // 3) Pobranie zdjęcia z Unsplash
    const photoLink = await fetchUnsplashPhotoLinkForDestination(translated, {
        timeoutMs,
        orientation,
    });

    if (!photoLink) {
        return null;
    }

    // 4) Zapis w bazie (jeśli mamy sensowne współrzędne)
    if (Number.isFinite(latNum) && Number.isFinite(lngNum)) {
        try {
            await Wallpaper.findOneAndUpdate(
                {
                    // klucz do upsertu – dokładne lat/lng (nie "near")
                    "location.lat": latNum,
                    "location.lng": lngNum,
                },
                {
                    $set: {
                        location: { lat: latNum, lng: lngNum },
                        locationGeo: {
                            type: "Point",
                            coordinates: [lngNum, latNum],
                        },
                        photoLink,
                    },
                },
                {
                    upsert: true,
                    new: true,
                }
            );
        } catch (err) {
            console.error(
                "[Wallpaper] Błąd przy zapisie do DB:",
                err?.message || err
            );
            // nie przerywamy – i tak zwracamy photoLink
        }
    }

    return photoLink;
}


app.get("/getPhotoOfCity", async (req, res) => {
    try {
        const { nazwa, lat, lng } = req.query;

        // Walidacja parametru
        if (
            typeof nazwa !== "string" ||
            !nazwa.trim()
        ) {
            return res.status(400).json({
                error: "Wymagany parametr 'nazwa' (łańcuch, niepusty).",
            });
        }

        // Pobranie zdjęcia z Unsplash (z tłumaczeniem nazwy)
        const photoUrl = await fetchUnsplashPhotoLinkWithTranslation(nazwa, lat, lng);

        if (!photoUrl) {
            return res.status(404).json({
                error: "Nie znaleziono zdjęcia dla podanego miasta.",
                cityOriginal: nazwa,
            });
        }

        return res.status(200).json({
            cityOriginal: nazwa,
            photoUrl,
        });
    } catch (err) {
        console.error("[GET /getPhotoOfCity error]", err?.response?.data || err?.message || err);
        return res.status(500).json({
            error: "Wewnętrzny błąd serwera podczas pobierania zdjęcia miasta.",
        });
    }
});

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
        })
            .select(
                "computedPrice miejsceDocelowe standardTransportu standardHotelu activitiesSchedule photoLink nazwa startHours authors"
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
        const firstAuthor =
            Array.isArray(doc.authors) && doc.authors.length > 0
                ? doc.authors[0]
                : null;

        res.status(200).json({
            computedPrice: typeof doc.computedPrice === "number" ? doc.computedPrice : 0,
            miejsceDocelowe: doc.miejsceDocelowe || null,
            standardTransportu: doc.standardTransportu,
            standardHotelu: doc.standardHotelu,
            activitiesSchedule: activitiesAoA,
            photoLink: doc.photoLink ?? null,
            nazwa: doc.nazwa ?? null,
            startHours: Array.isArray(doc.startHours) ? doc.startHours : [],
            authors: firstAuthor ? [firstAuthor] : [],
            realizationStatus: doc?.realizationStatus ? doc.realizationStatus : 0,
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

        const photoLink = await fetchUnsplashPhotoLinkWithTranslation(miejsceDocelowe.nazwa, miejsceDocelowe.location.lat, miejsceDocelowe.location.lng);

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
            users: [req.user._id], // autor od razu jest w users
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
        const docs = await TripPlan.find().sort({ updatedAt: -1 }).lean();

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
                users: Array.isArray(d.users) ? d.users : [],   // <-- DODANE
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
                realizationStatus: d?.realizationStatus ? d.realizationStatus : 0,
            };
        });

        return res.json(out);
    } catch (err) {
        console.error("GET /api/trip-plans error:", err);
        return res.status(500).json({ error: "ServerError" });
    }
});

// zakładam, że masz gdzieś powyżej:
// const User = mongoose.model("User", userSchema);
// albo import User z osobnego pliku

async function findUsersData(userIds) {
    if (!Array.isArray(userIds) || userIds.length === 0) {
        return [];
    }

    // Filtrowanie i mapowanie do ObjectId
    const objectIds = userIds
        .map((id) => {
            try {
                return new mongoose.Types.ObjectId(id);
            } catch {
                return null;
            }
        })
        .filter((id) => id !== null);

    if (!objectIds.length) {
        return [];
    }

    // Pobieramy tylko niezbędne pola
    const users = await User.find(
        { _id: { $in: objectIds } },
        { username: 1, email: 1 } // projection
    ).lean();

    // Mapowanie po _id → łatwe łączenie z tablicą users z planu
    const mapById = new Map(
        users.map((u) => [String(u._id), u])
    );

    // Zwracamy w kolejności users z TripPlan
    return userIds
        .map((rawId) => {
            const key = String(rawId);
            const u = mapById.get(key);
            if (!u) {
                // jeśli z jakiegoś powodu user już nie istnieje w DB,
                // można go pominąć albo zwrócić „pusty” rekord – tu pomijam
                return null;
            }
            return {
                userId: u._id,
                username: u.username ?? null,
                email: u.email ?? null,
                payments: "none",     // na razie roboczo stałe
            };
        })
        .filter(Boolean);
}

/**
 * GET /api/trip-plans/:id
 * Pojedynczy plan (z obsługą startHours i opcjonalnym extended=1/true).
 * Dostęp tylko dla użytkownika, który jest w doc.users LUB doc.authors.
 */
app.get("/api/trip-plans/:id", requireAuth, async (req, res) => {
    try {
        const { id } = req.params;

        // query.extended może być: "true", "1", true itd.
        const extendedRaw = req.query.extended;
        const extended =
            extendedRaw === "true" ||
            extendedRaw === "1" ||
            extendedRaw === true;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "InvalidObjectId" });
        }

        const doc = await TripPlan.findById(id).lean();
        if (!doc) {
            return res.status(404).json({ error: "NotFound" });
        }

        // --- KONTROLA DOSTĘPU ---

        const requesterId = req.user?._id;
        if (!requesterId) {
            // w praktyce requireAuth już to łapie, ale dla pewności:
            return res.status(401).json({ error: "Unauthenticated" });
        }

        const usersArray = Array.isArray(doc.users) ? doc.users : [];
        const authorsArray = Array.isArray(doc.authors) ? doc.authors : [];

        // najpierw sprawdzamy, czy jest w users
        const isUser = usersArray.some((u) => idEquals(u, requesterId));

        // jeśli nie ma w users, sprawdzamy authors
        const isAuthor = !isUser && authorsArray.some((a) => idEquals(a, requesterId));
        const isAdmin = requesterId === process.env.ADMIN_ID;
        if (!isUser && !isAuthor && !isAdmin) {
            return res.status(403).json({
                error: "Forbidden",
                message: "Nie masz dostępu do tego planu.",
            });
        }

        // --- LOGIKA ODP. JAK DOTYCHCZAS ---

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

        const baseResponse = {
            _id: doc._id,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            authors: authorsArray,
            users: usersArray,
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
            startHours,
            realizationStatus: doc?.realizationStatus ? doc.realizationStatus : 0,
        };
        console.log(baseResponse)
        if (!extended) {
            // zwykła odpowiedź
            return res.json(baseResponse);
        }

        // extended=true → doładowujemy participants
        const participants = await findUsersData(usersArray);

        return res.json({
            ...baseResponse,
            participants,
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
 * GET /api/y-author/:userId
 * Lista planów, w których user jest autorem LUB uczestnikiem (users).
 * W każdym rekordzie dodajemy pole `role`: "author" | "user".
 */
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

        const userObjectId = new mongoose.Types.ObjectId(userId);

        // 🔹 Szukamy planów, gdzie user jest autorem LUB uczestnikiem
        const query = {
            $or: [
                { authors: userObjectId },
                { users: userObjectId },
            ],
        };

        const [items, total] = await Promise.all([
            TripPlan.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
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

            const authorsArr = Array.isArray(d.authors) ? d.authors : [];
            const usersArr = Array.isArray(d.users) ? d.users : [];

            // 🔹 Wyznaczenie roli użytkownika w danym planie
            const userIdStr = String(userId);
            const isAuthor = authorsArr.some(a => String(a) === userIdStr);
            const role = isAuthor ? "author" : "user";

            return {
                _id: d._id,
                createdAt: d.createdAt,
                updatedAt: d.updatedAt,
                authors: authorsArr,
                users: usersArr,
                role, // <-- TU DODAJEMY ROLĘ

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
                startHours,
                realizationStatus: d?.realizationStatus ? d.realizationStatus : 0,
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


/**
 * GET /api/trip-plans/:tripId/by-author/:userId
 * Zwraca plan, jeśli userId ∈ authors LUB userId ∈ users; 
 * ALBO jeśli aktualny user to Admin.
 */
app.get("/api/trip-plans/:tripId/by-author/:userId", requireAuth, async (req, res) => {
    try {
        const { tripId, userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(tripId)) {
            return res.status(400).json({ error: "InvalidObjectId", which: "tripId" });
        }
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "InvalidObjectId", which: "userId" });
        }

        // --- KONTROLA ADMINA ---
        const requesterId = req.user?._id;
        const adminIdEnv = process.env.ADMIN_ID;
        const isAdmin = adminIdEnv && String(requesterId) === adminIdEnv;

        let doc;

        if (isAdmin) {
            // Jeśli Admin: pobierz po prostu po ID, bez sprawdzania autorów
            doc = await TripPlan.findById(tripId).lean();
        } else {
            // Jeśli Zwykły User: sprawdź czy podany userId jest w autorach/uczestnikach
            doc = await TripPlan.findOne({
                _id: new mongoose.Types.ObjectId(tripId),
                $or: [
                    { authors: new mongoose.Types.ObjectId(userId) },
                    { users: new mongoose.Types.ObjectId(userId) },
                ],
            }).lean();
        }

        if (!doc) {
            // Jeśli admin - znaczy że plan nie istnieje. 
            // Jeśli user - plan nie istnieje lub brak uprawnień.
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
            users: Array.isArray(doc.users) ? doc.users : [],
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
            startHours,
            realizationStatus: doc?.realizationStatus ? doc.realizationStatus : 0,
        });
    } catch (err) {
        console.error("GET /api/trip-plans/:tripId/by-author/:userId error:", err);
        return res.status(500).json({ error: "ServerError" });
    }
});
/**
 * GET /api/trip-plans/:tripId/by-author-or-user/:userId
 * Zwraca plan, jeśli userId ∈ authors LUB userId ∈ users; inaczej null.
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
            $or: [
                { authors: new mongoose.Types.ObjectId(userId) },
                { users: new mongoose.Types.ObjectId(userId) },
            ],
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
            users: Array.isArray(doc.users) ? doc.users : [],   // <-- uczestnicy
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
            startHours,
            realizationStatus: doc?.realizationStatus ? doc.realizationStatus : 0,
        });
    } catch (err) {
        console.error("GET /api/trip-plans/:tripId/by-author/:userId error:", err);
        return res.status(500).json({ error: "ServerError" });
    }
});


/**
 * PUT /api/trip-plans/:tripId
 * Aktualizuje plan. Dostęp: Autor LUB Admin.
 */
app.put("/api/trip-plans/:tripId", requireAuth, async (req, res) => {
    try {
        const { tripId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(tripId)) {
            return res.status(400).json({ error: "InvalidObjectId", which: "tripId" });
        }

        // --- KONTROLA DOSTĘPU (ZMODYFIKOWANA DLA ADMINA) ---

        // 1. Pobierz dane usera i admina
        const requesterId = req.user?._id;
        const adminIdEnv = process.env.ADMIN_ID;
        // Sprawdź czy to admin (porównanie stringów)
        const isAdmin = adminIdEnv && String(requesterId) === adminIdEnv;

        // 2. Znajdź plan
        const plan = await TripPlan.findById(tripId);
        if (!plan) {
            return res.status(404).json({ error: "NotFound" });
        }

        // 3. Sprawdź czy to autor
        const isAuthor = (plan.authors || []).some((a) => idEquals(a, requesterId));
        if (plan.realizationStatus && !isAdmin) {
            return res.status(403).json({
                error: "Forbidden",
                message: "Tylko admin moze modyfikowac plan poza szkicem"
            });
        }
        // 4. Jeśli NIE admin I NIE autor -> Forbidden
        if (!isAdmin && !isAuthor) {
            return res.status(403).json({
                error: "Forbidden",
                message: "Brak uprawnień do edycji tego planu."
            });
        }

        // ... DALSZA CZĘŚĆ KODU BEZ ZMIAN (walidacja i update) ...
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
            nazwa,
            startHours,
        } = req.body || {};

        const updates = {};
        let aoaForPrice = null;

        const isAoA = (x) => Array.isArray(x) && x.every(Array.isArray);
        const samePlace = (a, b) => {
            if (!a || !b) return false;
            const n1 = (a.nazwa || "").trim().toLowerCase();
            const n2 = (b.nazwa || "").trim().toLowerCase();
            const la = Number(a?.location?.lat), lb = Number(b?.location?.lat);
            const ga = Number(a?.location?.lng), gb = Number(b?.location?.lng);
            return n1 === n2 && n1.length > 0 && Number.isFinite(la) && Number.isFinite(lb) && la === lb && ga === gb;
        };
        const makeSlug = (s) => String(s || "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9\s-]/g, "").trim().replace(/\s+/g, "-").toLowerCase().slice(0, 80);

        if (Object.prototype.hasOwnProperty.call(req.body, "activitiesSchedule")) {
            if (!isAoA(activitiesSchedule)) return res.status(400).json({ error: "BadPayload", message: "activitiesSchedule musi być tablicą tablic." });
            updates.activitiesSchedule = packDays(activitiesSchedule);
            aoaForPrice = activitiesSchedule;
        }

        if (Object.prototype.hasOwnProperty.call(req.body, "startHours")) {
            if (!Array.isArray(startHours)) return res.status(400).json({ error: "BadPayload", message: "startHours musi być tablicą liczb." });
            const normalized = startHours.map((v) => { const n = Number(v); return Number.isFinite(n) ? Math.trunc(n) : null; }).filter((v) => v !== null);
            updates.startHours = normalized;
        }

        let destinationChanged = false;
        if (Object.prototype.hasOwnProperty.call(req.body, "miejsceDocelowe")) {
            const v = validatePlace(miejsceDocelowe, { fieldName: "miejsceDocelowe" });
            if (!v.ok) return res.status(400).json({ error: "BadPayload", message: v.message });
            destinationChanged = !samePlace(plan.miejsceDocelowe, miejsceDocelowe);
            updates.miejsceDocelowe = miejsceDocelowe;
        }

        if (Object.prototype.hasOwnProperty.call(req.body, "miejsceStartowe")) {
            const v = validatePlace(miejsceStartowe, { fieldName: "miejsceStartowe" });
            if (!v.ok) return res.status(400).json({ error: "BadPayload", message: v.message });
            updates.miejsceStartowe = miejsceStartowe;
        }

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

        if (Object.prototype.hasOwnProperty.call(req.body, "standardTransportu")) {
            const trStd = clampInt(standardTransportu, 0, 2);
            if (trStd === null) return res.status(400).json({ error: "BadPayload", message: "standardTransportu musi być liczbą całkowitą 0–2." });
            updates.standardTransportu = trStd;
        }

        if (Object.prototype.hasOwnProperty.call(req.body, "standardHotelu")) {
            const hoStd = clampInt(standardHotelu, 0, 3);
            if (hoStd === null) return res.status(400).json({ error: "BadPayload", message: "standardHotelu musi być liczbą całkowitą 0–3." });
            updates.standardHotelu = hoStd;
        }

        if (Object.prototype.hasOwnProperty.call(req.body, "liczbaUczestnikow") || Object.prototype.hasOwnProperty.call(req.body, "liczbaOpiekunow")) {
            const pv = validateParticipants(
                Object.prototype.hasOwnProperty.call(req.body, "liczbaUczestnikow") ? liczbaUczestnikow : plan.liczbaUczestnikow,
                Object.prototype.hasOwnProperty.call(req.body, "liczbaOpiekunow") ? liczbaOpiekunow : plan.liczbaOpiekunow
            );
            if (!pv.ok) return res.status(400).json({ error: "BadPayload", message: pv.message });
            updates.liczbaUczestnikow = pv.u;
            updates.liczbaOpiekunow = pv.o;
        }

        if (Object.prototype.hasOwnProperty.call(req.body, "nazwa")) {
            if (typeof nazwa === "string" && nazwa.trim() !== "") {
                updates.nazwa = nazwa.trim();
            } else {
                const base = miejsceDocelowe?.nazwa ?? plan.miejsceDocelowe?.nazwa ?? "";
                if (base) updates.nazwa = `Wyjazd do ${base}`;
            }
        }

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

        if (Object.prototype.hasOwnProperty.call(req.body, "public")) {
            if (typeof publicFromClient === "boolean") {
                updates.public = publicFromClient;
            } else {
                return res.status(400).json({ error: "BadPayload", message: "Pole 'public' musi być typu boolean." });
            }
        }

        if (destinationChanged && miejsceDocelowe?.nazwa && miejsceDocelowe?.location?.lat && miejsceDocelowe?.location?.lng) {
            try {
                const photoLink = await fetchUnsplashPhotoLinkWithTranslation(miejsceDocelowe.nazwa, miejsceDocelowe.location.lat, miejsceDocelowe.location.lng);
                if (photoLink) updates.photoLink = photoLink;
            } catch (e) {
                console.warn("Nie udało się pobrać photoLink:", e?.message || e);
            }
            updates.urlSlug = makeSlug(miejsceDocelowe.nazwa);
            if (!Object.prototype.hasOwnProperty.call(req.body, "nazwa")) {
                updates.nazwa = `Wyjazd do ${miejsceDocelowe.nazwa}`;
            }
        }

        if (!Object.keys(updates).length) {
            return res.status(400).json({ error: "NoValidFields", message: "Brak pól do aktualizacji." });
        }

        const updated = await TripPlan.findByIdAndUpdate(plan._id, { $set: updates }, { new: true, runValidators: true }).lean();

        const aoaOut = updated.activitiesSchedule ? unpackDays(updated.activitiesSchedule) : null;
        const priceOut = typeof updated.computedPrice === "number" ? updated.computedPrice : aoaOut ? computePriceFromAoA(aoaOut) : null;
        const startHoursOut = Array.isArray(updated.startHours) ? updated.startHours.map((v) => { const n = Number(v); return Number.isFinite(n) ? Math.trunc(n) : 0; }) : [];
        const usersOut = Array.isArray(updated.users) ? updated.users : [];

        return res.json({
            _id: updated._id,
            createdAt: updated.createdAt,
            updatedAt: updated.updatedAt,
            authors: updated.authors,
            users: usersOut,
            miejsceDocelowe: updated.miejsceDocelowe,
            miejsceStartowe: updated.miejsceStartowe,
            dataPrzyjazdu: updated.dataPrzyjazdu,
            dataWyjazdu: updated.dataWyjazdu,
            standardTransportu: updated.standardTransportu,
            standardHotelu: updated.standardHotelu,
            liczbaUczestnikow: updated.liczbaUczestnikow,
            liczbaOpiekunow: updated.liczbaOpiekunow,
            activitiesSchedule: aoaOut,
            computedPrice: priceOut != null ? num(priceOut) : null,
            photoLink: updated.photoLink ?? null,
            public: typeof updated.public === "boolean" ? updated.public : true,
            urlSlug: updated.urlSlug ?? undefined,
            publicUrl: updated.publicUrl ?? undefined,
            nazwa: updated.nazwa ?? null,
            startHours: startHoursOut,
            realizationStatus: updated?.realizationStatus ? updated.realizationStatus : 0,
        });

    } catch (err) {
        console.error("PUT /api/trip-plans/:tripId error:", err);
        return res.status(500).json({ error: "ServerError" });
    }
});

// PUT /api/trip-plans/:tripId/realization-status/start
// Ustawia realizationStatus=1 tylko jeśli requester jest autorem planu
app.put("/api/trip-plans/:tripId/realization-status/start", requireAuth, async (req, res) => {
    try {
        const { tripId } = req.params;
        const requesterId = req.user?._id;
        if (!requesterId) {
            return res.status(401).json({ error: "Unauthenticated" });
        }

        const isAdmin = requesterId === process.env.ADMIN_ID;
        if (!mongoose.Types.ObjectId.isValid(tripId)) {
            return res.status(400).json({ error: "InvalidObjectId", which: "tripId" });
        }


        // Aktualizacja atomowa: tylko jeśli requester jest w authors
        const updated = await TripPlan.findOneAndUpdate(
            {
                _id: new mongoose.Types.ObjectId(tripId),
                authors: new mongoose.Types.ObjectId(requesterId),
            },
            { $set: { realizationStatus: 1 } },
            {
                new: true,
                projection: { _id: 1, realizationStatus: 1 },
            }
        ).lean();

        if (!updated) {
            // albo nie istnieje, albo requester nie jest autorem
            // rozróżnijmy przypadki:
            const exists = await TripPlan.exists({ _id: new mongoose.Types.ObjectId(tripId) });
            if (!exists) {
                return res.status(404).json({ error: "NotFound" });
            }
            if (!isAdmin) return res.status(403).json({ error: "Forbidden", message: "Tylko autor może rozpocząć realizację planu." });
        }
        initializePaymentsForTrip(updated._id)
        return res.status(200).json({
            ok: true,
            tripId: updated._id,
            realizationStatus: updated.realizationStatus,
        });
    } catch (err) {
        console.error("PUT /api/trip-plans/:tripId/realization-status/start error:", err);
        return res.status(500).json({ error: "ServerError" });
    }
});

app.post("/api/trip-plans/:tripId/users/:userId", requireAuth, async (req, res) => {
    try {
        const { tripId, userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(tripId)) {
            return res.status(400).json({ error: "InvalidObjectId", which: "tripId" });
        }
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "InvalidObjectId", which: "userId" });
        }

        const plan = await TripPlan.findById(tripId);
        if (!plan) {
            return res.status(404).json({ error: "NotFound" });
        }

        const requesterId = req.user._id;
        const isAuthor = (plan.authors || []).some((a) => idEquals(a, requesterId));
        const isAdmin = requesterId === process.env.ADMIN_ID;
        if (!isAuthor && !isAdmin) {
            return res.status(403).json({ error: "Forbidden", message: "Tylko autor może dodawać uczestników." });
        }

        // Upewnij się, że wszyscy autorzy są w users
        ensureAuthorsInUsers(plan);

        // Czy już jest uczestnikiem?
        const already = (plan.users || []).some((u) => idEquals(u, userId));
        if (already) {
            return res.status(200).json({
                ok: true,
                message: "Użytkownik już jest uczestnikiem.",
                users: plan.users,
            });
        }

        // Sprawdź limit liczby uczestników
        const currentCount = currentParticipantsCount(plan);
        if (typeof plan.liczbaUczestnikow === "number" && currentCount >= plan.liczbaUczestnikow) {
            return res.status(400).json({
                error: "LimitReached",
                message: "Przekroczona maksymalna liczba uczestników dla tego planu.",
            });
        }

        plan.users.push(toObjectId(userId));
        ensureAuthorsInUsers(plan); // jeszcze raz, na wszelki wypadek
        await plan.save();

        return res.status(200).json({
            ok: true,
            users: plan.users,
        });
    } catch (err) {
        console.error("POST /api/trip-plans/:tripId/users/:userId error:", err);
        return res.status(500).json({ error: "ServerError" });
    }
});
app.post("/api/trip-plans/:tripId/authors/:userId", requireAuth, async (req, res) => {
    try {
        const { tripId, userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(tripId)) {
            return res.status(400).json({ error: "InvalidObjectId", which: "tripId" });
        }
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "InvalidObjectId", which: "userId" });
        }

        const plan = await TripPlan.findById(tripId);
        if (!plan) {
            return res.status(404).json({ error: "NotFound" });
        }

        const requesterId = req.user._id;
        const requesterIsAuthor = (plan.authors || []).some((a) => idEquals(a, requesterId));
        const isAdmin = requesterId === process.env.ADMIN_ID;
        if (!requesterIsAuthor && !isAdmin) {
            return res.status(403).json({ error: "Forbidden", message: "Tylko autor może dodawać kolejnych autorów." });
        }

        // Czy już jest autorem?
        const alreadyAuthor = (plan.authors || []).some((a) => idEquals(a, userId));
        if (!alreadyAuthor) {
            plan.authors.push(toObjectId(userId));
        }

        // Upewnij się, że autor jest też w users
        const wasUser = (plan.users || []).some((u) => idEquals(u, userId));
        if (!wasUser) {
            // sprawdź limit uczestników przy dodawaniu do users
            const currentCount = currentParticipantsCount(plan);
            if (typeof plan.liczbaUczestnikow === "number" && currentCount >= plan.liczbaUczestnikow) {
                return res.status(400).json({
                    error: "LimitReached",
                    message: "Nie można dodać autora, bo limit uczestników został osiągnięty.",
                });
            }
            plan.users = plan.users || [];
            plan.users.push(toObjectId(userId));
        }

        ensureAuthorsInUsers(plan);
        await plan.save();

        return res.status(200).json({
            ok: true,
            authors: plan.authors,
            users: plan.users,
        });
    } catch (err) {
        console.error("POST /api/trip-plans/:tripId/authors/:userId error:", err);
        return res.status(500).json({ error: "ServerError" });
    }
});
app.delete("/api/trip-plans/:tripId/users/:userId", requireAuth, async (req, res) => {
    try {
        const { tripId, userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(tripId)) {
            return res.status(400).json({ error: "InvalidObjectId", which: "tripId" });
        }
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "InvalidObjectId", which: "userId" });
        }

        const plan = await TripPlan.findById(tripId);
        if (!plan) {
            return res.status(404).json({ error: "NotFound" });
        }

        const requesterId = req.user._id;
        const isAuthor = (plan.authors || []).some((a) => idEquals(a, requesterId));
        const isAdmin = requesterId === process.env.ADMIN_ID;
        const isSelf = idEquals(userId, requesterId);

        if (!isAuthor && !isSelf && !isAdmin) {
            return res.status(403).json({
                error: "Forbidden",
                message: "Musisz być autorem lub usuwać samego siebie.",
            });
        }

        // Czy usuwany jest autorem?
        const isTargetAuthor = (plan.authors || []).some((a) => idEquals(a, userId));

        if (isTargetAuthor) {
            // Nie pozwalamy usunąć ostatniego autora
            const authorsCount = (plan.authors || []).length;
            if (authorsCount <= 1) {
                return res.status(400).json({
                    error: "LastAuthor",
                    message: "Nie można usunąć ostatniego autora planu.",
                });
            }

            plan.authors = (plan.authors || []).filter((a) => !idEquals(a, userId));
        }

        // Usuń z users
        const beforeCount = currentParticipantsCount(plan);
        plan.users = (plan.users || []).filter((u) => !idEquals(u, userId));
        const afterCount = currentParticipantsCount(plan);

        if (beforeCount === afterCount) {
            // nie było takiego uczestnika
            return res.status(404).json({
                error: "NotFound",
                message: "Użytkownik nie jest uczestnikiem tego planu.",
            });
        }

        await plan.save();

        return res.status(200).json({
            ok: true,
            authors: plan.authors,
            users: plan.users,
        });
    } catch (err) {
        console.error("DELETE /api/trip-plans/:tripId/users/:userId error:", err);
        return res.status(500).json({ error: "ServerError" });
    }
});
app.delete("/api/trip-plans/:tripId/authors/:userId", requireAuth, async (req, res) => {
    try {
        const { tripId, userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(tripId)) {
            return res.status(400).json({ error: "InvalidObjectId", which: "tripId" });
        }
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "InvalidObjectId", which: "userId" });
        }

        const plan = await TripPlan.findById(tripId);
        if (!plan) {
            return res.status(404).json({ error: "NotFound" });
        }

        const requesterId = req.user._id;
        const requesterIsAuthor = (plan.authors || []).some((a) => idEquals(a, requesterId));
        const isAdmin = requesterId === process.env.ADMIN_ID;
        if (!requesterIsAuthor && !isAdmin) {
            return res.status(403).json({
                error: "Forbidden",
                message: "Tylko autor może usuwać innych autorów.",
            });
        }

        const isTargetAuthor = (plan.authors || []).some((a) => idEquals(a, userId));
        if (!isTargetAuthor) {
            return res.status(404).json({
                error: "NotFound",
                message: "Użytkownik nie jest autorem tego planu.",
            });
        }

        const authorsCount = (plan.authors || []).length;
        if (authorsCount <= 1) {
            return res.status(400).json({
                error: "LastAuthor",
                message: "Nie można usunąć ostatniego autora planu.",
            });
        }

        plan.authors = (plan.authors || []).filter((a) => !idEquals(a, userId));

        // Użytkownika NIE usuwamy z users – dalej jest uczestnikiem
        ensureAuthorsInUsers(plan); // tylko dla spójności

        await plan.save();

        return res.status(200).json({
            ok: true,
            authors: plan.authors,
            users: plan.users,
        });
    } catch (err) {
        console.error("DELETE /api/trip-plans/:tripId/authors/:userId error:", err);
        return res.status(500).json({ error: "ServerError" });
    }
});

///admin trips
///admin trips

/**
* GET /api/admin/trip-plans
* Zwraca WSZYSTKIE plany wycieczek z bazy danych.
* Dostępne TYLKO dla użytkownika, którego ID jest zgodne z env.ADMIN_ID.
*/

app.get("/api/admin/trip-plans", requireAuth, async (req, res) => {
    try {
        // 1. Pobierz Admin ID ze zmiennych środowiskowych
        const adminIdEnv = process.env.ADMIN_ID;

        // 2. Pobierz ID aktualnie zalogowanego użytkownika (jako string)
        const currentUserId = req.user?._id ? String(req.user._id) : null;

        // 3. Sprawdź uprawnienia
        // Jeśli nie ma ustawionego ADMIN_ID w env lub ID się nie zgadzają -> odmowa
        if (!adminIdEnv || currentUserId !== adminIdEnv) {
            console.warn(`[Security] Unauthorized admin access attempt by user: ${currentUserId}`);
            return res.status(403).json({
                error: "Forbidden",
                message: "Brak uprawnień administratora."
            });
        }

        // 4. Pobierz wszystkie plany z bazy (sortowanie od najnowszych)
        const docs = await TripPlan.find().sort({ updatedAt: -1 }).lean();

        // 5. Przetwórz dane (tak samo jak w standardowym endpoincie GET)
        const out = docs.map((d) => {
            const aoa = unpackDays(d.activitiesSchedule);
            const price =
                typeof d.computedPrice === "number"
                    ? d.computedPrice
                    : computePriceFromAoA(aoa);

            // Bezpieczne mapowanie startHours
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
                users: Array.isArray(d.users) ? d.users : [],
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
                startHours,
                realizationStatus: d?.realizationStatus ? d.realizationStatus : 0,
            };
        });

        return res.json(out);

    } catch (err) {
        console.error("GET /api/admin/trip-plans error:", err);
        return res.status(500).json({ error: "ServerError" });
    }
});
/**
 * PUT /api/admin/trip-plans/:id
 * Aktualizacja dowolnych danych w planie wycieczki.
 * Wymaga uprawnień Admina (zgodność ID z env).
 */
app.put("/api/admin/trip-plans/:id", requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // 1. Weryfikacja Admina
        const adminIdEnv = process.env.ADMIN_ID;
        const currentUserId = req.user?._id ? String(req.user._id) : null;

        if (!adminIdEnv || currentUserId !== adminIdEnv) {
            return res.status(403).json({
                error: "Forbidden",
                message: "Brak uprawnień administratora."
            });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "InvalidObjectId" });
        }

        // 2. Zabezpieczenie przed edycją pól systemowych
        delete updateData._id;
        delete updateData.createdAt;
        delete updateData.updatedAt;

        // 3. Specjalna obsługa dat (jeśli przychodzą jako stringi z input type="date")
        if (updateData.dataPrzyjazdu) {
            updateData.dataPrzyjazdu = new Date(updateData.dataPrzyjazdu);
        }
        if (updateData.dataWyjazdu) {
            updateData.dataWyjazdu = new Date(updateData.dataWyjazdu);
        }

        // 4. Aktualizacja w bazie
        const updatedPlan = await TripPlan.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true } // runValidators sprawdzi np. czy status jest liczbą
        ).lean();

        if (!updatedPlan) {
            return res.status(404).json({ error: "NotFound", message: "Nie znaleziono planu." });
        }

        res.json({ message: "Plan zaktualizowany pomyślnie", plan: updatedPlan });

    } catch (err) {
        console.error("PUT /api/admin/trip-plans/:id error:", err);
        // Obsługa błędów walidacji Mongoose
        if (err.name === 'ValidationError') {
            return res.status(400).json({ error: "ValidationError", details: err.message });
        }
        res.status(500).json({ error: "ServerError" });
    }
});

const crypto = require("crypto");

const JOIN_CODE_SECRET = process.env.JOIN_CODE_SECRET;
if (!JOIN_CODE_SECRET) {
    console.warn(
        "[WARN] JOIN_CODE_SECRET nie jest ustawione w env – " +
        "dla produkcji KONIECZNIE ustaw silny sekret!"
    );
}

/**
 * Generuje deterministyczny 6-znakowy kod na podstawie tripId,
 * z użyciem tajnego seeda z env (JOIN_CODE_SECRET).
 * 
 * - bez seeda użytkownik nie odtworzy zależności tripId → code,
 * - ten sam tripId zawsze da ten sam code (przy tym samym secie),
 * - kod jest z alfabetu [A-Z0-9] (usuwamy inne znaki).
 */
function makeJoinCodeFromTripId(tripId) {
    const secret = JOIN_CODE_SECRET || "DEV_FALLBACK_SECRET_ONLY_FOR_LOCAL";
    const idStr = String(tripId);

    // HMAC(SHA-256) z tajnym kluczem
    const raw = crypto
        .createHmac("sha256", secret)
        .update(idStr)
        .digest("base64url"); // np. 'q1fS3D8-...'

    // Usuwamy znaki nie-alfanumeryczne, żeby kod był łatwy do przepisania
    const alnum = raw.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

    // Przycinamy do 6 znaków – jeśli z jakiegoś powodu byłoby mniej, uzupełniamy heksami z dodatkowego hash
    if (alnum.length >= 6) {
        return alnum.slice(0, 6);
    }

    // Bardzo defensywne podejście: praktycznie nie powinno się zdarzyć,
    // ale na wszelki wypadek dociągamy dodatkowy materiał z SHA256(idStr).
    const extra = crypto
        .createHash("sha256")
        .update(idStr)
        .digest("hex")
        .toUpperCase();

    return (alnum + extra).slice(0, 6);
}
function toObjectId(id) {
    return new mongoose.Types.ObjectId(id);
}


function ensureAuthorsInUsers(plan) {
    const usersSet = new Set((plan.users || []).map((u) => String(u)));
    (plan.authors || []).forEach((a) => usersSet.add(String(a)));
    plan.users = Array.from(usersSet).map((id) => toObjectId(id));
}

function currentParticipantsCount(plan) {
    // Liczymy po users, bo w users mają być też autorzy.
    return Array.isArray(plan.users) ? plan.users.length : 0;
}

// POST /api/trip-plans/:tripId/join-by-code/:userId
// body: { code: "ABC123" }
// - weryfikacja cookies (requireAuth)
// - sprawdzenie, czy requester == userId (żeby nie dodawać innych ludzi)
// - sprawdzenie, czy code == hash(tripId)
// - sprawdzenie limitu liczbaUczestnikow
// - dodanie userId do users (i upewnienie, że authors ⊆ users)
app.post("/api/trip-plans/:tripId/join-by-code/:userId", requireAuth, async (req, res) => {
    try {
        const { tripId, userId } = req.params;
        const { code } = req.body || {};

        if (!mongoose.Types.ObjectId.isValid(tripId)) {
            return res.status(400).json({ error: "InvalidObjectId", which: "tripId" });
        }
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "InvalidObjectId", which: "userId" });
        }

        if (typeof code !== "string" || !code.trim()) {
            return res.status(400).json({
                error: "BadPayload",
                message: "Brakuje kodu lub jest nieprawidłowy.",
            });
        }

        // 🔒 Użytkownik z cookies musi być tą samą osobą, którą próbujemy dodać
        if (!idEquals(req.user._id, userId)) {
            return res.status(403).json({
                error: "Forbidden",
                message: "Nie możesz dodawać innych użytkowników do planu za pomocą kodu.",
            });
        }

        const plan = await TripPlan.findById(tripId);
        if (!plan) {
            return res.status(404).json({ error: "NotFound" });
        }

        // 🔐 Weryfikacja kodu – generujemy oczekiwany kod z tripId
        const expectedCode = makeJoinCodeFromTripId(plan._id);
        if (expectedCode !== String(code).trim().toUpperCase()) {
            return res.status(400).json({
                error: "InvalidCode",
                message: "Podany kod jest nieprawidłowy dla tego planu.",
            });
        }

        // Upewnij się, że authors ⊆ users
        ensureAuthorsInUsers(plan);

        // Czy user już jest w users?
        const alreadyUser = (plan.users || []).some((u) => idEquals(u, userId));
        if (alreadyUser) {
            return res.status(200).json({
                ok: true,
                message: "Użytkownik już jest uczestnikiem tego planu.",
                users: plan.users,
            });
        }

        // Sprawdzenie limitu liczbaUczestnikow
        const currentCount = currentParticipantsCount(plan);
        if (
            typeof plan.liczbaUczestnikow === "number" &&
            currentCount >= plan.liczbaUczestnikow
        ) {
            return res.status(400).json({
                error: "LimitReached",
                message: "Przekroczona maksymalna liczba uczestników dla tego planu.",
            });
        }

        // Dodanie użytkownika do participants
        if (!Array.isArray(plan.users)) {
            plan.users = [];
        }
        plan.users.push(toObjectId(userId));
        ensureAuthorsInUsers(plan); // na wszelki wypadek, żeby autorzy byli w users

        await plan.save();

        return res.status(200).json({
            ok: true,
            tripId: plan._id,
            users: plan.users,
        });
    } catch (err) {
        console.error("POST /api/trip-plans/:tripId/join-by-code/:userId error:", err);
        return res.status(500).json({ error: "ServerError" });
    }
});

/**
 * GET /api/trip-plans/:tripId/join-code
 * Zwraca joinCode dla planu, jeśli zgłaszający jest autorem.
 */
app.get("/api/trip-plans/:tripId/join-code", requireAuth, async (req, res) => {
    try {
        const { tripId } = req.params;

        // walidacja tripId
        if (!mongoose.Types.ObjectId.isValid(tripId)) {
            return res.status(400).json({ error: "InvalidObjectId", which: "tripId" });
        }

        // pobranie planu
        const plan = await TripPlan.findById(tripId).select("_id authors").lean();
        if (!plan) {
            return res.status(404).json({ error: "NotFound" });
        }

        // weryfikacja, czy zgłaszający jest autorem
        const requesterId = req.user?._id;
        if (!requesterId) {
            return res.status(401).json({ error: "Unauthenticated" });
        }

        const isAuthor = Array.isArray(plan.authors)
            ? plan.authors.some((a) => idEquals(a, requesterId))
            : false;
        const isAdmin = requesterId === process.env.ADMIN_ID;
        if (!isAuthor && !isAdmin) {
            return res.status(403).json({
                error: "Forbidden",
                message: "Tylko autorzy planu mogą pobrać kod dołączenia.",
            });
        }

        // generowanie joinCode
        const joinCode = makeJoinCodeFromTripId(plan._id);

        return res.json({
            tripId: plan._id,
            joinCode,
        });
    } catch (err) {
        console.error("GET /api/trip-plans/:tripId/join-code error:", err);
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

const MessageSchema = new mongoose.Schema(
    {
        tripId: { type: mongoose.Schema.Types.ObjectId, ref: "TripPlan", required: true, index: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        content: { type: String, trim: true, default: "" },
    },
    { timestamps: true, versionKey: false }
);

// Szybkie pobieranie rozmów per tripId po czasie
MessageSchema.index({ tripId: 1, createdAt: 1 });

const Message = mongoose.model("Message", MessageSchema);
// typingState: Map<tripIdStr, Map<userIdStr, expiresAtMs>>
const typingState = new Map();

function setTyping(tripId, userId, ttlMs = 1000) {
    const tripKey = String(tripId);
    const userKey = String(userId);
    const expiresAt = Date.now() + ttlMs;

    let tripMap = typingState.get(tripKey);
    if (!tripMap) {
        tripMap = new Map();
        typingState.set(tripKey, tripMap);
    }
    tripMap.set(userKey, expiresAt);
}

function getActiveTypingUserIds(tripId) {
    const tripKey = String(tripId);
    const tripMap = typingState.get(tripKey);
    if (!tripMap) return [];

    const now = Date.now();
    for (const [uid, exp] of tripMap.entries()) {
        if (exp <= now) tripMap.delete(uid);
    }
    if (tripMap.size === 0) typingState.delete(tripKey);

    return Array.from(tripMap.keys());
}


app.post("/api/trip-plans/:tripId/messages", requireAuth, async (req, res) => {
    try {
        const { tripId } = req.params;
        const { content } = req.body || {};

        if (!mongoose.Types.ObjectId.isValid(tripId)) {
            return res.status(400).json({ error: "InvalidObjectId", which: "tripId" });
        }

        if (typeof content !== "string" || !content.trim()) {
            return res.status(400).json({ error: "BadPayload", message: "content jest wymagany." });
        }

        const requesterId = req.user?._id;
        if (!requesterId) {
            return res.status(401).json({ error: "Unauthenticated" });
        }

        // sprawdzamy czy requester jest w users
        const plan = await TripPlan.findById(tripId).select("_id users").lean();
        if (!plan) return res.status(404).json({ error: "NotFound" });

        const isInUsers = Array.isArray(plan.users)
            ? plan.users.some((u) => idEquals(u, requesterId))
            : false;

        if (!isInUsers) {
            return res.status(403).json({ error: "Forbidden", message: "Brak dostępu do czatu tego planu." });
        }

        const msg = await Message.create({
            tripId: new mongoose.Types.ObjectId(tripId),
            userId: new mongoose.Types.ObjectId(requesterId),
            content: content.trim(),
        });

        return res.status(201).json({
            ok: true,
            messageId: msg._id,
            tripId: msg.tripId,
            userId: msg.userId,
            dateTime: msg.createdAt,
            content: msg.content,
        });
    } catch (err) {
        console.error("POST /api/trip-plans/:tripId/messages error:", err);
        return res.status(500).json({ error: "ServerError" });
    }
});
app.get("/api/trip-plans/:tripId/messages/sync", requireAuth, async (req, res) => {
    try {
        const { tripId } = req.params;
        const typingRaw = req.query.typing;
        const typing =
            typingRaw === "true" || typingRaw === "1" || typingRaw === true;

        const sinceRaw = req.query.since; // opcjonalnie: ISO string albo timestamp ms
        let sinceDate = null;
        if (typeof sinceRaw === "string" && sinceRaw.trim()) {
            const ms = Number(sinceRaw);
            const d = Number.isFinite(ms) ? new Date(ms) : new Date(sinceRaw);
            if (!Number.isNaN(d.getTime())) sinceDate = d;
        }

        if (!mongoose.Types.ObjectId.isValid(tripId)) {
            return res.status(400).json({ error: "InvalidObjectId", which: "tripId" });
        }

        const requesterId = req.user?._id;
        if (!requesterId) {
            return res.status(401).json({ error: "Unauthenticated" });
        }

        // sprawdzamy czy requester jest w users
        const plan = await TripPlan.findById(tripId).select("_id users").lean();
        if (!plan) return res.status(404).json({ error: "NotFound" });

        const isInUsers = Array.isArray(plan.users)
            ? plan.users.some((u) => idEquals(u, requesterId))
            : false;

        if (!isInUsers) {
            return res.status(403).json({ error: "Forbidden", message: "Brak dostępu do czatu tego planu." });
        }

        // aktualizacja typing (TTL 1s)
        if (typing) {
            setTyping(tripId, requesterId, 3000);
        }

        // pobranie wiadomości
        const findQuery = { tripId: new mongoose.Types.ObjectId(tripId) };
        if (sinceDate) {
            findQuery.createdAt = { $gt: sinceDate };
        }

        const messages = await Message.find(findQuery)
            .sort({ createdAt: 1 })
            .populate("userId", "username profilePic email") // email opcjonalnie; możesz usunąć
            .lean();

        const outMessages = messages.map((m) => ({
            role: "user",
            userId: String(m.userId?._id || m.userId),
            dateTime: m.createdAt, // DateTime
            userPic: m.userId?.profilePic ?? null,
            username: m.userId?.username ?? null,
            content: m.content ?? "",
        }));

        // aktywni “typing”
        const activeTypingIds = getActiveTypingUserIds(tripId)
            // zwykle sensowniej NIE pokazywać “pending” samego siebie
            .filter((uid) => uid !== String(requesterId));

        let pending = [];
        if (activeTypingIds.length > 0) {
            const typingUsers = await User.find(
                { _id: { $in: activeTypingIds.map((x) => new mongoose.Types.ObjectId(x)) } },
                { username: 1, profilePic: 1 }
            ).lean();

            const byId = new Map(typingUsers.map((u) => [String(u._id), u]));

            pending = activeTypingIds.map((uid) => {
                const u = byId.get(String(uid));
                return {
                    role: "pending",
                    userId: String(uid),
                    dateTime: new Date(), // “teraz”
                    userPic: u?.profilePic ?? null,
                    username: u?.username ?? null,
                    content: "",
                };
            });
        }

        return res.json({
            ok: true,
            tripId,
            items: [...outMessages, ...pending],
            // pomocniczo możesz zwracać serverTime do synchronizacji
            serverTime: new Date(),
        });
    } catch (err) {
        console.error("GET /api/trip-plans/:tripId/messages/sync error:", err);
        return res.status(500).json({ error: "ServerError" });
    }
});


const PaymentSchema = new mongoose.Schema({
    tripId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TripPlan',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // --- ZMIANA: Rozdzielenie kwot ---

    // Kwota, którą użytkownik POWINIEN zapłacić (zgodna z aktualną ceną wyjazdu)
    amountRequired: {
        type: Number,
        required: true,
        default: 0
    },

    // Kwota, którą użytkownik FAKTYCZNIE wpłacił (potwierdzona przez bramkę)
    amountPaid: {
        type: Number,
        default: 0
    },

    currency: { type: String, default: 'PLN' },

    // Status teraz zależy od relacji amountPaid vs amountRequired
    status: {
        type: String,
        enum: ['pending', 'partial', 'completed', 'overpaid', 'failed'],
        default: 'pending'
    },

    // Dane techniczne
    provider: { type: String, enum: ['tpay', 'stripe'], default: 'tpay' },
    providerTransactionId: { type: String },
    crc: { type: String },
    paidAt: { type: Date }

}, { timestamps: true });

PaymentSchema.index({ tripId: 1, userId: 1 }, { unique: true });
const Payment = mongoose.model('Payment', PaymentSchema);


/**
 * Inicjalizuje lub aktualizuje rekordy płatności dla uczestników.
 * - Aktualizuje amountRequired dla WSZYSTKICH (nawet tych, co już zapłacili).
 * - Nie rusza amountPaid ani statusu (chyba że to nowy rekord).
 */
async function initializePaymentsForTrip(tripId) {
    try {
        const trip = await TripPlan.findById(tripId);
        if (!trip) throw new Error('TripPlan not found');

        const allParticipantIds = new Set([
            ...(trip.authors || []).map(id => id.toString()),
            ...(trip.users || []).map(id => id.toString())
        ]);

        if (allParticipantIds.size === 0) return;

        // Aktualna cena wyjazdu w groszach
        const currentTripPriceInGrosze = Math.round((trip.computedPrice || 0) * 100);

        const operations = Array.from(allParticipantIds).map(userId => ({
            updateOne: {
                filter: { tripId: trip._id, userId: userId },
                update: {
                    // 1. TO WYKONUJE SIĘ ZAWSZE (Aktualizacja ceny wyjazdu)
                    $set: {
                        amountRequired: currentTripPriceInGrosze,
                        // Opcjonalnie: Zaktualizuj status na 'partial', jeśli cena wzrosła, a ktoś miał 'completed'
                        // (To wymagałoby pipeline'u agregacji w update, poniżej prostsza wersja logiczna)
                    },
                    // 2. TO WYKONUJE SIĘ TYLKO PRZY TWORZENIU NOWEGO REKORDU
                    $setOnInsert: {
                        amountPaid: 0, // Nowy użytkownik nic nie wpłacił
                        currency: 'PLN',
                        status: 'pending',
                        provider: 'tpay'
                    }
                },
                upsert: true
            }
        }));

        const result = await Payment.bulkWrite(operations);

        // Dodatkowy krok (opcjonalny, ale zalecany):
        // Jeśli cena wzrosła, musimy zmienić statusy 'completed' na 'partial' (częściowo opłacone).
        // Robimy to osobnym zapytaniem dla bezpieczeństwa logicznego.
        if (result.matchedCount > 0) {
            await Payment.updateMany(
                {
                    tripId: trip._id,
                    status: 'completed',
                    $expr: { $lt: ["$amountPaid", "$amountRequired"] } // Gdzie wpłacono < wymagane
                },
                { $set: { status: 'partial' } }
            );
        }

        console.log(`Zaktualizowano płatności dla tripId: ${tripId}. Cena: ${currentTripPriceInGrosze / 100} PLN`);
        return result;

    } catch (error) {
        console.error("Błąd aktualizacji płatności:", error);
        throw error;
    }
}


// Konfiguracja Tpay
const TPAY_CLIENT_ID = process.env.TPAY_CLIENT_ID;
const TPAY_CLIENT_SECRET = process.env.TPAY_CLIENT_SECRET;
const TPAY_MERCHANT_ID = process.env.TPAY_MERCHANT_ID;
const TPAY_SECURITY_CODE = process.env.TPAY_SECURITY_CODE;
const TPAY_API_URL = 'https://openapi.sandbox.tpay.com'; // Sandbox. Dla produkcji: api.tpay.com

const API_URL = process.env.API_URL;
app.post('/payments/init', requireAuth, async (req, res) => {
    // Zakładam, że masz middleware auth, który dodaje req.user
    const userId = req.user._id;
    const { tripId } = req.body;

    try {
        // 1. Upewnij się, że dane w bazie są aktualne
        await initializePaymentsForTrip(tripId);

        // 2. Pobierz aktualny stan płatności
        const payment = await Payment.findOne({ tripId, userId }).populate('tripId');

        if (!payment) return res.status(404).json({ error: "Błąd płatności" });

        // 3. Oblicz ile trzeba dopłacić
        // amountRequired i amountPaid są w groszach (integer)
        const amountLeft = payment.amountRequired - payment.amountPaid;

        if (amountLeft <= 0) {
            return res.status(400).json({ error: "Wyjazd jest już opłacony." });
        }

        // 4. Generuj unikalny CRC dla tej konkretnej transakcji
        // Format: tripId|userId|timestamp
        const crc = `${tripId}|${userId}|${Date.now()}`;

        // Zapisz CRC w bazie (opcjonalne, ale dobre do debugowania)
        payment.crc = crc;
        await payment.save();

        // 5. Pobierz token Tpay (OAuth)
        const authRes = await axios.post(`${TPAY_API_URL}/oauth/auth`, {
            client_id: TPAY_CLIENT_ID,
            client_secret: TPAY_CLIENT_SECRET
        });
        const accessToken = authRes.data.access_token;

        // 6. Utwórz transakcję w Tpay
        const transactionRes = await axios.post(`${TPAY_API_URL}/transactions`, {
            amount: amountLeft / 100, // Tpay oczekuje float (PLN), my mamy grosze
            description: `Wyjazd: ${payment.tripId.nazwa || 'Wycieczka'}`,
            hiddenDescription: crc, // To wróci w webhooku, kluczowe do identyfikacji!
            payer: {
                email: req.user.email,
                name: req.user.username || "Uczestnik"
            },
            callbacks: {
                // Gdzie przekierować użytkownika PO płatności (Wstecz do sklepu)
                payerUrls: {
                    success: `${CLIENT_URL}/konfigurator-lounge?tripId=${tripId}&paymentStatus=success&tab=2`,
                    error: `${CLIENT_URL}/konfigurator-lounge/?tripId=${tripId}&paymentStatus=error&tab=2`,
                },
                // Gdzie Tpay ma wysłać potwierdzenie w tle (Webhook)
                notification: {
                    url: `${API_URL}/payments/notification`,
                    email: req.user.email
                }
            }
        }, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        // 7. Zwróć URL do przekierowania frontendu
        res.json({ paymentUrl: transactionRes.data.transactionPaymentUrl });

    } catch (error) {
        console.error("Błąd inicjacji płatności:", error?.response?.data || error.message);
        res.status(500).json({ error: "Nie udało się utworzyć płatności" });
    }
});

app.post('/payments/notification', express.urlencoded({ extended: true }), async (req, res) => {
    // Tpay wysyła dane jako x-www-form-urlencoded
    const {
        id, tr_id, tr_date, tr_crc, tr_amount, tr_paid, tr_desc,
        tr_status, tr_error, tr_email, md5sum
    } = req.body;

    // 1. Weryfikacja podpisu MD5 (Security Check)
    // Wzór: md5(id + tr_id + tr_amount + tr_crc + kod_bezpieczenstwa)
    const stringToHash = `${id}${tr_id}${tr_amount}${tr_crc}${TPAY_SECURITY_CODE}`;
    const calculatedMd5 = crypto.createHash('md5').update(stringToHash).digest('hex');

    if (calculatedMd5 !== md5sum) {
        console.error("Błędny podpis MD5 z Tpay!");
        return res.status(400).send('INVALID SIGNATURE');
    }

    // 2. Jeśli status to TRUE (zapłacono)
    if (tr_status === 'TRUE') {
        try {
            // Rozpakuj CRC: tripId|userId|timestamp
            const [tripId, userId] = tr_crc.split('|');
            const paidAmountInGrosze = Math.round(Number(tr_amount) * 100);

            // Znajdź płatność
            const payment = await Payment.findOne({ tripId, userId });

            if (payment) {
                // Sprawdź czy ta transakcja nie została już przetworzona (idempotentność)
                // Możesz to robić sprawdzając czy providerTransactionId == tr_id
                // Ale w modelu uproszczonym po prostu dodajemy kwotę:

                // Aktualizacja kwot
                payment.amountPaid += paidAmountInGrosze;
                payment.providerTransactionId = tr_id;
                payment.paidAt = new Date();

                // Logika statusu
                if (payment.amountPaid >= payment.amountRequired) {
                    payment.status = 'completed';
                    if (payment.amountPaid > payment.amountRequired) {
                        payment.status = 'overpaid'; // Opcjonalnie
                    }
                } else {
                    payment.status = 'partial'; // Nadal za mało (np. rata)
                }

                await payment.save();
                console.log(`Zaksięgowano ${tr_amount} PLN dla tripId: ${tripId}`);
            }
        } catch (err) {
            console.error("Błąd bazy danych w webhooku:", err);
            // Nawet jak jest błąd DB, Tpay musi dostać TRUE, żeby nie spamował, 
            // chyba że chcesz, żeby ponawiał próby (wtedy wyślij status 500)
        }
    }

    // 3. Tpay wymaga odpowiedzi tekstowej "TRUE" na koniec
    res.send('TRUE');
});

/**
 * Zwraca statusy płatności dla wszystkich uczestników wyjazdu.
 * * Kody statusów:
 * 0 - Płatność istnieje i amountPaid >= amountRequired (Opłacono)
 * 1 - Płatność istnieje, ale amountPaid < amountRequired (Niedopłata/Częściowa)
 * 2 - Brak rekordu płatności (Nie rozpoczęto)
 * * @param {string} tripId 
 * @returns {Promise<Object>} Mapa { userId: statusCode }
 */
async function checkParticipantsPaymentStatus(tripId) {
    // 1. Pobierz plan wyjazdu
    const trip = await TripPlan.findById(tripId);
    if (!trip) {
        throw new Error('TripPlan not found');
    }

    // 2. Zbierz unikalne ID wszystkich uczestników (authors + users)
    const allParticipantIds = new Set([
        ...(trip.authors || []).map(id => id.toString()),
        ...(trip.users || []).map(id => id.toString())
    ]);

    // 3. Pobierz WSZYSTKIE płatności dla tego wyjazdu jednym zapytaniem
    const payments = await Payment.find({ tripId: trip._id });

    // 4. Stwórz mapę dla szybkiego dostępu: userId -> obiekt płatności
    const paymentMap = new Map();
    payments.forEach(p => {
        paymentMap.set(p.userId.toString(), p);
    });

    // 5. Generuj wynik
    const results = {};

    allParticipantIds.forEach(userId => {
        const payment = paymentMap.get(userId);

        if (!payment) {
            // BRAK PŁATNOŚCI
            results[userId] = 2;
        } else {
            // PŁATNOŚĆ ISTNIEJE - sprawdzamy kwotę
            // Używamy >= na wypadek nadpłaty (co też jest OK)
            if (payment.amountPaid >= payment.amountRequired) {
                // OPŁACONO (kwota się zgadza lub jest wyższa)
                results[userId] = 0;
            } else {
                // NIERÓWNA (za mało wpłacono)
                results[userId] = 1;
            }
        }
    });

    return results;
}
// Pamiętaj o imporcie funkcji na górze pliku
// const { checkParticipantsPaymentStatus } = require('./utils/paymentHelpers'); 

app.get('/api/trip-plans/:tripId/payment-statuses', requireAuth, async (req, res) => {
    const { tripId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
        return res.status(400).json({ error: "InvalidObjectId" });
    }

    try {
        // Sprawdzenie uprawnień (opcjonalnie - czy user jest uczestnikiem/autorem)
        // ... (Twoja logika autoryzacji) ...

        const statuses = await checkParticipantsPaymentStatus(tripId);

        res.json({
            tripId,
            statuses // Obiekt w formacie { "USER_ID_1": 0, "USER_ID_2": 2, ... }
        });

    } catch (err) {
        console.error("Błąd sprawdzania statusów płatności:", err);
        res.status(500).json({ error: "ServerError" });
    }
});
const port = process.env.PORT || 5007;

app.listen(port, () => {
    console.log(`Serwer nasłuchuje na http://localhost:${port}`);
});
