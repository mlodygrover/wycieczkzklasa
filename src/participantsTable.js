import styled from "styled-components"
import React, { useEffect } from "react"
import { Crown, Trash2, UserCog } from "lucide-react"
import useUserStore, { fetchMe } from "./usercontent"

const ParticipantsTableMainbox = styled.div`
    width: 90%;
    max-width: 1600px;
    margin-bottom: 50px;
    background: white;
    border-radius: 12px;
    border: 1px solid #e5e5e5;
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
`

const StyledTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    font-family: 'Inter', sans-serif;
    table-layout: fixed;
`

const TableRow = styled.tr`
    border-bottom: 1px solid #f0f0f0;
    transition: background-color 0.2s ease;

    &:hover {
        background-color: #fafafa;
    }

    &:last-child {
        border-bottom: none;
    }

    &.rowHeader {
        background-color: #f9f9f9;
        border-bottom: 1px solid #e5e5e5;
        &:hover {
            background-color: #f9f9f9;
            box-shadow: none;
        }
    }

    &.loggedUser {
        background-color: #f5f7ff; /* Jasny indygo */
        box-shadow: inset 3px 0 0 #4f46e5; 
        
        &:hover {
            background-color: #eef2ff;
        }
    }
`

const HeaderCell = styled.th`
    text-align: left;
    padding: 16px 20px;
    box-sizing: border-box;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #6b7280;

    &.mailCell { width: 30%; }
    &.actionCell { width: 100px; text-align: right; }
    &.headerMobile { display: none; }

    @media screen and (max-width: 800px) {
        padding: 12px 10px;
        &.mailCell { width: 15%; max-width: 15%; }
        &.headerFull { display: none; }
        &.headerMobile { display: table-cell; }
        &.actionCell { width: 80px; } /* Zmniejszone dla mobile */
    }
`

const TableCell = styled.td`
    text-align: left;
    padding: 16px 20px;
    box-sizing: border-box;
    vertical-align: middle;
    overflow: hidden;
    font-size: 14px;
    color: #1f2937;

    @media screen and (max-width: 800px) {
        padding: 12px 10px;
        font-size: 13px;
    }

    &.mailCell {
        width: 30%;
        max-width: 0;
        @media screen and (max-width: 800px) { width: 15%; max-width: 15%; }
    }

    &.actionCell {
        text-align: right;
        overflow: visible;
    }

    .mail {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: #6b7280;
    }

    .nameContainer {
        display: flex;
        align-items: center;
        gap: 6px;
        font-weight: 500;
    }

    .youBadge {
        font-size: 10px;
        font-weight: 700;
        color: #4f46e5;
        background-color: #eef2ff;
        padding: 2px 6px;
        border-radius: 4px;
        text-transform: uppercase;
    }

    .crownSpan {
        color: #d97706; /* Złoty kolor */
        display: flex;
        align-items: center;
    }
`

const PaymentStatus = styled.span`
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    white-space: nowrap;

    &.done {
        color: #166534; background: #dcfce7; border: 1px solid #bbf7d0;
    }
    &.part {
        color: #854d0e; background: #fef9c3; border: 1px solid #fde047;
    }
    &.none {
        color: #4b5563; background: #f3f4f6; border: 1px solid #e5e7eb;
    }
`

// --- Style Przycisków Akcji (Zaktualizowane) ---

const ActionContainer = styled.div`
    display: flex;
    justify-content: flex-end;
    align-items: center; /* Wyśrodkowanie w pionie */
    gap: 8px; /* Większy odstęp dla lepszej estetyki */
    height: 100%;
`

const IconButton = styled.button`
    /* Stała widoczność */
    opacity: 1;
    transform: none;
    
    cursor: pointer;
    width: 32px; /* Nieco większe */
    height: 32px;
    border-radius: 8px; /* Bardziej zaokrąglone */
    display: flex;
    align-items: center;
    justify-content: center;
    
    /* Estetyczny, jasny styl domyślny */
    background-color: #f9fafb;
    border: 1px solid #e5e7eb;
    color: #6b7280; /* Ciemniejszy szary dla lepszego kontrastu */
    
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);

    &:hover {
        /* Indygo przy hoverze dla UserCog */
        color: #4f46e5;
        background-color: #eef2ff;
        border-color: #c7d2fe;
        box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.06);
    }
    
    &:active {
        transform: scale(0.97); /* Delikatny efekt kliknięcia */
    }

    &.danger:hover {
        /* Czerwony przy usuwaniu */
        color: #dc2626;
        background-color: #fef2f2;
        border-color: #fecaca;
    }
    
    /* Mniejsze na mobile */
    @media screen and (max-width: 800px) {
        width: 20px;
        height: 20px;
        border-radius: 6px;
        svg{
            width: 1px;
        }
    }
`

export const ParticipantsTable = ({ users = [], authors = [] }) => {
    const userFromStore = useUserStore((state) => state.user);

    useEffect(() => {
        if (!userFromStore?._id) {
            (async () => {
                try {
                    await fetchMe().catch(() => null);
                } catch { /* ignore */ }
            })();
        }
    }, [userFromStore?._id]);

    const loggedUserId = userFromStore?._id ? String(userFromStore._id) : null;

    return (
        <ParticipantsTableMainbox>
            <StyledTable>
                <thead>
                    <TableRow className="rowHeader">
                        <HeaderCell className="headerFull">Uczestnik</HeaderCell>
                        <HeaderCell className="mailCell headerFull">Adres email</HeaderCell>
                        <HeaderCell className="headerFull">Status płatności</HeaderCell>
                        <HeaderCell className="actionCell headerFull"></HeaderCell>
                        
                        <HeaderCell className="headerMobile">Osoba</HeaderCell>
                        <HeaderCell className="mailCell headerMobile">Email</HeaderCell>
                        <HeaderCell className="headerMobile">Status</HeaderCell>
                        <HeaderCell className="actionCell headerMobile"></HeaderCell>
                    </TableRow>
                </thead>
                <tbody>
                    {Array.isArray(users) && users.length > 0 ? (
                        users.map((user, idx) => {
                            const userId = String(user.userId);
                            const isLogged = loggedUserId && loggedUserId === userId;
                            const isAuthor = authors.includes(userId);

                            return (
                                <TableRow key={userId || idx} className={isLogged ? "loggedUser" : ""}>
                                    <TableCell>
                                        <div className="nameContainer">
                                            {user.username}
                                            {isAuthor && (
                                                <span className="crownSpan" title="Organizator">
                                                    <Crown size={14} fill="currentColor" strokeWidth={1.5} />
                                                </span>
                                            )}
                                            {isLogged && <span className="youBadge">Ty</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell className="mailCell">
                                        <span className="mail" title={user.email}>
                                            {user.email}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <PaymentStatus className="paymentStatus none">
                                            Nieopłacone
                                        </PaymentStatus>
                                    </TableCell>
                                    
                                    {/* --- Akcje (zawsze widoczne) --- */}
                                    <TableCell className="actionCell">
                                        {!isLogged && (
                                            <ActionContainer>
                                                {!isAuthor && (
                                                    <IconButton title="Mianuj organizatorem">
                                                        <UserCog size={16} />
                                                    </IconButton>
                                                )}
                                                <IconButton className="danger" title="Usuń uczestnika">
                                                    <Trash2 size={16} />
                                                </IconButton>
                                            </ActionContainer>
                                        )}
                                    </TableCell>

                                </TableRow>
                            );
                        })
                    ) : (
                        <TableRow>
                            <TableCell colSpan="4" style={{ textAlign: "center", color: "#888", padding: "30px" }}>
                                Brak uczestników
                            </TableCell>
                        </TableRow>
                    )}
                </tbody>
            </StyledTable>
        </ParticipantsTableMainbox>
    )
}