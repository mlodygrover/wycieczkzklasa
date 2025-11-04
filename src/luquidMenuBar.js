import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'motion/react';

/* ===== Top-level container ===== */
const BarWrap = styled(motion.header)`
  position: fixed; /* globalny pasek */
  top: 0;
  left: 0;
  right: 0;
  z-index: 1100;
  width: 100%;
  padding: 20px 0;
  @media screen and (min-width: 1000px){
    display: none;
  }
`;

/* ===== Width container ===== */
const BarInner = styled.div`
  margin: 0 auto;
  width: 95%;
  max-width: 1800px;
  display: flex;
  align-items: center;
`;

/* ===== Glass bar, empty inside ===== */
const GlassBar = styled(motion.div)`
  width: 100%;
  flex: 1 1 auto;
  background: rgba(255, 255, 255, 0.10);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.20);
  border-radius: 10px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.10);
  position: relative;
  overflow: hidden;

  min-height: 70px;
  padding: 0 10px;
  @media screen and (max-width: 600px){min-height: 50px;}

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.2) 0%,
      rgba(255, 255, 255, 0.05) 50%,
      transparent 100%
    );
  }

  display: flex;
  align-items: center;
  justify-content: flex-end; /* przycisk mobilny po prawej */
`;

/* ===== Mobilny przycisk (hamburger) – widoczny < 1000px ===== */
const MobileToggle = styled(motion.button)`
  /* Layout */
  display: none;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  position: relative;
  isolation: isolate;               /* confine blending to this element */
  cursor: pointer;
  z-index: 1;

  /* Subtle glass chrome so the shape stays readable on busy BGs */
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.30);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  backdrop-filter: blur(8px) saturate(140%);
  -webkit-backdrop-filter: blur(8px) saturate(140%);

  /* Hover */
  transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease, background .2s ease;
  &:hover {
    box-shadow: 0 6px 18px rgba(0,0,0,0.22);
    background: rgba(255,255,255,0.10);
    border-color: rgba(255,255,255,0.45);
  }
  &:active {
    transform: translateY(0);
  }

  /* The icon: render as negative of the backdrop */
  svg {
    width: 22px;
    height: 22px;
    color: #00000076;                 /* base for difference blend */
    text-shadow: 0 0 10px red;
    mix-blend-mode: difference;     /* key: invert vs background dynamically */
    pointer-events: none;
  }

  /* Show on mobile */
  @media (max-width: 1000px) {
    display: inline-flex;
  }

  /* Fallbacks: when blend/backdrop unsupported, rely on strong contrast */
  @supports not (mix-blend-mode: difference) {
    svg { mix-blend-mode: normal; color: #000; }
    background: #fff;
    border-color: rgba(0,0,0,0.2);
  }
  @supports not ((backdrop-filter: blur(2px)) or (-webkit-backdrop-filter: blur(2px))) {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    background: rgba(255,255,255,0.85);
    border-color: rgba(0,0,0,0.2);
    svg { mix-blend-mode: normal; color: #000; }
  }
`;

/* === Overlay jak w przykładzie (ciemny, lekkie rozmycie) === */
const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 999;
`;

/* === Panel boczny 1:1 stylistycznie z referencją (dark glass) === */
const SidePanel = styled(motion.aside)`
  position: fixed;
  top: 0; right: 0; bottom: 0;
  width: 280px;                         /* stała szerokość jak w przykładzie */
  background: rgba(20, 20, 20, 0.98);   /* ciemne tło */
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2rem 1.5rem;                 /* spacing 1:1 */
  overflow-y: auto;
  box-shadow: -10px 0 50px rgba(0, 0, 0, 0.5);
  z-index: 1001;

  @media (min-width: 1001px) {
    display: none;
  }
`;

/* === Nagłówek panelu (jak MobileMenuHeader + MobileMenuLogo) === */
const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  color: #fff;

  .logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    svg { width: 1.5rem; height: 1.5rem; }
    span { font-size: 1.125rem; }
  }
`;

/* === Przycisk zamknięcia jak w przykładzie === */
const CloseBtn = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: white;
  cursor: pointer;
  transition: background 0.2s ease;

  svg { width: 1.5rem; height: 1.5rem; }

  &:hover { background: rgba(255, 255, 255, 0.15); }
`;

/* === Lista linków (układ jak MobileNavLinks) === */
const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 2rem;
`;

/* === Pojedynczy link (jak MobileNavLink) === */
const CardLink = styled(motion.a)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  border-radius: 12px;
  transition: all 0.2s ease;
  cursor: pointer;

  background: transparent;
  border: none;

  &:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.1);
  }

  &.active {
    color: #fff;
    background: rgba(255, 255, 255, 0.15);
  }

  svg {
    width: 1.25rem;
    height: 1.25rem;
  }

  .arrow {
    margin-left: auto;
    opacity: 0.9;
  }
`;

const links = [
    { id: 'home', title: 'Strona główna', desc: 'Powrót do startu', href: '#home' },
    { id: 'offers', title: 'Oferty wyjazdów', desc: 'Najlepsze propozycje', href: '#offers' },
    { id: 'teachers', title: 'Dla nauczycieli', desc: 'Materiały i programy', href: '#teachers' },
    { id: 'contact', title: 'Kontakt', desc: 'Skontaktuj się z nami', href: '#contact' },
];

export function LiquidMenuBar() {
    const [scrolled, setScrolled] = useState(false);
    const [hiddenByScroll, setHiddenByScroll] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const lastYRef = useRef(0);
    const tickingRef = useRef(false);
    const downAccumRef = useRef(0);

    useEffect(() => {
        lastYRef.current = typeof window !== 'undefined' ? window.scrollY : 0;

        const SENSITIVITY = 6;
        const HIDE_AFTER = 140;

        const update = () => {
            const y = window.scrollY || 0;
            const diff = y - lastYRef.current;

            setScrolled(y > 20);

            if (Math.abs(diff) >= SENSITIVITY) {
                if (diff > 0) {
                    downAccumRef.current += diff;
                    if (downAccumRef.current >= HIDE_AFTER) setHiddenByScroll(true);
                } else if (diff < 0) {
                    setHiddenByScroll(false);
                    downAccumRef.current = 0;
                }
            }

            if (y < 10) {
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
    }, []);

    /* Menubar znika zarówno po przewinięciu w dół (po progu),
       jak i na czas otwartego panelu mobilnego */
    const barHidden = hiddenByScroll || mobileOpen;

    /* Blokada scrolla tła przy otwartym panelu */
    useEffect(() => {
        if (mobileOpen) {
            const prev = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            return () => { document.body.style.overflow = prev; };
        }
    }, [mobileOpen]);

    return (
        <>
            <BarWrap
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: barHidden ? -100 : 0, opacity: barHidden ? 0 : 1 }}
                transition={{ duration: 0.32, ease: 'easeOut' }}
                aria-hidden="true"
            >
                <BarInner>
                    <GlassBar
                        animate={{
                            background: scrolled ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.10)',
                            boxShadow: scrolled ? '0 8px 32px rgba(0,0,0,0.20)' : '0 8px 32px rgba(0,0,0,0.10)',
                        }}
                        transition={{ duration: 0.2 }}
                    >
                        
                        {/* < 1000 px: zamiast kart pokazujemy tylko przycisk */}
                        <MobileToggle
                            onClick={() => setMobileOpen(true)}
                            whileTap={{ scale: 0.96 }}
                            aria-label="Otwórz menu"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <line x1="3" y1="12" x2="21" y2="12" />
                                <line x1="3" y1="18" x2="21" y2="18" />
                            </svg>
                        </MobileToggle>
                    </GlassBar>
                </BarInner>
            </BarWrap>

            {/* Panel mobilny + overlay – tylko w trybie mobilnym */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <Overlay
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                        />
                        <SidePanel
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                            role="dialog"
                            aria-modal="true"
                        >
                            <PanelHeader>
                                <span>Menu</span>
                                <CloseBtn
                                    onClick={() => setMobileOpen(false)}
                                    whileTap={{ scale: 0.96 }}
                                    aria-label="Zamknij menu"
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </CloseBtn>
                            </PanelHeader>

                            <CardList>
                                {/* Przykładowe linki – odkomentuj jeśli chcesz je pokazać
                {links.map((l, index) => (
                  <CardLink
                    key={l.id}
                    href={l.href}
                    onClick={(e) => { e.preventDefault(); setMobileOpen(false); }}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>{l.title}</span>
                    <svg className="arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </CardLink>
                ))}
                */}
                            </CardList>
                        </SidePanel>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
