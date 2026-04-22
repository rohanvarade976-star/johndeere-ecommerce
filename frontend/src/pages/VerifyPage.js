
import React,{useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
import {authAPI} from '../utils/api';
import toast from 'react-hot-toast';
export default function VerifyPage(){
  const {user,updateUser}=useAuth(); const navigate=useNavigate();
  const [otp,setOtp]=useState(''); const [loading,setL]=useState(false);
  const handle=async e=>{ e.preventDefault(); try{setL(true);await authAPI.verifyOTP({otp});updateUser({email_verified:true});toast.success('Email verified successfully!');navigate('/');}catch(err){toast.error(err.response?.data?.message||'Invalid or expired OTP.');}finally{setL(false);} };
  const resend=async()=>{ try{await authAPI.resendOTP();toast.success('New OTP sent to your email!');}catch{toast.error('Failed to resend OTP.');} };
  return(
    <div style={{background:'var(--gray-100)',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <div style={{width:'100%',maxWidth:420,background:'white',borderRadius:16,padding:'40px 32px',boxShadow:'var(--shadow-xl)',border:'1px solid var(--gray-200)',textAlign:'center'}}>
        <div style={{width:72,height:72,background:'var(--jd-green-pale)',borderRadius:20,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px',fontSize:36}}>📧</div>
        <h2 style={{fontSize:22,fontWeight:900,color:'var(--jd-green-dark)',marginBottom:8}}>Verify Your Email</h2>
        <p style={{color:'var(--gray-500)',fontSize:14,lineHeight:1.6,marginBottom:28}}>
          We sent a 6-digit verification code to <strong style={{color:'var(--jd-green-dark)'}}>{user?.email||'your email'}</strong>. Enter it below to activate your account.
        </p>
        <form onSubmit={handle}>
          <input type="text" inputMode="numeric" maxLength={6} value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,''))} placeholder="000000"
            style={{width:'100%',padding:'16px',border:'2px solid var(--gray-200)',borderRadius:12,fontSize:28,textAlign:'center',outline:'none',letterSpacing:14,fontWeight:900,marginBottom:20,fontFamily:'inherit',transition:'border 0.2s'}}
            onFocus={e=>e.target.style.borderColor='var(--jd-green)'} onBlur={e=>e.target.style.borderColor='var(--gray-200)'}/>
          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading||otp.length!==6}>{loading?'Verifying…':'Verify Email'}</button>
        </form>
        <div style={{marginTop:20}}>
          <button onClick={resend} style={{background:'none',border:'none',color:'var(--jd-green)',cursor:'pointer',fontSize:14,fontWeight:600,fontFamily:'inherit'}}>Didn't receive it? Resend OTP</button>
          <p style={{color:'var(--gray-400)',fontSize:12,marginTop:6}}>Check your spam folder if not received within 2 minutes</p>
        </div>
      </div>
    </div>
  );
}
