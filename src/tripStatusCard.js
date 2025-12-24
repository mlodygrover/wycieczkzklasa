import React from 'react';
import styled, { keyframes } from 'styled-components';
import { 
  Sparkles, 
  ArrowRight, 
  MapPinCheck, 
  FileSearch, 
  CreditCard, 
  Stamp, 
  CalendarCheck 
} from 'lucide-react';

// --- ANIMACJE (Monochromatyczne) ---

const rotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const grayscalePulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.1); }
  70% { box-shadow: 0 0 0 10px rgba(0, 0, 0, 0); }
  100% { box-shadow: 0 0 0 0 rgba(0, 0, 0, 0); }
`;

// --- STYLES ---

const CardWrapper = styled.div`
  width: 90%;
  max-width: 1600px;
  background: white;
  border-radius: 20px;
  padding: 24px 30px;
  box-sizing: border-box;
  border: 1px solid #e5e5e5;
  margin: 10px auto;
  display: flex;
  align-items: center;
  gap: 25px;
  transition: all 0.3s ease;
  
  /* Subtelny hover */
  &:hover {
    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
    border-color: #d4d4d4;
  }

  @media (max-width: 600px) {
    flex-direction: column;
    text-align: center;
    padding: 20px;
  }
`;

const LoaderContainer = styled.div`
  position: relative;
  width: 64px;
  height: 64px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LoaderRing = styled.div`
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 3px solid transparent;
  border-top-color: #000000;
  border-right-color: #e5e5e5;
  
  /* Jeśli status == 4 (Zakończono), zatrzymujemy animację lub zmieniamy styl */
  animation: ${props => props.$isDone ? 'none' : rotate} 2s linear infinite;
  border-color: ${props => props.$isDone ? '#000' : ''}; /* Pełne kółko dla statusu 4 */
`;

const IconBackground = styled.div`
  width: 100%;
  height: 100%;
  background: #000000;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  
  animation: ${props => props.$isDone ? 'none' : grayscalePulse} 3s infinite;
`;

const ContentBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;

  @media (max-width: 600px) {
    align-items: center;
  }
`;

const StatusTitle = styled.div`
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 700;
  color: #000;
  background-color: #f4f4f4;
  border: 1px solid #e5e5e5;
  padding: 6px 12px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    stroke-width: 2px;
  }
`;

const MainText = styled.div`
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  color: #111;
  line-height: 1.6;
  font-weight: 500;
  
  span.highlight {
    color: #6366f1; /* Fioletowy akcent */
    font-weight: 700;
  }
`;

const ActionLink = styled.button`
  background: none;
  border: none;
  padding: 0;
  margin-top: 8px;
  
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #000;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  
  border-bottom: 2px solid #000;
  padding-bottom: 2px;
  transition: all 0.3s ease;

  &:hover {
    opacity: 0.7;
    gap: 12px;
  }
`;

// --- KONFIGURACJA STATUSÓW ---

const getStatusConfig = (status) => {
  switch (status) {
    case 1:
      return {
        title: "W trakcie weryfikacji",
        icon: FileSearch,
        content: (
          <>
            Administrator zweryfikuje wyjazd w przeciągu paru minut, następnym krokiem będzie <span className="highlight">realizacja płatności</span>.
          </>
        ),
        linkText: "Aby poznać szczegóły procesu realizacji kliknij tutaj"
      };
    case 2:
      return {
        title: "W trakcie płatności",
        icon: CreditCard,
        content: (
          <>
            Uczestnicy wyjazdu mogą realizować płatności w <span className="highlight">zakładce płatności</span>.
          </>
        ),
        linkText: "Aby poznać szczegóły procesu realizacji kliknij tutaj"
      };
    case 3:
      return {
        title: "W trakcie akceptacji",
        icon: Stamp,
        content: (
          <>
            Jesteśmy bardzo blisko! <span className="highlight">Administrator</span> musi zatwierdzić wyjazd.
          </>
        ),
        linkText: null // Brak linku w tym etapie
      };
    case 4:
      return {
        title: "Wyjazd zaplanowany!",
        icon: CalendarCheck,
        content: (
          <>
            Wszystkie formalności zostały dopełnione, oczekujemy <span className="highlight">dnia wyjazdu</span>!
          </>
        ),
        linkText: null // Brak linku w tym etapie
      };
    case 0:
    default:
      return {
        title: "W trakcie projektowania",
        icon: MapPinCheck,
        content: (
          <>
            Skorzystaj z konfiguratora aby zaplanować wyjazd – z pomocą służy nasz <span className="highlight">Asystent AI</span>.
          </>
        ),
        linkText: "Aby zrealizować wyjazd kliknij tutaj"
      };
  }
};

// --- KOMPONENT ---

export const TripStatusCard = ({ onRealizeClick, status = 0 }) => {
  const config = getStatusConfig(status);
  const IconComponent = config.icon;
  const isDone = status === 4; // status 4 to "done", wyłączamy animacje loadera

  return (
    <CardWrapper>
      {/* Sekcja Loadera */}
      <LoaderContainer>
        <LoaderRing $isDone={isDone} />
        <IconBackground $isDone={isDone}>
          <IconComponent size={28} strokeWidth={1.5} />
        </IconBackground>
      </LoaderContainer>

      {/* Sekcja Tekstowa */}
      <ContentBox>
        <StatusTitle>
           <Sparkles size={14} color="black" /> {config.title}
        </StatusTitle>
        
        <MainText>
          {config.content}
        </MainText>

        {config.linkText && (
          <ActionLink onClick={onRealizeClick}>
            {config.linkText}
            <ArrowRight size={18} />
          </ActionLink>
        )}
      </ContentBox>
    </CardWrapper>
  );
};