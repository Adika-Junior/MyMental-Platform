'use client';

import Link from 'next/link';
import ResponsiveHeader from '@/components/ResponsiveHeader';
import Footer from '@/components/Footer';

export default function CareerPage() {
  return (
    <div className="bg-white min-h-screen">
      <ResponsiveHeader />

      <section style={{ 
        marginTop: '100px', 
        padding: '2rem 5%',
        maxWidth: '1200px',
        margin: '100px auto 0 auto'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '2rem',
            background: 'linear-gradient(to right, #b121f3, #44eee0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            color: 'transparent',
            fontWeight: 'bold'
          }}>
            Career Development Services
          </h1>
        </div>

        <div style={{ 
          width: '90%',
          maxWidth: '800px',
          margin: '0 auto',
          fontSize: '19px', 
          marginBottom: '3rem',
          textAlign: 'center'
        }}>
          <p style={{ marginBottom: '2rem' }}>
            Career Services helps students and professionals navigate their career paths through job placement and skill development programs. We provide comprehensive career guidance, resume building, interview preparation, and professional networking opportunities.
          </p>
          <p style={{ marginBottom: '2rem' }}>
            Our team of career counselors works with you to identify your strengths, explore career options, and develop strategies to achieve your professional goals. Whether you're just starting out or looking to make a career transition, we're here to support your journey.
          </p>
          <p>
            Take the next step in your career development. Start a conversation with our career counseling chatbot today.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
            <Link 
              href="/chat" 
              aria-label="Start a chat session about career"
              className="focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-500"
              style={{
                display: 'inline-block',
                padding: '12px 32px',
                fontSize: '16px',
                fontWeight: 'semibold',
                color: 'black',
                border: '2px solid rgb(147, 51, 234)',
                borderRadius: '8px',
                textDecoration: 'none',
                transition: 'all 0.3s',
                cursor: 'pointer'
              }}
            >
              Start a session
            </Link>
            <Link 
              href="/" 
              aria-label="Return to home page"
              className="focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
              style={{
                display: 'inline-block',
                padding: '12px 32px',
                fontSize: '16px',
                fontWeight: 'semibold',
                color: 'black',
                border: '2px solid rgb(59, 130, 246)',
                borderRadius: '8px',
                textDecoration: 'none',
                transition: 'all 0.3s',
                cursor: 'pointer'
              }}
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>

      {/* Information Cards */}
      <section style={{ 
        marginTop: '5%', 
        padding: '2rem 5%',
        maxWidth: '1200px',
        margin: '5% auto 5% auto'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 12px 15px 0 rgba(0,0,0,.24), 0 17px 50px 0 rgba(0,0,0,.19)'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              margin: '0 auto 1rem auto'
            }}>
              01
            </div>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: '#1f2937',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              Career Planning
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> Career assessment and evaluation</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> Goal setting and planning</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> Industry research and analysis</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> Skills gap identification</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> Professional development roadmaps</li>
            </ul>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 12px 15px 0 rgba(0,0,0,.24), 0 17px 50px 0 rgba(0,0,0,.19)'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              margin: '0 auto 1rem auto'
            }}>
              02
            </div>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: '#1f2937',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              Job Search Support
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> Resume and cover letter writing</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> Interview preparation and coaching</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> Job search strategies</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> Networking guidance</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> Job placement assistance</li>
            </ul>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 12px 15px 0 rgba(0,0,0,.24), 0 17px 50px 0 rgba(0,0,0,.19)'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              margin: '0 auto 1rem auto'
            }}>
              03
            </div>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: '#1f2937',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              Skill Development
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> Professional skills training</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> Certification preparation</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> Workshops and seminars</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> Online learning resources</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> Industry certification programs</li>
            </ul>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

