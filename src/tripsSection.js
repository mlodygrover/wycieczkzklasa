// TripsSection.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Clock, MapPin } from 'lucide-react';

/* -------------------- ImageWithFallback (plain JS) -------------------- */

const ERROR_IMG_SRC =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==';

export function ImageWithFallback(props) {
    const [didError, setDidError] = useState(false);
    const { src, alt, className, style, ...rest } = props;

    if (didError || !src) {
        return (
            <div
                className={`inline-block bg-gray-100 text-center align-middle ${className || ''}`}
                style={{ width: '100%', height: '100%', ...style }}
            >
                <div className="flex items-center justify-center w-full h-full">
                    <img
                        src={ERROR_IMG_SRC}
                        alt={alt || 'Image not available'}
                        data-original-url={src || ''}
                        style={{ maxWidth: '60%', opacity: 0.7 }}
                    />
                </div>
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt || ''}
            className={className}
            style={style}
            onError={() => setDidError(true)}
            {...rest}
        />
    );
}

ImageWithFallback.propTypes = {
    src: PropTypes.string,
    alt: PropTypes.string,
    className: PropTypes.string,
    style: PropTypes.object,
};

/* ---------- Styles reproduced from your profile file ---------- */

const SectionTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #000000;
  letter-spacing: -0.02em;
`;

const ContentGrid = styled.div`
  display: grid;
  gap: 1.5rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const LiquidGlassCard = styled.div`
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 1.5rem;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 100%);
    opacity: 0;
    transition: opacity 0.4s;
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
    border-color: rgba(0, 0, 0, 0.1);
  }

  &:hover::before {
    opacity: 1;
  }
`;

const CardImage = styled.div`
  width: 100%;
  height: 12rem;
  position: relative;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s;
  }

  &:hover img {
    transform: scale(1.05);
  }
`;

const CardContent = styled.div`
  padding: 1.5rem;
  position: relative;
  z-index: 1;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const CardTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 700;
  color: #000000;
  margin-bottom: 0.25rem;
  letter-spacing: -0.01em;
`;

const CardSubtitle = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
  margin-bottom: 0.5rem;

  svg {
    color: #9ca3af;
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.375rem 0.875rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${(props) => {
        switch (props.$status) {
            case 'planned':
                return '#000000';
            case 'completed':
                return '#2d5f5d';
            case 'pending':
                return '#6b7280';
            default:
                return '#f3f4f6';
        }
    }};
  color: #ffffff;
  margin-top: 0.5rem;
`;

/* -------------------- Helpers -------------------- */

const statusLabel = (status) => {
    switch (status) {
        case 'planned':
            return 'Zaplanowane';
        case 'completed':
            return 'Ukończone';
        case 'pending':
            return 'Oczekujące';
        default:
            return 'Status';
    }
};

const pluralizeDays = (n) => `${n} ${n === 1 ? 'dzień' : 'dni'}`;

/* -------------------- Component -------------------- */

export function TripsSection({ title, trips = [] }) {
    if (!trips?.length) return null;

    return (
        <>
            <SectionTitle style={{ marginTop: '3rem' }}>{title}</SectionTitle>
            <ContentGrid>
                {trips.map((trip) => (
                    <LiquidGlassCard key={trip.id}>
                        <CardImage>
                            <ImageWithFallback src={trip.image} alt={trip.title} />
                        </CardImage>

                        <CardContent>
                            <CardHeader>
                                <div>
                                    <CardTitle>{trip.title}</CardTitle>
                                    <CardSubtitle>{trip.destination}</CardSubtitle>
                                </div>
                            </CardHeader>

                            <InfoRow>
                                <Clock size={16} />
                                <span>{trip.date}</span>
                            </InfoRow>

                            <InfoRow>
                                <MapPin size={16} />
                                <span>{pluralizeDays(trip.days)}</span>
                            </InfoRow>

                            <StatusBadge $status={trip.status}>
                                {statusLabel(trip.status)}
                            </StatusBadge>
                        </CardContent>
                    </LiquidGlassCard>
                ))}
            </ContentGrid>
        </>
    );
}

TripsSection.propTypes = {
    title: PropTypes.string.isRequired,
    trips: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            title: PropTypes.string.isRequired,
            destination: PropTypes.string.isRequired,
            date: PropTypes.string.isRequired,
            days: PropTypes.number.isRequired,
            status: PropTypes.oneOf(['planned', 'completed', 'pending']).isRequired,
            image: PropTypes.string,
        })
    ),
};

export default TripsSection;
