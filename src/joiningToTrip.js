// JoiningToTrip.jsx
import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Loader from "./roots/loader";
import useUserStore, { fetchMe } from "./usercontent";

const portacc = process.env.REACT_APP_API_SOURCE || "https://api.draftngo.com";

export const JoiningToTrip = () => {
  const navigate = useNavigate();
  const userFromStore = useUserStore((state) => state.user);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    let aborted = false;

    (async () => {
      try {
        // 1) Upewniamy się, że mamy usera w store
        let currentUser = userFromStore;

        if (!currentUser?._id) {
          // fetchMe zaktualizuje store – sam nic nie zwraca
          await fetchMe().catch(() => null);
          currentUser = useUserStore.getState().user;
        }

        if (aborted) return;

        // Brak zalogowanego użytkownika → przekierowanie do logowania
        if (!currentUser?._id) {
          // Możesz dodać redirect param, jeśli chcesz wrócić potem na tę stronę
          navigate("/login", { replace: true });
          return;
        }

        const userId = String(currentUser._id);

        // 2) Czytamy parametry z URL
        const tripId = searchParams.get("tripId");
        const code = searchParams.get("code");
        console.log("dane", tripId, code)
        if (!tripId || !code) {
          alert("Brak wymaganych parametrów (tripId lub code) w adresie URL.");
          navigate("/", { replace: true });
          return;
        }

        // 3) Wywołujemy endpoint join-by-code
        const url = `${portacc}/api/trip-plans/${encodeURIComponent(
          tripId
        )}/join-by-code/${encodeURIComponent(userId)}`;

        const resp = await fetch(url, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ code }),
        });

        if (aborted) return;

        if (!resp.ok) {
          let message = "Nie udało się dołączyć do wyjazdu.";
          try {
            const errJson = await resp.json();
            if (errJson?.message) message = errJson.message;
          } catch {
            // ignorujemy problem z parsowaniem JSON
          }
          alert(message);
          navigate("/", { replace: true });
          return;
        }

        // 4) Sukces → przekierowanie do konfiguratora
        navigate(`/konfigurator-lounge?tripId=${encodeURIComponent(tripId)}`, {
          replace: true,
        });
      } catch (err) {
        if (aborted) return;
        console.error("JoiningToTrip error:", err);
        alert("Wystąpił błąd podczas dołączania do wyjazdu.");
        navigate("/", { replace: true });
      }
    })();

    return () => {
      aborted = true;
    };
  }, [userFromStore?._id, navigate, searchParams]);

  // UI – cały czas pokazujemy loader, logika dzieje się w useEffect
  return <Loader />;
};
