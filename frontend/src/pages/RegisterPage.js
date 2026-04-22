
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import GoogleButton from '../components/auth/GoogleButton';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setF]     = useState({ name:'', email:'', password:'', role:'customer', phone:'' });
  const [loading, setL]  = useState(false);
  const [showPwd, setShow] = useState(false);
  const [error, setError]  = useState('');

  const handleSubmit = async e => {
    e.preventDefault(); setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    try {
      setL(true);
      await register(form);
      toast.success('Account created! Please verify your email.');
      navigate('/verify-email');
    } catch (err) { setError(err.response?.data?.message || 'Registration failed.'); }
    finally { setL(false); }
  };

  const handleGoogleDone = user => {
    toast.success(`Account created! Welcome, ${user.name.split(' ')[0]}!`);
    navigate('/');
  };

  const iStyle = { width:'100%', padding:'12px 14px 12px 42px', border:'2px solid var(--gray-200)', borderRadius:10, fontSize:15, outline:'none', transition:'border 0.2s', fontFamily:'inherit', color:'var(--black)', background:'white' };
  const onFocus = e => e.target.style.borderColor = 'var(--jd-green)';
  const onBlur  = e => e.target.style.borderColor = 'var(--gray-200)';

  return (
    <div style={{ background:'var(--gray-100)', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:24, paddingTop:40, paddingBottom:40 }}>
      <div style={{ width:'100%', maxWidth:500 }}>

        <div style={{ textAlign:'center', marginBottom:24 }}>
          <div style={{ width:60, height:60, background:'var(--jd-green-dark)', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px', boxShadow:'0 6px 20px rgba(26,92,26,0.3)' }}>
            <div style={{ width:42, height:42, background:'var(--jd-yellow)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:16, color:'var(--jd-green-dark)' }}>JD</div>
          </div>
          <h1 style={{ fontSize:26, fontWeight:900, color:'var(--jd-green-dark)', marginBottom:4 }}>Create Account</h1>
          <p style={{ color:'var(--gray-500)', fontSize:14 }}>John Deere E-Commerce Parts Diagram System</p>
        </div>

        <div style={{ background:'white', borderRadius:18, padding:'28px', boxShadow:'var(--shadow-xl)', border:'1px solid var(--gray-200)' }}>

          <GoogleButton
            text="Sign up with Google"
            onDone={handleGoogleDone}
            onError={() => toast.error('Google sign-up failed. Try email.')}
          />
          <div style={{ display:'flex', alignItems:'center', gap:12, margin:'20px 0' }}>
            <div style={{ flex:1, height:1, background:'var(--gray-200)' }}/>
            <span style={{ fontSize:13, color:'var(--gray-400)', fontWeight:500 }}>or register with email</span>
            <div style={{ flex:1, height:1, background:'var(--gray-200)' }}/>
          </div>

          {error && <div style={{ background:'var(--red-light)', color:'var(--red)', padding:'10px 14px', borderRadius:8, fontSize:14, marginBottom:16, fontWeight:500 }}>⚠️ {error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
              <div>
                <label style={{ display:'block', fontWeight:600, fontSize:14, color:'var(--gray-700)', marginBottom:6 }}>Full Name</label>
                <div style={{ position:'relative' }}>
                  <FiUser size={15} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'var(--gray-400)', pointerEvents:'none' }}/>
                  <input type="text" required value={form.name} placeholder="Your full name" onChange={e=>setF(f=>({...f,name:e.target.value}))} style={iStyle} onFocus={onFocus} onBlur={onBlur}/>
                </div>
              </div>
              <div>
                <label style={{ display:'block', fontWeight:600, fontSize:14, color:'var(--gray-700)', marginBottom:6 }}>Phone (Optional)</label>
                <div style={{ position:'relative' }}>
                  <FiPhone size={15} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'var(--gray-400)', pointerEvents:'none' }}/>
                  <input type="tel" value={form.phone} placeholder="10-digit number" onChange={e=>setF(f=>({...f,phone:e.target.value}))} style={iStyle} onFocus={onFocus} onBlur={onBlur}/>
                </div>
              </div>
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontWeight:600, fontSize:14, color:'var(--gray-700)', marginBottom:6 }}>Email Address</label>
              <div style={{ position:'relative' }}>
                <FiMail size={15} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'var(--gray-400)', pointerEvents:'none' }}/>
                <input type="email" required value={form.email} placeholder="you@email.com" onChange={e=>setF(f=>({...f,email:e.target.value}))} style={iStyle} onFocus={onFocus} onBlur={onBlur}/>
              </div>
            </div>
            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontWeight:600, fontSize:14, color:'var(--gray-700)', marginBottom:6 }}>Password</label>
              <div style={{ position:'relative' }}>
                <FiLock size={15} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'var(--gray-400)', pointerEvents:'none' }}/>
                <input type={showPwd?'text':'password'} required value={form.password} placeholder="Min. 6 characters" onChange={e=>setF(f=>({...f,password:e.target.value}))} style={{...iStyle,paddingRight:44}} onFocus={onFocus} onBlur={onBlur}/>
                <button type="button" onClick={()=>setShow(s=>!s)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--gray-400)', cursor:'pointer', display:'flex' }}>
                  {showPwd?<FiEyeOff size={15}/>:<FiEye size={15}/>}
                </button>
              </div>
            </div>
            <div style={{ marginBottom:22 }}>
              <label style={{ display:'block', fontWeight:600, fontSize:14, color:'var(--gray-700)', marginBottom:8 }}>Account Type</label>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {[['customer','🧑‍🌾 Customer','Farmer / Equipment Owner'],['dealer','🔧 Dealer','Service Technician']].map(([val,title,sub])=>(
                  <label key={val} style={{ border:`2px solid ${form.role===val?'var(--jd-green)':'var(--gray-200)'}`, borderRadius:10, padding:'12px 14px', cursor:'pointer', background:form.role===val?'var(--jd-green-pale)':'white', transition:'all 0.15s' }}>
                    <input type="radio" name="role" value={val} checked={form.role===val} onChange={()=>setF(f=>({...f,role:val}))} style={{ display:'none' }}/>
                    <div style={{ fontWeight:700, fontSize:14, color:form.role===val?'var(--jd-green-dark)':'var(--gray-700)' }}>{title}</div>
                    <div style={{ fontSize:11, color:'var(--gray-400)', marginTop:2 }}>{sub}</div>
                  </label>
                ))}
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading} style={{ fontWeight:700 }}>
              {loading ? 'Creating Account…' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:18, fontSize:14, color:'var(--gray-500)' }}>
            Already have an account? <Link to="/login" style={{ color:'var(--jd-green)', fontWeight:700 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
