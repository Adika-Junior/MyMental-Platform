'use client';

import Link from 'next/link';
import ResponsiveHeader from '@/components/ResponsiveHeader';
import Footer from '@/components/Footer';

export default function DepressionPage() {
  return (
    <div className="bg-white min-h-screen">
      <ResponsiveHeader />

      {/* Main Content - Reduced Side Spacing */}
      <section style={{ 
        marginTop: '100px', 
        padding: '2rem 5%',
        maxWidth: '1200px',
        margin: '100px auto 0 auto'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 id="depression-heading" style={{
            fontSize: '2rem',
            background: 'linear-gradient(to right, #b121f3, #44eee0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            color: 'transparent',
            fontWeight: 'bold'
          }}>
            Depression
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
            Since we all feel sad, moody or low from time to time, some people experience these emotions deeply, for long periods of time - weeks, months or even years and even for any identifiable reason. Depression is more than just a bad mood – a severe illness that affects your physical and mental health. Do check out other symptoms and facts about depression and learn how depression counselling by an experienced depression Chatbot can help, and find the right psychologist for depression here at MyMental.
          </p>

                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
                    <Link 
                      href="/chat" 
                      aria-label="Start a chat session about depression"
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

      {/* Know More Section - Reduced Side Spacing */}
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
          {/* Facts Card */}
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
              Facts about depression
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>1.</strong> Depressed people might not look depressed.</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>2.</strong> WHO considers depression to be a leading cause of disability worldwide.</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>3.</strong> Women are twice as likely as men to be diagnosed with depression.</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>4.</strong> Depression can increase the risk of developing other health issues.</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>5.</strong> A severe type of depression can cause you to hear, see or believe things that are not real</li>
            </ul>
          </div>

          {/* Causes Card */}
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
              Causes of depression
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>1.</strong> Grief - Sadness or grief from the death or loss of a loved one may increase the risk of depression.</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>2.</strong> Abuse - emotional, physical, sexual abuse can lead to depression.</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>3.</strong> Genetics - A family history of depression may increase the risk of depression.</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>4.</strong> Brain chemistry</li>
            </ul>
          </div>

          {/* Symptoms Card */}
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
              Symptoms of depression
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>1.</strong> Feelings of sadness, tearfulness, emptiness or hopelessness</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>2.</strong> Angry outbursts, irritability or frustration, even over small matters</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>3.</strong> Loss of interest or pleasure in most or all normal activities, such as sex, hobbies or sports</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>4.</strong> Ideas of guilt and unworthiness</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>5.</strong> Reduced appetite and weight loss or increased cravings for food and weight gain</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>6.</strong> Frequent or recurrent thoughts of death, suicidal thoughts, suicide attempts or suicide</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>7.</strong> Disturbed sleep & Diminished appetite</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>8.</strong> Forgetfulness</li>
            </ul>
          </div>

          {/* Treatments Card */}
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
              04
            </div>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: '#1f2937',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              Treatments for depression
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>1.</strong> Psychotherapy - Talk therapy with mental health professionals</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>2.</strong> Medication - Antidepressants prescribed by doctors</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>3.</strong> Lifestyle changes - Exercise, proper diet, and sleep</li>
              <li style={{ marginBottom: '0.5rem', fontSize: '17px' }}><strong>4.</strong> Support groups - Connecting with others going through similar experiences</li>
            </ul>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

