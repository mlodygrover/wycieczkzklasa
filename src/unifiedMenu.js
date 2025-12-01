import { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Menu, X, Compass, User, ChevronDown, Settings, Heart, LogOut, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useUserStore, { fetchMe, clearUser } from './usercontent';

const slideDown = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Nav = styled.nav`
  width: 100%;
  position: fixed;
  top: 0; left: 0;
  z-index: 1002;

  background: ${props =>
        props.$variant === 'glass'
            ? (props.$scrolled ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 255, 255, 0.14)')
            : '#ffffff'};
  backdrop-filter: ${props => (props.$variant === 'glass' ? 'blur(12px) saturate(150%)' : 'none')};
  -webkit-backdrop-filter: ${props => (props.$variant === 'glass' ? 'blur(12px) saturate(150%)' : 'none')};
  border-bottom: 1px solid ${props => (props.$variant === 'glass' ? 'rgba(255, 255, 255, 0.2)' : '#e5e7eb')};

  transform: ${props => (props.$hidden ? 'translateY(-110%)' : 'translateY(0)')};
  opacity: ${props => (props.$hidden ? 0 : 1)};
  transition: transform .32s ease, opacity .32s ease, background .2s ease;
  will-change: transform, opacity, background;

  
`;

const Container = styled.div`
  max-width: 1280px; margin: 0 auto; padding: 0 1rem;
  @media (min-width: 640px) { padding: 0 1.5rem; }
  @media (min-width: 1024px) { padding: 0 2rem; }
`;

const NavContent = styled.div`
  display: flex; justify-content: space-between; align-items: center; height: 80px;
`;

const Logo = styled.div`
  display: flex; align-items: center; gap: 0.5rem; cursor: pointer;
`;

const LogoIcon = styled.div`
  width: 2.5rem; height: 2.5rem; background-color: #2d5f5d; border-radius: 0.5rem;
  display: flex; align-items: center; justify-content: center;
  box-shadow: ${props => (props.$variant === 'glass' ? '0 4px 6px rgba(0, 0, 0, 0.1)' : 'none')};
`;

const LogoText = styled.span`
  color: ${props => (props.$variant === 'glass' ? '#ffffff' : '#000000')};
  letter-spacing: -0.025em;
  text-shadow: ${props => (props.$variant === 'glass' ? '0 2px 4px rgba(0, 0, 0, 0.76)' : 'none')};
  font-weight: 600;
  font-size: 32px;
  
  span{
    font-weight: 300;
    color: #949494ff;
  }
`;

const DesktopMenu = styled.div`
  display: none; align-items: center; gap: 2rem;
  @media (min-width: 1000px) { display: flex; }
`;

const MenuLink = styled.a`
  font-weight: 500; font-size: 18px;
  color: ${props => (props.$variant === 'glass' ? '#ffffff' : '#000000')};
  transition: all 0.2s; position: relative; padding: 0.25rem 0; text-decoration: none;
  text-shadow: ${props => (props.$variant === 'glass' ? '0 2px 4px rgba(0, 0, 0, 0.48)' : 'none')};
  &:hover { color: ${props => (props.$variant === 'glass' ? '#e1e1e1ff' : '#2d5f5d')}; }
  &::after {
    content: ''; position: absolute; bottom: 0; left: 0; width: 0; height: 2px;
    background-color: #2d5f5d; transition: width 0.3s;
    box-shadow: ${props => (props.$variant === 'glass' ? '0 0 8px rgba(45, 95, 93, 0.5)' : 'none')};
  }
  &:hover::after { width: 100%; }
`;

const AuthSection = styled.div`
  display: none; position: relative;
  @media (min-width: 1000px) { display: flex; align-items: center; gap: 0.75rem; }
`;

const AuthButton = styled.button`
  background-color: ${props => (props.$variant === 'glass' ? 'rgba(255, 255, 255, 0.1)' : 'transparent')};
  color: ${props => (props.$variant === 'glass' ? '#ffffff' : '#000000')};
  padding: 0.625rem 1.5rem; border-radius: 0.5rem;
  border: 1px solid ${props => (props.$variant === 'glass' ? 'rgba(255, 255, 255, 0.3)' : '#e5e7eb')};
  cursor: pointer; transition: all 0.2s;
  backdrop-filter: ${props => (props.$variant === 'glass' ? 'blur(8px)' : 'none')};
  -webkit-backdrop-filter: ${props => (props.$variant === 'glass' ? 'blur(8px)' : 'none')};
  &:hover {
    background-color: ${props => (props.$variant === 'glass' ? 'rgba(255, 255, 255, 0.2)' : '#f9fafb')};
    border-color: ${props => (props.$variant === 'glass' ? 'rgba(255, 255, 255, 0.5)' : '#2d5f5d')};
    color: ${props => (props.$variant === 'glass' ? '#ffffff' : '#2d5f5d')};
  }
`;

const AuthButtonPrimary = styled.button`
  background: linear-gradient(135deg, #2d5f5d 0%, #3d7f7d 100%); color: #ffffff;
  padding: 0.625rem 1.5rem; border-radius: 0.5rem; border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative; overflow: hidden;
  &::before {
    content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
  }
  &:hover::before { left: 100%; }
  &:hover { box-shadow: 0 6px 12px rgba(45, 95, 93, 0.3); }
`;

const UserProfileButton = styled.button`
  display: flex; align-items: center; gap: 0.75rem;
  background: ${props =>
        props.$variant === 'glass'
            ? 'linear-gradient(135deg, rgba(45, 95, 93, 0.8) 0%, rgba(61, 127, 125, 0.8) 100%)'
            : 'linear-gradient(135deg, #2d5f5d 0%, #3d7f7d 100%)'};
  color: #ffffff; padding: 0.5rem 1.25rem; border-radius: 10px;
  border: 1px solid ${props => (props.$variant === 'glass' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.2)')};
  cursor: pointer; transition: all 0.3s;
  backdrop-filter: ${props => (props.$variant === 'glass' ? 'blur(10px)' : 'none')};
  -webkit-backdrop-filter: ${props => (props.$variant === 'glass' ? 'blur(10px)' : 'none')};
  box-shadow: 0 4px 12px rgba(45, 95, 93, 0.2); position: relative; overflow: hidden;
  &::before {
    content: ''; position: absolute; inset: 0;
    background: radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%);
    opacity: 0; transition: opacity 0.3s;
  }
  &:hover::before { opacity: 1; }
  &:hover { box-shadow: 0 6px 20px rgba(45, 95, 93, 0.4); }
`;

const UserAvatar = styled.div`
  width: 2.25rem; height: 2.25rem;
  background: linear-gradient(135deg, #ffffff 0%, #e0f2f1 100%);
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const UserInfo = styled.div` display: flex; flex-direction: column; align-items: flex-start;`;
const UserName = styled.span` font-size: 0.875rem; font-weight: 500; text-shadow: 0 1px 2px rgba(0,0,0,0.1);`;
const UserBadge = styled.span` font-size: 0.65rem; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 0.05em;`;
const NotificationBadge = styled.div`
  width: 1.25rem; height: 1.25rem; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-size: 0.65rem; font-weight: 600; box-shadow: 0 2px 4px rgba(0,0,0,0.2);
`;

const DropdownMenu = styled.div`
  position: absolute; top: calc(100% + 0.5rem); right: 0;
  background: ${props => (props.$variant === 'glass' ? 'rgba(255, 255, 255, 0.95)' : '#ffffff')};
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  border-radius: 0.75rem; 
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15); min-width: 16rem; overflow: hidden;
  animation: ${slideDown} 0.2s ease-out; z-index: 1000;
`;

const DropdownHeader = styled.div`
  padding: 1rem; background: linear-gradient(135deg, #2d5f5d 0%, #3d7f7d 100%); color: #ffffff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
`;

const DropdownUserName = styled.div` font-weight: 600; margin-bottom: 0.25rem;`;
const DropdownUserEmail = styled.div` font-size: 0.8rem; color: rgba(255, 255, 255, 0.9);`;

const DropdownItem = styled.button`
  width: 100%; display: flex; align-items: center; gap: 0.75rem; padding: 0.875rem 1rem;
  background: transparent; border: none; color: #374151; cursor: pointer; transition: all 0.2s; text-align: left;
  &:hover { background-color: ${props => (props.$variant === 'glass' ? 'rgba(45, 95, 93, 0.1)' : '#f3f4f6')}; color: #2d5f5d; }
  svg { color: #6b7280; } &:hover svg { color: #2d5f5d; }
`;

const DropdownDivider = styled.div` height: 1px; background-color: #e5e7eb; margin: 0.5rem 0;`;
const DropdownItemDanger = styled(DropdownItem)`
  color: #dc2626; svg { color: #dc2626; }
  &:hover { background-color: #fee2e2; color: #b91c1c; }
  &:hover svg { color: #b91c1c; }
`;

const MobileMenuButton = styled.button`
  display: flex; background: none; border: none; cursor: pointer; transition: color 0.2s;
  background-color: red;
  padding: 5px;
  border-radius: 5px;
  background-color: ${props => (props.$variant === 'glass' ? "#37373736" : '#ffffffff')};
  color: ${props => (props.$variant === 'glass' ? 'white' : '#000000')};
  &:hover { color: ${props => (props.$variant === 'glass' ? '#b8e6e4' : '#2d5f5d')}; }
  @media (min-width: 1000px) { display: none; }
`;

const MobileMenu = styled.div`
  display: block;
  backdrop-filter: ${props => (props.$variant === 'glass' ? 'blur(12px)' : 'none')};
  -webkit-backdrop-filter: ${props => (props.$variant === 'glass' ? 'blur(12px)' : 'none')};
  @media (min-width: 1000px) { display: none; }
`;

const MobileMenuContent = styled.div`
  padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem;
`;

const MobileMenuLink = styled.a`
  display: block; color: ${props => (props.$variant === 'glass' ? '#ffffff' : '#000000')};
  transition: all 0.2s; padding: 0.5rem 0; border-bottom: 1px solid transparent; text-decoration: none;
  text-shadow: ${props => (props.$variant === 'glass' ? '0 2px 4px rgba(0,0,0,0.2)' : 'none')};
  &:hover { color: ${props => (props.$variant === 'glass' ? '#b8e6e4' : '#2d5f5d')}; border-bottom-color: #2d5f5d; }
`;

const MobileAuthButtons = styled.div` display: flex; gap: 0.75rem; margin-top: 0.5rem;`;
const MobileAuthButton = styled.button`
  flex: 1; background-color: ${props => (props.$variant === 'glass' ? 'rgba(255, 255, 255, 0.1)' : 'transparent')};
  color: ${props => (props.$variant === 'glass' ? '#ffffff' : '#000000')};
  padding: 0.625rem 1rem; border-radius: 0.5rem;
  border: 1px solid ${props => (props.$variant === 'glass' ? 'rgba(255,255,255,0.3)' : '#e5e7eb')};
  cursor: pointer; transition: all 0.2s;
  &:hover {
    background-color: ${props => (props.$variant === 'glass' ? 'rgba(255,255,255,0.2)' : '#f9fafb')};
    border-color: ${props => (props.$variant === 'glass' ? 'rgba(255, 255, 255, 0.5)' : '#2d5f5d')};
    color: ${props => (props.$variant === 'glass' ? '#ffffff' : '#2d5f5d')};
  }
`;

const MobileAuthButtonPrimary = styled.button`
  flex: 1; background: linear-gradient(135deg, #2d5f5d 0%, #3d7f7d 100%); color: #ffffff;
  padding: 0.625rem 1rem; border-radius: 0.5rem; border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  &:hover { background: linear-gradient(135deg, #3d7f7d 0%, #4d8f8d 100%); }
`;

const MobileUserCard = styled.div`
  background: linear-gradient(135deg, #2d5f5d 0%, #3d7f7d 100%);
  border-radius: 0.75rem; padding: 1rem; margin-top: 0.5rem;
  border: 1px solid ${props => (props.$variant === 'glass' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.2)')};
  box-shadow: 0 4px 12px rgba(45, 95, 93, 0.2);
`;

const MobileUserHeader = styled.div`
  display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
`;

const MobileUserAvatar = styled.div`
  width: 3rem; height: 3rem; background: linear-gradient(135deg, #ffffff 0%, #e0f2f1 100%);
  border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const MobileUserInfo = styled.div` flex: 1;`;
const MobileUserName = styled.div` color: #ffffff; font-size: 1rem; font-weight: 600; margin-bottom: 0.25rem;`;
const MobileUserEmail = styled.div` color: rgba(255, 255, 255, 0.8); font-size: 0.8rem;`;
const MobileUserActions = styled.div` display: flex; flex-direction: column; gap: 0.5rem;`;

const MobileActionButton = styled.button`
  width: 100%; display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 0.5rem; color: #ffffff; cursor: pointer; transition: all 0.2s;
  &:hover { background: rgba(255, 255, 255, 0.2); }
`;

const MobileLogoutButton = styled(MobileActionButton)`
  background: rgba(220, 38, 38, 0.2); border-color: rgba(220, 38, 38, 0.4); color: #fecaca;
  &:hover { background: rgba(220, 38, 38, 0.3); }
`;
const AvatarImg = styled.img`
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  border-radius: 50%;
`;

export function TravelMenuUnified({ variant = 'white' }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // scroll state
    const [scrolled, setScrolled] = useState(false);
    const [hiddenByScroll, setHiddenByScroll] = useState(false);

    const profileRef = useRef(null);

    // globalny user ze store
    const { user, loading } = useUserStore();
    const isLoggedIn = !!user;

    // ewentualny lazy fetch profilu (opcjonalnie — jeżeli nie robisz tego wyżej w drzewie)
    useEffect(() => {
        // Jeżeli jeszcze nie pobieraliśmy i nie ma usera, spróbuj pobrać
        if (!user && !loading) {
            fetchMe().catch(() => { });
        }
    }, [user, loading]);

    // klik poza dropdownem profilu
    useEffect(() => {
        function handleClickOutside(event) {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        }
        if (isProfileOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isProfileOpen]);

    // hide-on-scroll
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

            const anyMenuOpen = isMenuOpen || isProfileOpen;

            if (!anyMenuOpen && Math.abs(diff) >= SENSITIVITY) {
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
    }, [isMenuOpen, isProfileOpen]);

    // pokaż pasek, gdy otwieramy menu
    useEffect(() => {
        if (isMenuOpen || isProfileOpen) setHiddenByScroll(false);
    }, [isMenuOpen, isProfileOpen]);

    const barHidden = hiddenByScroll;
    const navigate = useNavigate();
    const goHome = () => navigate('/', { replace: false });

    const displayName =
        user?.username || (user?.email ? user.email.split('@')[0] : 'Użytkownik');
    const displayEmail = user?.email || '';

    const handleLogout = async () => {
        try {
            await fetch('http://localhost:5007/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });
        } catch (_) {
            // nawet jeśli request się nie powiedzie, czyścimy front
        } finally {
            clearUser();
            navigate('/login', { replace: true });
        }
    };

    return (
        <Nav $variant={variant} $hidden={barHidden} $scrolled={scrolled}>
            <Container>
                <NavContent>
                    <Logo
                        role="link"
                        tabIndex={0}
                        aria-label="Przejdź do strony głównej"
                        onClick={goHome}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                goHome();
                            }
                        }}>
                        <LogoIcon $variant={variant}>
                            <Compass size={24} color="#ffffff" />
                        </LogoIcon>
                        <LogoText $variant={variant}>Draft<span>&</span>Go</LogoText>
                    </Logo>

                    <DesktopMenu>
                        <MenuLink href="#odkrywaj" $variant={variant}>Odkrywaj</MenuLink>

                        <MenuLink href="/konfigurator-lounge" $variant={variant}>Konfigurator</MenuLink>
                        <MenuLink href="#destynacje" $variant={variant}>Dla szkół</MenuLink>
                        <MenuLink href="#wycieczki" $variant={variant}>Dla przedsiębiorców</MenuLink>
                        <MenuLink href="#kontakt" $variant={variant}>Kontakt</MenuLink>
                    </DesktopMenu>

                    <AuthSection ref={profileRef}>
                        {isLoggedIn ? (
                            <>
                                <UserProfileButton
                                    $variant={variant}
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                >
                                    <UserAvatar>
                                        {user?.profilePic ? (
                                            <AvatarImg
                                                src={user.profilePic}
                                                alt={`${displayName} – zdjęcie profilowe`}
                                                referrerPolicy="no-referrer"
                                                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; }}
                                            />
                                        ) : (
                                            <User size={18} color="#2d5f5d" />
                                        )}
                                    </UserAvatar>
                                    <UserInfo>
                                        <UserName>{displayName}</UserName>
                                        <UserBadge>Użytkownik</UserBadge>
                                    </UserInfo>
                                    {/* Przykładowy badge powiadomień – schowaj, jeśli go nie używasz */}
                                    {/* <NotificationBadge>3</NotificationBadge> */}
                                    <ChevronDown
                                        size={16}
                                        style={{ transform: isProfileOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .3s' }}
                                    />
                                </UserProfileButton>

                                {isProfileOpen && (
                                    <DropdownMenu $variant={variant}>
                                        <DropdownHeader>
                                            <DropdownUserName>{displayName}</DropdownUserName>
                                            {displayEmail && <DropdownUserEmail>{displayEmail}</DropdownUserEmail>}
                                        </DropdownHeader>

                                        <DropdownItem
                                            role="menuitem"
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" || e.key === " ") {
                                                    e.preventDefault();
                                                    setIsProfileOpen(false);
                                                    navigate("/profil");
                                                }
                                            }}
                                            onClick={() => {
                                                setIsProfileOpen(false);
                                                navigate("/profil");
                                            }}
                                        >
                                            <User size={18} /> Mój profil
                                        </DropdownItem>
                                        <DropdownItem $variant={variant}><Heart size={18} />Ulubione</DropdownItem>
                                        <DropdownItem $variant={variant}>
                                            <Bell size={18} />Powiadomienia
                                            {/* <NotificationBadge style={{ marginLeft: 'auto' }}>3</NotificationBadge> */}
                                        </DropdownItem>
                                        <DropdownItem $variant={variant}><Settings size={18} />Ustawienia</DropdownItem>
                                        <DropdownDivider />
                                        <DropdownItemDanger $variant={variant} onClick={handleLogout}>
                                            <LogOut size={18} />Wyloguj się
                                        </DropdownItemDanger>
                                    </DropdownMenu>
                                )}
                            </>
                        ) : (
                            <>
                                <AuthButton $variant={variant} onClick={() => navigate('/login')}>Logowanie</AuthButton>
                                <AuthButtonPrimary onClick={() => navigate('/register')}>Rejestracja</AuthButtonPrimary>
                            </>
                        )}
                    </AuthSection>

                    <MobileMenuButton onClick={() => setIsMenuOpen(!isMenuOpen)} $variant={variant}>
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </MobileMenuButton>
                </NavContent>
            </Container>

            {isMenuOpen && (
                <MobileMenu $variant={variant}>
                    <MobileMenuContent>
                        <MobileMenuLink href="#odkrywaj" $variant={variant} onClick={() => setIsMenuOpen(false)}>Odkrywaj</MobileMenuLink>
                        <MobileMenuLink href="/konfigurator-lounge" $variant={variant} onClick={() => setIsMenuOpen(false)}>Konfigurator</MobileMenuLink>
                        <MobileMenuLink href="#destynacje" $variant={variant} onClick={() => setIsMenuOpen(false)}>Destynacje</MobileMenuLink>
                        <MobileMenuLink href="#wycieczki" $variant={variant} onClick={() => setIsMenuOpen(false)}>Wycieczki</MobileMenuLink>
                        <MobileMenuLink href="#o-nas" $variant={variant} onClick={() => setIsMenuOpen(false)}>O nas</MobileMenuLink>
                        <MobileMenuLink href="#kontakt" $variant={variant} onClick={() => setIsMenuOpen(false)}>Kontakt</MobileMenuLink>

                        {isLoggedIn ? (
                            <MobileUserCard $variant={variant}>
                                <MobileUserHeader>

                                    <MobileUserAvatar>
                                        {user?.profilePic ? (
                                            <AvatarImg
                                                src={user.profilePic}
                                                alt={`${displayName} – zdjęcie profilowe`}
                                                referrerPolicy="no-referrer"
                                                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; }}
                                            />
                                        ) : (
                                            <User size={24} color="#2d5f5d" />
                                        )}
                                    </MobileUserAvatar>

                                    <MobileUserInfo>
                                        <MobileUserName>{displayName}</MobileUserName>
                                        {displayEmail && <MobileUserEmail>{displayEmail}</MobileUserEmail>}
                                    </MobileUserInfo>
                                    {/* <NotificationBadge>3</NotificationBadge> */}
                                </MobileUserHeader>

                                <MobileUserActions>
                                    <MobileActionButton onClick={() => { setIsMenuOpen(false); navigate('/profil'); }}>
                                        <User size={18} />Mój profil
                                    </MobileActionButton>
                                    <MobileActionButton onClick={() => { setIsMenuOpen(false); navigate('/favorites'); }}>
                                        <Heart size={18} />Ulubione
                                    </MobileActionButton>
                                    <MobileActionButton onClick={() => { setIsMenuOpen(false); navigate('/settings'); }}>
                                        <Settings size={18} />Ustawienia
                                    </MobileActionButton>
                                    <MobileLogoutButton onClick={handleLogout}>
                                        <LogOut size={18} />Wyloguj się
                                    </MobileLogoutButton>
                                </MobileUserActions>
                            </MobileUserCard>
                        ) : (
                            <MobileAuthButtons>
                                <MobileAuthButton $variant={variant} onClick={() => { setIsMenuOpen(false); navigate('/login'); }}>
                                    Logowanie
                                </MobileAuthButton>
                                <MobileAuthButtonPrimary onClick={() => { setIsMenuOpen(false); navigate('/register'); }}>
                                    Rejestracja
                                </MobileAuthButtonPrimary>
                            </MobileAuthButtons>
                        )}
                    </MobileMenuContent>
                </MobileMenu>
            )}
        </Nav>
    );
}
