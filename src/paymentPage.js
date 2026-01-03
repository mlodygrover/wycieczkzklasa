import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { CreditCard, CheckCircle, XCircle, Loader2, AlertCircle, Banknote, ShieldCheck, History } from 'lucide-react';

const portacc = process.env.REACT_APP_API_SOURCE || "https://api.draftngo.com";

// --- STYLED COMPONENTS ---

const PaymentsContainer = styled.div`
    width: 100%;
    max-width: 800px;
    margin: 40px auto;
    font-family: 'Inter', sans-serif;
    color: #111;
    display: flex;
    flex-direction: column;
    gap: 24px;
`;

const StatusBanner = styled.div`
    width: 100%;
    padding: 16px 20px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 500;
    font-size: 15px;
    margin-bottom: 20px;
    animation: fadeIn 0.5s ease-out;

    &.success {
        background-color: #f0fdf4;
        border: 1px solid #bbf7d0;
        color: #166534;
        svg { color: #16a34a; }
    }

    &.error {
        background-color: #fef2f2;
        border: 1px solid #fecaca;
        color: #991b1b;
        svg { color: #dc2626; }
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;

const PaymentCard = styled.div`
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    padding: 32px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: black;
    }
`;

const PriceDisplay = styled.div`
    margin: 24px 0;
    
    .label {
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: #6b7280;
        font-weight: 600;
        margin-bottom: 8px;
    }

    .amount {
        font-size: 48px;
        font-weight: 800;
        color: #000;
        letter-spacing: -1px;
        
        span {
            font-size: 24px;
            font-weight: 600;
            color: #6b7280;
            margin-left: 4px;
        }
    }
`;

const PaymentInfoGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    width: 100%;
    gap: 16px;
    margin-bottom: 32px;
    
    @media (max-width: 600px) {
        grid-template-columns: 1fr;
    }
`;

const InfoBox = styled.div`
    background: #f9fafb;
    padding: 16px;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    border: 1px solid #f3f4f6;

    svg {
        color: #4b5563;
        width: 20px;
        height: 20px;
    }

    .title {
        font-size: 12px;
        color: #6b7280;
        font-weight: 500;
    }

    .value {
        font-size: 14px;
        font-weight: 600;
        color: #111;
    }
`;

const PayButton = styled.button`
    width: 100%;
    max-width: 400px;
    height: 52px;
    background: #000;
    color: #fff;
    border: none;
    border-radius: 10px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: all 0.2s ease;
    font-family: 'Inter', sans-serif;

    &:hover:not(:disabled) {
        background: #333;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    &:active:not(:disabled) {
        transform: translateY(0);
    }

    &:disabled {
        background: #e5e7eb;
        color: #9ca3af;
        cursor: not-allowed;
    }

    svg {
        width: 20px;
        height: 20px;
    }
`;

const FooterNote = styled.div`
    margin-top: 16px;
    font-size: 12px;
    color: #9ca3af;
    display: flex;
    align-items: center;
    gap: 6px;
    
    svg { width: 14px; height: 14px; }
`;

// --- COMPONENT ---

export const PaymentsPage = ({ tripId, computedPrice, paymentStatus: propPaymentStatus }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [urlStatus, setUrlStatus] = useState(null);

    // 1. Odczyt statusu z URL po załadowaniu
    useEffect(() => {
        const sp = new URLSearchParams(window.location.search);
        const status = sp.get('paymentStatus');
        if (status === 'success') {
            setUrlStatus('success');
            // Czyścimy URL, żeby baner nie wisiał wiecznie po odświeżeniu (opcjonalne)
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

    // Możemy tu dodać logikę pobierania aktualnego statusu płatności z backendu (np. ile już wpłacono)
    // Na razie bazujemy na computedPrice jako kwocie całkowitej.

    return (
        <PaymentsContainer>
            
            {/* 1. Banery statusowe */}
            {urlStatus === 'success' && (
                <StatusBanner className="success">
                    <CheckCircle size={20} />
                    <span>Płatność zakończona sukcesem! Twoja wpłata została zaksięgowana.</span>
                </StatusBanner>
            )}

            {urlStatus === 'error' && (
                <StatusBanner className="error">
                    <XCircle size={20} />
                    <span>Wystąpił błąd podczas płatności. Środki nie zostały pobrane. Spróbuj ponownie.</span>
                </StatusBanner>
            )}

            {/* 2. Karta płatności */}
            <PaymentCard>
                <div style={{ marginBottom: '16px', padding: '12px', background: '#f3f4f6', borderRadius: '50%' }}>
                    <Banknote size={32} color="#374151" />
                </div>
                
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 700 }}>Podsumowanie kosztów</h2>
                <p style={{ color: '#6b7280', marginTop: '8px' }}>
                    Całkowity koszt Twojego udziału w wyjeździe
                </p>

                <PriceDisplay>
                    <div className="label">Do zapłaty</div>
                    <div className="amount">
                        {computedPrice ? computedPrice.toLocaleString('pl-PL') : '0'}
                        <span>PLN</span>
                    </div>
                </PriceDisplay>

                <PaymentInfoGrid>
                    <InfoBox>
                        <History />
                        <div className="title">Termin płatności</div>
                        <div className="value">Natychmiastowy</div>
                    </InfoBox>
                    <InfoBox>
                        <ShieldCheck />
                        <div className="title">Bezpieczeństwo</div>
                        <div className="value">SSL / Tpay</div>
                    </InfoBox>
                    <InfoBox>
                        <AlertCircle />
                        <div className="title">Status</div>
                        <div className="value" style={{ color: propPaymentStatus === 'completed' ? '#16a34a' : '#d97706' }}>
                            {propPaymentStatus === 'completed' ? 'Opłacono' : 'Oczekuje'}
                        </div>
                    </InfoBox>
                </PaymentInfoGrid>

                <PayButton 
                    onClick={handlePayment} 
                    disabled={isProcessing || propPaymentStatus === 'completed' || !computedPrice}
                >
                    {isProcessing ? <Loader2 className="animate-spin" /> : <CreditCard />}
                    {propPaymentStatus === 'completed' ? 'Wyjazd opłacony' : 'Przejdź do płatności'}
                </PayButton>

                <FooterNote>
                    <ShieldCheck /> Transakcje obsługuje bezpieczny operator płatności Tpay
                </FooterNote>
            </PaymentCard>

        </PaymentsContainer>
    );
};