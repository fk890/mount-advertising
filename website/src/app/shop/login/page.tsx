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
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (searchParams?.get('signup') === 'true') {
      setIsRegister(true);
    }
  }, [searchParams]);

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
