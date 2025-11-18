import React from 'react'; // Usunięto useState
import styled, { keyframes } from 'styled-components';
// Zmieniono importy ikon, aby pasowały do nowej zawartości
import { Sparkles, ArrowRight, Calendar, MapPin } from 'lucide-react';
import { ComponentHeader } from './destinationsSlider';

// --- STYLOWANE KOMPONENTY POBRANE 1:1 Z ConfiguratorCTA ---

const kenBurns = keyframes`
  0% {
    transform: scale(1) translateX(0);
  }
  50% {
    transform: scale(1.15) translateX(-20px);
  }
  100% {
    transform: scale(1) translateX(0);
  }
`;

const Section = styled.section`
 width: 90%;
    max-width: 1600px;
  background: #ffffff;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  flex-direction: column;
  margin-top: 50px;
  
`;

const Container = styled.div`
  width: 100%;
  min-height: 550px; 
  position: relative;
  border-radius: 2rem;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;

  @media (max-width: 768px) {
    justify-content: center; 
    min-height: 700px;
  }
`;

const BackgroundImage = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  border-radius: inherit;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    /* ZMIANA: Użycie propa $image zamiast hardcodowanego URL */
    background-image: url(${props => props.$image});
    background-size: cover;
    background-position: center;
    animation: ${kenBurns} 20s ease-in-out infinite;
  }
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    /* ZMIANA: Użycie gradientu z ConfiguratorCTA */
    background: linear-gradient(
      to right, 
      rgba(0, 0, 0, 0.6) 0%, 
      rgba(4, 120, 87, 0.3) 50%,
      transparent 100%
    );
    z-index: 2;
    
    /* Dodanie media query dla gradientu na mobilnych (z oryginału) */
    @media (max-width: 768px) {
      background: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.3) 0%,
        rgba(0, 0, 0, 0.7) 60%
      );
    }
  }
`;

const Content = styled.div`
  position: relative;
  z-index: 3;
  box-sizing: border-box;
  display: flex;
  padding: 20px; /* Padding z ConfiguratorCTA */
  
  @media screen and (max-width: 768px) {
    align-items: center;
    justify-content: center;
    width: 100%; /* Dodano dla pewności na mobilnych */
  }
`;

const GlassCard = styled.div`
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 1.5rem;
  max-width: 480px; /* Styl z ConfiguratorCTA */
  width: 100%;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  position: relative;
  overflow: hidden;
  padding: 15px 20px; /* Padding z ConfiguratorCTA */

  @media (max-width: 768px) {
    max-width: 90%;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
      circle,
      rgba(255, 255, 255, 0.15) 0%,
      transparent 70%
    );
    pointer-events: none;
  }
`;

const Badge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.875rem;
  background: rgba(255, 255, 255, 0.25); /* Styl tła z ConfiguratorCTA */
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3); /* Styl ramki z ConfiguratorCTA */
  border-radius: 2rem;
  color: white; /* Styl koloru z ConfiguratorCTA */
  font-size: 0.8125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  
  svg {
    width: 14px;
    height: 14px;
    /* ZMIANA: Użycie koloru białego, aby pasował do tła */
    color: white; 
  }
  
  span {
    color: white; /* ZMIANA: Użycie koloru białego */
  }
`;

const Title = styled.h2`
  font-size: 2rem; /* Rozmiar z ConfiguratorCTA */
  font-weight: 800;
  color: white;
  margin-bottom: 0.75rem;
  letter-spacing: -0.02em;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`;

const Description = styled.p`
  font-size: 0.9375rem; /* Rozmiar z ConfiguratorCTA */
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 1.5rem;
  line-height: 1.5;
  text-shadow: 0 1px 5px rgba(0, 0, 0, 0.3);
  
  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column; /* Układ kolumnowy z ConfiguratorCTA */
  gap: 0.75rem;
`;

const CTAButton = styled.button`
  padding: 0.5rem 1.25rem; /* Padding z ConfiguratorCTA */
  border-radius: 0.75rem; /* Radius z ConfiguratorCTA */
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  position: relative;
  overflow: hidden;
  
  ${props => props.$primary ? `
    /* Styl primary z ConfiguratorCTA */
    background: rgba(4, 120, 87, 0.5);
    backdrop-filter: blur(15px) saturate(180%);
    -webkit-backdrop-filter: blur(15px) saturate(180%);
    border: none;
    color: white;
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: rgba(5, 150, 105, 0.3);
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    &:hover {
      background: rgba(5, 150, 105, 0.6);
  
      &::before {
        opacity: 1;
      }
    }
  ` : `
    /* Styl secondary z ConfiguratorCTA */
    background: rgba(0, 23, 194, 0.36);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    border: none;
    color: white;
    
    &:hover {
      background: rgba(0, 23, 194, 0.44);
    }
  `}
  
  &:active {
    transform: translateY(0);
  }
  
  svg {
    width: 18px;
    height: 18px;
    position: relative;
    z-index: 1;
  }
  
  span {
    position: relative;
    z-index: 1;
  }
`;

const FeaturesList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.8125rem;
  
  /* Zastępuje ikonę CheckCircle stylizowanym '✓' z ConfiguratorCTA */
  &::before {
    content: '✓';
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: rgba(4, 120, 87, 0.4);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    font-weight: 700;
    font-size: 0.6875rem;
    /* Dodano dla wyrównania */
    flex-shrink: 0;
  }
`;

// --- PRZEBUDOWANY KOMPONENT BANNERU ---

export function TeacherOfferBanner({
    teacherImage = "https://images.unsplash.com/photo-1759868937821-acc700095191?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB0ZWFjaGVyJTIwc21pbGluZ3xlbnwxfHx8fDE3NjIwMzYzMzB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    onLearnMore = () => { },
    onContact = () => { }
}) {

    // Usunięto 'useState' i 'isHovered'

    return (
        <Section>
            <ComponentHeader>
                <div className="destinationSlider-badge">
                    <MapPin />
                    Współpraca ze szkołami
                </div>
                <h2 className="destinationSlider-title">System współpracy otwarty na szkoły!</h2>
                <p className="destinationSlider-subtitle">
                    Od
                </p>
            </ComponentHeader>
            <Container>
                {/* Użycie propa $image do przekazania obrazu */}
                <BackgroundImage $image={teacherImage} />

                {/* Usunięto FloatingIcons */}

                <Content>
                    <GlassCard>
                        <Badge>
                            <Sparkles />
                            {/* Zmieniono span dla spójności ze stylem badge */}
                            <span>Specjalna Oferta</span>
                        </Badge>

                        <Title>
                            Nauczyciele, Zarabiajcie Organizując Wycieczki!
                        </Title>

                        <Description>
                            Nasza platforma ułatwia organizację wycieczek klasowych, a Ty jako opiekun otrzymujesz atrakcyjną gratyfikację finansową.
                        </Description>

                        {/* Usunięto BenefitsList i HighlightBox */}

                        <ButtonGroup>
                            <CTAButton $primary onClick={onLearnMore}>
                                <ArrowRight />
                                <span>Dowiedz się więcej</span>
                            </CTAButton>

                            <CTAButton onClick={onContact}>
                                <Calendar />
                                <span>Umów konsultację</span>
                            </CTAButton>
                        </ButtonGroup>

                        {/* Lista przeniesiona tutaj i ostylowana jako FeaturesList */}
                        <FeaturesList>
                            <FeatureItem>Prosty system zarządzania grupą i płatnościami</FeatureItem>
                            <FeatureItem>Bezpłatna ubezpieczenie dla opiekunów</FeatureItem>
                            <FeatureItem>Dedykowany konsultant na każdym etapie</FeatureItem>
                            <FeatureItem>Materiały edukacyjne i gotowe programy wycieczek</FeatureItem>
                        </FeaturesList>

                    </GlassCard>
                </Content>
            </Container>
        </Section>
    );
}