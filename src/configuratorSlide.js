import styled, { keyframes } from 'styled-components';
import { Sparkles, Edit3, Plus, MapPin } from 'lucide-react';
import { ComponentHeader } from './destinationsSlider';

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
      backgrrgba(32, 9, 9, 1)ffffff;
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
  /* DODANE LINIE: */
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
  /* DODANE LINIE: */
  border-radius: inherit; /* Dziedziczy '2rem' z <Container> */
  overflow: hidden;
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920');
    background-size: cover;
    background-position: center;
    animation: ${kenBurns} 20s ease-in-out infinite;
  }
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to right, 
      rgba(0, 0, 0, 0.6) 0%, 
      rgba(4, 120, 87, 0.3) 50%,
      transparent 100%
    );
    z-index: 2;
  }
`;

const Content = styled.div`
  position: relative;
  z-index: 3;
  box-sizing: border-box;
  display: flex;
  padding: 20px;
  @media screen and (max-width: 768px) {
    align-items: center;
    justify-content: center;
    }
 
`;

const GlassCard = styled.div`
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 1.5rem;
  max-width: 480px;
  width: 100%;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  position: relative;
  overflow: hidden;
  padding: 15px 20px;
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
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 2rem;
  color: white;
  font-size: 0.8125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const Title = styled.h2`
  font-size: 2rem;
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
  font-size: 0.9375rem;
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
  flex-direction: column;
  gap: 0.75rem;
`;

const CTAButton = styled.button`
  padding: 0.5rem 1.25rem;
  border-radius: 0.75rem;
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
  }
`;

export default function ConfiguratorCTA() {
    return (
        <Section>
            <ComponentHeader>
                <div className="destinationSlider-badge">
                    <MapPin />
                    Odkryj nasz konfigurator
                </div>
                <h2 className="destinationSlider-title">To nigdy nie było takie proste</h2>
                <p className="destinationSlider-subtitle">
                    Nie liczy się nic więcej niż Twój pomysł. Z pomocą naszego konfiguratora stworzysz wyjazd perfekcyjnie dopasowany do swoich oczekiwań. 
                </p>
            </ComponentHeader>
            <Container>
                <BackgroundImage />

                <Content>
                    <GlassCard>
                        <Badge>
                            <Sparkles />
                            Zacznij planować
                        </Badge>

                        <Title>Stwórz swoją wymarzoną podróż</Title>

                        <Description>
                            Skorzystaj z naszego inteligentnego konfiguratora, aby zaplanować idealny wyjazd
                            dopasowany do Twoich potrzeb i budżetu.
                        </Description>

                        <ButtonGroup>
                            <CTAButton $primary>
                                <Plus />
                                <span>Stwórz od podstaw</span>
                            </CTAButton>

                            <CTAButton>
                                <Edit3 />
                                <span>Modyfikuj gotowy plan</span>
                            </CTAButton>
                        </ButtonGroup>

                        <FeaturesList>
                            <FeatureItem>Porównanie cen</FeatureItem>
                            <FeatureItem>Elastyczne daty</FeatureItem>
                            <FeatureItem>Bezpieczne płatności</FeatureItem>
                            <FeatureItem>Wsparcie 24/7</FeatureItem>
                        </FeaturesList>
                    </GlassCard>
                </Content>
            </Container>
        </Section>
    );
}
