'use client';

import Link from 'next/link';
import ResponsiveHeader from '@/components/ResponsiveHeader';
import Footer from '@/components/Footer';

export default function FinancialPage() {
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
            Financial Counseling Services
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
            Financial counselling helps you manage your debts and get your finances back under control. Financial counsellors are skilled professionals who provide advice and support to people struggling with bills and debt. We understand that financial stress can significantly impact mental health.
          </p>
          <p style={{ marginBottom: '2rem' }}>
            Our service combines financial expertise with mental health support to help you navigate financial challenges without judgment. We provide practical solutions for debt management, budgeting, and financial planning while addressing the emotional stress that financial difficulties can cause.
          </p>
          <p>
            Take control of your financial future. Get the support you need to overcome financial stress and anxiety.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
            <Link 
              href="/chat" 
              style={{
                display: 'inline-block',
                padding: '12px 32px',
                fontSize: '16px',
                fontWeight: 'semibold',
                color: 'black',
                border: '2px solid rgb(147, 51, 234)',
                borderRadius: '8px',
                textDecoration: 'none',
                transition: 'all 0.3s'
              }}
            >
              Start a session
            </Link>
            <Link 
              href="/" 
              style={{
                display: 'inline-block',
                padding: '12px 32px',
                fontSize: '16px',
                fontWeight: 'semibold',
                color: 'black',
                border: '2px solid rgb(59, 130, 246)',
                borderRadius: '8px',
                textDecoration: 'none',
                transition: 'all 0.3s'
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
              Debt Management
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> Debt consolidation strategies</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> Negotiation with creditors</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> Payment plan development</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> Bankruptcy counseling</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> Credit repair guidance</li>
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
              Budget Planning
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> Personal budget creation</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> Expense tracking systems</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> Savings goal setting</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> Emergency fund planning</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> Financial education resources</li>
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
              Mental Health Support
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> Financial anxiety counseling</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> Stress management strategies</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> Coping with financial crisis</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> Rebuilding financial confidence</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> Long-term financial planning</li>
            </ul>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

