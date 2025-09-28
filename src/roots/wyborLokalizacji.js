import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLoadScript } from '@react-google-maps/api';
import styled from 'styled-components';

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

// Picker wrapper for positioning popup
const PickerWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const PickerButton = styled.button`
  background-color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 15px;
  font-size: 12px;
  font-weight: 300;
  color: #484848;
  cursor: pointer;
  transition: background-color 0.3s ease, border-color 0.3s ease;
  &:hover { background-color: #f7f7f7; border-color: #c0c0c0; }
`;

// Popup panel styled: absolute under button, centered horizontally
const ContainerGen = styled.div`
  position: absolute;
  top: calc(100% + 20px);
  left: 50%;
  transform: translateX(-50%);
  width: 300px;
  background-color: white;
  border: 1px solid #EEEEEE;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 20px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  z-index: 9999;

  .searchBox {
    display: flex;
    align-items: center;
    padding: 2px 5px;
    border-radius: 100000px;
    background-color: #f2f2f2;
  }
  .searchBox input {
    width: 200px;
    box-sizing: border-box;
    border: none;
    outline: none;
    padding: 5px 15px;
    border-radius: 100000px;
    font-weight: 300;
    font-size: 12px;
    background-color: #f2f2f2;
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
    width: 100%;
    max-height: 300px;
    overflow-y: auto;
    background-color: #fafafa;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    padding: 10px;
    gap: 5px;
  }
`;

const SuggestionWrapper = styled.div`
  margin-bottom: 5px;
`;

const libraries = ['places'];
const GOOGLE_MAPS_API_KEY = "AIzaSyAHz9AkyQMxwpBkoMrOMuJUYqXuO09BdMk";

export const MapLocationPicker = ({ setStartLok }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState(null);
  const [isContainerOpen, setIsContainerOpen] = useState(false);
  const pickerRef = useRef(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const fetchSuggestions = useCallback(() => {
    if (!query || !isLoaded) {
      setSuggestions([]);
      return;
    }
    const service = new window.google.maps.places.AutocompleteService();
    service.getPlacePredictions({ input: query }, (predictions, status) => {
      if (status !== window.google.maps.places.PlacesServiceStatus.OK || !predictions) {
        setSuggestions([]);
      } else {
        setSuggestions(predictions);
      }
    });
  }, [query, isLoaded]);

  useEffect(() => {
    const timer = setTimeout(() => { }, 300);
    return () => clearTimeout(timer);
  }, [query, fetchSuggestions]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsContainerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [pickerRef]);

  const handleSelectSuggestion = (suggestion) => {
    const { place_id, structured_formatting: { main_text, secondary_text } } = suggestion;
    const service = new window.google.maps.places.PlacesService(document.createElement('div'));
    service.getDetails({ placeId: place_id, fields: ['geometry'] }, (place, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && place && place.geometry) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setQuery(main_text);
        setSuggestions([]);
        setIsContainerOpen(false);
        setStartLok({
          title: main_text,
          subtitle: secondary_text,
          coords: { lat, lng }
        });
      } else {
        setError('Nie udało się pobrać szczegółów miejsca.');
      }
    });
  };

  if (loadError) return <div>Błąd ładowania mapy</div>;
  if (!isLoaded) return <div>Ładowanie map...</div>;

  return (
    <PickerWrapper ref={pickerRef}>
      <PickerButton onClick={() => setIsContainerOpen(prev => !prev)}>
        Lokalizacja początkowa: {query}
      </PickerButton>
      {isContainerOpen && (
        <ContainerGen>
          <div className='searchBox'>
            <input
              type="text"
              placeholder="Wpisz lokalizację..."
              value={query}
              onChange={e => { setQuery(e.target.value); setError(null); }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();      // żeby nie wysyłać formularza (gdybyś go miał)
                  fetchSuggestions();
                }
              }}
            />
            <div className='searchButton' onClick={fetchSuggestions}>
              <img width='100%' src="../icons/icon-search.svg" alt="search" />
            </div>
          </div>
          <div className='searchResults'>
            {suggestions.map(suggestion => (
              <SuggestionWrapper key={suggestion.place_id}>
                <WyszukiwanieRes
                  suggestion={suggestion}
                  onClick={() => handleSelectSuggestion(suggestion)}
                />
              </SuggestionWrapper>
            ))}
          </div>
        </ContainerGen>
      )}
    </PickerWrapper>
  );
};

export default MapLocationPicker;
