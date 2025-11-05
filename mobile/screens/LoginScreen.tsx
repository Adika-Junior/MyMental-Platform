import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ImageBackground, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Poppins_700Bold, Poppins_600SemiBold, Poppins_400Regular } from '@expo-google-fonts/poppins';

type Props = { onLoggedIn: () => void };

export default function LoginScreen({ onLoggedIn }: Props) {
  const [fontsLoaded] = useFonts({ Poppins_700Bold, Poppins_600SemiBold, Poppins_400Regular });
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  const onSubmit = async () => {
    setError(null);
    if (!username.trim() || !password.trim() || (mode === 'signup' && !email.trim())) {
      setError('Enter username and password');
      return;
    }
    setLoading(true);
    
    // Simulate login - replace with actual API call
    setTimeout(() => {
      setLoading(false);
      onLoggedIn();
    }, 1000);
  };

  // Fallback background color if image fails
  const bgStyle = { flex: 1, justifyContent: 'center' as const };
  
  try {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ImageBackground 
          source={require('../assets/images/signin_image.jpg')} 
          style={bgStyle} 
          imageStyle={{ opacity: 0.65 }}
        >
          <LinearGradient 
            colors={["rgba(147,51,234,0.15)", "rgba(8,145,178,0.15)"]} 
            start={{ x: 0, y: 0 }} 
            end={{ x: 1, y: 1 }} 
            style={StyleSheet.absoluteFillObject}
          />
          <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' }} />
          {/* Removed top blue header bar per request */}

          {/* Login Card */}
          <View style={styles.container}>
            <View style={styles.card}>
              <Image 
                source={require('../assets/images/mmental_logo.png')} 
                style={styles.logo} 
                resizeMode="contain" 
              />
              <Text style={[styles.brand, fontsLoaded && { fontFamily: 'Poppins_700Bold' }]}>MYMENTAL</Text>
              <Text style={[styles.title, fontsLoaded && { fontFamily: 'Poppins_700Bold' }]}>
                {mode === 'login' ? 'Welcome back' : 'Create your account'}
              </Text>
              <Text style={[styles.subtitle, fontsLoaded && { fontFamily: 'Poppins_400Regular' }]}>
                {mode === 'login' ? 'Sign in to continue your journey' : 'Join and start your journey'}
              </Text>
              
              <View style={styles.inputWrap}>
                <TextInput
                  placeholder="Username"
                  placeholderTextColor="#a7b0bb"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  style={[styles.input, fontsLoaded && { fontFamily: 'Poppins_400Regular' }]}
                />
                {mode === 'signup' && (
                  <TextInput
                    placeholder="Email"
                    placeholderTextColor="#a7b0bb"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={[styles.input, fontsLoaded && { fontFamily: 'Poppins_400Regular' }]}
                  />
                )}
                <TextInput
                  placeholder="Password"
                  placeholderTextColor="#a7b0bb"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  style={[styles.input, fontsLoaded && { fontFamily: 'Poppins_400Regular' }]}
                />
                
                {error ? <Text style={[styles.error, fontsLoaded && { fontFamily: 'Poppins_600SemiBold' }]}>{error}</Text> : null}
                
                <LinearGradient 
                  colors={["#9333ea", "#0891b2"]} 
                  start={{ x: 0, y: 0 }} 
                  end={{ x: 1, y: 0 }} 
                  style={styles.button}
                >
                  <TouchableOpacity 
                    onPress={onSubmit} 
                    disabled={loading} 
                    style={styles.buttonInner}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={[styles.buttonText, fontsLoaded && { fontFamily: 'Poppins_600SemiBold' }]}>
                        {mode === 'login' ? 'Sign In' : 'Create Account'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </LinearGradient>
                
                <TouchableOpacity 
                  onPress={() => { 
                    setMode(mode === 'login' ? 'signup' : 'login'); 
                    setError(null); 
                  }}
                >
                  <Text style={[styles.switchText, fontsLoaded && { fontFamily: 'Poppins_600SemiBold' }]}>
                    {mode === 'login' 
                      ? "Don't have an account? Create one" 
                      : 'Already have an account? Sign in'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ImageBackground>
      </SafeAreaView>
    );
  } catch (e) {
    // Fallback if images fail to load
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0891b2' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 20 }}>
            MYMENTAL
          </Text>
          <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 20, width: '90%' }}>
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 10 }}>Welcome</Text>
            <TextInput
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 10 }}
            />
            <TextInput
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 10 }}
            />
            <TouchableOpacity 
              onPress={onSubmit}
              style={{ backgroundColor: '#0891b2', borderRadius: 8, padding: 12, alignItems: 'center' }}
            >
              <Text style={{ color: 'white', fontWeight: '600' }}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    position: 'relative',
    zIndex: 2,
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 16,
    overflow: 'hidden',
    padding: 20,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 420,
    gap: 10,
  },
  logo: {
    width: 140,
    height: 140,
    alignSelf: 'center',
    marginBottom: 8,
  },
  brand: {
    textAlign: 'center',
    fontWeight: '800',
    letterSpacing: 2,
    color: '#0f172a',
    marginTop: -8,
    marginBottom: 6,
    fontSize: 18,
  },
  title: {
    fontSize: 22,
    color: '#0f172a',
    textAlign: 'center',
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    color: '#334155',
    textAlign: 'center',
    marginBottom: 12,
  },
  inputWrap: {
    gap: 10,
  },
  input: {
    backgroundColor: '#f1f5f9',
    borderColor: '#cbd5e1',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    color: '#0f172a',
  },
  button: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0891b2',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 3,
  },
  buttonInner: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  error: {
    color: '#b91c1c',
    fontSize: 12,
    textAlign: 'center',
  },
  switchText: {
    color: '#0891b2',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
});
