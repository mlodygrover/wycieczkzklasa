import logo from './logo.svg';
import './App.css';
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import styled from 'styled-components';
import { Slider, CitiesList, SearchInput, MenuRadio, Footer, RadioStars, WyjazdFormularz } from './components';
import { CityResult } from './roots/cityresult';
import { InfoTile } from './infotile';
import { SlideKonfiguracja } from './roots/SlideKonfigurator';
import { MacbookLoader } from './roots/Macbook';
import { FormularzRightWyjazd } from './roots/formularz-wyjazd';
import { FormularzBottom } from './roots/formularz-bottom';
import { ProgramTile } from './roots/programtile';
import { HotelsSearch } from './roots/HotelSearch';
import { KreatorWyjazdu } from './roots/kreatorWyjazdu';
import { TopKreatorSlider } from './roots/topKreatorSlider';
import ChromeTabs from './roots/testkarty';
import GoogleLikeCard from './roots/testGoogleAtrakcja';
import { AktywnosciNaw } from './roots/aktywnosciNaw';
import MyTimePicker from './roots/timePicker';
import MapLocationPicker from './roots/wyborLokalizacji';
import { DodawaniePanel } from './roots/dodawaniePanel';
import TestRequestow from './roots/requestyTest';
import PhotoTester from './testy/testZdjec2.js';
import WasabiUploadTest from './testy/wasabiUploadTest.js';
import { KonfiguratorWyjazdu } from './konfiguratorWyjazdu.js';
import WeatherCard from './weatherCard.js';
import { KonfiguratorMain } from './konfiguratorMain.js';
import { AttractionsList } from './roots/attractionsListTest.js';
import { AddActivityButton } from './roots/addnewactivity.js';
import { AddActivityPanel } from './konfigurator/addActivityPanel.js';
import WikipediaPhoto from './wikipediaPhoto.js';
import { HomePage } from './homepage.js';
import VideoHeroWithCard from './lglass_test.js';
import LoginPage from './loginPage.js';
import { FeaturesSection } from './brandTiles.js';
import DestinationsSlider from './destinationsSlider.js';
import { TeacherOfferBanner } from './teacherBanner.js';
import { LiquidMenuBar } from './luquidMenuBar.js';
import PageFooter from './pageFooter.js';
import { TravelMenuGlass } from './travelMenuGlass.js';
import { TravelMenuUnified } from './unifiedMenu.js';

import { initAuth } from './usercontent'; // <-- ważne: hydratacja sesji
import UserProfile from './userProfile.js';
import { ProfilePage } from './profilePage.js';
import TripPlansPicker from './tripPlansPickerTest.js';
import KonfiguratorLoader from './konfiguratorLoader.js';
import { PreConfigure } from './preConfigure.js';
import UnsplashPhotoTest from './unsplashPhotoTest.js';
import AttractionsMap from './attractionMap.js';
import { Privacy } from './privacy.js';
import { JoiningToTrip } from './joiningToTrip.js';
import { RealizationPage } from './realizationPage.js';

const teksty = [
  { tyt: "Połącz twój pomysł z naszym doświadczeniem", tekst: "Dzięki konfiguratorowi wycieczek WycieczkaZKlasą, zrealizuj swój pomysł na wyjazd, nie martwiąc się niczym poza pasjonującym programem wyjazdu!" },
  { tyt: (<>Z naszym pilotem,<br /> lub z naszym pilotem?</>), tekst: "Wyjazd z pilotem czy bez niego? – to Twój wybór. Nie zostawimy Cię jednak samego, ponieważ nasza mobilna aplikacja poprowadzi Cię, w razie konieczności, przez każdy etap wyjazdu." },
  { tyt: "Połącz twój pomysł z naszym doświadczeniem", tekst: "Dzięki konfiguratorowi wycieczek WycieczkaZKlasą, zrealizuj swój pomysł na wyjazd, nie martwiąc się niczym poza pasjonującym programem wyjazdu!" },
  { tyt: "Połącz twój pomysł z naszym doświadczeniem", tekst: "Dzięki konfiguratorowi wycieczek WycieczkaZKlasą, zrealizuj swój pomysł na wyjazd, nie martwiąc się niczym poza pasjonującym programem wyjazdu!" },
];

const exampleTrips = [
  {
    id: 1,
    title: "Poznań",
    location: "Polska",
    duration: "4 dni / 3 noce",
    price: "700zł",
    badge: "Oferta specjalna",
    image: "../miasta/poznan.jpg",
    author: "Jan Wiczyński",
    tripId: ""
  },
  {
    id: 3,
    title: "Poznań",
    location: "Polska",
    duration: "4 dni / 3 noce",
    price: "700zł",
    badge: "Oferta specjalna",
    image: "../miasta/poznan2.jpg",
    author: "Jan Wiczyński"
  },
  {
    id: 4,
    title: "Poznań",
    location: "Polska",
    duration: "4 dni / 3 noce",
    price: "700zł",
    badge: "Oferta specjalna",
    image: "../miasta/poznan3.jpg",
    author: "Jan Wiczyński"
  },
  {
    id: 5,
    title: "Poznań",
    location: "Polska",
    duration: "4 dni / 3 noce",
    price: "700zł",
    badge: "Oferta specjalna",
    image: "../miasta/poznan3.jpg",
    author: "Jan Wiczyński"
  },
  {
    id: 2,
    title: "Poznań",
    location: "Polska",
    duration: "5 dni / 4 noce",
    price: "820zł",
    badge: "Bestseller",
    image: "../miasta/poznan1.jpg"
  },
  {
    id: 3,
    title: "Kraków",
    location: "Polska",
    duration: "5 dni / 4 noce",
    price: "820zł",
    badge: "Bestseller",
    image: "../miasta/krakow1.jpg"
  }
];

const miasta = [
  { nazwa: "Poznań", czas: "3" }, { nazwa: "Poznań", czas: "3" }, { nazwa: "Poznań", czas: "4" },
  { nazwa: "Poznań", czas: "5" }, { nazwa: "Poznań", czas: "6" },
];

function Menus() {
  const location = useLocation();
  const isHome = location.pathname === '/' || location.pathname === '';
  const isLogin = location.pathname === "/login";
  const variant = isHome ? 'glass' : 'white';

  return (
    <>
      {!isLogin ? (
        <>

          {/* TravelMenuUnified sam czyta user ze store – nie przekazujemy isLoggedIn <LiquidMenuBar />*/}
          <TravelMenuUnified variant={variant} />
        </>
      ) : null}
    </>
  );
}
function IfFooter() {
  const location = useLocation();
  const isHome = location.pathname === '/login' ;

  return (
    <>
      {
        isHome ? null: <PageFooter /> 
      }</>
  )
}

function App() {
  useEffect(() => {
    // Jednorazowe sprawdzenie istniejącej sesji (cookie) i hydratacja store
    initAuth();
  }, []);

  return (
    <>
      <div className="App">
        <Router>
          
          <Menus />
          <Routes>

            <Route path="/" element={<><HomePage trips={exampleTrips} /></>} />
            <Route path="/profil" element={<ProfilePage/>} />
            <Route path="/konfigurator-lounge" element={<PreConfigure/>} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/konfigurator"
              element={
                <KonfiguratorLoader/>
                
              }
            />
            <Route
              path="/konfigurator/old"
              element={
                <KreatorWyjazdu/>
                
              }
            />
            <Route
              path="privacy"
              element={
                <Privacy/>
                
              }
            />
             <Route
              path="realizacja"
              element={
                <RealizationPage/>
                
              }
            />
            <Route
              path="join-trip"
              element={
                <JoiningToTrip/>
                
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <IfFooter />
        </Router>
      </div>
    </>
  );
}

export default React.memo(App);
