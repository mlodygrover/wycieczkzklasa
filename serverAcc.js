// index.js
require('dotenv').config();

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
const cors = require('cors');
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

const port = process.env.PORT || 5007;
app.listen(port, () => {
    console.log(`Serwer nasłuchuje na http://localhost:${port}`);
});
