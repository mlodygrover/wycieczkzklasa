import styled from "styled-components"
import React, { useEffect, useState } from "react"
import { Crown, Mail, Minus } from "lucide-react"
import useUserStore, { fetchMe } from "./usercontent"

const ParticipantsTableMainbox = styled.div`
    width: 90%;
    max-width: 1600px;
    min-height: 300px;
`

const StyledTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    font-family: 'Inter';
    font-weight: 500;
    table-layout: fixed; /* pozwala kontrolować szerokości kolumn */

    @media screen and (max-width: 800px) {
        font-size: 12px;
    }
`

const TableRow = styled.tr`
    border-bottom: 1px solid #d0d0d0;
    transition: 0.3s ease-in-out;

    &:hover {
        box-shadow: 0px 0px 4px #d8d8d8ff;
        border-radius: 5px;
    }

    &.rowHeader {
        border-bottom: none;
        color: #a0a0a0;

        &:hover {
            box-shadow: none;
            border-radius: 0;
        }
    }
    &.loggedUser{
        background-color: #f8f9ff;
        border-left: 3px solid #4f46e5;
    }
`

const HeaderCell = styled.th`
    text-align: left;
    padding: 5px 2px;
    box-sizing: border-box;
    font-weight: 500;

    &.mailCell {
        /* bazowa szerokość kolumny mailowej */
        width: 30%;
    }
    &.headerMobile{
        display: none;
    }
    @media screen and (max-width: 800px) {
        &.mailCell {
            width: 15%;
            max-width: 15%;
        }
        &.headerFull{
            display: none;
        }
        &.headerMobile{
            display: table-cell;
        }
    }
`

const TableCell = styled.td`
    text-align: left;
    padding: 5px 3px;
    box-sizing: border-box;
    vertical-align: middle;
    overflow: hidden;

    &.buttons {
        text-align: right;
    }

    &.mailCell {
        /* pozwala kolumnie się zwężać */
        width: 30%;
        max-width: 0; /* ważne przy table-layout: fixed */

        @media screen and (max-width: 800px) {
            width: 15%;
            max-width: 15%;
        }
    }

    .mail {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .youSpan{
        font-size: 12px;
        color: #4f46e5;
    }
    .crownSpan{
        color: #4f46e5;
    }
`

const PaymentStatus = styled.span`
    padding: 5px 10px;
    border-radius: 5px;
    display: inline-block;
    &.done{
        color: #1aa04bff;
        background: #f0fdf4;
    }
    &.part{

        color: #9ea01aff;
        background: #fdfdf0ff;
    }
    &.none{

        color: #abababff;
        background: #ffffffff;
    }
    
`
const ActionButton = styled.div`
    background-color: black;
    color: white;
    font-weight: 500;
    padding: 5px 10px;
    box-sizing: border-box;
    border-radius: 5px;

    display: inline-flex;        /* zamiast inline-block */
    align-items: center;         /* wycentrowanie w pionie */
    justify-content: center;     /* wycentrowanie w poziomie */
    gap: 4px;                    /* odstęp między tekstem i ikoną */
    font-size: 12px;
    vertical-align: middle;  
    cursor: pointer    
    transition: 0.3s ease-in-out;
    &:hover{
        background-color: #606060;
    }
`
export const ParticipantsTable = ({ users = [], authors = [] }) => {
    // pobieramy usera ze store
    const userFromStore = useUserStore((state) => state.user);

    // jeśli w store nic nie ma – próbujemy dociągnąć z backendu
    useEffect(() => {
        if (!userFromStore?._id) {
            (async () => {
                try {
                    const me = await fetchMe().catch(() => null);
                    // fetchMe samo zapisze usera w store (w Twojej implementacji)
                } catch {
                    /* ignore */
                }
            })();
        }
    }, [userFromStore?._id]);

    // zalogowany userId (może być null)
    const loggedUserId = userFromStore?._id ? String(userFromStore._id) : null;

    return (
        <ParticipantsTableMainbox>
            <StyledTable>
                <thead>
                    <TableRow className="rowHeader">
                        <HeaderCell className="headerFull">Imię i nazwisko</HeaderCell>
                        <HeaderCell className="mailCell headerFull">Adres email</HeaderCell>
                        <HeaderCell className="headerFull">Status płatności</HeaderCell>
                        <HeaderCell className="headerMobile">Uczestnik</HeaderCell>
                        <HeaderCell className="mailCell headerMobile">Email</HeaderCell>
                        <HeaderCell className="headerMobile">Status</HeaderCell>
                    </TableRow>
                </thead>
                <tbody>
                   <TableRow>
                        <TableCell>Jan Kozidupka</TableCell>
                        <TableCell className="mailCell">
                            <span className="mail">
                                kozidupka@gmail.com
                            </span>
                        </TableCell>
                        <TableCell>
                            <PaymentStatus className="paymentStatus done">
                                Opłacone
                            </PaymentStatus>
                        </TableCell>

                    </TableRow>
                    <TableRow>
                        <TableCell>Tomasz Psikuta</TableCell>
                        <TableCell className="mailCell">
                            <span className="mail">
                                psikutas@gmail.com
                            </span>
                        </TableCell>
                        <TableCell>
                            <PaymentStatus className="paymentStatus part">
                                Częściowo
                            </PaymentStatus>
                        </TableCell>

                    </TableRow>
                    <TableRow>
                        <TableCell>Tomasz Psikuta</TableCell>
                        <TableCell className="mailCell">
                            <span className="mail">
                                psikutas@gmail.com
                            </span>
                        </TableCell>
                        <TableCell>
                            <PaymentStatus className="paymentStatus none">
                                Nieopłacone
                            </PaymentStatus>
                        </TableCell>

                    </TableRow>
                    <TableRow>
                       
                    </TableRow>
                    {Array.isArray(users) && users.length
                        ? users.map((user, idx) => {
                            const userId= String(user.userId); // jeśli to ObjectId/number – normalizujemy
                            const isLogged = loggedUserId && loggedUserId === userId;
                            const isAuthor = authors.includes(userId)
                            return (
                                <TableRow key={userId || idx} className={isLogged ? "loggedUser" : ""}>
                                    <TableCell>
                                        {user.username} {isAuthor && <span className="crownSpan"><Crown size={14}/></span>} {isLogged && <span className="youSpan">(ty)</span>}
                                    </TableCell>
                                    <TableCell className="mailCell">
                                        <span className="mail">
                                            {/* tu docelowo wstawisz prawdziwy email */}
                                            {user.email}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <PaymentStatus className="paymentStatus none">
                                            Nieopłacone
                                        </PaymentStatus>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                        : null}
                </tbody>
            </StyledTable>
        </ParticipantsTableMainbox>
    )
}
