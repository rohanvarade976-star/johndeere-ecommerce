import React,{createContext,useContext,useState,useEffect} from 'react';
import {authAPI} from '../utils/api';
const C=createContext(null);
export const AuthProvider=({children})=>{
  const [user,setUser]=useState(null);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{ const s=localStorage.getItem('jd_user'),t=localStorage.getItem('jd_token'); if(s&&t)setUser(JSON.parse(s)); setLoading(false); },[]);
  const _save=(token,user)=>{ localStorage.setItem('jd_token',token); localStorage.setItem('jd_user',JSON.stringify(user)); setUser(user); };
  const login=async(e,p)=>{ const r=await authAPI.login({email:e,password:p}); _save(r.data.token,r.data.user); return r.data.user; };
  const googleAuth=async(credential)=>{ const r=await authAPI.googleAuth({credential}); _save(r.data.token,r.data.user); return r.data.user; };
  const register=async(d)=>{ const r=await authAPI.register(d); _save(r.data.token,r.data.user); return r.data.user; };
  const logout=()=>{ localStorage.removeItem('jd_token'); localStorage.removeItem('jd_user'); setUser(null); };
  const updateUser=d=>{ const u={...user,...d}; setUser(u); localStorage.setItem('jd_user',JSON.stringify(u)); };
  return <C.Provider value={{user,loading,login,googleAuth,register,logout,updateUser,isAdmin:()=>user?.role==='admin',isDealer:()=>user?.role==='dealer',isLoggedIn:()=>!!user}}>{children}</C.Provider>;
};
export const useAuth=()=>{ const c=useContext(C); if(!c)throw new Error('useAuth outside AuthProvider'); return c; };
