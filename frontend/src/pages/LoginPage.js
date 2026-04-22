
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import GoogleButton from '../components/auth/GoogleButton';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setF]     = useState({ email: '', password: '' });
  const [loading, setL]  = useState(false);
  const [showPwd, setShow] = useState(false);
  const [error, setError]  = useState('');

  const handleSubmit = async e => {
    e.preventDefault(); setError('');
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    try {
      setL(true);
      const u = await login(form.email, form.password);
      toast.success(`Welcome back, ${u.name.split(' ')[0]}!`);
      navigate(u.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally { setL(false); }
  };

  const handleGoogleDone = user => {
    toast.success(`Welcome, ${user.name.split(' ')[0]}!`);
    navigate(user.role === 'admin' ? '/admin' : '/');
  };

  const iStyle = {
    width:'100%', padding:'12px 14px 12px 42px',
    border:'2px solid var(--gray-200)', borderRadius:10,
    fontSize:15, outline:'none', transition:'border 0.2s',
    fontFamily:'inherit', color:'var(--black)', background:'white',
  };

  return (
    <div style={{ background:'var(--gray-100)', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ width:'100%', maxWidth:440 }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ width:60, height:60, background:'var(--jd-green-dark)', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px', boxShadow:'0 6px 20px rgba(26,92,26,0.3)' }}>
            <div style={{ width:42, height:42, background:'var(--jd-yellow)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:16, color:'var(--jd-green-dark)', letterSpacing:-0.5 }}>JD</div>
          </div>
          <h1 style={{ fontSize:26, fontWeight:900, color:'var(--jd-green-dark)', marginBottom:4 }}>Welcome Back</h1>
          <p style={{ color:'var(--gray-500)', fontSize:14 }}>John Deere E-Commerce Parts Diagram System</p>
        </div>

        <div style={{ background:'white', borderRadius:18, padding:'32px 28px', boxShadow:'var(--shadow-xl)', border:'1px solid var(--gray-200)' }}>

          {/* Google Sign-In */}
          <GoogleButton
            text="Sign in with Google"
            onDone={handleGoogleDone}
            onError={() => toast.error('Google sign-in failed. Try email instead.')}
          />

          {/* Divider */}
          <div style={{ display:'flex', alignItems:'center', gap:12, margin:'20px 0' }}>
            <div style={{ flex:1, height:1, background:'var(--gray-200)' }}/>
            <span style={{ fontSize:13, color:'var(--gray-400)', fontWeight:500 }}>or sign in with email</span>
            <div style={{ flex:1, height:1, background:'var(--gray-200)' }}/>
          </div>

          {error && (
            <div style={{ background:'var(--red-light)', color:'var(--red)', padding:'10px 14px', borderRadius:8, fontSize:14, marginBottom:18, fontWeight:500, display:'flex', gap:8, alignItems:'center' }}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontWeight:600, fontSize:14, color:'var(--gray-700)', marginBottom:6 }}>Email Address</label>
              <div style={{ position:'relative' }}>
                <FiMail size={16} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'var(--gray-400)', pointerEvents:'none' }}/>
                <input type="email" required value={form.email} placeholder="you@email.com"
                  onChange={e => setF(f => ({...f, email:e.target.value}))}
                  style={iStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--jd-green)'}
                  onBlur={e => e.target.style.borderColor = 'var(--gray-200)'}
                />
              </div>
            </div>
            <div style={{ marginBottom:24 }}>
              <label style={{ display:'block', fontWeight:600, fontSize:14, color:'var(--gray-700)', marginBottom:6 }}>Password</label>
              <div style={{ position:'relative' }}>
                <FiLock size={16} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'var(--gray-400)', pointerEvents:'none' }}/>
                <input type={showPwd ? 'text' : 'password'} required value={form.password} placeholder="Enter your password"
                  onChange={e => setF(f => ({...f, password:e.target.value}))}
                  style={{ ...iStyle, paddingRight:44 }}
                  onFocus={e => e.target.style.borderColor = 'var(--jd-green)'}
                  onBlur={e => e.target.style.borderColor = 'var(--gray-200)'}
                />
                <button type="button" onClick={() => setShow(s => !s)}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--gray-400)', cursor:'pointer', display:'flex', padding:2 }}>
                  {showPwd ? <FiEyeOff size={16}/> : <FiEye size={16}/>}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading} style={{ fontWeight:700 }}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:20, fontSize:14, color:'var(--gray-500)' }}>
            Don't have an account? <Link to="/register" style={{ color:'var(--jd-green)', fontWeight:700 }}>Create one free</Link>
          </p>

          {/* Demo box */}
          <div style={{ marginTop:20, padding:'14px 16px', background:'var(--jd-green-pale)', borderRadius:12, border:'1px solid rgba(54,124,43,0.2)' }}>
            <div style={{ fontSize:13, fontWeight:700, color:'var(--jd-green-dark)', marginBottom:6 }}>🔑 Demo Credentials</div>
            <div style={{ fontSize:12.5, color:'var(--gray-600)', lineHeight:1.8, fontFamily:'monospace' }}>
              <div><strong>Admin:</strong> admin@johndeere-parts.com</div>
              <div><strong>Customer:</strong> customer@example.com</div>
              <div><strong>Password:</strong> Password@123</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
