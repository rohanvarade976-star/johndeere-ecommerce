
import React,{useEffect,useState} from 'react';
import {useParams,Link} from 'react-router-dom';
import {TransformWrapper,TransformComponent} from 'react-zoom-pan-pinch';
import {FiZoomIn,FiZoomOut,FiRefreshCw,FiShoppingCart,FiX,FiHeart,FiInfo} from 'react-icons/fi';
import {equipmentAPI,partsAPI,wishlistAPI} from '../utils/api';
import {useCart} from '../context/CartContext';
import {useAuth} from '../context/AuthContext';
import {EquipmentImage} from '../components/ui/SmartImage';
import toast from 'react-hot-toast';

const DEMO_HOTSPOTS=[
  {id:1,x:18.5,y:42,name:'Oil Filter',      price:850,  in_stock:true, part_id:1,part_number:'RE504836'},
  {id:2,x:35,  y:22,name:'Air Filter',      price:1450, in_stock:true, part_id:2,part_number:'RE62418'},
  {id:3,x:52,  y:55,name:'Fuel Filter',     price:620,  in_stock:true, part_id:3,part_number:'RE522878'},
  {id:4,x:68,  y:38,name:'Water Pump',      price:4200, in_stock:true, part_id:5,part_number:'RE506285'},
  {id:5,x:45,  y:72,name:'Drive Belt',      price:780,  in_stock:true, part_id:7,part_number:'L156066'},
  {id:6,x:28,  y:60,name:'Fuel Injector',   price:8500, in_stock:false,part_id:8,part_number:'RE507740'},
  {id:7,x:75,  y:58,name:'Thermostat',      price:1200, in_stock:true, part_id:11,part_number:'RE504114'},
  {id:8,x:82,  y:28,name:'Starter Motor',   price:7200, in_stock:true, part_id:13,part_number:'RE509672'},
];

export default function DiagramPage(){
  const {id}=useParams();
  const {addToCart}=useCart(); const {isLoggedIn}=useAuth();
  const [eq,setEq]=useState(null); const [selDiag,setSelDiag]=useState(null);
  const [diagData,setDD]=useState(null); const [selPart,setSP]=useState(null);
  const [loading,setL]=useState(true); const [adding,setAdding]=useState(false);
  const [qty,setQty]=useState(1); const [wishlisted,setWL]=useState(false);

  useEffect(()=>{ equipmentAPI.getById(id).then(r=>{ setEq(r.data.data); if(r.data.data.diagrams?.length>0)setSelDiag(r.data.data.diagrams[0]); }).catch(()=>toast.error('Failed to load.')).finally(()=>setL(false)); },[id]);
  useEffect(()=>{ if(!selDiag)return; partsAPI.getHotspots(selDiag.id).then(r=>setDD(r.data.data)).catch(()=>setDD({...selDiag,hotspots:[]})); },[selDiag]);
  useEffect(()=>{ if(selPart&&isLoggedIn()){ wishlistAPI.check(selPart.part_id||selPart.id).then(r=>setWL(r.data.wishlisted)).catch(()=>{}); } },[selPart,isLoggedIn]);

  const handleAdd=async()=>{ if(!isLoggedIn()){toast.error('Please login first.');return;} try{setAdding(true);await addToCart(selPart.part_id||selPart.id,qty);toast.success(`${selPart.part_name||selPart.name} added!`);}catch(err){toast.error(err.response?.data?.message||'Failed.');}finally{setAdding(false);} };
  const handleWL=async()=>{ if(!isLoggedIn()){toast.error('Please login first.');return;} const pid=selPart.part_id||selPart.id; const r=await wishlistAPI.toggle({part_id:pid}); setWL(r.data.wishlisted); toast.success(r.data.message); };

  if(loading) return <div className="loading-center"><div className="spinner"/></div>;
  if(!eq) return <div className="container page"><p>Equipment not found.</p></div>;

  const hotspots = diagData?.hotspots?.length>0 ? diagData.hotspots : DEMO_HOTSPOTS;

  return(
    <div className="page" style={{background:'#f5f5f5'}}>
      <div className="container">
        <div style={{fontSize:13,color:'#9e9e9e',marginBottom:20}}>
          <Link to="/equipment" style={{color:'#2d8a2d',textDecoration:'none',fontWeight:600}}>Equipment</Link> <span style={{margin:'0 6px'}}>›</span>
          <span style={{color:'#424242'}}>{eq.model_name}</span>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 350px',gap:20,alignItems:'start'}}>
          {/* VIEWER */}
          <div style={{background:'white',borderRadius:16,overflow:'hidden',boxShadow:'0 2px 8px rgba(0,0,0,0.08)'}}>
            <div style={{padding:'18px 22px',borderBottom:'1px solid #f5f5f5',display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:12}}>
              <div>
                <h1 style={{fontSize:22,fontWeight:900,color:'#1a5c1a',marginBottom:2}}>{eq.model_name}</h1>
                <p style={{fontSize:13,color:'#9e9e9e'}}>{eq.model_code} · {eq.category} {eq.horsepower&&`· ${eq.horsepower}HP`}</p>
              </div>
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                {eq.diagrams?.map(d=>(
                  <button key={d.id} onClick={()=>{setSelDiag(d);setSP(null);}} style={{padding:'6px 14px',border:`2px solid ${selDiag?.id===d.id?'#1a5c1a':'#eee'}`,borderRadius:20,background:selDiag?.id===d.id?'#1a5c1a':'white',color:selDiag?.id===d.id?'white':'#424242',fontSize:13,fontWeight:700,cursor:'pointer',transition:'all 0.15s'}}>{d.diagram_type}</button>
                ))}
              </div>
            </div>

            <div style={{position:'relative',height:520,background:'#f0f4f0',overflow:'hidden'}}>
              <TransformWrapper initialScale={1} minScale={0.5} maxScale={5} centerOnInit>
                {({zoomIn,zoomOut,resetTransform})=><>
                  <div style={{position:'absolute',top:14,left:14,zIndex:10,display:'flex',flexDirection:'column',gap:4}}>
                    {[[zoomIn,'➕',],[zoomOut,'➖'],[resetTransform,'↺']].map(([fn,icon],i)=>(
                      <button key={i} onClick={()=>fn()} style={{width:36,height:36,background:'white',border:'1px solid #eee',borderRadius:9,cursor:'pointer',fontSize:15,boxShadow:'0 2px 6px rgba(0,0,0,0.1)',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.15s'}}>{icon}</button>
                    ))}
                  </div>
                  <TransformComponent wrapperStyle={{width:'100%',height:'100%'}}>
                    <div style={{position:'relative',width:700,height:500}} onClick={()=>setSP(null)}>
                      {selDiag?.image_path && !selDiag.image_path.includes('demo_')
                        ? <img src={`http://localhost:5000${selDiag.image_path}`} alt={selDiag.diagram_name} style={{width:'100%',height:'100%',objectFit:'contain',userSelect:'none',pointerEvents:'none'}}/>
                        : <div style={{width:'100%',height:'100%',background:'linear-gradient(135deg,#e8f5e9 0%,#c8e6c9 100%)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',position:'relative',borderRadius:8}}>
                            <EquipmentImage equipment={eq} height={500} style={{position:'absolute',inset:0,opacity:0.15,borderRadius:8}}/>
                            <span style={{fontSize:80,position:'relative',zIndex:1}}>📐</span>
                            <p style={{fontWeight:700,color:'#1a5c1a',marginTop:12,position:'relative',zIndex:1,fontSize:16}}>{selDiag?.diagram_name||'Engine System Diagram'}</p>
                            <p style={{fontSize:13,color:'#757575',marginTop:4,position:'relative',zIndex:1}}>Click the glowing dots to identify parts</p>
                          </div>
                      }
                      {hotspots.map(h=>(
                        <button key={h.id} onClick={e=>{e.stopPropagation();setSP(h);setQty(1);}}
                          style={{position:'absolute',left:`${h.x_percent||h.x}%`,top:`${h.y_percent||h.y}%`,transform:'translate(-50%,-50%)',background:'none',border:'none',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',zIndex:5}}>
                          <div style={{width:16,height:16,background:h.in_stock?'rgba(45,138,45,0.9)':'rgba(198,40,40,0.9)',border:'2.5px solid white',borderRadius:'50%',boxShadow:`0 0 0 ${selPart?.id===h.id?'5px':'3px'} ${h.in_stock?'rgba(45,138,45,0.25)':'rgba(198,40,40,0.2)'}`,animation:'hotspot-pulse 2s infinite',transition:'box-shadow 0.15s'}}/>
                          <div style={{background:'rgba(0,0,0,0.78)',color:'white',fontSize:11,fontWeight:700,padding:'3px 8px',borderRadius:5,marginTop:4,whiteSpace:'nowrap',opacity:selPart?.id===h.id?1:0.85}}>{h.label||h.name||h.part_name}</div>
                        </button>
                      ))}
                    </div>
                  </TransformComponent>
                </>}
              </TransformWrapper>
            </div>
            <div style={{padding:'10px 20px',background:'#e8f5e9',fontSize:12,color:'#1a5c1a',display:'flex',alignItems:'center',gap:6}}>
              <FiInfo size={13}/> Click any glowing dot to see part details · Use scroll/pinch to zoom in for more detail
            </div>
          </div>

          {/* PART PANEL */}
          <div style={{background:'white',borderRadius:16,overflow:'hidden',boxShadow:'0 2px 8px rgba(0,0,0,0.08)',minHeight:440,display:'flex',flexDirection:'column',position:'sticky',top:90}}>
            {selPart?(
              <>
                <div style={{padding:'16px 18px',background:'#1a5c1a',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <h3 style={{color:'white',fontSize:16,fontWeight:700}}>Part Details</h3>
                  <button onClick={()=>setSP(null)} style={{background:'none',border:'none',color:'rgba(255,255,255,0.7)',cursor:'pointer',padding:4,borderRadius:5,display:'flex'}}><FiX size={18}/></button>
                </div>
                <div style={{padding:18,flex:1,overflowY:'auto'}}>
                  <div style={{height:130,background:'#f9f9f9',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:56,marginBottom:16}}>⚙️</div>
                  <div style={{fontSize:10,color:'#9e9e9e',fontWeight:700,letterSpacing:0.8,textTransform:'uppercase'}}>{selPart.part_number}</div>
                  <h2 style={{fontSize:19,fontWeight:900,color:'#1a5c1a',margin:'4px 0 8px',lineHeight:1.2}}>{selPart.part_name||selPart.name}</h2>
                  {selPart.description&&<p style={{fontSize:13,color:'#757575',lineHeight:1.6,marginBottom:14}}>{selPart.description}</p>}
                  <div style={{background:'#f9f9f9',borderRadius:10,padding:'12px 14px',marginBottom:14}}>
                    <div style={{display:'flex',justifyContent:'space-between',padding:'5px 0',borderBottom:'1px solid #eee',fontSize:14}}><span style={{color:'#9e9e9e'}}>Price</span><span style={{fontWeight:900,color:'#1a5c1a',fontSize:20}}>₹{parseFloat(selPart.price).toLocaleString()}</span></div>
                    {selPart.mrp&&parseFloat(selPart.mrp)>parseFloat(selPart.price)&&<div style={{display:'flex',justifyContent:'space-between',padding:'5px 0',borderBottom:'1px solid #eee',fontSize:14}}><span style={{color:'#9e9e9e'}}>MRP</span><span style={{textDecoration:'line-through',color:'#bdbdbd'}}>₹{parseFloat(selPart.mrp).toLocaleString()}</span></div>}
                    <div style={{display:'flex',justifyContent:'space-between',padding:'5px 0',fontSize:14}}><span style={{color:'#9e9e9e'}}>Availability</span><span style={{fontWeight:700,color:selPart.in_stock?'#2e7d32':'#c62828',fontSize:13}}>{selPart.in_stock?`✓ In Stock (${selPart.available_stock} units)`:'✗ Out of Stock'}</span></div>
                  </div>
                  {selPart.in_stock&&(
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
                      <span style={{fontWeight:700,fontSize:14}}>Quantity</span>
                      <div style={{display:'flex',border:'2px solid #eee',borderRadius:9,overflow:'hidden'}}>
                        <button onClick={()=>setQty(q=>Math.max(1,q-1))} style={{width:34,height:36,border:'none',background:'#f9f9f9',cursor:'pointer',fontSize:18,fontWeight:700,color:'#1a5c1a'}}>−</button>
                        <span style={{width:40,height:36,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:15}}>{qty}</span>
                        <button onClick={()=>setQty(q=>q+1)} style={{width:34,height:36,border:'none',background:'#f9f9f9',cursor:'pointer',fontSize:18,fontWeight:700,color:'#1a5c1a'}}>+</button>
                      </div>
                    </div>
                  )}
                  <div style={{display:'flex',flexDirection:'column',gap:8}}>
                    <button className="btn btn-primary btn-block" disabled={!selPart.in_stock||adding} onClick={handleAdd}><FiShoppingCart/>{adding?'Adding…':selPart.in_stock?'Add to Cart':'Out of Stock'}</button>
                    <div style={{display:'flex',gap:8}}>
                      <Link to={`/parts/${selPart.part_id||selPart.id}`} className="btn btn-outline" style={{flex:1,textAlign:'center'}}>Full Details</Link>
                      <button className="btn btn-sm" style={{background:wishlisted?'#ffebee':'#f5f5f5',color:wishlisted?'#c62828':'#9e9e9e',border:'none',borderRadius:8,width:40,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={handleWL}><FiHeart size={15} style={{fill:wishlisted?'#c62828':'none'}}/></button>
                    </div>
                  </div>
                </div>
              </>
            ):(
              <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'40px 20px',textAlign:'center',color:'#9e9e9e'}}>
                <span style={{fontSize:52,marginBottom:14}}>👆</span>
                <p style={{fontSize:14,lineHeight:1.6,fontWeight:500}}>Click any glowing dot in the diagram to see part details and add to cart</p>
                <div style={{marginTop:20,padding:'12px 16px',background:'#e8f5e9',borderRadius:10,fontSize:13,color:'#2e7d32',lineHeight:1.5}}>
                  <strong>Tip:</strong> Green dots = In Stock<br/>Red dots = Out of Stock
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes hotspot-pulse{0%,100%{opacity:1}50%{opacity:0.6}}`}</style>
    </div>
  );
}
