
import React,{useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {FiCheck,FiArrowLeft,FiCreditCard,FiTruck,FiClipboard} from 'react-icons/fi';
import {motion,AnimatePresence} from 'framer-motion';
import {orderAPI} from '../utils/api';
import {useCart} from '../context/CartContext';
import toast from 'react-hot-toast';

const STEPS=[{icon:FiTruck,label:'Shipping'},{icon:FiCreditCard,label:'Payment'},{icon:FiClipboard,label:'Review'}];

export default function CheckoutPage(){
  const navigate=useNavigate();
  const {cart,clearCart}=useCart();
  const [step,setStep]=useState(1);
  const [loading,setL]=useState(false);
  const [form,setF]=useState({
    shipping_name:'',shipping_phone:'',shipping_address:'',shipping_city:'',shipping_state:'',shipping_pincode:'',
    payment_method:'UPI',upi_id:'',notes:''
  });
  const set=(k,v)=>setF(f=>({...f,[k]:v}));
  const inp={width:'100%',padding:'12px 14px',border:'2px solid #eee',borderRadius:10,fontSize:15,outline:'none',marginTop:5,transition:'border 0.2s'};
  const lbl={display:'block',fontWeight:600,fontSize:14,color:'#424242'};
  const canProceed=form.shipping_name&&form.shipping_phone&&form.shipping_address&&form.shipping_city&&form.shipping_state&&form.shipping_pincode;
  const shipping=(cart.total||0)>5000?0:150;
  const grand=parseFloat(cart.grand_total||0)+shipping;

  const handleOrder=async()=>{
    try{
      setL(true);
      const res=await orderAPI.place(form);
      await clearCart();
      toast.success('🎉 Order placed successfully!');
      navigate(`/orders/${res.data.data.order_id}`);
    }catch(err){toast.error(err.response?.data?.message||'Order failed. Please try again.');}
    finally{setL(false);}
  };

  return(
    <div className="page" style={{background:'#f5f5f5'}}>
      <div className="container" style={{maxWidth:700}}>
        <h1 className="section-title">Checkout</h1>

        {/* Step bar */}
        <div style={{display:'flex',gap:0,marginBottom:32,background:'white',borderRadius:12,overflow:'hidden',boxShadow:'0 1px 4px rgba(0,0,0,0.08)'}}>
          {STEPS.map(({icon:Icon,label},i)=>{
            const idx=i+1,done=step>idx,cur=step===idx;
            return(
              <div key={i} onClick={()=>done&&setStep(idx)}
                style={{flex:1,padding:'14px 10px',display:'flex',alignItems:'center',justifyContent:'center',gap:8,
                  background:done?'#e8f5e9':cur?'#1a5c1a':'#fafafa',
                  color:done?'#2e7d32':cur?'white':'#bdbdbd',
                  fontWeight:700,fontSize:13,cursor:done?'pointer':'default',
                  borderRight:i<2?'1px solid #eee':'none',transition:'all 0.2s'}}>
                {done?<FiCheck size={14}/>:<Icon size={14}/>}{label}
              </div>
            );
          })}
        </div>

        <div className="card card-body">
          <AnimatePresence mode="wait">
            {/* STEP 1 */}
            {step===1&&(
              <motion.div key="s1" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
                <h2 style={{fontSize:20,fontWeight:800,color:'#1a5c1a',marginBottom:20}}>📍 Shipping Address</h2>
                <div className="grid grid-2" style={{gap:14}}>
                  {[['Full Name','shipping_name','text','Demo Customer'],['Phone Number','shipping_phone','tel','10-digit mobile']].map(([l,k,t,ph])=>(
                    <div key={k}><label style={lbl}>{l}</label><input type={t} value={form[k]} placeholder={ph} onChange={e=>set(k,e.target.value)} style={inp}/></div>
                  ))}
                </div>
                <div style={{marginTop:14}}><label style={lbl}>Street Address</label><input value={form.shipping_address} placeholder="House no, Street, Area, Landmark" onChange={e=>set('shipping_address',e.target.value)} style={inp}/></div>
                <div className="grid grid-3" style={{gap:14,marginTop:14}}>
                  {[['City','shipping_city','Pune'],['State','shipping_state','Maharashtra'],['PIN Code','shipping_pincode','411001']].map(([l,k,ph])=>(
                    <div key={k}><label style={lbl}>{l}</label><input value={form[k]} placeholder={ph} onChange={e=>set(k,e.target.value)} style={inp}/></div>
                  ))}
                </div>
                <div style={{marginTop:14}}><label style={lbl}>Order Notes (optional)</label><textarea value={form.notes} placeholder="Special delivery instructions..." onChange={e=>set('notes',e.target.value)} style={{...inp,height:80,resize:'vertical'}}/></div>
                <button className="btn btn-primary btn-lg" style={{marginTop:24}} disabled={!canProceed} onClick={()=>setStep(2)}>Continue to Payment →</button>
              </motion.div>
            )}

            {/* STEP 2 */}
            {step===2&&(
              <motion.div key="s2" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
                <h2 style={{fontSize:20,fontWeight:800,color:'#1a5c1a',marginBottom:20}}>💳 Payment Method</h2>
                <div style={{display:'flex',flexDirection:'column',gap:10}}>
                  {[['UPI','📱 UPI (Google Pay / PhonePe / Paytm)'],['CREDIT_CARD','💳 Credit Card'],['DEBIT_CARD','🏧 Debit Card'],['NET_BANKING','🏦 Net Banking'],['COD','📦 Cash on Delivery']].map(([val,lbl2])=>(
                    <label key={val} style={{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',border:`2px solid ${form.payment_method===val?'#1a5c1a':'#eee'}`,borderRadius:12,cursor:'pointer',background:form.payment_method===val?'#e8f5e9':'white',transition:'all 0.15s'}}>
                      <input type="radio" name="pm" value={val} checked={form.payment_method===val} onChange={()=>set('payment_method',val)} style={{width:18,height:18,accentColor:'#1a5c1a'}}/>
                      <span style={{fontWeight:600,fontSize:15}}>{lbl2}</span>
                      {form.payment_method===val&&val!=='COD'&&<span style={{marginLeft:'auto',fontSize:12,color:'#2e7d32',fontWeight:700}}>✓ Selected</span>}
                    </label>
                  ))}
                </div>
                {form.payment_method==='UPI'&&(
                  <div style={{marginTop:16,padding:16,background:'#f0faf0',borderRadius:10,border:'1px solid #c8e6c9'}}>
                    <label style={lbl}>UPI ID</label>
                    <input value={form.upi_id} placeholder="yourname@ybl" onChange={e=>set('upi_id',e.target.value)} style={inp}/>
                    <p style={{fontSize:12,color:'#757575',marginTop:6}}>Enter your UPI ID to complete payment after order placement.</p>
                  </div>
                )}
                {form.payment_method==='COD'&&<div style={{marginTop:12,padding:'12px 14px',background:'#fff8e1',borderRadius:9,fontSize:13,color:'#e65100'}}>⚠️ Cash on Delivery — Pay when parts arrive. ₹50 COD handling charge applies.</div>}
                <div style={{display:'flex',gap:10,marginTop:24}}>
                  <button className="btn btn-outline" onClick={()=>setStep(1)}><FiArrowLeft/>Back</button>
                  <button className="btn btn-primary btn-lg" style={{flex:1}} onClick={()=>setStep(3)}>Review Order →</button>
                </div>
              </motion.div>
            )}

            {/* STEP 3 */}
            {step===3&&(
              <motion.div key="s3" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
                <h2 style={{fontSize:20,fontWeight:800,color:'#1a5c1a',marginBottom:20}}>📋 Review & Confirm</h2>

                {[{title:'📍 Shipping To',content:<><p style={{fontWeight:700,color:'#424242'}}>{form.shipping_name} · {form.shipping_phone}</p><p style={{fontSize:13,color:'#757575',marginTop:2}}>{form.shipping_address}, {form.shipping_city}, {form.shipping_state} — {form.shipping_pincode}</p></>,edit:()=>setStep(1)},
                  {title:'💳 Payment',content:<p style={{fontWeight:600,color:'#424242'}}>{form.payment_method.replace(/_/g,' ')}{form.upi_id&&` · ${form.upi_id}`}</p>,edit:()=>setStep(2)}].map(({title,content,edit})=>(
                  <div key={title} style={{background:'#f9f9f9',borderRadius:10,padding:16,marginBottom:14,border:'1px solid #eee'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                      <h4 style={{fontWeight:700,color:'#424242',fontSize:14}}>{title}</h4>
                      <button onClick={edit} style={{background:'none',border:'none',color:'#2d8a2d',fontSize:12,fontWeight:700,cursor:'pointer'}}>Edit</button>
                    </div>
                    {content}
                  </div>
                ))}

                <div style={{background:'#f9f9f9',borderRadius:10,padding:16,border:'1px solid #eee',marginBottom:14}}>
                  <h4 style={{fontWeight:700,color:'#424242',fontSize:14,marginBottom:12}}>📦 Items ({cart.items?.length})</h4>
                  {cart.items?.map(item=>(
                    <div key={item.id} style={{display:'flex',justifyContent:'space-between',fontSize:14,marginBottom:8,alignItems:'center'}}>
                      <div><span style={{fontWeight:600}}>{item.part_name}</span><span style={{color:'#9e9e9e',marginLeft:8}}>× {item.quantity}</span></div>
                      <span style={{fontWeight:700,color:'#1a5c1a'}}>₹{parseFloat(item.subtotal).toLocaleString()}</span>
                    </div>
                  ))}
                  <div style={{borderTop:'2px solid #eee',paddingTop:12,marginTop:8}}>
                    {[['Subtotal',`₹${parseFloat(cart.total||0).toLocaleString()}`],['GST (18%)',`₹${parseFloat(cart.tax||0).toFixed(2)}`],['Shipping',shipping===0?'FREE 🎉':`₹${shipping}`]].map(([l,v])=>(
                      <div key={l} style={{display:'flex',justifyContent:'space-between',fontSize:14,marginBottom:6}}><span style={{color:'#9e9e9e'}}>{l}</span><span style={{fontWeight:600,color:v.includes('FREE')?'#2e7d32':'#424242'}}>{v}</span></div>
                    ))}
                    <div style={{display:'flex',justifyContent:'space-between',fontWeight:900,fontSize:20,marginTop:8,paddingTop:8,borderTop:'1px solid #ddd'}}>
                      <span>Grand Total</span><span style={{color:'#1a5c1a'}}>₹{grand.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div style={{display:'flex',gap:10}}>
                  <button className="btn btn-outline" onClick={()=>setStep(2)}><FiArrowLeft/>Back</button>
                  <button className="btn btn-primary btn-lg" style={{flex:1}} disabled={loading} onClick={handleOrder}>
                    {loading?'⏳ Placing Order…':`✅ Place Order — ₹${grand.toLocaleString()}`}
                  </button>
                </div>
                <p style={{fontSize:12,color:'#bdbdbd',textAlign:'center',marginTop:12}}>By placing this order you agree to our terms. Payments are processed securely.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
