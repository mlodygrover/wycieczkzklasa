import React from "react";
import { motion } from "framer-motion";
import styled from "styled-components";

export default function FiveSliceRadialButtons({
  labels = ["Jeden", "Dwa", "Trzy", "Cztery", "Pięć"],
  onSelect = (i) => console.log("Kliknięto klin:", i),
  innerRadius = 52,
  outerRadius = 96,
}) {
  const size = 220; // rozmiar SVG (px)
  const cx = size / 2;
  const cy = size / 2;
  const count = 5;
  const sweep = 360 / count; // 72°

  // Funkcje pomocnicze do geometrii łuków
  const toRad = (deg) => (deg * Math.PI) / 180;
  const polar = (cx, cy, r, angleDeg) => {
    const a = toRad(angleDeg);
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };

  const segmentPath = (startAngle, endAngle) => {
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

    const p1 = polar(cx, cy, outerRadius, startAngle);
    const p2 = polar(cx, cy, outerRadius, endAngle);
    const p3 = polar(cx, cy, innerRadius, endAngle);
    const p4 = polar(cx, cy, innerRadius, startAngle);

    const d = [
      `M ${p1.x} ${p1.y}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${p2.x} ${p2.y}`,
      `L ${p3.x} ${p3.y}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${p4.x} ${p4.y}`,
      "Z",
    ].join(" ");

    return d;
  };

  return (
    <Wrapper>
      <Container>
        <Title>Pięć przycisków – 1/5 koła</Title>
        <Subtitle>Kliknij klin lub użyj klawiszy TAB + ENTER/SPACE.</Subtitle>

        <SVGWrapper>
          <SVG
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            role="group"
            aria-label="Menu radialne pięciu przycisków"
          >
            <circle cx={cx} cy={cy} r={outerRadius} fill="white" />

            {Array.from({ length: count }).map((_, i) => {
              const start = -90 + i * sweep;
              const end = start + sweep;
              const d = segmentPath(start, end);
              const mid = start + sweep / 2;
              const labelR = (innerRadius + outerRadius) / 2;
              const labelPos = polar(cx, cy, labelR, mid);
              const title = labels[i] ?? `Segment ${i + 1}`;

              return (
                <g key={i}>
                  <StyledPath
                    d={d}
                    initial={{ opacity: 1 }}
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => onSelect(i)}
                    tabIndex={0}
                    role="button"
                    aria-label={title}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelect(i);
                      }
                    }}
                  />

                  <Label
                    x={labelPos.x}
                    y={labelPos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {title}
                  </Label>
                </g>
              );
            })}

            <circle
              cx={cx}
              cy={cy}
              r={innerRadius - 8}
              fill="white"
              stroke="#ccc"
            />
            <CenterLabel
              x={cx}
              y={cy}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              MENU
            </CenterLabel>
          </SVG>
        </SVGWrapper>
      </Container>
    </Wrapper>
  );
}

// Styled Components
const Wrapper = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f9f9f9;
  padding: 24px;
`;

const Container = styled.div`
  max-width: 320px;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 4px;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #555;
  margin-bottom: 12px;
`;

const SVGWrapper = styled.div`
  position: relative;
  margin: 0 auto;
`;

const SVG = styled.svg`
  display: block;
  margin: 0 auto;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
`;

const StyledPath = styled(motion.path)`
  stroke: #ddd;
  fill: #f4f4f4;
  cursor: pointer;
  outline: none;
  &:focus {
    filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.25));
  }
`;

const Label = styled.text`
  font-size: 12px;
  fill: #444;
  user-select: none;
  font-weight: 500;
`;

const CenterLabel = styled.text`
  font-size: 12px;
  fill: #777;
`;
