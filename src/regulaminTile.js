import React from 'react';
import styled from 'styled-components';
import { ScrollText } from 'lucide-react';

// --- STYLES (Bliźniacze do innych kart) ---

const CardWrapper = styled.div`
  flex: 1;
  max-width: 800px;
  flex-shrink: 0;
  min-width: 300px;
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 20px;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
  margin-bottom: 30px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
  margin-top: 10px;

`;

const HeaderSection = styled.div`
  background-color: #fafafa;
  padding: 20px 30px;
  border-bottom: 1px solid #e5e5e5;
  display: flex;
  align-items: center;
  gap: 12px;
`;
const Title = styled.h3`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  text-align: left;
  
  
`;

const ContentSection = styled.div`
padding: 10px 20px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  
  /* Ograniczenie wysokości */
  height: 600px; /* Ustaw wysokość zbliżoną do lewego kafelka */
  overflow-y: auto;  /* Włącz scrollowanie w pionie */

  box-sizing: border-box;
  /* Stylizacja paska przewijania (opcjonalnie) */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 4px;
  }

   @media (max-width: 600px) {
    padding: 20px;
    height: auto;
  }
`;

// --- STYLES DLA SCROLLOWANEGO REGULAMINU ---

const ScrollArea = styled.div`
  width: 100%;
  height: 100%; /* Stała wysokość, po przekroczeniu pojawi się scroll */
  overflow-y: auto;
  background-color: #f9f9f9;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 20px;
  box-sizing: border-box;

  /* Stylizacja paska przewijania (Webkit) */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 4px;
    border: 2px solid #f1f1f1; /* Odstęp od krawędzi */
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #999;
  }
`;

const TermsText = styled.div`
  font-size: 13px;
  color: #555;
  line-height: 1.6;

  h4 {
    margin: 20px 0 10px 0;
    font-size: 14px;
    font-weight: 700;
    color: #111;
    &:first-child { margin-top: 0; }
  }

  p {
    margin: 0 0 10px 0;
  }

  ul {
    margin: 0 0 10px 20px;
    padding: 0;
    
    li {
      margin-bottom: 5px;
    }
  }
`;

// --- KOMPONENT ---

export const TermsAndConditionsCard = () => {
    return (
        <CardWrapper>
            <HeaderSection>
                <ScrollText size={20} color="#333" />
                <Title>Regulamin Serwisu</Title>
            </HeaderSection>

            <ContentSection>
                <ScrollArea>
                    <TermsText>
                        <h4>§1. Postanowienia ogólne</h4>
                        <p>
                            1. Niniejszy regulamin określa zasady korzystania z serwisu do planowania i realizacji wyjazdów grupowych.
                        </p>
                        <p>
                            2. Administratorem danych i operatorem serwisu jest [Nazwa Twojej Firmy/Projektu].
                        </p>

                        <h4>§2. Zasady realizacji wyjazdu</h4>
                        <p>
                            1. Przesłanie planu do realizacji jest równoznaczne z akceptacją szacunkowych kosztów, które mogą ulec zmianie o maksymalnie 10% w zależności od dostępności ofert w momencie rezerwacji.
                        </p>
                        <p>
                            2. Po przesłaniu zgłoszenia, edycja harmonogramu w panelu użytkownika zostaje zablokowana. Wszelkie zmiany należy zgłaszać poprzez czat z Administratorem.
                        </p>

                        <h4>§3. Płatności i rezerwacje</h4>
                        <p>
                            1. Rezerwacja atrakcji i noclegów następuje wyłącznie po zaksięgowaniu wpłat od wszystkich uczestników lub wpłaty zbiorczej od organizatora.
                        </p>
                        <p>
                            2. Serwis pobiera opłatę manipulacyjną w wysokości X% wartości zamówienia, która jest bezzwrotna w przypadku rezygnacji uczestnika.
                        </p>

                        <h4>§4. Rezygnacja i zwroty</h4>
                        <p>
                            1. Uczestnik ma prawo zrezygnować z wyjazdu. Wysokość zwrotu zależy od terminu rezygnacji:
                        </p>
                        <ul>
                            <li>Powyżej 30 dni przed wyjazdem: 100% zwrotu kosztów (minus opłata serwisowa).</li>
                            <li>14-30 dni przed wyjazdem: 50% zwrotu kosztów.</li>
                            <li>Poniżej 14 dni przed wyjazdem: brak zwrotu (chyba że znajdzie się zastępstwo).</li>
                        </ul>

                        <h4>§5. Reklamacje</h4>
                        <p>
                            1. Wszelkie reklamacje dotyczące działania serwisu lub przebiegu wyjazdu należy zgłaszać na adres e-mail [twój@email.com] w terminie 14 dni od zakończenia wyjazdu.
                        </p>
                        <p>
                            2. Administrator rozpatrzy reklamację w terminie 14 dni roboczych.
                        </p>
                        <h4>§6. Postanowienia końcowe</h4>
                        <p>
                            1. W sprawach nieuregulowanych niniejszym regulaminem mają zastosowanie przepisy Kodeksu Cywilnego.
                        </p>
                    </TermsText>
                </ScrollArea>
            </ContentSection>
        </CardWrapper>
    );
};