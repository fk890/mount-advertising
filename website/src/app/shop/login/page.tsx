'use client'

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './login.module.scss';

function LoginContent() {
  const searchParams = useSearchParams();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (searchParams?.get('signup') === 'true') {
      setIsRegister(true);
    }
    // Handle errors from OAuth callback
    const errorParam = searchParams?.get('error');
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  }, [searchParams]);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/google');
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Failed to start Google login');
        setGoogleLoading(false);
      }
    } catch (err) {
      console.error('Google login error:', err);
      setError('Failed to connect to Google. Please try again.');
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isRegister) {
        const registerResponse = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, firstName, lastName }),
        });

        const registerData = await registerResponse.json();
        if (!registerResponse.ok) {
          throw new Error(registerData.error || 'Registration failed');
        }
        
        if (registerData.needsEmailConfirmation) {
          setError('Please confirm your email address before logging in.');
          setIsRegister(false);
          return;
        }

        localStorage.setItem('user', JSON.stringify({
          id: registerData.user.id,
          email: registerData.user.email,
          firstName: registerData.user.firstName,
          lastName: registerData.user.lastName,
          token: registerData.token
        }));

        router.push('/shop/account');
      } else {
        const loginResponse = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const loginData = await loginResponse.json();
        if (!loginResponse.ok) {
          throw new Error(loginData.error || 'Login failed');
        }

        localStorage.setItem('user', JSON.stringify({
          id: loginData.user.id,
          email: loginData.user.email,
          firstName: loginData.user.firstName,
          lastName: loginData.user.lastName,
          token: loginData.token
        }));

        router.push('/shop/account');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div>
          <h2 className={styles.title} style={{ fontFamily: "var(--font-basement-grotesque)" }}>
            {isRegister ? 'Create Account' : 'Login'}
          </h2>
          <p className={styles.subtitle}>
            {isRegister ? 'Join us to explore amazing products' : 'Please enter your e-mail and password:'}
          </p>
        </div>

        {error && <div className={styles.errorBox}>{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          {isRegister && (
            <div className={styles.nameGrid}>
              <input 
                type="text" 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required 
                autoComplete="given-name"
                className={styles.input}
                placeholder="First name" 
              />
              <input 
                type="text" 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required 
                autoComplete="family-name"
                className={styles.input}
                placeholder="Last name" 
              />
            </div>
          )}

          <input 
            type="email" 
            autoComplete="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
            className={styles.input}
            placeholder="E-mail" 
          />

          <div className={styles.passwordWrapper}>
            <input 
              type="password" 
              autoComplete={isRegister ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              className={`${styles.input} ${styles.passwordInput}`}
              placeholder="Password" 
            />
            {!isRegister && (
              <Link 
                href="/shop/forgot-password" 
                className={styles.forgotLink}
              >
                Forgot password?
              </Link>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Login'}
          </button>
        </form>

        {/* Divider */}
        <div className={styles.divider || "flex items-center my-5"}>
          <div className="flex-1 h-px bg-gray-700"></div>
          <span className="px-3 text-sm text-gray-500">or</span>
          <div className="flex-1 h-px bg-gray-700"></div>
        </div>

        {/* Google Login Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="w-full py-3 px-4 rounded-lg bg-white text-gray-800 font-medium flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          {googleLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-800"></div>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          {googleLoading ? 'Connecting...' : 'Continue with Google'}
        </button>

        <div className={styles.footer}>
          <p>
            {isRegister ? 'Already have an account?' : 'New customer?'}{' '}
            <button
              onClick={() => setIsRegister(!isRegister)}
              className={styles.toggleButton}
            >
              {isRegister ? 'Login' : 'Create an account'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><div className="text-white">Loading...</div></div>}>
      <LoginContent />
    </Suspense>
  );
}
