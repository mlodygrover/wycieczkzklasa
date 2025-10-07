import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLoadScript } from '@react-google-maps/api';
import styled from 'styled-components';
import Loader from './loader.js';

const reverseGeocode = async (lat, lng) => {
  const res = await fetch(`http://localhost:5002/reverse-geocode?lat=${lat}&lng=${lng}`);
  if (!res.ok) throw new Error(`Błąd HTTP ${res.status}`);
  const data = await res.json();
  return data.address;
};

const WyszukiwanieRes = ({ suggestion, onClick }) => {
  const suggestionPic = "../icons/icon-location.svg";
  return (
    <div
      className="wyszukiwanieResBoxGroup"
      onClick={onClick}
      style={{ cursor: "pointer" }}
    >
      <img width="23px" src={suggestionPic} alt="location icon" />
      <div className="wyszukiwanieResBox">
        <div className="ResBoxTitle">
          {suggestion.structured_formatting.main_text}
        </div>
        <div className="ResBoxSubtitle">
          {suggestion.structured_formatting.secondary_text}
        </div>
      </div>
    </div>
  );
};

const PickerWrapper = styled.div`
  position: relative;
  display: inline-block;
  width: 100%;
`;

const ContainerGen = styled.div`
  height: 90%;
  margin: auto;
  width: 100%;

  .searchBox {
    display: flex;
    align-items: center;
    padding: 2px 5px;
    border-radius: 100000px;
    background-color: #f2f2f2;
  }
  .searchBox input {
    width: 90%;
    box-sizing: border-box;
    border: none;
    outline: none;
    padding: 5px 15px;
    border-radius: 100000px;
    font-weight: 300;
    font-size: 12px;
    background-color: #f2f2f2;
    cursor: text;
  }
  .searchBox .searchButton {
    background-color: black;
    width: 20px;
    height: 20px;
    padding: 5px;
    border-radius: 20000px;
    transition: 0.3s ease-in-out;
    cursor: pointer;
  }
  .searchBox .searchButton:hover { background-color: #F42582; }

  .searchResults {
    position: absolute;
    top: 40px;
    left: -10px;
    width: 100%;
    max-height: 300px;
    overflow-y: auto;
    background-color: #fafafa;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    padding: 10px;
    gap: 5px;
    border: 1px solid lightgray;
  }
`;

const SuggestionWrapper = styled.div`
  margin-bottom: 5px;
`;

const libraries = ['places'];
const GOOGLE_MAPS_API_KEY = "AIzaSyAHz9AkyQMxwpBkoMrOMuJUYqXuO09BdMk";

export const DodawanieAtrakcji = ({ setStartLok }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState(null);
  const [isContainerOpen, setIsContainerOpen] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const pickerRef = useRef(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const fetchSuggestions = useCallback(() => {
    if (!query || !isLoaded) {
      setSuggestions([]);
      setIsLoadingSuggestions(false);
      return;
    }
    setIsLoadingSuggestions(true);
    const service = new window.google.maps.places.AutocompleteService();
    service.getPlacePredictions({ input: query }, (predictions, status) => {
      if (status !== window.google.maps.places.PlacesServiceStatus.OK || !predictions) {
        setSuggestions([]);
      } else {
        setSuggestions(predictions);
      }
      setIsLoadingSuggestions(false);
    });
  }, [query, isLoaded]);

  // debounce 2 sekundy
  useEffect(() => {
    if (!isContainerOpen) return;
    setIsLoadingSuggestions(true);
    const timer = setTimeout(fetchSuggestions, 2000);
    return () => clearTimeout(timer);
  }, [query, fetchSuggestions, isContainerOpen]);

  // zamykanie po kliknięciu poza
  useEffect(() => {
    const handleClickOutside = e => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setIsContainerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // tutaj handleSelectSuggestion jest async, by można było await reverseGeocode
  const handleSelectSuggestion = async suggestion => {
    const { place_id, structured_formatting: { main_text, secondary_text } } = suggestion;
    const service = new window.google.maps.places.PlacesService(document.createElement('div'));
    service.getDetails(
      { placeId: place_id, fields: ['geometry'] },
      async (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place.geometry) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();

          let address = '';
          try {
            console.log("TEST8", lat, lng)
            address = await reverseGeocode(lat, lng);
          } catch (e) {
            console.error('Reverse geocode error', e);
          }

          setQuery(main_text);
          setSuggestions([]);
          setIsContainerOpen(false);
          setStartLok({
            title: main_text,
            subtitle: secondary_text,
            address,            // tu korzystamy z odpowiedzi endpointa
            coords: { lat, lng }
          });
        } else {
          setError('Nie udało się pobrać szczegółów miejsca.');
        }
      }
    );
  };

  if (loadError) return <div>Błąd ładowania mapy</div>;
  if (!isLoaded) return <div>Ładowanie map...</div>;

  return (
    <PickerWrapper ref={pickerRef}>
      <ContainerGen>
        <div className='searchBox'>
          <input
            type="text"
            placeholder="Wpisz lokalizację..."
            value={query}
            onChange={e => { setQuery(e.target.value); setError(null); }}
            onFocus={() => setIsContainerOpen(true)}
          />
          <div className='searchButton'
            onClick={() => { setIsContainerOpen(true); fetchSuggestions(); }}>
            <img width='100%' src="../icons/icon-search.svg" alt="search" />
          </div>
        </div>

        {isContainerOpen && (
          isLoadingSuggestions

            ?
            <div className='searchResults'>
              <Loader />
            </div>
            : <div className='searchResults'>
              {suggestions.map(s => (
                <SuggestionWrapper key={s.place_id}>
                  <WyszukiwanieRes
                    suggestion={s}
                    onClick={() => handleSelectSuggestion(s)}
                  />
                </SuggestionWrapper>
              ))}
            </div>
        )}
      </ContainerGen>
    </PickerWrapper>
  );
};

export default DodawanieAtrakcji;
