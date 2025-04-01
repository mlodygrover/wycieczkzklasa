import React, { useRef, useState, useEffect } from 'react';
import styled from 'styled-components';
import { Campfire } from './roots/campfire';
import { CitySpot, ArrowButton } from './roots/CitySpot';
import { CityResult } from './roots/cityresult';
import { FormularzRightWyjazd, FormularzWyborMiasta } from './roots/formularz-wyjazd';
export const Slider = () =>{
    const ButtonSlider = () => {
        return (
          <StyledWrapperButtonSlider>
            <button className="boton-elegante">Zaplanuj Wasz wyjazd!</button>
          </StyledWrapperButtonSlider>
        );
      }
      
      const StyledWrapperButtonSlider = styled.div`
        
        .boton-elegante {
          padding: 15px 30px;
          border: 2px solid #2c2c2c;
          background-color: #1a1a1a;
          color: #ffffff;
          font-size: 1.2rem;
          cursor: pointer;
          border-radius: 30px;
          transition: all 0.4s ease;
          outline: none;
          position: relative;
          overflow: hidden;
          font-weight: 400;
          transform: scale(0.7);
        }
      
        .boton-elegante::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.25) 0%,
            rgba(255, 255, 255, 0) 70%
          );
          transform: scale(0);
          transition: transform 0.5s ease;
        }
      
        .boton-elegante:hover::after {
          transform: scale(4);
        }
      
        .boton-elegante:hover {
          border-color: #666666;
          background: #292929;
        }`;
      
      
    return(
        <StyledSlider>
            <div className='Slider-theme'>
            <div className='Slider-mainbox' >
                
                <div className='Slider-campfire-box'><Campfire/></div>
                
                <a>
                <span className='Slider-mainbox-title'>Wasza zielona szkoła,<br></br> według waszych oczekiwań<br></br></span>
                <span className='Slider-mainbox-content'>Przy pomocy najnowszych technologii oraz sztucznej inteligencji, niech naszym jedynym ograniczeniem będzie kreatywność!</span>
                <ButtonSlider/>
                </a>
            </div>
            </div>
        </StyledSlider>
        
    )

}
const StyledSlider = styled.div`
width: 100%;
    .Slider-theme{
    width: 100%;
    background-image: url("/background-snow.webp");
    height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
    
}
.Slider-mainbox{

    width: fit-content;
    height: fit-content;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0px

}
.Slider-mainbox a{
    
    width: fit-content;
    display: flex;
    align-items: center ;
    flex-direction: column;
    vertical-align: middle;
}
.Slider-campfire-box{
    width: 400px;
}
.Slider-mainbox-content{
    
    font-size: 20px;
    color: #424242; 
    font-weight: 300;
    
}

.Slider-mainbox-title{
    
    font-size: 44px;
    color: #000000; 
    font-weight: 600;
    
}
@media screen and (max-width: 800px) {
    
    .Slider-theme{
    height: 360px;
    }
    .Slider-mainbox{
        margin-top: -200px;
        flex-direction: column;
    }
    .Slider-campfire-box{
        transform: scale(0.6);
        transform-origin: center bottom;
    }
    
    .Slider-mainbox-title{
        font-size: 30px;
        color: black;
        width: 100vw;
        margin-top: -30px;
        
    }
    .Slider-mainbox-content{
        display: none;
    }
    
}


`


export const CitiesList = ({miasta, tyt="Odkryj z nami nowe kierunki!"}) => {

    miasta = [

        "miasta/poznan",
        "miasta/krakow",
        "miasta/poznan",
        "miasta/poznan",
        "miasta/krakow",
        "miasta/poznan",
        "miasta/poznan",
        "miasta/krakow",
        "miasta/poznan",
        "miasta/poznan"
    
    ]

    const miasta_tekst = [
        ["Poznań",  "Dynamiczne miasto w zachodniej Polsce, słynące z malowniczego Starego Rynku z kolorowymi kamienicami i koziołkami na wieży ratusza"],
        ["Kraków",  "Historyczne miasto w Polsce, znane z pięknego Rynku Głównego, zabytkowego Wawelu czy klimatycznej dzielnicy Kazimierz"],
        ["Poznań",  "Dynamiczne miasto w zachodniej Polsce, słynące z malowniczego Starego Rynku z kolorowymi kamienicami i koziołkami na wieży ratusza"],
        ["Poznań",  "Dynamiczne miasto w zachodniej Polsce, słynące z malowniczego Starego Rynku z kolorowymi kamienicami i koziołkami na wieży ratusza"],
        ["Poznań",  "Dynamiczne miasto w zachodniej Polsce, słynące z malowniczego Starego Rynku z kolorowymi kamienicami i koziołkami na wieży ratusza"],
        ["Kraków",  "Historyczne miasto w Polsce, znane z pięknego Rynku Głównego, zabytkowego Wawelu czy klimatycznej dzielnicy Kazimierz"],
        ["Poznań",  "Dynamiczne miasto w zachodniej Polsce, słynące z malowniczego Starego Rynku z kolorowymi kamienicami i koziołkami na wieży ratusza"],
        ["Poznań",  "Dynamiczne miasto w zachodniej Polsce, słynące z malowniczego Starego Rynku z kolorowymi kamienicami i koziołkami na wieży ratusza"],
        ["Kraków",  "Historyczne miasto w Polsce, znane z pięknego Rynku Głównego, zabytkowego Wawelu czy klimatycznej dzielnicy Kazimierz"],
        ["Poznań",  "Dynamiczne miasto w zachodniej Polsce, słynące z malowniczego Starego Rynku z kolorowymi kamienicami i koziołkami na wieży ratusza"],
        
        

    ]

  const scrollRef = useRef(null);

  const scrollLeft = () => {
    scrollRef.current.scrollBy({ left: window.innerWidth > 800 ? -280 : -205, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current.scrollBy({ left: window.innerWidth > 800 ? 280 : 205,  behavior: "smooth" });
  };

  return (
    
    <StyledCitiesList>
      
      <div className='divcont--intersecter'>
      <div className='intersecter1'>{tyt}</div>
      <div className='divcont'>
      
      <ArrowButton onclick={scrollLeft}/>
      <div className="CitiesList-mainbox" ref={scrollRef}>
      {miasta.map((zdj, index) => (
          <CitySpot zdj={zdj} key={index} tyt={miasta_tekst[index][0]} opis={miasta_tekst[index][1]}/>
          
        ))}
        
      </div>
      <ArrowButton onclick={scrollRight} a={true}/>
      </div>

      </div>
      
      
      
      

    </StyledCitiesList>

  );
};
const StyledCitiesList = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  padding-top: 10px;
  


  .intersecter1{
    width: 100%;
    font-weight: 300;
    text-align: left;
    margin-left: 50px;
    font-size: 42px;
    
}
.divcont--intersecter{
    
    width: fit-content;
}

  .divcont{
  display: flex;
  flex-direction: row;
  align-items: center;
  max-width: 90vw;
  margin: auto;
  
  }
  .CitiesList-mainbox {
    display: flex;
    flex-direction: row;
    gap: 10px;
    margin: 5px;
    width: min(90vw, 1200px);
    max-width: fit-content;

    overflow-x: auto;
    -ms-overflow-style: none; /* IE i Edge */
    scrollbar-width: none; /* Firefox */
  }

  .CitiesList-mainbox::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }

  .scroll-btn {
    
    top: 50%;
    transform: translateY(-50%);
    background: rgba(0, 0, 0, 0.5);
    border: none;
    color: white;
    font-size: 1.5rem;
    padding: 0.5rem 1rem;
    cursor: pointer;
    z-index: 10;
  }

    
  @media screen and (max-width: 800px){
     .intersecter1{
     margin: 5px;
     font-size: 20px;
     font-weight: 400;
}
     .divcont--intersecter{
        margin-top: 30px;
     }
  }
  
  
`;



  
const getCityImageUrl = (cityName) => {
    const normalizedName = cityName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    return `miasta/${normalizedName}.jpg`;
  };
  
export const SearchInput = ({ miasta }) => {
    // Ustaw domyślną tablicę, jeśli miasta nie są przekazane jako props
    miasta =
      miasta ||
      [
        { nazwa: "Poznań" },
        { nazwa: "Poznań" },
        { nazwa: "Poznań" },
        { nazwa: "Poznań" },
        { nazwa: "Kraków" },
      ];
  
    const [searchTerm, setSearchTerm] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const containerRef = useRef(null);
  
    const handleChange = (e) => {
      const value = e.target.value;
      setSearchTerm(value);
      setShowSuggestions(true); // Upewnij się, że sugestie będą widoczne po zmianie
      if (value.trim() !== "") {
        const filtered = miasta.filter((city) =>
          city.nazwa.toLowerCase().includes(value.toLowerCase())
        );
        setSuggestions(filtered);
      } else {
        setSuggestions([]);
      }
    };
  
    const handleSelectSuggestion = (suggestion) => {
      setSearchTerm(suggestion.nazwa);
      setShowSuggestions(false);
    };
  
    // Ukryj sugestie po kliknięciu poza kontenerem
    useEffect(() => {
      const handleClickOutside = (e) => {
        if (containerRef.current && !containerRef.current.contains(e.target)) {
          setShowSuggestions(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
  
    return (
        <div className='search-theme'>
      <StyledSearchInput ref={containerRef}>
        <div className='intersecter1'>Wszystkie drogi prowadzą do...</div>
        <div className='intersecter2'>Wyszukaj kierunek swojej wycieczki, zobacz dostępne plany lub utwórz swój od podstaw!</div>
        <div className="search">
          <input
            placeholder="Wyszukaj miasto"
            type="text"
            value={searchTerm}
            onChange={handleChange}
            onClick={() => setShowSuggestions(true)}
          />
          <button type="submit">Szukaj</button>
          {searchTerm.trim() !== "" && showSuggestions && (
            suggestions.length === 0 ? (
              <ul className="suggestions">
                <li>Brak kierunków pasujących do wyszukiwania...</li>
              </ul>
            ) : (
              <ul className="suggestions">
                {suggestions.map((suggestion, index) => {
                  const miasto = {
                    nazwa: suggestion.nazwa,
                    czas: suggestion.czas,
                    zdj: getCityImageUrl(suggestion.nazwa),
                  };
                  return (
                    <li key={index} onClick={() => handleSelectSuggestion(suggestion)}>
                      <CityResult miasto={miasto} />
                    </li>
                  );
                })}
              </ul>
            )
          )}
        </div>
      </StyledSearchInput>
      </div>
    );
  };
const StyledSearchInput = styled.div`
  margin: 50px;
  max-width: 1400px;



  .intersecter1{
    width: 100vw;
    font-weight: 400;
    text-align: left;
    margin-left: 50px;
    font-size: 42px;}
    .intersecter2{
    width: 100vw;
    font-weight: 300;
    text-align: left;
    margin-left: 50px;
    font-size: 22px;
    }
    @media screen and (max-width: 800px){
     .intersecter2{
     font-size: 10px;
     max-width: 200px;
    }
     .intersecter1{
     font-size: 22px;
     font-weight: 400;
     }
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
  
    /* Styl dla listy sugestii */
    .suggestions {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background-color: #fff;
      border: 1px solid #ccc;
      border-top: none;
      border-bottom: none;
      list-style: none;
      margin: 0;
      padding: 0;
      max-height: 200px;
      overflow-y: auto;
      z-index: 10;
      margin-top: 10px;
    }
  
    .suggestions li {
      padding: 10px;
      cursor: pointer;
    }
  
    .suggestions li:hover {
      background-color: #f2f2f2;
    }
  
    @media screen and (max-width: 800px) {
      .search input[type="text"] {
        width: 200px;
      }
      .search input[type="text"]:focus {
        outline: 1px solid #F42F25;
      }
    }
  `;
  

export const MenuRadio = () => {
        return (
          <StyledRadioMenu>
            <div className="menu">
              <a href="#" className="link">
                <span className="link-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width={192} height={192} fill="currentColor" viewBox="0 0 256 256">
                    <rect width={256} height={256} fill="none" />
                    <path d="M213.3815,109.61945,133.376,36.88436a8,8,0,0,0-10.76339.00036l-79.9945,72.73477A8,8,0,0,0,40,115.53855V208a8,8,0,0,0,8,8H208a8,8,0,0,0,8-8V115.53887A8,8,0,0,0,213.3815,109.61945Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={16} />
                  </svg>
                </span>
                <span className="link-title">Home</span>
              </a>
              <a href="#" className="link">
                <span className="link-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width={192} height={192} fill="currentColor" viewBox="0 0 256 256">
                    <rect width={256} height={256} fill="none" />
                    <polyline points="76.201 132.201 152.201 40.201 216 40 215.799 103.799 123.799 179.799" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={16} />
                    <line x1={100} y1={156} x2={160} y2={96} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={16} />
                    <path d="M82.14214,197.45584,52.201,227.397a8,8,0,0,1-11.31371,0L28.603,215.11268a8,8,0,0,1,0-11.31371l29.94113-29.94112a8,8,0,0,0,0-11.31371L37.65685,141.65685a8,8,0,0,1,0-11.3137l12.6863-12.6863a8,8,0,0,1,11.3137,0l76.6863,76.6863a8,8,0,0,1,0,11.3137l-12.6863,12.6863a8,8,0,0,1-11.3137,0L93.45584,197.45584A8,8,0,0,0,82.14214,197.45584Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={16} />
                  </svg>
                </span>
                <span className="link-title">Games</span>
              </a>
              <a href="#" className="link">
                <span className="link-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width={192} height={192} fill="currentColor" viewBox="0 0 256 256">
                    <rect width={256} height={256} fill="none" />
                    <path d="M45.42853,176.99811A95.95978,95.95978,0,1,1,79.00228,210.5717l.00023-.001L45.84594,220.044a8,8,0,0,1-9.89-9.89l9.47331-33.15657Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={16} />
                    <line x1={96} y1={112} x2={160} y2={112} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={16} />
                    <line x1={96} y1={144} x2={160} y2={144} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={16} />
                  </svg>
                </span>
                <span className="link-title">Chat</span>
              </a>
              <a href="#" className="link">
                <span className="link-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width={192} height={192} fill="currentColor" viewBox="0 0 256 256">
                    <rect width={256} height={256} fill="none" />
                    <circle cx={116} cy={116} r={84} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={16} />
                    <line x1="175.39356" y1="175.40039" x2="223.99414" y2="224.00098" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={16} />
                  </svg>
                </span>
                <span className="link-title">Search</span>
              </a>
              <a href="#" className="link">
                <span className="link-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width={192} height={192} fill="currentColor" viewBox="0 0 256 256">
                    <rect width={256} height={256} fill="none" />
                    <circle cx={128} cy={96} r={64} fill="none" stroke="currentColor" strokeMiterlimit={10} strokeWidth={16} />
                    <path d="M30.989,215.99064a112.03731,112.03731,0,0,1,194.02311.002" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={16} />
                  </svg>
                </span>
                <span className="link-title">Profile</span>
              </a>
            </div>
          </StyledRadioMenu>
        );
      }
      
const StyledRadioMenu = styled.div`
        .menu {
          padding: 0.5rem;
          background-color: #fff;
          position: relative;
          display: flex;
          justify-content: center;
          border-radius: 15px;
          box-shadow: 0 10px 25px 0 rgba(#000, 0.075);
        }
      
        .link {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          width: 70px;
          height: 50px;
          border-radius: 8px;
          position: relative;
          z-index: 1;
          overflow: hidden;
          transform-origin: center left;
          transition: width 0.2s ease-in;
          text-decoration: none;
          color: inherit;
          &:before {
            position: absolute;
            z-index: -1;
            content: "";
            display: block;
            border-radius: 8px;
            width: 100%;
            height: 100%;
            top: 0;
            transform: translateX(100%);
            transition: transform 0.2s ease-in;
            transform-origin: center right;
            background-color: #eee;
          }
      
          &:hover,
          &:focus {
            outline: 0;
            width: 130px;
      
            &:before,
            .link-title {
              transform: translateX(0);
              opacity: 1;
            }
          }
        }
      
        .link-icon {
          width: 28px;
          height: 28px;
          display: block;
          flex-shrink: 0;
          left: 18px;
          position: absolute;
          svg {
            width: 28px;
            height: 28px;
          }
        }
      
        .link-title {
          transform: translateX(100%);
          transition: transform 0.2s ease-in;
          transform-origin: center right;
          display: block;
          text-align: center;
          text-indent: 28px;
          width: 100%;
        }`;
      

  
export const Footer = () => {
          return (
            <FooterContainer>
              <LicenseText>
                <p>
                  © 2025 Ashon-G (Vashon Gonzales)
                </p>
                <p>
                  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
                </p>
                <p>
                  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
                </p>
                <p>
                  THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
                </p>
              </LicenseText>
            </FooterContainer>
          );
        };
        
const FooterContainer = styled.footer`
          background-color: #f5f5f5;
          padding: 20px;
          text-align: center;
          font-size: 0.8em;
          color: #555;
          width: 100%;
        `;
        
const LicenseText = styled.div`
          max-width: 800px;
          margin: 0 auto;
          line-height: 1.5;
        `;
        
   
        
export const RadioStars = ({ onChange, value }) => {
          return (
            <StyledWrapper>
              <div className="rating">
                <input
                  value="3"
                  name="rate"
                  id="star5"
                  type="radio"
                  onChange={() => onChange(3)}
                  checked={value === 3}
                />
                <label title="3 stars" htmlFor="star5"></label>
                <input
                  value="2"
                  name="rate"
                  id="star4"
                  type="radio"
                  onChange={() => onChange(2)}
                  checked={value === 2}
                />
                <label title="2 stars" htmlFor="star4"></label>
                <input
                  value="1"
                  name="rate"
                  id="star3"
                  type="radio"
                  onChange={() => onChange(1)}
                  checked={value === 1}
                />
                <label title="1 star" htmlFor="star3"></label>
              </div>
            </StyledWrapper>
          );
       
};
        
        
        
const StyledWrapper = styled.div`
          .rating:not(:checked) > input {
            position: absolute;
            appearance: none;
          }
        
          .rating:not(:checked) > label {
            float: right;
            cursor: pointer;
            font-size: 20px;
            color: #666;
          }
        
          .rating:not(:checked) > label:before {
            content: '★';
          }
        
          .rating > input:checked + label:hover,
          .rating > input:checked + label:hover ~ label,
          .rating > input:checked ~ label:hover,
          .rating > input:checked ~ label:hover ~ label,
          .rating > label:hover ~ input:checked ~ label {
            color: #e58e09;
          }
        
          .rating:not(:checked) > label:hover,
          .rating:not(:checked) > label:hover ~ label {
            color: #ff9e0b;
          }
        
          .rating > input:checked ~ label {
            color: #ffa723;
          }`;
        
        

        
  
          const StyledWyjazdFormularz = styled.div`
          margin-top: 50px;
          display: flex;
          flex-direction: row;
          gap: 20px;
        `;
        
        export const WyjazdFormularz = () => {
          return (
            <StyledWyjazdFormularz>
              <FormularzWyborMiasta />
              <FormularzRightWyjazd />
            </StyledWyjazdFormularz>
          );
        };