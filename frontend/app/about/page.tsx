'use client';

import Link from 'next/link';
import ResponsiveHeader from '@/components/ResponsiveHeader';

export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen" style={{ marginTop: 0, paddingTop: 0 }}>
      {/* Responsive Header - Same as Home Page */}
      <ResponsiveHeader />

      {/* About Content */}
      <section className="mt-20 p-12" style={{ 
        marginTop: '100px',
        padding: '3rem 2rem'
      }}>
        <div className="text-center mb-12">
          <h3 style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 'bold',
            background: 'linear-gradient(to right, #b121f3, #44eee0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            color: 'transparent'
          }}>
            About Us
          </h3>
        </div>

        <div style={{ 
          marginBottom: '3rem', 
          fontSize: '18px', 
          lineHeight: '1.8',
          maxWidth: '800px',
          margin: '0 auto 3rem auto',
          padding: '0 2rem'
        }}>
          <p style={{ marginBottom: '1.5rem' }}>
            MyMental Chat Bot – your companion for mental wellness. Our AI-driven chatbot is designed to provide you with support, guidance, and information whenever you need it. It's private, accessible 24/7, and tailored to help you manage your mental health.
          </p>
          <p style={{ marginBottom: '1.5rem' }}>
            Our Mental Health Chat Bot utilizes advanced AI technology to offer empathetic, confidential, and informed support. It's a space where you can express your thoughts and feelings without judgment. The chatbot is programmed to understand a wide range of mental health issues and provide appropriate responses and resources.
          </p>
          <p>
            Your privacy is our top priority. Conversations with the chatbot are confidential and secure. The chatbot is designed to respect user privacy and ensure data security.
          </p>
        </div>

        {/* Our Mission */}
        <div style={{
          maxWidth: '900px',
          margin: '0 auto 3rem auto',
          padding: '2rem',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderRadius: '15px',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          gap: '2rem',
          alignItems: 'flex-start'
        }}>
          <div>
            <img 
              src="/images/our-mission.png" 
              alt="Our Mission" 
              style={{
                width: '150px',
                height: '150px',
                objectFit: 'contain'
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{
              fontSize: '1.8rem',
              fontWeight: 'bold',
              color: '#8d1eaf',
              marginBottom: '1rem'
            }}>
              Our Mission
            </h3>
            <p style={{
              fontSize: '18px',
              lineHeight: '1.8',
              color: '#000'
            }}>
              Our Mission is to provide a safe, accessible, and understanding digital space where young people can express their feelings, thoughts, and concerns. Through empathetic and informed conversation, the chatbot aims to offer emotional support, practical advice, and guidance on mental health matters. It seeks to empower youths to understand and manage their mental well-being, promote self-awareness, and connect them with professional resources when needed. The chatbot is dedicated to being a non-judgmental, confidential, and always-available companion in the journey towards a healthier, more resilient mental state.
            </p>
          </div>
        </div>

        {/* Our Vision */}
        <div style={{
          maxWidth: '900px',
          margin: '0 auto 3rem auto',
          padding: '2rem',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderRadius: '15px',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          gap: '2rem',
          alignItems: 'flex-start'
        }}>
          <div>
            <img 
              src="/images/our-vision.png" 
              alt="Our Vision" 
              style={{
                width: '150px',
                height: '150px',
                objectFit: 'contain'
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{
              fontSize: '1.8rem',
              fontWeight: 'bold',
              color: '#8d1eaf',
              marginBottom: '1rem'
            }}>
              Our Vision
            </h3>
            <p style={{
              fontSize: '18px',
              lineHeight: '1.8',
              color: '#000'
            }}>
              Our vision is to create a world where every young person has immediate access to mental health support, free from stigma and barriers. We envision a future where our chatbot serves as a trusted companion and guide, helping youths navigate the complex emotional landscapes of their formative years. By leveraging cutting-edge technology and psychological insights, we aim to foster resilience, self-understanding, and emotional well-being in the youth community. Our ultimate goal is to cultivate a generation that is mentally stronger, more empathetic, and better equipped to handle life's challenges, contributing to a healthier, more compassionate society.
            </p>
          </div>
        </div>
      </section>

      {/* Footer - Matching Home Page Styles */}
      <footer style={{
        backgroundColor: '#121315',
        color: '#ffffff',
        fontSize: '16px',
        marginTop: '2%'
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
              Our Mental Health Chat Bot utilizes advanced AI technology to offer empathetic, confidential, and informed support. It's a space where you can express your thoughts and feelings without judgment. The chatbot is programmed to understand a wide range of mental health issues and provide appropriate responses and resources.
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
              <li style={{ marginTop: '0.8em' }}><Link href="/#services" style={{ color: '#ffffff', textDecoration: 'none' }} onMouseEnter={(e) => e.currentTarget.style.color = '#2a8ded'} onMouseLeave={(e) => e.currentTarget.style.color = '#ffffff'}>Services</Link></li>
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
