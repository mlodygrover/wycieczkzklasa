import React, { useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import {
    LayoutDashboard,
    MapPin,
    FileText,
    MessageSquare,
    Users,
    Settings,
    Search,
    Bell,
    LogOut,
    Edit3,
    CheckCircle,
    Filter,
    ChevronRight,
    Plus,
    Trash2,
    Save,
    X,
    Target,
    Menu as MenuIcon,
    Globe,
    Calendar,
    DollarSign,
    User,
    ListFilter
} from 'lucide-react';

// --- CONFIG ---
const port = process.env.REACT_APP__SERVER_API_SOURCE || "https://wycieczkzklasa.onrender.com";
const portacc = process.env.REACT_APP_API_SOURCE || "https://api.draftngo.com";

// --- HELPER FUNCTIONS ---
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 99999;
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pl-PL');
};

// Formatowanie daty do input type="date" (YYYY-MM-DD)
const isoDateToInput = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
};

const getTripStatus = (status) => {
    switch (status) {
        case 0: return { label: 'Szkic / Planowanie', color: '#64748b', bg: '#f1f5f9' };
        case 1: return { label: 'Zgłoszono do realizacji', color: '#d97706', bg: '#fffbeb' };
        case 2: return { label: 'W trakcie płatności', color: '#0284c7', bg: '#e0f2fe' };
        case 3: return { label: 'W trakcie weryfikacji', color: '#16a34a', bg: '#dcfce7' };
        case 4: return { label: 'Zaplanowany...', color: '#16a34a', bg: '#dcfce7' };

        case 5: return { label: 'Trwa...', color: '#dc2626', bg: '#fee2e2' };

        case 6: return { label: 'Zakończony', color: '#dc2626', bg: '#fee2e2' };
        case 9: return { label: 'Anulowano', color: '#dc2626', bg: '#fee2e2' };
        default: return { label: 'Nieznany', color: '#64748b', bg: '#f1f5f9' };
    }
};

// --- STYLED COMPONENTS ---

const Container = styled.div`
  display: flex;
  width: 100%;
  min-height: 100vh;
  background-color: #f8f9fa;
  color: #000000;
  font-family: 'Inter', sans-serif;
  box-sizing: border-box;
  position: relative;
`;

const SidebarOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 99;
  display: ${props => props.$isOpen ? 'block' : 'none'};
`;

const Sidebar = styled.aside`
  width: 260px;
  background-color: #ffffff;
  border-right: 1px solid #e5e5e5;
  display: flex;
  flex-direction: column;
  padding: 24px;
  flex-shrink: 0;
  height: 100vh;
  position: sticky;
  top: 0;
  z-index: 100;
  transition: transform 0.3s ease-in-out;

  @media (max-width: 1024px) {
    position: fixed;
    transform: ${props => props.$isOpen ? 'translateX(0)' : 'translateX(-100%)'};
    box-shadow: 4px 0 10px rgba(0,0,0,0.1);
  }
`;

const Logo = styled.div`
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 40px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const NavList = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
`;

const NavItem = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  border: none;
  background-color: ${props => props.$active ? '#000000' : 'transparent'};
  color: ${props => props.$active ? '#ffffff' : '#555555'};
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;

  &:hover {
    background-color: ${props => props.$active ? '#000000' : '#e0e0e0'};
    color: ${props => props.$active ? '#ffffff' : '#000000'};
  }
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  width: 100%;
`;

const TopBar = styled.header`
  height: 70px;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e5e5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  position: sticky;
  top: 0;
  z-index: 90;

  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;

const MenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin-right: 12px;
  
  @media (max-width: 1024px) {
    display: flex;
  }
`;

const PageTitle = styled.h1`
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const ContentScroll = styled.div`
  padding: 32px;
  flex: 1;
  overflow-y: auto;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const SectionContainer = styled.div`
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    background: transparent;
    border: none;
    box-shadow: none;
  }
`;

const FiltersContainer = styled.div`
  padding: 24px;
  border-bottom: 1px solid #e5e5e5;
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  align-items: flex-end;
  background: #fff;
  border-radius: 12px 12px 0 0;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    padding: 16px;
    border-radius: 12px;
    border: 1px solid #e5e5e5;
    margin-bottom: 20px;
  }
`;

const DesktopTableWrapper = styled.div`
  display: block;
  overflow-x: auto;
  @media (max-width: 768px) {
    display: none;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  min-width: 900px;
`;

const Th = styled.th`
  text-align: left;
  padding: 16px 24px;
  border-bottom: 1px solid #e5e5e5;
  color: #666;
  font-weight: 600;
  background-color: #fcfcfc;
`;

const Td = styled.td`
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
  color: #111;
  vertical-align: middle;
`;

const MobileCardsWrapper = styled.div`
  display: none;
  flex-direction: column;
  gap: 16px;
  
  @media (max-width: 768px) {
    display: flex;
  }
`;

const AttractionCard = styled.div`
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  
  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: #000;
  }
`;

const CardRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: #555;
  
  svg {
    flex-shrink: 0;
    color: #999;
    margin-top: 2px;
  }
`;

const SourceBadge = styled.span`
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: ${props => props.$source === 'Admin' ? '#000' : '#eee'};
  color: ${props => props.$source === 'Admin' ? '#fff' : '#555'};
`;

const TripStatusBadge = styled.span`
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
  background-color: ${props => props.$bg || '#f1f5f9'};
  color: ${props => props.$color || '#64748b'};
  white-space: nowrap;
`;

const CardActions = styled.div`
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px dashed #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const ActionButton = styled.button`
  background: #000;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: opacity 0.2s;
  
  &:hover { opacity: 0.8; }

  &.secondary {
    background: #fff;
    color: #000;
    border: 1px solid #e5e5e5;
    &:hover { background: #f9f9f9; }
  }
  
  &.danger {
    background: #fff;
    color: #dc2626;
    border: 1px solid #fee2e2;
    &:hover { background: #fef2f2; }
  }
  
  @media(max-width: 768px) {
    width: 100%;
  }
`;

const Input = styled.input`
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid #ddd;
  outline: none;
  font-size: 14px;
  width: 100%;
  box-sizing: border-box;
  &:focus { border-color: #000; }
`;

const Select = styled.select`
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid #ddd;
  outline: none;
  font-size: 14px;
  width: 100%;
  box-sizing: border-box;
  background-color: #fff;
  cursor: pointer;
  &:focus { border-color: #000; }
`;

const SearchWrapper = styled.div`
  position: relative;
  width: 250px;
  @media(max-width: 768px) { width: 100%; }
`;

const SuggestionsList = styled.div`
  position: absolute;
  top: 100%; left: 0; width: 100%;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  margin-top: 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
`;

const SuggestionItem = styled.div`
  padding: 10px 12px;
  font-size: 13px;
  cursor: pointer;
  border-bottom: 1px solid #f5f5f5;
  &:hover { background-color: #f9f9f9; }
  strong { display: block; color: #000; }
  span { color: #666; font-size: 11px; }
`;

const RadiusControl = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #444;
  input[type="range"] {
    accent-color: #000;
    cursor: pointer;
    flex: 1;
  }
  span { font-weight: 600; min-width: 40px; }
  @media(max-width: 768px) { width: 100%; }
`;

// --- MODAL STYLES ---
const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
  padding: 16px;
`;

const ModalContent = styled.div`
  background: white;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 50px rgba(0,0,0,0.2);
`;

const ModalHeader = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: 700;
`;

const ModalBody = styled.div`
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ModalFooter = styled.div`
  padding: 16px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  background: #f9f9f9;
  @media(max-width: 600px) {
    flex-direction: column;
    button { width: 100%; }
  }
`;

const FormGroup = styled.div`
  display: flex; flex-direction: column; gap: 6px;
  label { font-size: 13px; font-weight: 600; color: #444; }
  input, textarea {
    padding: 10px;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    font-family: inherit;
    &:focus { border-color: #000; outline: none; }
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  @media(max-width: 600px) { grid-template-columns: 1fr; gap: 16px; }
`;

// --- VARIANTS STYLES ---
const VariantsWrapper = styled.div`
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 15px;
  background: #fafafa;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const VariantHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr auto; 
  gap: 10px;
  font-size: 11px;
  font-weight: 600;
  color: #666;
  margin-bottom: 5px;
  padding: 0 6px;
  @media (max-width: 768px) { display: none; }
`;

const VariantItem = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr auto;
  gap: 10px;
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 1px dashed #ddd;
  &:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    gap: 12px;
    background: #ffffff;
    border: 1px solid #e5e5e5;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    margin-bottom: 8px;
  }
`;

const VariantField = styled.div`
  display: flex; flex-direction: column; gap: 4px; width: 100%;
`;

const MobileLabel = styled.span`
  display: none;
  @media (max-width: 768px) {
    display: block; font-size: 11px; font-weight: 700; color: #555; text-transform: uppercase;
  }
`;

// --- MODAL COMPONENTS (EDIT & CREATE) ---
const EditAttractionModal = ({ attraction, onClose, onSave }) => {
    const [formData, setFormData] = useState({ ...attraction });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleVariantChange = (index, field, value) => {
        const newVariants = [...(formData.warianty || [])];
        newVariants[index] = { ...newVariants[index], [field]: value };
        setFormData(prev => ({ ...prev, warianty: newVariants }));
    };

    const addVariant = () => {
        setFormData(prev => ({
            ...prev,
            warianty: [...(prev.warianty || []), { nazwaWariantu: "Nowy", czasZwiedzania: 60, cenaZwiedzania: 0, cenaUlgowa: 0 }]
        }));
    };

    const removeVariant = (index) => {
        const newVariants = formData.warianty.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, warianty: newVariants }));
    };

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={e => e.stopPropagation()}>
                <ModalHeader>
                    Edycja Atrakcji: {formData.nazwa}
                    <ActionButton className="secondary" onClick={onClose} style={{ padding: '6px' }}><X size={18} /></ActionButton>
                </ModalHeader>
                <ModalBody>
                    <FormRow>
                        <FormGroup><label>Nazwa</label><Input name="nazwa" value={formData.nazwa || ''} onChange={handleChange} /></FormGroup>
                        <FormGroup><label>Adres</label><Input name="adres" value={formData.adres || ''} onChange={handleChange} /></FormGroup>
                    </FormRow>
                    <FormRow>
                        <FormGroup>
                            <label>Źródło Danych</label>
                            <Select name="dataSource" value={formData.dataSource || 'Admin'} onChange={handleChange}>
                                <option value="Admin">Admin</option>
                                <option value="Mod">Mod</option>
                                <option value="Owner">Owner</option>
                                <option value="Bot">Bot</option>
                            </Select>
                        </FormGroup>
                        <FormGroup>
                            <label>Źródło Lokalizacji</label>
                            <Select name="locationSource" value={formData.locationSource || 'Admin'} onChange={handleChange}>
                                <option value="Admin">Admin</option>
                                <option value="Google">Google Maps</option>
                                <option value="Owner">Właściciel</option>
                            </Select>
                        </FormGroup>
                    </FormRow>
                    <FormGroup><label>Strona WWW</label><Input name="stronaInternetowa" value={formData.stronaInternetowa || ''} onChange={handleChange} /></FormGroup>
                    <FormGroup><label>Link do zdjęcia</label><Input name="wallpaper" value={formData.wallpaper || ''} onChange={handleChange} /></FormGroup>

                    <label style={{ fontSize: '14px', fontWeight: '700', marginTop: '10px' }}>Warianty oferty</label>
                    <VariantsWrapper>
                        <VariantHeader><span>Nazwa wariantu</span><span>Czas (min)</span><span>Cena (N)</span><span>Cena (U)</span><span></span></VariantHeader>
                        {(formData.warianty || []).map((v, idx) => (
                            <VariantItem key={idx}>
                                <VariantField><MobileLabel>Nazwa Wariantu</MobileLabel><Input value={v.nazwaWariantu} onChange={e => handleVariantChange(idx, 'nazwaWariantu', e.target.value)} placeholder="Np. Bilet normalny" /></VariantField>
                                <VariantField><MobileLabel>Czas Zwiedzania (min)</MobileLabel><Input type="number" value={v.czasZwiedzania} onChange={e => handleVariantChange(idx, 'czasZwiedzania', e.target.value)} placeholder="Min" /></VariantField>
                                <VariantField><MobileLabel>Cena Normalna (PLN)</MobileLabel><Input type="number" value={v.cenaZwiedzania} onChange={e => handleVariantChange(idx, 'cenaZwiedzania', e.target.value)} placeholder="PLN" /></VariantField>
                                <VariantField><MobileLabel>Cena Ulgowa (PLN)</MobileLabel><Input type="number" value={v.cenaUlgowa} onChange={e => handleVariantChange(idx, 'cenaUlgowa', e.target.value)} placeholder="PLN" /></VariantField>
                                <ActionButton className="danger" style={{ padding: '8px', width: '100%' }} onClick={() => removeVariant(idx)}><Trash2 size={14} /> <span style={{ display: 'inline-block', marginLeft: '5px', '@media(minWidth: 769px)': { display: 'none' } }}>Usuń ten wariant</span></ActionButton>
                            </VariantItem>
                        ))}
                        <ActionButton className="secondary" style={{ marginTop: '10px', width: '100%', justifyContent: 'center' }} onClick={addVariant}><Plus size={14} /> Dodaj wariant</ActionButton>
                    </VariantsWrapper>
                </ModalBody>
                <ModalFooter>
                    <ActionButton className="secondary" onClick={onClose}>Anuluj</ActionButton>
                    <ActionButton onClick={() => onSave(formData)}><Save size={16} /> Zapisz</ActionButton>
                </ModalFooter>
            </ModalContent>
        </ModalOverlay>
    );
};

// --- NOWY MODAL: EDYCJA PLANU WYJAZDU ---
const EditTripPlanModal = ({ plan, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        ...plan,
        dataPrzyjazdu: isoDateToInput(plan.dataPrzyjazdu),
        dataWyjazdu: isoDateToInput(plan.dataWyjazdu)
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = () => {
        onSave(formData);
    };

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={e => e.stopPropagation()}>
                <ModalHeader>
                    Edycja Planu: {formData.nazwa}
                    <ActionButton className="secondary" onClick={onClose} style={{ padding: '6px' }}><X size={18} /></ActionButton>
                </ModalHeader>
                <ModalBody>
                    <FormGroup>
                        <label>Nazwa Planu</label>
                        <Input name="nazwa" value={formData.nazwa || ''} onChange={handleChange} />
                    </FormGroup>

                    <FormRow>
                        <FormGroup>
                            <label>Status Realizacji</label>
                            <Select name="realizationStatus" value={formData.realizationStatus} onChange={handleChange}>
                                <option value="0">Szkic / Planowanie</option>
                                <option value="1">Zgłoszono do realizacji</option>
                                <option value="2">W trakcie płatności</option>
                                <option value="3">W trakcie weryfikacji</option>
                                <option value="4">Zaplanowany...</option>
                                <option value="5">Trwa...</option>
                                <option value="6">Zakończony</option>
                                <option value="9">Anulowano</option>
                            </Select>
                        </FormGroup>
                        <FormGroup>
                            <label>Cena Całkowita (PLN)</label>
                            <Input type="number" name="computedPrice" value={formData.computedPrice} onChange={handleChange} />
                        </FormGroup>
                    </FormRow>

                    <FormRow>
                        <FormGroup>
                            <label>Data Przyjazdu</label>
                            <Input type="date" name="dataPrzyjazdu" value={formData.dataPrzyjazdu} onChange={handleChange} />
                        </FormGroup>
                        <FormGroup>
                            <label>Data Wyjazdu</label>
                            <Input type="date" name="dataWyjazdu" value={formData.dataWyjazdu} onChange={handleChange} />
                        </FormGroup>
                    </FormRow>

                    <FormRow>
                        <FormGroup>
                            <label>Liczba Uczestników</label>
                            <Input type="number" name="liczbaUczestnikow" value={formData.liczbaUczestnikow} onChange={handleChange} />
                        </FormGroup>
                        <FormGroup>
                            <label>Liczba Opiekunów</label>
                            <Input type="number" name="liczbaOpiekunow" value={formData.liczbaOpiekunow} onChange={handleChange} />
                        </FormGroup>
                    </FormRow>

                    <FormGroup>
                        <label>
                            <input
                                type="checkbox"
                                name="public"
                                checked={formData.public}
                                onChange={handleChange}
                                style={{ marginRight: '8px' }}
                            />
                            Plan Publiczny
                        </label>
                    </FormGroup>
                    <a href={`/konfigurator?tripId=${formData._id}`}>
                        konfigurator
                    </a>
                    <div style={{ marginTop: '10px', padding: '10px', background: '#fffbeb', borderRadius: '6px', fontSize: '12px', color: '#b45309', border: '1px solid #fcd34d' }}>
                        <strong>Uwaga:</strong> Edycja harmonogramu i szczegółów atrakcji jest możliwa tylko przez dedykowany konfigurator. Tutaj edytujesz tylko metadane administracyjne.
                    </div>

                </ModalBody>
                <ModalFooter>
                    <ActionButton className="secondary" onClick={onClose}>Anuluj</ActionButton>
                    <ActionButton onClick={handleSubmit}><Save size={16} /> Zapisz</ActionButton>
                </ModalFooter>
            </ModalContent>
        </ModalOverlay>
    );
};

const CreateAttractionModal = ({ onClose, onSave }) => {
    const [formData, setFormData] = useState({
        nazwa: '', adres: '', lat: '', lng: '', stronaInternetowa: '', wallpaper: '', googleId: '', warianty: [],
        dataSource: 'Admin', locationSource: 'Admin'
    });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleVariantChange = (index, field, value) => {
        const newVariants = [...formData.warianty];
        newVariants[index] = { ...newVariants[index], [field]: value };
        setFormData(prev => ({ ...prev, warianty: newVariants }));
    };

    const addVariant = () => {
        setFormData(prev => ({ ...prev, warianty: [...prev.warianty, { nazwaWariantu: "Normalny", czasZwiedzania: 60, cenaZwiedzania: 0, cenaUlgowa: 0 }] }));
    };

    const removeVariant = (index) => setFormData(prev => ({ ...prev, warianty: prev.warianty.filter((_, i) => i !== index) }));

    const handleSubmit = () => {
        if (!formData.nazwa || !formData.adres) return alert("Nazwa i Adres są wymagane!");
        onSave(formData);
    };

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={e => e.stopPropagation()}>
                <ModalHeader>
                    Dodaj Nową Atrakcję
                    <ActionButton className="secondary" onClick={onClose} style={{ padding: '6px' }}><X size={18} /></ActionButton>
                </ModalHeader>
                <ModalBody>
                    <FormRow>
                        <FormGroup><label>Nazwa *</label><Input name="nazwa" value={formData.nazwa} onChange={handleChange} /></FormGroup>
                        <FormGroup><label>Adres *</label><Input name="adres" value={formData.adres} onChange={handleChange} /></FormGroup>
                    </FormRow>
                    <FormRow>
                        <FormGroup>
                            <label>Źródło Danych</label>
                            <Select name="dataSource" value={formData.dataSource} onChange={handleChange}><option value="Admin">Admin</option><option value="Mod">Mod</option><option value="Owner">Owner</option><option value="Bot">Bot</option></Select>
                        </FormGroup>
                        <FormGroup>
                            <label>Źródło Lokalizacji</label>
                            <Select name="locationSource" value={formData.locationSource} onChange={handleChange}><option value="Admin">Admin</option><option value="Google">Google</option><option value="Owner">Owner</option></Select>
                        </FormGroup>
                    </FormRow>
                    <FormRow>
                        <FormGroup><label>Lat</label><Input type="number" name="lat" value={formData.lat} onChange={handleChange} /></FormGroup>
                        <FormGroup><label>Lng</label><Input type="number" name="lng" value={formData.lng} onChange={handleChange} /></FormGroup>
                    </FormRow>
                    <FormGroup><label>Google ID</label><Input name="googleId" value={formData.googleId} onChange={handleChange} /></FormGroup>
                    <FormGroup><label>WWW</label><Input name="stronaInternetowa" value={formData.stronaInternetowa} onChange={handleChange} /></FormGroup>
                    <FormGroup><label>Zdjęcie</label><Input name="wallpaper" value={formData.wallpaper} onChange={handleChange} /></FormGroup>
                    <label style={{ fontSize: '14px', fontWeight: '700', marginTop: '10px' }}>Warianty</label>
                    <VariantsWrapper>
                        <VariantHeader><span>Nazwa</span><span>Czas</span><span>Cena N</span><span>Cena U</span><span></span></VariantHeader>
                        {formData.warianty.map((v, idx) => (
                            <VariantItem key={idx}>
                                <VariantField><MobileLabel>Nazwa Wariantu</MobileLabel><Input value={v.nazwaWariantu} onChange={e => handleVariantChange(idx, 'nazwaWariantu', e.target.value)} placeholder="Nazwa" /></VariantField>
                                <VariantField><MobileLabel>Czas (min)</MobileLabel><Input type="number" value={v.czasZwiedzania} onChange={e => handleVariantChange(idx, 'czasZwiedzania', e.target.value)} placeholder="Min" /></VariantField>
                                <VariantField><MobileLabel>Cena Normalna</MobileLabel><Input type="number" value={v.cenaZwiedzania} onChange={e => handleVariantChange(idx, 'cenaZwiedzania', e.target.value)} placeholder="PLN" /></VariantField>
                                <VariantField><MobileLabel>Cena Ulgowa</MobileLabel><Input type="number" value={v.cenaUlgowa} onChange={e => handleVariantChange(idx, 'cenaUlgowa', e.target.value)} placeholder="PLN" /></VariantField>
                                <ActionButton className="danger" style={{ padding: '8px', width: '100%' }} onClick={() => removeVariant(idx)}><Trash2 size={14} /></ActionButton>
                            </VariantItem>
                        ))}
                        <ActionButton className="secondary" style={{ marginTop: '10px', width: '100%', justifyContent: 'center' }} onClick={addVariant}><Plus size={14} /> Dodaj</ActionButton>
                    </VariantsWrapper>
                </ModalBody>
                <ModalFooter>
                    <ActionButton className="secondary" onClick={onClose}>Anuluj</ActionButton>
                    <ActionButton onClick={handleSubmit}><CheckCircle size={16} /> Utwórz</ActionButton>
                </ModalFooter>
            </ModalContent>
        </ModalOverlay>
    );
};

// --- USERNAME DISPLAY COMPONENT (NEW) ---
const UsernameDisplay = ({ userId }) => {
    const [name, setName] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        const fetchName = async () => {
            try {
                // Fetch from the public API endpoint for username
                const res = await fetch(`${portacc}/api/users/${userId}/name`);
                if (res.ok) {
                    const data = await res.json();
                    setName(data.username || "Brak nazwy");
                } else {
                    setName("Nieznany");
                }
            } catch (error) {
                console.error("Error fetching username:", error);
                setName("Błąd");
            } finally {
                setLoading(false);
            }
        };

        fetchName();
    }, [userId]);

    if (!userId) return <span>-</span>;
    if (loading) return <span>...</span>;
    return <span title={userId}>{name}</span>;
};

// --- VIEWS ---

const AttractionsView = () => {
    const [attractions, setAttractions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');

    const [locationQuery, setLocationQuery] = useState('');
    const [citySuggestions, setCitySuggestions] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [radius, setRadius] = useState(50);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const [editingAttraction, setEditingAttraction] = useState(null);
    const [isCreating, setIsCreating] = useState(false);

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const ITEMS_PER_PAGE = 20;

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (locationQuery.length > 2 && !selectedLocation) {
                try {
                    const res = await fetch(`${port}/searchCityNew?query=${locationQuery}`);
                    const data = await res.json();
                    setCitySuggestions(Array.isArray(data) ? data : []);
                    setShowSuggestions(true);
                } catch (e) { console.error(e); }
            } else if (locationQuery.length <= 2) {
                setCitySuggestions([]);
                setShowSuggestions(false);
            }
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [locationQuery, selectedLocation]);

    const handleSelectCity = (city) => {
        setLocationQuery(city.nazwa);
        setSelectedLocation({
            lat: parseFloat(city.location?.lat || city.lat) || 0,
            lng: parseFloat(city.location?.lng || city.lon) || 0,
            name: city.nazwa
        });
        setShowSuggestions(false);
        setPage(1);
        setAttractions([]);
        setHasMore(true);
    };

    const clearLocation = () => {
        setLocationQuery('');
        setSelectedLocation(null);
        setCitySuggestions([]);
        setPage(1);
        setAttractions([]);
        setHasMore(true);
    };

    const handleFilter = () => {
        setPage(1);
        setHasMore(true);
        fetchAttractions(1, true);
    };

    const fetchAttractions = async (pageToLoad = 1, reset = false) => {
        if (!hasMore && !reset) return;
        setLoading(true);

        try {
            let url;
            let isNearbySearch = false;
            const baseParams = { limit: ITEMS_PER_PAGE, page: pageToLoad };

            if (selectedLocation && selectedLocation.lat && selectedLocation.lng) {
                isNearbySearch = true;
                const params = new URLSearchParams({ ...baseParams, lat: selectedLocation.lat, lng: selectedLocation.lng, radiusKm: radius });
                url = `${port}/attractions/nearby?${params}`;
            } else {
                const params = new URLSearchParams({ ...baseParams, search });
                url = `${port}/admin/attractions?${params}`;
            }

            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
            const responseData = await res.json();

            let newResults = [];
            if (isNearbySearch) {
                newResults = Array.isArray(responseData) ? responseData : (responseData.data || []);
                if (search) {
                    newResults = newResults.filter(a => a.nazwa?.toLowerCase().includes(search.toLowerCase()));
                }
            } else {
                newResults = responseData.data || [];
            }

            if (newResults.length < ITEMS_PER_PAGE) setHasMore(false);
            else setHasMore(true);

            setAttractions(prev => reset ? newResults : [...prev, ...newResults]);
            setPage(pageToLoad);
        } catch (err) { console.error("Error:", err); } finally { setLoading(false); }
    };

    useEffect(() => { handleFilter(); }, []);

    const loadMore = () => {
        const nextPage = page + 1;
        fetchAttractions(nextPage, false);
    };

    const handleEditSave = async (updatedData) => {
        try {
            const res = await fetch(`${port}/admin/attractions/${updatedData.googleId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });
            if (res.ok) {
                setEditingAttraction(null);
                setAttractions(prev => prev.map(a => a.googleId === updatedData.googleId ? { ...a, ...updatedData } : a));
                alert('Zapisano zmiany!');
            } else { alert('Błąd zapisu'); }
        } catch (e) { console.error(e); }
    };

    const handleCreateSave = async (newData) => {
        try {
            const res = await fetch(`${port}/admin/attractions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newData)
            });
            if (res.ok) {
                setIsCreating(false);
                handleFilter();
                alert('Dodano nową atrakcję!');
            } else { alert(`Błąd: ${(await res.json()).error}`); }
        } catch (e) { console.error(e); }
    };

    return (
        <>
            <SectionContainer>
                <FiltersContainer>
                    <div style={{ position: 'relative', width: '250px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px', display: 'block' }}>Nazwa atrakcji</label>
                        <Search size={16} style={{ position: 'absolute', left: '10px', top: '32px', color: '#999' }} />
                        <Input placeholder="Wpisz nazwę..." style={{ paddingLeft: '34px' }} value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleFilter()} />
                    </div>

                    <SearchWrapper>
                        <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px', display: 'block' }}>Lokalizacja</label>
                        <MapPin size={16} style={{ position: 'absolute', left: '10px', top: '32px', color: '#999' }} />
                        <Input placeholder="Wpisz miasto..." style={{ paddingLeft: '34px', paddingRight: selectedLocation ? '30px' : '10px' }} value={locationQuery}
                            onChange={e => { setLocationQuery(e.target.value); if (selectedLocation) setSelectedLocation(null); }}
                            onFocus={() => locationQuery.length > 2 && setShowSuggestions(true)}
                            onKeyDown={e => e.key === 'Enter' && handleFilter()} />
                        {selectedLocation && (
                            <button onClick={clearLocation} style={{ position: 'absolute', right: '8px', top: '30px', background: 'none', border: 'none', cursor: 'pointer' }}><X size={14} color="#999" /></button>
                        )}
                        {showSuggestions && citySuggestions.length > 0 && (
                            <SuggestionsList>
                                {citySuggestions.map((city, idx) => (
                                    <SuggestionItem key={`${city.id}-${idx}`} onClick={() => handleSelectCity(city)}>
                                        <strong>{city.nazwa}</strong><span>{city.wojewodztwo ? `${city.wojewodztwo}, ` : ''}{city.kraj}</span>
                                    </SuggestionItem>
                                ))}
                            </SuggestionsList>
                        )}
                    </SearchWrapper>

                    <div style={{ opacity: selectedLocation ? 1 : 0.5, flex: 1, minWidth: '200px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px', display: 'block' }}>Promień: {radius} km</label>
                        <RadiusControl>
                            <Target size={16} />
                            <input type="range" min="5" max="200" step="5" value={radius} disabled={!selectedLocation} onChange={e => setRadius(Number(e.target.value))} />
                        </RadiusControl>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flex: 'none' }}>
                        <ActionButton onClick={handleFilter} style={{ height: '38px' }}><Filter size={16} /> Filtruj</ActionButton>
                        <ActionButton onClick={() => setIsCreating(true)} style={{ height: '38px' }}><Plus size={16} /> Dodaj</ActionButton>
                    </div>
                </FiltersContainer>

                {/* DESKTOP TABLE VIEW */}
                <DesktopTableWrapper>
                    <Table>
                        <thead>
                            <tr>
                                <Th>Nazwa</Th>
                                <Th>Adres / Miasto</Th>
                                <Th>{selectedLocation ? 'Dystans' : 'Lokalizacja'}</Th>
                                <Th>Źródło</Th>
                                <Th style={{ textAlign: 'right' }}>Opcje</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {attractions.map(attr => (
                                <tr key={attr.googleId}>
                                    <Td><strong>{attr.nazwa}</strong></Td>
                                    <Td>{attr.adres}</Td>
                                    <Td>{attr.distanceKm ? <span style={{ fontWeight: '600', color: '#000' }}>{attr.distanceKm} km</span> : (attr.lokalizacja?.lat ? <span style={{ fontSize: '11px', color: '#666', fontFamily: 'monospace' }}>{attr.lokalizacja.lat.toFixed(4)}, {attr.lokalizacja.lng.toFixed(4)}</span> : '-')}</Td>
                                    <Td><SourceBadge $source={attr.dataSource}>{attr.dataSource || 'Bot'}</SourceBadge></Td>
                                    <Td style={{ textAlign: 'right' }}><ActionButton className="secondary" onClick={() => setEditingAttraction(attr)}><Edit3 size={14} /> Edytuj</ActionButton></Td>
                                </tr>
                            ))}
                            {loading && <tr><Td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>Ładowanie...</Td></tr>}
                            {!loading && attractions.length === 0 && <tr><Td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>Brak wyników</Td></tr>}
                        </tbody>
                    </Table>
                </DesktopTableWrapper>

                {/* MOBILE CARD VIEW */}
                <MobileCardsWrapper>
                    {loading && <div style={{ textAlign: 'center', padding: '20px' }}>Ładowanie...</div>}
                    {!loading && attractions.length === 0 && <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>Brak wyników</div>}

                    {attractions.map(attr => (
                        <AttractionCard key={attr.googleId}>
                            <CardHeader>
                                <h3>{attr.nazwa}</h3>
                                <SourceBadge $source={attr.dataSource}>{attr.dataSource || 'Bot'}</SourceBadge>
                            </CardHeader>
                            <CardRow>
                                <MapPin size={14} />
                                <span>{attr.adres}</span>
                            </CardRow>
                            <CardRow>
                                <Globe size={14} />
                                <span>
                                    {attr.distanceKm ?
                                        <strong>{attr.distanceKm} km od celu</strong> :
                                        (attr.lokalizacja?.lat ? `Lat: ${attr.lokalizacja.lat.toFixed(4)}, Lng: ${attr.lokalizacja.lng.toFixed(4)}` : 'Brak lokalizacji')}
                                </span>
                            </CardRow>
                            {attr.stronaInternetowa && (
                                <CardRow>
                                    <Target size={14} />
                                    <a href={attr.stronaInternetowa} target="_blank" rel="noreferrer" style={{ color: '#000', textDecoration: 'underline' }}>Strona WWW</a>
                                </CardRow>
                            )}
                            <CardActions>
                                <ActionButton className="secondary" onClick={() => setEditingAttraction(attr)} style={{ width: '100%' }}>
                                    <Edit3 size={16} /> Edytuj szczegóły
                                </ActionButton>
                            </CardActions>
                        </AttractionCard>
                    ))}
                </MobileCardsWrapper>

                {hasMore && !loading && attractions.length > 0 && (
                    <div style={{ padding: '20px', display: 'flex', justifyContent: 'center', borderTop: '1px solid #f0f0f0' }}>
                        <ActionButton className="secondary" onClick={loadMore} style={{ width: '200px', justifyContent: 'center' }}>
                            Załaduj więcej ({ITEMS_PER_PAGE}) <ChevronRight size={14} />
                        </ActionButton>
                    </div>
                )}
            </SectionContainer>

            {editingAttraction && <EditAttractionModal attraction={editingAttraction} onClose={() => setEditingAttraction(null)} onSave={handleEditSave} />}
            {isCreating && <CreateAttractionModal onClose={() => setIsCreating(false)} onSave={handleCreateSave} />}
        </>
    );
};

// --- PLANS VIEW (NOWE) ---

const PlansView = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [editingPlan, setEditingPlan] = useState(null); // Stan dla edytowanego planu

    const fetchPlans = async () => {
        setLoading(true);
        try {
            //credentials include są kluczowe dla endpointu wymagającego logowania
            const res = await fetch(`${portacc}/api/admin/trip-plans`, { credentials: 'include' });
            if (!res.ok) {
                if (res.status === 403) throw new Error("Brak uprawnień administratora");
                throw new Error("Błąd pobierania planów");
            }
            const data = await res.json();
            setPlans(data || []);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const handleUpdatePlan = async (updatedData) => {
        try {
            const res = await fetch(`${portacc}/api/admin/trip-plans/${updatedData._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(updatedData)
            });

            if (!res.ok) {
                throw new Error('Błąd podczas aktualizacji planu');
            }

            // Po sukcesie zamknij modal i odśwież listę (lub zaktualizuj lokalnie)
            setEditingPlan(null);
            fetchPlans();
            alert("Plan zaktualizowany pomyślnie.");

        } catch (err) {
            console.error(err);
            alert("Wystąpił błąd: " + err.message);
        }
    };

    const filteredPlans = plans.filter(plan => {
        if (statusFilter === 'all') return true;
        return plan.realizationStatus === Number(statusFilter);
    });

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Ładowanie planów...</div>;
    if (error) return <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>Błąd: {error}</div>;

    return (
        <SectionContainer>
            <div style={{ padding: '24px', borderBottom: '1px solid #e5e5e5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Wszystkie Plany Wyjazdów</h2>
                <div style={{ width: '220px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px', display: 'block', color: '#666' }}>Status realizacji</label>
                    <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="0">Szkic / Planowanie</option>
                        <option value="1">Zgłoszono do realizacji</option>
                        <option value="2">W trakcie płatności</option>
                        <option value="3">W trakcie weryfikacji</option>
                        <option value="4">Zaplanowany...</option>
                        <option value="5">Trwa...</option>
                        <option value="6">Zakończony</option>
                        <option value="9">Anulowano</option>
                    </Select>
                </div>
            </div>

            <DesktopTableWrapper>
                <Table>
                    <thead>
                        <tr>
                            <Th>Status</Th>
                            <Th>Nazwa</Th>
                            <Th>Lokalizacja</Th>
                            <Th>Data</Th>
                            <Th>Uczestnicy</Th>
                            <Th>Cena</Th>
                            <Th>Autor</Th>
                            <Th>Akcje</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPlans.map(plan => {
                            const statusInfo = getTripStatus(plan.realizationStatus);
                            return (
                                <tr key={plan._id}>
                                    <Td>
                                        <TripStatusBadge $bg={statusInfo.bg} $color={statusInfo.color}>
                                            {statusInfo.label}
                                        </TripStatusBadge>
                                    </Td>
                                    <Td><strong>{plan.nazwa || 'Bez nazwy'}</strong></Td>
                                    <Td>{plan.miejsceDocelowe?.nazwa || '-'}</Td>
                                    <Td>{formatDate(plan.dataPrzyjazdu)}</Td>
                                    <Td>{plan.liczbaUczestnikow} (+{plan.liczbaOpiekunow})</Td>
                                    <Td>{plan.computedPrice} PLN</Td>
                                    <Td><UsernameDisplay userId={plan.authors?.[0]} /></Td>
                                    <Td>
                                        <ActionButton className="secondary" title="Edytuj" onClick={() => setEditingPlan(plan)}>
                                            <Edit3 size={14} />
                                        </ActionButton>
                                    </Td>
                                </tr>
                            );
                        })}
                        {filteredPlans.length === 0 && <tr><Td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>Brak planów w bazie.</Td></tr>}
                    </tbody>
                </Table>
            </DesktopTableWrapper>

            <MobileCardsWrapper>
                {filteredPlans.map(plan => {
                    const statusInfo = getTripStatus(plan.realizationStatus);
                    return (
                        <AttractionCard key={plan._id}>
                            <CardHeader>
                                <h3>{plan.nazwa || 'Bez nazwy'}</h3>
                                <TripStatusBadge $bg={statusInfo.bg} $color={statusInfo.color}>
                                    {statusInfo.label}
                                </TripStatusBadge>
                            </CardHeader>
                            <CardRow><MapPin size={14} /> {plan.miejsceDocelowe?.nazwa || '-'}</CardRow>
                            <CardRow><Calendar size={14} /> {formatDate(plan.dataPrzyjazdu)} - {formatDate(plan.dataWyjazdu)}</CardRow>
                            <CardRow><Users size={14} /> {plan.liczbaUczestnikow} uczniów, {plan.liczbaOpiekunow} opiekunów</CardRow>
                            <CardRow><DollarSign size={14} /> {plan.computedPrice} PLN</CardRow>
                            <CardRow><User size={14} /> Autor: <UsernameDisplay userId={plan.authors?.[0]} /></CardRow>
                            <CardActions>
                                <ActionButton className="secondary" style={{ width: '100%' }} onClick={() => setEditingPlan(plan)}>
                                    Edytuj / Szczegóły
                                </ActionButton>
                            </CardActions>
                        </AttractionCard>
                    );
                })}
            </MobileCardsWrapper>

            {/* MODAL EDYCJI PLANU */}
            {editingPlan && (
                <EditTripPlanModal
                    plan={editingPlan}
                    onClose={() => setEditingPlan(null)}
                    onSave={handleUpdatePlan}
                />
            )}
        </SectionContainer>
    );
};

const DashboardView = () => (
    <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
        Tu będzie Dashboard (statystyki).
    </div>
);

// --- MAIN ADMIN PANEL ---

export const AdminPanel = () => {
    const [activePage, setActivePage] = useState('attractions');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const renderContent = () => {
        switch (activePage) {
            case 'dashboard': return <DashboardView />;
            case 'plans': return <PlansView />; // <-- TUTAJ UŻYWAMY NOWEGO KOMPONENTU
            case 'attractions': return <AttractionsView />;
            default: return <DashboardView />;
        }
    };

    return (
        <Container>
            <SidebarOverlay $isOpen={isSidebarOpen} onClick={() => setIsSidebarOpen(false)} />
            <Sidebar $isOpen={isSidebarOpen}>
                <Logo>
                    <div style={{ width: '24px', height: '24px', background: 'black', borderRadius: '4px' }}></div>
                    AdminPanel
                </Logo>
                <NavList>
                    <NavItem $active={activePage === 'dashboard'} onClick={() => { setActivePage('dashboard'); setIsSidebarOpen(false); }}>
                        <LayoutDashboard size={18} /> Dashboard
                    </NavItem>
                    <NavItem $active={activePage === 'plans'} onClick={() => { setActivePage('plans'); setIsSidebarOpen(false); }}>
                        <FileText size={18} /> Plany Wyjazdów
                    </NavItem>
                    <NavItem $active={activePage === 'attractions'} onClick={() => { setActivePage('attractions'); setIsSidebarOpen(false); }}>
                        <MapPin size={18} /> Atrakcje
                    </NavItem>
                    <NavItem $active={activePage === 'support'} onClick={() => { setActivePage('support'); setIsSidebarOpen(false); }}>
                        <MessageSquare size={18} /> Support
                    </NavItem>
                </NavList>
                <NavList style={{ flex: '0', marginTop: 'auto', borderTop: '1px solid #eee', paddingTop: '16px' }}>
                    <NavItem onClick={() => alert('Wylogowano')} style={{ color: '#d32f2f' }}>
                        <LogOut size={18} /> Wyloguj
                    </NavItem>
                </NavList>
            </Sidebar>

            <MainContent>
                <TopBar>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <MenuButton onClick={() => setIsSidebarOpen(true)}><MenuIcon size={24} /></MenuButton>
                        <PageTitle>
                            {activePage === 'attractions' ? 'Zarządzanie Atrakcjami' :
                                activePage === 'plans' ? 'Lista Wyjazdów' : 'Panel Administratora'}
                        </PageTitle>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', display: 'none', '@media(minWidth:768px)': { display: 'inline' } }}>Admin</span>
                        <div style={{ width: '32px', height: '32px', background: 'black', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>A</div>
                    </div>
                </TopBar>
                <ContentScroll>{renderContent()}</ContentScroll>
            </MainContent>
        </Container>
    );
};

export default AdminPanel;