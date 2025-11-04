import logo from './logo.svg';
import './App.css';
import React from 'react';
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

const teksty = [
  { tyt: "Połącz twój pomysł z naszym doświadczeniem", tekst: "Dzięki konfiguratorowi wycieczek WycieczkaZKlasą, zrealizuj swój pomysł na wyjazd, nie martwiąc się niczym poza pasjonującym programem wyjazdu!" },
  { tyt: (<>Z naszym pilotem,<br /> lub z naszym pilotem?</>), tekst: "Wyjazd z pilotem czy bez niego? – to Twój wybór. Nie zostawimy Cię jednak samego, ponieważ nasza mobilna aplikacja poprowadzi Cię, w razie konieczności, przez każdy etap wyjazdu." },
  { tyt: "Połącz twój pomysł z naszym doświadczeniem", tekst: "Dzięki konfiguratorowi wycieczek WycieczkaZKlasą, zrealizuj swój pomysł na wyjazd, nie martwiąc się niczym poza pasjonującym programem wyjazdu!" },
  { tyt: "Połącz twój pomysł z naszym doświadczeniem", tekst: "Dzięki konfiguratorowi wycieczek WycieczkaZKlasą, zrealizuj swój pomysł na wyjazd, nie martwiąc się niczym poza pasjonującym programem wyjazdu!" },

]
const exampleTrips = [
  {
    id: 1,
    title: "Poznań",
    location: "Polska",
    duration: "4 dni / 3 noce",
    price: "700zł",
    badge: "Oferta specjalna",
    image: "../miasta/poznan.jpg",
    author: "Jan Wiczyński"
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

const miasta = [{ nazwa: "Poznań", czas: "3" }, { nazwa: "Poznań", czas: "3" }, { nazwa: "Poznań", czas: "4" }, { nazwa: "Poznań", czas: "5" }, { nazwa: "Poznań", czas: "6" },];

function App() {
  return (
    <>
      <div className="App">
        
        <HomePage trips={exampleTrips} />
        <LiquidMenuBar/>
        <PageFooter/>
        {/* 
        


       <KonfiguratorMain miejsceDoceloweInit={{
          idGoogle: "ChIJvZz0W9c0JkcR8E13wKgL4Ks",
          location: {
            lat: 52.4064,
            lng: 16.9252
          }
        }} />
            
        <KreatorWyjazdu />
        <LoginPage/>
        
        <KonfiguratorWyjazdu />
        
        */}

        {/* 
            <KreatorWyjazdu />
        <Slider />
        <CitiesList />
        <SearchInput miasta={miasta} />
        <CitiesList tyt="Najpopularniejsze kierunki" />

        <div className='infotiles'>

          <InfoTile tekst={teksty[0]} />
          <InfoTile wariant="b" tekst={teksty[1]} />
          <InfoTile wariant="c" tekst={teksty[0]} />
          <InfoTile wariant="d" tekst={teksty[0]} />

        </div>
        <SlideKonfiguracja />
        <Footer />
          
      <div class="blob">Treść&nbsp;…</div>
<WasabiUploadTest/>
<AttractionImageSearch/>
      <TestRequestow/>
      

        
        <MenuRadio />
        <KreatorWyjazdu />

        <Slider />
        <CitiesList />
        <SearchInput miasta={miasta} />
        <CitiesList tyt="Najpopularniejsze kierunki" />

        <div className='infotiles'>

          <InfoTile tekst={teksty[0]} />
          <InfoTile wariant="b" tekst={teksty[1]} />
          <InfoTile wariant="c" tekst={teksty[0]} />
          <InfoTile wariant="d" tekst={teksty[0]} />

        </div>
        <SlideKonfiguracja />
        <Footer />
<AttractionImageSearch/>

<DodawaniePanel/> 

        <ChromeTabs />
     
     
     <TopKreatorSlider/>
     
     
      <WyjazdFormularz/>
            <FormularzBottom/>

       <HotelsSearch/>

     
       
      <Slider/>
      <CitiesList/>
      <SearchInput miasta={miasta}/>
      <CitiesList tyt="Najpopularniejsze kierunki"/>
    
      <div className='infotiles'>
      
      <InfoTile  tekst={teksty[0]}/>
      <InfoTile wariant="b" tekst={teksty[1]}/>
      <InfoTile wariant="c" tekst={teksty[0]}/>
      <InfoTile wariant="d" tekst={teksty[0]}/>

      </div>
      <SlideKonfiguracja/>
      <Footer/>
    
      
      
      
      
    */}
      </div>

    </>
  );
}

export default React.memo(App);
