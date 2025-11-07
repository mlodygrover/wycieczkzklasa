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
        origin: process.env.CLIENT_URL, // np. http://localhost:3000
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
    if (!req.user) return res.status(401).json({ authenticated: false });
    res.json({ authenticated: true, user: req.user });
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
        selectedVariant: {type: Number},
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

const MiejsceDoceloweSchema = new mongoose.Schema(
    {
        googleId: { type: String, trim: true },
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
        // >>> NOWE POLE CENY <<<
        computedPrice: { type: Number, default: 0 },

        authors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }],
        miejsceDocelowe: { type: MiejsceDoceloweSchema },
        activitiesSchedule: { type: [DaySchema], default: [] }, // [{activities:[...]}...]
    },
    { timestamps: true, versionKey: false }
);

function requireAuth(req, res, next) {
    if (!req.user?._id) {
        return res.status(401).json({ error: 'Unauthenticated' });
    }
    next();
}

const TripPlan = mongoose.model('TripPlan', TripPlanSchema);

// ==== Helpery transformacji i kalkulacji ceny ====

function packDays(arrayOfArrays) {
    // [ [act, act], [act], ... ] -> [ { activities:[...] }, ... ]
    if (!Array.isArray(arrayOfArrays)) return [];
    return arrayOfArrays.map(dayArr => ({
        activities: Array.isArray(dayArr) ? dayArr : []
    }));
}

function unpackDays(arrayOfDayObjects) {
    // [ { activities:[...] }, ... ] -> [ [...], [...], ... ]
    if (!Array.isArray(arrayOfDayObjects)) return [];
    return arrayOfDayObjects.map(dayObj =>
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
        for (const act of day) {
            // Podstawowa logika – sumuj cenaZwiedzania (liczbę)
            sum += num(act?.cenaZwiedzania);
            // Jeśli w przyszłości pojawi się wybrany wariant, można tu dodać preferencję wariantu.
        }
    }
    return sum;
}

// ==== ENDPOINTY z obsługą computedPrice ====

app.post('/api/trip-plans', async (req, res) => {
    try {
        const { activitiesSchedule, miejsceDocelowe, computedPrice } = req.body || {};

        // wymagana autoryzacja
        if (!req.user?._id) {
            return res.status(401).json({ error: 'Unauthorized', message: 'Musisz być zalogowany.' });
        }

        // walidacja wejścia
        if (!Array.isArray(activitiesSchedule)) {
            return res.status(400).json({ error: 'BadPayload', message: 'activitiesSchedule musi być tablicą tablic.' });
        }
        if (!miejsceDocelowe?.googleId || !miejsceDocelowe?.nazwa || !miejsceDocelowe?.location?.lat || !miejsceDocelowe?.location?.lng) {
            return res.status(400).json({ error: 'BadPayload', message: 'miejsceDocelowe wymaga: googleId, nazwa, location.lat, location.lng.' });
        }

        // a) cena podana przez UI (jeśli jest poprawną liczbą)
        const clientPrice = Number(computedPrice);
        // b) cena wyliczona na serwerze (diagnostyka / fallback)
        const serverPrice = computePriceFromAoA(activitiesSchedule);

        let priceToSave;
        if (Number.isFinite(clientPrice) && clientPrice >= 0) {
            priceToSave = clientPrice;
        } else {
            priceToSave = serverPrice;
        }

        // Log rozbieżności – do analizy, dlaczego UI ≠ backend
        if (Number.isFinite(clientPrice) && clientPrice !== serverPrice) {
            console.warn('[PRICE MISMATCH] client:', clientPrice, 'server:', serverPrice);
        }

        const created = await TripPlan.create({
            authors: [req.user._id],
            miejsceDocelowe,
            activitiesSchedule: packDays(activitiesSchedule),
            computedPrice: priceToSave,
        });

        return res.status(201).json({
            _id: created._id,
            createdAt: created.createdAt,
            updatedAt: created.updatedAt,
            authors: created.authors,
            miejsceDocelowe: created.miejsceDocelowe,
            activitiesSchedule: unpackDays(created.activitiesSchedule),
            computedPrice: num(created.computedPrice),
        });
    } catch (err) {
        if (err?.name === 'ValidationError') {
            return res.status(400).json({ error: 'ValidationError', details: err.errors });
        }
        console.error('POST /api/trip-plans error:', err);
        return res.status(500).json({ error: 'ServerError' });
    }
});

app.get('/api/trip-plans', async (_req, res) => {
    try {
        const docs = await TripPlan.find().sort({ createdAt: -1 }).lean();
        const out = docs.map(d => {
            const aoa = unpackDays(d.activitiesSchedule);
            const price = (typeof d.computedPrice === 'number')
                ? d.computedPrice
                : computePriceFromAoA(aoa);
            return {
                _id: d._id,
                createdAt: d.createdAt,
                updatedAt: d.updatedAt,
                authors: d.authors,
                miejsceDocelowe: d.miejsceDocelowe,
                activitiesSchedule: aoa,
                computedPrice: num(price),
            };
        });
        return res.json(out);
    } catch (err) {
        console.error('GET /api/trip-plans error:', err);
        return res.status(500).json({ error: 'ServerError' });
    }
});

app.get('/api/trip-plans/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'InvalidObjectId' });
        }

        const doc = await TripPlan.findById(id).lean();
        if (!doc) return res.status(404).json({ error: 'NotFound' });

        const aoa = unpackDays(doc.activitiesSchedule);
        const price = (typeof doc.computedPrice === 'number')
            ? doc.computedPrice
            : computePriceFromAoA(aoa);

        return res.json({
            _id: doc._id,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            authors: doc.authors,
            miejsceDocelowe: doc.miejsceDocelowe,
            activitiesSchedule: aoa,
            computedPrice: num(price),
        });
    } catch (err) {
        console.error('GET /api/trip-plans/:id error:', err);
        return res.status(500).json({ error: 'ServerError' });
    }
});

app.delete('/api/trip-plans/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'InvalidObjectId' });
        }

        const deleted = await TripPlan.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ error: 'NotFound' });

        return res.json({ ok: true, deletedId: id });
    } catch (err) {
        console.error('DELETE /api/trip-plans/:id error:', err);
        return res.status(500).json({ error: 'ServerError' });
    }
});

app.get('/api/trip-plans/by-author/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: 'InvalidObjectId' });
        }

        const page = Math.max(parseInt(req.query.page ?? '1', 10) || 1, 1);
        const limitRaw = parseInt(req.query.limit ?? '50', 10) || 50;
        const limit = Math.min(Math.max(limitRaw, 1), 100);
        const skip = (page - 1) * limit;

        const query = { authors: new mongoose.Types.ObjectId(userId) };

        const [items, total] = await Promise.all([
            TripPlan.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            TripPlan.countDocuments(query),
        ]);

        const out = items.map(d => {
            const aoa = unpackDays(d.activitiesSchedule);
            const price = (typeof d.computedPrice === 'number')
                ? d.computedPrice
                : computePriceFromAoA(aoa);
            return {
                _id: d._id,
                createdAt: d.createdAt,
                updatedAt: d.updatedAt,
                authors: d.authors,
                miejsceDocelowe: d.miejsceDocelowe,
                activitiesSchedule: aoa,
                computedPrice: num(price),
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
        console.error('GET /api/trip-plans/by-author/:userId error:', err);
        return res.status(500).json({ error: 'ServerError' });
    }
});

// GET /api/users/:userId/name
// Zwraca { _id, username } dla wskazanego użytkownika
app.get('/api/users/:userId/name', async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: 'InvalidObjectId' });
        }

        // pobranie tylko potrzebnych pól
        const user = await User.findById(userId, { username: 1 }).lean();
        if (!user) {
            return res.status(404).json({ error: 'NotFound' });
        }

        return res.json({ _id: user._id, username: user.username || null });
    } catch (err) {
        console.error('GET /api/users/:userId/name error:', err);
        return res.status(500).json({ error: 'ServerError' });
    }
});


const port = process.env.PORT || 5007;

app.listen(port, () => {
    console.log(`Serwer nasłuchuje na http://localhost:${port}`);
});
