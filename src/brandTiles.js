import React from 'react';
import { 
  MapPin,
  Sliders,
  TrendingDown,
  CheckCircle2,
  Clock,
  Shield,
  Sparkles,
  Users,
  Award,
  Zap
} from 'lucide-react';

// Wszystkie style w tym komponencie mają prefiks `features-`
const FeaturesStyles = () => (
  <style>{`
    .features-section {
      width: 90%;
      max-width: 1600px;
      min-height: 100vh;
      background: #ffffff;
      padding: 5rem 2rem;
      position: relative;
    }

    .features-container {
      width: 100%;
      margin: 0 auto;
    }

    .features-header {
      text-align: center;
      margin-bottom: 10px;
    }

    .features-badge {
      width: 220px;
      align-items: center;
      gap: 0.5rem;
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border: 1px solid #bbf7d0;
      color: #047857;
      font-size: 14px;
      font-weight: 600;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;

    }
    
    .features-badge svg {
      width: 16px;
      height: 16px;
    }

    .features-title {
      font-size: 3.5rem;
      font-weight: 800;
      color: #0a0a0a;
      margin-bottom: 1px;
      letter-spacing: -0.02em;
      text-align: left;
      margin-top: 0;
    }
    
    @media (max-width: 768px) {
      .features-title {
        font-size: 2.25rem;
      }
    }

    .features-subtitle {
      font-size: 1.25rem;
      color: #6b7280;
      margin: 0 auto;
      text-align: left;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.25rem;
    }
    
    @media (max-width: 1200px) {
      .features-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
    
    @media (max-width: 768px) {
      .features-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    
    @media (max-width: 480px) {
      .features-grid {
        grid-template-columns: 1fr;
      }
    }

    /* Element siatki */
    .features-grid-item {
      grid-column: span 1;
      grid-row: span 1;
    }

    .features-grid-item--span-2 {
      grid-column: span 2;
    }
    
    @media (max-width: 1200px) {
      .features-grid-item--span-2 {
        grid-column: span 2;
      }
    }
    
    @media (max-width: 768px) {
      .features-grid-item,
      .features-grid-item--span-2 {
        grid-column: span 1;
        grid-row: span 1;
      }
    }

    /* Karta ze zdjęciem */
    .features-image-card {
      width: 100%;
      height: 100%;
      min-height: 280px;
      background-size: cover;
      background-position: center;
      border-radius: 1.25rem;
      position: relative;
      overflow: hidden;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }
    
    .features-image-card::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.7) 100%);
    }

    .features-image-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 1.75rem;
      z-index: 2;
      color: white;
    }

    .features-image-title {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    .features-image-description {
      font-size: 0.9375rem;
      opacity: 0.95;
    }

    /* Biała karta (kroki) */
    .features-white-card {
      width: 100%;
      height: 100%;
      min-height: 280px;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 1.25rem;
      padding: 2rem;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: center;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      box-shadow: 2px 2px 6px lightgray;
    }
    
    .features-white-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #047857 0%, #059669 100%);
      transform: scaleX(0);
      transform-origin: left;
      transition: transform 0.4s ease;
    }

    .features-white-card:hover::before {
      transform: scaleX(1);
    }

    .features-step-number {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: linear-gradient(135deg, #047857 0%, #059669 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.25rem;
      margin-bottom: 1.25rem;
      box-shadow: 0 4px 12px rgba(4, 120, 87, 0.25);
    }

    .features-white-card-title {
      font-size: 1.375rem;
      font-weight: 700;
      color: #0a0a0a;
      margin-bottom: 0.75rem;
    }

    .features-white-card-description {
      font-size: 1rem;
      color: #6b7280;
      line-height: 1.6;
    }

    /* Zielona karta statystyczna */
    .features-green-card {
      width: 100%;
      height: 100%;
      min-height: 280px;
      background: linear-gradient(135deg, #047857 0%, #059669 100%);
      border-radius: 1.25rem;
      padding: 2rem;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      color: white;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 12px rgba(4, 120, 87, 0.3);
      position: relative;
      overflow: hidden;
    }
    
    .features-green-card::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 60%);
      opacity: 0;
      transition: opacity 0.4s ease;
    }

    .features-green-card:hover::before {
      opacity: 1;
    }

    .features-green-card-number {
      font-size: 4rem;
      font-weight: 900;
      margin-bottom: 0.5rem;
      line-height: 1;
    }
    
    @media (max-width: 768px) {
      .features-green-card-number {
        font-size: 3rem;
      }
    }

    .features-green-card-label {
      font-size: 1.125rem;
      font-weight: 600;
      opacity: 0.95;
      margin-bottom: 0.5rem;
    }

    .features-green-card-description {
      font-size: 0.9375rem;
      opacity: 0.85;
    }

    .features-icon-wrapper {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.25rem;
    }
    
    .features-icon-wrapper svg {
      width: 28px;
      height: 28px;
      color: #047857;
    }
  `}
  </style>
);

export function FeaturesSection() {
  return (
    <section className="features-section">
      <FeaturesStyles />
      <div className="features-container">
        <div className="features-header">
          <div className="features-badge">
            <Sparkles />
            Poznaj nasz konfigurator
          </div>
          <h2 className="features-title">Jak to działa?</h2>
          <p className="features-subtitle">
            Innowacyjne narzędzie do planowania wyjazdów turystycznych. Niech rozwój technologii wspiera Twój wypoczynek!
          </p>
        </div>
        
        <div className="features-grid">
          {/* Row 1 */}
          <div className="features-grid-item">
            <div className="features-white-card">
              <div className="features-step-number">1</div>
              <h3 className="features-white-card-title">Wybierz cel</h3>
              <p className="features-white-card-description">
                Przeglądaj tysiące destynacji z całego świata
              </p>
            </div>
          </div>
          
          <div className="features-grid-item features-grid-item--span-2">
            <div 
              className="features-image-card" 
              style={{ backgroundImage: `url(https://images.unsplash.com/photo-1520877111294-6ae6aaa4331d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080)` }}
            >
              <div className="features-image-overlay">
                <h3 className="features-image-title">Wyjazd nad morze</h3>
                <p className="features-image-description">Relaks na rajskich plażach</p>
              </div>
            </div>
          </div>
          
          <div className="features-grid-item">
            <div className="features-green-card">
              <div className="features-green-card-number">5 min</div>
              <div className="features-green-card-label">Średni czas</div>
              <div className="features-green-card-description">rezerwacji</div>
            </div>
          </div>
          
          {/* Row 2 */}
          <div className="features-grid-item">
            <div 
              className="features-image-card" 
              style={{ backgroundImage: `url(https://images.unsplash.com/photo-1716481631612-55b15e39a995?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080)` }}
            >
              <div className="features-image-overlay">
                <h3 className="features-image-title">City Break</h3>
                <p className="features-image-description">Odkryj europejskie stolice</p>
              </div>
            </div>
          </div>
          
          <div className="features-grid-item">
            <div className="features-white-card">
              <div className="features-step-number">2</div>
              <h3 className="features-white-card-title">Personalizuj</h3>
              <p className="features-white-card-description">
                Dostosuj budżet, daty i preferencje
              </p>
            </div>
          </div>
          
          <div className="features-grid-item">
            <div className="features-green-card">
              <div className="features-green-card-number">500+</div>
              <div className="features-green-card-label">Partnerów</div>
              <div className="features-green-card-description">na całym świecie</div>
            </div>
          </div>
          
          <div className="features-grid-item">
            <div 
              className="features-image-card" 
              style={{ backgroundImage: `url(https://images.unsplash.com/photo-1549923015-badf41b04831?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080)` }}
            >
              <div className="features-image-overlay">
                <h3 className="features-image-title">Mecze piłkarskie</h3>
                <p className="features-image-description">Emocje na stadionach świata</p>
              </div>
            </div>
          </div>
          
          {/* Row 3 */}
          <div className="features-grid-item features-grid-item--span-2">
            <div 
              className="features-image-card" 
              style={{ backgroundImage: `url(https://images.unsplash.com/photo-1552590854-7a7d89b018ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080)` }}
            >
              <div className="features-image-overlay">
                <h3 className="features-image-title">Wyjazd w góry</h3>
                <p className="features-image-description">Trekking i górskie szlaki</p>
              </div>
            </div>
          </div>
          
          <div className="features-grid-item">
            <div className="features-white-card">
              <div className="features-step-number">3</div>
              <h3 className="features-white-card-title">Porównaj oferty</h3>
              <p className="features-white-card-description">
                Najlepsze ceny z setek źródeł w jednym miejscu
              </p>
            </div>
          </div>
          
          <div className="features-grid-item">
            <div className="features-green-card">
              <div className="features-green-card-number">98%</div>
              <div className="features-green-card-label">Zadowolenia</div>
              <div className="features-green-card-description">naszych klientów</div>
            </div>
          </div>
          
          {/* Row 4 */}
          <div className="features-grid-item">
            <div className="features-green-card">
              <div className="features-green-card-number">24/7</div>
              <div className="features-green-card-label">Wsparcie</div>
              <div className="features-green-card-description">przez całą dobę</div>
            </div>
          </div>
          
          <div className="features-grid-item">
            <div 
              className="features-image-card" 
              style={{ backgroundImage: `url(https://images.unsplash.com/photo-1602410125631-7e736e36797c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080)` }}
            >
              <div className="features-image-overlay">
                <h3 className="features-image-title">Safari</h3>
                <p className="features-image-description">Przygoda z dziką naturą</p>
              </div>
            </div>
          </div>
          
          <div className="features-grid-item">
            <div className="features-white-card">
              <div className="features-step-number">4</div>
              <h3 className="features-white-card-title">Zarezerwuj</h3>
              <p className="features-white-card-description">
                Bezpieczna płatność i natychmiastowe potwierdzenie
              </p>
            </div>
          </div>
          
          <div className="features-grid-item">
            <div 
              className="features-image-card" 
              style={{ backgroundImage: `url(https://images.unsplash.com/photo-1678274452966-7b7c3d66c2be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080)` }}
            >
              <div className="features-image-overlay">
                <h3 className="features-image-title">Narty i snowboard</h3>
                <p className="features-image-description">Zimowe szaleństwo w Alpach</p>
              </div>
            </div>
          </div>
          
          {/* Row 5 */}
          <div className="features-grid-item">
            <div 
              className="features-image-card" 
              style={{ backgroundImage: `url(https://images.unsplash.com/photo-1746900830074-baf6ddf20bca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080)` }}
            >
              <div className="features-image-overlay">
                <h3 className="features-image-title">Rejsy morskie</h3>
                <p className="features-image-description">Luksus na pełnym morzu</p>
              </div>
            </div>
          </div>
          
          <div className="features-grid-item">
            <div className="features-green-card">
              <div className="features-icon-wrapper" style={{ background: 'rgba(255, 255, 255, 0.2)', marginBottom: '1rem' }}>
                <Shield style={{ color: 'white' }} />
              </div>
              <div className="features-green-card-label">100% bezpieczne</div>
              <div className="features-green-card-description">SSL i szyfrowanie danych</div>
            </div>
          </div>
          
          <div className="features-grid-item features-grid-item--span-2">
            <div 
              className="features-image-card" 
              style={{ backgroundImage: `url(https://images.unsplash.com/photo-1566721328889-7c554f483ba1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080)` }}
            >
              <div className="features-image-overlay">
                <h3 className="features-image-title">Backpacking</h3>
                <p className="features-image-description">Prawdziwe podróże dla odkrywców</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
