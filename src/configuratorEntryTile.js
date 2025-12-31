import React from 'react';
import styled, { css } from 'styled-components';
import { ArrowRight, Check, X, Lock } from 'lucide-react';

/* ===================== STYLES ===================== */

const OuterWrapper = styled.div`
  width: 90%;
  max-width: 1600px;
  padding: 0 16px;
  box-sizing: border-box;
  margin: 20px auto;
  display: flex;
  justify-content: center;
`;

const TileCard = styled.div`
  width: 100%;
  min-height: 140px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 24px;
  
  padding: 32px;
  box-sizing: border-box;
  border-radius: 16px;
  font-family: 'Inter', sans-serif;
  transition: all 0.3s ease-in-out;
  background-color: #fff;
  text-align: left;

  /* Logika stylów: BLOCKED ma priorytet nad READY */
  ${p => p.$blocked ? css`
    /* Styl ZABLOKOWANY - Szary/Niebieskawy, solidny, brak pointera */
    border: 2px solid #cbd5e1; /* Slate-300 */
    background-color: #f8fafc; /* Slate-50 */
    cursor: default;
    
    &:hover {
      box-shadow: none;
      transform: none;
    }
  ` : p.$ready ? css`
    /* Styl GOTOWY */
    border: 2px solid #111;
    box-shadow: 0 4px 20px rgba(0,0,0,0.04);
    cursor: pointer;

    &:hover {
      box-shadow: 0 12px 30px rgba(0,0,0,0.08);
      transform: translateY(-2px);
      border-color: #000;
    }
  ` : css`
    /* Styl NIEGOTOWY */
    border: 2px dashed #e5e5e5;
    background-color: #fafafa;
    cursor: not-allowed;
    
    &:hover {
      background-color: #f5f5f5;
    }
  `}

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 16px;
    padding: 24px;
  }
`;

const AnimatedIconContainer = styled.div`
  position: relative;
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  border-radius: 50%;
  
  /* Kolory tła ikony */
  background-color: ${p => 
    p.$blocked ? '#e2e8f0' :  // Szary dla blocked
    p.$ready ? '#dcfce7' :    // Zielony dla ready
    '#fee2e2'                 // Czerwony dla not ready
  };
  
  transition: background-color 0.5s ease;
`;

const IconBase = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
`;

// Ikona X (Czerwona) - widoczna tylko gdy !ready i !blocked
const XIconStyled = styled(IconBase)`
  color: #ef4444;
  opacity: ${p => (!p.$ready && !p.$blocked) ? 1 : 0};
  transform: translate(-50%, -50%) 
             rotate(${p => (!p.$ready && !p.$blocked) ? '0deg' : '-90deg'}) 
             scale(${p => (!p.$ready && !p.$blocked) ? 1 : 0.5});
`;

// Ikona Check (Zielona) - widoczna tylko gdy ready i !blocked
const CheckIconStyled = styled(IconBase)`
  color: #16a34a;
  opacity: ${p => (p.$ready && !p.$blocked) ? 1 : 0};
  transform: translate(-50%, -50%) 
             rotate(${p => (p.$ready && !p.$blocked) ? '0deg' : '90deg'}) 
             scale(${p => (p.$ready && !p.$blocked) ? 1 : 0.5});
`;

// Ikona Kłódki (Szara/Czarna) - widoczna tylko gdy blocked
const LockIconStyled = styled(IconBase)`
  color: #64748b; /* Slate-500 */
  opacity: ${p => p.$blocked ? 1 : 0};
  transform: translate(-50%, -50%) 
             scale(${p => p.$blocked ? 1 : 0.5});
`;

const ContentColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: ${p => p.$blocked ? '#475569' : (p.$ready ? '#111' : '#6b7280')};
  transition: color 0.3s ease;
`;

const Description = styled.p`
  margin: 0;
  font-size: 15px;
  color: ${p => p.$blocked ? '#64748b' : '#6b7280'};
  line-height: 1.5;
  max-width: 600px;
  
  /* Jeśli zablokowane, tekst może być nieco bardziej widoczny/ostrzegawczy, ale tu trzymamy neutralny */
`;

const BlackButton = styled.button`
  margin-top: 12px;
  background-color: #000;
  color: #fff;
  border: none;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 10px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s, transform 0.2s;
  font-family: 'Inter', sans-serif;
  align-self: flex-start;

  &:hover {
    background-color: #222;
    transform: translateY(-1px);
  }

  &:active {
    transform: scale(0.98);
  }

  @media (max-width: 768px) {
    align-self: center;
  }
`;

const ContactInfo = styled.div`
  margin-top: 8px;
  font-size: 14px;
  color: #475569;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  
  a {
    color: #000;
    text-decoration: underline;
    font-weight: 600;
    cursor: pointer;
    &:hover {
        color: #333;
    }
  }
`;

/* ===================== COMPONENT ===================== */

export const ConfiguratorEntryTile = ({ isLogged=false, ready, tripId, konfiguratorUrl, blocked=false }) => {
    
    const handleClick = () => {
        // Zablokuj kliknięcie jeśli blocked jest true
        if (!blocked && ready && (tripId || !isLogged)) {
            window.location.href = `${konfiguratorUrl}`;
        }
    };

    // Logika tekstów
    let titleText = 'Uzupełnij dane wyjazdu';
    let descText = 'Aby odblokować konfigurator, musisz uzupełnić wszystkie wymagane pola powyżej (miejsca, daty oraz liczbę uczestników).';

    if (blocked) {
        titleText = 'Plan przekazany do realizacji';
        descText = 'Konfigurator został zablokowany, ponieważ wyjazd jest w trakcie realizacji. Wszelkie zmiany w planie lub harmonogramie są możliwe wyłącznie poprzez bezpośredni kontakt z działem wsparcia.';
    } else if (ready) {
        titleText = 'Planer podróży gotowy!';
        descText = 'Wszystkie niezbędne informacje zostały wprowadzone. Możesz teraz przejść do szczegółowego planera, aby ustalić harmonogram i atrakcje.';
    }

    return (
        <OuterWrapper>
            <TileCard 
                $ready={ready} 
                $blocked={blocked} 
                onClick={(!blocked && ready) ? handleClick : undefined}
            >

                {/* Lewa strona - Animowana ikona */}
                <AnimatedIconContainer $ready={ready} $blocked={blocked}>
                    
                    <XIconStyled $ready={ready} $blocked={blocked}>
                        <X size={28} strokeWidth={2.5} />
                    </XIconStyled>
                    
                    <CheckIconStyled $ready={ready} $blocked={blocked}>
                        <Check size={28} strokeWidth={2.5} />
                    </CheckIconStyled>

                    {/* Nowa ikona kłódki */}
                    <LockIconStyled $blocked={blocked}>
                        <Lock size={26} strokeWidth={2.5} />
                    </LockIconStyled>

                </AnimatedIconContainer>

                {/* Prawa strona - Treść */}
                <ContentColumn>
                    <Title $ready={ready} $blocked={blocked}>
                        {titleText}
                    </Title>

                    <Description $blocked={blocked}>
                        {descText}
                    </Description>

                    {/* Przycisk widoczny tylko gdy gotowe i NIE zablokowane */}
                    {!blocked && ready && (
                        <BlackButton onClick={(e) => {
                            e.stopPropagation();
                            handleClick();
                        }}>
                            Przejdź do konfiguratora <ArrowRight size={18} />
                        </BlackButton>
                    )}

                    {/* Opcjonalnie: Link do kontaktu gdy zablokowane */}
                    {blocked && (
                        <ContactInfo>
                            <span>Potrzebujesz zmian?</span>
                            <a href="mailto:support@draftngo.com">Napisz do nas</a>
                        </ContactInfo>
                    )}
                </ContentColumn>

            </TileCard>
        </OuterWrapper>
    );
};