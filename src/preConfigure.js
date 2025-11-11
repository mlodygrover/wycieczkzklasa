import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { Tab, TabsContainer } from './profilePage';
import { PreConfigureSketch } from './preConfSketch';

const PreConfigureMainbox = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  margin-top: 100px;
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
  .preConfigureHeaderTitle{
    margin-top: 10px;
    font-family: 'Inter', sans-serif;
    font-size: 42px;
    font-weight: 700;
    width: 100%;
    max-width: 1600px;
    text-align: left;
  }
  .preConfigureHeaderSubtitle{
    font-family: 'Inter', sans-serif;
    font-size: 18px;
    font-weight: 500;
    color: #606060;
    width: 100%;
    max-width: 1600px;
    text-align: left;
  }
`;

const PreConfigureBoxes = styled.div`
  width: 90%;
  max-width: 1600px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 16px 20px;

  .preConfigureBox {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    box-shadow: 0px 4px 20px rgba(3, 0, 46, 0.1);
    padding: 12px 16px;
    box-sizing: border-box;
    border-radius: 12px;
    background: #fff;

    .preConfigureBoxTitle {
      font-family: 'Inter', sans-serif;
      font-size: 20px;
      font-weight: 600;
    }
    .preConfigureBoxSubtitle {
      font-family: 'Inter', sans-serif;
      font-size: 12px;
      font-weight: 500;
      border-radius: 8px;
      color: #606060;
      padding: 2px 0;
    }

    input {
      width: 100%;
      height: 36px;
      border: none;
      border-radius: 10px;
      padding: 0 10px;
      font-size: 14px;
      margin-top: 10px;
      box-sizing: border-box;
      background-color: #fafafa;
      outline: none;
      color: #404040;
    }
  }

  @media (max-width: 900px) {
    grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  }
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

/** Helpery konwersji */
const toNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
const toDateOrNull = (s) => (s ? new Date(s) : null);
const fmtDateParam = (d) => (d instanceof Date && !isNaN(d) ? d.toISOString().slice(0, 10) : '');

/** Inicjalizacja z URL */
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
    location: {
      lat: toNumber(sp.get('startLat')),
      lng: toNumber(sp.get('startLng')),
    },
  };

  const dataWyjazdu = toDateOrNull(sp.get('depart'));
  const dataPowrotu = toDateOrNull(sp.get('return'));

  const liczbaUczestnikow = Number.isFinite(Number(sp.get('participants')))
    ? Number(sp.get('participants'))
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

  return {
    miejsceDocelowe,
    miejsceStartowe,
    dataWyjazdu,
    dataPowrotu,
    liczbaUczestnikow,
    liczbaOpiekunow,
    standardHotelu,
    standardTransportu,
  };
};

/** Zapis do URL (bez przeładowania) */
const writeToUrl = (state) => {
  const sp = new URLSearchParams(window.location.search);

  // dest
  sp.set('destName', state.miejsceDocelowe?.nazwa || '');
  const dLat = state.miejsceDocelowe?.location?.lat ?? '';
  const dLng = state.miejsceDocelowe?.location?.lng ?? '';
  if (dLat !== '') sp.set('destLat', String(dLat)); else sp.delete('destLat');
  if (dLng !== '') sp.set('destLng', String(dLng)); else sp.delete('destLng');

  // start
  sp.set('startName', state.miejsceStartowe?.nazwa || '');
  const sLat = state.miejsceStartowe?.location?.lat ?? '';
  const sLng = state.miejsceStartowe?.location?.lng ?? '';
  if (sLat !== '') sp.set('startLat', String(sLat)); else sp.delete('startLat');
  if (sLng !== '') sp.set('startLng', String(sLng)); else sp.delete('startLng');

  // dates
  const depart = fmtDateParam(state.dataWyjazdu);
  const ret = fmtDateParam(state.dataPowrotu);
  depart ? sp.set('depart', depart) : sp.delete('depart');
  ret ? sp.set('return', ret) : sp.delete('return');

  // numbers
  sp.set('participants', String(state.liczbaUczestnikow ?? 1));
  sp.set('guardians', String(state.liczbaOpiekunow ?? 0));
  sp.set('hotelStd', String(state.standardHotelu ?? 1));
  sp.set('transportStd', String(state.standardTransportu ?? 1));

  const newUrl = `${window.location.pathname}?${sp.toString()}`;
  window.history.replaceState(null, '', newUrl);
};

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
  // 1) Wczytaj z URL (jeśli brak – użyj przekazanych initów)
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
          location: {
            lat: miejsceStartoweInit.location?.lat ?? null,
            lng: miejsceStartoweInit.location?.lng ?? null,
          },
        }
  );
  const [dataWyjazdu, setDataWyjazdu] = useState(urlDefaults.dataWyjazdu ?? dataWyjazduInit);
  const [dataPowrotu, setDataPowrotu] = useState(urlDefaults.dataPowrotu ?? dataPowrotuInit);
  const [liczbaUczestnikow, setLiczbaUczestnikow] = useState(urlDefaults.liczbaUczestnikow && urlDefaults.liczbaUczestnikow != 0 ? urlDefaults.liczbaUczestnikow : liczbaUczestnikowInit);
  const [liczbaOpiekunow, setLiczbaOpiekunow] = useState(urlDefaults.liczbaOpiekunow ?? liczbaOpiekunowInit);
  const [standardHotelu, setStandardHotelu] = useState(urlDefaults.standardHotelu ?? standardHoteluInit);
  const [standardTransportu, setStandardTransportu] = useState(urlDefaults.standardTransportu ?? standardTransportuInit);

  const [selectedMenu, setSelectedMenu] = useState(0);

  // 2) Synchronizacja stanu → URL
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

  // (opcjonalny) lokalny input do przykładów poniżej
  const [miejsceDoceloweSearching, setMiejsceDoceloweSearching] = useState(miejsceDocelowe.nazwa || '');

  return (
    <PreConfigureMainbox>
      <PreConfigureHeader>
        <div className="preConfigureHeaderImage">
          <img
            src="https://images.unsplash.com/photo-1633268456308-72d1c728943c?auto=format&fit=crop&w=1600&q=80"
            alt="Pre Configure Header"
          />
        </div>
        <div className="preConfigureHeaderTitle">Konfigurator wyjazdu</div>
        <div className="preConfigureHeaderSubtitle">Zarządzaj szczegółami swojego wyjazdu</div>
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
