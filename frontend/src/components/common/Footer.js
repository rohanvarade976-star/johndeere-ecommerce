
import React from 'react';
import {Link} from 'react-router-dom';
import {FiMail,FiPhone,FiMapPin,FiArrowRight} from 'react-icons/fi';
export default function Footer(){
  return(
    <footer style={{background:'#0f3d10',color:'rgba(255,255,255,0.78)',paddingTop:60,marginTop:'auto'}}>
      <div className="container">
        <div style={{display:'grid',gridTemplateColumns:'2.2fr 1fr 1fr 1.2fr',gap:40,paddingBottom:44,borderBottom:'1px solid rgba(255,255,255,0.08)'}}>

          {/* Brand */}
          <div>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:18}}>
              <div style={{width:46,height:46,background:'var(--jd-yellow)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:15,color:'var(--jd-green-dark)',letterSpacing:-0.5,flexShrink:0}}>JD</div>
              <div>
                <div style={{color:'white',fontWeight:800,fontSize:16,lineHeight:1.2}}>John Deere</div>
                <div style={{color:'rgba(255,255,255,0.5)',fontSize:11}}>E-Commerce Parts Diagram System</div>
              </div>
            </div>
            <p style={{fontSize:13,lineHeight:1.75,maxWidth:290,color:'rgba(255,255,255,0.65)'}}>
              An academic project developed under ThoughtWorks Technologies India Pvt Ltd mentorship, enabling farmers and dealers to identify and purchase genuine John Deere agricultural equipment spare parts using interactive visual diagrams.
            </p>
            <div style={{marginTop:20,display:'flex',flexDirection:'column',gap:9}}>
              {[[FiMail,'support@johndeere-parts.com'],[FiPhone,'+91 98765 43210'],[FiMapPin,'MITAOE, Alandi, Pune 412105']].map(([Icon,text])=>(
                <div key={text} style={{display:'flex',alignItems:'center',gap:9,fontSize:13}}>
                  <Icon size={13} style={{flexShrink:0,color:'var(--jd-yellow)',opacity:0.8}}/>
                  <span style={{color:'rgba(255,255,255,0.65)'}}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{color:'white',fontSize:13,fontWeight:800,marginBottom:16,textTransform:'uppercase',letterSpacing:0.8}}>Platform</h4>
            {[['Equipment Models','/equipment'],['Parts Catalog','/parts'],['Shopping Cart','/cart'],['My Orders','/orders'],['My Wishlist','/wishlist'],['My Profile','/profile']].map(([l,to])=>(
              <Link key={to} to={to} style={{display:'flex',alignItems:'center',gap:5,color:'rgba(255,255,255,0.6)',textDecoration:'none',fontSize:13,marginBottom:9,transition:'var(--t-fast)'}}
                onMouseEnter={e=>{e.currentTarget.style.color='var(--jd-yellow)';e.currentTarget.style.paddingLeft='4px';}}
                onMouseLeave={e=>{e.currentTarget.style.color='rgba(255,255,255,0.6)';e.currentTarget.style.paddingLeft='0';}}>{l}</Link>
            ))}
          </div>

          {/* Categories */}
          <div>
            <h4 style={{color:'white',fontSize:13,fontWeight:800,marginBottom:16,textTransform:'uppercase',letterSpacing:0.8}}>Parts</h4>
            {['ENGINE','HYDRAULIC','ELECTRICAL','STRUCTURAL','TRANSMISSION'].map(c=>(
              <Link key={c} to={`/parts?category=${c}`} style={{display:'block',color:'rgba(255,255,255,0.6)',textDecoration:'none',fontSize:13,marginBottom:9,transition:'var(--t-fast)'}}
                onMouseEnter={e=>{e.currentTarget.style.color='var(--jd-yellow)';}}
                onMouseLeave={e=>{e.currentTarget.style.color='rgba(255,255,255,0.6)';}}>{c}</Link>
            ))}
          </div>

          {/* Project */}
          <div>
            <h4 style={{color:'white',fontSize:13,fontWeight:800,marginBottom:16,textTransform:'uppercase',letterSpacing:0.8}}>Project Team</h4>
            {[['Sakshi Patil','Profile & State Machine Diagrams'],['Srushti Kapase','Component & Package Diagrams'],['Sujal Sonawane','Sequence & Timing Diagrams'],['Saishwari Korade','Use Case & Interaction Diagrams'],['Saqlain Momin','Class & Object Diagrams'],['Rohan Varade','Activity & Communication Diagrams']].map(([n,d])=>(
              <div key={n} style={{marginBottom:10}}>
                <div style={{fontSize:13,color:'rgba(255,255,255,0.85)',fontWeight:600}}>{n}</div>
                <div style={{fontSize:11,color:'rgba(255,255,255,0.38)',marginTop:1}}>{d}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div style={{padding:'18px 0',display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:12,color:'rgba(255,255,255,0.35)',flexWrap:'wrap',gap:8}}>
          <span>© 2024 John Deere E-Commerce Parts Diagram System | MITAOE Software Engineering | ThoughtWorks Technologies India Pvt Ltd</span>
          <span style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{background:'rgba(255,222,0,0.12)',color:'var(--jd-yellow)',padding:'2px 10px',borderRadius:20,fontSize:11,fontWeight:700}}>v4.0</span>
            React.js · Node.js · MySQL · Agile/Scrum
          </span>
        </div>
      </div>
    </footer>
  );
}
