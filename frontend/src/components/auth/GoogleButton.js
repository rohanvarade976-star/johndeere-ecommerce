
import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { authAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function GoogleButton({ text = 'Continue with Google', onDone, onError }) {
  const { updateUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        // Get user info from Google
        const infoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        });
        const userInfo = await infoRes.json();
        // Send to our backend
        const res = await authAPI.googleAuth({
          credential: tokenResponse.access_token,
          userInfo
        });
        const { token, user } = res.data;
        localStorage.setItem('jd_token', token);
        localStorage.setItem('jd_user', JSON.stringify(user));
        updateUser(user);
        onDone && onDone(user);
      } catch (err) {
        onError && onError(err);
      } finally {
        setLoading(false);
      }
    },
    onError: (err) => { setLoading(false); onError && onError(err); }
  });

  return (
    <button
      type="button"
      onClick={() => { setLoading(true); googleLogin(); }}
      disabled={loading}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: '12px 16px',
        background: 'white',
        border: '2px solid var(--gray-200)',
        borderRadius: 10,
        fontSize: 15,
        fontWeight: 600,
        cursor: loading ? 'not-allowed' : 'pointer',
        color: '#374151',
        transition: 'all 0.15s',
        fontFamily: 'inherit',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        opacity: loading ? 0.6 : 1,
      }}
      onMouseEnter={e => { if (!loading) { e.currentTarget.style.borderColor = '#9ca3af'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'; } }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--gray-200)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
      {loading ? 'Connecting to Google…' : text}
    </button>
  );
}
