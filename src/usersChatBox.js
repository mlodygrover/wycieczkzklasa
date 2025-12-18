




import styled, { keyframes } from "styled-components";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Image, Landmark, Send } from "lucide-react";
import useUserStore, { initAuth } from "./usercontent";

const portacc = process.env.REACT_APP_API_SOURCE || "https://api.draftngo.com";

/* --- styled components: zostawiam jak u Ciebie (skrócone tu dla czytelności) --- */
// ... (Twoje style bez zmian)

const UsersChatboxMainbox = styled.div`
  width: 90%;
  max-width: 800px;
  min-height: 100px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  margin-bottom: 100px;
`;

const MessageWrapper = styled.div`
  margin-top: 10px;
  padding-right: 30px;
  box-sizing: border-box;
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  &.own {
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
    padding: 5px;
    border-radius: 999px;
    background-color: black;
    color: white;
    width: 20px;
    height: 20px;
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
`;

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
/* helpers */
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
        dateTime: nowIso,                 // zgodnie z Twoim formatem field-name
        userPic: user?.profilePic ?? null,
        username: user?.username ?? (user?.email ? user.email.split("@")[0] : "Ty"),
        __optimistic: true,
        __clientId: `c_${Date.now()}_${Math.random().toString(16).slice(2)}`
    };
}



export const UsersChatbox = ({ tripId }) => {
    // ✅ bierzemy usera + informację czy init został wykonany

    // ✅ pobieraj pola osobno (stabilniej niż zwracanie obiektu)
    const user = useUserStore((s) => s.user);
    const hydrated = useUserStore((s) => s.hydrated);

    const initStartedRef = useRef(false);

    useEffect(() => {
        // ✅ gwarancja: initAuth tylko raz, nawet jeśli store aktualizuje się wielokrotnie w trakcie fetchMe()
        if (!hydrated && !initStartedRef.current) {
            initStartedRef.current = true;
            initAuth().catch(() => null);
        }
    }, [hydrated]);

    const loggedUserId = user?._id ? String(user._id) : null;

    const [text, setText] = useState("");
    const [items, setItems] = useState([]);
    const [sending, setSending] = useState(false);

    const acRef = useRef(null);
    const pollTimerRef = useRef(null);
    const lastTypingSentAtRef = useRef(0);

    const canSend = useMemo(() => {
        return !!tripId && !!loggedUserId && !sending && String(text).trim().length > 0;
    }, [tripId, loggedUserId, sending, text]);

    const fetchSync = useCallback(
        async ({ typing = false } = {}) => {
            if (!tripId || !loggedUserId) return;

            // abort poprzedniego requestu (żeby nie piętrzyć)
            if (acRef.current) acRef.current.abort();
            const ac = new AbortController();
            acRef.current = ac;

            const qs = new URLSearchParams();
            if (typing) qs.set("typing", "true");

            const url = `${portacc}/api/trip-plans/${encodeURIComponent(
                tripId
            )}/messages/sync?${qs.toString()}`;

            const resp = await fetch(url, {
                method: "GET",
                credentials: "include",
                headers: { Accept: "application/json" },
                signal: ac.signal,
            });

            if (!resp.ok) return;

            const json = await resp.json().catch(() => null);
            const next = coerceItems(json);
            setItems(next);
        },
        [tripId, loggedUserId]
    );

    // ✅ polling uruchamiamy dopiero gdy user jest znany
    useEffect(() => {
        if (!tripId || !loggedUserId) return;

        fetchSync({ typing: false }).catch(() => null);

        pollTimerRef.current = setInterval(() => {
            fetchSync({ typing: false }).catch(() => null);
        }, 500);

        return () => {
            if (pollTimerRef.current) clearInterval(pollTimerRef.current);
            pollTimerRef.current = null;

            if (acRef.current) acRef.current.abort();
            acRef.current = null;
        };
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

        // ✅ optimistic: dodaj od razu do listy
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
                    body: JSON.stringify({ content }),
                }
            );

            if (!resp.ok) {
                const t = await resp.text().catch(() => "");
                throw new Error(t || `HTTP ${resp.status}`);
            }

            // ✅ po sukcesie: odśwież z serwera (zastąpi optimistic prawdziwą wiadomością)
            await fetchSync({ typing: false });
        } catch (e) {
            console.error("Send message error:", e);

            // ❌ jeśli błąd: usuń optimistic z listy (żeby nie została „fejkowa”)
            setItems((prev) => prev.filter((m) => m.__clientId !== optimistic.__clientId));

            // opcjonalnie: przywróć tekst do inputa
            setText(content);
        } finally {
            setSending(false);
        }
    }, [canSend, text, tripId, fetchSync, user]);

    const onKeyDown = useCallback(
        (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
            }
        },
        [handleSend]
    );

    return (
        <UsersChatboxMainbox>
            {items.map((message, idx) => {
                const msgUserId = normId(message.userId);
                const isOwn = loggedUserId && msgUserId && msgUserId === loggedUserId;

                const avatar = message.userPic ? (
                    <img className="profileImg" src={message.userPic} alt="" />
                ) : (
                    initialsFromName(message.username)
                );

                if (isOwn) {
                    return (
                        <React.Fragment key={message.__clientId || `${msgUserId || "x"}_${message.dateTime || idx}`}>

                            <MessageWrapper className="own">
                                <MessageRow className="own">
                                    {message.username}
                                    <MessageBox className="own">{message.content}</MessageBox>
                                </MessageRow>
                                <div className="profilePic">{avatar}</div>
                            </MessageWrapper>
                        </React.Fragment>
                    );
                }

                if (message.role === "pending") {
                    return (
                        <React.Fragment key={message.__clientId || `${msgUserId || "x"}_${message.dateTime || idx}`}>

                            <MessageWrapper>
                                <div className="profilePic">{avatar}</div>
                                <MessageRow>
                                    {message.username}
                                    <MessageBox>
                                        <TypingContainer>
                                            <TypingDot />
                                            <TypingDot />
                                            <TypingDot />
                                        </TypingContainer>
                                    </MessageBox>
                                </MessageRow>
                            </MessageWrapper>
                        </React.Fragment>
                    );
                }

                return (
                    <React.Fragment key={message.__clientId || `${msgUserId || "x"}_${message.dateTime || idx}`}>

                        <MessageWrapper>
                            <div className="profilePic">{avatar}</div>
                            <MessageRow>
                                {message.username}
                                <MessageBox>{message.content}</MessageBox>
                            </MessageRow>
                        </MessageWrapper>
                    </React.Fragment>
                );
            })}

            <InputWrapper>
                <StyledTextArea
                    placeholder={loggedUserId ? "Napisz wiadomość..." : "Zaloguj się, aby pisać na czacie"}
                    rows={2}
                    value={text}
                    disabled={!loggedUserId}
                    onChange={(e) => {
                        setText(e.target.value);
                        if (e.target.value.trim().length > 0) {
                            maybeSendTyping();
                        }
                    }}
                    onKeyDown={onKeyDown}
                />

                <InputToolbar>
                    <ToolsGroup>
                        <IconButton type="button" title="Dodaj zdjęcie" disabled={!loggedUserId}>
                            <Landmark size={16} />
                        </IconButton>

                        <IconButton type="button" title="Udostępnij lokalizację" disabled={!loggedUserId}>
                            <Image size={16} />
                        </IconButton>
                    </ToolsGroup>

                    <IconButton
                        type="button"
                        className="send-btn"
                        title="Wyślij"
                        onClick={handleSend}
                        disabled={!canSend}
                    >
                        <Send size={16} />
                    </IconButton>
                </InputToolbar>
            </InputWrapper>
        </UsersChatboxMainbox>
    );
};
