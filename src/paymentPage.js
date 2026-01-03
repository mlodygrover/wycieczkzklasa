import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { 
    CreditCard, CheckCircle, XCircle, Loader2, 
    ShieldCheck, Lock, ChevronRight, Info 
} from 'lucide-react';

const portacc = process.env.REACT_APP_API_SOURCE || "https://api.draftngo.com";

/* ===================== ANIMATIONS ===================== */
const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

/* ===================== STYLED COMPONENTS ===================== */

const PageWrapper = styled.div`
    width: 90%;
    max-width: 1600px;
    margin: 40px auto;
    font-family: 'Inter', sans-serif;
    animation: ${slideUp} 0.5s ease-out;
`;

const ContentGrid = styled.div`
    display: grid;
    grid-template-columns: 1.4fr 1fr;
    gap: 40px;
    margin-top: 30px;

    @media (max-width: 960px) {
        grid-template-columns: 1fr;
        gap: 20px;
    }
`;

// --- SEKCJA GŁÓWNA (LEWA) ---
const MainCard = styled.div`
    background: #ffffff;
    border-radius: 24px;
    padding: 48px;
    border: 1px solid #f0f0f0;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 400px;

    @media (max-width: 600px) {
        padding: 24px;
    }
`;

const HeaderGroup = styled.div`
    margin-bottom: 40px;
`;

const Title = styled.h2`
    font-size: 28px;
    font-weight: 700;
    color: #111;
    margin: 0 0 8px 0;
    letter-spacing: -0.5px;
`;

const Description = styled.p`
    font-size: 15px;
    color: #666;
    line-height: 1.6;
    margin: 0;
    max-width: 90%;
`;

const PriceContainer = styled.div`
    margin-bottom: 40px;
`;

const PriceLabel = styled.div`
    font-size: 13px;
    text-transform: uppercase;
    color: #888;
    font-weight: 600;
    letter-spacing: 1px;
    margin-bottom: 12px;
`;

const BigPrice = styled.div`
    font-size: 72px;
    font-weight: 800;
    color: #000;
    line-height: 1;
    letter-spacing: -2px;
    display: flex;
    align-items: flex-start;
    gap: 8px;

    span.currency {
        font-size: 24px;
        font-weight: 500;
        color: #999;
        margin-top: 12px;
        letter-spacing: 0;
    }

    @media (max-width: 600px) {
        font-size: 56px;
    }
`;

const PaymentActions = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const PayButton = styled.button`
    width: 100%;
    height: 64px;
    background: #111;
    color: white;
    border: none;
    border-radius: 16px;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between; /* Tekst po lewej, strzałka po prawej */
    padding: 0 32px;
    transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
    box-shadow: 0 8px 20px -6px rgba(0,0,0,0.3);

    &:hover:not(:disabled) {
        transform: translateY(-2px);
        background: #000;
        box-shadow: 0 12px 24px -8px rgba(0,0,0,0.4);
    }

    &:active:not(:disabled) {
        transform: scale(0.98);
    }

    &:disabled {
        background: #f3f4f6;
        color: #a1a1aa;
        box-shadow: none;
        cursor: not-allowed;
    }

    .btn-label {
        display: flex;
        align-items: center;
        gap: 12px;
    }
`;

const SecurityBadge = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 13px;
    color: #6b7280;
    background: #f9fafb;
    padding: 10px;
    border-radius: 12px;
    
    svg { width: 14px; height: 14px; color: #10b981; }
`;

// --- SEKCJA BOCZNA (PRAWA) ---
const InfoCard = styled.div`
    background: #f8f9fa;
    border-radius: 24px;
    padding: 40px;
    display: flex;
    flex-direction: column;
    gap: 32px;
    border: 1px solid #f0f0f0;

    @media (max-width: 600px) {
        padding: 24px;
        order: -1; /* Na mobile dajemy to pod spód lub nad, zależnie od preferencji. Tu zostawiam domyślnie, ale można zmienić order */
    }
`;

const InfoRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 16px;
    border-bottom: 1px solid #e5e7eb;

    &:last-child {
        border-bottom: none;
        padding-bottom: 0;
    }

    .label {
        font-size: 14px;
        color: #666;
        font-weight: 500;
    }

    .value {
        font-size: 15px;
        font-weight: 600;
        color: #111;
        text-align: right;
        
        &.highlight {
            color: #059669;
            background: #d1fae5;
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 13px;
        }
        
        &.pending {
            color: #d97706;
            background: #fef3c7;
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 13px;
        }
    }
`;

const ProviderInfo = styled.div`
    margin-top: auto;
    display: flex;
    gap: 12px;
    align-items: center;
    background: #fff;
    padding: 16px;
    border-radius: 12px;
    border: 1px solid #eee;

    .icon {
        width: 36px;
        height: 36px;
        background: #000;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
    }

    div {
        display: flex;
        flex-direction: column;
    }

    span.tiny { font-size: 11px; color: #888; text-transform: uppercase; font-weight: 600; }
    span.bold { font-size: 14px; font-weight: 700; color: #111; }
`;

// --- BANERY ---
const Notification = styled.div`
    padding: 16px 20px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    gap: 14px;
    font-size: 14px;
    margin-bottom: 16px;
    
    ${p => p.$type === 'success' && css`
        background: #ecfdf5;
        border: 1px solid #a7f3d0;
        color: #065f46;
        svg { color: #059669; }
    `}

    ${p => p.$type === 'error' && css`
        background: #fef2f2;
        border: 1px solid #fecaca;
        color: #991b1b;
        svg { color: #dc2626; }
    `}
`;

// ===================== KOMPONENT =====================

export const PaymentsPage = ({ tripId, computedPrice, paymentStatus: propPaymentStatus }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [urlStatus, setUrlStatus] = useState(null);

    useEffect(() => {
        const sp = new URLSearchParams(window.location.search);
        const status = sp.get('paymentStatus');
        if (status === 'success') {
            setUrlStatus('success');
            window.history.replaceState({}, '', window.location.pathname + window.location.search.replace(/[?&]paymentStatus=[^&]+/, ''));
        } else if (status === 'error') {
            setUrlStatus('error');
        }
    }, []);

    const handlePayment = async () => {
        if (!tripId) return;
        setIsProcessing(true);
        try {
            const response = await fetch(`${portacc}/payments/init`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ tripId })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Błąd inicjacji płatności');
            }

            const data = await response.json();
            if (data.paymentUrl) {
                window.location.href = data.paymentUrl;
            } else {
                throw new Error("Błąd serwera: brak linku płatności.");
            }
        } catch (error) {
            console.error("Payment error:", error);
            alert("Nie udało się rozpocząć płatności. Spróbuj ponownie.");
            setIsProcessing(false);
        }
    };

    const isPaid = propPaymentStatus === 'completed';

    return (
        <PageWrapper>
            
            {/* --- NOTYFIKACJE --- */}
            {urlStatus === 'success' && (
                <Notification $type="success">
                    <CheckCircle size={20} />
                    <div><strong>Sukces!</strong> Twoja płatność została pomyślnie przetworzona.</div>
                </Notification>
            )}
            {urlStatus === 'error' && (
                <Notification $type="error">
                    <XCircle size={20} />
                    <div><strong>Błąd!</strong> Płatność została odrzucona. Spróbuj ponownie.</div>
                </Notification>
            )}

            <ContentGrid>
                {/* --- LEWA KOLUMNA (GŁÓWNA) --- */}
                <MainCard>
                    <div>
                        <HeaderGroup>
                            <Title>Podsumowanie płatności</Title>
                            <Description>
                                Opłać swój udział w wyjeździe szybko i bezpiecznie. Pełna kwota obejmuje wszystkie zaplanowane aktywności.
                            </Description>
                        </HeaderGroup>

                        <PriceContainer>
                            <PriceLabel>Kwota do zapłaty</PriceLabel>
                            <BigPrice>
                                {computedPrice ? computedPrice.toLocaleString('pl-PL') : '0'}
                                <span className="currency">PLN</span>
                            </BigPrice>
                        </PriceContainer>
                    </div>

                    <PaymentActions>
                        <PayButton 
                            onClick={handlePayment} 
                            disabled={isProcessing || isPaid || !computedPrice}
                        >
                            <div className="btn-label">
                                {isProcessing ? <Loader2 className="animate-spin" /> : <CreditCard />}
                                <span>{isPaid ? 'Wyjazd opłacony' : 'Przejdź do płatności'}</span>
                            </div>
                            {!isPaid && !isProcessing && <ChevronRight size={20} />}
                        </PayButton>

                        <SecurityBadge>
                            <Lock size={14} />
                            Połączenie szyfrowane SSL 256-bit
                        </SecurityBadge>
                    </PaymentActions>
                </MainCard>

                {/* --- PRAWA KOLUMNA (SZCZEGÓŁY) --- */}
                <InfoCard>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        <Info size={20} color="#666" />
                        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Szczegóły</h3>
                    </div>

                    <InfoRow>
                        <span className="label">Status</span>
                        <span className={`value ${isPaid ? 'highlight' : 'pending'}`}>
                            {isPaid ? 'Opłacono' : 'Oczekuje'}
                        </span>
                    </InfoRow>

                    <InfoRow>
                        <span className="label">Metoda</span>
                        <span className="value">Przelew / BLIK</span>
                    </InfoRow>

                    <InfoRow>
                        <span className="label">Termin</span>
                        <span className="value">Natychmiastowy</span>
                    </InfoRow>

                    <InfoRow>
                        <span className="label">Gwarancja</span>
                        <span className="value">Zwrot w przypadku odwołania</span>
                    </InfoRow>

                    <ProviderInfo>
                        <div className="icon"><ShieldCheck size={20} /></div>
                        <div>
                            <span className="tiny">Operator płatności</span>
                            <span className="bold">Tpay (Krajowy Integrator)</span>
                        </div>
                    </ProviderInfo>
                </InfoCard>
            </ContentGrid>

        </PageWrapper>
    );
};