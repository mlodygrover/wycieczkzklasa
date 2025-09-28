

import React, { useState, useEffect } from "react";
export default function MonthCalendarSquare({
    month,
    year,
    weekStartsOnMonday = true,
    locale = "pl-PL",
    dateStart = null,
    dateEnd = null,
    setDateStart, 
    setDateEnd
    
}) {
    const [currentMonth, setCurrentMonth] = useState(month);
    const [currentYear, setCurrentYear] = useState(year);

    // zmiana miesiąca
    const changeMonth = (offset) => {
        let newMonth = currentMonth + offset;
        let newYear = currentYear;

        if (newMonth > 12) {
            newMonth = 1;
            newYear++;
        } else if (newMonth < 1) {
            newMonth = 12;
            newYear--;
        }

        setCurrentMonth(newMonth);
        setCurrentYear(newYear);
    };

    // obliczenia dni
    const m = currentMonth - 1;
    const daysInMonth = new Date(currentYear, m + 1, 0).getDate();
    const firstDayJS = new Date(currentYear, m, 1).getDay();
    const firstDay = weekStartsOnMonday ? (firstDayJS + 6) % 7 : firstDayJS;

    const weekdayNames = weekStartsOnMonday
        ? ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"]
        : ["Nd", "Pn", "Wt", "Śr", "Cz", "Pt", "So"];

    const cells = Array.from({ length: 42 }, (_, idx) => {
        const dayNum = idx - firstDay + 1;
        return dayNum >= 1 && dayNum <= daysInMonth ? dayNum : null;
    });

    const monthLabel = new Date(currentYear, m, 1).toLocaleDateString(locale, {
        month: "long",
        year: "numeric",
    });

    // stylizacja
    const styles = {
        container: { width: "100%", aspectRatio: "1 / 1" },
        inner: {
            height: "100%",
            display: "flex",
            flexDirection: "column",
            borderRadius: 12,
            overflow: "hidden",
            background: "#fff",
        },
        headerBar: {
            padding: "8px 12px",
            fontSize: 14,
            fontWeight: 500,
            color: "#374151",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            textTransform: "capitalize",
        },
        navBtn: {
            cursor: "pointer",
            background: "none",
            border: "none",
            fontSize: 16,
            fontWeight: 600,
            color: "#374151",
            padding: "0 6px",
        },
        weekdays: {
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            borderBottom: "1px solid #f1f5f9",
        },
        weekdayCell: {
            padding: "6px 0",
            textAlign: "center",
            fontSize: 12,
            color: "#6b7280",
            fontWeight: 500,
        },
        daysGridWrap: { flex: 1, padding: 8, boxSizing: "border-box" },
        daysGrid: {
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gridTemplateRows: "repeat(6, 1fr)",
            height: "100%",
        },
        dayCell: {
            border: "1px solid #e5e7eb",
            borderRadius: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            cursor: "pointer",
            background: "#fdfdfd",
        },
        emptyCell: { border: "none", background: "none" },
    };

    const today = new Date();
    const isToday = (d) =>
        d &&
        today.getFullYear() === currentYear &&
        today.getMonth() === m &&
        today.getDate() === d;

    // kliknięcie dnia
    const handleDayClick = (d) => {
        if (!d) return;

        const clickedDate = new Date(currentYear, m, d);

        if (!dateStart) {
            // pierwszy klik
            setDateStart(clickedDate);
            setDateEnd(null);
        } else if (dateStart && !dateEnd) {
            // drugi klik
            if (clickedDate >= dateStart) {
                setDateEnd(clickedDate);
            } else {
                setDateStart(clickedDate);
                setDateEnd(null);
            }
        } else if (dateStart && dateEnd) {
            // trzeci klik – reset
            setDateStart(clickedDate);
            setDateEnd(null);
        }
    };

    // sprawdzanie czy dzień jest w zakresie
    const isInRange = (d) => {
        if (!d || !dateStart || !dateEnd) return false;
        const date = new Date(currentYear, m, d);
        return date >= dateStart && date <= dateEnd;
    };

    const isStart = (d) =>
        dateStart &&
        d &&
        new Date(currentYear, m, d).getTime() === dateStart.getTime();

    const isEnd = (d) =>
        dateEnd &&
        d &&
        new Date(currentYear, m, d).getTime() === dateEnd.getTime();
    
    return (
        <div style={styles.container}>
            <div style={styles.inner}>
                <div style={styles.headerBar}>
                    <button style={styles.navBtn} onClick={() => changeMonth(-1)}>
                        ‹
                    </button>
                    {monthLabel}
                    <button style={styles.navBtn} onClick={() => changeMonth(1)}>
                        ›
                    </button>
                </div>

                <div style={styles.weekdays}>
                    {weekdayNames.map((w) => (
                        <div key={w} style={styles.weekdayCell}>
                            {w}
                        </div>
                    ))}
                </div>

                <div style={styles.daysGridWrap}>
                    <div style={styles.daysGrid}>
                        {cells.map((d, i) => {
                            const cellStyle = {
                                ...styles.dayCell,
                                ...(d === null ? styles.emptyCell : {}),
                                ...(isToday(d) ? { borderColor: "#fdba74" } : {}),
                                ...(isInRange(d)
                                    ? { background: "#e0f2fe", }
                                    : {}),
                                ...(isStart(d)
                                    ? { background: "#bae6fd", }
                                    : {}),
                                ...(isEnd(d)
                                    ? { background: "#bae6fd", }
                                    : {}),
                            };

                            return (
                                <div
                                    key={i}
                                    style={cellStyle}
                                    onClick={() => handleDayClick(d)}
                                >
                                    {d !== null && <span>{d}</span>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
