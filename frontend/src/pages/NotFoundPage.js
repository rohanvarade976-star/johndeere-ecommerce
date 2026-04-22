
import React from 'react';
import {Link} from 'react-router-dom';
import {FiArrowLeft,FiSearch} from 'react-icons/fi';
export default function NotFoundPage(){
  return(
    <div style={{minHeight:'70vh',display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <div style={{textAlign:'center',maxWidth:480}}>
        <div style={{fontSize:80,marginBottom:20}}>🚜</div>
        <h1 style={{fontSize:80,fontWeight:900,color:'var(--jd-green-dark)',lineHeight:1,marginBottom:8}}>404</h1>
        <h2 style={{fontSize:22,fontWeight:700,color:'var(--gray-700)',marginBottom:10}}>Page Not Found</h2>
        <p style={{color:'var(--gray-500)',fontSize:15,lineHeight:1.6,marginBottom:32}}>
          Looks like this page drove off into the field. Let us help you get back on track.
        </p>
        <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
          <Link to="/" className="btn btn-primary btn-lg"><FiArrowLeft/>Go Home</Link>
          <Link to="/equipment" className="btn btn-outline btn-lg"><FiSearch/>Browse Equipment</Link>
        </div>
      </div>
    </div>
  );
}
