import { useEffect } from 'react';
import styled from 'styled-components';

const ScheduleContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 2rem;
`;

const DayContainer = styled.div`
  position: relative;
  padding-left: 1.5rem;
  border-left: 2px solid black;
  flex: 0 0 auto;
  min-width: 280px;
  max-width: 400px;
`;

const DayDot = styled.div`
  position: absolute;
  left: -9px;
  top: 0;
  width: 16px;
  height: 16px;
  background-color: black;
  border-radius: 50%;
`;

const DayHeader = styled.div`
  margin-bottom: 1rem;
`;

const DayTitle = styled.h3`
  margin-bottom: 0.125rem;
`;

const ActivitiesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ActivityItem = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.375rem 0;
`;

const ActivityDot = styled.div`
  position: absolute;
  left: -30px;
  width: 16px;
  height: 16px;
  background-color: white;
  border: 2px solid black;
  border-radius: 50%;
`;

const ActivityName = styled.div`
  font-size: 0.875rem;
`;

export function TripSchedulePreview({ activitiesSchedule }) {
  // Bezpieczne „uspłaszczone” wejście – zawsze tablica
  const days = Array.isArray(activitiesSchedule) ? activitiesSchedule : [];

  // Jeśli brak dni – możesz zwrócić np. pusty fragment albo komunikat
  if (days.length === 0) {
    return null;
    // albo:
    // return <p>Brak zaplanowanych aktywności.</p>;
  }

  return (
    <ScheduleContainer>
      {days.map((day, dayIndex) => {
        // Bezpiecznie pobierz aktywności dnia – zawsze tablica
        const dayActivities = Array.isArray(day) ? day : [];

        return (
          <DayContainer key={dayIndex}>
            <DayDot />

            <DayHeader>
              <DayTitle>Dzień {dayIndex + 1}</DayTitle>
            </DayHeader>

            {dayActivities.length > 0 && (
              <ActivitiesList>
                {dayActivities.map((activity, activityIndex) => (
                  <ActivityItem key={activityIndex}>
                    <ActivityDot />
                    <ActivityName>
                      {activity?.nazwa || "Aktywność bez nazwy"}
                    </ActivityName>
                  </ActivityItem>
                ))}
              </ActivitiesList>
            )}
          </DayContainer>
        );
      })}
    </ScheduleContainer>
  );
}
