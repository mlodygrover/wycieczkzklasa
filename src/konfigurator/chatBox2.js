import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const ChatBoxMainbox = styled.div`
    width: 250px;
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

export const ChatBox2 = ({ activitiesSchedule, attractions, miejsceDocelowe, addActivity, deleteActivity, swapActivities, changeActivity }) => {
    const [messages, setMessages] = useState([
        {
            id: '1',
            text: 'Cześć! Jestem twoim asystentem AI do planowania wycieczki szkolnej. Jak mogę ci pomóc?',
            sender: 'ai',
            timestamp: new Date(),
        },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);

    const messagesContainerRef = useRef(null);

    const scrollToBottom = () => {
        const container = messagesContainerRef.current;
        if (container) {
            container.scrollTo({
                top: container.scrollHeight,
                behavior: 'smooth',
            });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const handleSendMessage = async (text) => {
        if (!text.trim() || loading) return;

        const userMessage = {
            id: Date.now().toString(),
            text: text.trim(),
            sender: "user",
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue("");
        setLoading(true);

        try {
            // 🧠 Przygotowanie uproszczonych danych do wysyłki:
            const extractActivitiesSchedule = (schedule) => {
                console.log()
                if (!Array.isArray(schedule)) return [];
                return schedule.map((day) =>
                    Array.isArray(day)
                        ? day.map((a) => ({
                            googleId: a?.googleId || null,
                            nazwa: a?.nazwa || null,
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

            // 🧩 Zminimalizowany payload dla endpointu
            const payload = {
                message: text.trim(),
                history: messages.map((m) => ({
                    role: m.sender === "ai" ? "assistant" : "user",
                    content: m.text,
                })),
                activitiesSchedule: extractActivitiesSchedule(activitiesSchedule),
                attractions: extractAttractions(attractions),
                miejsceDocelowe,
            };

            const response = await axios.post("http://localhost:5006/chat-planner", payload);

            const aiMessage = {
                id: (Date.now() + 1).toString(),
                text: response.data?.reply || "Nie otrzymano odpowiedzi od asystenta.",
                sender: "ai",
                timestamp: new Date(),
            };
            console.log("ODP1", response.data)

            setMessages((prev) => [...prev, aiMessage]);

            // 🔧 Obsługa komend z backendu

            if (Array.isArray(response.data?.commands) && response.data.commands.length > 0) {
                console.log("🧩 Komendy do wykonania:", response.data.commands);

                // Przykładowa automatyczna obsługa (opcjonalna)
                response.data.commands.forEach((cmd) => {
                    let cmdTab = parseArguments(cmd);

                    if (cmdTab[0] === "addActivity") {
                        const dayIdx = cmdTab[1];
                        const baseAttr = cmdTab[2];

                        // Znajdź atrakcję w bazie po ID (jeśli istnieje)
                        const foundAttr = attractions.find(a => a.googleId === baseAttr.googleId);

                        let attrToAdd;

                        if (foundAttr) {
                            // Jeśli atrakcja istnieje w bazie – używamy jej danych
                            attrToAdd = {
                                ...foundAttr,
                                czasZwiedzania: baseAttr?.czasZwiedzania ?? foundAttr.czasZwiedzania ?? 0
                            };
                        } else {
                            // Jeśli AI wygenerowało nową atrakcję – tworzymy pełny obiekt
                            attrToAdd = {
                                ...baseAttr,
                                lokalizacja: { lat: 52.2233, lng: 21.2233 },
                                cenaZwiedzania: baseAttr?.cenaZwiedzania ?? 0
                            };
                        }

                        addActivity(dayIdx, attrToAdd);
                    }
                    else if (cmdTab[0] === "swapActivities") {
                        swapActivities(cmdTab[1], cmdTab[2], cmdTab[3])
                    }
                    else if (cmdTab[0] === "changeActivity") {
                        const baseAttr = cmdTab[3];

                        // Znajdź atrakcję w bazie po ID (jeśli istnieje)
                        const foundAttr = attractions.find(a => a.googleId === baseAttr.googleId);

                        let attrToAdd;

                        if (foundAttr) {
                            // Jeśli atrakcja istnieje w bazie – używamy jej danych
                            attrToAdd = {
                                ...foundAttr,
                                czasZwiedzania: baseAttr?.czasZwiedzania ?? foundAttr.czasZwiedzania ?? 0
                            };
                        } else {
                            // Jeśli AI wygenerowało nową atrakcję – tworzymy pełny obiekt
                            attrToAdd = {
                                ...baseAttr,
                                lokalizacja: { lat: 52.2233, lng: 21.2233 },
                                cenaZwiedzania: baseAttr?.cenaZwiedzania ?? 0
                            };
                        }
                        changeActivity(cmdTab[1], cmdTab[2], attrToAdd)
                    }
                    else if(cmdTab[0] === "deleteActivity") {
                        deleteActivity(cmdTab[1], cmdTab[2]);

                    }
                    /*
                    try {
                        // addActivity(1, { googleId: "...", nazwa: "...", czasZwiedzania: 60 })
                        if (cmd.startsWith("addActivity")) {
                            const args = cmd.match(/addActivity\((.*)\)/)[1];
                            const [dayIndexStr, activityStr] = args.split(",", 2);
                            const dayIndex = parseInt(dayIndexStr.trim());
                            const activity = JSON.parse(activityStr.trim());
                            addActivity(dayIndex, activity);
                        }

                        // deleteActivity(2, 1)
                        else if (cmd.startsWith("deleteActivity")) {
                            const args = cmd.match(/deleteActivity\((.*)\)/)[1];
                            const [dayIndexStr, actIdxStr] = args.split(",").map((v) => parseInt(v.trim()));
                            deleteActivity(dayIndexStr, actIdxStr);
                        }

                        // swapActivities(1, 0, 2)
                        else if (cmd.startsWith("swapActivities")) {
                            const args = cmd.match(/swapActivities\((.*)\)/)[1];
                            const [dayIdx, a, b] = args.split(",").map((v) => parseInt(v.trim()));
                            swapActivities(dayIdx, a, b);
                        }

                        // changeActivity(1, 2, {...})
                        else if (cmd.startsWith("changeActivity")) {
                            const args = cmd.match(/changeActivity\((.*)\)/)[1];
                            const [dayIdxStr, actIdxStr, activityStr] = args.split(",", 3);
                            const dayIdx = parseInt(dayIdxStr.trim());
                            const actIdx = parseInt(actIdxStr.trim());
                            const activity = JSON.parse(activityStr.trim());
                            changeActivity(dayIdx, actIdx, activity);
                        }
                    } catch (err) {
                        console.warn("⚠️ Nie udało się zinterpretować komendy:", cmd, err);
                    }*/
                });
            }
        } catch (error) {
            console.error("❌ Błąd czatu:", error);
            const errMessage = {
                id: (Date.now() + 1).toString(),
                text: "Przepraszam, nie udało się połączyć z serwerem. Spróbuj ponownie.",
                sender: "ai",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errMessage]);
        } finally {
            setLoading(false);
        }
    };


    const handleSuggestionClick = (suggestion) => {
        handleSendMessage(suggestion);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(inputValue);
        }
    };

    return (
        <ChatBoxMainbox>
            <div className="headerBox">
                <div className="iconWrapper">✨</div>
                <div className="headerText">
                    <div className="headerTitle">Asystent AI</div>
                    <div className="headerStatus">Online</div>
                </div>
            </div>

            <div className="messagesArea" ref={messagesContainerRef}>
                {messages.map((message) => (
                    <div key={message.id} className={`messageWrapper ${message.sender}`}>
                        <div className={`message ${message.sender}`}>
                            {wrapLongWords(message.text)}
                        </div>
                    </div>
                ))}

                {/* 🔹 Placeholder w trakcie ładowania */}
                {loading && (
                    <div className="messageWrapper ai">
                        <div className="message ai loading"></div>
                    </div>
                )}
            </div>


            <div className="inputWrapper">
                <input
                    type="text"
                    className="sendMessageBox"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Wpisz wiadomość..."
                />
                <button
                    className="sendButton"
                    onClick={() => handleSendMessage(inputValue)}
                    disabled={!inputValue.trim() || loading}
                >
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                </button>
            </div>

            <div className="suggestionsWrapper">
                <div className="suggestionsLabel">Sugerowane wiadomości:</div>
                <div className="suggestionsContainer">
                    {suggestedMessages.map((suggestion, index) => (
                        <button
                            key={index}
                            className="suggestionButton"
                            onClick={() => handleSuggestionClick(suggestion)}
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
            </div>
        </ChatBoxMainbox>
    );
};
