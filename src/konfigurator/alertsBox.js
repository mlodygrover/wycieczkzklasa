import React, { useEffect } from "react";
import styled from "styled-components";

const AlertsOutbox = styled.div`
    position: fixed; /* ✅ zamiast absolute, aby zakrywać cały ekran */
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(44, 44, 44, 0.6); /* ✅ półprzezroczysty overlay */
    z-index: 400;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.3s ease-in-out;

    .alertsBoxMainbox {
        min-width: 300px;
        min-height: 800px;
        background-color: #232531;
        color: white;
        font-family: Inter, system-ui, -apple-system, sans-serif;
        border-radius: 15px;
        padding: 30px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        font-size: 16px;
        text-align: center;
        cursor: pointer;
    }
`;

export const AlertsBox = ({ alertsTable, deleteAlert }) => {

    // 🔹 Zablokuj scrollowanie tła, gdy alert jest otwarty
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    if (!alertsTable?.length) return null;

    return (
        <AlertsOutbox>
            <div
                className="alertsBoxMainbox"
                onClick={() => deleteAlert(alertsTable[0].id)}
            >
                {alertsTable[0].content}
            </div>
        </AlertsOutbox>
    );
};
