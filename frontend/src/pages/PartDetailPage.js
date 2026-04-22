
import React,{useEffect,useState} from 'react';
import {useParams,Link} from 'react-router-dom';
import {FiShoppingCart,FiArrowLeft,FiHeart,FiCheck,FiStar} from 'react-icons/fi';
import {motion} from 'framer-motion';
import {partsAPI,wishlistAPI} from '../utils/api';
import {useCart} from '../context/CartContext';
import {useAuth} from '../context/AuthContext';
import {PartImage} from '../components/ui/SmartImage';
import {StarRating,RatingDisplay} from '../components/ui/StarRating';
import toast from 'react-hot-toast';

export default function PartDetailPage(){
  const {id}=useParams();
  const [part,setPart]     = useState(null);
  const [reviews,setRev]   = useState([]);
  const [revStats,setRS]   = useState(null);
  const [qty,setQty]       = useState(1);
  const [adding,setAdding] = useState(false);
  const [added,setAdded]   = useState(false);
  const [wishlisted,setWL] = useState(false);
  const [tab,setTab]       = useState('details');
  const [newRev,setNR]     = useState({rating:5,title:'',body:''});
  const [submitting,setSub]= useState(false);
  const {addToCart}=useCart();
  const {isLoggedIn}=useAuth();
  const catColors={ENGINE:'#e65100',HYDRAULIC:'#1565c0',ELECTRICAL:'#f9a825',STRUCTURAL:'#4e342e',TRANSMISSION:'#6a1b9a'};

  useEffect(()=>{
    partsAPI.getById(id).then(r=>setPart(r.data.data)).catch(()=>{});
    partsAPI.getReviews(id).then(r=>{setRev(r.data.data);setRS(r.data.stats);}).catch(()=>{});
    if(isLoggedIn()) wishlistAPI.check(id).then(r=>setWL(r.data.wishlisted)).catch(()=>{});
  },[id,isLoggedIn]);

  const handleAdd=async()=>{
    if(!isLoggedIn()){toast.error('Please login first.');return;}
    try{setAdding(true);await addToCart(part.id,qty);setAdded(true);toast.success('Added to cart!');setTimeout(()=>setAdded(false),3000);}
    catch(err){toast.error(err.response?.data?.message||'Failed.');}finally{setAdding(false);}
  };
  const handleWL=async()=>{
    if(!isLoggedIn()){toast.error('Please login first.');return;}
    const r=await wishlistAPI.toggle({part_id:part.id});setWL(r.data.wishlisted);toast.success(r.data.message);
  };
  const submitReview=async e=>{
    e.preventDefault();
    if(!isLoggedIn()){toast.error('Please login to review.');return;}
    try{setSub(true);await partsAPI.addReview(id,newRev);toast.success('Review submitted!');
      partsAPI.getReviews(id).then(r=>{setRev(r.data.data);setRS(r.data.stats);});
      setNR({rating:5,title:'',body:''});}
    catch(err){toast.error(err.response?.data?.message||'Failed.');}finally{setSub(false);}
  };

  if(!part) return <div className="loading-center"><div className="spinner"/></div>;

  const saved = parseFloat(part.mrp||0)-parseFloat(part.price);

  return(
    <div className="page" style={{background:'#f5f5f5'}}>
      <div className="container" style={{maxWidth:1000}}>
        {/* Breadcrumb */}
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:24,fontSize:14}}>
          <Link to="/parts" style={{display:'flex',alignItems:'center',gap:5,color:'#2d8a2d',textDecoration:'none',fontWeight:600}}><FiArrowLeft size={14}/>Parts Catalog</Link>
          <span style={{color:'#bdbdbd'}}>›</span>
          <span style={{color:'#9e9e9e'}}>{part.category}</span>
          <span style={{color:'#bdbdbd'}}>›</span>
          <span style={{color:'#424242',fontWeight:600}}>{part.part_name}</span>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:28}}>
          {/* LEFT — Image */}
          <div>
            <div style={{background:'white',borderRadius:16,overflow:'hidden',boxShadow:'0 4px 20px rgba(0,0,0,0.08)',height:400,position:'relative'}}>
              <PartImage part={part}/>
              <span style={{position:'absolute',top:14,left:14,background:part.in_stock?'#1a5c1a':'#c62828',color:'white',fontSize:12,fontWeight:700,padding:'4px 14px',borderRadius:24}}>{part.in_stock?'✓ In Stock':'✗ Out of Stock'}</span>
              {part.discount_pct>0&&<span style={{position:'absolute',top:14,right:14,background:'#c62828',color:'white',fontSize:12,fontWeight:800,padding:'4px 12px',borderRadius:24}}>{part.discount_pct}% OFF</span>}
              <button onClick={handleWL} style={{position:'absolute',bottom:14,right:14,background:'white',border:'none',borderRadius:24,padding:'8px 14px',cursor:'pointer',display:'flex',alignItems:'center',gap:6,fontSize:13,fontWeight:700,color:wishlisted?'#c62828':'#9e9e9e',boxShadow:'0 2px 8px rgba(0,0,0,0.12)',transition:'all 0.15s'}}>
                <FiHeart size={15} style={{fill:wishlisted?'#c62828':'none'}}/>{wishlisted?'Wishlisted':'Add to Wishlist'}
              </button>
            </div>
            {/* Guarantee badges */}
            <div style={{display:'flex',gap:10,marginTop:14,flexWrap:'wrap'}}>
              {[['🛡️','Genuine OEM'],['🚚','Fast Delivery'],['↩️','Easy Returns'],['✅',`${part.warranty_months||12}M Warranty`]].map(([icon,lbl])=>(
                <div key={lbl} style={{display:'flex',alignItems:'center',gap:5,fontSize:12,color:'#616161',background:'white',padding:'7px 12px',borderRadius:20,boxShadow:'0 1px 3px rgba(0,0,0,0.07)'}}><span>{icon}</span><span>{lbl}</span></div>
              ))}
            </div>
          </div>

          {/* RIGHT — Details */}
          <div style={{background:'white',borderRadius:16,padding:28,boxShadow:'0 4px 20px rgba(0,0,0,0.08)'}}>
            <div style={{display:'flex',gap:8,marginBottom:10,flexWrap:'wrap'}}>
              <span style={{background:catColors[part.category]||'#424242',color:'white',fontSize:12,fontWeight:700,padding:'4px 14px',borderRadius:24}}>{part.category}</span>
              {part.is_featured&&<span style={{background:'#fff8e1',color:'#e65100',fontSize:12,fontWeight:700,padding:'4px 12px',borderRadius:24}}>⭐ Featured</span>}
            </div>
            <div style={{fontSize:12,color:'#9e9e9e',fontWeight:700,letterSpacing:1,textTransform:'uppercase',marginBottom:4}}>{part.part_number}</div>
            <h1 style={{fontSize:26,fontWeight:900,color:'#1a1a1a',marginBottom:10,lineHeight:1.2}}>{part.part_name}</h1>
            {parseFloat(revStats?.avg||0)>0&&<div style={{marginBottom:12}}><RatingDisplay rating={revStats.avg} count={revStats.total}/></div>}
            <p style={{fontSize:14,color:'#616161',lineHeight:1.75,marginBottom:18}}>{part.description}</p>

            {/* Price */}
            <div style={{background:'#f0faf0',borderRadius:12,padding:'16px 18px',marginBottom:18}}>
              <div style={{display:'flex',alignItems:'baseline',gap:10,marginBottom:4}}>
                <span style={{fontSize:36,fontWeight:900,color:'#1a5c1a',lineHeight:1}}>₹{parseFloat(part.price).toLocaleString()}</span>
                {part.mrp&&parseFloat(part.mrp)>parseFloat(part.price)&&(
                  <><span style={{fontSize:16,color:'#bdbdbd',textDecoration:'line-through'}}>₹{parseFloat(part.mrp).toLocaleString()}</span>
                  <span style={{background:'#c62828',color:'white',fontSize:12,fontWeight:800,padding:'2px 8px',borderRadius:20}}>Save ₹{saved.toLocaleString()}</span></>
                )}
              </div>
              <div style={{fontSize:12,color:'#757575'}}>Inclusive of all taxes · Free delivery above ₹5000</div>
            </div>

            {/* Specs */}
            <div style={{borderRadius:10,overflow:'hidden',border:'1px solid #eee',marginBottom:18}}>
              {[['Part Number',part.part_number],['Category',part.category],['Stock Status',part.in_stock?`In Stock (${part.available_stock} units)`:'Out of Stock'],['Weight',part.weight_kg?`${part.weight_kg} kg`:'N/A'],['Warranty',`${part.warranty_months||12} months`]].map(([l,v],i)=>(
                <div key={l} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 14px',background:i%2===0?'white':'#fafafa',borderBottom:i<4?'1px solid #f5f5f5':'none',fontSize:14}}>
                  <span style={{color:'#9e9e9e',fontWeight:500}}>{l}</span>
                  <span style={{fontWeight:700,color:l==='Stock Status'?(part.in_stock?'#2e7d32':'#c62828'):'#1a1a1a'}}>{v}</span>
                </div>
              ))}
            </div>

            {/* Quantity + Cart */}
            {part.in_stock&&(
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
                <span style={{fontWeight:700,fontSize:14}}>Quantity</span>
                <div style={{display:'flex',border:'2px solid #eee',borderRadius:10,overflow:'hidden'}}>
                  <button onClick={()=>setQty(q=>Math.max(1,q-1))} style={{width:40,height:44,border:'none',background:'#f5f5f5',cursor:'pointer',fontSize:20,fontWeight:700,color:'#1a5c1a',transition:'background 0.15s'}} onMouseEnter={e=>e.target.style.background='#e8f5e9'} onMouseLeave={e=>e.target.style.background='#f5f5f5'}>−</button>
                  <span style={{width:48,height:44,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:16}}>{qty}</span>
                  <button onClick={()=>setQty(q=>Math.min(part.available_stock,q+1))} style={{width:40,height:44,border:'none',background:'#f5f5f5',cursor:'pointer',fontSize:20,fontWeight:700,color:'#1a5c1a',transition:'background 0.15s'}} onMouseEnter={e=>e.target.style.background='#e8f5e9'} onMouseLeave={e=>e.target.style.background='#f5f5f5'}>+</button>
                </div>
                <span style={{fontSize:13,color:'#9e9e9e'}}>Total: <strong style={{color:'#1a5c1a'}}>₹{(parseFloat(part.price)*qty).toLocaleString()}</strong></span>
              </div>
            )}
            <button className="btn btn-primary btn-lg btn-block" disabled={!part.in_stock||adding} onClick={handleAdd}
              style={{background:added?'#2e7d32':undefined}}>
              {adding?'Adding…':added?<><FiCheck/> Added!</>:<><FiShoppingCart/>{part.in_stock?'Add to Cart':'Out of Stock'}</>}
            </button>
          </div>
        </div>

        {/* TABS: Related + Reviews */}
        <div style={{marginTop:28,background:'white',borderRadius:16,overflow:'hidden',boxShadow:'0 2px 8px rgba(0,0,0,0.07)'}}>
          <div style={{display:'flex',borderBottom:'2px solid #f5f5f5'}}>
            {[['details','Product Details'],['reviews',`Reviews (${revStats?.total||0})`],['related','Related Parts']].map(([key,lbl])=>(
              <button key={key} onClick={()=>setTab(key)} style={{padding:'16px 24px',border:'none',background:'none',fontWeight:700,fontSize:14,cursor:'pointer',color:tab===key?'#1a5c1a':'#9e9e9e',borderBottom:tab===key?'2px solid #1a5c1a':'2px solid transparent',marginBottom:-2,transition:'all 0.15s'}}>{lbl}</button>
            ))}
          </div>

          <div style={{padding:24}}>
            {tab==='details'&&(
              <div>
                <h3 style={{fontWeight:800,color:'#1a5c1a',marginBottom:12}}>Product Description</h3>
                <p style={{color:'#616161',lineHeight:1.8}}>{part.description}</p>
                {part.compatible_models&&(
                  <div style={{marginTop:16}}>
                    <h4 style={{fontWeight:700,marginBottom:8,color:'#424242'}}>Compatible Models</h4>
                    <p style={{color:'#757575',fontSize:14}}>{Array.isArray(part.compatible_models)?part.compatible_models.join(', '):part.compatible_models}</p>
                  </div>
                )}
              </div>
            )}

            {tab==='reviews'&&(
              <div>
                {revStats&&parseFloat(revStats.total)>0&&(
                  <div style={{display:'flex',gap:32,marginBottom:28,padding:20,background:'#f9f9f9',borderRadius:12}}>
                    <div style={{textAlign:'center'}}>
                      <div style={{fontSize:52,fontWeight:900,color:'#1a5c1a',lineHeight:1}}>{parseFloat(revStats.avg||0).toFixed(1)}</div>
                      <StarRating rating={Math.round(revStats.avg||0)} size={20}/>
                      <div style={{fontSize:13,color:'#9e9e9e',marginTop:4}}>{revStats.total} reviews</div>
                    </div>
                    <div style={{flex:1}}>
                      {[[5,'five'],[4,'four'],[3,'three'],[2,'two'],[1,'one']].map(([n,k])=>(
                        <div key={n} style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                          <span style={{fontSize:12,fontWeight:700,color:'#9e9e9e',width:8}}>{n}</span>
                          <span style={{fontSize:14,color:'#f9a825'}}>★</span>
                          <div style={{flex:1,height:8,background:'#eee',borderRadius:4,overflow:'hidden'}}>
                            <div style={{height:'100%',background:'#f9a825',borderRadius:4,width:`${revStats.total>0?(revStats[k]/revStats.total)*100:0}%`,transition:'width 0.5s'}}/>
                          </div>
                          <span style={{fontSize:12,color:'#9e9e9e',width:24}}>{revStats[k]||0}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {reviews.map(r=>(
                  <div key={r.id} style={{padding:'16px 0',borderBottom:'1px solid #f5f5f5'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
                      <div>
                        <div style={{fontWeight:700,fontSize:14,color:'#1a1a1a',marginBottom:2}}>{r.user_name}</div>
                        <div style={{display:'flex',alignItems:'center',gap:8}}>
                          <StarRating rating={r.rating} size={14}/>
                          {r.is_verified&&<span style={{fontSize:11,background:'#e8f5e9',color:'#2e7d32',padding:'2px 7px',borderRadius:20,fontWeight:700}}>✓ Verified Purchase</span>}
                        </div>
                      </div>
                      <span style={{fontSize:12,color:'#bdbdbd'}}>{new Date(r.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</span>
                    </div>
                    {r.title&&<div style={{fontWeight:700,color:'#424242',marginBottom:4,fontSize:14}}>{r.title}</div>}
                    <p style={{fontSize:14,color:'#616161',lineHeight:1.65}}>{r.body}</p>
                  </div>
                ))}

                {isLoggedIn()&&(
                  <form onSubmit={submitReview} style={{marginTop:24,padding:20,background:'#f9f9f9',borderRadius:12}}>
                    <h4 style={{fontWeight:800,color:'#1a5c1a',marginBottom:16}}>Write a Review</h4>
                    <div style={{marginBottom:14}}>
                      <div style={{fontWeight:600,fontSize:14,marginBottom:6}}>Your Rating</div>
                      <StarRating rating={newRev.rating} size={28} interactive onRate={v=>setNR(r=>({...r,rating:v}))}/>
                    </div>
                    {[['Review Title','title','text','Summarize your experience'],['Your Review','body','textarea','Tell others about this part...']].map(([lbl,key,type,ph])=>(
                      <div key={key} style={{marginBottom:14}}>
                        <div style={{fontWeight:600,fontSize:14,marginBottom:5}}>{lbl}</div>
                        {type==='textarea'
                          ?<textarea value={newRev[key]} onChange={e=>setNR(r=>({...r,[key]:e.target.value}))} placeholder={ph} rows={4} style={{width:'100%',padding:'10px 14px',border:'2px solid #eee',borderRadius:9,fontSize:15,outline:'none',resize:'vertical'}}/>
                          :<input type={type} value={newRev[key]} onChange={e=>setNR(r=>({...r,[key]:e.target.value}))} placeholder={ph} style={{width:'100%',padding:'10px 14px',border:'2px solid #eee',borderRadius:9,fontSize:15,outline:'none'}}/>
                        }
                      </div>
                    ))}
                    <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting?'Submitting…':'Submit Review'}</button>
                  </form>
                )}
              </div>
            )}

            {tab==='related'&&(
              <div className="grid grid-4">
                {part.related?.map(p=>(
                  <Link key={p.id} to={`/parts/${p.id}`} className="card" style={{textDecoration:'none',color:'inherit'}}>
                    <div style={{height:140,background:'#f9f9f9',overflow:'hidden'}}><PartImage part={p}/></div>
                    <div style={{padding:'12px 14px'}}>
                      <div style={{fontSize:10,color:'#9e9e9e',fontWeight:700,letterSpacing:0.8,textTransform:'uppercase',marginBottom:2}}>{p.part_number}</div>
                      <div style={{fontWeight:700,color:'#1a1a1a',fontSize:14,marginBottom:6}}>{p.part_name}</div>
                      <div style={{fontWeight:900,color:'#1a5c1a'}}>₹{parseFloat(p.price).toLocaleString()}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
