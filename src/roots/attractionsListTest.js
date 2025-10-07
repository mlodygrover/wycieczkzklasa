import { useEffect, useState } from "react";
import axios from "axios";

export const AttractionsList = ({ placeId, lat, lng }) => {
  const [attractions, setAttractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttractions = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get("http://localhost:5006/getAttractions", {
          params: {
            placeId: placeId,
            lat: lat,
            lng: lng
          }
        });
        console.log("TETS3", res.data)
        setAttractions(res.data);
      } catch (err) {
        setError(err.response?.data?.error || "Błąd pobierania danych");
      } finally {
        setLoading(false);
      }
    };

    if (placeId && lat && lng) {
      fetchAttractions();
    }
  }, [placeId, lat, lng]);

  if (loading) return <p>Ładowanie atrakcji...</p>;
  if (error) return <p style={{ color: "red" }}>Błąd: {error}</p>;

  return (
    <div>
      <h3>Atrakcje turystyczne w pobliżu</h3>
      <ul>
        {attractions.map((a) => (
          <li key={a.googleId}>
            <strong>{a.nazwa}</strong> — {a.adres} ({a.ocena ?? "brak oceny"}★)
          </li>
        ))}
      </ul>
    </div>
  );
};
