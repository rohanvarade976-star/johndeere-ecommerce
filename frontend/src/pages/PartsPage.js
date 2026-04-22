
import React,{useEffect,useState} from 'react';
import {Link,useSearchParams} from 'react-router-dom';
import {FiSearch,FiShoppingCart,FiHeart,FiFilter} from 'react-icons/fi';
import {motion} from 'framer-motion';
import {partsAPI,wishlistAPI} from '../utils/api';
import {useCart} from '../context/CartContext';
import {useAuth} from '../context/AuthContext';
import {PartImage} from '../components/ui/SmartImage';
import {RatingDisplay} from '../components/ui/StarRating';
import {ProductCardSkeleton} from '../components/ui/Skeleton';
import toast from 'react-hot-toast';

export default function PartsPage(){
  const [sp]=useSearchParams();
  const [parts,setParts]=useState([]); const [loading,setL]=useState(true);
  const [search,setS]=useState(sp.get('search')||''); const [cat,setCat]=useState(sp.get('category')||'');
  const [inStock,setIS]=useState(false); const [sort,setSort]=useState('popular');
  const [addingId,setAID]=useState(null); const [wishlist,setWL]=useState(new Set());
  const {addToCart}=useCart(); const {isLoggedIn}=useAuth();
  const catColors={ENGINE:'#e65100',HYDRAULIC:'#1565c0',ELECTRICAL:'#f9a825',STRUCTURAL:'#4e342e',TRANSMISSION:'#6a1b9a'};

  useEffect(()=>{
    setL(true);
    const p={};
    if(search)p.search=search; if(cat)p.category=cat; if(inStock)p.in_stock='true'; if(sort)p.sort=sort;
    partsAPI.getAll(p).then(r=>setParts(r.data.data)).catch(()=>{}).finally(()=>setL(false));
  },[search,cat,inStock,sort]);

  useEffect(()=>{
    if(isLoggedIn()) wishlistAPI.get().then(r=>setWL(new Set(r.data.data.map(i=>i.part_id)))).catch(()=>{});
  },[isLoggedIn]);

  const handleAdd=async(part)=>{ if(!isLoggedIn()){toast.error('Please login first.');return;} try{setAID(part.id);await addToCart(part.id,1);toast.success(`${part.part_name} added!`);}catch(err){toast.error(err.response?.data?.message||'Failed.');}finally{setAID(null);} };
  const toggleWL=async(part_id)=>{ if(!isLoggedIn()){toast.error('Please login first.');return;} try{const r=await wishlistAPI.toggle({part_id});if(r.data.wishlisted){setWL(s=>new Set([...s,part_id]));toast.success('Added to wishlist!');}else{setWL(s=>{const n=new Set(s);n.delete(part_id);return n;});toast('Removed from wishlist');}}catch{toast.error('Failed.');} };

  return(
    <div className="page" style={{background:'#f5f5f5'}}>
      <div className="container">
        <div style={{background:'linear-gradient(135deg,#1a5c1a,#367c2b)',borderRadius:16,padding:'36px 32px',marginBottom:32,position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',right:16,bottom:-20,fontSize:160,opacity:0.05}}>⚙️</div>
          <h1 style={{color:'white',fontSize:30,fontWeight:900,marginBottom:6}}>Parts Catalog</h1>
          <p style={{color:'rgba(255,255,255,0.8)',fontSize:15}}>Genuine John Deere OEM replacement parts with fast delivery</p>
        </div>

        <div style={{background:'white',borderRadius:12,padding:'16px 20px',marginBottom:24,boxShadow:'0 1px 4px rgba(0,0,0,0.08)',display:'flex',flexWrap:'wrap',gap:14,alignItems:'center'}}>
          <div style={{position:'relative',flex:1,minWidth:240}}>
            <FiSearch style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'#bdbdbd'}}/>
            <input type="text" placeholder="Search by part name, number, description..." value={search} onChange={e=>setS(e.target.value)} style={{width:'100%',padding:'10px 14px 10px 38px',border:'2px solid #eee',borderRadius:9,fontSize:15,outline:'none'}}/>
          </div>
          <select value={cat} onChange={e=>setCat(e.target.value)} style={{padding:'10px 14px',border:'2px solid #eee',borderRadius:9,fontSize:14,outline:'none',cursor:'pointer',background:'white',fontWeight:600}}>
            {['','ENGINE','HYDRAULIC','ELECTRICAL','STRUCTURAL','TRANSMISSION'].map(c=><option key={c} value={c}>{c||'⚙️ All Categories'}</option>)}
          </select>
          <select value={sort} onChange={e=>setSort(e.target.value)} style={{padding:'10px 14px',border:'2px solid #eee',borderRadius:9,fontSize:14,outline:'none',cursor:'pointer',background:'white',fontWeight:600}}>
            {[['popular','Most Popular'],['newest','Newest'],['price_asc','Price: Low to High'],['price_desc','Price: High to Low'],['rating','Best Rated']].map(([v,l])=><option key={v} value={v}>{l}</option>)}
          </select>
          <label style={{display:'flex',alignItems:'center',gap:8,fontSize:14,cursor:'pointer',fontWeight:600,color:'#424242',userSelect:'none'}}>
            <input type="checkbox" checked={inStock} onChange={e=>setIS(e.target.checked)} style={{width:17,height:17,accentColor:'#2d8a2d'}}/>
            In Stock Only
          </label>
          <span style={{fontSize:13,color:'#9e9e9e',marginLeft:'auto'}}>{parts.length} parts found</span>
        </div>

        {loading?(
          <div className="grid grid-4">{[1,2,3,4,5,6,7,8].map(i=><ProductCardSkeleton key={i}/>)}</div>
        ):parts.length===0?(
          <div style={{textAlign:'center',padding:'80px 0',background:'white',borderRadius:12}}>
            <div style={{fontSize:60,marginBottom:16}}>🔍</div>
            <h3>No parts found</h3>
            <p style={{color:'#757575',marginTop:8}}>Try different search terms</p>
          </div>
        ):(
          <div className="grid grid-4">
            {parts.map((part,i)=>(
              <motion.div key={part.id} className="card" style={{display:'flex',flexDirection:'column'}} initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:Math.min(i*0.04,0.3)}} whileHover={{y:-4,boxShadow:'0 8px 24px rgba(0,0,0,0.12)'}}>
                <Link to={`/parts/${part.id}`} style={{textDecoration:'none',color:'inherit',flex:1}}>
                  <div style={{height:168,background:'#f9f9f9',position:'relative',overflow:'hidden'}}>
                    <PartImage part={part}/>
                    <span style={{position:'absolute',top:9,left:9,background:part.in_stock?'#1a5c1a':'#c62828',color:'white',fontSize:11,fontWeight:700,padding:'3px 9px',borderRadius:20}}>{part.in_stock?'✓ In Stock':'✗ Out'}</span>
                    <span style={{position:'absolute',top:9,right:9,background:catColors[part.category]||'#424242',color:'white',fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:20,opacity:0.9}}>{part.category}</span>
                    {part.discount_pct>0&&<span style={{position:'absolute',bottom:9,left:9,background:'#c62828',color:'white',fontSize:11,fontWeight:800,padding:'2px 8px',borderRadius:20}}>{part.discount_pct}% OFF</span>}
                    <button onClick={e=>{e.preventDefault();toggleWL(part.id);}} style={{position:'absolute',bottom:9,right:9,background:'white',border:'none',borderRadius:20,width:30,height:30,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',boxShadow:'0 2px 6px rgba(0,0,0,0.15)'}}>
                      <FiHeart size={14} style={{color:wishlist.has(part.id)?'#c62828':'#bdbdbd',fill:wishlist.has(part.id)?'#c62828':'none'}}/>
                    </button>
                  </div>
                  <div style={{padding:'12px 14px 6px'}}>
                    <div style={{fontSize:10,color:'#9e9e9e',fontWeight:700,letterSpacing:0.8,textTransform:'uppercase',marginBottom:3}}>{part.part_number}</div>
                    <h3 style={{fontWeight:800,color:'#1a1a1a',fontSize:15,marginBottom:5,lineHeight:1.3}}>{part.part_name}</h3>
                    {parseFloat(part.avg_rating)>0&&<RatingDisplay rating={part.avg_rating} count={part.review_count} size={12}/>}
                  </div>
                </Link>
                <div style={{padding:'8px 14px 14px',borderTop:'1px solid #f5f5f5',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div>
                    <span style={{fontSize:18,fontWeight:900,color:'#1a5c1a'}}>₹{parseFloat(part.price).toLocaleString()}</span>
                    {part.mrp&&parseFloat(part.mrp)>parseFloat(part.price)&&<span style={{fontSize:11,color:'#bdbdbd',textDecoration:'line-through',marginLeft:4}}>₹{parseFloat(part.mrp).toLocaleString()}</span>}
                  </div>
                  <button className="btn btn-primary btn-sm" disabled={!part.in_stock||addingId===part.id} onClick={()=>handleAdd(part)}>
                    <FiShoppingCart size={12}/>{addingId===part.id?'…':'Add'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
