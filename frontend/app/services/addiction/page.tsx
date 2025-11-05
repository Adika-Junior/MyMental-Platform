'use client';

import Link from 'next/link';
import ResponsiveHeader from '@/components/ResponsiveHeader';
import Footer from '@/components/Footer';

export default function AddictionPage() {
  return (
    <div className="bg-white min-h-screen">
      <ResponsiveHeader />

      {/* Main Content */}
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
            Addiction Recovery Services
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
            Addiction Services provide an integrated range of preventative, therapeutic, and rehabilitation services to meet the diverse health and social care needs of our service users in an accountable, accessible, and equitable manner. Our comprehensive approach addresses substance abuse, behavioral addictions, and co-occurring mental health disorders.
          </p>
          <p style={{ marginBottom: '2rem' }}>
            We understand that addiction affects individuals, families, and communities. Our services focus on evidence-based treatment, peer support, and long-term recovery strategies to help individuals overcome addiction and rebuild their lives.
          </p>
          <p>
            Recovery is a journey, and we're here to support you every step of the way. Confidentiality and respect are fundamental to our approach.
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
              Types of Addiction We Treat
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> Alcohol addiction</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> Drug addiction (prescription and illegal)</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> Gambling addiction</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> Internet and technology addiction</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> Food addiction and eating disorders</li>
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
              Our Approach
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> Individualized treatment plans</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> Evidence-based therapies</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> Peer support groups</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> Family counseling and support</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> Aftercare and relapse prevention</li>
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
              Getting Help
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> Confidential assessment</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> 24/7 crisis support</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> Detoxification services</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> Residential and outpatient programs</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> Ongoing recovery support</li>
            </ul>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

