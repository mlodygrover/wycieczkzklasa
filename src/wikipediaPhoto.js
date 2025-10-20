import React, { useEffect, useState } from "react";
import axios from "axios";

export const WikipediaPhoto = () => {
    const [photoData, setPhotoData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPhoto = async () => {
            try {
                const response = await axios.get("http://localhost:5006/getWikipediaPhoto", {
                    params: {
                        name: "HistoryLand" },
        });
                setPhotoData(response.data);
            } catch (err) {
                setError("Nie udało się pobrać zdjęcia z Wikipedii.");
                console.error("❌ Błąd:", err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPhoto();
    }, []);

    if (loading) return <p style={{ textAlign: "center" }}>⏳ Wczytywanie...</p>;
    if (error) return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;

    if (!photoData || !photoData.image) {
        return <p style={{ textAlign: "center" }}>Brak zdjęcia dla tej atrakcji.</p>;
    }

    return (
        <div
            style={{
                fontFamily: "Inter, sans-serif",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                backgroundColor: "#f9f9f9",
                borderRadius: "12px",
                padding: "20px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                maxWidth: "500px",
                margin: "40px auto",
            }}
        >
            <h2 style={{ color: "#333", marginBottom: "10px" }}>
                {photoData.wikipediaTitle}
            </h2>

            <img
                src={photoData.image}
                alt={photoData.wikipediaTitle}
                style={{
                    width: "100%",
                    height: "auto",
                    borderRadius: "10px",
                    objectFit: "cover",
                }}
            />

            <a
                href={photoData.wikipediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    marginTop: "12px",
                    color: "#0077cc",
                    textDecoration: "none",
                    fontWeight: "500",
                }}
            >
                🔗 Zobacz w Wikipedii
            </a>
        </div>
    );
};

export default WikipediaPhoto;
