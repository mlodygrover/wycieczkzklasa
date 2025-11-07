// KonfiguratorLoader.jsx
import React, { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { KonfiguratorMain } from "./konfiguratorMain";

export default function KonfiguratorLoader() {
  const location = useLocation();
  const navigate = useNavigate();

  // Capture exactly once on first render
  const initialStateRef = useRef(location.state);

  useEffect(() => {
    // Clear router state so refreshes no longer resend it
    if (initialStateRef.current) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [navigate, location.pathname]);

  const defaultMiejsceDocelowe = {
    idGoogle: "ChIJvZz0W9c0JkcR8E13wKgL4Ks",
    location: { lat: 52.4064, lng: 16.9252 },
  };

  const s = initialStateRef.current || {};
  const activitiesScheduleInit =
    Array.isArray(s.activitiesSchedule) ? s.activitiesSchedule : undefined;
  const planIdInit = s.planId || undefined;
  const miejsceDoceloweInit = s.miejsceDocelowe || defaultMiejsceDocelowe;

  return (
    <KonfiguratorMain
      miejsceDoceloweInit={miejsceDoceloweInit}
      {...(activitiesScheduleInit ? { activitiesScheduleInit } : {})}
      {...(planIdInit ? { planIdInit } : {})}
    />
  );
}
