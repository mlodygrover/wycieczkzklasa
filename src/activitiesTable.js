import React, { useState } from 'react';
import styled from 'styled-components';
import {
    MapPin,
    Clock,
    CalendarDays,
    ChevronDown,
    Timer,
    CalendarRange
} from 'lucide-react';

// --- DATA HELPERS ---

const addMinutesToTime = (timeStr, minutesToAdd) => {
    if (!timeStr) return null;

    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes + (minutesToAdd || 0));

    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// --- STYLES ---

const CardWrapper = styled.div`
  flex: 1;
  max-width: 800px;
  flex-shrink: 0;
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 20px;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
  box-sizing: border-box;

`;

const HeaderSection = styled.div`
  background-color: #fafafa;
  padding: 20px 30px;
  border-bottom: 1px solid #e5e5e5;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  text-align: left;
  span{
    a{
        text-decoration: underline;
        color: black;
        font-weight: 700;
    }
  }
`;

const ContentSection = styled.div`
  padding: 10px 20px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  
  /* Ograniczenie wysokości */
  height: 600px; /* Ustaw wysokość zbliżoną do lewego kafelka */
  overflow-y: auto;  /* Włącz scrollowanie w pionie */

  box-sizing: border-box;
  /* Stylizacja paska przewijania (opcjonalnie) */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 4px;
  }

   @media (max-width: 600px) {
    padding: 20px;
    height: auto;
  }
`;
// --- STYLES DLA TIMELINE ---

const DaySection = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const DayHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between; 
  padding: 15px 10px; 
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer; 
  transition: background-color 0.2s ease;
  border-radius: 8px;
  box-sizing: border-box;

  &:hover {
    background-color: #f9f9f9;
  }
  
  font-size: 16px;
  font-weight: 700;
  color: #111;

  .header-content {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  span.day-number {
    background-color: #000;
    color: #fff;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .chevron {
    transition: transform 0.3s ease;
    transform: ${({ $isOpen }) => ($isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
    color: #666;
  }
`;

const ActivitiesList = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: 20px;
  /* Centrowanie listy */
  align-items: center; 
  
  @media (max-width: 768px) {
    padding-top: 15px;
  }
`;

const TimelineItem = styled.div`
  display: flex;
  gap: 20px;
  position: relative;
  padding-bottom: 30px;
  width: 100%;
  max-width: 600px; /* Ograniczenie szerokości żeby nie było zbyt szerokie na dużych ekranach */

  &:last-child {
    padding-bottom: 0;
    .line-col::before { display: none; }
  }

  @media (max-width: 768px) {
    gap: 15px;
    padding-bottom: 25px;
  }
`;

const LineColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  min-width: 24px;
  /* Odstęp od góry, żeby kropka była równo z tytułem/czasem */
  padding-top: 5px; 

  &::before {
    content: '';
    position: absolute;
    top: 24px; 
    bottom: -10px;
    width: 2px;
    background-color: #e5e5e5;
    z-index: 0;
  }
`;

const Dot = styled.div`
  width: 14px;
  height: 14px;
  background-color: #fff;
  border: 3px solid #000;
  border-radius: 50%;
  z-index: 1;
  flex-shrink: 0;
  box-shadow: 0 0 0 4px #fff; 
`;

const ContentCard = styled.div`
  flex: 1;
  background-color: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  padding: 15px 20px;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 8px;

  &:hover {
    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
    border-color: #d4d4d4;
    transform: translateX(2px);
  }
`;

// Teraz widoczny zawsze (usunięto display: none i media query)
const TimeBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
  color: #444;
  background-color: #f5f5f5;
  width: fit-content;
  padding: 4px 10px;
  border-radius: 6px;
  box-sizing: border-box;
`;

const ActivityTitle = styled.div`
  font-weight: 600;
  font-size: 16px;
  color: #111;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ActivityMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 12px;
  color: #666;
  flex-wrap: wrap; /* Zawsze zawijaj jeśli za mało miejsca */

  div {
    display: flex;
    align-items: center;
    gap: 4px;
  }
`;

// --- KOMPONENT GŁÓWNY ---

export const TripTimeline = ({ activitiesSchedule = [[]], timesSchedule = [], loungeVersion=false, tripId="" }) => {
    const [expandedDays, setExpandedDays] = useState({});

    const toggleDay = (index) => {
        setExpandedDays((prev) => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    if (!activitiesSchedule || activitiesSchedule.length === 0) {
        return(
            <CardWrapper>
            <HeaderSection>
                <CalendarRange size={20} color="#333" />
                <Title>{loungeVersion && tripId ? <span>Podsumowanie wyjazdu, aby zmodyfikować plan <a href={`/konfigurator?tripId=${tripId}`}>przejdź do konfiguratora</a></span> : "Podsumowanie dni"}</Title>
            </HeaderSection>

            <ContentSection>
                
            </ContentSection>
        </CardWrapper>
        )
        
    }

    return (
        <CardWrapper>
            <HeaderSection>
                <CalendarRange size={20} color="#333" />
                <Title>{loungeVersion && tripId ? <span>Podsumowanie wyjazdu, aby zmodyfikować plan <a href={`/konfigurator?tripId=${tripId}`}>przejdź do konfiguratora</a></span> : "Podsumowanie dni"}</Title>
            </HeaderSection>

            <ContentSection>
                {activitiesSchedule.map((dayActivities, dayIndex) => {
                    if (!dayActivities || dayActivities.length === 0) return null;

                    const isExpanded = !!expandedDays[dayIndex];

                    return (
                        <DaySection key={dayIndex}>
                            <DayHeader onClick={() => toggleDay(dayIndex)} $isOpen={isExpanded}>
                                <div className="header-content">
                                    <span className="day-number">Dzień {dayIndex + 1}</span>
                                    <CalendarDays size={18} color="#666" />
                                </div>
                                <ChevronDown className="chevron" size={20} />
                            </DayHeader>

                            {isExpanded && (
                                <ActivitiesList>
                                    {dayActivities.map((activity, actIndex) => {
                                        const startTime = timesSchedule?.[dayIndex]?.[actIndex];
                                        const duration = activity.czasZwiedzania || 0;
                                        const endTime = startTime ? addMinutesToTime(startTime, duration) : null;

                                        return (
                                            <TimelineItem key={`${dayIndex}-${actIndex}`}>

                                                {/* Wspólna oś dla mobile i desktop */}
                                                <LineColumn className="line-col">
                                                    <Dot />
                                                </LineColumn>

                                                <ContentCard>
                                                    {/* Czas zawsze wewnątrz karty */}
                                                    {startTime && (
                                                        <TimeBadge>
                                                            <Timer size={14} />
                                                            {startTime} - {endTime}
                                                        </TimeBadge>
                                                    )}

                                                    <ActivityTitle>
                                                        {activity.nazwa || "Aktywność"}
                                                    </ActivityTitle>

                                                    <ActivityMeta>
                                                        <div>
                                                            <Clock size={14} />
                                                            {duration > 0 ? `${duration} min` : 'Czas elastyczny'}
                                                        </div>
                                                        {activity.adres && (
                                                            <div>
                                                                <MapPin size={14} />
                                                                {activity.adres}
                                                            </div>
                                                        )}
                                                    </ActivityMeta>
                                                </ContentCard>
                                            </TimelineItem>
                                        );
                                    })}
                                </ActivitiesList>
                            )}
                        </DaySection>
                    );
                })}
            </ContentSection>
        </CardWrapper>
    );
};