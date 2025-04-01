import React, { useState, useEffect, useMemo } from 'react';
import styled, {keyframes, css} from 'styled-components';
import { InputText1 } from './inputtext1';
import { RadioStars, Slider } from '../components';
import { TransportChoice } from './TransportChoice';
import Checkbox1 from './checkbox1';
import ChoiceInput1 from './choiceinput1';
import { ArrowButton } from './CitySpot';
import { usePopularAttractions } from './formularz-bottom';



/*const activityList = [
    {"nazwa": "Bazylika Archikatedralna Świętych Apostołów Piotra i Pawła", "adres": "Ostrów Tumski 17, 61-109 Poznań",  "koszt": "4,50 zł (bilet normalny), 3,50 zł (bilet ulgowy)"}, {"nazwa": "Brama Poznania ICHOT", "adres": "ul. Gdańska 2, 61-123 Poznań", "czasZwiedzania": "około 2 godzin", "koszt": "20 zł (bilet normalny), 15 zł (bilet ulgowy)"}, {"nazwa": "Palmiarnia Poznańska", "adres": "ul. Matejki 18, 60-767 Poznań", "czasZwiedzania": "około 1,5 godziny", "koszt": "19 zł (bilet normalny), 15 zł (bilet ulgowy)"}, {"nazwa": "Muzeum Narodowe w Poznaniu", "adres": "Al. Marcinkowskiego 9, 61-745 Poznań", "czasZwiedzania": "około 2 godzin", "koszt": "13 zł (bilet normalny), 8 zł (bilet ulgowy)"}, {"nazwa": "Rogalowe Muzeum Poznania", "adres": "Stary Rynek 41, 61-772 Poznań", "czasZwiedzania": "około 1 godziny", "koszt": "od 24 zł (bilet normalny), od 21 zł (bilet ulgowy)"}, {"nazwa": "Muzeum Sztuk Użytkowych", "adres": "Góra Przemysła 1, 61-768 Poznań", "czasZwiedzania": "około 1,5 godziny", "koszt": "15 zł (bilet normalny), 10 zł (bilet ulgowy)"}, {"nazwa": "Muzeum Archeologiczne w Poznaniu", "adres": "ul. Wodna 27, 61-781 Poznań", "czasZwiedzania": "około 1,5 godziny", "koszt": "10 zł (bilet normalny), 6 zł (bilet ulgowy)"}, {"nazwa": "Muzeum Instrumentów Muzycznych", "adres": "Stary Rynek 45, 61-772 Poznań", "czasZwiedzania": "około 1,5 godziny", "koszt": "12 zł (bilet normalny), 8 zł (bilet ulgowy)"}, {"nazwa": "Muzeum Powstania Wielkopolskiego 1918-1919", "adres": "Stary Rynek 3, 61-772 Poznań", "czasZwiedzania": "około 1,5 godziny", "koszt": "12 zł (bilet normalny), 6 zł (bilet ulgowy)"}, {"nazwa": "Muzeum Etnograficzne", "adres": "ul. Grobla 25, 61-859 Poznań", "czasZwiedzania": "około 1,5 godziny", "koszt": "12 zł (bilet normalny), 8 zł (bilet ulgowy)"}
    

]*/
let activityList = [];
const basicActivityList = [

    "Spacer", "Przerwa", "Czas wolny", "Czas na posiłek"

]


const ActivityElement = ({ element, addingFunction }) => {
    return(
        <div className='ActivityElementMainbox'>
            <div className='akapit'>
                <img src="icons/icon-attraction.svg" width={'20px'}/>
                <div className='para t'>
                <a>Atrakcja</a>
                {element.name ? element.name : "błąd nazwy"}
                </div>
                
            </div>
            <div className='akapit'>
            <img src="icons/icon-adres.svg" width={'20px'}/>
                <div className='para t'>
                    <a>Adres</a>
                    {element.address ? element.address : "błąd adresu"}
                </div>
            </div>
            <div className='akapit'>
                <img src="icons/icon-time.svg" width={'20px'}/>
                <div className='para t'>
                    <a>Czas zwiedzania</a>
                    {element.czasZwiedzania ? element.czasZwiedzania : "1 godzina" }
                </div>
            </div>
            
            <div className='koszt'>
                
                <div className='akapit'>
                    <img src="icons/icon-ticket.svg" width={'20px'}/>
                    <div className='para t'>
                        <a>Koszt zwiedzania</a>
                        {"20zł"}
                    </div>
                </div>
                

            </div>
            <button type="submit" onClick={() => addingFunction(element)}>
                <img src="icons/icon-choice.svg" width={'14px'} color={'white'} /> Wybierz
            </button>
        </div>

    )
}

const ActivityList = ({ activityList = [], addingFunction }) => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (activityList.length > 0) {
            setIsLoading(false);
        }
    }, [activityList]);

    return (
        <>
            {isLoading ? (
                <p>Ładowanie...</p>
            ) : activityList.length > 0 ? (
                activityList.map((obj, index) => (
                    <ActivityElement key={index} element={obj} addingFunction={() => addingFunction(obj)} />
                ))
            ) : (
                <p>Brak dostępnych aktywności</p>
            )}
        </>
    );
};
const BasicActivityElement = ({element}) =>{
    const [timeValue, setTimeValue] = useState(50);
    const src = `icons/${element}.svg`;
    const [prevLoc, setPrevLoc] = useState(1);
    const [nextLoc, setNextLoc] = useState(1);
     useEffect(() => {
        if (prevLoc === 2) {
            setNextLoc(2);
        } 
    }, [prevLoc]);
    useEffect(() =>{
        if(nextLoc === 1)
        {
            setPrevLoc(1);
        }
    }, [nextLoc])
    
    
    return(
        <StyledBasicActivityElement>
        <div className='ActivityElementMainbox b'>
            <div className='subbox'>
                <div className='basiccactivity-icon'>
                    <img src={src} width='100%'/>
                </div>
                <div className='basicactivity-text'>
                    <a className='tyt'>{element}</a>
                    <div className='SettingTime'>
                        Ustaw czas aktywności
                        <a>
                            <input 
                            type="range" 
                            min="5" 
                            max="180" 
                            step="5"
                            value={timeValue} 
                            onChange={(e) => setTimeValue(e.target.value)} // Aktualizacja wartości
                            />
                            {timeValue} min.
                        </a>
                        <div className='basicactivity-start'>
                            <div className='tyt'>Start</div>
                            <form>
                            <a><input type="radio" name="option" value="1" checked={prevLoc === 1} onChange={() => setPrevLoc(1)}/> Poprzednia lokalizacja</a>
                            <a><input type="radio" name="option" value="2" checked={prevLoc === 2} onChange={() => setPrevLoc(2)}/> Następna lokalizacja</a>
                            </form>
                        </div>
                        <div className='basicactivity-start'>
                        <div className='tyt'>Koniec</div>
                            <form>
                            <a><input type="radio" name="option" value="1" checked={nextLoc === 1} onChange={() => setNextLoc(1)}/> Poprzednia lokalizacja</a>
                            <a><input type="radio" name="option" value="2" checked={nextLoc === 2} onChange={() => setNextLoc(2)}/> Następna lokalizacja</a>
                            </form>
                        </div>

                    
                    </div>

                
                </div>

            </div>
            <button type="submit"><img src="icons/icon-choice.svg" width={'14px'} color={'white'} />   Wybierz</button>

        </div>
        </StyledBasicActivityElement>
    )

}
const StyledBasicActivityElement = styled.div`
.basicactivity-text{
        flex: 4;
        
    }
    .SettingTime{
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 10px;

    }
    .SettingTime a{
        
        display: flex;
        align-items: center;
        justify-content: space-around;
    }
    .basicactivity-text .tyt{
        font-size: 24px;
        font-weight: 300;
    }
    .basiccactivity-icon{
        flex: 1;
        display: flex;
        align-items: center;
    }
    .basicactivity-text input[type="range"] {
        appearance: none; /* Usunięcie domyślnego stylu przeglądarki */
        width: 100px;
        height: 6px;
        background: #000; /* Czarny pasek suwaka */
        border-radius: 3px;
        outline: none;
        cursor: pointer;
    }
    
    /* Styl wskaźnika (kółko -> kreska) dla Chrome/Safari */
    .basicactivity-text input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 4px; /* Szerokość kreski */
        height: 25px; /* Wysokość kreski */
        background: #fff; /* Biała kreska */
        border-radius: 2px;
        cursor: pointer;
        transition: 0.3s ease-in-out;
    }
    
    /* Styl wskaźnika (kółko -> kreska) dla Firefox */
    .basicactivity-text input[type="range"]::-moz-range-thumb {
        width: 4px;
        height: 25px;
        background: #fff;
        border-radius: 2px;
        cursor: pointer;
    }
    
    /* Efekt hover na suwaku */
    .basicactivity-text input[type="range"]:hover {
        opacity: 0.9;
    }
    
    /* Efekt hover na kresce */
    .basicactivity-text input[type="range"]::-webkit-slider-thumb:hover {
        background: #bbb; /* Zmiana koloru kreski na jaśniejszy przy najechaniu */
    }
    
    .basicactivity-text input[type="range"]::-moz-range-thumb:hover {
        background: #bbb;
    }

    .basicactivity-text input[type="radio"] {
        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: none;
        width: 12px;
        height: 12px;
        border: 1px solid black;
        border-radius: 50%;
        background-color: white;
        display: inline-block;
        position: relative;
        cursor: pointer;
    }

    .basicactivity-text input[type="radio"]:checked {
        background-color: black;
        border: 2px solid white; /* Biały pasek */
        outline: 1px solid black;
    }
    .basicactivity-start{
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 10px;
        font-size: 14px;

    }
    .basicactivity-start .tyt{
        font-size: 14px;
        font-weight: 400;   
        width: 50px;
    }
    .basicactivity-start form{
        display: flex;
        flex-direction: column;
        text-align: right;
        justify-content: end;
        align-items: start;
        font-size: 12px;
        
        min-width: 170px;
    }
    @media screen and (max-width: 800px) {
        .para.t{
            font-size: 14px;
            
        }
        .para.t a{
            font-size: 11px;
        }
    }

`
const BasicActivityList = ({basicActivityList}) =>{
    return (
        <>
            {basicActivityList.map((obj, index) => (
                <BasicActivityElement key={index} element={obj} />
            ))}
        </>
    );

}

export const AddActivityButton = ({ addingFunction }) => {
    const [czyWyswietlac, setCzyWyswietlac] = useState(false);
    const [chosenTyp, setChosenTyp] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredList, setFilteredList] = useState(basicActivityList);
    const [activityList, setActivityList] = useState([]);
    const { attractions, fetchAttractions, loading, error } = usePopularAttractions("Poznań");

    useEffect(() => {
        fetchAttractions("Poznań");
    }, []);

    useEffect(() => {

        setActivityList(attractions.attractions);
    }, [attractions]);

    // 🔹 **Nowy useEffect** → Automatyczna aktualizacja `filteredList` po załadowaniu `activityList`
    useEffect(() => {
        if (!loading) {
            setFilteredList(chosenTyp === 1 ? basicActivityList : activityList);
        }
    }, [activityList, loading, chosenTyp]);

    const handleSearch = () => {
        if (!searchQuery) {
            setFilteredList(chosenTyp === 1 ? basicActivityList : activityList);
            return;
        }
    
        if (chosenTyp === 1) {
            setFilteredList(basicActivityList.filter(item =>
                item.toLowerCase().includes(searchQuery.toLowerCase())
            ));
        } else if (chosenTyp === 2) {
            setFilteredList(activityList.filter(item =>
                item.name?.toLowerCase().includes(searchQuery.toLowerCase())
            ));
        }
    };

    const handleClickOutside = (event) => {
        if (event.target.closest('.wyborAtrakcjiMainbox') === null && event.target.closest('.NewActivityBox') === null) {
            setCzyWyswietlac(false);
        }
    };

    useEffect(() => {
        if (czyWyswietlac) {
            setTimeout(() => {
                document.addEventListener('click', handleClickOutside);
            }, 0);
        } else {
            document.removeEventListener('click', handleClickOutside);
        }
        return () => document.removeEventListener('click', handleClickOutside);
    }, [czyWyswietlac]);

    const ustawTablice = (val) => {
        setChosenTyp(val);
        setFilteredList(val === 1 ? basicActivityList : activityList);
    };

    return (
        <StyledActivity>
            <div className='NewActivityBox'>
                <button onClick={() => setCzyWyswietlac(prev => !prev)}>+ Dodaj nową aktywność</button>
            </div>
            {czyWyswietlac && (
                <div className='wyborAtrakcjiMainbox'>
                    <a className='wyborAtrakcji-title'>Wybierz aktywność</a>
                    <div className='menu'>
                        <div className='menu-el' style={{ color: chosenTyp === 1 ? "black" : "" }} onClick={() => ustawTablice(1)}>Podstawowe</div>
                        <div className='menu-el' style={{ color: chosenTyp === 2 ? "black" : "" }} onClick={() => ustawTablice(2)}>Atrakcje</div>
                        <div className='menu-el' style={{ color: chosenTyp === 3 ? "black" : "" }} onClick={() => ustawTablice(3)}>Własne</div>
                    </div>
                    <div className="search">
                        <input placeholder="Wyszukaj aktywność" type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        <button type="submit" onClick={handleSearch}>Szukaj</button>
                    </div>
                    {chosenTyp === 1 ? <BasicActivityList basicActivityList={filteredList} /> : ""}
                    {chosenTyp === 2 ? <ActivityList activityList={filteredList} addingFunction={addingFunction} /> : ""}
                </div>
            )}
        </StyledActivity>
    );
};

const StyledActivity = styled.div`
    width: 100vw;
    .NewActivityBox button{
        width: 300px;
        height: 40px;
        border-radius: 35px;
        border: none;
        color: white;
        background-color: black;
        cursor: pointer;
        font-size: 14px;
        margin: 5px;
    }
    .NewActivityBox button:hover{
        background-color: #F42582;
        transition: 0.3s ease-in-out;
        
    }
    .wyborAtrakcjiMainbox{
        width: 90%;
        max-width: 600px;
        margin: auto;
        background-color: rgb(246, 246, 246);
        border-radius: 10px;

    }
    .wyborAtrakcji-title{
        font-size: 40px;
        font-weight: 200;
    }
    .wyborAtrakcjiMainbox .menu{
        
        display: flex;
        flex-direction: row;
        gap: 10px;
        font-size: 18px;
        margin: auto;
        color: rgb(129, 129, 129);
        width: 90%;
        align-items: center;
        justify-content: center;
        border-bottom: 1px solid rgb(129, 129, 129);
        padding: 10px;
        
    }
    .wyborAtrakcjiMainbox .menu .menu-el:hover{
        color: black;
        cursor: pointer;
        transition: color 0.5s;
    }
    
    .search {
      display: inline-block;
      position: relative;
      margin: 30px;
      width: fit-content;
    }
  
    .search input[type="text"] {
      width: 400px;
      padding: 10px;
      border: none;
      border-radius: 20px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
  
    .search input[type="text"]:focus {
      outline: 0.2px solid #F42F25;
      transition: outline 0.2s ease-in-out;
    }
  
    .search button[type="submit"] {
      background-color: #000000;
      border: none;
      color: #fff;
      cursor: pointer;
      padding: 10px 20px;
      border-radius: 20px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      position: absolute;
      top: 0;
      right: 0;
      transition: 0.4s ease;
    }
  
    .search button[type="submit"]:hover {

      background-color: #F42582;
    }
  


`