
import React,{useEffect,useState} from 'react';
import {Link,useSearchParams} from 'react-router-dom';
import {FiSearch,FiArrowRight} from 'react-icons/fi';
import {motion} from 'framer-motion';
import {equipmentAPI} from '../utils/api';
import {EquipmentImage} from '../components/ui/SmartImage';
import {EquipmentCardSkeleton} from '../components/ui/Skeleton';
export default function EquipmentPage(){
  const [sp]=useSearchParams();
  const [equipment,setEq]=useState([]); const [loading,setL]=useState(true);
  const [search,setS]=useState(sp.get('search')||''); const [cat,setCat]=useState(sp.get('category')||'');
  const catIcons={Tractor:'🚜',Harvester:'🌾',Combine:'⚙️',Sprayer:'💧',Planter:'🌱'};
  useEffect(()=>{ setL(true); const p={}; if(search)p.search=search; if(cat)p.category=cat; equipmentAPI.getAll(p).then(r=>setEq(r.data.data)).catch(()=>{}).finally(()=>setL(false)); },[search,cat]);
  return(
    <div className="page" style={{background:'#f5f5f5'}}>
      <div className="container">
        <div style={{background:'linear-gradient(135deg,#1a5c1a,#367c2b)',borderRadius:16,padding:'36px 32px',marginBottom:32,position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',right:16,bottom:-20,fontSize:160,opacity:0.05}}>🚜</div>
          <h1 style={{color:'white',fontSize:30,fontWeight:900,marginBottom:6}}>Equipment Models</h1>
          <p style={{color:'rgba(255,255,255,0.8)',fontSize:15}}>Select your John Deere machine to view interactive parts diagrams</p>
        </div>
        <div style={{background:'white',borderRadius:12,padding:'16px 20px',marginBottom:24,boxShadow:'0 1px 4px rgba(0,0,0,0.08)',display:'flex',flexWrap:'wrap',gap:14,alignItems:'center'}}>
          <div style={{position:'relative',flex:1,minWidth:220}}>
            <FiSearch style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'#bdbdbd'}}/>
            <input type="text" placeholder="Search by model name or code..." value={search} onChange={e=>setS(e.target.value)} style={{width:'100%',padding:'10px 14px 10px 38px',border:'2px solid #eee',borderRadius:9,fontSize:15,outline:'none'}}/>
          </div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            {['','Tractor','Harvester','Combine','Sprayer','Planter'].map(c=>(
              <button key={c} onClick={()=>setCat(c)} style={{padding:'8px 16px',border:`2px solid ${cat===c?'#1a5c1a':'#eee'}`,borderRadius:24,background:cat===c?'#1a5c1a':'white',color:cat===c?'white':'#424242',fontSize:13,fontWeight:700,cursor:'pointer',transition:'all 0.15s'}}>
                {c?`${catIcons[c]} ${c}s`:'🔍 All'}
              </button>
            ))}
          </div>
        </div>
        {loading?(
          <div className="grid grid-3">{[1,2,3,4,5,6].map(i=><EquipmentCardSkeleton key={i}/>)}</div>
        ):equipment.length===0?(
          <div style={{textAlign:'center',padding:'80px 0',background:'white',borderRadius:12}}><div style={{fontSize:60,marginBottom:16}}>🔍</div><h3>No equipment found</h3></div>
        ):(
          <div className="grid grid-3">
            {equipment.map((eq,i)=>(
              <motion.div key={eq.id} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.05}}>
                <Link to={`/equipment/${eq.id}`} className="card" style={{textDecoration:'none',color:'inherit',display:'block',overflow:'hidden'}}>
                  <div style={{height:220,overflow:'hidden',position:'relative'}}>
                    <EquipmentImage equipment={eq} height={220} style={{transition:'transform 0.4s'}}/>
                    <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,0.65) 0%,transparent 55%)'}}/>
                    <span style={{position:'absolute',top:12,left:12,background:'#ffde00',color:'#1a5c1a',fontSize:11,fontWeight:800,padding:'3px 10px',borderRadius:20}}>{catIcons[eq.category]} {eq.category}</span>
                    {eq.horsepower&&<span style={{position:'absolute',top:12,right:12,background:'rgba(0,0,0,0.6)',color:'white',fontSize:11,fontWeight:700,padding:'3px 9px',borderRadius:20}}>{eq.horsepower} HP</span>}
                    <div style={{position:'absolute',bottom:14,left:14,right:14}}>
                      <p style={{color:'rgba(255,255,255,0.7)',fontSize:11,marginBottom:2}}>{eq.model_code} · {eq.series}</p>
                      <h3 style={{color:'white',fontWeight:900,fontSize:19,textShadow:'0 2px 6px rgba(0,0,0,0.5)'}}>{eq.model_name}</h3>
                    </div>
                  </div>
                  <div className="card-body">
                    <p style={{fontSize:13,color:'#757575',lineHeight:1.6,marginBottom:14}}>{eq.description?.slice(0,90)}...</p>
                    <div style={{display:'flex',alignItems:'center',gap:6,color:'#2d8a2d',fontSize:14,fontWeight:700}}>View Interactive Diagram <FiArrowRight size={13}/></div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
