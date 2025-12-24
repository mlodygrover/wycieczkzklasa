import React from 'react';
import styled from 'styled-components';
import {
    Lock,
    MessageCircle,
    Info,
    FileSearch,
    CreditCard,
    Stamp,
    Rocket,
    Settings
} from 'lucide-react';

// --- STYLES ---

const CardWrapper = styled.div`
  flex: 1;
  max-width: 800px; /* Pasuje do szerokości chatboxa i timeline'u */
  flex-shrink: 0;
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 20px;
  overflow: hidden; /* Żeby tło nagłówka nie wystawało */
  font-family: 'Inter', sans-serif;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);

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
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 30px;

  height: 600px;
  box-sizing: border-box;
  @media (max-width: 600px) {
    padding: 20px;
    height: auto;
  }
`;

// --- BLOK INFORMACYJNY (LOCK & CHAT) ---

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

const InfoBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 15px;
  border-radius: 12px;
  border: 1px solid ${props => props.$accent ? '#e0e7ff' : '#eee'};
  background-color: ${props => props.$accent ? '#f5f7ff' : '#fff'};

  .icon-row {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 700;
    color: ${props => props.$accent ? '#4f46e5' : '#333'};
  }

  p {
    margin: 0;
    font-size: 13px;
    line-height: 1.5;
    color: #666;
  }
`;

// --- OŚ PROCESU ---

const StepsTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #888;
  margin-bottom: 15px;
`;

const StepsContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  /* Linia pionowa łącząca kroki */
  &::before {
    content: '';
    position: absolute;
    top: 15px;
    bottom: 30px;
    left: 20px; /* Połowa szerokości ikony (40px) */
    width: 1px;
    background-color: #e5e5e5;
    z-index: 0;
  }
`;

const StepItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 20px;
  padding-bottom: 25px;
  position: relative;
  
  &:last-child {
    padding-bottom: 0;
  }
`;

const StepIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: white;
  border: 1px solid #e5e5e5;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1; /* Nad linią */
  flex-shrink: 0;
  color: #111;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
`;

const StepContent = styled.div`
  padding-top: 2px;
  h4 {
    margin: 0 0 4px 0;
    font-size: 15px;
    font-weight: 700;
    color: #111;
    text-align: left;
  }
  p {
  text-align: left;
    margin: 0;
    font-size: 13px;
    color: #666;
    line-height: 1.4;
  }
`;

// --- KOMPONENT ---

export const RealizationInfoCard = () => {
    return (
        <CardWrapper>
            <HeaderSection>
                <Info size={20} color="#333" />
                <Title>Proces realizacji wyjazdu</Title>
            </HeaderSection>

            <ContentSection>

                {/* Sekcja 1: Ostrzeżenie i Benefit */}
                <InfoGrid>
                    {/* Blokada planu */}
                    <InfoBox>
                        <div className="icon-row">
                            <Lock size={16} />
                            Blokada edycji planu
                        </div>
                        <p>
                            Po zgłoszeniu wyjazdu, samodzielna modyfikacja harmonogramu zostanie zablokowana.
                            Zmiany będą możliwe tylko po konsultacji z naszym supportem.
                        </p>
                    </InfoBox>

                    {/* Czat z adminem */}
                    <InfoBox $accent>
                        <div className="icon-row">
                            <MessageCircle size={16} />
                            Dostęp do Szybkiej Pomocy
                        </div>
                        <p>
                            Od momentu zgłoszenia otrzymasz dostęp do priorytetowego czatu z Administratorem,
                            który pomoże Ci w procesie weryfikacji i płatności.
                        </p>
                    </InfoBox>
                </InfoGrid>

                <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: 0 }} />

                {/* Sekcja 2: Etapy */}
                <div>
                    <StepsTitle>Etapy po zgłoszeniu</StepsTitle>
                    <StepsContainer>
                        <StepItem>
                            <StepIcon><Settings size={18} /></StepIcon>
                            <StepContent>
                                <h4>0. Konfiguracja wyjazdu</h4>
                                <p>Tworzysz plan wyjazdu według własnych preferencji, który ma zostać zrealizowany.</p>
                            </StepContent>
                        </StepItem>
                        <StepItem>
                            <StepIcon><FileSearch size={18} /></StepIcon>
                            <StepContent>
                                <h4>1. Weryfikacja</h4>
                                <p>Administrator sprawdza dostępność atrakcji i noclegów. Proces trwa zazwyczaj do 30 minut.</p>
                            </StepContent>
                        </StepItem>

                        <StepItem>
                            <StepIcon><CreditCard size={18} /></StepIcon>
                            <StepContent>
                                <h4>2. Płatności</h4>
                                <p>Uczestnicy otrzymują linki do płatności. Rezerwujemy miejsca dopiero po zaksięgowaniu wpłat.</p>
                            </StepContent>
                        </StepItem>

                        <StepItem>
                            <StepIcon><Stamp size={18} /></StepIcon>
                            <StepContent>
                                <h4>3. Akceptacja i Rezerwacja</h4>
                                <p>Po zebraniu środków, Administrator finalizuje rezerwacje i potwierdza wyjazd.</p>
                            </StepContent>
                        </StepItem>

                        <StepItem>
                            <StepIcon><Rocket size={18} /></StepIcon>
                            <StepContent>
                                <h4>4. Wyjazd zaplanowany!</h4>
                                <p>Gotowe! Otrzymujesz bilety, vouchery i ostateczny harmonogram.</p>
                            </StepContent>
                        </StepItem>

                    </StepsContainer>
                </div>

            </ContentSection>
        </CardWrapper>
    );
};