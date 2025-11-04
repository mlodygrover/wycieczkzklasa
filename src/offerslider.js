import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, MapPin, Calendar, User } from 'lucide-react';

// --- Styled Components z optymalizacjami ---

const SliderContainer = styled.div`
  position: relative;
  width: 100%;
  min-height: 700px;
  height: 100vh;
  overflow: hidden;
  @media (max-width: 640px) {
  height: 90vh;
  }
`;

const BackgroundImage = styled(motion.div)`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background-image: ${props => `url(${props.$image})`};
  
  /* --- POPRAWKA --- */
  background-size: cover;       /* Użyj 'cover' aby zachować proporcje */
  background-position: center;  /* Wyśrodkuj obraz */
  /* --- KONIEC POPRAWKI --- */

  filter: blur(0px) brightness(0.7);
  transition: none; /* Animacja 'background-position' nie będzie już działać */

  @media (max-width: 640px) {
    filter: brightness(0.7);
  }
`;

const GradientOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), transparent, rgba(0, 0, 0, 0.5));
`;

const SliderContent = styled.div`
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 2rem;

  @media (max-width: 640px) {
    padding: 0 1rem;
  }
`;

const SliderInner = styled.div`
  width: 100%;
  max-width: 1400px;
  position: relative;
`;

const SlidesContainer = styled.div`
  position: relative;
  height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  @media (max-width: 640px) {
    height: 500px;
  }
`;

const SideSlide = styled(motion.div)`
  position: absolute;
  width: 300px;
  height: 500px;
  border-radius: 24px;
  overflow: hidden;
  opacity: 0.9;
  cursor: pointer;
  transition: opacity 0.3s ease;
  border: 1px solid white;
  &:hover {
    opacity: 1;
  }

  /* RESPONSIVE: Ukrywamy boczne slajdy na mobilkach */
  @media (max-width: 640px) {
    display: none;
  }
`;

const SideSlideImage = styled.div`
  position: relative;
  width: 100%;
  height: 100%;

  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const SideSlideGradient = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);
`;

const MainSlideContainer = styled(motion.div)`
  position: absolute;
  width: 400px;
  height: 550px;
  border-radius: 24px;
  overflow: hidden;
  cursor: grab;
  perspective: 1000px;
  touch-action: none;
  &:active {
    cursor: grabbing;
  }

  /* RESPONSIVE: Slajd zajmuje pełną szerokość (z paddingiem) */
  @media (max-width: 640px) {
    width: 100%; /* Użyje 100% szerokości w ramach paddingu rodzica */
    height: 480px; /* Lekka korekta wysokości */
  }
`;

const SlideBackground = styled.div`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background-image: ${props => `url(${props.$image})`};
  background-size: cover;
  background-position: center;
  touch-action: none;
`;

const GlassOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  /* OPTYMALIZACJA: Wyłączamy najcięższy efekt na mobilkach */
  touch-action: none;
  @media (max-width: 640px) {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    /* Dajemy proste tło, aby tekst był czytelny */
    background: rgba(0, 0, 0, 0.25); 
  }
`;

const GlassGradient = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom right, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.05), transparent);
  touch-action: none;
`;

// --- POPRAWKA LAYOUTU TREŚCI ---
const SlideContent = styled.div`
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 2rem;
  box-sizing: border-box;
  touch-action: none;
  @media (max-width: 640px) {
    padding: 1.5rem;
  }
`;

const SlideInfo = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  touch-action: none;
  /* DODANE: Te 4 linie to sedno poprawki */
  flex-grow: 1; /* Wypełnij dostępną przestrzeń nad stopką */
  justify-content: flex-end; /* Wypchnij treść do dołu (do stopki) */
  min-height: 0; /* Kluczowe dla poprawnego działania flex i overflow */
  overflow-y: auto; /* Włącz przewijanie, jeśli treść się nie mieści */
`;
// --- KONIEC POPRAWKI ---

const SpecialBadge = styled.div`
  display: inline-block;
  width: fit-content;
  padding: 0.375rem 1rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);

  span {
    color: white;
    font-size: 0.875rem;
  }

  /* OPTYMALIZACJA: Wyłączamy blur */
  @media (max-width: 640px) {
    backdrop-filter: none;
    background: rgba(255, 255, 255, 0.25);
  }
`;

const SlideTitle = styled.h2`
  color: white;
  font-size: 2.25rem;
  margin: 0;
  text-align: left;
  @media (max-width: 640px) {
    font-size: 1.875rem;
  }
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.9);

  svg {
    width: 1rem;
    height: 1rem;
  }
`;

// --- POPRAWKA LAYOUTU TREŚCI ---
const SlideFooter = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  gap: 10px;
  /* DODANE: Zapobiega kurczeniu się stopki */
  flex-shrink: 0;
`;
// --- KONIEC POPRAWKI ---

const PriceSection = styled.div`
  p:first-child {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.875rem;
    margin: 0;
  }

  p:last-child {
    color: white;
    font-size: 1.5rem;
    margin: 0.25rem 0 0 0;
  }
`;

const ViewButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  background: white;
  color: black;
  border: none;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.9);
  }
`;

const NavigationContainer = styled.div`
  position: absolute;
  bottom: -50px; 
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 10;
  min-width: 250px;
  justify-content: space-between;
`;

const NavButton = styled.button`
  width: 3rem;
  height: 3rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  svg {
    width: 1.5rem;
    height: 1.5rem;
    color: white;
  }

  /* OPTYMALIZACJA: Wyłączamy blur */
  @media (max-width: 640px) {
    backdrop-filter: none;
    background: rgba(255, 255, 255, 0.2);
  }
`;

const DotsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const Dot = styled.button`
  height: 0.5rem;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.$active ? 'white' : 'rgba(255, 255, 255, 0.4)'};
  width: ${props => props.$active ? '2rem' : '0.5rem'};

  &:hover {
    background: ${props => props.$active ? 'white' : 'rgba(255, 255, 255, 0.6)'};
  }
`;

// --- Domyślne dane ---
const defaultTrips = [
  {
    id: 1,
    title: "Rajska Plaża",
    location: "Malediwy",
    duration: "7 dni / 6 nocy",
    price: "5 499 zł",
    badge: "Oferta specjalna",
    image: "https://images.unsplash.com/photo-1558117338-aa433feb1c62?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm9waWNhbCUyMGJlYWNoJTIwcmVzb3J0fGVufDF8fHx8MTc2MTgzMzYzOXww&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 2,
    title: "Alpejskie Szczyty",
    location: "Szwajcaria",
    duration: "5 dni / 4 noce",
    price: "4 299 zł",
    badge: "Bestseller",
    image: "https://images.unsplash.com/photo-1656522828763-276b3eb5c8e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGxhbmRzY2FwZSUyMGFscHN8ZW58MXx8fHwxNzYxODkxNTg2fDA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 3,
    title: "Greckie Wybrzeże",
    location: "Santorini",
    duration: "6 dni / 5 nocy",
    price: "3 899 zł",
    badge: "Nowa oferta",
    image: "https://images.unsplash.com/photo-1669203408570-4140ee21f211?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYW50b3JpbmklMjBncmVlY2UlMjBzdW5zZXR8ZW58MXx8fHwxNzYxODY3MTEwfDA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 4,
    title: "Wyspa Bogów",
    location: "Bali, Indonezja",
    duration: "10 dni / 9 nocy",
    price: "6 199 zł",
    badge: "Premium",
    image: "https://images.unsplash.com/photo-1676878912863-2849fe9fb18c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWxpJTIwdGVtcGxlJTIwbmF0dXJlfGVufDF8fHx8MTc2MTgxMDgxMXww&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 5,
    title: "Miasto Miłości",
    location: "Paryż, Francja",
    duration: "4 dni / 3 noce",
    price: "2 799 zł",
    badge: "Last minute",
    image: "https://images.unsplash.com/photo-1431274172761-fca41d930114?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJpcyUyMGVpZmZlbCUyMHRvd2VyfGVufDF8fHx8MTc2MTkwNzU3MHww&ixlib=rb-4.1.0&q=80&w=1080"
  }
];

// --- Logika komponentu ---

export function TravelSlider({ trips = defaultTrips }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [backgroundOffset, setBackgroundOffset] = useState(0);

  useEffect(() => {
    setBackgroundOffset(currentIndex * 50);
  }, [currentIndex]);

  if (!trips || trips.length === 0) {
    return (
      <SliderContainer>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'white' }}>
          <p>Brak dostępnych wyjazdów</p>
        </div>
      </SliderContainer>
    );
  }

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
    }),
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset, velocity) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => {
      if (newDirection === 1) {
        return prevIndex === trips.length - 1 ? 0 : prevIndex + 1;
      } else {
        return prevIndex === 0 ? trips.length - 1 : prevIndex - 1;
      }
    });
  };

  const getPrevIndex = () => (currentIndex === 0 ? trips.length - 1 : currentIndex - 1);
  const getNextIndex = () => (currentIndex === trips.length - 1 ? 0 : currentIndex + 1);

  const currentTrip = trips[currentIndex];
  const prevTrip = trips[getPrevIndex()];
  const nextTrip = trips[getNextIndex()];

  return (
    <SliderContainer>
      <BackgroundImage
        $image={currentTrip.image}
        style={{ backgroundPosition: `${backgroundOffset}% center` }}
      />
      <GradientOverlay />

      <SliderContent>
        <SliderInner>
          <SlidesContainer>
            {/* Poprzedni slajd (ukryty na mobilkach przez CSS) */}
            <SideSlide
              animate={{
                x: -50,
                scale: 0.85,
                rotateY: 15,
              }}
              transition={{ duration: 0.5 }}
              onClick={() => paginate(-1)}
              style={{ left: 0 }}
            >
              <SideSlideImage>
                <img src={prevTrip.image} alt={prevTrip.title} />
                <SideSlideGradient />
              </SideSlideImage>
            </SideSlide>

            {/* Centralny slajd */}
            <AnimatePresence initial={false} custom={direction}>
              <MainSlideContainer
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.3 },
                  scale: { duration: 0.3 },
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = swipePower(offset.x, velocity.x);

                  if (swipe < -swipeConfidenceThreshold) {
                    paginate(1);
                  } else if (swipe > swipeConfidenceThreshold) {
                    paginate(-1);
                  }
                }}
              >
                <SlideBackground $image={currentTrip.image} />

                <GlassOverlay>
                  <GlassGradient />

                  {/* --- POPRAWIONY BLOK TREŚCI --- */}
                  <SlideContent>
                    <SlideInfo
                      key={currentIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.4 }}
                    >
                      {currentTrip.badge && (
                        <SpecialBadge>
                          <span>{currentTrip.badge}</span>
                        </SpecialBadge>
                      )}

                      <SlideTitle>{currentTrip.title}</SlideTitle>

                      {currentTrip.location && (
                        <InfoRow>
                          <MapPin />
                          <span>{currentTrip.location}</span>
                        </InfoRow>
                      )}

                      {currentTrip.duration && (
                        <InfoRow>
                          <Calendar />
                          <span>{currentTrip.duration}</span>
                        </InfoRow>
                      )}
                      {currentTrip.author && (
                        <InfoRow>
                          <User />
                          <span>{currentTrip.author}</span>
                        </InfoRow>
                      )}
                    </SlideInfo>

                    <SlideFooter
                      key={`${currentIndex}-footer`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.4 }}
                    >
                      <PriceSection>
                        <p>Od</p>
                        <p>{currentTrip.price}</p>
                      </PriceSection>
                      <ViewButton>Otwórz w konfiguratorze</ViewButton>
                    </SlideFooter>
                  </SlideContent>
                  {/* --- KONIEC POPRAWIONEGO BLOKU --- */}

                </GlassOverlay>
              </MainSlideContainer>
            </AnimatePresence>

            {/* Następny slajd (ukryty na mobilkach przez CSS) */}
            <SideSlide
              animate={{
                x: 50,
                scale: 0.85,
                rotateY: -15,
              }}
              transition={{ duration: 0.5 }}
              onClick={() => paginate(1)}
              style={{ right: 0 }}
            >
              <SideSlideImage>
                <img src={nextTrip.image} alt={nextTrip.title} />
                <SideSlideGradient />
              </SideSlideImage>
            </SideSlide>
          </SlidesContainer>

          <NavigationContainer>
            <NavButton onClick={() => paginate(-1)}>
              <ChevronLeft />
            </NavButton>

            <DotsContainer>
              {trips.map((_, index) => (
                <Dot
                  key={index}
                  $active={index === currentIndex}
                  onClick={() => {
                    setDirection(index > currentIndex ? 1 : -1);
                    setCurrentIndex(index);
                  }}
                />
              ))}
            </DotsContainer>

            <NavButton onClick={() => paginate(1)}>
              <ChevronRight />
            </NavButton>
          </NavigationContainer>
        </SliderInner>
      </SliderContent>
    </SliderContainer>
  );
}