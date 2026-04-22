
import React,{useState,useEffect} from 'react';
import {Link} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
import {authAPI} from '../utils/api';
import toast from 'react-hot-toast';
export default function ProfilePage(){
  const {user,updateUser}=useAuth();
  const [form,setF]=useState({name:user?.name||'',phone:'',address:'',city:'',state:'',pincode:''}); const [saving,setS]=useState(false);
  useEffect(()=>{ authAPI.profile().then(r=>{ const u=r.data.user; setF({name:u.name||'',phone:u.phone||'',address:u.address||'',city:u.city||'',state:u.state||'',pincode:u.pincode||''}); }).catch(()=>{}); },[]);
  const save=async e=>{ e.preventDefault(); try{setS(true);await authAPI.update(form);updateUser({name:form.name});toast.success('Profile updated!');}catch{toast.error('Update failed.');}finally{setS(false);} };
  const inp={width:'100%',padding:'11px 14px',border:'2px solid #eee',borderRadius:9,fontSize:15,outline:'none',marginTop:5};
  const lbl={display:'block',fontWeight:600,fontSize:14,color:'#424242'};
  return(
    <div className="page"><div className="container" style={{maxWidth:560}}>
      <h1 className="section-title">My Profile</h1>
      <div className="card card-body">
        <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:24,padding:16,background:'#e8f5e9',borderRadius:12}}>
          <div style={{width:64,height:64,background:'#1a5c1a',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',color:'#ffde00',fontWeight:900,fontSize:26,flexShrink:0}}>{user?.name?.charAt(0).toUpperCase()}</div>
          <div>
            <div style={{fontWeight:900,fontSize:18,color:'#1a5c1a'}}>{user?.name}</div>
            <div style={{fontSize:14,color:'#757575'}}>{user?.email}</div>
            <div style={{display:'flex',gap:8,marginTop:4,flexWrap:'wrap'}}>
              <span style={{background:'#1a5c1a',color:'white',fontSize:11,padding:'2px 10px',borderRadius:20,fontWeight:700,textTransform:'uppercase'}}>{user?.role}</span>
              <span style={{background:user?.email_verified?'#e8f5e9':'#fff8e1',color:user?.email_verified?'#2e7d32':'#e65100',fontSize:11,padding:'2px 10px',borderRadius:20,fontWeight:700}}>{user?.email_verified?'✓ Verified':'⚠ Unverified'}</span>
            </div>
          </div>
        </div>
        <form onSubmit={save}>
          <div className="grid grid-2" style={{gap:14,marginBottom:14}}>
            <div><label style={lbl}>Full Name</label><input value={form.name} onChange={e=>setF(f=>({...f,name:e.target.value}))} style={inp}/></div>
            <div><label style={lbl}>Phone Number</label><input value={form.phone} onChange={e=>setF(f=>({...f,phone:e.target.value}))} style={inp}/></div>
          </div>
          <div style={{marginBottom:14}}><label style={lbl}>Street Address</label><input value={form.address} onChange={e=>setF(f=>({...f,address:e.target.value}))} style={inp}/></div>
          <div className="grid grid-3" style={{gap:14,marginBottom:24}}>
            {[['City','city'],['State','state'],['PIN Code','pincode']].map(([l,k])=>(<div key={k}><label style={lbl}>{l}</label><input value={form[k]} onChange={e=>setF(f=>({...f,[k]:e.target.value}))} style={inp}/></div>))}
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={saving}>{saving?'Saving…':'Save Changes'}</button>
        </form>
        <div style={{marginTop:16,paddingTop:16,borderTop:'1px solid #eee',display:'flex',gap:10,flexWrap:'wrap'}}>
          <Link to="/orders" className="btn btn-outline btn-sm">📦 My Orders</Link>
          <Link to="/wishlist" className="btn btn-outline btn-sm">❤️ My Wishlist</Link>
        </div>
      </div>
    </div></div>
  );
}
