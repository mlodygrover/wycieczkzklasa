import React, { useMemo, useState } from "react";
import styled from "styled-components";
import useUserStore from "./usercontent";
import TripsSection from "./tripsSection";


// sampleTrips.js

export const trips = {
    planned: [
        {
            id: 1,
            title: 'Wycieczka do Paryża',
            destination: 'Paryż, Francja',
            date: '15–22 Gru 2025',
            days: 7,
            status: 'planned',
            image:
                'https://images.unsplash.com/photo-1431274172761-fca41d930114?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
        },
        {
            id: 2,
            title: 'Weekend w Krakowie',
            destination: 'Kraków, Polska',
            date: '10–12 Sty 2026',
            days: 2,
            status: 'planned',
            image:
                'https://images.unsplash.com/photo-1640258650329-789ea328e77f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
        },
        {
            id: 3,
            title: 'Wyjazd na narty',
            destination: 'Zakopane, Polska',
            date: '20–27 Sty 2026',
            days: 7,
            status: 'planned',
            image:
                'https://images.unsplash.com/photo-1510951459752-aac634df6e86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
        }
    ],

    completed: [
        {
            id: 4,
            title: 'Lato w Grecji',
            destination: 'Santorini, Grecja',
            date: '1–14 Lip 2025',
            days: 14,
            status: 'completed',
            image:
                'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
        },
        {
            id: 5,
            title: 'City break Barcelona',
            destination: 'Barcelona, Hiszpania',
            date: '15–18 Sie 2025',
            days: 3,
            status: 'completed',
            image:
                'https://images.unsplash.com/photo-1593368858664-a7fe556ab936?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
        }
    ],

    pending: [
        {
            id: 6,
            title: 'Majówka w górach',
            destination: 'Bieszczady, Polska',
            date: '1–4 Maj 2026',
            days: 4,
            status: 'pending',
            image:
                'https://images.unsplash.com/photo-1755151347514-19d0bfc26dae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
        },
        {
            id: 7,
            title: 'Bałtycki weekend',
            destination: 'Gdańsk, Polska',
            date: '12–14 Cze 2026',
            days: 2,
            status: 'pending',
            image:
                'https://images.unsplash.com/photo-1602422236377-1b9c1d8e2b9a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
        }
    ]
};

export const myPlans = [
    {
        id: 1,
        title: 'Rowerem przez Europę',
        description: 'Plan 3-miesięcznej podróży rowerowej',
        destinations: 5,
        duration: '90 dni',
        created: '2025-10-15',
        public: true,
        image:
            'https://images.unsplash.com/photo-1660732228432-1fd05bbea6f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
    },
    {
        id: 2,
        title: 'Azjatycka przygoda',
        description: 'Zwiedzanie krajów Azji Południowo-Wschodniej',
        destinations: 8,
        duration: '45 dni',
        created: '2025-11-01',
        public: false,
        image:
            'https://images.unsplash.com/photo-1684613998803-83fe7787db15?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
    },
    {
        id: 3,
        title: 'Weekend w spa',
        description: 'Relaksujący weekend w polskich Tatrach',
        destinations: 2,
        duration: '3 dni',
        created: '2025-11-03',
        public: true,
        image:
            'https://images.unsplash.com/photo-1608619485325-1b9b10b15101?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
    }
];

/* -------------------- Layout i header profilu -------------------- */

const ProfilePageMainbox = styled.div`
  width: 100%;
  min-height: 100vh;
  margin-top: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
`;

const ProfilePageBackgroundPic = styled.div`
  width: 90%;
  height: 400px;
  background-image: url('https://images.unsplash.com/photo-1619467416348-6a782839e95f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3JsZCUyMG1hcCUyMHRyYXZlbCUyMGFkdmVudHVyZXxlbnwxfHx8fDE3NjI0MjM3OTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral');
  background-size: cover;
  background-position: center;
  border-radius: 30px;
  position: relative;
  overflow: hidden;

  @media screen and (max-width: 640px){
    width: 98%;
  }

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.4);
    pointer-events: none;
  }

  .backgroundPicContentWrapper {
    color: white;
    z-index: 3;
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 20px;
    box-sizing: border-box;

    .backgroundPicContent {
      width: auto;
      min-height: 180px;
      border-radius: 24px;
      background: rgba(255,255,255,0.15);
      backdrop-filter: blur(15px);
      -webkit-backdrop-filter: blur(15px);
      border: 1px solid rgba(255,255,255,0.2);
      box-shadow: 0 4px 30px rgba(0,0,0,0.1);

      display: flex;
      align-items: center;
      gap: 20px;
      padding: 20px;

      @media (max-width: 640px) {
        width: 100%;
        gap: 16px;
        padding: 16px;
        flex-direction: column;
      }
    }
  }
`;

const Avatar = styled.div`
  width: 112px;
  height: 112px;
  border-radius: 50%;
  overflow: hidden;
  flex: 0 0 auto;
  background: linear-gradient(135deg, #ffffff 0%, #e0f2f1 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0f766e;
  font-weight: 700;
  font-size: 32px;
  border: 2px solid rgba(255,255,255,0.6);
  box-shadow: 0 6px 24px rgba(0,0,0,0.15);

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const TextBlock = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  align-items: flex-start;
`;

const Name = styled.h2`
  margin: 0;
  font-size: 28px;
  line-height: 1.2;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0 2px 6px rgba(0,0,0,0.25);
  word-break: break-word;
  text-align: left;
`;

const Email = styled.p`
  margin: 6px 0 0;
  font-size: 16px;
  color: rgba(255,255,255,0.9);
  text-shadow: 0 1px 3px rgba(0,0,0,0.25);
  word-break: break-all;
  text-align: left;
`;

const Meta = styled.div`
  margin-top: 8px;
  font-size: 14px;
  color: rgba(255,255,255,0.85);
  opacity: 0.95;
  text-align: left;
`;

/* -------------------- Pasek zakładek (identyczny, ale stabilny) -------------------- */

/* -------------------- Pasek zakładek (responsywny i stabilny) -------------------- */

const TabsContainer = styled.div`
  width: 90%;
  max-width: 1400px;
  display: flex;
  gap: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
  margin: 32px auto 48px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;

  /* scrollbar cosmetics */
  &::-webkit-scrollbar { height: 3px; }
  &::-webkit-scrollbar-track { background: transparent; }

  @media (max-width: 1024px) {
    gap: 0.4rem;
    margin: 24px auto 36px;
  }
  @media (max-width: 768px) {
    gap: 0.35rem;
    margin: 20px auto 28px;
  }
  @media (max-width: 480px) {
    gap: 0.3rem;
    margin: 16px auto 24px;
  }
`;

const Tab = styled.button`
  /* Stała „szuflada” na tab – zwęża się na mniejszych ekranach */
  flex: 0 0 140px;              /* desktop */
  text-align: center;

  background: none;
  border: none;
  padding: 1rem 1.5rem;         /* desktop */
  cursor: pointer;
  position: relative;

  /* nie zmieniamy font-weight, aby uniknąć reflow */
  font-weight: 600;
  font-size: 1rem;
  color: ${props => (props.$active ? '#000000' : '#9ca3af')};
  letter-spacing: -0.01em;
  white-space: nowrap;
  transition: color 0.2s ease;
  will-change: color;

  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: #000000;
    transform: scaleX(${props => (props.$active ? '1' : '0')});
    transform-origin: left;
    transition: transform 0.3s ease;
    will-change: transform;
  }

  &:hover { color: #000000; }
  &:focus-visible {
    outline: none;
    box-shadow: inset 0 -2px 0 #00000055;
    border-radius: 2px;
  }

  /* Lekko ciaśniej na laptopach */
  @media (max-width: 1024px) {
    flex-basis: 120px;
    padding: 0.9rem 1.25rem;
    font-size: 0.975rem;
  }

  /* Jeszcze ciaśniej na tabletach */
  @media (max-width: 768px) {
    flex-basis: 104px;
    padding: 0.8rem 1rem;
    font-size: 0.95rem;
  }

  /* Kompaktowo na telefonach */
  @media (max-width: 480px) {
    flex-basis: 92px;
    padding: 0.7rem 0.75rem;
    font-size: 0.9rem;
  }
`;


/* -------------------- Pomocnicze -------------------- */

function getInitials(nameOrEmail = "") {
    const str = String(nameOrEmail).trim();
    if (!str) return "U";
    const parts = str.includes("@")
        ? [str.split("@")[0]]
        : str.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] || "";
    const second = parts[1]?.[0] || "";
    return (first + second).toUpperCase() || "U";
}

/* Jeśli masz CDN – tu możesz zbudować srcSet, jak w poprzednim przykładzie */
function buildSrcSet(url) {
    if (!url) return undefined;
    try {
        const u1 = new URL(url, window.location.origin);
        const u2 = new URL(url, window.location.origin);
        u1.searchParams.set("w", "224");
        u2.searchParams.set("w", "448");
        return `${u1.toString()} 1x, ${u2.toString()} 2x`;
    } catch {
        return undefined;
    }
}

/* ========================= Component ========================= */

export const ProfilePage = () => {
    const { user } = useUserStore();
    const [activeTab, setActiveTab] = useState("overview");

    const displayName = useMemo(
        () =>
            user?.username ||
            (user?.email ? user.email.split("@")[0] : "Użytkownik"),
        [user]
    );
    const displayEmail = user?.email || "brak@email.com";
    const profilePic = user?.profilePic || "";
    const createdAt = user?.createdAt;

    const joined = useMemo(() => {
        if (!createdAt) return null;
        try {
            const d = new Date(createdAt);
            return new Intl.DateTimeFormat("pl-PL", {
                year: "numeric",
                month: "long",
                day: "numeric",
            }).format(d);
        } catch {
            return null;
        }
    }, [createdAt]);

    const srcSet = useMemo(() => buildSrcSet(profilePic), [profilePic]);

    return (
        <ProfilePageMainbox>
            {/* Header z danymi użytkownika */}
            <ProfilePageBackgroundPic>
                <div className="backgroundPicContentWrapper">
                    <div className="backgroundPicContent">
                        <Avatar aria-label="Zdjęcie profilowe">
                            {profilePic ? (
                                <img src={profilePic} alt={`${displayName} — zdjęcie profilowe`} />
                            ) : (
                                getInitials(user?.username || user?.email || "")
                            )}
                        </Avatar>
                        <TextBlock>
                            <Name>{displayName}</Name>
                            <Email>{displayEmail}</Email>
                            {joined && <Meta>Data dołączenia: {joined}</Meta>}
                        </TextBlock>
                    </div>
                </div>
            </ProfilePageBackgroundPic>

            {/* Pasek zakładek – stabilny, bez „skakania” */}
            <TabsContainer>
                <Tab
                    $active={activeTab === "overview"}
                    onClick={() => setActiveTab("overview")}
                >
                    Przegląd
                </Tab>
                <Tab
                    $active={activeTab === "wallet"}
                    onClick={() => setActiveTab("wallet")}
                >
                    Portfel
                </Tab>
                <Tab
                    $active={activeTab === "settings"}
                    onClick={() => setActiveTab("settings")}
                >
                    Ustawienia
                </Tab>
            </TabsContainer>

            {/* Sekcje treści dla zakładek – wstaw tu swoje komponenty */}
            {activeTab === "overview" && (
                <>
                    <TripsSection title="Zaplanowane wyjazdy" trips={trips.planned} />
                    <TripsSection title="Zrealizowane wyjazdy" trips={trips.completed} />
                    <TripsSection title="Oczekujące potwierdzenia" trips={trips.pending} />
                </>
            )}

            {activeTab === "wallet" && (
                <div style={{ width: "90%", maxWidth: 1400, margin: "0 auto 80px" }}>
                    <p style={{ color: "#374151" }}>
                        Tutaj pojawi się sekcja <strong>Portfel</strong>.
                    </p>
                </div>
            )}

            {activeTab === "settings" && (
                <div style={{ width: "90%", maxWidth: 1400, margin: "0 auto 80px" }}>
                    <p style={{ color: "#374151" }}>
                        Tutaj pojawi się sekcja <strong>Ustawienia</strong>.
                    </p>
                </div>
            )}
        </ProfilePageMainbox>
    );
};
