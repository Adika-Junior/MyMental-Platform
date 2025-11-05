'use client';

import Link from 'next/link';
import { useWindowSize } from '@/hooks/useWindowSize';

export default function Footer() {
  const { width } = useWindowSize();

  return (
    <footer
      role="contentinfo"
      style={{
        backgroundColor: '#121315',
        color: '#ffffff',
        fontSize: '16px',
        marginTop: '2%',
        width: '100%',
        overflowX: 'hidden',
        boxSizing: 'border-box'
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            width < 768 ? '1fr' : width < 1024 ? '1.5fr 1fr 1.5fr' : '2fr 1fr 2fr',
          alignItems: 'start',
          gap: width < 768 ? '1.25rem' : '2rem',
          padding: width < 768 ? '1.5em 1em' : '2.5em 1.5em',
          maxWidth: '1200px',
          margin: '0 auto'
        }}
      >
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: '0 2em',
            minHeight: '15em'
          }}
        >
          <h3
            style={{
              width: '100%',
              textAlign: 'left',
              color: '#2a8ded',
              fontSize: '1.6em',
              whiteSpace: 'nowrap',
              marginBottom: '1em'
            }}
          >
            MyMental
          </h3>
          <p
            style={{
              textAlign: 'left',
              lineHeight: 1.8,
              margin: 0,
              color: 'rgba(255,255,255,0.85)'
            }}
          >
            Our Mental Health Chat Bot utilizes advanced AI technology to offer empathetic, confidential, and informed
            support. It's a space where you can express your thoughts and feelings without judgment. The chatbot is
            programmed to understand a wide range of mental health issues and provide appropriate responses and
            resources.
          </p>
        </div>

        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: '0 2em',
            minHeight: '15em'
          }}
        >
          <h3
            style={{
              width: '100%',
              textAlign: 'left',
              color: '#2a8ded',
              fontSize: '1.6em',
              whiteSpace: 'nowrap',
              marginBottom: '1em'
            }}
          >
            Quick Links
          </h3>
          <ul
            style={{
              listStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
              padding: 0,
              margin: 0
            }}
          >
            {[
              { href: '/', label: 'Home' },
              { href: '/about', label: 'About Us' },
              { href: '#services', label: 'Services' },
              { href: '/chat', label: 'ChatBot' }
            ].map((item, i) => (
              <li key={i} style={{ marginTop: '0.8em' }}>
                <Link
                  href={item.href}
                  style={{ color: '#ffffff', textDecoration: 'none', display: 'inline-block', padding: '2px 0' }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#2a8ded')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#ffffff')}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: '0 2em',
            minHeight: '15em'
          }}
        >
          <h3
            style={{
              width: '100%',
              textAlign: 'left',
              color: '#2a8ded',
              fontSize: '1.6em',
              whiteSpace: 'nowrap',
              marginBottom: '1em'
            }}
          >
            Let Us Contact You
          </h3>
          <div style={{ marginBottom: '1em', width: '100%' }}>
            <input
              type="email"
              placeholder="Your email id here"
              style={{
                fontSize: '1em',
                padding: '0.85em 1em',
                width: '100%',
                boxSizing: 'border-box',
                borderRadius: '8px',
                marginBottom: '8px',
                border: '1px solid #334155',
                backgroundColor: '#ffffff',
                color: '#0f172a'
              }}
            />
            <button
              style={{
                fontSize: '1em',
                padding: '0.9em 1em',
                width: '100%',
                boxSizing: 'border-box',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #9333ea, #0891b2)',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 6px 18px rgba(8,145,178,0.35)'
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1.05)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.filter = 'none';
              }}
            >
              Reach out
            </button>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-start',
              gap: '18px',
              fontSize: '2em',
              flexDirection: 'row',
              marginTop: '0.5em'
            }}
          >
            <i
              className="fab fa-facebook-square"
              style={{ cursor: 'pointer' }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#2a8ded')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#fff')}
            ></i>
            <i
              className="fab fa-instagram-square"
              style={{ cursor: 'pointer' }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#2a8ded')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#fff')}
            ></i>
            <i
              className="fab fa-twitter-square"
              style={{ cursor: 'pointer' }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#2a8ded')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#fff')}
            ></i>
          </div>
        </div>
      </div>

      <div
        style={{
          padding: '0.3em 1em',
          backgroundColor: '#25262e',
          width: '100%'
        }}
      >
        <p
          style={{
            fontSize: '0.9em',
            textAlign: 'center',
            color: '#cbd5e1',
            margin: 0
          }}
        >
          Copyright &copy; {new Date().getFullYear()} MyMental | All Rights Reserved
        </p>
      </div>
    </footer>
  );
}


