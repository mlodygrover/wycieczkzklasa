import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  ShoppingBag,
  Calendar,
  Users,
  Wallet,
  Check,
  AlertCircle,
  X
} from 'lucide-react';

const portacc = process.env.REACT_APP_API_SOURCE || "https://api.draftngo.com";
// --- STYLES (Bliźniacze do RealizationInfoCard) ---

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

// --- STYLES DLA PODSUMOWANIA ---

const SummaryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #555;

  .label {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .value {
    font-weight: 600;
    color: #111;
  }
`;

const TotalDivider = styled.div`
  height: 1px;
  background-color: #eee;
  margin: 5px 0;
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 5px;

  .label {
    font-size: 14px;
    color: #666;
    font-weight: 500;
  }

  .value {
    font-size: 28px;
    font-weight: 800;
    color: #111;
    letter-spacing: -0.5px;
  }
  
  .currency {
    font-size: 16px;
    font-weight: 600;
    color: #666;
    margin-left: 5px;
  }
`;

// --- STYLES DLA AKCJI I REGULAMINU ---

const TermsBox = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f0f0f0;
  }

  input {
    margin-top: 3px;
    width: 18px;
    height: 18px;
    accent-color: black;
    cursor: pointer;
  }

  span {
    font-size: 13px;
    color: #666;
    line-height: 1.5;
    
    a {
      color: #111;
      font-weight: 600;
      text-decoration: none;
      &:hover { text-decoration: underline; }
    }
  }
`;

const ActionButton = styled.button`
  width: 100%;
  padding: 18px;
  background-color: #000;
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.2s ease;
  font-family: 'Inter', sans-serif;

  &:hover {
    background-color: #222;
    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
  }


  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

// --- MODAL STYLES ---

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: ${fadeIn} 0.2s ease-out;
  padding: 20px;
`;

const ModalCard = styled.div`
  background: white;
  width: 100%;
  max-width: 420px;
  border-radius: 24px;
  padding: 30px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  text-align: center;
  animation: ${slideUp} 0.3s ease-out;
  position: relative;
`;

const ModalIconWrapper = styled.div`
  width: 64px;
  height: 64px;
  background-color: #f0f0f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px auto;
  color: #111;
`;

const ModalTitle = styled.h2`
  margin: 0 0 10px 0;
  font-size: 20px;
  font-weight: 700;
  color: #111;
`;

const ModalDesc = styled.p`
  margin: 0 0 25px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.6;
`;

const ModalActions = styled.div`
  display: flex;
  gap: 12px;
`;

const ModalBtn = styled.button`
  flex: 1;
  padding: 14px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  border: none;
  font-family: 'Inter', sans-serif;
  transition: background 0.2s;

  &.cancel {
    background-color: #f5f5f5;
    color: #444;
    &:hover { background-color: #e5e5e5; }
  }

  &.confirm {
    background-color: #000;
    color: white;
    &:hover { background-color: #333; }
  }
`;

const CloseIcon = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  &:hover { color: #111; }
`;


// --- KOMPONENT GŁÓWNY ---

export const RealizationActionCard = ({
  tripName = "Twój wyjazd",
  dates = "Data nieustalona",
  participantsCount = 0,
  estimatedCost = 0,
  onRealize,
  tripId = null,
}) => {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleMainButtonClick = () => {
    if (termsAccepted) {
      setIsModalOpen(true);
    }
  };


  const handleConfirm = async () => {
    setIsModalOpen(false);

    try {
      // tripId musi być dostępne w tym komponencie (np. z props/state/URL)
      if (!tripId || !String(tripId).trim()) {
        console.warn("Brak tripId – nie wywołuję start realizacji.");
      } else {
        const resp = await fetch(
          `${portacc}/api/trip-plans/${encodeURIComponent(tripId)}/realization-status/start`,
          {
            method: "PUT",
            credentials: "include",
            headers: { Accept: "application/json" },
          }
        );

        // opcjonalnie: obsługa odpowiedzi
        const data = await resp.json().catch(() => null);

        if (!resp.ok) {
          console.warn("Start realization failed:", resp.status, data);
          // jeśli chcesz: pokaż toast / setError(data?.message || "Nie udało się rozpocząć realizacji")
        } else {
          // jeśli trzymasz plan w state, możesz go od razu zaktualizować:
          // setSynchronisedPlan((prev) => prev ? { ...prev, realizationStatus: 1 } : prev);
          console.log("Realization started:", data);
        }
      }
    } catch (e) {
      console.error("Start realization fetch error:", e);
    } finally {
      if (onRealize) onRealize();
    }
  };

  return (
    <>
      <CardWrapper>
        <HeaderSection>
          <ShoppingBag size={20} color="#333" />
          <Title>Podsumowanie i Realizacja</Title>
        </HeaderSection>

        <ContentSection>

          <SummaryList>
            <SummaryRow>
              <span className="label"><Calendar size={16} /> Data wyjazdu</span>
              <span className="value">{dates}</span>
            </SummaryRow>
            <SummaryRow>
              <span className="label"><Users size={16} /> Liczba uczestników</span>
              <span className="value">{participantsCount} os.</span>
            </SummaryRow>
            <SummaryRow>
              <span className="label"><Wallet size={16} /> Szac. koszt na osobę</span>
              <span className="value">~{estimatedCost} PLN</span>
            </SummaryRow>
          </SummaryList>

          <TotalDivider />

          <TotalRow>
            <span className="label">Razem (szacunkowo)</span>
            <div>
              <span className="value">{estimatedCost * (participantsCount || 1)}</span>
              <span className="currency">PLN</span>
            </div>
          </TotalRow>

          <TermsBox>
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
            />
            <span>
              Oświadczam, że akceptuję <a href="#">Regulamin</a> serwisu oraz zgadzam się na przetworzenie danych w celu weryfikacji dostępności atrakcji.
            </span>
          </TermsBox>

          <ActionButton disabled={!termsAccepted} onClick={handleMainButtonClick}>
            Prześlij do realizacji <Check size={20} />
          </ActionButton>

        </ContentSection>
      </CardWrapper>

      {/* --- POPUP --- */}
      {isModalOpen && (
        <ModalOverlay onClick={() => setIsModalOpen(false)}>
          <ModalCard onClick={(e) => e.stopPropagation()}>
            <CloseIcon onClick={() => setIsModalOpen(false)}>
              <X size={24} />
            </CloseIcon>

            <ModalIconWrapper>
              <AlertCircle size={32} />
            </ModalIconWrapper>

            <ModalTitle>Potwierdzenie realizacji</ModalTitle>

            <ModalDesc>
              Czy na pewno chcesz przesłać wyjazd <strong>"{tripName}"</strong> do realizacji? <br />
              Od tego momentu edycja planu zostanie zablokowana, a Administrator rozpocznie proces weryfikacji rezerwacji.
            </ModalDesc>

            <ModalActions>
              <ModalBtn className="cancel" onClick={() => setIsModalOpen(false)}>
                Anuluj
              </ModalBtn>
              <ModalBtn className="confirm" onClick={handleConfirm}>
                Potwierdzam, wyślij
              </ModalBtn>
            </ModalActions>
          </ModalCard>
        </ModalOverlay>
      )}
    </>
  );
};