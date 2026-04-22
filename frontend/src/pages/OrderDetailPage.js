
import React,{useEffect,useState} from 'react';
import {useParams,Link} from 'react-router-dom';
import {FiArrowLeft,FiDownload,FiCheck} from 'react-icons/fi';
import {orderAPI} from '../utils/api';

const STATUS_STEPS=['PENDING','CONFIRMED','PROCESSING','SHIPPED','OUT_FOR_DELIVERY','DELIVERED'];
const STATUS_CONFIG={
  PENDING:{color:'#e65100',bg:'#fff3e0',emoji:'⏳'},CONFIRMED:{color:'#1565c0',bg:'#e3f2fd',emoji:'✅'},
  PROCESSING:{color:'#6a1b9a',bg:'#f3e5f5',emoji:'⚙️'},SHIPPED:{color:'#0277bd',bg:'#e1f5fe',emoji:'🚚'},
  OUT_FOR_DELIVERY:{color:'#2e7d32',bg:'#e8f5e9',emoji:'📦'},DELIVERED:{color:'#1b5e20',bg:'#e8f5e9',emoji:'🎉'},
  CANCELLED:{color:'#c62828',bg:'#ffebee',emoji:'❌'},REFUNDED:{color:'#4e342e',bg:'#efebe9',emoji:'↩️'}
};

const downloadInvoice=(order,items)=>{
  const lines=items.map(i=>`  ${i.part_name.padEnd(30)} x${i.quantity}   ₹${parseFloat(i.sub_total).toLocaleString()}`).join('\n');
  const content=`JOHN DEERE PARTS SYSTEM
================================
INVOICE
================================
Order Number : ${order.order_number}
Order Date   : ${new Date(order.order_date).toLocaleDateString('en-IN')}
Status       : ${order.status}
--------------------------------
ITEMS:
${lines}
--------------------------------
Subtotal     : ₹${parseFloat(order.subtotal||order.total_amount).toLocaleString()}
GST (18%)    : ₹${parseFloat(order.tax_amount||0).toLocaleString()}
Shipping     : ${parseFloat(order.shipping_amount||0)===0?'FREE':`₹${order.shipping_amount}`}
================================
TOTAL        : ₹${parseFloat(order.total_amount).toLocaleString()}
================================
Ship To: ${order.shipping_name}
${order.shipping_address}, ${order.shipping_city}
${order.shipping_state} - ${order.shipping_pincode}
Ph: ${order.shipping_phone}
================================
Thank you for choosing John Deere Parts!
MITAOE × ThoughtWorks Academic Project
`;
  const blob=new Blob([content],{type:'text/plain'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url; a.download=`Invoice_${order.order_number}.txt`; a.click();
  URL.revokeObjectURL(url);
};

export default function OrderDetailPage(){
  const {id}=useParams();
  const [order,setOrder]=useState(null);
  useEffect(()=>{orderAPI.getById(id).then(r=>setOrder(r.data.data)).catch(()=>{});}, [id]);
  if(!order) return <div className="loading-center"><div className="spinner"/></div>;
  const cfg=STATUS_CONFIG[order.status]||STATUS_CONFIG.PENDING;
  const curIdx=STATUS_STEPS.indexOf(order.status);
  const isCancelled=['CANCELLED','REFUNDED'].includes(order.status);

  return(
    <div className="page" style={{background:'#f5f5f5'}}>
      <div className="container" style={{maxWidth:820}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24,flexWrap:'wrap',gap:12}}>
          <Link to="/orders" style={{display:'flex',alignItems:'center',gap:6,color:'#2d8a2d',textDecoration:'none',fontWeight:600}}><FiArrowLeft/>Back to Orders</Link>
          <button onClick={()=>downloadInvoice(order,order.items||[])} className="btn btn-outline btn-sm"><FiDownload size={14}/>Download Invoice</button>
        </div>

        {/* Header */}
        <div style={{background:'white',borderRadius:14,padding:24,marginBottom:20,boxShadow:'0 2px 8px rgba(0,0,0,0.07)'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:12}}>
            <div>
              <h1 style={{fontSize:22,fontWeight:900,color:'#1a5c1a',marginBottom:4}}>Order #{order.order_number}</h1>
              <p style={{fontSize:14,color:'#9e9e9e'}}>Placed on {new Date(order.order_date).toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p>
            </div>
            <span style={{background:cfg.bg,color:cfg.color,fontWeight:800,fontSize:15,padding:'6px 18px',borderRadius:24}}>{cfg.emoji} {order.status}</span>
          </div>
          {order.tracking_number&&(
            <div style={{marginTop:14,padding:'12px 16px',background:'#e3f2fd',borderRadius:10,fontSize:14}}>
              🚚 <strong>Tracking Number:</strong> {order.tracking_number}
              {order.estimated_delivery&&<span style={{marginLeft:16,color:'#9e9e9e'}}>Est. Delivery: {new Date(order.estimated_delivery).toLocaleDateString('en-IN')}</span>}
            </div>
          )}
        </div>

        {/* Order Progress */}
        {!isCancelled&&(
          <div style={{background:'white',borderRadius:14,padding:24,marginBottom:20,boxShadow:'0 2px 8px rgba(0,0,0,0.07)'}}>
            <h3 style={{fontWeight:800,color:'#1a5c1a',marginBottom:20}}>Order Progress</h3>
            <div style={{display:'flex',justifyContent:'space-between',position:'relative'}}>
              <div style={{position:'absolute',top:16,left:'8%',right:'8%',height:3,background:'#eee',zIndex:0}}>
                <div style={{height:'100%',background:'#1a5c1a',transition:'width 0.5s',width:curIdx>=0?`${Math.min((curIdx/(STATUS_STEPS.length-1))*100,100)}%`:'0%'}}/>
              </div>
              {STATUS_STEPS.map((s,i)=>{
                const done=i<=curIdx,active=i===curIdx;
                return(
                  <div key={s} style={{display:'flex',flexDirection:'column',alignItems:'center',zIndex:1}}>
                    <div style={{width:34,height:34,borderRadius:'50%',background:done?'#1a5c1a':'white',border:done?'none':`2px solid ${active?'#1a5c1a':'#eee'}`,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:8,transition:'all 0.3s',boxShadow:active?'0 0 0 4px rgba(26,92,26,0.2)':'none'}}>
                      {done?<FiCheck size={16} color="white"/>:<div style={{width:10,height:10,borderRadius:'50%',background:active?'#1a5c1a':'#ddd'}}/>}
                    </div>
                    <span style={{fontSize:11,fontWeight:done?700:400,color:done?'#1a5c1a':'#bdbdbd',textAlign:'center',maxWidth:70}}>{s.replace(/_/g,' ')}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Timeline */}
        {order.timeline?.length>0&&(
          <div style={{background:'white',borderRadius:14,padding:24,marginBottom:20,boxShadow:'0 2px 8px rgba(0,0,0,0.07)'}}>
            <h3 style={{fontWeight:800,color:'#1a5c1a',marginBottom:16}}>Timeline</h3>
            {order.timeline.map((t,i)=>(
              <div key={t.id} style={{display:'flex',gap:14,marginBottom:i<order.timeline.length-1?16:0}}>
                <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
                  <div style={{width:12,height:12,borderRadius:'50%',background:'#1a5c1a',flexShrink:0,marginTop:3}}/>
                  {i<order.timeline.length-1&&<div style={{width:2,flex:1,background:'#eee',marginTop:4,minHeight:24}}/>}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:14,color:'#1a5c1a'}}>{t.status.replace(/_/g,' ')}</div>
                  <div style={{fontSize:13,color:'#616161',marginTop:2}}>{t.message}</div>
                  {t.location&&<div style={{fontSize:12,color:'#9e9e9e',marginTop:2}}>📍 {t.location}</div>}
                  <div style={{fontSize:12,color:'#bdbdbd',marginTop:2}}>{new Date(t.created_at).toLocaleString('en-IN')}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Items + Summary */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 300px',gap:20,alignItems:'start'}}>
          <div style={{background:'white',borderRadius:14,padding:24,boxShadow:'0 2px 8px rgba(0,0,0,0.07)'}}>
            <h3 style={{fontWeight:800,color:'#1a5c1a',marginBottom:16}}>Order Items</h3>
            {order.items?.map(item=>(
              <div key={item.id} style={{display:'flex',gap:14,alignItems:'center',paddingBottom:14,marginBottom:14,borderBottom:'1px solid #f5f5f5'}}>
                <div style={{width:60,height:60,background:'#f5f5f5',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26}}>⚙️</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:15}}>{item.part_name}</div>
                  <div style={{fontSize:12,color:'#9e9e9e'}}>{item.part_number}</div>
                  <div style={{fontSize:13,color:'#757575'}}>₹{parseFloat(item.unit_price).toLocaleString()} × {item.quantity}</div>
                </div>
                <div style={{fontWeight:800,color:'#1a5c1a',fontSize:16}}>₹{parseFloat(item.sub_total).toLocaleString()}</div>
              </div>
            ))}
          </div>

          <div>
            <div style={{background:'white',borderRadius:14,padding:20,boxShadow:'0 2px 8px rgba(0,0,0,0.07)',marginBottom:14}}>
              <h4 style={{fontWeight:800,color:'#1a5c1a',marginBottom:14}}>Order Summary</h4>
              {[['Subtotal',`₹${parseFloat(order.subtotal||order.total_amount).toLocaleString()}`],['GST',`₹${parseFloat(order.tax_amount||0).toLocaleString()}`],['Shipping',parseFloat(order.shipping_amount||0)===0?'FREE':`₹${order.shipping_amount}`],['Payment',order.payment_method||'—']].map(([l,v])=>(
                <div key={l} style={{display:'flex',justifyContent:'space-between',fontSize:14,marginBottom:8}}>
                  <span style={{color:'#9e9e9e'}}>{l}</span>
                  <span style={{fontWeight:600,color:v==='FREE'?'#2e7d32':'#424242'}}>{v}</span>
                </div>
              ))}
              <div style={{borderTop:'2px solid #eee',paddingTop:10,marginTop:4,display:'flex',justifyContent:'space-between',fontWeight:900,fontSize:18}}>
                <span>Total</span><span style={{color:'#1a5c1a'}}>₹{parseFloat(order.total_amount).toLocaleString()}</span>
              </div>
            </div>

            <div style={{background:'white',borderRadius:14,padding:20,boxShadow:'0 2px 8px rgba(0,0,0,0.07)'}}>
              <h4 style={{fontWeight:800,color:'#1a5c1a',marginBottom:12}}>Delivery Address</h4>
              <p style={{fontWeight:700,fontSize:14}}>{order.shipping_name}</p>
              <p style={{fontSize:13,color:'#616161',lineHeight:1.6,marginTop:4}}>{order.shipping_address}, {order.shipping_city}, {order.shipping_state} — {order.shipping_pincode}</p>
              <p style={{fontSize:13,color:'#9e9e9e',marginTop:4}}>📞 {order.shipping_phone}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
