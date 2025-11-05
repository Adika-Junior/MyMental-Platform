'use client';

import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/Footer';
import { useEffect, useState } from 'react';
import ResponsiveHeader from '@/components/ResponsiveHeader';
import { useWindowSize } from '@/hooks/useWindowSize';

const sliderImages = [
  '/images/image 3.jpg',
  '/images/image 2.jpg',
  '/images/image 1.jpg',
] as const;

const SLIDER_COUNT = sliderImages.length;

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { width } = useWindowSize();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDER_COUNT);
    }, 4000);

    return () => clearInterval(interval);
  }, [SLIDER_COUNT]);

  // Calculate hero section height based on header height
  const headerHeight = width < 640 ? '12vh' : '15vh';
  const heroMarginTop = width < 640 ? '12vh' : '15vh';

  return (
    <div className="bg-white min-h-screen" style={{ marginTop: 0, paddingTop: 0 }}>
      {/* Responsive Header with Screen Size Detection */}
      <ResponsiveHeader />

      {/* Hero Slider - Full Width Images Only */}
      <section id="home" className="relative overflow-hidden bg-gray-900" style={{
        marginTop: heroMarginTop,
        height: `calc(100vh - ${headerHeight})`,
        minHeight: width < 640 ? 'calc(100vh - 70px)' : 'calc(100vh - 80px)',
        width: '100%',
        position: 'relative'
      }}>
        {sliderImages.map((img, index) => (
          <div
            key={index}
            className="absolute inset-0"
            style={{
              opacity: index === currentSlide ? 1 : 0,
              transition: 'opacity 1.5s ease-in-out, transform 1.5s ease-in-out',
              transform: index === currentSlide ? 'scale(1)' : 'scale(1.05)',
              zIndex: index === currentSlide ? 10 : 0,
              pointerEvents: 'none',
              width: '100%',
              height: '100%'
            }}
          >
            <img
              src={img}
              alt={`Mental Health Support ${index + 1}`}
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover',
                objectPosition: 'center',
                display: 'block',
                minWidth: '100%',
                minHeight: '100%',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                aspectRatio: 'auto'
              }}
            />
          </div>
        ))}
        
        {/* Slider Indicator Dots */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-3">
          {sliderImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`transition-all duration-300 rounded-full border-2 border-white cursor-pointer ${
                idx === currentSlide ? 'bg-white w-8 h-3' : 'bg-transparent w-3 h-3 hover:bg-white/50'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
              style={{ outline: 'none' }}
            />
          ))}
        </div>
      </section>

      {/* About Section - Fixed Layout */}
      <section id="about" style={{
        width: '90%',
        marginLeft: '5%',
        marginTop: '50px',
        marginBottom: '50px',
        backgroundImage: 'url(/images/about-bg.jpg)',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
        minHeight: '70vh',
        position: 'relative',
        overflow: 'visible',
        paddingBottom: '50px'
      }}>
        {/* Logo Container - Moved a Bit to the Right with Text Positioned */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          marginTop: '5%',
          marginLeft: '-7%',
          position: 'relative'
        }}>
          <img 
            src="/images/mymental_logo.png" 
            alt="MYMENTAL"
            style={{
              width: '40vw',
              maxWidth: '350px',
              height: 'auto',
              objectFit: 'contain',
              display: 'block'
            }}
          />
          <h3 style={{
            marginTop: '-130px',
            marginLeft: '105px',
            fontSize: '1.8rem',
            background: 'linear-gradient(to right, #b121f3, #44eee0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            color: 'transparent',
            fontWeight: 'bold',
            whiteSpace: 'nowrap'
          }}>
            MYMENTAL
          </h3>
        </div>
        
        {/* Info Container - Full Message Visible */}
        <div style={{
          marginLeft: width < 1024 ? '20%' : '23%',
          marginTop: '0%',
          position: 'absolute',
          width: width < 1024 ? '70%' : '64vw',
          top: '5%',
          right: '5%'
        }}>
          <p style={{
            fontSize: '18px',
            color: '#000000',
            lineHeight: '1.8'
          }}>
            Welcome to our MyMental Chat Bot – your companion for mental wellness. Our AI-driven chatbot is designed to provide you with support, guidance, and information whenever you need it. It's private, accessible 24/7, and tailored to help you manage your mental health.
            <br /><br />
            Our Mental Health Chat Bot utilizes advanced AI technology to offer empathetic, confidential, and informed support. It's a space where you can express your thoughts and feelings without judgment. The chatbot is programmed to understand a wide range of mental health issues and provide appropriate responses and resources.
            <br /><br />
            Your privacy is our top priority. Conversations with the chatbot are confidential and secure. The chatbot is designed to respect user privacy and ensure data security.{' '}
            <Link 
              href="/about"
              style={{
                display: 'inline-block',
                marginTop: '20px',
                padding: '12px 30px',
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#fff',
                backgroundColor: 'rgb(225, 6, 43)',
                border: 'none',
                borderRadius: '25px',
                textDecoration: 'none',
                boxShadow: '0 4px 15px rgba(225, 6, 43, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#ff6b35';
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(225, 6, 43, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgb(225, 6, 43)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(225, 6, 43, 0.3)';
              }}
            >
              Read more →
            </Link>
          </p>
        </div>
      </section>

      {/* Did You Know Section - 3 Cards in a Row */}
      <section className="w-full py-8 bg-white" style={{ marginTop: '3%' }}>
        <h1 style={{
          color: '#cf23aa',
          textAlign: 'center',
          marginTop: '3%',
          marginBottom: '2%',
          fontWeight: 'bold',
          fontSize: 'clamp(1.5rem, 4vw, 2.5rem)'
        }}>
          Did You Know?
        </h1>
        <div style={{
          display: 'grid',
          gridTemplateColumns: width < 640 ? '1fr' : width < 1024 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
          gap: '25px',
          padding: '0 3%',
          marginTop: '2%',
          marginBottom: '4%',
          width: '94%',
          maxWidth: '1400px',
          margin: '2% auto 4% auto'
        }}>
          {[
            { src: '/images/did you know 1.jpg', alt: 'Mental Health Facts' },
            { src: '/images/did you know 2.jpg', alt: 'Mental Health Awareness' },
            { src: '/images/did you know 3.png', alt: 'Mental Health Support' },
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                width: '100%',
                height: '250px',
                overflow: 'hidden',
                boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                backgroundColor: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <img
                src={item.src}
                alt={item.alt}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  display: 'block'
                }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Services Section - Matching Old Code Card Styles with Better Bottom Margin */}
      <section id="services" className="w-full py-16 bg-gray-50" style={{ marginBottom: '50px' }}>
        <div className="container mx-auto px-4" style={{ maxWidth: '95%' }}>
          <h2 style={{
            textAlign: 'center',
            marginBottom: '3%',
            color: '#2e77e4',
            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
            fontWeight: 'bold'
          }}>
            Our Services
          </h2>
          
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '1%',
            padding: '0 1em',
            marginBottom: '50px'
          }}>
            {[
              { title: 'DEPRESSION', link: '/services/depression', text: 'Depression (also known as major depression, major depressive disorder, or clinical depression) is a common but serious mood disorder. It causes severe symptoms that affect how a person feels, thinks, and handles daily activities, such as sleeping, eating, or working.' },
              { title: 'ADDICTION', link: '/services/addiction', text: 'Addiction Services support the provision of an integrated range of preventative, therapeutic and rehabilitation services to meet the diverse health and social care needs of our service users in an accountable, accessible and equitable manner.' },
              { title: 'CAREER', link: '/services/career', text: 'Career Services helps students who have been spending most of their life learning to be able to learn through Job placement and skill development.' },
              { title: 'RELATIONSHIPS', link: '/services/relationships', text: 'Relationship counselling aims to improve the important relationships in your life and can take the form of couples or individual counselling.' },
              { title: 'FINANCIAL', link: '/services/financial', text: 'Financial counselling helps you manage your debts and get your finances back under control. Financial counsellors are skilled professionals who provide advice and support to people struggling with bills and debt.' },
            ].map((service, idx) => (
              <Link 
                href={service.link}
                key={idx} 
                style={{
                  width: width < 640 ? '100%' : width < 1024 ? '48%' : '19.2%',
                  minHeight: '350px',
                  marginBottom: '20px',
                  padding: '2em 1.5em',
                  backgroundImage: 'url(/images/about-bg.jpg)',
                  backgroundPosition: 'center',
                  backgroundSize: 'cover',
                  borderRadius: '5px',
                  boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  position: 'relative',
                  overflow: 'hidden',
                  textDecoration: 'none',
                  display: 'block'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  color: '#8d1eaf',
                  marginBottom: '15px',
                  transition: 'color 0.2s'
                }}>
                  {service.title}
                </h3>
                <p style={{
                  color: '#000000',
                  fontSize: '15px',
                  lineHeight: '1.6',
                  letterSpacing: '0.03em',
                  transition: 'color 0.2s'
                }}>
                  {service.text}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
