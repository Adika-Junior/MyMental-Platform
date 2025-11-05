'use client';

import Link from 'next/link';
import ResponsiveHeader from '@/components/ResponsiveHeader';
import Footer from '@/components/Footer';

export default function RelationshipsPage() {
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
            Relationship Counseling Services
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
            Relationship counselling aims to improve the important relationships in your life and can take the form of couples or individual counselling. Our experienced counselors help you navigate conflicts, improve communication, and build stronger, healthier relationships.
          </p>
          <p style={{ marginBottom: '2rem' }}>
            Whether you're dealing with romantic relationships, family dynamics, friendships, or workplace interactions, we provide a safe, non-judgmental space to explore your concerns and develop effective strategies for building and maintaining healthy connections.
          </p>
          <p>
            Healthy relationships are essential for mental and emotional well-being. Start your journey toward better relationships today.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
            <Link 
              href="/chat" 
              aria-label="Start a chat session about relationships"
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
      <Footer />

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
              Types of Relationships
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> Romantic relationships</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> Marriage counseling</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> Family relationships</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> Parent-child dynamics</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> Friendship issues</li>
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
              Common Issues
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> Communication problems</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> Trust and infidelity</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> Conflict resolution</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> Intimacy issues</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> Life transitions</li>
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
              Our Approach
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> Couples therapy</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> Individual counseling</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> Family therapy</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> Communication skills training</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>•</strong> Relationship workshops</li>
            </ul>
          </div>
        </div>
      </section>
      <Footer />

      {/* Footer */}
      <footer style={{
        backgroundColor: '#121315',
        color: '#ffffff',
        fontSize: '16px',
        marginTop: '5%'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 2fr',
          alignItems: 'stretch',
          padding: '2em 1em'
        }}>
          <div style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: '0 2em',
            minHeight: '15em'
          }}>
            <h3 style={{
              width: '100%',
              textAlign: 'left',
              color: '#2a8ded',
              fontSize: '1.6em',
              whiteSpace: 'nowrap',
              marginBottom: '1em'
            }}>
              MyMental
            </h3>
            <p style={{
              textAlign: 'justify',
              lineHeight: '2',
              margin: 0,
              color: '#fff'
            }}>
              Our Mental Health Chat Bot utilizes advanced AI technology to offer empathetic, confidential, and informed support. It's a space where you can express your thoughts and feelings without judgment.
            </p>
          </div>
          
          <div style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: '0 2em',
            minHeight: '15em'
          }}>
            <h3 style={{
              width: '100%',
              textAlign: 'left',
              color: '#2a8ded',
              fontSize: '1.6em',
              whiteSpace: 'nowrap',
              marginBottom: '1em'
            }}>
              Quick Links
            </h3>
            <ul style={{
              listStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
              padding: 0,
              margin: 0
            }}>
              <li style={{ marginTop: '0.8em' }}><Link href="/" style={{ color: '#ffffff', textDecoration: 'none' }} onMouseEnter={(e) => e.currentTarget.style.color = '#2a8ded'} onMouseLeave={(e) => e.currentTarget.style.color = '#ffffff'}>Home</Link></li>
              <li style={{ marginTop: '0.8em' }}><Link href="/about" style={{ color: '#ffffff', textDecoration: 'none' }} onMouseEnter={(e) => e.currentTarget.style.color = '#2a8ded'} onMouseLeave={(e) => e.currentTarget.style.color = '#ffffff'}>About Us</Link></li>
              <li style={{ marginTop: '0.8em' }}><Link href="/services/depression" style={{ color: '#ffffff', textDecoration: 'none' }} onMouseEnter={(e) => e.currentTarget.style.color = '#2a8ded'} onMouseLeave={(e) => e.currentTarget.style.color = '#ffffff'}>Services</Link></li>
              <li style={{ marginTop: '0.8em' }}><Link href="/chat" style={{ color: '#ffffff', textDecoration: 'none' }} onMouseEnter={(e) => e.currentTarget.style.color = '#2a8ded'} onMouseLeave={(e) => e.currentTarget.style.color = '#ffffff'}>ChatBot</Link></li>
            </ul>
          </div>
          
          <div style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: '0 2em',
            minHeight: '15em'
          }}>
            <h3 style={{
              width: '100%',
              textAlign: 'left',
              color: '#2a8ded',
              fontSize: '1.6em',
              whiteSpace: 'nowrap',
              marginBottom: '1em'
            }}>
              Let Us Contact You
            </h3>
            <div style={{ marginBottom: '1em' }}>
              <input 
                type="email" 
                placeholder="Your email id here"
                style={{
                  fontSize: '1em',
                  padding: '1em',
                  width: '100%',
                  borderRadius: '5px',
                  marginBottom: '5px',
                  border: '1px solid #333',
                  backgroundColor: '#1e1e1e',
                  color: '#fff'
                }}
              />
              <button style={{
                fontSize: '1em',
                padding: '1em',
                width: '100%',
                borderRadius: '5px',
                backgroundColor: '#2a8ded',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer'
              }}>
                Reach out
              </button>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-around',
              fontSize: '2.4em',
              flexDirection: 'row',
              marginTop: '0.5em'
            }}>
              <i className="fab fa-facebook-square" style={{ cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.color = '#2a8ded'} onMouseLeave={(e) => e.currentTarget.style.color = '#fff'}></i>
              <i className="fab fa-instagram-square" style={{ cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.color = '#2a8ded'} onMouseLeave={(e) => e.currentTarget.style.color = '#fff'}></i>
              <i className="fab fa-twitter-square" style={{ cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.color = '#2a8ded'} onMouseLeave={(e) => e.currentTarget.style.color = '#fff'}></i>
            </div>
          </div>
        </div>
        
        <div style={{
          padding: '0.3em 1em',
          backgroundColor: '#25262e'
        }}>
          <p style={{
            fontSize: '0.9em',
            textAlign: 'center',
            color: 'burlywood',
            margin: 0
          }}>
            Copyright &copy; {new Date().getFullYear()} MyMental | All Rights Reserved
          </p>
        </div>
      </footer>
    </div>
  );
}

