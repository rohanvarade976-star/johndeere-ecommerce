
import React,{useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {FiArrowRight,FiSearch,FiZap,FiShield,FiTruck,FiStar} from 'react-icons/fi';
import {motion} from 'framer-motion';
import {equipmentAPI,partsAPI} from '../utils/api';
import {EquipmentImage,PartImage} from '../components/ui/SmartImage';
import {RatingDisplay} from '../components/ui/StarRating';
import {useCart} from '../context/CartContext';
import {useAuth} from '../context/AuthContext';
import {ProductCardSkeleton,EquipmentCardSkeleton} from '../components/ui/Skeleton';
import toast from 'react-hot-toast';

export default function HomePage(){
  const [cats,setCats]       = useState([]);
  const [equip,setEquip]     = useState([]);
  const [featured,setFeat]   = useState([]);
  const [loadEq,setLoadEq]   = useState(true);
  const [loadPt,setLoadPt]   = useState(true);
  const [search,setSearch]   = useState('');
  const {addToCart} = useCart();
  const {isLoggedIn} = useAuth();

  useEffect(()=>{
    equipmentAPI.getCategories().then(r=>setCats(r.data.data)).catch(()=>{});
    equipmentAPI.getAll({}).then(r=>{setEquip(r.data.data.slice(0,3));setLoadEq(false);}).catch(()=>setLoadEq(false));
    partsAPI.getAll({featured:'true',in_stock:'true'}).then(r=>{setFeat(r.data.data.slice(0,4));setLoadPt(false);}).catch(()=>{
      partsAPI.getAll({in_stock:'true'}).then(r=>{setFeat(r.data.data.slice(0,4));setLoadPt(false);}).catch(()=>setLoadPt(false));
    });
  },[]);

  const handleSearch = e=>{ e.preventDefault(); if(search.trim()) window.location.href=`/parts?search=${encodeURIComponent(search)}`; };
  const handleAdd = async(part)=>{ if(!isLoggedIn()){toast.error('Please login first.');return;} try{await addToCart(part.id,1);toast.success(`${part.part_name} added!`);}catch(err){toast.error(err.response?.data?.message||'Failed.');} };

  const catIcons={Tractor:'🚜',Harvester:'🌾',Combine:'⚙️',Sprayer:'💧',Planter:'🌱'};
  const features=[
    {icon:'🔍',title:'Visual Part Finder',desc:'Click directly on interactive equipment diagrams to identify any part instantly.'},
    {icon:'⚡',title:'Instant Details',desc:'Part number, price, stock availability and compatibility — all in one click.'},
    {icon:'🚚',title:'Fast Delivery',desc:'Genuine OEM parts delivered to your farm in 3-5 business days.'},
    {icon:'🛡️',title:'100% Genuine',desc:'All parts carry official John Deere warranty and quality certification.'},
  ];

  return (
    <div>
      {/* HERO */}
      <section style={{background:'linear-gradient(135deg,#1a5c1a 0%,#2d7a2d 55%,#367c2b 100%)',color:'white',padding:'90px 0 80px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,background:'url(https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/John_Deere_5075E_tractor_2014.jpg/1280px-John_Deere_5075E_tractor_2014.jpg) center/cover',opacity:0.08,pointerEvents:'none'}}/>
        <div style={{position:'absolute',right:-60,bottom:-60,fontSize:400,opacity:0.03,userSelect:'none',pointerEvents:'none',lineHeight:1}}>🚜</div>
        <div className="container" style={{position:'relative'}}>
          <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.6}} style={{maxWidth:640}}>
            <div style={{background:'rgba(255,222,0,0.15)',color:'#ffde00',border:'1px solid rgba(255,222,0,0.3)',borderRadius:24,padding:'5px 18px',fontSize:13,fontWeight:700,display:'inline-block',marginBottom:20,letterSpacing:0.5}}>🌿 ThoughtWorks × MITAOE Academic Project</div>
            <h1 style={{fontSize:56,fontWeight:900,lineHeight:1.05,marginBottom:18,letterSpacing:-1.5}}>Find the Right<br/><span style={{color:'#ffde00'}}>John Deere Part.</span><br/>Every Time.</h1>
            <p style={{fontSize:19,opacity:0.88,marginBottom:32,lineHeight:1.65,maxWidth:520}}>Click on interactive tractor diagrams to instantly identify and purchase genuine spare parts — no guesswork, no wrong orders.</p>
            <form onSubmit={handleSearch} style={{display:'flex',alignItems:'center',background:'white',borderRadius:50,padding:'6px 6px 6px 20px',maxWidth:560,marginBottom:32,boxShadow:'0 8px 32px rgba(0,0,0,0.25)',gap:10}}>
              <FiSearch size={20} style={{color:'#9e9e9e',flexShrink:0}}/>
              <input type="text" placeholder="Search part name or number (e.g. RE504836, Oil Filter)..." value={search} onChange={e=>setSearch(e.target.value)} style={{flex:1,border:'none',outline:'none',fontSize:15,background:'transparent',color:'#1a1a1a'}}/>
              <button type="submit" style={{background:'#ffde00',color:'#1a1a1a',border:'none',borderRadius:50,padding:'10px 22px',fontWeight:800,fontSize:15,cursor:'pointer',flexShrink:0}}>Search</button>
            </form>
            <div style={{display:'flex',gap:14,flexWrap:'wrap'}}>
              <Link to="/equipment" style={{background:'#ffde00',color:'#1a1a1a',textDecoration:'none',padding:'15px 30px',borderRadius:9,fontWeight:800,fontSize:16,display:'inline-flex',alignItems:'center',gap:8,transition:'all 0.2s',boxShadow:'0 4px 16px rgba(255,222,0,0.35)'}}>Browse Equipment <FiArrowRight/></Link>
              <Link to="/parts" style={{background:'rgba(255,255,255,0.12)',color:'white',border:'2px solid rgba(255,255,255,0.4)',textDecoration:'none',padding:'15px 30px',borderRadius:9,fontWeight:700,fontSize:16,backdropFilter:'blur(4px)',transition:'all 0.2s'}}>Parts Catalog</Link>
            </div>
          </motion.div>
          <div style={{display:'flex',gap:48,marginTop:56,paddingTop:32,borderTop:'1px solid rgba(255,255,255,0.12)',flexWrap:'wrap'}}>
            {[['500+','Genuine Parts'],['7+','Equipment Models'],['15+','Part Categories'],['24/7','Online Ordering']].map(([n,l])=>(
              <div key={l}><div style={{fontSize:34,fontWeight:900,color:'#ffde00',lineHeight:1}}>{n}</div><div style={{fontSize:13,color:'rgba(255,255,255,0.7)',marginTop:5}}>{l}</div></div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{padding:'70px 0',background:'white'}}>
        <div className="container">
          <h2 className="section-title center">Why John Deere Parts System?</h2>
          <p className="section-subtitle" style={{textAlign:'center'}}>The smartest way to identify and buy genuine agricultural spare parts</p>
          <div className="grid grid-4" style={{marginTop:36}}>
            {features.map((f,i)=>(
              <motion.div key={i} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.1}}
                style={{padding:'28px 22px',borderRadius:14,border:'2px solid #eee',textAlign:'center',transition:'all 0.2s'}}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor='#2d8a2d'; e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor='#eee'; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}>
                <div style={{fontSize:44,marginBottom:14}}>{f.icon}</div>
                <h3 style={{fontSize:16,fontWeight:800,color:'#1a5c1a',marginBottom:8}}>{f.title}</h3>
                <p style={{fontSize:13,color:'#757575',lineHeight:1.65}}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED EQUIPMENT */}
      <section style={{padding:'70px 0',background:'#f5f5f5'}}>
        <div className="container">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:28}}>
            <div><h2 className="section-title">Featured Equipment</h2><p className="section-subtitle">Click any model to open its interactive parts diagram</p></div>
            <Link to="/equipment" className="btn btn-outline">All Models <FiArrowRight size={14}/></Link>
          </div>
          <div className="grid grid-3">
            {loadEq ? [1,2,3].map(i=><EquipmentCardSkeleton key={i}/>) : equip.map(eq=>(
              <Link key={eq.id} to={`/equipment/${eq.id}`} className="card" style={{textDecoration:'none',color:'inherit',overflow:'hidden'}}>
                <div style={{height:220,overflow:'hidden',position:'relative'}}>
                  <EquipmentImage equipment={eq} height={220} style={{transition:'transform 0.4s'}}/>
                  <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,0.65) 0%,transparent 55%)'}}/>
                  <span style={{position:'absolute',top:12,left:12,background:'#ffde00',color:'#1a5c1a',fontSize:11,fontWeight:800,padding:'3px 10px',borderRadius:20}}>{catIcons[eq.category]} {eq.category}</span>
                  {eq.horsepower&&<span style={{position:'absolute',top:12,right:12,background:'rgba(0,0,0,0.6)',color:'white',fontSize:11,fontWeight:700,padding:'3px 9px',borderRadius:20}}>{eq.horsepower} HP</span>}
                  <div style={{position:'absolute',bottom:14,left:14,right:14}}>
                    <p style={{color:'rgba(255,255,255,0.7)',fontSize:11,fontWeight:600,marginBottom:2}}>{eq.model_code} · {eq.series}</p>
                    <h3 style={{color:'white',fontWeight:900,fontSize:19,textShadow:'0 2px 6px rgba(0,0,0,0.5)'}}>{eq.model_name}</h3>
                  </div>
                </div>
                <div className="card-body">
                  <p style={{fontSize:13,color:'#757575',lineHeight:1.6,marginBottom:14}}>{eq.description?.slice(0,90)}...</p>
                  <div style={{display:'flex',alignItems:'center',gap:6,color:'#2d8a2d',fontSize:14,fontWeight:700}}>View Diagram <FiArrowRight size={13}/></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section style={{padding:'70px 0',background:'white'}}>
        <div className="container">
          <h2 className="section-title">Browse by Equipment Type</h2>
          <p className="section-subtitle">Choose your machine to find compatible parts and diagrams</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:16}}>
            {(cats.length>0?cats:['Tractor','Harvester','Combine','Sprayer','Planter'].map(c=>({category:c,count:'—'}))).map((c,i)=>(
              <Link key={i} to={`/equipment?category=${c.category}`} style={{background:'#f9f9f9',border:'2px solid #eee',borderRadius:14,padding:'28px 16px',textAlign:'center',textDecoration:'none',color:'inherit',transition:'all 0.2s',display:'block'}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='#1a5c1a';e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.1)';e.currentTarget.style.background='#e8f5e9';}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='#eee';e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='none';e.currentTarget.style.background='#f9f9f9';}}>
                <div style={{fontSize:42,marginBottom:10}}>{catIcons[c.category]||'⚙️'}</div>
                <h3 style={{fontSize:15,fontWeight:800,color:'#1a5c1a',marginBottom:4}}>{c.category}s</h3>
                {c.count&&<span style={{fontSize:12,color:'#9e9e9e'}}>{c.count} models</span>}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PARTS */}
      {(loadPt||featured.length>0)&&(
        <section style={{padding:'70px 0',background:'#f5f5f5'}}>
          <div className="container">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:28}}>
              <div><h2 className="section-title">Popular Spare Parts</h2><p className="section-subtitle">Most ordered genuine John Deere replacement parts</p></div>
              <Link to="/parts" className="btn btn-outline">All Parts <FiArrowRight size={14}/></Link>
            </div>
            <div className="grid grid-4">
              {loadPt ? [1,2,3,4].map(i=><ProductCardSkeleton key={i}/>) : featured.map(part=>(
                <motion.div key={part.id} className="card" style={{display:'flex',flexDirection:'column'}} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} whileHover={{y:-4,boxShadow:'0 8px 24px rgba(0,0,0,0.12)'}}>
                  <Link to={`/parts/${part.id}`} style={{textDecoration:'none',color:'inherit',flex:1}}>
                    <div style={{height:172,position:'relative',overflow:'hidden',background:'#f9f9f9'}}>
                      <PartImage part={part} style={{transition:'transform 0.3s'}}/>
                      <span style={{position:'absolute',top:10,left:10,background:part.in_stock?'#1a5c1a':'#c62828',color:'white',fontSize:11,fontWeight:700,padding:'3px 9px',borderRadius:20}}>{part.in_stock?'✓ In Stock':'✗ Out of Stock'}</span>
                      {part.discount_pct>0&&<span style={{position:'absolute',top:10,right:10,background:'#c62828',color:'white',fontSize:11,fontWeight:700,padding:'3px 9px',borderRadius:20}}>{part.discount_pct}% OFF</span>}
                    </div>
                    <div style={{padding:'13px 15px 6px'}}>
                      <div style={{fontSize:10,color:'#9e9e9e',fontWeight:700,letterSpacing:0.8,textTransform:'uppercase',marginBottom:3}}>{part.part_number}</div>
                      <h3 style={{fontWeight:800,color:'#1a1a1a',fontSize:15,marginBottom:5,lineHeight:1.3}}>{part.part_name}</h3>
                      {parseFloat(part.avg_rating)>0&&<RatingDisplay rating={part.avg_rating} count={part.review_count} size={12}/>}
                    </div>
                  </Link>
                  <div style={{padding:'8px 15px 15px',borderTop:'1px solid #f5f5f5',display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:4}}>
                    <div>
                      <span style={{fontSize:19,fontWeight:900,color:'#1a5c1a'}}> ₹{parseFloat(part.price).toLocaleString()}</span>
                      {part.mrp&&<span style={{fontSize:12,color:'#9e9e9e',textDecoration:'line-through',marginLeft:5}}>₹{parseFloat(part.mrp).toLocaleString()}</span>}
                    </div>
                    <button className="btn btn-primary btn-sm" disabled={!part.in_stock} onClick={()=>handleAdd(part)}>Add</button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* HOW IT WORKS */}
      <section style={{padding:'70px 0',background:'white'}}>
        <div className="container">
          <h2 className="section-title center">How It Works</h2>
          <p className="section-subtitle" style={{textAlign:'center'}}>Order the right part in 4 simple steps</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:0,marginTop:40}}>
            {[['01','🚜','Select Machine','Browse our catalog of John Deere models and select your equipment.'],
              ['02','📐','Open Diagram','View the interactive parts diagram for your equipment category.'],
              ['03','👆','Click a Part','Click any glowing hotspot to instantly see part details and price.'],
              ['04','🛒','Checkout','Add to cart, choose payment method, and get it delivered.']].map(([step,icon,title,desc],i)=>(
              <motion.div key={i} style={{textAlign:'center',padding:'32px 20px',background:i%2?'#f9f9f9':'white',borderRadius:0}} initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true}} transition={{delay:i*0.15}}>
                <div style={{fontSize:11,fontWeight:800,color:'#bdbdbd',letterSpacing:2,marginBottom:8}}>STEP {step}</div>
                <div style={{fontSize:48,marginBottom:12}}>{icon}</div>
                <h3 style={{fontSize:16,fontWeight:800,color:'#1a5c1a',marginBottom:8}}>{title}</h3>
                <p style={{fontSize:13,color:'#757575',lineHeight:1.65}}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,background:'url(https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/John_Deere_5075E_tractor_2014.jpg/1280px-John_Deere_5075E_tractor_2014.jpg) center/cover'}}/>
        <div style={{position:'absolute',inset:0,background:'rgba(26,92,26,0.90)'}}/>
        <div className="container" style={{position:'relative',padding:'90px 20px',textAlign:'center',color:'white'}}>
          <h2 style={{fontSize:42,fontWeight:900,marginBottom:14,letterSpacing:-1}}>Ready to Find Your Part?</h2>
          <p style={{fontSize:18,opacity:0.85,marginBottom:36,maxWidth:520,margin:'0 auto 36px'}}>Browse 500+ genuine John Deere parts with interactive equipment diagrams</p>
          <div style={{display:'flex',gap:16,justifyContent:'center',flexWrap:'wrap'}}>
            <Link to="/equipment" style={{background:'#ffde00',color:'#1a1a1a',textDecoration:'none',padding:'16px 36px',borderRadius:9,fontWeight:800,fontSize:17,display:'inline-flex',alignItems:'center',gap:8}}>🚜 Browse Equipment</Link>
            <Link to="/register" style={{background:'rgba(255,255,255,0.12)',border:'2px solid rgba(255,255,255,0.5)',color:'white',textDecoration:'none',padding:'16px 36px',borderRadius:9,fontWeight:700,fontSize:17}}>Create Free Account</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
