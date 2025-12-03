import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import {
    MapPin, Search, X, Calendar as CalendarIcon, Minus, Plus, Bus, Train, Car,
    Home, Building2, Star, Check, Map, ChevronLeft, ChevronRight, AlertCircle
} from 'lucide-react';

/* ===================== ANIMATIONS ===================== */
const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(58,126,126,.4); }
  50% { box-shadow: 0 0 0 8px rgba(58,126,126,0); }
`;
const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

/* ===================== STYLED ===================== */
const MainContainer = styled.div`
  width: 100%; min-height: 100vh; display: flex; flex-direction: column;
  align-items: center; justify-content: flex-start; background: #fff; padding: 0 16px;
`;
const ContentWrapper = styled.div`
  width: 90%; max-width: 1600px; display: flex; flex-direction: column; align-items: center;
`;
const GridContainer = styled.div`
  width: 100%; max-width: 1600px; display: grid; grid-template-columns: repeat(2,1fr);
  gap: 20px; margin-bottom: 32px;
  @media (max-width: 768px){ grid-template-columns: 1fr; }
`;
const ConfigBox = styled.div`
  width: 100%; display: flex; flex-direction: column;
  background: ${p => p.$isEmpty ? 'linear-gradient(90deg,#ffffff 0%,#f0fffe 50%,#ffffff 100%)' : '#fff'};
  background-size: 1000px 100%;
  animation: ${p => p.$isEmpty ? shimmer : 'none'} 3s infinite linear;
  box-shadow: 0 4px 20px rgba(3,0,46,${p => p.$isEmpty ? '0.15' : '0.1'});
  padding: 16px; box-sizing: border-box; border-radius: 12px;
  border: 2px solid ${p => p.$isEmpty ? '#3A7E7E' : '#f3f4f6'};
  position: relative; animation: ${p => p.$isEmpty ? pulse : 'none'} 2s infinite; transition: all .3s ease;
`;
export const BoxSubtitle = styled.div`
  font-family: Inter, sans-serif; font-size: 12px; font-weight: 500;
  color: ${p => p.$isEmpty ? '#3A7E7E' : '#606060'}; margin-bottom: 4px; display: flex; justify-content: space-between;
`;
export const RequiredBadge = styled.span`
  font-size: 10px; font-weight: 600; color: #fff;
  background: linear-gradient(135deg,#3A7E7E,#2C5F5F);
  padding: 2px 8px; border-radius: 6px; text-transform: uppercase; letter-spacing: .5px; animation: ${pulse} 2s infinite;
`;
export const BoxTitle = styled.div`
  font-family: Inter, sans-serif; font-size: 20px; font-weight: 600; margin-bottom: 12px; display: flex; gap: 8px;
  color: ${p => p.$isEmpty ? '#3A7E7E' : 'inherit'};
`;
const SearchInputWrapper = styled.div`
 position: relative; 
 width: 100%; `;
const SearchInputEl = styled.input`
  width: 100%; 
  height: 36px; 
  box-sizing: border-box;
  border: none; border-radius: 5px; padding: 0 36px;
  font-size: 14px; background: #fafafa; outline: none; color: #404040; font-family: Inter, sans-serif;
  &::placeholder { color: #9ca3af; } &:focus { background: #f3f4f6; }
`;
const IconButton = styled.button`
  position: absolute; background: transparent; border: none; cursor: pointer; padding: 4px; display: flex; align-items: center; color: #6b7280;
  &:hover{ color:#000; }
`;
const LeftIcon = styled(IconButton)` left:8px; top:50%; transform:translateY(-50%); `;
const RightIcon = styled(IconButton)` right:8px; top:50%; transform:translateY(-50%); `;
const SearchResults = styled.div`
  position: absolute; box-sizing: border-box;z-index: 50; width: 100%; margin-top: 4px; background: #fff; border: 1px solid #e5e7eb; 
  border-radius: 5px; box-shadow: 0 10px 25px rgba(0,0,0,.1); max-height: 240px; overflow-y: auto;
`;
const SearchResultItem = styled.button`
  width: 100%; padding: 12px 16px; text-align: left; border: none; background: #fff; cursor: pointer; display: flex; gap: 12px;
  border-bottom: 1px solid #f3f4f6; font-family: Inter, sans-serif; font-size: 14px;box-sizing: border-box;
  &:hover{ background:#f9fafb; } &:last-child{ border-bottom: none; }
`;
const SelectButton = styled.button`
  width: 100%; height: 36px; padding: 0 12px; text-align: left; background: #fafafa; border: none; border-radius: 10px;
  font-size: 14px; color:#374151; cursor: pointer; display:flex; align-items:center; justify-content: space-between; font-family: Inter,sans-serif;
  &:hover{ background:#f3f4f6; }
`;
const CounterWrapper = styled.div` display:flex; align-items:center; gap:12px; `;
const CounterButton = styled.button`
  width:36px; height:36px; display:flex; align-items:center; justify-content:center;
  background:${p => p.$primary ? '#000' : '#f3f4f6'}; color:${p => p.$primary ? '#fff' : '#000'};
  border:none; border-radius:10px; cursor:pointer;
`;
const CounterInput = styled.input`
  flex:1; height:36px; text-align:center; background:#fafafa; border:none; border-radius:10px; font-size:14px; outline:none; font-family:Inter,sans-serif;
`;
const Modal = styled.div`
  position:fixed; inset:0; background:rgba(0,0,0,.5);
  display:${p => p.$open ? 'flex' : 'none'}; align-items:center; justify-content:center; z-index:1000; padding:16px;
`;
const ModalContent = styled.div`
  background:#fff; border-radius:16px; padding:24px; max-width:${p => p.$maxWidth || '500px'}; width:100%; max-height:90vh; overflow-y:auto;
  box-shadow:0 20px 60px rgba(0,0,0,.3);
`;
const ModalHeader = styled.div` font-size:20px; font-weight:600; margin-bottom:20px; font-family: Inter,sans-serif; `;
const ModalGrid = styled.div` display:grid; grid-template-columns:repeat(2,1fr); gap:12px; `;
const OptionCard = styled.button`
  padding:16px; border:2px solid ${p => p.$selected ? '#000' : '#e5e7eb'}; border-radius:12px; background:${p => p.$selected ? '#f9fafb' : '#fff'};
  cursor:pointer; text-align:left; transition:all .2s; font-family:Inter,sans-serif;
  &:hover{ border-color:#000; }
`;
const OptionIconWrapper = styled.div` display:flex; align-items:start; justify-content:space-between; margin-bottom:8px; color:#374151; `;
const OptionName = styled.div` font-weight:600; font-size:14px; margin-bottom:4px; `;
const OptionDescription = styled.div` font-size:12px; color:#6b7280; margin-bottom:8px; `;
const StarsWrapper = styled.div` display:flex; gap:2px; `;
const CalendarWrapper = styled.div` background:#fff; padding:16px; border-radius:10px; `;
const CalendarHeader = styled.div` display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; `;
const CalendarTitle = styled.div` font-weight:600; font-family:Inter,sans-serif; `;
const CalendarGrid = styled.div` display:grid; grid-template-columns:repeat(7,1fr); gap:4px; `;
const CalendarDay = styled.button`
  aspect-ratio:1; border:none;
  background:${p => p.$selected ? '#000' : p.$today ? '#f3f4f6' : 'transparent'};
  color:${p => p.$selected ? '#fff' : p.$disabled ? '#d1d5db' : '#000'};
  border-radius:8px; cursor:${p => p.$disabled ? 'not-allowed' : 'pointer'}; font-family:Inter,sans-serif; font-size:14px;
`;
const CalendarDayName = styled.div` text-align:center; font-size:12px; font-weight:600; color:#6b7280; padding:8px 0; font-family:Inter,sans-serif; `;
const MapContainer = styled.div`
  width:100%; height:400px; border:2px solid #e5e7eb; border-radius:12px; overflow:hidden; margin-top:16px; position:relative;
`;
const MapLegend = styled.div`
  position:absolute; bottom:16px; left:16px; background:#fff; padding:8px 12px; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,.1);
  display:flex; align-items:center; gap:16px; font-size:12px; font-family:Inter,sans-serif; z-index:500;
`;
const LegendItem = styled.div` display:flex; align-items:center; gap:6px; `;
const LegendDot = styled.div` width:12px; height:12px; border-radius:50%; background:${p => p.$color}; border:2px solid #fff; `;
const ModalActions = styled.div` display:flex; justify-content:flex-end; gap:8px; margin-top:20px; `;
const Button = styled.button`
  padding:10px 20px; border-radius:8px; border:${p => p.$variant === 'outline' ? '2px solid #e5e7eb' : 'none'};
  background:${p => p.$variant === 'outline' ? '#fff' : '#000'}; color:${p => p.$variant === 'outline' ? '#000' : '#fff'};
  font-family:Inter,sans-serif; font-weight:500; cursor:pointer;
`;
const NavButton = styled.button`
  background:transparent; border:none; cursor:pointer; padding:4px; display:flex; align-items:center; color:#374151;
`;
const PlaceholderTab = styled.div`
  width:100%; max-width:1600px; background:#f9fafb; border:2px solid #e5e7eb; border-radius:12px; padding:32px; text-align:center; box-shadow:0 4px 20px rgba(3,0,46,.1);
  p{ color:#6b7280; font-family:Inter,sans-serif; }
`;

/* ===================== CHOICES ===================== */
const transportOptions = [
    { id: 0, name: 'Wynajęty autokar', description: 'Komfortowa podróż autokarem', icon: Bus },
    { id: 1, name: 'Pociąg', description: 'Szybka podróż koleją', icon: Train },
    { id: 2, name: 'Transport własny', description: 'Własny środek transportu', icon: Car },
];
const hotelOptions = [
    { id: 0, name: 'Hostele', description: 'Ekonomiczne zakwaterowanie', icon: Home, stars: 1 },
    { id: 1, name: 'Hotel 2/3*', description: 'Hotele 2/3 gwiazdkowe', icon: Building2, stars: 3 },
    { id: 2, name: 'Hotel Premium', description: 'Luksusowe zakwaterowanie', icon: Star, stars: 5 },
    { id: 3, name: 'Własny', description: 'Nocleg we własnym zakresie', icon: Star },
];

/* ===================== LOCATION SEARCH ===================== */
export const LocationSearch = ({ value, onChange, placeholder, onMapClick }) => {
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchTimeoutRef = useRef(null);
    const wrapperRef = useRef(null);

    useEffect(() => {
        const onDoc = (e) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setShowResults(false); };
        document.addEventListener('mousedown', onDoc);
        return () => document.removeEventListener('mousedown', onDoc);
    }, []);

    const searchLocation = async (q) => {
        if (!q || q.trim().length < 2) { setSearchResults([]); setShowResults(false); return; }
        setIsSearching(true);
        try {
            const resp = await fetch(`http://localhost:5006/searchCityNew?query=${encodeURIComponent(q.trim())}`);
            if (!resp.ok) throw new Error('Bad response from /searchCity');
            const data = await resp.json(); // [{ id, nazwa, wojewodztwo, kraj, priority, location:{lat,lng}}]
            setSearchResults(Array.isArray(data) ? data : []);
            setShowResults(true);
        } catch (e) {
            console.error(e);
            setSearchResults([]); setShowResults(false);
        } finally {
            setIsSearching(false);
        }
    };

    const handleInputChange = (e) => {
        const newValue = e.target.value;
        onChange({ nazwa: newValue, location: { lat: null, lng: null } });
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = setTimeout(() => searchLocation(newValue), 300);
    };

    const handleSelectLocation = (item) => {
        onChange({
            nazwa: item.nazwa,
            location: { lat: item.location?.lat ?? null, lng: item.location?.lng ?? null },
        });
        setShowResults(false);
    };

    const handleClear = () => {
        onChange({ nazwa: '', location: { lat: null, lng: null } });
        setSearchResults([]); setShowResults(false);
    };

    return (
        <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
            <SearchInputWrapper>
                <LeftIcon><Search size={16} /></LeftIcon>
                <SearchInputEl value={value} onChange={handleInputChange} placeholder={placeholder} />
                {value ? (
                    <RightIcon onClick={handleClear}><X size={16} /></RightIcon>
                ) : onMapClick ? (
                    <RightIcon onClick={onMapClick}><Map size={16} /></RightIcon>
                ) : null}
            </SearchInputWrapper>

            {showResults && searchResults.length > 0 && (
                <SearchResults>
                    {searchResults.map((item) => (
                        <SearchResultItem
                            key={`${item.id}-${item.nazwa}-${item.wojewodztwo}`}
                            onClick={() => handleSelectLocation(item)}
                        >
                            <MapPin size={16} style={{ marginTop: 2, flexShrink: 0 }} />
                            <span>
                                {item.nazwa}{item.wojewodztwo ? `, ${item.wojewodztwo}` : ''}{item.kraj ? `, ${item.kraj}` : ''}
                            </span>
                        </SearchResultItem>
                    ))}
                </SearchResults>
            )}

            {isSearching && (
                <SearchResults>
                    <div style={{ padding: 16, textAlign: 'center', color: '#6b7280' }}>
                        Wyszukiwanie...
                    </div>
                </SearchResults>
            )}
        </div>
    );
};

/* ===================== CALENDAR ===================== */
const SimpleCalendar = ({ selectedDate, onSelect }) => {
    const [currentMonth, setCurrentMonth] = useState(selectedDate ? new Date(selectedDate) : new Date());
    const monthNames = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
    const dayNames = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'];

    const getDaysInMonth = (date) => {
        const y = date.getFullYear(); const m = date.getMonth();
        const firstDay = new Date(y, m, 1); const lastDay = new Date(y, m + 1, 0);
        const daysInMonth = lastDay.getDate();
        let fdw = firstDay.getDay(); fdw = fdw === 0 ? 6 : fdw - 1;
        const days = [];
        for (let i = 0; i < fdw; i++) days.push({ day: '', disabled: true });
        for (let d = 1; d <= daysInMonth; d++) days.push({ day: d, disabled: false });
        return days;
    };

    const days = getDaysInMonth(currentMonth);
    const prev = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    const next = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    const pick = (day) => {
        if (day.disabled) return;
        onSelect(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day.day));
    };
    const isSelected = (day) => {
        if (!selectedDate || day.disabled) return false;
        const s = new Date(selectedDate);
        return s.getDate() === day.day && s.getMonth() === currentMonth.getMonth() && s.getFullYear() === currentMonth.getFullYear();
    };
    const isToday = (day) => {
        if (day.disabled) return false;
        const t = new Date();
        return t.getDate() === day.day && t.getMonth() === currentMonth.getMonth() && t.getFullYear() === currentMonth.getFullYear();
    };

    return (
        <CalendarWrapper>
            <CalendarHeader>
                <NavButton onClick={prev}><ChevronLeft size={20} /></NavButton>
                <CalendarTitle>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</CalendarTitle>
                <NavButton onClick={next}><ChevronRight size={20} /></NavButton>
            </CalendarHeader>
            <CalendarGrid>
                {dayNames.map((n) => <CalendarDayName key={n}>{n}</CalendarDayName>)}
                {days.map((d, i) => (
                    <CalendarDay key={i} onClick={() => pick(d)} $selected={isSelected(d)} $today={isToday(d)} $disabled={d.disabled}>
                        {d.day}
                    </CalendarDay>
                ))}
            </CalendarGrid>
        </CalendarWrapper>
    );
};

const DatePicker = ({ value, onChange, placeholder }) => {
    const [open, setOpen] = useState(false);
    const fmt = (date) => !date ? '' : new Intl.DateTimeFormat('pl-PL', { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
    return (
        <>
            <SelectButton onClick={() => setOpen(true)}>
                <span style={{ color: value ? '#374151' : '#9ca3af' }}>{value ? fmt(value) : placeholder}</span>
                <CalendarIcon size={16} style={{ color: '#9ca3af' }} />
            </SelectButton>
            <Modal $open={open} onClick={() => setOpen(false)}>
                <ModalContent onClick={(e) => e.stopPropagation()}>
                    <ModalHeader>Wybierz datę</ModalHeader>
                    <SimpleCalendar selectedDate={value} onSelect={(d) => { onChange(d); setOpen(false); }} />
                </ModalContent>
            </Modal>
        </>
    );
};

/* ===================== TRANSPORT/HOTEL SELECTORS ===================== */
const TransportSelector = ({ value, onChange }) => {
    const [open, setOpen] = useState(false);
    const selected = transportOptions.find(o => o.id === value);
    return (
        <>
            <SelectButton onClick={() => setOpen(true)}>
                <span>{selected ? selected.name : 'Wybierz transport'}</span>
                <span style={{ color: '#9ca3af' }}>▼</span>
            </SelectButton>
            <Modal $open={open} onClick={() => setOpen(false)}>
                <ModalContent onClick={(e) => e.stopPropagation()}>
                    <ModalHeader>Wybierz standard transportu</ModalHeader>
                    <ModalGrid>
                        {transportOptions.map((o) => {
                            const Icon = o.icon;
                            return (
                                <OptionCard key={o.id} $selected={value === o.id} onClick={() => { onChange(o.id); setOpen(false); }}>
                                    <OptionIconWrapper><Icon size={32} />{value === o.id && <Check size={20} />}</OptionIconWrapper>
                                    <OptionName>{o.name}</OptionName>
                                    <OptionDescription>{o.description}</OptionDescription>
                                </OptionCard>
                            );
                        })}
                    </ModalGrid>
                </ModalContent>
            </Modal>
        </>
    );
};

const HotelSelector = ({ value, onChange }) => {
    const [open, setOpen] = useState(false);
    const selected = hotelOptions.find(o => o.id === value);
    return (
        <>
            <SelectButton onClick={() => setOpen(true)}>
                <span>{selected ? selected.name : 'Wybierz nocleg'}</span>
                <span style={{ color: '#9ca3af' }}>▼</span>
            </SelectButton>
            <Modal $open={open} onClick={() => setOpen(false)}>
                <ModalContent onClick={(e) => e.stopPropagation()}>
                    <ModalHeader>Wybierz standard noclegu</ModalHeader>
                    <ModalGrid>
                        {hotelOptions.map((o) => {
                            const Icon = o.icon;
                            return (
                                <OptionCard key={o.id} $selected={value === o.id} onClick={() => { onChange(o.id); setOpen(false); }}>
                                    <OptionIconWrapper><Icon size={32} />{value === o.id && <Check size={20} />}</OptionIconWrapper>
                                    <OptionName>{o.name}</OptionName>
                                    <OptionDescription>{o.description}</OptionDescription>
                                    {o.stars && (
                                        <StarsWrapper>
                                            {Array.from({ length: o.stars }).map((_, i) => <Star key={i} size={12} fill="#fbbf24" color="#fbbf24" />)}
                                        </StarsWrapper>
                                    )}
                                </OptionCard>
                            );
                        })}
                    </ModalGrid>
                </ModalContent>
            </Modal>
        </>
    );
};

/* ===================== MAP ===================== */
const MapView = ({ startLat, startLon, destLat, destLon }) => {
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const [L, setL] = useState(null);
    const markersRef = useRef([]);

    useEffect(() => { (async () => { const leaflet = await import('leaflet'); setL(leaflet.default); })(); }, []);
    useEffect(() => {
        if (!L || !mapRef.current || map) return;
        const m = L.map(mapRef.current).setView([52.2297, 21.0122], 5);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(m);
        setMap(m);
        return () => { m && m.remove(); };
    }, [L]);

    useEffect(() => {
        if (!map || !L) return;
        markersRef.current.forEach(layer => layer.remove());
        markersRef.current = [];
        const bounds = [];

        if (startLat && startLon) {
            const startIcon = L.divIcon({
                className: 'custom-marker',
                html: `<div style="background-color:#22c55e;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.3);">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="white" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>` , iconSize: [32, 32], iconAnchor: [16, 32]
            });
            const mk = L.marker([parseFloat(startLat), parseFloat(startLon)], { icon: startIcon }).addTo(map);
            mk.bindPopup('<b>Miejsce startowe</b>');
            markersRef.current.push(mk);
            bounds.push([parseFloat(startLat), parseFloat(startLon)]);
        }

        if (destLat && destLon) {
            const destIcon = L.divIcon({
                className: 'custom-marker',
                html: `<div style="background-color:#ef4444;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.3);">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="white" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>` , iconSize: [32, 32], iconAnchor: [16, 32]
            });
            const mk = L.marker([parseFloat(destLat), parseFloat(destLon)], { icon: destIcon }).addTo(map);
            mk.bindPopup('<b>Miejsce docelowe</b>');
            markersRef.current.push(mk);
            bounds.push([parseFloat(destLat), parseFloat(destLon)]);
        }

        if (startLat && startLon && destLat && destLon) {
            const pl = L.polyline([[parseFloat(startLat), parseFloat(startLon)], [parseFloat(destLat), parseFloat(destLon)]],
                { color: '#000', weight: 2, opacity: .6, dashArray: '10,10' }).addTo(map);
            markersRef.current.push(pl);
        }

        if (bounds.length) map.fitBounds(bounds, { padding: [50, 50] });
    }, [map, L, startLat, startLon, destLat, destLon]);

    return (
        <MapContainer>
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
            <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
            <MapLegend>
                <LegendItem><LegendDot $color="#22c55e" /><span>Start</span></LegendItem>
                <LegendItem><LegendDot $color="#ef4444" /><span>Cel</span></LegendItem>
            </MapLegend>
        </MapContainer>
    );
};

/* ===================== MAP MODAL ===================== */
const MapModal = ({ open, onClose, location, otherLocation, onSave }) => {
    const [tempLocation, setTempLocation] = useState(location);

    useEffect(() => { setTempLocation(location); }, [location]);

    return (
        <Modal $open={open} onClick={onClose}>
            <ModalContent $maxWidth="700px" onClick={(e) => e.stopPropagation()}>
                <ModalHeader>Wybierz lokalizację</ModalHeader>

                <LocationSearch
                    value={tempLocation?.nazwa || ''}
                    onChange={(sel) => setTempLocation(sel)} // sel: { nazwa, location: { lat, lng } }
                    placeholder="Wpisz miasto..."
                />

                {tempLocation?.location?.lat && tempLocation?.location?.lng && (
                    <MapView
                        startLat={tempLocation.location.lat}
                        startLon={tempLocation.location.lng}
                        destLat={otherLocation?.location?.lat}
                        destLon={otherLocation?.location?.lng}
                    />
                )}

                <ModalActions>
                    <Button $variant="outline" onClick={onClose}>Anuluj</Button>
                    <Button onClick={() => { onSave(tempLocation); onClose(); }}>Zapisz</Button>
                </ModalActions>
            </ModalContent>
        </Modal>
    );
};

/* ===================== MAIN ===================== */
export const PreConfigureSketch = ({
    // external values
    miejsceDocelowe,
    miejsceStartowe,
    dataWyjazdu,
    dataPowrotu,
    liczbaUczestnikow,
    liczbaOpiekunow,
    standardHotelu,
    standardTransportu,
    // external setters
    setMiejsceDocelowe,
    setMiejsceStartowe,
    setDataWyjazdu,
    setDataPowrotu,
    setLiczbaUczestnikow,
    setLiczbaOpiekunow,
    setStandardHotelu,
    setStandardTransportu,
}) => {
    const [selectedMenu, setSelectedMenu] = useState(0);
    const [showMapModal, setShowMapModal] = useState(null);
    return (
        <MainContainer>
            <ContentWrapper>
                {selectedMenu === 0 && (
                    <GridContainer>
                        {/* Miejsce docelowe */}
                        <ConfigBox $isEmpty={!miejsceDocelowe?.nazwa || !miejsceDocelowe?.location?.lat}>
                            <BoxSubtitle $isEmpty={!miejsceDocelowe?.nazwa || !miejsceDocelowe?.location?.lat}>
                                Dokąd wybierzemy się tym razem?
                                {(!miejsceDocelowe?.nazwa || !miejsceDocelowe?.location?.lat) && <RequiredBadge>Wymagane</RequiredBadge>}
                            </BoxSubtitle>
                            <BoxTitle $isEmpty={!miejsceDocelowe?.nazwa || !miejsceDocelowe?.location?.lat}>
                                Miejsce docelowe
                                {(!miejsceDocelowe?.nazwa || !miejsceDocelowe?.location?.lat) && <AlertCircle size={18} color="#3A7E7E" />}
                            </BoxTitle>

                            <LocationSearch
                                value={miejsceDocelowe?.nazwa || ''}
                                onChange={(sel) => setMiejsceDocelowe(sel)}
                                placeholder="Wpisz miejsce docelowe"
                                onMapClick={() => setShowMapModal('dest')}
                            />
                        </ConfigBox>

                        {/* Miejsce startowe */}
                        <ConfigBox $isEmpty={!miejsceStartowe?.nazwa || !miejsceStartowe?.location?.lat}>
                            <BoxSubtitle $isEmpty={!miejsceStartowe?.nazwa || !miejsceStartowe?.location?.lat}>
                                Gdzie zaczynamy naszą przygodę?
                                {(!miejsceStartowe?.nazwa || !miejsceStartowe?.location?.lat) && <RequiredBadge>Wymagane</RequiredBadge>}
                            </BoxSubtitle>
                            <BoxTitle $isEmpty={!miejsceStartowe?.nazwa || !miejsceStartowe?.location?.lat}>
                                Miejsce startowe
                                {(!miejsceStartowe?.nazwa || !miejsceStartowe?.location?.lat) && <AlertCircle size={18} color="#3A7E7E" />}
                            </BoxTitle>

                            <LocationSearch
                                value={miejsceStartowe?.nazwa || ''}
                                onChange={(sel) => setMiejsceStartowe(sel)}
                                placeholder="Wpisz miejsce startowe"
                                onMapClick={() => setShowMapModal('start')}
                            />
                        </ConfigBox>

                        {/* Data wyjazdu */}
                        <ConfigBox $isEmpty={!dataWyjazdu}>
                            <BoxSubtitle $isEmpty={!dataWyjazdu}>
                                Kiedy jedziemy?
                                {!dataWyjazdu && <RequiredBadge>Wymagane</RequiredBadge>}
                            </BoxSubtitle>
                            <BoxTitle $isEmpty={!dataWyjazdu}>
                                Data wyjazdu
                                {!dataWyjazdu && <AlertCircle size={18} color="#3A7E7E" />}
                            </BoxTitle>
                            <DatePicker value={dataWyjazdu} onChange={setDataWyjazdu} placeholder="Wybierz datę wyjazdu" />
                        </ConfigBox>

                        {/* Data powrotu */}
                        <ConfigBox $isEmpty={!dataPowrotu}>
                            <BoxSubtitle $isEmpty={!dataPowrotu}>
                                Niestety powrót też jest ważny...
                                {!dataPowrotu && <RequiredBadge>Wymagane</RequiredBadge>}
                            </BoxSubtitle>
                            <BoxTitle $isEmpty={!dataPowrotu}>
                                Data powrotu
                                {!dataPowrotu && <AlertCircle size={18} color="#3A7E7E" />}
                            </BoxTitle>
                            <DatePicker value={dataPowrotu} onChange={setDataPowrotu} placeholder="Wybierz datę powrotu" />
                        </ConfigBox>

                        {/* Liczba uczestników */}
                        <ConfigBox>
                            <BoxSubtitle>Uuu, sporo nas</BoxSubtitle>
                            <BoxTitle>Liczba uczestników</BoxTitle>
                            <CounterWrapper>
                                <CounterButton onClick={() => setLiczbaUczestnikow(Math.max(1, (liczbaUczestnikow || 1) - 1))}><Minus size={16} /></CounterButton>
                                <CounterInput type="number" value={liczbaUczestnikow ?? 1} onChange={(e) => setLiczbaUczestnikow(Math.max(1, parseInt(e.target.value) || 1))} min="1" />
                                <CounterButton $primary onClick={() => setLiczbaUczestnikow((liczbaUczestnikow || 1) + 1)}><Plus size={16} /></CounterButton>
                            </CounterWrapper>
                        </ConfigBox>

                        {/* Liczba opiekunów */}
                        <ConfigBox>
                            <BoxSubtitle>Każdy opiekun to skarb</BoxSubtitle>
                            <BoxTitle>Liczba opiekunów</BoxTitle>
                            <CounterWrapper>
                                <CounterButton onClick={() => setLiczbaOpiekunow(Math.max(0, (liczbaOpiekunow || 0) - 1))}><Minus size={16} /></CounterButton>
                                <CounterInput type="number" value={liczbaOpiekunow ?? 0} onChange={(e) => setLiczbaOpiekunow(Math.max(0, parseInt(e.target.value) || 0))} min="0" />
                                <CounterButton $primary onClick={() => setLiczbaOpiekunow((liczbaOpiekunow || 0) + 1)}><Plus size={16} /></CounterButton>
                            </CounterWrapper>
                        </ConfigBox>

                        {/* Standard noclegu */}
                        <ConfigBox>
                            <BoxSubtitle>Sen to podstawa udanego wyjazdu</BoxSubtitle>
                            <BoxTitle>Standard noclegu</BoxTitle>
                            <HotelSelector value={standardHotelu} onChange={setStandardHotelu} />
                        </ConfigBox>

                        {/* Standard transportu */}
                        <ConfigBox>
                            <BoxSubtitle>Teleportacja? Jeszcze nie teraz...</BoxSubtitle>
                            <BoxTitle>Standard transportu</BoxTitle>
                            <TransportSelector value={standardTransportu} onChange={setStandardTransportu} />
                        </ConfigBox>
                    </GridContainer>
                )}

                {selectedMenu === 1 && (
                    <PlaceholderTab><p>Zakładka Uczestnicy - w przygotowaniu</p></PlaceholderTab>
                )}
                {selectedMenu === 2 && (
                    <PlaceholderTab><p>Zakładka Płatności - w przygotowaniu</p></PlaceholderTab>
                )}
            </ContentWrapper>

            {/* Map modals */}
            <MapModal
                open={showMapModal === 'dest'}
                onClose={() => setShowMapModal(null)}
                location={miejsceDocelowe}
                otherLocation={miejsceStartowe}
                onSave={setMiejsceDocelowe}
            />
            <MapModal
                open={showMapModal === 'start'}
                onClose={() => setShowMapModal(null)}
                location={miejsceStartowe}
                otherLocation={miejsceDocelowe}
                onSave={setMiejsceStartowe}
            />
        </MainContainer>
    );
};
