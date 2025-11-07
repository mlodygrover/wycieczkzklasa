// models/tripPlan.js
const mongoose = require('mongoose');

const WariantSchema = new mongoose.Schema(
  {
    nazwaWariantu: { type: String, required: true, trim: true }, // np. "1-godzinny"
    czasZwiedzania: { type: Number }, // w minutach; null dla open-ended
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
    // podstawowe metadane miejsca/aktywności
    nazwa: { type: String, required: true, trim: true },             // "Termy Maltańskie"
    adres: { type: String, trim: true },                             // "Termalna 1, Poznań"
    googleId: { type: String },
    parentPlaceId: { type: String },
    stronaInternetowa: { type: String, trim: true },

    // opinie/ocena
    ocena: { type: Number },
    liczbaOpinie: { type: Number },

    lokalizacja: { type: LokalizacjaSchema, required: true },

    // wartości domyślne (gdy użytkownik nie wybierze wariantu)
    czasZwiedzania: { type: Number, default: 10 },
    cenaZwiedzania: { type: Number, default: 0 },

    // warianty (np. 1h/2h/3h/całodzienny)
    warianty: { type: [WariantSchema], default: [] },
  },
  { _id: false } // element osadzony – nie potrzebuje własnego _id
);

const TripPlanSchema = new mongoose.Schema(
  {
    activitiesSchedule: { type: [ActivityItemSchema], default: [] },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model('TripPlan', TripPlanSchema);
