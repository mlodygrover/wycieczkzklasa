import { Clock, MapPin, Plane } from "lucide-react";
import React from "react"
import styled from "styled-components"


const trips = {
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
        },
        {
            id: 4,
            title: 'Wyjazd na narty',
            destination: 'Zakopane, Polska',
            date: '20–27 Sty 2026',
            days: 7,
            status: 'planned',
            image:
                'https://images.unsplash.com/photo-1510951459752-aac634df6e86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
        },
        {
            id: 4,
            title: 'Wyjazd na narty',
            destination: 'Zakopane, Polska',
            date: '20–27 Sty 2026',
            days: 7,
            status: 'planned',
            image:
                'https://images.unsplash.com/photo-1510951459752-aac634df6e86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
        },
        {
            id: 4,
            title: 'Wyjazd na narty',
            destination: 'Zakopane, Polska',
            date: '20–27 Sty 2026',
            days: 7,
            status: 'planned',
            image:
                'https://images.unsplash.com/photo-1510951459752-aac634df6e86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
        },
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

const EmptyTableMessage = styled.div`
    width: 90%;
    max-width: 1600px;
    border-radius: 30px;
    display: flex;
    flex-direction: column;
    gap: 5px;
    align-items: center;
    justify-content: center;
    height: 200px;
    background-color: #f6f6f6;
    border: 1px solid #e0e0e0;
    color: #808080;
    .emptyIconCircle{
        height: 45px;
        width: 45px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #e0e0e0;
        border-radius: 9999px;
        
        svg{
        color: #808080;
        }
    }
    .emptyDesc{
        font-size: 22px;
        font-weight: 600;
    }
    .emptyButton{
        background-color: black;
        color: white;
        padding: 10px 20px;
        border-radius: 10px;
        font-size: 16px;
        margin-top: 10px;
        cursor: pointer;
        transition: 0.3s ease;
        &:hover{
            background-color: #404040;

        }

    }
`
const SummaryTripsMainbox = styled.div`
  width: 90%;
  max-width: 1600px;
  display: grid;
  gap: 20px;
  /* równe kolumny od min 300px w górę, wypełnianie od lewej */
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  margin-bottom: 30px;
  @media screen and (max-width: 400px){
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
`;

const SummaryTripCardMainbox = styled.div`
  height: 400px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden; 
  border: 1px solid #eaeaea;
  .summaryTripCardImg {
    height: 200px;      /* dokładnie połowa wysokości karty */
    position: relative;
  }

  .summaryTripCardImg img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;          /* wypełnij bez rozciągania (może przyciąć) */
  }

  .summaryTripCardDesc {
    flex: 1;            /* druga połowa karty */
    padding: 12px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    .summaryTripTitle{
        text-align: left;
        font-size: 18px;
        font-weight: 700;
        font-family: 'Inter';
        letter-spacing: -0.01em;
    }
    .summaryTripSubtitle{
        text-align: left;
        font-size: 14px;
        font-weight: 500;
        font-family: 'Inter';
        letter-spacing: -0.01em;
        color: #808080;
    }
    .summaryTripRow{
        display: flex;
        align-items: flex-start;
        text-align: left;
        gap: 5px;
        font-size: 14px;
        color: #808080;
        margin-top: 8px;
        font-weight: 500;

        svg {
            color: #808080;
        }
    }
    .summaryTripStatus{
        margin-right: auto;
        background-color: black;
        color: white;
        font-weight: 500;
        padding: 4px 6px;
        margin-top: auto;
        border-radius: 5px;
        font-size: 12px;

    }
  }
`;
const statusLabel = (status) => {
    switch (status) {
        case 'planned':
            return 'Zaplanowane';
        case 'completed':
            return 'Ukończone';
        case 'pending':
            return 'Oczekujące';
        case 'sketch':
            return 'Szkic';
        default:
            return 'Status';
    }
};

export const SummaryTripCard = ({ trip }) => {
    return (
        <SummaryTripCardMainbox>
            <div className="summaryTripCardImg">
                <img src={trip.image} />
            </div>
            <div className="summaryTripCardDesc">
                <div className="summaryTripTitle">
                    {trip.title}
                </div>
                <div className="summaryTripSubtitle">
                    {trip.destination}
                </div>
                <div className="summaryTripRow">
                    <Clock size={16} />
                    {trip.date}
                </div>
                <div className="summaryTripRow">
                    <MapPin size={16} />
                    {trip.days} dni
                </div>
                <div className="summaryTripStatus">
                    {statusLabel(trip.status)}
                </div>
            </div>
        </SummaryTripCardMainbox>
    );
};
export const SummaryTrips = ({ tripsLocal = trips.planned }) => {
    const list = Array.isArray(tripsLocal) ? tripsLocal : [];

    if (!list.length) {
        return <EmptyTableMessage>

            <div className="emptyIconCircle">
                <Plane size={32} />
            </div>
            <div className="emptyDesc">
                Brak planów wyjazdu
            </div>
            <div className="emptyButton">
                Kliknij aby stworzyć
            </div>
        </EmptyTableMessage>;
    }

    return (
        <SummaryTripsMainbox>
            {list.map((trip) => (
                <SummaryTripCard key={trip.id ?? `${trip.title}-${trip.date}`} trip={trip} />
            ))}
        </SummaryTripsMainbox>
    );
};

