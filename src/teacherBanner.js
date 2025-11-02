import { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'motion/react';
import { GraduationCap, Users, DollarSign, Calendar, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';

const BannerContainer = styled.div`
  width: 90%;
  margin: 0 auto;
  padding: 2rem;
  max-width: 1600px;
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const BannerCard = styled(motion.div)`
  position: relative;
  width: 100%;
  min-height: 600px;
  border-radius: 32px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);

  @media (max-width: 768px) {
    min-height: 700px;
  }
`;

const BackgroundImage = styled.div`
  position: absolute;
  inset: 0;
  background-image: url(${props => props.$image});
  background-size: cover;
  background-position: center right;
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to right,
      rgba(0, 0, 0, 0.7) 0%,
      rgba(0, 0, 0, 0.4) 50%,
      transparent 80%
    );
  }

  @media (max-width: 768px) {
    background-position: center;
    
    &::after {
      background: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.3) 0%,
        rgba(0, 0, 0, 0.7) 60%
      );
    }
  }
`;

const ContentContainer = styled.div`
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 3rem;

  @media (max-width: 768px) {
    align-items: flex-end;
    padding: 2rem;
  }
`;

const GlassCard = styled(motion.div)`
  max-width: 600px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 24px;
  padding: 2.5rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.25) 0%,
      rgba(255, 255, 255, 0.05) 50%,
      transparent 100%
    );
    pointer-events: none;
  }

  @media (max-width: 768px) {
    max-width: 100%;
    padding: 2rem;
  }
`;

const BadgeContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const Badge = styled(motion.div)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  background: rgba(251, 191, 36, 0.2);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(251, 191, 36, 0.4);

  svg {
    width: 1rem;
    height: 1rem;
    color: #fbbf24;
  }

  span {
    color: #fbbf24;
    font-size: 0.875rem;
  }
`;

const Title = styled(motion.h2)`
  color: white;
  font-size: 2.5rem;
  margin: 0 0 1rem 0;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled(motion.p)`
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.125rem;
  margin: 0 0 2rem 0;
  line-height: 1.6;
`;

const BenefitsList = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const BenefitItem = styled(motion.div)`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  color: white;

  svg {
    width: 1.25rem;
    height: 1.25rem;
    margin-top: 0.125rem;
    flex-shrink: 0;
    color: #10b981;
  }

  span {
    font-size: 1rem;
    line-height: 1.5;
  }
`;

const HighlightBox = styled(motion.div)`
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const HighlightTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;

  svg {
    width: 1.5rem;
    height: 1.5rem;
    color: #10b981;
  }

  span {
    color: #10b981;
  }
`;

const HighlightText = styled.p`
  color: white;
  font-size: 1.125rem;
  margin: 0;
  line-height: 1.5;

  strong {
    color: #10b981;
    font-size: 1.5rem;
    display: inline-block;
    margin-right: 0.25rem;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const PrimaryButton = styled(motion.button)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border-radius: 16px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 40px rgba(16, 185, 129, 0.4);
  }

  svg {
    width: 1.25rem;
    height: 1.25rem;
  }
`;

const SecondaryButton = styled(motion.button)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  svg {
    width: 1.25rem;
    height: 1.25rem;
  }
`;

const FloatingIcon = styled(motion.div)`
  position: absolute;
  color: rgba(255, 255, 255, 0.15);
  pointer-events: none;
`;

export function TeacherOfferBanner({ 
  teacherImage = "https://images.unsplash.com/photo-1759868937821-acc700095191?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB0ZWFjaGVyJTIwc21pbGluZ3xlbnwxfHx8fDE3NjIwMzYzMzB8MA&ixlib=rb-4.1.0&q=80&w=1080",
  onLearnMore = () => {},
  onContact = () => {}
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <BannerContainer>
      <BannerCard
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <BackgroundImage $image={teacherImage} />

        {/* Floating decorative icons */}
        <FloatingIcon
          style={{ top: '5%', right: '15%' }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <GraduationCap size={48} />
        </FloatingIcon>

        <FloatingIcon
          style={{ bottom: '10%', right: '25%' }}
          animate={{
            y: [0, 20, 0],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        >
          <Users size={40} />
        </FloatingIcon>

        <ContentContainer>
          <GlassCard
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <BadgeContainer>
              <Badge
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Sparkles />
                <span>Specjalna Oferta</span>
              </Badge>
            </BadgeContainer>

            <Title
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Nauczyciele, Zarabiajcie Organizując Wycieczki!
            </Title>

            <Subtitle
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              Nasza platforma ułatwia organizację wycieczek klasowych, a Ty jako opiekun otrzymujesz atrakcyjną gratyfikację finansową.
            </Subtitle>

            <BenefitsList>
              <BenefitItem
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <CheckCircle />
                <span>Prosty system zarządzania grupą i płatnościami</span>
              </BenefitItem>
              
              <BenefitItem
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
              >
                <CheckCircle />
                <span>Bezpłatna ubezpieczenie dla opiekunów</span>
              </BenefitItem>
              
              <BenefitItem
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
              >
                <CheckCircle />
                <span>Dedykowany konsultant na każdym etapie</span>
              </BenefitItem>
              
              <BenefitItem
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0 }}
              >
                <CheckCircle />
                <span>Materiały edukacyjne i gotowe programy wycieczek</span>
              </BenefitItem>
            </BenefitsList>

            <ButtonContainer>
              <PrimaryButton
                onClick={onLearnMore}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Dowiedz się więcej
                <ArrowRight />
              </PrimaryButton>
              
              <SecondaryButton
                onClick={onContact}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Calendar />
                Umów konsultację
              </SecondaryButton>
            </ButtonContainer>
          </GlassCard>
        </ContentContainer>
      </BannerCard>
    </BannerContainer>
  );
}
