import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { minutesToTime } from './konfiguratorWyjazduComp';

const port = process.env.REACT_APP__SERVER_API_SOURCE || "https://wycieczkzklasa.onrender.com";
const ChatBoxMainbox = styled.div`
    width: 80%;
    background-color: #fbfbfb;
    border-radius: 18px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    padding: 20px 12px;
    height: 600px;
    border: 1px solid #e5e5e5;
    
    .headerBox {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: 10px;
        padding-bottom: 12px;
        border-bottom: 1px solid #e9e9e9;
        margin-bottom: 16px;
    }
    
    .iconWrapper {
        width: 36px;
        height: 36px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
    }
    
    .headerText {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
    }
    
    .headerTitle {
        font-size: 14px;
        font-weight: 600;
        color: #202020;
        margin: 0;
    }
    
    .headerStatus {
        font-size: 11px;
        color: #999;
        margin: 0;
    }
    
    .messagesArea {
        width: 100%;
        flex: 1;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 16px;
        
        &::-webkit-scrollbar {
            width: 4px;
        }
        
        &::-webkit-scrollbar-track {
            background: transparent;
        }
        
        &::-webkit-scrollbar-thumb {
            background: #d0d0d0;
            border-radius: 10px;
        }
    }
    
    .messageWrapper {
        display: flex;
        width: 100%;
        
        &.user {
            justify-content: flex-end;
        }
        
        &.ai {
            justify-content: flex-start;
        }
    }
        
    .message {
        display: flex;
        background-color: #e9e9e9;
        max-width: 75%;
        border-radius: 15px;
        font-size: 13px;
        text-align: left;
        padding: 10px 14px;
        font-weight: 400;
        color: #202020;
        white-space: pre-wrap;
        overflow-wrap: break-word;
        box-sizing: border-box;
        opacity: 0;
        transform: translateY(10px);
        animation: fadeInUp 0.3s ease forwards; /* 🔹 animacja wejścia */
        
        &.user {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff;
        }
    }

    /* 🔹 Animacja płynnego pojawiania się wiadomości */
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    /* 🔹 Placeholder ładowania */
    .loadingDots {
        display: flex;
        gap: 4px;
        align-items: center;
        justify-content: flex-start;
    }

    .dot {
        width: 8px;
        height: 8px;
        background: #ccc;
        border-radius: 50%;
        animation: bounce 1.2s infinite ease-in-out;
    }

    .dot:nth-child(2) {
        animation-delay: 0.2s;
    }

    .dot:nth-child(3) {
        animation-delay: 0.4s;
    }

    @keyframes bounce {
        0%, 80%, 100% {
            transform: scale(0);
            opacity: 0.3;
        }
        40% {
            transform: scale(1);
            opacity: 1;
        }
    }

    /* 🔹 Efekt shimmera dla dłuższej wiadomości ładowania */
    .message.ai.loading {
        position: relative;
        overflow: hidden;
        height: 40px;
        width: 70%;
        background: #e6e6e6;
    }

    .message.ai.loading::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0) 100%);
        animation: shimmer 1.2s infinite;
    }

    @keyframes shimmer {
        0% {
            left: -100%;
        }
        100% {
            left: 100%;
        }
    }



    
    .inputWrapper {
        width: 100%;
        display: flex;
        gap: 8px;
        margin-bottom: 12px;
    }
    
    .sendMessageBox {
        flex: 1;
        height: 40px;
        background-color: #f5f5f5;
        border-radius: 12px;
        border: none;
        padding: 0 14px;
        font-size: 13px;
        outline: none;
        transition: all 0.2s;
        
        &:focus {
            background-color: #ebebeb;
            box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
        }
        
        &::placeholder {
            color: #999;
        }
    }
    
    .sendButton {
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        border-radius: 12px;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        
        &:hover:not(:disabled) {
            transform: scale(1.05);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        
        &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
    }
    
    .suggestionsWrapper {
        width: 100%;
    }
    
    .suggestionsLabel {
        font-size: 10px;
        color: #999;
        margin: 0 0 8px 0;
    }
    
    .suggestionsContainer {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }
    
    .suggestionButton {
        padding: 8px 12px;
        background-color: #f0f0f0;
        border: none;
        border-radius: 10px;
        font-size: 11px;
        color: #333;
        cursor: pointer;
        text-align: left;
        transition: all 0.2s;
        
        &:hover {
            background-color: #e0e0e0;
            transform: translateX(2px);
        }
    }
`;

const suggestedMessages = [
    'Dodaj aktywności w 1 dzień',
    'Zaplanuj pierwsze dwa dni wyjazdu',
];
// 🧩 Funkcja, która rozbija długie słowa powyżej 20 znaków
const wrapLongWords = (text, limit = 20) => {
    return text.split(" ").map(word => {
        if (word.length > limit) {
            // Wstawia spację lub znak łamania po co 'limit' znaków
            return word.match(new RegExp(`.{1,${limit}}`, "g")).join(" ");
        }
        return word;
    }).join(" ");
};

function parseArguments(command) {
    // Usuń ewentualne spacje z początku i końca
    command = command.trim();

    // Znajdź nazwę funkcji (do pierwszego nawiasu otwierającego)
    const nameMatch = command.match(/^([a-zA-Z0-9_]+)\s*\(/);
    if (!nameMatch) return [];

    const functionName = nameMatch[1];

    // Wyodrębnij zawartość wewnątrz nawiasów
    const argsString = command.slice(command.indexOf("(") + 1, command.lastIndexOf(")")).trim();

    if (!argsString) return [functionName];

    // 🧩 Spróbuj rozbić argumenty po przecinkach, ale z uwzględnieniem zagnieżdżeń {…}, […] i cudzysłowów
    const args = [];
    let current = "";
    let depth = 0;
    let inString = false;
    let stringChar = null;

    for (let i = 0; i < argsString.length; i++) {
        const ch = argsString[i];

        if ((ch === '"' || ch === "'") && argsString[i - 1] !== "\\") {
            if (!inString) {
                inString = true;
                stringChar = ch;
            } else if (stringChar === ch) {
                inString = false;
                stringChar = null;
            }
        }

        if (!inString) {
            if (ch === "{" || ch === "[" || ch === "(") depth++;
            else if (ch === "}" || ch === "]" || ch === ")") depth--;
            else if (ch === "," && depth === 0) {
                args.push(current.trim());
                current = "";
                continue;
            }
        }

        current += ch;
    }

    if (current.trim() !== "") args.push(current.trim());

    // 🧠 Konwersja argumentów na odpowiednie typy
    const parsedArgs = args.map(arg => {
        if (/^-?\d+(\.\d+)?$/.test(arg)) return Number(arg); // liczba
        if (arg.startsWith("{") || arg.startsWith("[") || arg.startsWith('"') || arg.startsWith("'")) {
            try {
                // Spróbuj zamienić pojedyncze cudzysłowy na podwójne, by JSON.parse zadziałał
                const safeArg = arg
                    .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":') // klucze bez cudzysłowów
                    .replace(/'/g, '"'); // zamiana ' -> "
                return JSON.parse(safeArg);
            } catch {
                return arg;
            }
        }
        return arg;
    });

    return [functionName, ...parsedArgs];
}
const extractActivitiesSchedule = (schedule, timeSchedule) => {
    console.log()
    if (!Array.isArray(schedule)) return [];
    return schedule.map((day, dayIdx) =>
        Array.isArray(day)
            ? day.map((a, aIdx) => ({
                googleId: a?.googleId || null,
                nazwa: a?.nazwa || null,
                czasZwiedzania: a?.czasZwiedzania || null,
                godzinaRozpoczecia: timeSchedule?.[dayIdx]?.[aIdx] ? minutesToTime(timeSchedule?.[dayIdx]?.[aIdx]) : null
            }))
            : []
    );
};

const extractAttractions = (attractions) => {
    if (!Array.isArray(attractions)) return [];

    return attractions
        .filter(a => a && typeof a === "object")
        .sort((a, b) => (b.liczbaOpinie || 0) - (a.liczbaOpinie || 0)) // 🔹 sortowanie malejąco
        .slice(0, 50)
        .map(a => ({
            googleId: a?.googleId || null,
            nazwa: a?.nazwa || null
        }));
};
export const ChatBox2 = ({ tripId, userId, basicActivities, activitiesSchedule, attractions, miejsceDocelowe, addActivity, deleteActivity, swapActivities, changeActivity, timeSchedule }) => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    // Loading teraz oznacza: "User wysłał, czekamy na pojawienie się odpowiedzi AI w bazie"
    const [isWaitingForAi, setIsWaitingForAi] = useState(false);

    const messagesContainerRef = useRef(null);
    // Ref do trzymania flagi, żeby nie wykonywać komend podwójnie w trakcie trwania requestu
    const processingCommandsRef = useRef(new Set());

    // Przewijanie na dół przy nowych wiadomościach
    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTo({
                top: messagesContainerRef.current.scrollHeight,
                behavior: 'smooth',
            });
        }
    }, [messages.length, isWaitingForAi]);

    // --- GŁÓWNA PĘTLA POLLINGU (CO 1000ms) ---
    useEffect(() => {
        if (!tripId) return;

        const fetchMessages = async () => {
            try {
                const res = await axios.get(`${port}/api/chat/${tripId}`);
                const fetchedMsgs = res.data || [];

                // Aktualizacja UI
                setMessages(fetchedMsgs);

                // Sprawdzenie statusu oczekiwania
                const lastMsg = fetchedMsgs[fetchedMsgs.length - 1];
                if (lastMsg?.sender === 'ai') {
                    setIsWaitingForAi(false);
                }

                // --- WYKONYWANIE KOMEND ---
                // Szukamy wiadomości AI z komendami, które nie są executed
                // I których aktualnie nie przetwarzamy (zabezpieczenie lokalne)
                const pendingActionMsgs = fetchedMsgs.filter(m =>
                    m.sender === 'ai' &&
                    m.commands &&
                    m.commands.length > 0 &&
                    !m.executed &&
                    !processingCommandsRef.current.has(m._id) // m._id z Mongo
                );

                if (pendingActionMsgs.length > 0) {
                    for (const msg of pendingActionMsgs) {
                        // 1. Oznacz lokalnie jako przetwarzane (mutex)
                        processingCommandsRef.current.add(msg._id);

                        console.log("⚙️ Wykonuję komendy z wiadomości:", msg._id, msg.commands);

                        // 2. Wykonaj logikę na froncie
                        executeCommands(msg.commands);

                        // 3. Oznacz na serwerze jako wykonane
                        try {
                            await axios.post(`${port}/api/chat/mark-executed`, { messageId: msg._id });
                            // Po sukcesie, przy następnym pollingu ta wiadomość wróci jako executed: true
                        } catch (err) {
                            console.error("Błąd oznaczania executed:", err);
                            // W razie błędu sieciowego usuwamy z set, żeby spróbować ponownie przy następnym pollingu
                            processingCommandsRef.current.delete(msg._id);
                        }
                    }
                }

            } catch (err) {
                console.error("Chat polling error:", err);
            }
        };

        // Pierwsze pobranie
        fetchMessages();

        // Interwał
        const intervalId = setInterval(fetchMessages, 1000); // co 1 sekunda wystarczy

        return () => clearInterval(intervalId);
    }, [tripId, basicActivities, activitiesSchedule, attractions]); // Zależności potrzebne do executeCommands (chyba że są stabilne)


    // Funkcja wykonująca (taka sama jak wcześniej)
    const executeCommands = (commands) => {
        commands.forEach((cmd) => {
            let cmdTab = parseArguments(cmd);
            const action = cmdTab[0];

            if (action === "addActivity") {
                const dayIdx = cmdTab[1];
                const baseAttr = cmdTab[2];
                let foundAttr;
                if (baseAttr.googleId.includes("dAct_")) {
                    foundAttr = basicActivities.find(a => a.googleId === baseAttr.googleId);
                } else {
                    foundAttr = attractions.find(a => a.googleId === baseAttr.googleId);
                }

                let attrToAdd;
                if (foundAttr) {
                    attrToAdd = { ...foundAttr, czasZwiedzania: baseAttr?.czasZwiedzania ?? foundAttr.czasZwiedzania ?? 0 };
                } else {
                    attrToAdd = { ...baseAttr, lokalizacja: { lat: 52.2233, lng: 21.2233 }, cenaZwiedzania: baseAttr?.cenaZwiedzania ?? 0 };
                }
                addActivity(dayIdx, attrToAdd, true);
            }
            else if (action === "swapActivities") {
                swapActivities(cmdTab[1], cmdTab[2], cmdTab[3]);
            }
            else if (action === "changeActivity") {
                const baseAttr = cmdTab[3];
                let foundAttr;
                if (baseAttr.googleId.includes("dAct_")) {
                    foundAttr = basicActivities.find(a => a.googleId === baseAttr.googleId);
                } else {
                    foundAttr = attractions.find(a => a.googleId === baseAttr.googleId);
                }
                let attrToAdd = foundAttr ? { ...foundAttr, czasZwiedzania: baseAttr?.czasZwiedzania ?? foundAttr.czasZwiedzania } : { ...baseAttr, lokalizacja: { lat: 52, lng: 21 }, cenaZwiedzania: 0 };
                changeActivity(cmdTab[1], cmdTab[2], attrToAdd);
            }
            else if (action === "deleteActivity") {
                deleteActivity(cmdTab[1], cmdTab[2]);
            }
        });
    };

    const handleSendMessage = async (text) => {
        if (!text.trim()) return;

        const msgText = text.trim();
        setInputValue("");
        setIsWaitingForAi(true); // Włącz migający dymek (loading state)

        try {
            // Wysyłamy wiadomość i kontekst. Nie czekamy na odpowiedź AI (ona przyjdzie przez polling)
            await axios.post(`${port}/api/chat/message`, {
                tripId,
                message: msgText,
                userId,
                // Przesyłamy kontekst potrzebny AI do wygenerowania odpowiedzi w tle
                contextData: {
                    activitiesSchedule: extractActivitiesSchedule(activitiesSchedule, timeSchedule),
                    attractions: extractAttractions(attractions),
                    miejsceDocelowe,
                    basicActivities
                }
            });

            // Opcjonalnie: Możemy ręcznie dodać wiadomość usera do stanu od razu, żeby UI było responsywne,
            // zanim polling ją pobierze z bazy.
            setMessages(prev => [...prev, {
                _id: 'temp-' + Date.now(),
                sender: 'user',
                text: msgText,
                createdAt: new Date()
            }]);

        } catch (error) {
            console.error("Błąd wysyłania:", error);
            setIsWaitingForAi(false);
        }
    };

    // ... (reszta UI: suggestions, handleKeyPress itp.) ...

    return (
        <ChatBoxMainbox>
            {/* ... Header ... */}
            <div className="headerBox">
                <div className="iconWrapper">✨</div>
                <div className="headerText">
                    <div className="headerTitle">Asystent AI</div>
                    <div className="headerStatus">Online</div>
                </div>
            </div>

            <div className="messagesArea" ref={messagesContainerRef}>
                {messages.map((message) => (
                    <div key={message._id || message.id} className={`messageWrapper ${message.sender}`}>
                        <div className={`message ${message.sender}`}>
                            {wrapLongWords(message.text)}
                        </div>
                    </div>
                ))}

                {/* Migający dymek, gdy czekamy na AI */}
                {isWaitingForAi && (
                    <div className="messageWrapper ai">
                        <div className="message ai loading">
                            {/* Tu możesz dać swoje kropki ładowania */}
                            <div className="loadingDots">
                                <div className="dot"></div><div className="dot"></div><div className="dot"></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ... Input ... */}
            <div className="inputWrapper">
                <input
                    type="text"
                    className="sendMessageBox"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                    placeholder="Wpisz wiadomość..."
                />
                <button
                    className="sendButton"
                    onClick={() => handleSendMessage(inputValue)}
                    disabled={!inputValue.trim() || isWaitingForAi}
                >
                    {/* SVG Ikona */}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
            </div>

            {/* ... Suggestions ... */}
            <div className="suggestionsWrapper">
                <div className="suggestionsLabel">Sugerowane wiadomości:</div>
                <div className="suggestionsContainer">
                    {suggestedMessages.map((suggestion, index) => (
                        <button
                            key={index}
                            className="suggestionButton"
                            onClick={() => handleSendMessage(suggestion)}
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
            </div>
        </ChatBoxMainbox>
    );
};