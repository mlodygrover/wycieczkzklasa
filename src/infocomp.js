import React from 'react';
import styled from 'styled-components';
import { SearchX, PlusCircle } from 'lucide-react';

// Styl bazujący na wymiarach AttractionResultMediumVerifiedComponentMainbox
const InfoBoxContainer = styled.div`
    /* Wymiary zgodne z verified component */
    max-width: 300px;
    min-width: 250px;
    width: 90%;
    height: 150px;
    
    /* Margines dolny zgodnie z wymaganiem */
    margin-bottom: 50px;
    
    /* Stylizacja B&W */
    background-color: #fafafa; /* Bardzo jasny szary, prawie biały */
    border-radius: 15px;
    color: #404040; /* Ciemnoszary tekst główny */
    
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 15px;
    box-sizing: border-box;
    transition: all 0.2s ease-in-out;
    cursor: pointer; /* Dodano kursor rączki, bo element jest klikalny */

    /* Efekt po najechaniu - lekkie przyciemnienie */
   

    .info-title {
        font-size: 14px;
        font-weight: 600;
        margin: 8px 0 4px 0;
        font-family: 'Inter', sans-serif;
    }

    .info-subtitle {
        font-size: 11px;
        text-align: center;
        line-height: 1.4;
        
        span {
            font-weight: 700;
            color: #000000; /* Czarny kolor dla akcentu */
            text-decoration: underline;
        }
    }
    
    .icon-wrapper {
        display: flex;
        gap: 5px;
        /* Ikony będą dziedziczyć kolor tekstu (ciemnoszary), 
           można usunąć opacity lub ustawić je na sztywno tutaj */
        color: #404040; 
    }
`;

/**
 * Komponent informacyjny (wersja czarno-biała).
 * @param {Function} onClick - funkcja zmieniająca zakładkę na "Dodaj własne"
 */
export const MissingAttractionInfo = ({ onClick }) => {
    return (
        <InfoBoxContainer onClick={onClick}>
            <div className="icon-wrapper">
                {/* Zwiększyłem nieco opacity, aby były wyraźniejsze w skali szarości */}
                <SearchX size={24} opacity={0.85} />
                <PlusCircle size={24} opacity={0.85} />
            </div>
            
            <div className="info-title">
                Nie znalazłeś atrakcji?
            </div>
            
            <div className="info-subtitle">
                Kliknij tutaj, aby dodać ją w zakładce<br/>
                <span>Dodaj własne</span>
            </div>
        </InfoBoxContainer>
    );
};

export default MissingAttractionInfo;