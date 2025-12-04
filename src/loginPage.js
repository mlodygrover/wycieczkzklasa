import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useUserStore from './usercontent';
import { fetchMe } from './usercontent';

const portacc = process.env.REACT_APP_API_SOURCE || "https://api.draftngo.com";

// Komponent <style> do wstrzyknięcia CSS
const GlobalStyles = () => (
    <style>{`
    @keyframes kenBurnsZoom {
      0% {
        transform: scale(1) translateX(0) translateY(0);
      }
      25% {
        transform: scale(1.2) translateX(-5%) translateY(-3%);
      }
      50% {
        transform: scale(1.15) translateX(3%) translateY(-5%);
      }
      75% {
        transform: scale(1.25) translateX(-3%) translateY(3%);
      }
      100% {
        transform: scale(1) translateX(0) translateY(0);
      }
    }

    @keyframes float {
      0%, 100% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-10px);
      }
    }

    .container {
      position: relative;
      width: 100%;
      min-height: 100vh;
      overflow: hidden;
      background: #0f172a;
    }

    .background-wrapper {
      position: absolute;
      inset: 0;
    }

    .background-inner {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    .animated-background {
      position: absolute;
      inset: -10%;
      background-image: url('https://images.unsplash.com/photo-1756288560629-8d7f9d0013de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxQb3puYW4lMjBvbGQlMjB0b3duJTIwbmlnaHR8ZW58MXx8fHwxNzYxOTQwMDMyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral');
      background-size: cover;
      background-position: center;
      animation: kenBurnsZoom 30s ease-in-out infinite;
    }

    .overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.5) 0%, rgba(0, 0, 0, 0.3) 50%, rgba(15, 23, 42, 0.6) 100%);
    }

    .content-wrapper {
      position: relative;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 3rem 1rem;
    }

    .card-container {
      width: 100%;
      max-width: 28rem;
      position: relative;
    }

    .glass-card {
      position: relative;
      min-height: 600px;
      display: flex;
      flex-direction: column;
      padding: 2rem;
      border-radius: 2rem;
      
      /* Liquid Glass Effect */
      background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.15) 0%,
        rgba(255, 255, 255, 0.08) 50%,
        rgba(255, 255, 255, 0.12) 100%
      );
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      
      border: 2px solid rgba(255, 255, 255, 0.25);
      box-shadow: 
        0 8px 32px 0 rgba(0, 0, 0, 0.37),
        inset 0 1px 0 0 rgba(255, 255, 255, 0.3),
        inset 0 -1px 0 0 rgba(255, 255, 255, 0.1);
    }
    
    .glass-card::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 2rem;
      padding: 2px;
      background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.4),
        rgba(255, 255, 255, 0.05),
        rgba(255, 255, 255, 0.3)
      );
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      pointer-events: none;
    }
    
    .glass-card::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 50%;
      background: linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.2) 0%,
        rgba(255, 255, 255, 0) 100%
      );
      border-radius: 2rem 2rem 0 0;
      pointer-events: none;
    }

    .card-content {
      position: relative;
      z-index: 10;
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .logo-container {
      display: flex;
      justify-content: center;
      margin-bottom: 1.5rem;
      animation: float 3s ease-in-out infinite;
    }

    .logo-circle {
      padding: 0.75rem;
      border-radius: 50%;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      box-shadow: 0 10px 40px rgba(16, 185, 129, 0.4);
    }
    
    .logo-circle svg {
      width: 1.75rem;
      height: 1.75rem;
      color: white;
    }

    .title {
      text-align: center;
      color: white;
      margin-bottom: 0.25rem;
      font-size: 1.875rem;
      font-weight: 600;
    }

    .subtitle {
      text-align: center;
      color: rgba(255, 255, 255, 0.75);
      margin-bottom: 1.5rem;
      font-size: 0.875rem;
    }

    .social-buttons-container {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .social-button {
      width: 100%;
      padding: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      color: white;
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.25);
      border-radius: 0.75rem;
      backdrop-filter: blur(10px);
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.875rem;
      font-weight: 500;
    }
    
    .social-button:hover {
      background: rgba(255, 255, 255, 0.2);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
      transform: translateY(-2px);
    }
    
    .social-button svg {
      width: 1.25rem;
      height: 1.25rem;
    }

    .divider {
      position: relative;
      margin: 1.5rem 0;
    }
    
    .divider::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: rgba(255, 255, 255, 0.2);
    }

    .divider-text {
      position: relative;
      display: flex;
      justify-content: center;
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.6);
    }
    
    .divider-text span {
      padding: 0 0.75rem;
      background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.15) 0%,
        rgba(255, 255, 255, 0.08) 50%,
        rgba(255, 255, 255, 0.12) 100%
      );
    }

    .form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      flex: 1;
    }

    .input-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .label {
      color: rgba(255, 255, 255, 0.9);
      font-size: 0.875rem;
      font-weight: 500;
    }

    .input-wrapper {
      position: relative;
    }
    
    .input-wrapper svg {
      position: absolute;
      left: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      width: 1rem;
      height: 1rem;
      color: rgba(255, 255, 255, 0.5);
    }

    .input {
      width: 100%;
      box-sizing: border-box;
      padding: 0.75rem 0.75rem 0.75rem 2.5rem;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 0.75rem;
      color: white;
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
    }
    
    .input::placeholder {
      color: rgba(255, 255, 255, 0.4);
    }
    
    .input:focus {
      outline: none;
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.4);
      box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
    }

    .password-input {
      padding-right: 2.5rem;
    }

    .toggle-password-button {
      position: absolute;
      right: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      color: rgba(255, 255, 255, 0.5);
      padding: 0;
      display: flex;
      align-items: center;
      transition: color 0.3s ease;
    }
    
    .toggle-password-button:hover {
      color: rgba(255, 255, 255, 0.8);
    }
    
    .toggle-password-button svg {
      position: static;
      transform: none;
    }

    .forgot-password {
      display: flex;
      justify-content: flex-end;
    }

    .forgot-password-button {
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.875rem;
      cursor: pointer;
      transition: color 0.3s ease;
    }
    
    .forgot-password-button:hover {
      color: white;
    }

    .submit-button {
      width: 100%;
      padding: 0.875rem;
      background: linear-gradient(
        135deg,
        rgba(16, 185, 129, 0.25) 0%,
        rgba(5, 150, 105, 0.2) 100%
      );
      border: 1px solid rgba(16, 185, 129, 0.4);
      border-radius: 0.75rem;
      color: white;
      font-weight: 500;
      cursor: pointer;
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
      margin-top: auto;
      box-shadow: 0 4px 16px rgba(16, 185, 129, 0.15);
    }
    
    .submit-button:hover {
      background: linear-gradient(
        135deg,
        rgba(16, 185, 129, 0.35) 0%,
        rgba(5, 150, 105, 0.3) 100%
      );
      box-shadow: 0 6px 24px rgba(16, 185, 129, 0.3);
      transform: translateY(-2px);
      border-color: rgba(16, 185, 129, 0.5);
    }

    .signup-container {
      text-align: center;
      margin-top: 1.5rem;
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.875rem;
    }

    .signup-button {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      transition: color 0.3s ease;
      font-weight: 500;
    }
    
    .signup-button:hover {
      color: #6ee7b7;
    }

    .decorative-blob {
      position: absolute;
      width: 8rem;
      height: 8rem;
      background: rgba(16, 185, 129, 0.15);
      border-radius: 50%;
      filter: blur(60px);
      pointer-events: none;
    }
  `}
    </style>
);

export default function LoginPage() {
    const [formMode, setFormMode] = useState('login'); // 'login', 'register', 'forgot'
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');

    const navigate = useNavigate();

    // >>> AUTOMATYCZNE PRZEKIEROWANIE, JEŚLI SESJA JUŻ ISTNIEJE <<<
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`${portacc}/api/me`, {
                    credentials: 'include', // kluczowe: dołącz cookie sesji
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data?.authenticated && data?.user) {
                        // zasil globalny store
                        await fetchMe();
                        // przenieś na stronę główną
                        navigate('/', { replace: true });
                    }
                }
            } catch (_) {
                // brak sesji lub błąd — pozostajemy na /login
            }
        })();
    }, [navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (formMode === 'login') {
            console.log('Login attempt:', { email, password });
            alert('Logowanie...');
        } else if (formMode === 'register') {
            if (password !== confirmPassword) {
                alert('Hasła nie są identyczne!');
                return;
            }
            console.log('Register attempt:', { name, email, password });
            alert('Rejestracja zakończona pomyślnie!');
            setFormMode('login');
            setName('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
        } else if (formMode === 'forgot') {
            console.log('Password reset for:', email);
            alert(`Link do resetowania hasła został wysłany na: ${email}`);
            setFormMode('login');
            setEmail('');
        }
    };

    const handleSocialLogin = (provider) => {
        const base = `${portacc}/auth`;
        if (provider === 'Facebook') {
            window.location.href = `${base}/facebook`;
        }
    };

    const getFormTitle = () => {
        switch (formMode) {
            case 'login': return 'Witaj ponownie';
            case 'register': return 'Utwórz konto';
            case 'forgot': return 'Resetuj hasło';
            default: return 'Witaj ponownie';
        }
    };

    const getFormSubtitle = () => {
        switch (formMode) {
            case 'login': return 'Zaloguj się, aby kontynuować podróż';
            case 'register': return 'Zarejestruj się i zacznij planować';
            case 'forgot': return 'Wyślemy Ci link do resetowania hasła';
            default: return 'Zaloguj się, aby kontynuować podróż';
        }
    };

    const getSubmitButtonText = () => {
        switch (formMode) {
            case 'login': return 'Zaloguj się';
            case 'register': return 'Zarejestruj się';
            case 'forgot': return 'Wyślij link';
            default: return 'Zaloguj się';
        }
    };

    return (
        <div className="container">
            <GlobalStyles />
            <div className="background-wrapper">
                <div className="background-inner">
                    <div className="animated-background" />
                    <div className="overlay" />
                </div>
            </div>

            <div className="content-wrapper">
                <div className="card-container">
                    <div className="glass-card">
                        <div className="card-content">
                            <div className="logo-container">
                                <div className="logo-circle">
                                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>

                            <h1 className="title">{getFormTitle()}</h1>
                            <p className="subtitle">{getFormSubtitle()}</p>

                            {formMode !== 'forgot' && (
                                <>
                                    <div className="social-buttons-container">
                                        {/* Jeśli nie używasz Google – usuń ten przycisk */}
                                        {/* <button className="social-button" onClick={() => handleSocialLogin('Google')}>...</button> */}
                                        <button className="social-button" onClick={() => handleSocialLogin('Facebook')}>
                                            <svg fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                            </svg>
                                            Kontynuuj z Facebook
                                        </button>
                                    </div>

                                    <div className="divider">
                                        <span className="divider-text">
                                            <span>lub emailem</span>
                                        </span>
                                    </div>
                                </>
                            )}

                            <form className="form" onSubmit={handleSubmit}>
                                {formMode === 'register' && (
                                    <div className="input-group">
                                        <label className="label" htmlFor="name">Imię i nazwisko</label>
                                        <div className="input-wrapper">
                                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            <input
                                                id="name"
                                                className="input"
                                                type="text"
                                                placeholder="Jan Kowalski"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="input-group">
                                    <label className="label" htmlFor="email">Email</label>
                                    <div className="input-wrapper">
                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <input
                                            id="email"
                                            className="input"
                                            type="email"
                                            placeholder="twoj@email.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                {formMode !== 'forgot' && (
                                    <div className="input-group">
                                        <label className="label" htmlFor="password">Hasło</label>
                                        <div className="input-wrapper">
                                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                            <input
                                                id="password"
                                                className="input password-input"
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="toggle-password-button"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? (
                                                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                    </svg>
                                                ) : (
                                                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {formMode === 'register' && (
                                    <div className="input-group">
                                        <label className="label" htmlFor="confirmPassword">Powtórz hasło</label>
                                        <div className="input-wrapper">
                                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                            <input
                                                id="confirmPassword"
                                                className="input password-input"
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="toggle-password-button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                {showConfirmPassword ? (
                                                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                    </svg>
                                                ) : (
                                                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {formMode === 'login' && (
                                    <div className="forgot-password">
                                        <button
                                            type="button"
                                            className="forgot-password-button"
                                            onClick={() => setFormMode('forgot')}
                                        >
                                            Zapomniałeś hasła?
                                        </button>
                                    </div>
                                )}

                                <button type="submit" className="submit-button">
                                    {getSubmitButtonText()}
                                </button>
                            </form>

                            {formMode === 'login' && (
                                <div className="signup-container">
                                    Nie masz konta?{' '}
                                    <button
                                        type="button"
                                        className="signup-button"
                                        onClick={() => setFormMode('register')}
                                    >
                                        Zarejestruj się
                                    </button>
                                </div>
                            )}

                            {formMode === 'register' && (
                                <div className="signup-container">
                                    Masz już konto?{' '}
                                    <button
                                        type="button"
                                        className="signup-button"
                                        onClick={() => setFormMode('login')}
                                    >
                                        Zaloguj się
                                    </button>
                                </div>
                            )}

                            {formMode === 'forgot' && (
                                <div className="signup-container">
                                    Pamiętasz hasło?{' '}
                                    <button
                                        type="button"
                                        className="signup-button"
                                        onClick={() => setFormMode('login')}
                                    >
                                        Wróć do logowania
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="decorative-blob" style={{ top: '-5rem', left: '-5rem' }} />
                    <div className="decorative-blob" style={{ bottom: '-5rem', right: '-5rem' }} />
                </div>
            </div>
        </div>
    );
}
