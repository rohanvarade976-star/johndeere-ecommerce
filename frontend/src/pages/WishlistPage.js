
import React,{useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {FiHeart,FiShoppingCart,FiTrash2} from 'react-icons/fi';
import {wishlistAPI} from '../utils/api';
import {useCart} from '../context/CartContext';
import {PartImage} from '../components/ui/SmartImage';
import toast from 'react-hot-toast';
export default function WishlistPage(){
  const [items,setItems]=useState([]); const [loading,setL]=useState(true);
  const {addToCart} = useCart();
  useEffect(()=>{ wishlistAPI.get().then(r=>setItems(r.data.data)).catch(()=>{}).finally(()=>setL(false)); },[]);
  const remove=async(part_id)=>{ await wishlistAPI.toggle({part_id}); setItems(i=>i.filter(x=>x.part_id!==part_id)); toast.success('Removed from wishlist.'); };
  const add=async(part)=>{ try{await addToCart(part.part_id,1);toast.success(`${part.part_name} added to cart!`);}catch(err){toast.error(err.response?.data?.message||'Failed.');} };
  if(loading) return <div className="loading-center"><div className="spinner"/></div>;
  return(
    <div className="page"><div className="container">
      <h1 className="section-title">My Wishlist</h1>
      {items.length===0?(
        <div style={{textAlign:'center',padding:'80px 0',background:'white',borderRadius:12}}>
          <FiHeart size={60} style={{color:'#eee',marginBottom:16}}/>
          <h3 style={{marginBottom:8}}>Your wishlist is empty</h3>
          <Link to="/parts" className="btn btn-primary" style={{marginTop:16}}>Browse Parts</Link>
        </div>
      ):(
        <div className="grid grid-4">
          {items.map(item=>(
            <div key={item.id} className="card" style={{display:'flex',flexDirection:'column'}}>
              <Link to={`/parts/${item.part_id}`} style={{textDecoration:'none',color:'inherit',flex:1}}>
                <div style={{height:160,background:'#f9f9f9',overflow:'hidden',position:'relative'}}>
                  <PartImage part={{...item,id:item.part_id}}/>
                  <span style={{position:'absolute',top:8,left:8,background:item.in_stock?'#1a5c1a':'#c62828',color:'white',fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:20}}>{item.in_stock?'In Stock':'Out of Stock'}</span>
                </div>
                <div style={{padding:'12px 14px 8px'}}>
                  <div style={{fontSize:10,color:'#9e9e9e',fontWeight:700,letterSpacing:0.8,textTransform:'uppercase',marginBottom:3}}>{item.part_number}</div>
                  <h3 style={{fontWeight:800,color:'#1a1a1a',fontSize:15,marginBottom:0}}>{item.part_name}</h3>
                </div>
              </Link>
              <div style={{padding:'8px 14px 14px',borderTop:'1px solid #f5f5f5',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style={{fontWeight:900,color:'#1a5c1a',fontSize:18}}>₹{parseFloat(item.price).toLocaleString()}</span>
                <div style={{display:'flex',gap:6}}>
                  <button className="btn btn-primary btn-sm" disabled={!item.in_stock} onClick={()=>add(item)}><FiShoppingCart size={13}/></button>
                  <button className="btn btn-sm" style={{background:'#ffebee',color:'#c62828',border:'none'}} onClick={()=>remove(item.part_id)}><FiTrash2 size={13}/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div></div>
  );
}
