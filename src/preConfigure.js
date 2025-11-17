import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { Tab, TabsContainer } from './profilePage';
import { PreConfigureSketch } from './preConfSketch';
import { Settings } from 'lucide-react';
import useUserStore, { fetchMe } from './usercontent.js';
import { useNavigate } from 'react-router-dom';

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
      &:hover{
        background-color: #333333;
      }
      @media screen and (max-width: 800px){
        font-size: 12px;
        height: 35px;
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
    height: 400px;
    border-radius: 50px;
    overflow: hidden;
    img{
      width: 100%;
      height: 100%;
      object-fit: cover;
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
export async function fetchTripPlanForCurrentUser(tripId, { signal } = {}) {
    if (!tripId || !String(tripId).trim()) {
        throw new Error('tripId is required');
    }

    let userId = useUserStore.getState?.().user?._id ?? null;
    if (!userId) {
        try {
            const me = await fetchMe().catch(() => null);
            userId = me?._id ?? useUserStore.getState?.().user?._id ?? null;
        } catch {
            // ignore
        }
    }

    if (!userId) return null;

    const url = `http://localhost:5007/api/trip-plans/${encodeURIComponent(tripId)}/by-author/${encodeURIComponent(userId)}`;

    const resp = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: { Accept: 'application/json' },
        signal,
    });

    if (resp.ok) {
        return await resp.json();
    }

    if (resp.status === 404) {
        return null;
    }

    const text = await resp.text().catch(() => '');
    throw new Error(`Fetch failed (${resp.status}): ${text || resp.statusText}`);
}

/* ===================== API HELPERS ===================== */
export async function fetchTripPlanById(tripId, { signal } = {}) {
    if (!tripId || !String(tripId).trim()) {
        throw new Error('tripId is required');
    }

    const url = `http://localhost:5007/api/trip-plans/${encodeURIComponent(tripId)}`;

    const resp = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Accept': 'application/json' },
        signal,
    });

    if (resp.status === 404) {
        return null;
    }
    if (!resp.ok) {
        const text = await resp.text().catch(() => '');
        throw new Error(`Fetch failed (${resp.status}): ${text || resp.statusText}`);
    }

    const data = await resp.json();
    console.log("Synchronizacja z planem", data)
    return data;
}
export async function fetchDownloadedTripPlan(tripId, { signal } = {}) {
    if (!tripId || !String(tripId).trim()) {
        throw new Error("tripId is required");
    }

    const url = `http://localhost:5007/download/trip-plan?tripId=${encodeURIComponent(tripId)}`;

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

/**
 * Odczyt stanu z URL (UWAGA: arr = WYJAZD, dep = POWRÓT po Twojej zmianie).
 */
const readFromUrl = () => {
    const sp = new URLSearchParams(window.location.search);

    // DEST
    const miejsceDocelowe = {
        nazwa: sp.get('destName') || '',
        location: {
            lat: toNumber(sp.get('destLat')),
            lng: toNumber(sp.get('destLng')),
        },
    };

    // START – pełny zestaw metadanych
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

    // DATY – arr (wyjazd), dep (powrót) — PARSUJEMY JAKO LOKALNE
    const dataWyjazdu = parseYMDLocal(sp.get('arr'));
    const dataPowrotu = parseYMDLocal(sp.get('dep'));

    // LICZBY
    const liczbaUczestnikow = Number.isFinite(Number(sp.get('guests')))
        ? Number(sp.get('guests'))
        : 1;
    const liczbaOpiekunow = Number.isFinite(Number(sp.get('guardians')))
        ? Number(sp.get('guardians'))
        : 0;

    // STANDARDY
    const standardHotelu = Number.isFinite(Number(sp.get('hotelStd')))
        ? Number(sp.get('hotelStd'))
        : 1;
    const standardTransportu = Number.isFinite(Number(sp.get('transportStd')))
        ? Number(sp.get('transportStd'))
        : 1;

    // Sterowanie pobraniem planu
    const downloadPlan = sp.get('downloadPlan') || null;
    const tripId = sp.get('tripId') || null;

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
    };
};

/**
 * Zapis stanu do URL (arr = wyjazd, dep = powrót) bez UTC-konwersji.
 */
const writeToUrl = (state) => {
    const sp = new URLSearchParams(window.location.search);

    // DEST
    sp.set('destName', state.miejsceDocelowe?.nazwa || '');
    const dLat = state.miejsceDocelowe?.location?.lat ?? '';
    const dLng = state.miejsceDocelowe?.location?.lng ?? '';
    if (dLat !== '') sp.set('destLat', String(dLat)); else sp.delete('destLat');
    if (dLng !== '') sp.set('destLng', String(dLng)); else sp.delete('destLng');

    // START (z metadanymi)
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

    // DATY – arr (wyjazd), dep (powrót) — FORMATUJEMY JAKO LOKALNE YYYY-MM-DD
    const arr = formatYMDLocal(state.dataWyjazdu);
    const dep = formatYMDLocal(state.dataPowrotu);
    arr ? sp.set('arr', arr) : sp.delete('arr');
    dep ? sp.set('dep', dep) : sp.delete('dep');

    // LICZBY
    sp.set('guests', String(state.liczbaUczestnikow ?? 1));
    sp.set('guardians', String(state.liczbaOpiekunow ?? 0));

    // STANDARDY
    sp.set('hotelStd', String(state.standardHotelu ?? 1));
    sp.set('transportStd', String(state.standardTransportu ?? 1));

    // downloadPlan / tripId pozostają bez zmian
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
    standardTransportuInit = 1
) => {
    // 1) Wczytanie z URL (jeżeli brak – użycie initów)
    const urlDefaults = useMemo(readFromUrl, []);

    const [miejsceDocelowe, setMiejsceDocelowe] = useState(
        urlDefaults.miejsceDocelowe?.nazwa
            ? urlDefaults.miejsceDocelowe
            : {
                nazwa: miejsceDoceloweInit.nazwa || '',
                location: {
                    lat: miejsceDoceloweInit.location?.lat ?? null,
                    lng: miejsceDoceloweInit.location?.lng ?? null,
                },
            }
    );

    const [miejsceStartowe, setMiejsceStartowe] = useState(
        urlDefaults.miejsceStartowe?.nazwa
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
            }
    );

    const [dataWyjazdu, setDataWyjazdu] = useState(urlDefaults.dataWyjazdu ?? dataWyjazduInit);
    const [dataPowrotu, setDataPowrotu] = useState(urlDefaults.dataPowrotu ?? dataPowrotuInit);
    const [liczbaUczestnikow, setLiczbaUczestnikow] = useState(
        urlDefaults.liczbaUczestnikow && urlDefaults.liczbaUczestnikow !== 0
            ? urlDefaults.liczbaUczestnikow
            : liczbaUczestnikowInit
    );
    const [liczbaOpiekunow, setLiczbaOpiekunow] = useState(urlDefaults.liczbaOpiekunow ?? liczbaOpiekunowInit);
    const [standardHotelu, setStandardHotelu] = useState(urlDefaults.standardHotelu ?? standardHoteluInit);
    const [standardTransportu, setStandardTransportu] = useState(urlDefaults.standardTransportu ?? standardTransportuInit);
    const [photoWallpaper, setPhotoWallpaper] = useState("https://images.unsplash.com/photo-1633268456308-72d1c728943c?auto=format&fit=crop&w=1600&q=80")
    const [selectedMenu, setSelectedMenu] = useState(0);

    // 2) Synchronizacja stanu → URL (bez przeładowania)
    useEffect(() => {
        writeToUrl({
            miejsceDocelowe,
            miejsceStartowe,
            dataWyjazdu,
            dataPowrotu,
            liczbaUczestnikow,
            liczbaOpiekunow,
            standardHotelu,
            standardTransportu,
        });
    }, [
        miejsceDocelowe,
        miejsceStartowe,
        dataWyjazdu,
        dataPowrotu,
        liczbaUczestnikow,
        liczbaOpiekunow,
        standardHotelu,
        standardTransportu,
    ]);

    // 3) Parametry sterujące pobraniem planu – przekazujemy do PreConfigureSketch
    const downloadPlan = urlDefaults.downloadPlan || null;
    const tripId = urlDefaults.tripId || null;

    // === stan na link do konfiguratora ===
    const [konfiguratorUrl, setKonfiguratorUrl] = useState('');

    // === aktualizacja linku przy zmianach danych ===
    // === aktualizacja linku przy zmianach danych ===
    useEffect(() => {
        const sp = new URLSearchParams();

        // start*
        if (miejsceStartowe?.nazwa) sp.set('startName', String(miejsceStartowe.nazwa));
        const sLat = Number(miejsceStartowe?.location?.lat);
        const sLng = Number(miejsceStartowe?.location?.lng);
        if (Number.isFinite(sLat)) sp.set('startLat', String(sLat));
        if (Number.isFinite(sLng)) sp.set('startLng', String(sLng));
        if (miejsceStartowe?.country) sp.set('startCountry', String(miejsceStartowe.country));
        if (miejsceStartowe?.region) sp.set('startRegion', String(miejsceStartowe.region));
        if (
            miejsceStartowe?.id !== undefined &&
            miejsceStartowe?.id !== null &&
            String(miejsceStartowe.id).trim() !== ''
        ) {
            sp.set('startId', String(miejsceStartowe.id));
        }
        if (miejsceStartowe?.googleId) sp.set('startGoogleId', String(miejsceStartowe.googleId));

        // DEST (nowe — obsługa miejsca docelowego w linku)
        if (miejsceDocelowe?.nazwa) sp.set('destName', String(miejsceDocelowe.nazwa));
        const dLat = Number(miejsceDocelowe?.location?.lat);
        const dLng = Number(miejsceDocelowe?.location?.lng);
        if (Number.isFinite(dLat)) sp.set('destLat', String(dLat));
        if (Number.isFinite(dLng)) sp.set('destLng', String(dLng));

        // daty: arr = wyjazd, dep = powrót (format lokalny, bez UTC)
        const arr = formatYMDLocal(dataWyjazdu);
        const dep = formatYMDLocal(dataPowrotu);
        if (arr) sp.set('arr', arr);
        if (dep) sp.set('dep', dep);

        // liczby i standardy
        if (Number.isFinite(liczbaUczestnikow)) sp.set('guests', String(liczbaUczestnikow));
        if (Number.isFinite(liczbaOpiekunow)) sp.set('guardians', String(liczbaOpiekunow));
        if (Number.isFinite(standardHotelu)) sp.set('hotelStd', String(standardHotelu));
        if (Number.isFinite(standardTransportu)) sp.set('transportStd', String(standardTransportu));

        // opcjonalnie tripId
        if (tripId && String(tripId).trim()) sp.set('tripId', String(tripId));

        const base = `${window.location.origin}/konfigurator`;
        const url = sp.toString() ? `${base}?${sp.toString()}` : base;
        setKonfiguratorUrl(url);
    }, [
        // ➜ dodajemy także miejsceDocelowe do zależności
        miejsceDocelowe,
        miejsceStartowe,
        dataWyjazdu,
        dataPowrotu,
        liczbaUczestnikow,
        liczbaOpiekunow,
        standardHotelu,
        standardTransportu,
        tripId,
    ]);
    // stan na pobrany plan (opcjonalnie — jeśli chcesz go gdzieś wyświetlać/przekazać)
    const [synchronisedPlan, setsynchronisedPlan] = useState(null);
    const [downloadedPlan, setDownloadedPlan] = useState(null)
    const [planError, setPlanError] = useState(null);
    const [planLoading, setPlanLoading] = useState(false);
    const [downloadedLoading, setDownloadedLoading] = useState(false);
    const [downloadedError, setDownloadedError] = useState(null);


    useEffect(() => {
        if (!tripId) {
            setsynchronisedPlan(null);
            return;
        }

        const ac = new AbortController();
        setPlanLoading(true);
        setPlanError(null);

        (async () => {
            try {
                const plan = await fetchTripPlanById(tripId, { signal: ac.signal });
                setsynchronisedPlan(plan);           // masz dane w stanie
                console.log("Pobrany plan", plan); // tu już realne dane
            } catch (e) {
                if (e.name !== "AbortError") {
                    console.error("Błąd pobierania planu:", e);
                    setPlanError(e.message || "Fetch error");
                }
            } finally {
                setPlanLoading(false);
            }
        })();

        return () => ac.abort();
    }, [tripId]);
    // efekt: gdy w URL jest downloadPlan (ID planu do "odczytu"), pobierz i nałóż wartości
    useEffect(() => {
        if (!downloadPlan || !String(downloadPlan).trim()) return;

        // OPCJONALNE: gdy priorytet ma tripId (plan autora), nie uruchamiaj downloadPlan
        if (tripId && String(tripId).trim()) return;

        const ac = new AbortController();
        setDownloadedLoading(true);
        setDownloadedError(null);

        (async () => {
            try {
                // UWAGA: używamy downloadPlan jako ID!
                const dp = await fetchDownloadedTripPlan(downloadPlan, { signal: ac.signal });
                if (!dp) return;

                const {
                    miejsceDocelowe,
                    standardHotelu,
                    standardTransportu,
                    photoLink,
                    // computedPrice, activitiesSchedule – dostępne w odpowiedzi,
                    // ale ten komponent nie ma na nie lokalnych stanów.
                } = dp;

                if (miejsceDocelowe) setMiejsceDocelowe(miejsceDocelowe);
                if (Number.isFinite(standardHotelu)) setStandardHotelu(standardHotelu);
                if (Number.isFinite(standardTransportu)) setStandardTransportu(standardTransportu);
                if (typeof photoLink === "string" && photoLink.trim()) setPhotoWallpaper(photoLink);
            } catch (e) {
                if (e?.name !== "AbortError") {
                    console.error("Błąd pobierania downloadedPlan:", e);
                    setDownloadedError(e?.message || "Fetch error");
                }
            } finally {
                setDownloadedLoading(false);
            }
        })();

        return () => ac.abort();
    }, [downloadPlan, tripId]);

    const toLocalDateNoon = (iso) => {
        if (!iso) return null;
        const d = new Date(iso);
        if (Number.isNaN(d)) return null;
        // Budujemy nową datę w CZASIE LOKALNYM, na południe:
        return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0, 0);
    };
    // pomocnicze: liczby + zakresy
    const toIntOrNull = (v) => {
        const n = Number(v);
        return Number.isFinite(n) ? Math.round(n) : null;
    };
    const clamp = (n, min, max) =>
        Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : null;

    useEffect(() => {
        if (!synchronisedPlan) return;

        const start = toLocalDateNoon(synchronisedPlan.dataPrzyjazdu);   // początek
        const end = toLocalDateNoon(synchronisedPlan.dataWyjazdu);     // koniec

        const miejsceDoceloweSource = synchronisedPlan.miejsceDocelowe;
        const miejsceStartoweSource = synchronisedPlan.miejsceStartowe;
        const standardTransportuSourceRaw = synchronisedPlan.standardTransportu;
        const standardHoteluSourceRaw = synchronisedPlan.standardHotelu;
        const liczbaUczestnikowSourceRaw = synchronisedPlan.liczbaUczestnikow;
        const liczbaOpiekunowSourceRaw = synchronisedPlan.liczbaOpiekunow;


        const photoWallpaperSource = synchronisedPlan.photoLink; // jeśli dodasz stan na tapetę, ustawisz go tutaj

        // daty
        if (start) setDataWyjazdu(start);
        if (end) setDataPowrotu(end);

        // miejsca
        if (miejsceDoceloweSource) setMiejsceDocelowe(miejsceDoceloweSource);
        if (miejsceStartoweSource) setMiejsceStartowe(miejsceStartoweSource);

        // standardy z zakresem (hotel 0–3, transport 0–2)
        const stdTrans = clamp(toIntOrNull(standardTransportuSourceRaw), 0, 2);
        const stdHotel = clamp(toIntOrNull(standardHoteluSourceRaw), 0, 3);
        if (stdTrans != null) setStandardTransportu(stdTrans);
        if (stdHotel != null) setStandardHotelu(stdHotel);

        // liczby osób (sensowne minimum: 0 opiekunów, 1 uczestnik)
        const guests = toIntOrNull(liczbaUczestnikowSourceRaw);
        const guardians = toIntOrNull(liczbaOpiekunowSourceRaw);

        if (guests != null && guests > 0) { setLiczbaUczestnikow(guests) };
        if (guardians != null && guardians >= 0) setLiczbaOpiekunow(guardians);

        // jeśli w przyszłości dodasz stan dla zdjęcia nagłówka:
        if (photoWallpaperSource) setPhotoWallpaper(photoWallpaperSource);

    }, [synchronisedPlan]);

    useEffect(() => {
        console.log("Tapeta", photoWallpaper)
    }, [photoWallpaper])
    return (
        <PreConfigureMainbox>
            <PreConfigureHeader key={photoWallpaper}>
                <div className="preConfigureHeaderImage">
                    <img
                        src={photoWallpaper}
                        alt="Pre Configure Header"
                    />
                </div>

                <PreConfigureHeaderWrapper>
                    <div className="preConfigureTitleWrapper">
                        <div className="preConfigureHeaderTitle">Podstawowe informacje</div>
                        <div className="preConfigureHeaderSubtitle">
                            Zarządzaj szczegółami swojego wyjazdu lub przejdź do konfiguratora
                        </div>
                    </div>
                    <div className="preConfigureButtons">
                        <a className="preConfigureButton" href={konfiguratorUrl}>
                            <Settings size={20} />
                            Konfigurator
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
                    // wartości (zewnętrzne)
                    miejsceDocelowe={miejsceDocelowe}
                    miejsceStartowe={miejsceStartowe}
                    dataWyjazdu={dataWyjazdu}
                    dataPowrotu={dataPowrotu}
                    liczbaUczestnikow={liczbaUczestnikow}
                    liczbaOpiekunow={liczbaOpiekunow}
                    standardHotelu={standardHotelu}
                    standardTransportu={standardTransportu}
                    // settery (zewnętrzne)
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
        </PreConfigureMainbox>
    );
};
