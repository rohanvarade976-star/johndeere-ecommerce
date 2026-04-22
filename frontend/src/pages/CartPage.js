
import React from 'react';
import {Link,useNavigate} from 'react-router-dom';
import {FiTrash2,FiShoppingCart,FiArrowRight,FiTag} from 'react-icons/fi';
import {useCart} from '../context/CartContext';
import {PartImage} from '../components/ui/SmartImage';
import toast from 'react-hot-toast';

export default function CartPage(){
  const {cart,loading,updateItem,removeItem,clearCart}=useCart();
  const navigate=useNavigate();
  if(loading) return <div className="loading-center"><div className="spinner"/></div>;
  const shipping=(cart.total||0)>5000?0:150;
  return(
    <div className="page" style={{background:'#f5f5f5'}}>
      <div className="container">
        <h1 className="section-title">Shopping Cart</h1>
        {!cart.items?.length?(
          <div style={{textAlign:'center',padding:'80px 0',background:'white',borderRadius:14,boxShadow:'0 1px 4px rgba(0,0,0,0.08)'}}>
            <FiShoppingCart size={64} style={{color:'#eee',marginBottom:16}}/>
            <h3 style={{color:'#424242',marginBottom:8,fontSize:22}}>Your cart is empty</h3>
            <p style={{color:'#9e9e9e',marginBottom:28}}>Browse equipment diagrams to identify and add parts</p>
            <div style={{display:'flex',gap:12,justifyContent:'center'}}>
              <Link to="/equipment" className="btn btn-primary">Browse Equipment</Link>
              <Link to="/parts" className="btn btn-outline">Parts Catalog</Link>
            </div>
          </div>
        ):(
          <div style={{display:'grid',gridTemplateColumns:'1fr 340px',gap:24,alignItems:'start'}}>
            <div>
              <div style={{background:'white',borderRadius:14,overflow:'hidden',boxShadow:'0 1px 4px rgba(0,0,0,0.08)'}}>
                <div style={{padding:'16px 20px',borderBottom:'1px solid #f5f5f5',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{fontWeight:700,fontSize:16}}>{cart.items.length} item{cart.items.length!==1?'s':''}</span>
                  <button onClick={()=>{clearCart();toast.success('Cart cleared.');}} style={{background:'none',border:'none',color:'#c62828',fontSize:13,fontWeight:700,cursor:'pointer'}}>Clear All</button>
                </div>
                {cart.items.map((item,idx)=>(
                  <div key={item.id} style={{display:'flex',gap:16,padding:'16px 20px',alignItems:'center',borderBottom:idx<cart.items.length-1?'1px solid #f9f9f9':'none'}}>
                    <div style={{width:80,height:80,borderRadius:10,overflow:'hidden',flexShrink:0,background:'#f9f9f9'}}>
                      <PartImage part={{image_url:item.image_url,part_number:item.part_number}} height={80}/>
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:11,color:'#9e9e9e',fontWeight:700,letterSpacing:0.5}}>{item.part_number}</div>
                      <div style={{fontWeight:700,color:'#1a5c1a',fontSize:15,marginTop:2}}>{item.part_name}</div>
                      <div style={{fontSize:13,color:'#9e9e9e',marginTop:2}}>₹{parseFloat(item.unit_price).toLocaleString()} each</div>
                    </div>
                    <div style={{display:'flex',alignItems:'center',border:'2px solid #eee',borderRadius:9,overflow:'hidden',flexShrink:0}}>
                      <button onClick={()=>updateItem(item.id,item.quantity-1)} style={{width:34,height:34,border:'none',background:'#f9f9f9',cursor:'pointer',fontSize:18,fontWeight:700,color:'#1a5c1a'}}>−</button>
                      <span style={{width:38,textAlign:'center',fontWeight:800,fontSize:15}}>{item.quantity}</span>
                      <button onClick={()=>updateItem(item.id,item.quantity+1)} style={{width:34,height:34,border:'none',background:'#f9f9f9',cursor:'pointer',fontSize:18,fontWeight:700,color:'#1a5c1a'}}>+</button>
                    </div>
                    <div style={{fontWeight:900,color:'#1a5c1a',fontSize:17,minWidth:90,textAlign:'right',flexShrink:0}}>₹{parseFloat(item.subtotal).toLocaleString()}</div>
                    <button onClick={()=>{removeItem(item.id);toast.success('Item removed.');}} style={{background:'none',border:'none',color:'#ddd',cursor:'pointer',padding:6,borderRadius:6,flexShrink:0,transition:'color 0.15s'}} onMouseEnter={e=>e.target.style.color='#c62828'} onMouseLeave={e=>e.target.style.color='#ddd'}><FiTrash2 size={16}/></button>
                  </div>
                ))}
              </div>
              <Link to="/parts" style={{display:'inline-flex',alignItems:'center',gap:6,marginTop:14,color:'#2d8a2d',textDecoration:'none',fontSize:14,fontWeight:600}}>← Continue Shopping</Link>
            </div>

            <div style={{background:'white',borderRadius:14,overflow:'hidden',boxShadow:'0 1px 4px rgba(0,0,0,0.08)',position:'sticky',top:90}}>
              <div style={{padding:'16px 20px',background:'#1a5c1a',color:'white'}}>
                <h3 style={{fontWeight:700,fontSize:17}}>Order Summary</h3>
              </div>
              <div style={{padding:20}}>
                {[['Subtotal',`₹${parseFloat(cart.total||0).toLocaleString()}`],['GST (18%)',`₹${parseFloat(cart.tax||0).toFixed(2)}`],['Shipping',shipping===0?'FREE 🎉':`₹${shipping}`]].map(([l,v])=>(
                  <div key={l} style={{display:'flex',justifyContent:'space-between',marginBottom:10,fontSize:14}}>
                    <span style={{color:'#9e9e9e'}}>{l}</span>
                    <span style={{fontWeight:600,color:v.includes('FREE')?'#2e7d32':'#424242'}}>{v}</span>
                  </div>
                ))}
                <div style={{borderTop:'2px solid #eee',paddingTop:14,marginTop:6,display:'flex',justifyContent:'space-between',fontWeight:900,fontSize:20}}>
                  <span>Total</span><span style={{color:'#1a5c1a'}}>₹{(parseFloat(cart.grand_total||0)).toLocaleString()}</span>
                </div>
                {shipping===0&&<div style={{background:'#e8f5e9',borderRadius:8,padding:'8px 12px',marginTop:12,fontSize:12,color:'#2e7d32',fontWeight:600}}>🎉 Free shipping applied!</div>}
                {shipping>0&&<div style={{background:'#fff8e1',borderRadius:8,padding:'8px 12px',marginTop:12,fontSize:12,color:'#e65100'}}>Add ₹{(5000-parseFloat(cart.total||0)).toFixed(0)} more for free shipping</div>}
                <button className="btn btn-primary btn-block btn-lg" style={{marginTop:16}} onClick={()=>navigate('/checkout')}><FiArrowRight/> Proceed to Checkout</button>
                <Link to="/parts" className="btn btn-outline btn-block" style={{marginTop:8,textAlign:'center'}}>Continue Shopping</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
