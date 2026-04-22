
import React,{useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {FiPackage,FiX,FiArrowRight} from 'react-icons/fi';
import {orderAPI} from '../utils/api';
import toast from 'react-hot-toast';

const STATUS_CONFIG={
  PENDING:    {color:'#e65100',bg:'#fff3e0',emoji:'⏳'},
  CONFIRMED:  {color:'#1565c0',bg:'#e3f2fd',emoji:'✅'},
  PROCESSING: {color:'#6a1b9a',bg:'#f3e5f5',emoji:'⚙️'},
  SHIPPED:    {color:'#0277bd',bg:'#e1f5fe',emoji:'🚚'},
  OUT_FOR_DELIVERY:{color:'#2e7d32',bg:'#e8f5e9',emoji:'📦'},
  DELIVERED:  {color:'#1b5e20',bg:'#e8f5e9',emoji:'✅'},
  CANCELLED:  {color:'#c62828',bg:'#ffebee',emoji:'❌'},
  REFUNDED:   {color:'#4e342e',bg:'#efebe9',emoji:'↩️'},
};

export default function OrdersPage(){
  const [orders,setOrders]=useState([]); const [loading,setL]=useState(true);
  useEffect(()=>{orderAPI.getAll().then(r=>setOrders(r.data.data)).catch(()=>{}).finally(()=>setL(false));}, []);
  const cancel=async(id)=>{
    try{await orderAPI.cancel(id);setOrders(os=>os.map(o=>o.id===id?{...o,status:'CANCELLED'}:o));toast.success('Order cancelled.');}
    catch(err){toast.error(err.response?.data?.message||'Cannot cancel.');}
  };
  if(loading) return <div className="loading-center"><div className="spinner"/></div>;
  return(
    <div className="page"><div className="container">
      <h1 className="section-title">My Orders</h1>
      {orders.length===0?(
        <div style={{textAlign:'center',padding:'80px 0',background:'white',borderRadius:14,boxShadow:'0 1px 4px rgba(0,0,0,0.08)'}}>
          <FiPackage size={64} style={{color:'#eee',marginBottom:16}}/>
          <h3 style={{marginBottom:8}}>No orders yet</h3>
          <p style={{color:'#9e9e9e',marginBottom:24}}>Start by browsing our equipment diagrams to find parts</p>
          <Link to="/equipment" className="btn btn-primary">Browse Equipment</Link>
        </div>
      ):orders.map(order=>{
        const cfg=STATUS_CONFIG[order.status]||STATUS_CONFIG.PENDING;
        return(
          <div key={order.id} className="card" style={{marginBottom:20}}>
            <div style={{padding:'14px 20px',background:'#fafafa',borderBottom:'1px solid #f5f5f5',display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:8,alignItems:'center'}}>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <span style={{fontWeight:900,color:'#1a5c1a',fontSize:16}}>#{order.order_number||order.id}</span>
                <span style={{fontSize:13,color:'#9e9e9e'}}>{new Date(order.order_date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</span>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <span style={{background:cfg.bg,color:cfg.color,fontWeight:700,fontSize:13,padding:'4px 12px',borderRadius:20}}>{cfg.emoji} {order.status}</span>
                {['PENDING','CONFIRMED'].includes(order.status)&&<button onClick={()=>cancel(order.id)} className="btn btn-danger btn-sm"><FiX size={12}/>Cancel</button>}
              </div>
            </div>
            <div style={{padding:'16px 20px'}}>
              {order.items?.map(item=>(
                <div key={item.id} style={{display:'flex',gap:12,alignItems:'center',marginBottom:10}}>
                  <div style={{width:52,height:52,background:'#f5f5f5',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24}}>⚙️</div>
                  <div style={{flex:1}}><div style={{fontWeight:700,fontSize:14}}>{item.part_name}</div><div style={{fontSize:12,color:'#9e9e9e'}}>{item.part_number} × {item.quantity}</div></div>
                  <div style={{fontWeight:700,color:'#1a5c1a'}}>₹{parseFloat(item.sub_total).toLocaleString()}</div>
                </div>
              ))}
              <div style={{borderTop:'1px solid #f5f5f5',paddingTop:10,marginTop:8,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <span style={{fontWeight:900,fontSize:17,color:'#1a5c1a'}}>₹{parseFloat(order.total_amount).toLocaleString()}</span>
                  {order.tracking_number&&<div style={{fontSize:12,color:'#757575',marginTop:2}}>Tracking: {order.tracking_number}</div>}
                </div>
                <Link to={`/orders/${order.id}`} className="btn btn-outline btn-sm">View Details <FiArrowRight size={12}/></Link>
              </div>
            </div>
          </div>
        );
      })}
    </div></div>
  );
}
