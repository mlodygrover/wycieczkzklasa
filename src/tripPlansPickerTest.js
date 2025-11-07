// TripPlansPicker.jsx
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5007";

const Wrapper = styled.div`
  width: 90%;
  max-width: 1200px;
  margin: 120px auto 60px;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 16px;
`;

const Note = styled.p`
  margin: 0 0 24px;
  color: #6b7280;
  font-size: 14px;
`;

const Grid = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
`;

const PlanButton = styled.button`
  width: 100%;
  text-align: left;
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 12px;
  padding: 14px 16px;
  cursor: pointer;
  transition: box-shadow .2s ease, transform .06s ease;
  &:hover { box-shadow: 0 8px 24px rgba(0,0,0,.06); }
  &:active { transform: scale(.99); }

  .line1 { font-weight: 700; color: #111827; }
  .line2 { font-size: 13px; color: #6b7280; margin-top: 4px; }
  .chips { display:flex; gap:8px; flex-wrap:wrap; margin-top:8px; }
`;

const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  font-size: 12px;
  color: #111827;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
`;

const Inline = styled.div`
  display: flex; gap: 8px; align-items: center; flex-wrap: wrap;
`;

export default function TripPlansPicker() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetch(`${API_URL}/api/trip-plans`, {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json(); // [{ _id, createdAt, authors, miejsceDocelowe, activitiesSchedule: ActivityItem[][] }, ...]
        if (mounted) setPlans(Array.isArray(data) ? data : []);
      } catch (e) {
        if (mounted) setErr(e.message || "Błąd pobierania");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <Wrapper><Title>Twoje plany</Title><Note>Ładowanie…</Note></Wrapper>;
  if (err) return <Wrapper><Title>Twoje plany</Title><Note>Błąd: {String(err)}</Note></Wrapper>;
  if (!plans.length) return <Wrapper><Title>Twoje plany</Title><Note>Brak zapisanych planów.</Note></Wrapper>;

  const fmtDate = (iso) => {
    try {
      return new Intl.DateTimeFormat("pl-PL", {
        year: "numeric", month: "long", day: "numeric",
        hour: "2-digit", minute: "2-digit"
      }).format(new Date(iso));
    } catch { return iso; }
  };

  return (
    <Wrapper>
      <Title>Twoje zapisane plany</Title>
      <Note>Wybierz plan, aby otworzyć go w konfiguratorze.</Note>
      <Grid>
        {plans.map((p) => {
          const days = Array.isArray(p.activitiesSchedule) ? p.activitiesSchedule.length : 0;
          const totalActs = Array.isArray(p.activitiesSchedule)
            ? p.activitiesSchedule.reduce((acc, day) => acc + (Array.isArray(day) ? day.length : 0), 0)
            : 0;

          const dest = p.miejsceDocelowe || {};
          const destName = dest.nazwa || '—';
          const destCountry = dest.kraj || '';
          const authorsCount = Array.isArray(p.authors) ? p.authors.length : 0;

          return (
            <PlanButton
              key={p._id}
              onClick={() =>
                navigate("/konfigurator", {
                  state: {
                    planId: p._id,
                    activitiesSchedule: p.activitiesSchedule, // tablica tablic
                    miejsceDocelowe: p.miejsceDocelowe || null,
                    authors: p.authors || [],
                  },
                })
              }
            >
              <div className="line1">
                Plan #{p._id.slice(-6)} {destName !== '—' ? `— ${destName}` : ''}
              </div>
              <div className="line2">
                <Inline>
                  <span>Utworzono: {fmtDate(p.createdAt)}</span>
                  <span>•</span>
                  <span>Dni: {days}</span>
                  <span>•</span>
                  <span>Aktywności: {totalActs}</span>
                </Inline>
              </div>
              <div className="chips">
                <Chip>{destName}{destCountry ? `, ${destCountry}` : ''}</Chip>
                <Chip>Autorzy: {authorsCount}</Chip>
              </div>
            </PlanButton>
          );
        })}
      </Grid>
    </Wrapper>
  );
}
