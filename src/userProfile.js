import React, { useState } from 'react';
import { User, MapPin, Wallet, Settings, Calendar, Edit2, CreditCard, Globe } from 'lucide-react';

// Komponent <style> do wstrzyknięcia CSS
// Wszystkie klasy mają prefiks "user-profile-" aby uniknąć konfliktów
const GlobalStyles = () => (
  <style>{`
    .user-profile-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #f0fdf4 100%);
      padding: 2rem;
    }
    
    @media (max-width: 768px) {
      .user-profile-container {
        padding: 1rem;
      }
    }

    .user-profile-wrapper {
      max-width: 1200px;
      margin: 0 auto;
    }

    .user-profile-header {
      background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.9) 0%,
        rgba(255, 255, 255, 0.7) 100%
      );
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border: 2px solid rgba(255, 255, 255, 0.5);
      border-radius: 2rem;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 
        0 20px 60px rgba(0, 0, 0, 0.08),
        inset 0 1px 0 0 rgba(255, 255, 255, 0.8);
      position: relative;
      overflow: hidden;
    }
    
    .user-profile-header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 50%;
      background: linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.4) 0%,
        rgba(255, 255, 255, 0) 100%
      );
      pointer-events: none;
    }
    
    @media (max-width: 768px) {
      .user-profile-header {
        padding: 1.5rem;
      }
    }

    .user-profile-header-content {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      gap: 2rem;
    }
    
    @media (max-width: 768px) {
      .user-profile-header-content {
        flex-direction: column;
        gap: 1.5rem;
        text-align: center;
      }
    }

    .user-profile-avatar-container {
      position: relative;
      width: 120px;
      height: 120px;
      flex-shrink: 0;
    }
    
    @media (max-width: 768px) {
      .user-profile-avatar-container {
        width: 100px;
        height: 100px;
      }
    }

    .user-profile-avatar {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 
        0 10px 40px rgba(16, 185, 129, 0.3),
        inset 0 2px 8px rgba(255, 255, 255, 0.3);
      border: 4px solid rgba(255, 255, 255, 0.8);
    }
    
    .user-profile-avatar svg {
      width: 50%;
      height: 50%;
      color: white;
    }

    .user-profile-edit-avatar-button {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.95);
      border: 2px solid rgba(16, 185, 129, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .user-profile-edit-avatar-button svg {
      width: 16px;
      height: 16px;
      color: #047857;
    }
    
    .user-profile-edit-avatar-button:hover {
      background: #10b981;
      transform: scale(1.1);
    }
    
    .user-profile-edit-avatar-button:hover svg {
      color: white;
    }

    .user-profile-user-info {
      flex: 1;
    }

    .user-profile-user-name {
      margin: 0 0 0.5rem 0;
      color: #0f172a;
    }

    .user-profile-user-email {
      margin: 0 0 0.75rem 0;
      color: #64748b;
      font-size: 0.9375rem;
    }

    .user-profile-user-stats {
      display: flex;
      gap: 2rem;
    }
    
    @media (max-width: 768px) {
      .user-profile-user-stats {
        justify-content: center;
      }
    }

    .user-profile-stat-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .user-profile-stat-value {
      color: #047857;
    }

    .user-profile-stat-label {
      font-size: 0.875rem;
      color: #64748b;
    }

    .user-profile-edit-button {
      padding: 0.75rem 1.5rem;
      background: linear-gradient(
        135deg,
        rgba(16, 185, 129, 0.1) 0%,
        rgba(5, 150, 105, 0.08) 100%
      );
      border: 1.5px solid rgba(16, 185, 129, 0.3);
      border-radius: 0.75rem;
      color: #047857;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      backdrop-filter: blur(10px);
    }
    
    .user-profile-edit-button svg {
      width: 18px;
      height: 18px;
    }
    
    .user-profile-edit-button:hover {
      background: linear-gradient(
        135deg,
        rgba(16, 185, 129, 0.2) 0%,
        rgba(5, 150, 105, 0.15) 100%
      );
      border-color: rgba(16, 185, 129, 0.5);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(16, 185, 129, 0.15);
    }

    .user-profile-tabs-container {
      background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.9) 0%,
        rgba(255, 255, 255, 0.7) 100%
      );
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border: 2px solid rgba(255, 255, 255, 0.5);
      border-radius: 1.5rem;
      padding: 0.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.06);
      display: flex;
      gap: 0.5rem;
    }
    
    @media (max-width: 768px) {
      .user-profile-tabs-container {
        flex-wrap: wrap;
      }
    }

    .user-profile-tab {
      flex: 1;
      padding: 0.875rem 1.5rem;
      background: transparent;
      border: 1.5px solid transparent;
      border-radius: 1rem;
      color: #64748b;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    
    .user-profile-tab-active {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%);
      border: 1.5px solid rgba(16, 185, 129, 0.4);
      color: #047857;
    }
    
    .user-profile-tab svg {
      width: 18px;
      height: 18px;
    }
    
    .user-profile-tab:not(.user-profile-tab-active):hover {
      background: rgba(16, 185, 129, 0.05);
      color: #047857;
    }
    
    .user-profile-tab.user-profile-tab-active:hover {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.15) 100%);
    }
    
    @media (max-width: 768px) {
      .user-profile-tab {
        flex: 1 1 calc(50% - 0.25rem);
        min-width: 140px;
      }
    }

    .user-profile-content-section {
      background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.9) 0%,
        rgba(255, 255, 255, 0.7) 100%
      );
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border: 2px solid rgba(255, 255, 255, 0.5);
      border-radius: 2rem;
      padding: 2rem;
      box-shadow: 
        0 20px 60px rgba(0, 0, 0, 0.08),
        inset 0 1px 0 0 rgba(255, 255, 255, 0.8);
      position: relative;
      overflow: hidden;
    }
    
    .user-profile-content-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 50%;
      background: linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.4) 0%,
        rgba(255, 255, 255, 0) 100%
      );
      pointer-events: none;
    }
    
    @media (max-width: 768px) {
      .user-profile-content-section {
        padding: 1.5rem;
      }
    }

    .user-profile-section-title {
      position: relative;
      z-index: 1;
      margin: 0 0 1.5rem 0;
      color: #0f172a;
    }

    .user-profile-grid {
      position: relative;
      z-index: 1;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }
    
    @media (max-width: 768px) {
      .user-profile-grid {
        grid-template-columns: 1fr;
      }
    }

    .user-profile-trip-card {
      background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.6) 0%,
        rgba(255, 255, 255, 0.4) 100%
      );
      border: 1.5px solid rgba(255, 255, 255, 0.6);
      border-radius: 1.5rem;
      padding: 1.5rem;
      transition: all 0.3s ease;
      cursor: pointer;
      backdrop-filter: blur(10px);
    }
    
    .user-profile-trip-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(16, 185, 129, 0.15);
      border-color: rgba(16, 185, 129, 0.3);
    }

    .user-profile-trip-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 1rem;
    }

    .user-profile-trip-title {
      margin: 0;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .user-profile-trip-title svg {
      width: 20px;
      height: 20px;
      color: #10b981;
    }

    .user-profile-trip-badge {
      padding: 0.375rem 0.75rem;
      border-radius: 0.5rem;
      font-size: 0.75rem;
    }
    /* Dynamiczne klasy dla statusu */
    .user-profile-trip-badge-planned {
      background: rgba(59, 130, 246, 0.15);
      color: #2563eb;
      border: 1px solid rgba(59, 130, 246, 0.3);
    }
    .user-profile-trip-badge-active {
      background: rgba(16, 185, 129, 0.15);
      color: #059669;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .user-profile-trip-badge-completed {
      background: rgba(100, 116, 139, 0.15);
      color: #475569;
      border: 1px solid rgba(100, 116, 139, 0.3);
    }

    .user-profile-trip-details {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      color: #64748b;
      font-size: 0.875rem;
    }

    .user-profile-wallet-card {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border-radius: 1.5rem;
      padding: 2rem;
      color: white;
      box-shadow: 0 20px 60px rgba(16, 185, 129, 0.3);
      position: relative;
      overflow: hidden;
      margin-bottom: 1.5rem;
    }
    
    .user-profile-wallet-card::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -20%;
      width: 200px;
      height: 200px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
    }
    
    .user-profile-wallet-card::after {
      content: '';
      position: absolute;
      bottom: -30%;
      left: -10%;
      width: 150px;
      height: 150px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 50%;
    }

    .user-profile-wallet-header {
      position: relative;
      z-index: 1;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
    }

    .user-profile-wallet-label {
      font-size: 0.875rem;
      opacity: 0.9;
    }

    .user-profile-wallet-balance {
      position: relative;
      z-index: 1;
    }

    .user-profile-balance-label {
      margin: 0 0 0.5rem 0;
      font-size: 0.875rem;
      opacity: 0.9;
    }

    .user-profile-balance-amount {
      margin: 0;
      font-size: 2.5rem;
    }

    .user-profile-transactions-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .user-profile-transaction-item {
      background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.6) 0%,
        rgba(255, 255, 255, 0.4) 100%
      );
      border: 1.5px solid rgba(255, 255, 255, 0.6);
      border-radius: 1rem;
      padding: 1rem 1.25rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      backdrop-filter: blur(10px);
    }

    .user-profile-transaction-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .user-profile-transaction-title {
      color: #0f172a;
      font-weight: 500;
    }

    .user-profile-transaction-date {
      font-size: 0.8125rem;
      color: #64748b;
    }

    .user-profile-transaction-amount {
      font-weight: 600;
    }
    /* Dynamiczne klasy dla typu transakcji */
    .user-profile-transaction-amount-income {
      color: #10b981;
    }
    .user-profile-transaction-amount-expense {
      color: #ef4444;
    }

    .user-profile-settings-grid {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .user-profile-setting-row {
      background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.6) 0%,
        rgba(255, 255, 255, 0.4) 100%
      );
      border: 1.5px solid rgba(255, 255, 255, 0.6);
      border-radius: 1rem;
      padding: 1.25rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      backdrop-filter: blur(10px);
    }

    .user-profile-setting-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .user-profile-setting-info svg {
      width: 20px;
      height: 20px;
      color: #10b981;
    }

    .user-profile-setting-text {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .user-profile-setting-label {
      color: #0f172a;
      font-weight: 500;
    }

    .user-profile-setting-description {
      font-size: 0.8125rem;
      color: #64748b;
    }

    .user-profile-setting-action {
      padding: 0.5rem 1rem;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 0.5rem;
      color: #047857;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.875rem;
    }
    
    .user-profile-setting-action:hover {
      background: rgba(16, 185, 129, 0.2);
      transform: translateY(-1px);
    }
  `}
  </style>
);

export default function UserProfile() {
  const [activeTab, setActiveTab] = useState('trips');

  const trips = [
    { id: 1, destination: 'Barcelona', dates: '15-22 lipca 2024', status: 'planned', participants: 2 },
    { id: 2, destination: 'Paryż', dates: '1-5 sierpnia 2024', status: 'planned', participants: 4 },
    { id: 3, destination: 'Kraków', dates: '10-12 czerwca 2024', status: 'completed', participants: 3 },
    { id: 4, destination: 'Gdańsk', dates: '20-25 maja 2024', status: 'completed', participants: 2 },
  ];

  const transactions = [
    { id: 1, title: 'Zwrot za odwołany lot', date: '15 czerwca 2024', amount: 450, type: 'income' },
    { id: 2, title: 'Płatność: Barcelona', date: '10 czerwca 2024', amount: -1200, type: 'expense' },
    { id: 3, title: 'Doładowanie portfela', date: '5 czerwca 2024', amount: 2000, type: 'income' },
    { id: 4, title: 'Płatność: Kraków', date: '1 czerwca 2024', amount: -800, type: 'expense' },
  ];

  const getStatusLabel = (status) => {
    switch(status) {
      case 'planned': return 'Zaplanowana';
      case 'active': return 'Aktywna';
      case 'completed': return 'Ukończona';
      default: return status;
    }
  };

  return (
    <div className="user-profile-container">
      <GlobalStyles />
      <div className="user-profile-wrapper">
        <div className="user-profile-header">
          <div className="user-profile-header-content">
            <div className="user-profile-avatar-container">
              <div className="user-profile-avatar">
                <User />
              </div>
              <button className="user-profile-edit-avatar-button">
                <Edit2 />
              </button>
            </div>
            
            <div className="user-profile-user-info">
              <h1 className="user-profile-user-name">Jan Kowalski</h1>
              <p className="user-profile-user-email">jan.kowalski@example.com</p>
              <div className="user-profile-user-stats">
                <div className="user-profile-stat-item">
                  <span className="user-profile-stat-value">12</span>
                  <span className="user-profile-stat-label">Wycieczek</span>
                </div>
                <div className="user-profile-stat-item">
                  <span className="user-profile-stat-value">8</span>
                  <span className="user-profile-stat-label">Krajów</span>
                </div>
                <div className="user-profile-stat-item">
                  <span className="user-profile-stat-value">2.5k PLN</span>
                  <span className="user-profile-stat-label">Zaoszczędzono</span>
                </div>
              </div>
            </div>
            
            <button className="user-profile-edit-button">
              <Edit2 />
              Edytuj profil
            </button>
          </div>
        </div>

        <div className="user-profile-tabs-container">
          <button 
            className={`user-profile-tab ${activeTab === 'trips' ? 'user-profile-tab-active' : ''}`} 
            onClick={() => setActiveTab('trips')}
          >
            <MapPin />
            Moje wycieczki
          </button>
          <button 
            className={`user-profile-tab ${activeTab === 'wallet' ? 'user-profile-tab-active' : ''}`} 
            onClick={() => setActiveTab('wallet')}
          >
            <Wallet />
            Portfel
          </button>
          <button 
            className={`user-profile-tab ${activeTab === 'settings' ? 'user-profile-tab-active' : ''}`} 
            onClick={() => setActiveTab('settings')}
          >
            <Settings />
            Ustawienia
          </button>
        </div>

        {activeTab === 'trips' && (
          <div className="user-profile-content-section">
            <h2 className="user-profile-section-title">Twoje wycieczki</h2>
            <div className="user-profile-grid">
              {trips.map(trip => (
                <div className="user-profile-trip-card" key={trip.id}>
                  <div className="user-profile-trip-header">
                    <h3 className="user-profile-trip-title">
                      <MapPin />
                      {trip.destination}
                    </h3>
                    <span className={`user-profile-trip-badge user-profile-trip-badge-${trip.status}`}>
                      {getStatusLabel(trip.status)}
                    </span>
                  </div>
                  <div className="user-profile-trip-details">
                    <div>📅 {trip.dates}</div>
                    <div>👥 {trip.participants} {trip.participants === 1 ? 'osoba' : 'osoby'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'wallet' && (
          <div className="user-profile-content-section">
            <h2 className="user-profile-section-title">Twój portfel</h2>
            
            <div className="user-profile-wallet-card">
              <div className="user-profile-wallet-header">
                <span className="user-profile-wallet-label">Saldo portfela</span>
                <CreditCard size={32} />
              </div>
              <div className="user-profile-wallet-balance">
                <p className="user-profile-balance-label">Dostępne środki</p>
                <h2 className="user-profile-balance-amount">1,450.00 PLN</h2>
              </div>
            </div>

            <h2 className="user-profile-section-title">Ostatnie transakcje</h2>
            <div className="user-profile-transactions-list">
              {transactions.map(transaction => (
                <div className="user-profile-transaction-item" key={transaction.id}>
                  <div className="user-profile-transaction-info">
                    <span className="user-profile-transaction-title">{transaction.title}</span>
                    <span className="user-profile-transaction-date">{transaction.date}</span>
                  </div>
                  <span className={`user-profile-transaction-amount user-profile-transaction-amount-${transaction.type}`}>
                    {transaction.type === 'income' ? '+' : ''}{transaction.amount.toFixed(2)} PLN
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="user-profile-content-section">
            <h2 className="user-profile-section-title">Ustawienia konta</h2>
            <div className="user-profile-settings-grid">
              <div className="user-profile-setting-row">
                <div className="user-profile-setting-info">
                  <User />
                  <div className="user-profile-setting-text">
                    <span className="user-profile-setting-label">Dane osobowe</span>
                    <span className="user-profile-setting-description">Edytuj swoje imię, nazwisko i datę urodzenia</span>
                  </div>
                </div>
                <button className="user-profile-setting-action">Edytuj</button>
              </div>

              <div className="user-profile-setting-row">
                <div className="user-profile-setting-info">
                  <Globe />
                  <div className="user-profile-setting-text">
                    <span className="user-profile-setting-label">Preferencje podróży</span>
                    <span className="user-profile-setting-description">Ulubione destynacje, typ podróży, budżet</span>
                  </div>
                </div>
                <button className="user-profile-setting-action">Ustaw</button>
              </div>

              <div className="user-profile-setting-row">
                <div className="user-profile-setting-info">
                  <CreditCard />
                  <div className="user-profile-setting-text">
                    <span className="user-profile-setting-label">Metody płatności</span>
                    <span className="user-profile-setting-description">Zarządzaj kartami i opcjami płatności</span>
                  </div>
                </div>
                <button className="user-profile-setting-action">Zarządzaj</button>
              </div>

              <div className="user-profile-setting-row">
                <div className="user-profile-setting-info">
                  <Settings />
                  <div className="user-profile-setting-text">
                    <span className="user-profile-setting-label">Prywatność i bezpieczeństwo</span>
                    <span className="user-profile-setting-description">Zmień hasło, zarządzaj uprawnieniami</span>
                  </div>
                </div>
                <button className="user-profile-setting-action">Konfiguruj</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
