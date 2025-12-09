import React, { useState, useEffect, useMemo, useRef } from 'react';
import styled from 'styled-components';
import { Tab, TabsContainer } from './profilePage';
import { PreConfigureSketch } from './preConfSketch';
import { Edit2, Settings } from 'lucide-react';
import useUserStore, { fetchMe } from './usercontent.js';
import EyeCheckbox from './eyeCheckbox.js';
import { PreConfigureParticipants } from './preConfigureParticipants.js';

const portacc = process.env.REACT_APP_API_SOURCE || "https://api.draftngo.com";

const port = process.env.REACT_APP__SERVER_API_SOURCE || "https://wycieczkzklasa.onrender.com";
/* ===================== LAYOUT ===================== */
const PreConfigureMainbox = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  margin-top: 100px;
`;

const PreConfigureHeaderWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  @media screen and (max-width: 800px){
    flex-direction: column;
  }
  .preConfigureTitleWrapper{
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
  }
  .preConfigureHeaderTitle{
    margin-top: 10px;
    font-family: 'Inter', sans-serif;
    font-size: 42px;
    font-weight: 700;
    width: 100%;
    max-width: 1600px;
    text-align: left;
    @media screen and (max-width: 800px){
      font-size: 26px;
    }
    @media screen and (max-width: 400px){
      font-size: 22px;
    }
  }
  .preConfigureHeaderSubtitle{
    font-family: 'Inter', sans-serif;
    font-size: 18px;
    font-weight: 500;
    color: #606060;
    width: 100%;
    max-width: 1600px;
    text-align: left;
    @media screen and (max-width: 800px){
      font-size: 14px;
    }
    @media screen and (max-width: 400px){
      font-size: 12px;
    }
  }
  .preConfigureButtons{
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 5px;
    flex-wrap: wrap;
    @media screen and (max-width: 800px){
      margin-top: 10px;
      justify-content: flex-start;
    }
    .preConfigureButton{
      text-decoration: none;
      height: 40px;
      padding: 0px 20px;
      border: 1px solid #f0f0f0;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 500;
      font-size: 14px;
      font-family: 'Inter', sans-serif;
      color: white;
      background-color: black;
      gap: 5px;
      cursor: pointer;
      transition: background-color 0.3s ease;
      &.disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      &.b{
      background-color: white;
      color: black;
        &.privatePlan{
            color: #d0d0d0;
        }
      &:hover{
        background-color: #f0f0f0;
      }
      }
      &:hover{
        background-color: #333333;
      }
      @media screen and (max-width: 800px){
        font-size: 12px;
        height: 35px;
        width: 90%;
        svg{
          width: 16px;
        }
      }
    }
  }
`;

const PreConfigureHeader = styled.div`
  width: 90%;
  max-width: 1600px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
    
  .preConfigureHeaderImage{
    width: 100%;
    height: 600px;
    max-height: 50vh;
    border-radius: 50px;
    background-size: cover;        /* odpowiednik object-fit: cover */
    background-position: center;   /* wycentrowanie */
    background-repeat: no-repeat;  /* bez powtarzania */
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-end;
    padding: 20px;
    box-sizing: border-box;
    img{
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
          &::before {
        border-radius: inherit;
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, transparent 50%, rgba(0, 0, 0, 0.56) 90%);
    }
        .wyjazdNazwa {
        color: white;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        text-align: left;
        font-size: 52px;
        font-weight: 900;
        z-index: 3;
        gap: 10px;
        text-shadow: 0 2px 14px rgba(0, 0, 0, 1);
        max-width: 100%;
        svg{
            flex-shrink: 0;
        }
        @media screen and (max-width: 600px){
            font-size: 25px;
            svg{
                width: 20px;
            }
        }
    }

    .wyjazdNazwaInput {
        display: inline-block;
        max-width: 100%;
        white-space: normal;
        font: inherit;
        color: white;
        outline: none;
        direction: ltr;
        text-align: left;
        svg{
            flex-shrink: 0;
        }
       
    }
  }
`;

/* ===================== DATE HELPERS (LOCAL, NO TZ SHIFT) ===================== */
const pad2 = (n) => String(n).padStart(2, '0');
const formatYMDLocal = (d) => {
    if (!d) return '';
    const dt = d instanceof Date ? d : new Date(d);
    if (isNaN(dt)) return '';
    const y = dt.getFullYear();
    const m = pad2(dt.getMonth() + 1);
    const day = pad2(dt.getDate());
    return `${y}-${m}-${day}`;
};
const parseYMDLocal = (s) => {
    if (!s || typeof s !== 'string') return null;
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) {
        const dt = new Date(s);
        return isNaN(dt) ? null : dt;
    }
    // Noon local time guards against DST edge cases
    const y = Number(m[1]);
    const mo = Number(m[2]) - 1;
    const d = Number(m[3]);
    const dt = new Date(y, mo, d, 12, 0, 0, 0);
    return isNaN(dt) ? null : dt;
};

/* ===================== API (trip plan) ===================== */
export async function fetchTripPlanById(tripId, { signal } = {}) {
    if (!tripId || !String(tripId).trim()) {
        throw new Error('tripId is required');
    }
    const url = `${portacc}/api/trip-plans/${encodeURIComponent(tripId)}`;
    const resp = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Accept': 'application/json' },
        signal,
    });

    if (resp.status === 404) return null;
    if (!resp.ok) {
        const text = await resp.text().catch(() => '');
        throw new Error(`Fetch failed (${resp.status}): ${text || resp.statusText}`);
    }

    return await resp.json();
}

export async function fetchDownloadedTripPlan(tripId, { signal } = {}) {
    if (!tripId || !String(tripId).trim()) {
        throw new Error("tripId is required");
    }
    const url = `${portacc}/download/trip-plan?tripId=${encodeURIComponent(tripId)}`;
    const resp = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
        signal,
    });

    if (resp.status === 404) return null;
    if (!resp.ok) {
        const text = await resp.text().catch(() => "");
        throw new Error(`Fetch failed (${resp.status}): ${text || resp.statusText}`);
    }
    return await resp.json(); // { computedPrice, miejsceDocelowe, standardTransportu, standardHotelu, activitiesSchedule, photoLink }
}

/* ===================== URL HELPERS ===================== */
const toNumber = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
};

const readFromUrl = () => {
    const sp = new URLSearchParams(window.location.search);

    const miejsceDocelowe = {
        nazwa: sp.get('destName') || '',
        location: {
            lat: toNumber(sp.get('destLat')),
            lng: toNumber(sp.get('destLng')),
        },
    };

    const miejsceStartowe = {
        nazwa: sp.get('startName') || '',
        country: sp.get('startCountry') || null,
        region: sp.get('startRegion') || null,
        id: sp.get('startId') || null,
        googleId: sp.get('startGoogleId') || null,
        location: {
            lat: toNumber(sp.get('startLat')),
            lng: toNumber(sp.get('startLng')),
        },
    };

    // Uwaga: arr = WYJAZD (start), dep = POWRÓT (koniec)
    const dataWyjazdu = parseYMDLocal(sp.get('arr'));
    const dataPowrotu = parseYMDLocal(sp.get('dep'));

    const liczbaUczestnikow = Number.isFinite(Number(sp.get('guests')))
        ? Number(sp.get('guests'))
        : 1;
    const liczbaOpiekunow = Number.isFinite(Number(sp.get('guardians')))
        ? Number(sp.get('guardians'))
        : 0;

    const standardHotelu = Number.isFinite(Number(sp.get('hotelStd')))
        ? Number(sp.get('hotelStd'))
        : 1;
    const standardTransportu = Number.isFinite(Number(sp.get('transportStd')))
        ? Number(sp.get('transportStd'))
        : 1;

    const downloadPlan = sp.get('downloadPlan') || null;
    const tripId = sp.get('tripId') || null;
    const nazwaWyjazdu = sp.get('nw') || null;
    return {
        miejsceDocelowe,
        miejsceStartowe,
        dataWyjazdu,
        dataPowrotu,
        liczbaUczestnikow,
        liczbaOpiekunow,
        standardHotelu,
        standardTransportu,
        downloadPlan,
        tripId,
        nazwaWyjazdu,
    };
};

const writeToUrl = (state) => {
    const sp = new URLSearchParams(window.location.search);

    sp.set('destName', state.miejsceDocelowe?.nazwa || '');
    const dLat = state.miejsceDocelowe?.location?.lat ?? '';
    const dLng = state.miejsceDocelowe?.location?.lng ?? '';
    if (dLat !== '') sp.set('destLat', String(dLat)); else sp.delete('destLat');
    if (dLng !== '') sp.set('destLng', String(dLng)); else sp.delete('destLng');

    sp.set('startName', state.miejsceStartowe?.nazwa || '');
    const sLat = state.miejsceStartowe?.location?.lat ?? '';
    const sLng = state.miejsceStartowe?.location?.lng ?? '';
    if (sLat !== '') sp.set('startLat', String(sLat)); else sp.delete('startLat');
    if (sLng !== '') sp.set('startLng', String(sLng)); else sp.delete('startLng');

    const startCountry = state.miejsceStartowe?.country ?? '';
    const startRegion = state.miejsceStartowe?.region ?? '';
    const startId = state.miejsceStartowe?.id ?? '';
    const startGoogleId = state.miejsceStartowe?.googleId ?? '';
    startCountry ? sp.set('startCountry', startCountry) : sp.delete('startCountry');
    startRegion ? sp.set('startRegion', startRegion) : sp.delete('startRegion');
    startId ? sp.set('startId', startId) : sp.delete('startId');
    startGoogleId ? sp.set('startGoogleId', startGoogleId) : sp.delete('startGoogleId');

    const arr = formatYMDLocal(state.dataWyjazdu);
    const dep = formatYMDLocal(state.dataPowrotu);
    arr ? sp.set('arr', arr) : sp.delete('arr');
    dep ? sp.set('dep', dep) : sp.delete('dep');

    sp.set('guests', String(state.liczbaUczestnikow ?? 1));
    sp.set('guardians', String(state.liczbaOpiekunow ?? 0));
    sp.set('hotelStd', String(state.standardHotelu ?? 1));
    sp.set('transportStd', String(state.standardTransportu ?? 1));
    sp.set('nw', state.nazwaWyjazdu || '');
    const newUrl = `${window.location.pathname}?${sp.toString()}`;
    window.history.replaceState(null, '', newUrl);
};

/* ===================== MAIN ===================== */
export const PreConfigure = (
    miejsceDoceloweInit = {},
    miejsceStartoweInit = {},
    dataWyjazduInit = null,
    dataPowrotuInit = null,
    liczbaUczestnikowInit = 1,
    liczbaOpiekunowInit = 0,
    standardHoteluInit = 1,
    standardTransportuInit = 1,
    nazwaWyjazduInit = "Twój wyjazd"
) => {
    // 1) Wczytaj domyślne wartości z URL
    const urlDefaults = useMemo(readFromUrl, []);
    const hasTripIdInUrl = Boolean(urlDefaults.tripId && String(urlDefaults.tripId).trim());

    // 2) Sterujące: tripId i downloadPlan jako STAN
    const [downloadPlan, setDownloadPlan] = useState(urlDefaults.downloadPlan || null);
    const [tripId, setTripId] = useState(urlDefaults.tripId || null);

    // 2.1) Flaga gotowości (blokuje sync do URL do czasu pobrania planu, jeśli jest tripId)
    const [planReady, setPlanReady] = useState(!tripId);

    // 3) Stany formularza – jeśli jest tripId, zaczynamy „puste” i nadpisze je plan
    const [miejsceDocelowe, setMiejsceDocelowe] = useState(
        hasTripIdInUrl
            ? { nazwa: '', location: { lat: null, lng: null } }
            : (urlDefaults.miejsceDocelowe?.nazwa
                ? urlDefaults.miejsceDocelowe
                : {
                    nazwa: miejsceDoceloweInit.nazwa || '',
                    location: {
                        lat: miejsceDoceloweInit.location?.lat ?? null,
                        lng: miejsceDoceloweInit.location?.lng ?? null,
                    },
                })
    );
    const [miejsceStartowe, setMiejsceStartowe] = useState(
        hasTripIdInUrl
            ? { nazwa: '', country: null, region: null, id: null, googleId: null, location: { lat: null, lng: null } }
            : (urlDefaults.miejsceStartowe?.nazwa
                ? urlDefaults.miejsceStartowe
                : {
                    nazwa: miejsceStartoweInit.nazwa || '',
                    country: null,
                    region: null,
                    id: null,
                    googleId: null,
                    location: {
                        lat: miejsceStartoweInit.location?.lat ?? null,
                        lng: miejsceStartoweInit.location?.lng ?? null,
                    },
                })
    );
    const [dataWyjazdu, setDataWyjazdu] = useState(hasTripIdInUrl ? null : (urlDefaults.dataWyjazdu ?? dataWyjazduInit));
    const [dataPowrotu, setDataPowrotu] = useState(hasTripIdInUrl ? null : (urlDefaults.dataPowrotu ?? dataPowrotuInit));

    const [liczbaUczestnikow, setLiczbaUczestnikow] = useState(
        hasTripIdInUrl
            ? liczbaUczestnikowInit
            : (urlDefaults.liczbaUczestnikow && urlDefaults.liczbaUczestnikow !== 0
                ? urlDefaults.liczbaUczestnikow
                : liczbaUczestnikowInit)
    );
    const [liczbaOpiekunow, setLiczbaOpiekunow] = useState(
        hasTripIdInUrl ? liczbaOpiekunowInit : (urlDefaults.liczbaOpiekunow ?? liczbaOpiekunowInit)
    );
    const [standardHotelu, setStandardHotelu] = useState(
        hasTripIdInUrl ? standardHoteluInit : (urlDefaults.standardHotelu ?? standardHoteluInit)
    );
    const [standardTransportu, setStandardTransportu] = useState(
        hasTripIdInUrl ? standardTransportuInit : (urlDefaults.standardTransportu ?? standardTransportuInit)
    );

    const [photoWallpaper, setPhotoWallpaper] = useState(
        "https://images.unsplash.com/photo-1633268456308-72d1c728943c?auto=format&fit=crop&w=1600&q=80"
    );
    const [publicPlan, setPublicPlan] = useState(true)
    const [nazwaWyjazdu, setNazwaWyjazdu] = useState(urlDefaults.nazwaWyjazdu ?? nazwaWyjazduInit)
    const [selectedMenu, setSelectedMenu] = useState(0);

    // 4) Stany / błędy planów
    const [synchronisedPlan, setsynchronisedPlan] = useState(null);
    const [downloadedPlan, setDownloadedPlan] = useState(null); // opcjonalne użycie
    const [planError, setPlanError] = useState(null);
    const [planLoading, setPlanLoading] = useState(false);
    const [downloadedLoading, setDownloadedLoading] = useState(false);
    const [downloadedError, setDownloadedError] = useState(null);
    const [synchronisingPlan, setSynchronisingPlan] = useState(false)
    // 5) Sync stanu → URL (bez przeładowania), dopiero gdy planReady
    useEffect(() => {
        if (!planReady) return;
        writeToUrl({
            miejsceDocelowe,
            miejsceStartowe,
            dataWyjazdu,
            dataPowrotu,
            liczbaUczestnikow,
            liczbaOpiekunow,
            standardHotelu,
            standardTransportu,
            nazwaWyjazdu
        });
    }, [
        planReady,
        miejsceDocelowe,
        miejsceStartowe,
        dataWyjazdu,
        dataPowrotu,
        liczbaUczestnikow,
        liczbaOpiekunow,
        standardHotelu,
        standardTransportu,
        nazwaWyjazdu
    ]);

    // 6) Link do konfiguratora – buduj po planReady
    const [konfiguratorUrl, setKonfiguratorUrl] = useState('');
    useEffect(() => {
        if (!planReady) return;

        const sp = new URLSearchParams();

        // start*
        if (miejsceStartowe?.nazwa) sp.set('startName', String(miejsceStartowe.nazwa));
        const sLat = Number(miejsceStartowe?.location?.lat);
        const sLng = Number(miejsceStartowe?.location?.lng);
        if (Number.isFinite(sLat)) sp.set('startLat', String(sLat));
        if (Number.isFinite(sLng)) sp.set('startLng', String(sLng));
        if (miejsceStartowe?.country) sp.set('startCountry', String(miejsceStartowe.country));
        if (miejsceStartowe?.region) sp.set('startRegion', String(miejsceStartowe.region));
        if (miejsceStartowe?.id !== undefined && miejsceStartowe?.id !== null && String(miejsceStartowe.id).trim() !== '') {
            sp.set('startId', String(miejsceStartowe.id));
        }
        if (miejsceStartowe?.googleId) sp.set('startGoogleId', String(miejsceStartowe.googleId));

        // DEST
        if (miejsceDocelowe?.nazwa) sp.set('destName', String(miejsceDocelowe.nazwa));
        const dLat = Number(miejsceDocelowe?.location?.lat);
        const dLng = Number(miejsceDocelowe?.location?.lng);
        if (Number.isFinite(dLat)) sp.set('destLat', String(dLat));
        if (Number.isFinite(dLng)) sp.set('destLng', String(dLng));

        // daty
        const arr = formatYMDLocal(dataWyjazdu);
        const dep = formatYMDLocal(dataPowrotu);
        if (arr) sp.set('arr', arr);
        if (dep) sp.set('dep', dep);

        // liczby i standardy
        if (Number.isFinite(liczbaUczestnikow)) sp.set('guests', String(liczbaUczestnikow));
        if (Number.isFinite(liczbaOpiekunow)) sp.set('guardians', String(liczbaOpiekunow));
        if (Number.isFinite(standardHotelu)) sp.set('hotelStd', String(standardHotelu));
        if (Number.isFinite(standardTransportu)) sp.set('transportStd', String(standardTransportu));

        // opcjonalnie tripId / downloadPlan
        if (tripId && String(tripId).trim()) sp.set('tripId', String(tripId));
        if (downloadPlan && String(downloadPlan).trim()) sp.set('downloadPlan', String(downloadPlan));
        if (nazwaWyjazdu) sp.set('nw', nazwaWyjazdu)
        const base = `${window.location.origin}/konfigurator`;
        const url = sp.toString() ? `${base}?${sp.toString()}` : base;
        setKonfiguratorUrl(url);
    }, [
        planReady,
        miejsceDocelowe,
        miejsceStartowe,
        dataWyjazdu,
        dataPowrotu,
        liczbaUczestnikow,
        liczbaOpiekunow,
        standardHotelu,
        standardTransportu,
        tripId,
        downloadPlan,
        nazwaWyjazdu,

    ]);

    // 7) Pobierz plan po tripId
    useEffect(() => {
        if (!tripId) {
            setsynchronisedPlan(null);
            setPlanReady(true); // brak planu → od razu gotowe
            return;
        }

        const ac = new AbortController();
        setPlanLoading(true);
        setPlanError(null);

        (async () => {
            try {
                const plan = await fetchTripPlanById(tripId, { signal: ac.signal });
                setsynchronisedPlan(plan);
                console.log("Pobrano plan", plan)
            } catch (e) {
                if (e.name !== "AbortError") {
                    setPlanError(e.message || "Fetch error");
                }
            } finally {
                setPlanLoading(false);
                setPlanReady(true);
            }
        })();

        return () => ac.abort();
    }, [tripId]);

    // 8) Jeżeli w URL jest downloadPlan, a nie ma tripId – pobierz plan „do odczytu”
    useEffect(() => {
        if (!downloadPlan || !String(downloadPlan).trim()) return;
        if (tripId && String(tripId).trim()) return;

        const ac = new AbortController();
        setDownloadedLoading(true);
        setDownloadedError(null);

        (async () => {
            try {
                const dp = await fetchDownloadedTripPlan(downloadPlan, { signal: ac.signal });
                setDownloadedPlan(dp);
                console.log("TEST2", dp)
                if (!dp) return;

                const {
                    miejsceDocelowe: md,
                    standardHotelu: sh,
                    standardTransportu: st,
                    photoLink,
                    nazwa: nazwaWyjazduDP,
                } = dp;

                if (md) setMiejsceDocelowe(md);
                if (nazwaWyjazduDP) setNazwaWyjazdu(nazwaWyjazduDP)
                if (Number.isFinite(sh)) setStandardHotelu(sh);
                if (Number.isFinite(st)) setStandardTransportu(st);
                if (typeof photoLink === "string" && photoLink.trim()) setPhotoWallpaper(photoLink);
            } catch (e) {
                if (e?.name !== "AbortError") {
                    setDownloadedError(e?.message || "Fetch error");
                }
            } finally {
                setDownloadedLoading(false);
            }
        })();

        return () => ac.abort();
    }, [downloadPlan, tripId]);

    // 9) Nałóż dane z pobranego planu na lokalny stan
    const toLocalDateNoon = (iso) => {
        if (!iso) return null;
        const d = new Date(iso);
        if (Number.isNaN(d)) return null;
        return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0, 0);
    };
    const toIntOrNull = (v) => {
        const n = Number(v);
        return Number.isFinite(n) ? Math.round(n) : null;
    };
    const clamp = (n, min, max) =>
        Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : null;

    useEffect(() => {
        if (!synchronisedPlan) return;

        const start = toLocalDateNoon(synchronisedPlan.dataPrzyjazdu); // = wyjazd
        const end = toLocalDateNoon(synchronisedPlan.dataWyjazdu);     // = powrót

        const miejsceDoceloweSource = synchronisedPlan.miejsceDocelowe;
        const miejsceStartoweSource = synchronisedPlan.miejsceStartowe;
        const standardTransportuSourceRaw = synchronisedPlan.standardTransportu;
        const standardHoteluSourceRaw = synchronisedPlan.standardHotelu;
        const liczbaUczestnikowSourceRaw = synchronisedPlan.liczbaUczestnikow;
        const liczbaOpiekunowSourceRaw = synchronisedPlan.liczbaOpiekunow;
        const photoWallpaperSource = synchronisedPlan.photoLink;
        const publicPlanSource = synchronisedPlan.public;
        const nazwaWyjazduSource = synchronisedPlan.nazwa;
        if (start) setDataWyjazdu(start);
        if (end) setDataPowrotu(end);

        if (miejsceDoceloweSource) setMiejsceDocelowe(miejsceDoceloweSource);
        if (miejsceStartoweSource) setMiejsceStartowe(miejsceStartoweSource);

        const stdTrans = clamp(toIntOrNull(standardTransportuSourceRaw), 0, 2);
        const stdHotel = clamp(toIntOrNull(standardHoteluSourceRaw), 0, 3);
        if (stdTrans != null) setStandardTransportu(stdTrans);
        if (stdHotel != null) setStandardHotelu(stdHotel);

        const guests = toIntOrNull(liczbaUczestnikowSourceRaw);
        const guardians = toIntOrNull(liczbaOpiekunowSourceRaw);
        if (guests != null && guests > 0) setLiczbaUczestnikow(guests);
        if (guardians != null && guardians >= 0) setLiczbaOpiekunow(guardians);

        if (photoWallpaperSource) setPhotoWallpaper(photoWallpaperSource);
        if (typeof publicPlanSource === "boolean") {
            setPublicPlan(publicPlanSource);
        }
        console.log("TETS2", nazwaWyjazduSource)
        if (nazwaWyjazduSource) setNazwaWyjazdu(nazwaWyjazduSource)
    }, [synchronisedPlan]);

    // 10) Helper: ustaw/zmień tripId w URL i w stanie
    function writeTripIdToUrl(newId) {
        const sp = new URLSearchParams(window.location.search);
        if (newId && String(newId).trim()) sp.set("tripId", String(newId));
        else sp.delete("tripId");
        const newUrl = `${window.location.pathname}?${sp.toString()}`;
        window.history.replaceState(null, "", newUrl);
        setTripId(newId ?? null);
    }

    // 11) Autozapis (PUT/POST) — tylko dla zalogowanych
    async function saveOrCreateTripPlan({ signal } = {}) {
        setSynchronisingPlan(true);

        try {
            // sprawdzenie zalogowania
            let userId = useUserStore.getState?.().user?._id ?? null;
            if (!userId) {
                try {
                    const me = await fetchMe().catch(() => null);
                    userId = me?._id ?? useUserStore.getState?.().user?._id ?? null;
                } catch {
                    /* ignore */
                }
            }
            if (!userId) {
                // brak użytkownika – kończymy, ale finally i tak ustawi synchronisingPlan na false
                return;
            }

            const payload = {
                miejsceDocelowe: miejsceDocelowe?.nazwa
                    ? {
                        nazwa: String(miejsceDocelowe.nazwa || "").trim(),
                        location: {
                            lat: Number(miejsceDocelowe.location?.lat),
                            lng: Number(miejsceDocelowe.location?.lng),
                        },
                    }
                    : undefined,
                miejsceStartowe: miejsceStartowe?.nazwa
                    ? {
                        nazwa: String(miejsceStartowe.nazwa || "").trim(),
                        country: miejsceStartowe.country ?? undefined,
                        region: miejsceStartowe.region ?? undefined,
                        id: miejsceStartowe.id ?? undefined,
                        googleId: miejsceStartowe.googleId ?? undefined,
                        location: {
                            lat: Number(miejsceStartowe.location?.lat),
                            lng: Number(miejsceStartowe.location?.lng),
                        },
                    }
                    : undefined,
                // mapowanie: dataPrzyjazdu = start, dataWyjazdu = koniec
                dataPrzyjazdu: dataWyjazdu ? formatYMDLocal(dataWyjazdu) : undefined,
                dataWyjazdu: dataPowrotu ? formatYMDLocal(dataPowrotu) : undefined,
                standardHotelu: Number.isFinite(standardHotelu) ? standardHotelu : undefined,
                standardTransportu: Number.isFinite(standardTransportu) ? standardTransportu : undefined,
                liczbaUczestnikow: Number.isFinite(liczbaUczestnikow) ? liczbaUczestnikow : undefined,
                liczbaOpiekunow: Number.isFinite(liczbaOpiekunow) ? liczbaOpiekunow : undefined,
                public: typeof publicPlan === "boolean" ? publicPlan : undefined,
                nazwa: nazwaWyjazdu ? nazwaWyjazdu : undefined,
            };

            const currentTripId = new URLSearchParams(window.location.search).get("tripId");
            const base = `${portacc}`;

            if (currentTripId && String(currentTripId).trim()) {
                // PUT – aktualizacja istniejącego planu
                try {
                    const resp = await fetch(
                        `${base}/api/trip-plans/${encodeURIComponent(currentTripId)}`,
                        {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify(payload),
                            signal,
                        }
                    );
                    if (resp.ok) {
                        const updated = await resp.json().catch(() => null);
                        if (updated?.photoLink) setPhotoWallpaper(updated.photoLink);
                    }
                } catch {
                    /* ignore */
                }
                return;
            }

            // POST – utwórz i ustaw tripId w URL + stanie
            try {
                const resp = await fetch(`${base}/api/trip-plans`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(payload),
                    signal,
                });
                if (!resp.ok) return;

                const created = await resp.json().catch(() => null);
                const newId = created?._id;
                if (newId) {
                    writeTripIdToUrl(newId);
                    try {
                        const plan = await fetchTripPlanById(newId, { signal });
                        if (plan?.photoLink) setPhotoWallpaper(plan.photoLink);
                    } catch {
                        /* ignore */
                    }
                }
            } catch {
                /* ignore */
            }
        } finally {
            // ZAWSZE, niezależnie od powodzenia/porażki, wyłączamy flagę
            setSynchronisingPlan(false);
        }
    }


    // === Walidacja ===
    const isFiniteNumber = (v) => typeof v === "number" && Number.isFinite(v);
    const isNonEmptyString = (s) => typeof s === "string" && s.trim().length > 0;
    const isValidDate = (d) => {
        if (d === null || d === undefined || d === "") return false;
        const dt = d instanceof Date ? d : new Date(d);
        return !Number.isNaN(dt.getTime());
    };
    const isValidDateRange = (start, end) => {
        if (!isValidDate(start) || !isValidDate(end)) return false;
        const s = start instanceof Date ? start : new Date(start);
        const e = end instanceof Date ? end : new Date(end);
        return e >= s;
    };
    const isValidLocation = (loc) => {
        if (!loc || typeof loc !== "object") return false;
        if (loc.lat === null || loc.lat === undefined) return false;
        if (loc.lng === null || loc.lng === undefined) return false;
        const lat = Number(loc.lat);
        const lng = Number(loc.lng);
        return Number.isFinite(lat) && Number.isFinite(lng);
    };
    const isValidPlace = (place) =>
        !!place &&
        isNonEmptyString(place.nazwa) &&
        isValidLocation(place.location);

    function isValidPreconfigureState({
        miejsceDocelowe,
        miejsceStartowe,
        dataWyjazdu,
        dataPowrotu,
        liczbaUczestnikow,
        liczbaOpiekunow,
        standardHotelu,
        standardTransportu,
    }) {
        if (!isValidPlace(miejsceDocelowe)) return false;
        if (!isValidPlace(miejsceStartowe)) return false;
        if (!isValidDateRange(dataWyjazdu, dataPowrotu)) return false;
        if (!isFiniteNumber(liczbaUczestnikow) || liczbaUczestnikow <= 0) return false;
        if (!isFiniteNumber(liczbaOpiekunow) || liczbaOpiekunow < 0) return false;
        if (!isFiniteNumber(standardHotelu) || standardHotelu < 0 || standardHotelu > 3) return false;
        if (!isFiniteNumber(standardTransportu) || standardTransportu < 0 || standardTransportu > 2) return false;
        return true;
    }

    // 12) Autozapis – tylko gdy stan jest poprawny i planReady
    useEffect(() => {
        if (!planReady) return;
        const ac = new AbortController();

        const canSave = isValidPreconfigureState({
            miejsceDocelowe,
            miejsceStartowe,
            dataWyjazdu,
            dataPowrotu,
            liczbaUczestnikow,
            liczbaOpiekunow,
            standardHotelu,
            standardTransportu,
        });

        if (canSave) {
            (async () => {
                console.log("do zapisania")
                await saveOrCreateTripPlan({ signal: ac.signal });
            })();
        }

        return () => ac.abort();
    }, [
        planReady,
        miejsceDocelowe,
        miejsceStartowe,
        dataWyjazdu,
        dataPowrotu,
        liczbaUczestnikow,
        liczbaOpiekunow,
        standardHotelu,
        standardTransportu,
        publicPlan,
        nazwaWyjazdu,
        // UWAGA: nie odczytuj tripId z URL wprost w deps; bazujemy na stanie tripId
        tripId,
    ]);
    const titleRef = useRef(null);

    useEffect(() => {
        if (!titleRef.current) return;
        // Nie nadpisuj, jeśli użytkownik edytuje
        if (document.activeElement === titleRef.current) return;
        if (nazwaWyjazdu == null) return; // nie czyść na null/undefined

        titleRef.current.textContent = nazwaWyjazdu;
    }, [nazwaWyjazdu]);
    const canGoToConfigurator = planReady && isValidPreconfigureState({
        miejsceDocelowe,
        miejsceStartowe,
        dataWyjazdu,
        dataPowrotu,
        liczbaUczestnikow,
        liczbaOpiekunow,
        standardHotelu,
        standardTransportu,
    });
    useEffect(() => {
        const lat = miejsceDocelowe?.location?.lat;
        const lng = miejsceDocelowe?.location?.lng;

        if (
            tripId ||
            downloadPlan ||
            !miejsceDocelowe?.nazwa ||
            lat == null ||
            lng == null
        ) {
            return;
        }
        setNazwaWyjazdu(`Wyjazd do ${miejsceDocelowe.nazwa}`)
        const controller = new AbortController();

        const fetchPhoto = async () => {
            try {
                const url =
                    `${portacc}/getPhotoOfCity` +
                    `?nazwa=${encodeURIComponent(miejsceDocelowe.nazwa)}` +
                    `&lat=${encodeURIComponent(lat)}` +
                    `&lng=${encodeURIComponent(lng)}`;

                const res = await fetch(url, { signal: controller.signal });

                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }

                const data = await res.json();

                if (data && data.photoUrl) {
                    setPhotoWallpaper(data.photoUrl);
                }
            } catch (err) {
                if (err.name === "AbortError") return;
                console.error("Błąd przy pobieraniu tła miasta:", err);
            }
        };

        // 🔹 debounce 3 sekundy
        const timeoutId = setTimeout(() => {
            fetchPhoto();
        }, 3000);

        return () => {
            controller.abort();
            clearTimeout(timeoutId);
        };
    }, [
        tripId,
        downloadPlan,
        miejsceDocelowe?.nazwa,
        miejsceDocelowe?.location?.lat,
        miejsceDocelowe?.location?.lng,
        portacc,
    ]);



    useEffect(()=>{
        console.log(synchronisingPlan)
    }, [synchronisingPlan])
    return (
        <PreConfigureMainbox>
            <PreConfigureHeader>
                <div
                    className="preConfigureHeaderImage"
                    style={{ backgroundImage: `url(${photoWallpaper})` }}
                >
                    <div className="wyjazdNazwa">
                        <div
                            className="wyjazdNazwaInput"
                            contentEditable
                            suppressContentEditableWarning
                            ref={titleRef}
                            onInput={(e) => {
                                setNazwaWyjazdu(e.currentTarget.textContent);
                            }}
                        >
                            {nazwaWyjazdu ?? ""}
                        </div>
                        <Edit2 size={40} />
                    </div>
                </div>

                <PreConfigureHeaderWrapper>
                    <div className="preConfigureTitleWrapper">
                        <div className="preConfigureHeaderTitle">Podstawowe informacje</div>
                        <div className="preConfigureHeaderSubtitle">
                            Zarządzaj szczegółami swojego wyjazdu lub przejdź do konfiguratora
                        </div>
                    </div>
                    <div className="preConfigureButtons">
                        <a
                            className={`preConfigureButton${canGoToConfigurator && !synchronisingPlan ? '' : ' disabled'}`}
                            href={canGoToConfigurator && !synchronisingPlan ? konfiguratorUrl : undefined}
                            onClick={(e) => {
                                if (!canGoToConfigurator || synchronisingPlan) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }
                            }}
                        >
                            <Settings size={20} />
                            Konfigurator
                        </a>

                        <a className={publicPlan ? "preConfigureButton b" : "preConfigureButton b privatePlan"} onClick={() => setPublicPlan(!publicPlan)}>
                            <EyeCheckbox ifChecked={publicPlan} />
                            Plan publiczny
                        </a>
                    </div>
                </PreConfigureHeaderWrapper>
            </PreConfigureHeader>

            <TabsContainer>
                <Tab $active={selectedMenu === 0} onClick={() => setSelectedMenu(0)}>Podstawowe</Tab>
                <Tab $active={selectedMenu === 1} onClick={() => setSelectedMenu(1)}>Uczestnicy</Tab>
                <Tab $active={selectedMenu === 2} onClick={() => setSelectedMenu(2)}>Płatności</Tab>
            </TabsContainer>

            {selectedMenu === 0 && (
                <PreConfigureSketch
                    miejsceDocelowe={miejsceDocelowe}
                    miejsceStartowe={miejsceStartowe}
                    dataWyjazdu={dataWyjazdu}
                    dataPowrotu={dataPowrotu}
                    liczbaUczestnikow={liczbaUczestnikow}
                    liczbaOpiekunow={liczbaOpiekunow}
                    standardHotelu={standardHotelu}
                    standardTransportu={standardTransportu}
                    setMiejsceDocelowe={setMiejsceDocelowe}
                    setMiejsceStartowe={setMiejsceStartowe}
                    setDataWyjazdu={setDataWyjazdu}
                    setDataPowrotu={setDataPowrotu}
                    setLiczbaUczestnikow={setLiczbaUczestnikow}
                    setLiczbaOpiekunow={setLiczbaOpiekunow}
                    setStandardHotelu={setStandardHotelu}
                    setStandardTransportu={setStandardTransportu}
                />
            )}
            {selectedMenu === 1 && (
                <PreConfigureParticipants
                />
            )}
        </PreConfigureMainbox>
    );
};
