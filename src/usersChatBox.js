import styled, { keyframes, css } from "styled-components";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Image, Landmark, MessageCircleIcon, Send } from "lucide-react";
import useUserStore, { initAuth } from "./usercontent";
import Loader from "./roots/loader";

const portacc = process.env.REACT_APP_API_SOURCE || "https://api.draftngo.com";

/* --- STYLES --- */

const UsersChatboxMainboxWrapper = styled.div`
    width: 90%;
    max-width: 1600px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
`

const UsersChatboxMainbox = styled.div`
  width: 90%;
  max-width: 800px;
  min-height: 200px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  margin-bottom: 100px;
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(10px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`

const MessageWrapper = styled.div`
    margin-top: 10px;
    padding-right: 30px;
    box-sizing: border-box;
    display: flex;
    align-items: flex-end;
    justify-content: flex-start;
    
    /* LOGIKA ANIMACJI: 
       Używamy propsa transient ($shouldAnimate), aby nie przekazywać go do DOM.
       Jeśli true -> animujemy. Jeśli false -> brak animacji (dla starych wiadomości).
    */
    ${({ $shouldAnimate }) => $shouldAnimate && css`
        animation: ${fadeInUp} 0.3s ease-out forwards;
    `}
    
    /* Domyślnie element jest widoczny, chyba że ma animację, wtedy startuje z opacity 0 (w keyframes) */
    
    &.own{
        padding-right: 0;
        padding-left: 30px;
        justify-content: flex-end;
    }
    gap: 5px;

    .profilePic {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        border-radius: 999px;
        background-color: black;
        color: white;
        width: 25px;
        height: 25px;
        flex-shrink: 0;
        overflow: hidden;
    }

    .profileImg {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 999px;
        display: block;
    }
`

const MessageBox = styled.div`
  width: fit-content;
  background-color: #f0f0f0;
  box-shadow: none;
  padding: 10px 15px;
  border-radius: 18px;
  max-width: 300px;
  font-family: "Inter";
  font-weight: 500;
  color: #404040;
  font-size: 16px;
  text-align: left;
  border-bottom-left-radius: 5px;

  &.own {
    border-bottom-left-radius: 18px;
    background-color: white;
    box-shadow: 0 0 10px #e0e0e0;
    border-bottom-right-radius: 5px;
  }
`;

const MessageRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  font-size: 12px;
  gap: 2px;
  color: #606060;
  font-weight: 600;

  &.own {
    align-items: flex-end;
  }
`;

const InputWrapper = styled.div`
  background-color: #f6f6f6;
  border-radius: 20px;
  margin-top: 20px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border: 1px solid transparent;
  transition: all 0.3s ease;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.02);

  &:focus-within {
    background-color: white;
    border-color: #e0e0e0;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  }
`;

const StyledTextArea = styled.textarea`
  width: 100%;
  border: none;
  background: transparent;
  outline: none;
  resize: none;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  color: #404040;
  min-height: 40px;

  &::placeholder {
    color: #a0a0a0;
    font-weight: 400;
  }
`;

const InputToolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid rgba(201, 201, 201, 1);
  padding-top: 10px;
`;

const ToolsGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  background-color: white;
  color: #888;
  transition: all 0.2s;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);

  &:hover {
    background-color: #f0f0f0;
    color: #404040;
    transform: translateY(-2px);
  }

  &.send-btn {
    background-color: #000;
    color: white;
    margin-left: auto;

    &:hover {
      background-color: #333;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  svg {
    width: 18px;
    height: 18px;
    stroke-width: 2;
  }
`;

const blinkAnimation = keyframes`
  0% { opacity: .2; transform: scale(0.8); }
  20% { opacity: 1; transform: scale(1); }
  100% { opacity: .2; transform: scale(0.8); }
`;

const TypingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 5px 0;
`;

const TypingDot = styled.div`
  width: 6px;
  height: 6px;
  background-color: #808080;
  border-radius: 50%;
  animation: ${blinkAnimation} 1.4s infinite both;

  &:nth-child(1) { animation-delay: 0s; }
  &:nth-child(2) { animation-delay: 0.2s; }
  &:nth-child(3) { animation-delay: 0.4s; }
`;

const UsersChatboxTitle = styled.div`
    font-family: 'Inter';
    width: 100%;
    text-align: left;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    .tripTitle{
        font-size: 22px;
        font-weight: 700;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        gap: 5px;

    }
    .tripSubtitle{
        font-size: 12px;
        color: #606060;
        font-weight: 600;
    }
    border-bottom: 1px solid lightgray;
    padding-bottom: 5px;
`

/* --- HELPERS --- */

function initialsFromName(name = "") {
    const s = String(name || "").trim();
    if (!s) return "U";
    const parts = s.split(/\s+/).filter(Boolean);
    const a = parts[0]?.[0] || "U";
    const b = parts[1]?.[0] || "";
    return (a + b).toUpperCase();
}

function normId(v) {
    return v == null ? null : String(v);
}

function coerceItems(json) {
    const items = Array.isArray(json?.items) ? json.items : [];
    return items.map((m) => ({
        role: m?.role === "pending" ? "pending" : "user",
        _id: normId(m?._id), // Zachowujemy oryginalne ID z bazy
        userId: normId(m?.userId),
        content: typeof m?.content === "string" ? m.content : "",
        dateTime: m?.dateTime ?? null,
        userPic: m?.userPic ?? null,
        username: m?.username ?? "Użytkownik",
    }));
}

function makeOptimisticMessage({ user, content }) {
    const nowIso = new Date().toISOString();
    return {
        role: "user",
        userId: user?._id ? String(user._id) : null,
        content: String(content || ""),
        dateTime: nowIso,
        userPic: user?.profilePic ?? null,
        username: user?.username ?? (user?.email ? user.email.split("@")[0] : "Ty"),
        __optimistic: true,
        __clientId: `c_${Date.now()}_${Math.random().toString(16).slice(2)}`,
        __forceAnimate: true // Flaga: to jest nowa wiadomość od nas, na pewno animuj
    };
}

/**
 * Logika łączenia wiadomości:
 * 1. Wykrywa duplikaty (Optimistic vs Server) i łączy je zachowując ClientID (żeby React nie przebudował DOM).
 * 2. Zarządza flagą __noAnimate. Jeśli wiadomość była już w `prev`, dziedziczy jej stan animacji.
 * 3. Jeśli to `firstLoad`, wszystkie nowe wiadomości dostają __noAnimate = true.
 */
function mergeServerWithOptimistic(prev, server, isFirstLoad) {
    const prevItems = Array.isArray(prev) ? prev : [];
    const serverItems = Array.isArray(server) ? server : [];

    // Mapa istniejących wiadomości dla szybkiego dostępu: klucz -> item
    // Używamy unikalnych identyfikatorów
    const prevMap = new Map();
    prevItems.forEach(item => {
        // Kluczem może być clientId (jeśli optimistic) lub _id (jeśli z serwera)
        if (item.__clientId) prevMap.set(item.__clientId, item);
        if (item._id) prevMap.set(item._id, item);

        // Dodatkowo dla wiadomości "pending" używamy klucza opartego na userId
        if (item.role === 'pending' && item.userId) {
            prevMap.set(`pending_${item.userId}`, item);
        }
    });

    const consumedOptimisticIds = new Set();

    const merged = serverItems.map((serverItem) => {
        // Generujemy potencjalne klucze do szukania w poprzednim stanie
        let match = null;

        // 1. Próba znalezienia po _id (jeśli już mieliśmy to z serwera)
        if (serverItem._id && prevMap.has(serverItem._id)) {
            match = prevMap.get(serverItem._id);
        }
        // 2. Jeśli to pending, szukamy po userId (żeby nie skakało przy poll-ingu)
        else if (serverItem.role === 'pending' && serverItem.userId && prevMap.has(`pending_${serverItem.userId}`)) {
            match = prevMap.get(`pending_${serverItem.userId}`);
        }
        // 3. Heurystyka dla Optimistic Messages (szukamy pasującej treści/usera/czasu)
        else if (!match) {
            const sTime = serverItem.dateTime ? new Date(serverItem.dateTime).getTime() : 0;
            const possibleOptimistic = prevItems.find(p =>
                p.__optimistic &&
                !consumedOptimisticIds.has(p.__clientId) &&
                String(p.userId) === String(serverItem.userId) &&
                String(p.content) === String(serverItem.content) &&
                Math.abs((p.dateTime ? new Date(p.dateTime).getTime() : 0) - sTime) < 10000
            );

            if (possibleOptimistic) {
                match = possibleOptimistic;
                consumedOptimisticIds.add(match.__clientId);
            }
        }

        // --- BUDOWANIE OBIEKTU WYNIKOWEGO ---

        // Czy animować?
        // Jeśli to firstLoad -> NIE animuj niczego z serwera.
        // Jeśli znaleźliśmy match -> bierzemy stan z match (czyli pewnie już po animacji lub bez).
        // Jeśli to nowa wiadomość i nie firstLoad -> animuj (domyślnie false w styled component, więc musimy to obsłużyć w renderze).

        let finalItem = { ...serverItem };

        if (match) {
            // Zachowujemy clientId, żeby React wiedział że to ten sam element (BRAK RE-RENDERU = BRAK PODWÓJNEJ ANIMACJI)
            if (match.__clientId) finalItem.__clientId = match.__clientId;

            // Zachowujemy flagę o wyłączonej animacji, jeśli stara wiadomość ją miała
            if (match.__noAnimate) finalItem.__noAnimate = true;

            // Jeśli stara wiadomość była optimistic, a teraz mamy z serwera, to już nie jest optimistic
            // ale klucz zostaje.
        } else {
            // Nowa wiadomość, której nie było lokalnie.
            if (isFirstLoad) {
                finalItem.__noAnimate = true; // Pierwszy wjazd - nie animuj, pokaż od razu
            }
        }

        return finalItem;
    });

    // Dodajemy te wiadomości optimistic, które nie znalazły pary na serwerze (jeszcze się wysyłają)
    const remainingOptimistic = prevItems.filter(p => p.__optimistic && !consumedOptimisticIds.has(p.__clientId));

    return [...merged, ...remainingOptimistic];
}

/* --- COMPONENT --- */

export const UsersChatbox = ({ tripId, nazwaWyjazdu = "Twój wyjazd", liczbaUczestnikow=1 }) => {
    const user = useUserStore((s) => s.user);
    const hydrated = useUserStore((s) => s.hydrated);
    const initStartedRef = useRef(false);

    useEffect(() => {
        if (!hydrated && !initStartedRef.current) {
            initStartedRef.current = true;
            initAuth().catch(() => null);
        }
    }, [hydrated]);

    const loggedUserId = user?._id ? String(user._id) : null;

    const [text, setText] = useState("");
    const [items, setItems] = useState([]);
    const [sending, setSending] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(true);

    // ✅ Ref do śledzenia czy to pierwsze ładowanie (żeby nie animować historii)
    const isFirstLoadRef = useRef(true);

    const acRef = useRef(null);
    const lastTypingSentAtRef = useRef(0);
    const inFlightRef = useRef(false);
    const pollStopRef = useRef(false);

    const canSend = useMemo(() => {
        return !!tripId && !!loggedUserId && !sending && String(text).trim().length > 0;
    }, [tripId, loggedUserId, sending, text]);

    const fetchSync = useCallback(async ({ typing = false } = {}) => {
        if (!tripId || !loggedUserId) return;
        if (inFlightRef.current) return;

        inFlightRef.current = true;

        try {
            const qs = new URLSearchParams();
            if (typing) qs.set("typing", "true");

            const url = `${portacc}/api/trip-plans/${encodeURIComponent(tripId)}/messages/sync?${qs}`;

            const resp = await fetch(url, {
                method: "GET",
                credentials: "include",
                headers: { Accept: "application/json" },
            });

            if (!resp.ok) return;

            const json = await resp.json().catch(() => null);
            const next = coerceItems(json);

            setItems((prev) => {
                // Przekazujemy true/false czy to pierwszy load
                const merged = mergeServerWithOptimistic(prev, next, isFirstLoadRef.current);
                return merged;
            });

            // Po pierwszym udanym pobraniu, wyłączamy flagę "first load"
            if (isFirstLoadRef.current) {
                isFirstLoadRef.current = false;
                setLoadingMessages(false);
            }

        } catch (e) {
            console.warn("sync error:", e);
        } finally {
            inFlightRef.current = false;
        }
    }, [tripId, loggedUserId]);

    // Polling loop
    useEffect(() => {
        if (!tripId || !loggedUserId) return;
        pollStopRef.current = false;
        isFirstLoadRef.current = true; // Reset przy zmianie roomu/usera

        const loop = async () => {
            if (pollStopRef.current) return;
            await fetchSync({ typing: false });
            if (pollStopRef.current) return;
            setTimeout(loop, 500);
        };

        loop();
        return () => { pollStopRef.current = true; };
    }, [tripId, loggedUserId, fetchSync]);


    const maybeSendTyping = useCallback(() => {
        if (!tripId || !loggedUserId) return;
        const now = Date.now();
        if (now - lastTypingSentAtRef.current < 400) return;
        lastTypingSentAtRef.current = now;
        fetchSync({ typing: true }).catch(() => null);
    }, [tripId, loggedUserId, fetchSync]);

    const handleSend = useCallback(async () => {
        if (!canSend) return;
        const content = String(text).trim();

        // Dodajemy wiadomość optimistic - ona MA flagę __forceAnimate
        const optimistic = makeOptimisticMessage({ user, content });
        setItems((prev) => [...prev, optimistic]);

        setText("");
        setSending(true);

        try {
            const resp = await fetch(
                `${portacc}/api/trip-plans/${encodeURIComponent(tripId)}/messages`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json", Accept: "application/json" },
                    body: JSON.stringify({ content, clientId: optimistic.__clientId }),
                }
            );

            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

            // Sync po wysłaniu (potwierdzenie z serwera)
            setTimeout(() => fetchSync({ typing: false }).catch(() => null), 250);
        } catch (e) {
            console.error("Send message error:", e);
            setItems((prev) => prev.filter((m) => m.__clientId !== optimistic.__clientId));
            setText(content);
        } finally {
            setSending(false);
        }
    }, [canSend, text, tripId, fetchSync, user]);

    const onKeyDown = useCallback((e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }, [handleSend]);

    return (
        <UsersChatboxMainboxWrapper>
            <UsersChatboxTitle>
                <div className="tripTitle">
                    Wyjazd do Poznania<MessageCircleIcon size={20} />
                </div>
                <div className="tripSubtitle">
                    3 uczestników, 29.11 - 02.12
                </div>
            </UsersChatboxTitle>

            {loadingMessages ? <Loader /> : ""}

            <UsersChatboxMainbox>
                {items.map((message, idx) => {
                    const msgUserId = normId(message.userId);
                    const isOwn = loggedUserId && msgUserId && msgUserId === loggedUserId;

                    // --- STABILNY KLUCZ (CRUCIAL) ---
                    // 1. Jeśli wiadomość ma clientId (optimistic lub zmatchowana) -> użyj go.
                    // 2. Jeśli to pending -> użyj stałego klucza per user.
                    // 3. W ostateczności _id z bazy.
                    let uniqueKey = message._id || `${msgUserId}_${idx}`;
                    if (message.__clientId) uniqueKey = message.__clientId;
                    if (message.role === 'pending') uniqueKey = `pending_${msgUserId}`;

                    // --- DECYZJA O ANIMACJI ---
                    // Animujemy TYLKO jeśli NIE ma flagi __noAnimate.
                    // Wiadomości ładowane na starcie mają __noAnimate = true.
                    // Nowe wiadomości (z serwera podczas pollowania lub optimistic) nie mają tej flagi -> animują się.
                    const shouldAnimate = !message.__noAnimate;

                    const avatar = message.userPic ? (
                        <img className="profileImg" src={message.userPic} alt="" />
                    ) : (
                        initialsFromName(message.username)
                    );

                    // Renderowanie
                    const content = (
                        <React.Fragment key={uniqueKey}>
                            <MessageWrapper
                                className={isOwn ? "own" : ""}
                                $shouldAnimate={shouldAnimate} // Przekazujemy transient prop
                            >
                                {!isOwn && <div className="profilePic">{avatar}</div>}

                                <MessageRow className={isOwn ? "own" : ""}>
                                    {message.username}
                                    <MessageBox className={isOwn ? "own" : ""}>
                                        {message.role === 'pending' ? (
                                            <TypingContainer>
                                                <TypingDot /><TypingDot /><TypingDot />
                                            </TypingContainer>
                                        ) : (
                                            message.content
                                        )}
                                    </MessageBox>
                                </MessageRow>

                                {isOwn && <div className="profilePic">{avatar}</div>}
                            </MessageWrapper>
                        </React.Fragment>
                    );

                    return content;
                })}

                <InputWrapper>
                    <StyledTextArea
                        placeholder={loggedUserId ? "Napisz wiadomość..." : "Zaloguj się, aby pisać na czacie"}
                        rows={2}
                        value={text}
                        disabled={!loggedUserId}
                        onChange={(e) => {
                            setText(e.target.value);
                            if (e.target.value.trim().length > 0) maybeSendTyping();
                        }}
                        onKeyDown={onKeyDown}
                    />
                    <InputToolbar>
                        <ToolsGroup>
                            <IconButton type="button" disabled={!loggedUserId}><Landmark size={16} /></IconButton>
                            <IconButton type="button" disabled={!loggedUserId}><Image size={16} /></IconButton>
                        </ToolsGroup>
                        <IconButton type="button" className="send-btn" onClick={handleSend} disabled={!canSend}>
                            <Send size={16} />
                        </IconButton>
                    </InputToolbar>
                </InputWrapper>
            </UsersChatboxMainbox>
        </UsersChatboxMainboxWrapper>
    );
};