import styled from 'styled-components';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Mail, 
  Phone, 
  MapPin,
  Plane,
  Youtube
} from 'lucide-react';

const FooterSection = styled.footer`
  width: 100%;
  background: linear-gradient(
    135deg,
    #f0fdf4 0%,
    #ffffff 25%,
    #ffffff 75%,
    #ecfdf5 100%
  );
  padding: 4rem 2rem 2rem;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url('https://images.unsplash.com/photo-1742942965475-25d3b7bf2bfa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGdlb21ldHJpYyUyMHBhdHRlcm58ZW58MXx8fHwxNzYyMTg5MzE4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral');
    background-size: cover;
    background-position: center;
    opacity: 0.03;
    pointer-events: none;
    z-index: 0;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      #047857 20%,
      #059669 50%,
      #047857 80%,
      transparent 100%
    );
    box-shadow: 0 0 20px rgba(4, 120, 87, 0.3);
  }
`;

const Container = styled.div`
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  position: relative;
  z-index: 1;
`;

const TopSection = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1.5fr;
  gap: 3rem;
  margin-bottom: 3rem;
  
  @media (max-width: 1024px) {
    display: none;
  }
  
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  
  svg {
    width: 32px;
    height: 32px;
    color: #047857;
  }
`;

const LogoText = styled.span`
  font-size: 1.5rem;
  font-weight: 800;
  color: #0a0a0a;
  letter-spacing: -0.02em;
`;

const Description = styled.p`
  font-size: 0.9375rem;
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 1rem;
`;

const ColumnTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: #0a0a0a;
  margin-bottom: 0.25rem;
`;

const LinkList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
`;

const LinkItem = styled.li`
  a {
    font-size: 0.9375rem;
    color: #6b7280;
    text-decoration: none;
    transition: color 0.3s ease;
    display: inline-block;
    
    &:hover {
      color: #047857;
    }
  }
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9375rem;
  color: #6b7280;
  
  svg {
    width: 18px;
    height: 18px;
    color: #047857;
    flex-shrink: 0;
  }
`;

const NewsletterBox = styled.div`
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(4, 120, 87, 0.15);
  border-radius: 1rem;
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 4px 16px rgba(4, 120, 87, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, #047857 0%, #059669 100%);
  }
  
  &::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
      circle,
      rgba(4, 120, 87, 0.08) 0%,
      transparent 60%
    );
    pointer-events: none;
  }
`;

const NewsletterTitle = styled.h4`
  font-size: 1rem;
  font-weight: 700;
  color: #0a0a0a;
  margin-bottom: 0.5rem;
`;

const NewsletterDescription = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 1rem;
`;

const NewsletterForm = styled.form`
  display: flex;
  gap: 0.5rem;
  
  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const Input = styled.input`
  flex: 1;
  padding: 0.625rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.9375rem;
  background: white;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #047857;
    box-shadow: 0 0 0 3px rgba(4, 120, 87, 0.1);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const SubscribeButton = styled.button`
  padding: 0.625rem 1.5rem;
  background: linear-gradient(135deg, #047857 0%, #059669 100%);
  border: none;
  border-radius: 0.5rem;
  color: white;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(4, 120, 87, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const Divider = styled.div`
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    #e5e7eb 50%,
    transparent 100%
  );
  margin: 2rem 0;
`;

const BottomSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const Copyright = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const SocialButton = styled.a`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  color: #6b7280;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  text-decoration: none;
  
  svg {
    width: 20px;
    height: 20px;
  }
  
  &:hover {
    background: linear-gradient(135deg, #047857 0%, #059669 100%);
    border-color: #047857;
    color: white;
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(4, 120, 87, 0.25);
  }
`;

const BottomLinks = styled.div`
  display: flex;
  gap: 2rem;
  
  @media (max-width: 640px) {
    flex-direction: column;
    gap: 0.75rem;
  }
`;

const BottomLink = styled.a`
  font-size: 0.875rem;
  color: #6b7280;
  text-decoration: none;
  transition: color 0.3s ease;
  
  &:hover {
    color: #047857;
  }
`;

export default function PageFooter() {
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // Handle newsletter subscription
  };

  return (
    <FooterSection>
      <Container>
        <TopSection>
          <Column>
            <Logo>
              <Plane />
              <LogoText>TravelConfig</LogoText>
            </Logo>
            <Description>
              Twój inteligentny konfigurator wyjazdów turystycznych. 
              Planuj wymarzone podróże szybko i wygodnie.
            </Description>
            <SocialLinks>
              <SocialButton href="#" aria-label="Facebook">
                <Facebook />
              </SocialButton>
              <SocialButton href="#" aria-label="Instagram">
                <Instagram />
              </SocialButton>
              <SocialButton href="#" aria-label="Twitter">
                <Twitter />
              </SocialButton>
              <SocialButton href="#" aria-label="YouTube">
                <Youtube />
              </SocialButton>
            </SocialLinks>
          </Column>

          <Column>
            <ColumnTitle>Destynacje</ColumnTitle>
            <LinkList>
              <LinkItem><a href="#">Poznań</a></LinkItem>
              <LinkItem><a href="#">Warszawa</a></LinkItem>
              <LinkItem><a href="#">Kraków</a></LinkItem>
              <LinkItem><a href="#">Gdańsk</a></LinkItem>
              <LinkItem><a href="#">Wrocław</a></LinkItem>
            </LinkList>
          </Column>

          <Column>
            <ColumnTitle>Firma</ColumnTitle>
            <LinkList>
              <LinkItem><a href="#">O nas</a></LinkItem>
              <LinkItem><a href="#">Kariera</a></LinkItem>
              <LinkItem><a href="#">Partnerzy</a></LinkItem>
              <LinkItem><a href="#">Blog</a></LinkItem>
              <LinkItem><a href="#">Kontakt</a></LinkItem>
            </LinkList>
          </Column>

          <Column>
            <ColumnTitle>Pomoc</ColumnTitle>
            <LinkList>
              <LinkItem><a href="#">Centrum pomocy</a></LinkItem>
              <LinkItem><a href="#">FAQ</a></LinkItem>
              <LinkItem><a href="#">Regulamin</a></LinkItem>
              <LinkItem><a href="#">Prywatność</a></LinkItem>
              <LinkItem><a href="#">Cookies</a></LinkItem>
            </LinkList>
          </Column>

          <Column>
            <NewsletterBox>
              <NewsletterTitle>Newsletter</NewsletterTitle>
              <NewsletterDescription>
                Otrzymuj najlepsze oferty i inspiracje
              </NewsletterDescription>
              <NewsletterForm onSubmit={handleNewsletterSubmit}>
                <Input 
                  type="email" 
                  placeholder="Twój email"
                  required
                />
                <SubscribeButton type="submit">
                  Zapisz się
                </SubscribeButton>
              </NewsletterForm>
            </NewsletterBox>
            
            <ColumnTitle style={{ marginTop: '0.5rem' }}>Kontakt</ColumnTitle>
            <ContactItem>
              <Phone />
              <span>+48 123 456 789</span>
            </ContactItem>
            <ContactItem>
              <Mail />
              <span>info@travelconfig.pl</span>
            </ContactItem>
            <ContactItem>
              <MapPin />
              <span>Poznań, Polska</span>
            </ContactItem>
          </Column>
        </TopSection>

        <Divider />

        <BottomSection>
          <Copyright>
            © {new Date().getFullYear()} TravelConfig. Wszystkie prawa zastrzeżone.
          </Copyright>
          
          <BottomLinks>
            <BottomLink href="#">Polityka prywatności</BottomLink>
            <BottomLink href="#">Regulamin</BottomLink>
            <BottomLink href="#">Cookies</BottomLink>
          </BottomLinks>
        </BottomSection>
      </Container>
    </FooterSection>
  );
}
