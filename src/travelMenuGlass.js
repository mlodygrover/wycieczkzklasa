import { useState, useEffect, useRef } from 'react';
import styled, { css } from 'styled-components';
import { Menu, X, Compass } from 'lucide-react';

const Nav = styled.nav`
  width: 100%;
  position: fixed;               /* stały pasek u góry jak w poprzednim komponencie */
  top: 0;
  left: 0;
  z-index: 1002;

  /* Glass + lekko mocniejszy na scroll */
  background: ${({ $scrolled }) =>
        $scrolled ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 255, 255, 0.10)'};
  backdrop-filter: blur(12px) saturate(150%);
  -webkit-backdrop-filter: blur(12px) saturate(150%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);

  /* Animacja chowająca/pokazująca pasek */
  transform: ${({ $hidden }) => ($hidden ? 'translateY(-110%)' : 'translateY(0)')};
  opacity: ${({ $hidden }) => ($hidden ? 0 : 1)};
  transition: transform .32s ease, opacity .32s ease, background .2s ease;
  will-change: transform, opacity, background;
  @media screen and (max-width: 1000px){
    display: none;
  }
`;

const Container = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;

  @media (min-width: 640px) {
    padding: 0 1.5rem;
  }

  @media (min-width: 1024px) {
    padding: 0 2rem;
  }
`;

const NavContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 5rem;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const LogoIcon = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  background-color: #2d5f5d;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const LogoText = styled.span`
  color: #ffffff;
  letter-spacing: -0.025em;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const DesktopMenu = styled.div`
  display: none;
  align-items: center;
  gap: 2rem;

  @media (min-width: 768px) {
    display: flex;
  }
`;

const MenuLink = styled.a`
  color: #ffffff;
  transition: all 0.2s;
  position: relative;
  padding: 0.25rem 0;
  text-decoration: none;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.68);
  font-weight: 500;
  font-size: 18px;
  &:hover {
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0;
    width: 0; height: 2px;
    background-color: #2d5f5d;
    transition: width 0.3s;
    box-shadow: 0 0 8px rgba(45, 95, 93, 0.5);
  }

  &:hover::after { width: 100%; }
`;

const CTAButtonWrapper = styled.div`
  display: none;
  @media (min-width: 768px) { display: block; }
`;

const CTAButton = styled.button`
  background-color: #2d5f5d;
  color: #ffffff;
  padding: 0.625rem 1.5rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: #3d7f7d;
    transform: translateY(-1px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
`;

const MobileMenuButton = styled.button`
  display: block;
  background: none;
  border: none;
  color: #ffffff;
  cursor: pointer;
  transition: color 0.2s;

  &:hover { color: #b8e6e4; }

  @media (min-width: 768px) { display: none; }
`;

const MobileMenu = styled.div`
  display: block;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);

  @media (min-width: 768px) { display: none; }
`;

const MobileMenuContent = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const MobileMenuLink = styled.a`
  display: block;
  color: #ffffff;
  transition: all 0.2s;
  padding: 0.5rem 0;
  border-bottom: 1px solid transparent;
  text-decoration: none;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  
  &:hover {
    color: #b8e6e4;
    border-bottom-color: #2d5f5d;
  }
`;

const MobileCTAButton = styled.button`
  width: 100%;
  background-color: #2d5f5d;
  color: #ffffff;
  padding: 0.625rem 1.5rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  &:hover { background-color: #3d7f7d; }
`;

export function TravelMenuGlass() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [hiddenByScroll, setHiddenByScroll] = useState(false);

    const lastYRef = useRef(0);
    const tickingRef = useRef(false);
    const downAccumRef = useRef(0);

    useEffect(() => {
        lastYRef.current = typeof window !== 'undefined' ? window.scrollY : 0;

        const SENSITIVITY = 6;   // minimalny krok, aby reagować
        const HIDE_AFTER = 140;  // po tylu px akumulowanego scrolla w dół chowamy

        const update = () => {
            const y = window.scrollY || 0;
            const diff = y - lastYRef.current;

            setScrolled(y > 20);

            // jeśli menu mobilne otwarte – nie chowamy paska
            if (!isMenuOpen && Math.abs(diff) >= SENSITIVITY) {
                if (diff > 0) {
                    // scroll w dół
                    downAccumRef.current += diff;
                    if (downAccumRef.current >= HIDE_AFTER) setHiddenByScroll(true);
                } else if (diff < 0) {
                    // scroll w górę – pokaż pasek i zresetuj licznik
                    setHiddenByScroll(false);
                    downAccumRef.current = 0;
                }
            }

            if (y < 10) {
                // u góry strony – zawsze pokazany i zresetowany
                setHiddenByScroll(false);
                downAccumRef.current = 0;
            }

            lastYRef.current = y;
            tickingRef.current = false;
        };

        const onScroll = () => {
            if (!tickingRef.current) {
                window.requestAnimationFrame(update);
                tickingRef.current = true;
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [isMenuOpen]);

    // Gdy otwierasz menu mobilne – zawsze pokazujemy pasek
    useEffect(() => {
        if (isMenuOpen) setHiddenByScroll(false);
    }, [isMenuOpen]);

    const barHidden = hiddenByScroll; // identycznie jak w poprzednim komponencie (bez chowania przy otwartym menu)

    return (
        <Nav $hidden={barHidden} $scrolled={scrolled}>
            <Container>
                <NavContent>
                    <Logo>
                        <LogoIcon>
                            <Compass size={24} color="#ffffff" />
                        </LogoIcon>
                        <LogoText>TravelApp</LogoText>
                    </Logo>

                    <DesktopMenu>
                        <MenuLink href="#odkrywaj">Odkrywaj</MenuLink>
                        <MenuLink href="#destynacje">Destynacje</MenuLink>
                        <MenuLink href="#wycieczki">Wycieczki</MenuLink>
                        <MenuLink href="#o-nas">O nas</MenuLink>
                        <MenuLink href="#kontakt">Kontakt</MenuLink>
                    </DesktopMenu>

                    <CTAButtonWrapper>
                        <CTAButton>Zarezerwuj teraz</CTAButton>
                    </CTAButtonWrapper>

                    <MobileMenuButton onClick={() => setIsMenuOpen((p) => !p)}>
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </MobileMenuButton>
                </NavContent>
            </Container>

            {isMenuOpen && (
                <MobileMenu>
                    <MobileMenuContent>
                        <MobileMenuLink href="#odkrywaj" onClick={() => setIsMenuOpen(false)}>Odkrywaj</MobileMenuLink>
                        <MobileMenuLink href="#destynacje" onClick={() => setIsMenuOpen(false)}>Destynacje</MobileMenuLink>
                        <MobileMenuLink href="#wycieczki" onClick={() => setIsMenuOpen(false)}>Wycieczki</MobileMenuLink>
                        <MobileMenuLink href="#o-nas" onClick={() => setIsMenuOpen(false)}>O nas</MobileMenuLink>
                        <MobileMenuLink href="#kontakt" onClick={() => setIsMenuOpen(false)}>Kontakt</MobileMenuLink>
                        <MobileCTAButton onClick={() => setIsMenuOpen(false)}>Zarezerwuj teraz</MobileCTAButton>
                    </MobileMenuContent>
                </MobileMenu>
            )}
        </Nav>
    );
}
