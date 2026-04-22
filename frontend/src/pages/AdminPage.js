
import React,{useEffect,useState,useRef} from 'react';
import {Routes,Route,Link,useLocation} from 'react-router-dom';
import {FiBarChart2,FiPackage,FiSettings,FiUsers,FiAlertTriangle,FiPlus,FiEdit,FiToggleLeft,FiUpload,FiDownload,FiSearch} from 'react-icons/fi';
import {BarChart,Bar,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer,PieChart,Pie,Cell,Legend} from 'recharts';
import {adminAPI,partsAPI,equipmentAPI} from '../utils/api';
import toast from 'react-hot-toast';

/* ── SIDEBAR ─────────────────────────────────────────────── */
const NAV=[
  {path:'/admin',         icon:FiBarChart2, label:'Dashboard'},
  {path:'/admin/orders',  icon:FiPackage,   label:'Orders'},
  {path:'/admin/parts',   icon:FiSettings,  label:'Parts'},
  {path:'/admin/equipment',icon:FiSettings, label:'Equipment'},
  {path:'/admin/users',   icon:FiUsers,     label:'Users'},
];
function AdminLayout({children}){
  const loc=useLocation();
  return(
    <div style={{display:'flex',minHeight:'calc(100vh - 70px)'}}>
      <div style={{width:220,background:'#1a5c1a',flexShrink:0,padding:'20px 0'}}>
        <div style={{padding:'0 16px 20px',borderBottom:'1px solid rgba(255,255,255,0.1)',marginBottom:8}}>
          <div style={{color:'#ffde00',fontWeight:900,fontSize:14}}>Admin Panel</div>
          <div style={{color:'rgba(255,255,255,0.5)',fontSize:12,marginTop:2}}>John Deere Parts v3</div>
        </div>
        {NAV.map(({path,icon:Icon,label})=>(
          <Link key={path} to={path} style={{display:'flex',alignItems:'center',gap:10,padding:'11px 20px',textDecoration:'none',color:loc.pathname===path?'#ffde00':'rgba(255,255,255,0.75)',background:loc.pathname===path?'rgba(255,222,0,0.1)':'transparent',fontWeight:loc.pathname===path?700:400,fontSize:14,transition:'all 0.15s',borderRight:loc.pathname===path?'3px solid #ffde00':'3px solid transparent'}}>
            <Icon size={16}/>{label}
          </Link>
        ))}
      </div>
      <div style={{flex:1,padding:28,background:'#f5f5f5',overflowY:'auto'}}>{children}</div>
    </div>
  );
}

/* ── DASHBOARD ─────────────────────────────────────────── */
function Dashboard(){
  const [stats,setStats]=useState(null);
  useEffect(()=>{adminAPI.getStats().then(r=>setStats(r.data.data)).catch(()=>{});}, []);
  const COLORS=['#1a5c1a','#ffde00','#c62828','#1565c0','#6a1b9a'];
  if(!stats) return <div className="loading-center"><div className="spinner"/></div>;
  const catData=stats.top_parts?.map(p=>({name:p.part_name.slice(0,12)+'…',sold:p.sold_count,revenue:p.sold_count*parseFloat(p.price)}));
  return(
    <div>
      <h1 style={{fontSize:26,fontWeight:900,color:'#1a5c1a',marginBottom:24}}>Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-4" style={{marginBottom:28}}>
        {[['Total Orders',stats.orders,'📦','#1a5c1a'],['Total Revenue',`₹${Math.round(stats.revenue||0).toLocaleString()}`,'💰','#2e7d32'],['Total Parts',stats.parts,'⚙️','#1565c0'],['Customers',stats.customers,'👥','#6a1b9a'],].map(([lbl,val,icon,color])=>(
          <div key={lbl} style={{background:'white',borderRadius:14,padding:'20px 20px',boxShadow:'0 2px 8px rgba(0,0,0,0.07)',display:'flex',alignItems:'center',gap:16}}>
            <div style={{width:54,height:54,background:`${color}18`,borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28}}>{icon}</div>
            <div><div style={{fontSize:26,fontWeight:900,color}}>{val}</div><div style={{fontSize:13,color:'#9e9e9e',marginTop:2}}>{lbl}</div></div>
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:20,marginBottom:28}}>
        {/* Revenue Chart */}
        <div style={{background:'white',borderRadius:14,padding:24,boxShadow:'0 2px 8px rgba(0,0,0,0.07)'}}>
          <h3 style={{fontWeight:800,color:'#1a5c1a',marginBottom:20}}>Monthly Revenue</h3>
          {stats.monthly_revenue?.length>0?(
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.monthly_revenue} margin={{top:0,right:0,left:0,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5"/>
                <XAxis dataKey="month" tick={{fontSize:12,fill:'#9e9e9e'}}/>
                <YAxis tick={{fontSize:11,fill:'#9e9e9e'}} tickFormatter={v=>`₹${(v/1000).toFixed(0)}k`}/>
                <Tooltip formatter={v=>[`₹${parseFloat(v).toLocaleString()}`,'']}/>
                <Bar dataKey="total" fill="#1a5c1a" radius={[5,5,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          ):<div style={{height:220,display:'flex',alignItems:'center',justifyContent:'center',color:'#bdbdbd'}}>No revenue data yet</div>}
        </div>

        {/* Pending + Low Stock */}
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <div style={{background:'white',borderRadius:14,padding:20,boxShadow:'0 2px 8px rgba(0,0,0,0.07)'}}>
            <h4 style={{fontWeight:800,color:'#e65100',marginBottom:12}}>⏳ Pending Orders</h4>
            <div style={{fontSize:40,fontWeight:900,color:'#e65100'}}>{stats.pending}</div>
            <Link to="/admin/orders" style={{fontSize:13,color:'#2d8a2d',fontWeight:600,textDecoration:'none'}}>View all orders →</Link>
          </div>
          <div style={{background:'white',borderRadius:14,padding:20,boxShadow:'0 2px 8px rgba(0,0,0,0.07)',flex:1}}>
            <h4 style={{fontWeight:800,color:'#c62828',marginBottom:12}}>⚠️ Low Stock Alert</h4>
            {stats.low_stock?.length===0?<p style={{color:'#9e9e9e',fontSize:13}}>All parts well stocked</p>:
              stats.low_stock.slice(0,5).map(p=>(
                <div key={p.part_number} style={{display:'flex',justifyContent:'space-between',marginBottom:8,fontSize:13}}>
                  <span style={{color:'#424242',fontWeight:600}}>{p.part_name.slice(0,18)}…</span>
                  <span style={{color:'#c62828',fontWeight:800}}>{p.available_stock} left</span>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      {/* Top Parts */}
      <div style={{background:'white',borderRadius:14,padding:24,boxShadow:'0 2px 8px rgba(0,0,0,0.07)'}}>
        <h3 style={{fontWeight:800,color:'#1a5c1a',marginBottom:16}}>Top Selling Parts</h3>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:14}}>
            <thead><tr style={{background:'#1a5c1a',color:'white'}}>{['Part','Number','Price','Units Sold','Revenue'].map(h=><th key={h} style={{padding:'11px 14px',textAlign:'left',fontWeight:700}}>{h}</th>)}</tr></thead>
            <tbody>{stats.top_parts?.map((p,i)=>(
              <tr key={p.part_number} style={{background:i%2===0?'white':'#fafafa',borderBottom:'1px solid #f5f5f5'}}>
                <td style={{padding:'11px 14px',fontWeight:600}}>{p.part_name}</td>
                <td style={{padding:'11px 14px',color:'#9e9e9e',fontSize:12,fontWeight:700}}>{p.part_number}</td>
                <td style={{padding:'11px 14px',fontWeight:700}}>₹{parseFloat(p.price).toLocaleString()}</td>
                <td style={{padding:'11px 14px'}}><span style={{background:'#e8f5e9',color:'#1a5c1a',fontWeight:700,padding:'2px 10px',borderRadius:20,fontSize:12}}>{p.sold_count}</span></td>
                <td style={{padding:'11px 14px',fontWeight:700,color:'#1a5c1a'}}>₹{(p.sold_count*parseFloat(p.price)).toLocaleString()}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── ORDERS ─────────────────────────────────────────────── */
function AdminOrders(){
  const [orders,setOrders]=useState([]); const [loading,setL]=useState(true); const [filter,setFilter]=useState('');
  useEffect(()=>{adminAPI.getAllOrders().then(r=>setOrders(r.data.data)).catch(()=>{}).finally(()=>setL(false));}, []);
  const updateStatus=async(id,status,msg)=>{
    try{await adminAPI.updateOrderStatus(id,{status,message:msg||`Status updated to ${status}`});setOrders(os=>os.map(o=>o.id===id?{...o,status}:o));toast.success(`Order #${id} → ${status}`);}
    catch{toast.error('Update failed.');}
  };
  const SC={PENDING:'#e65100',CONFIRMED:'#1565c0',SHIPPED:'#0277bd',DELIVERED:'#2e7d32',CANCELLED:'#c62828',PROCESSING:'#6a1b9a',OUT_FOR_DELIVERY:'#2e7d32'};
  const filtered=filter?orders.filter(o=>o.status===filter):orders;
  return(
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24,flexWrap:'wrap',gap:12}}>
        <h1 style={{fontSize:24,fontWeight:900,color:'#1a5c1a'}}>Orders</h1>
        <div style={{display:'flex',gap:8}}>
          {['','PENDING','CONFIRMED','SHIPPED','DELIVERED'].map(s=>(
            <button key={s} onClick={()=>setFilter(s)} style={{padding:'7px 14px',border:`2px solid ${filter===s?'#1a5c1a':'#eee'}`,borderRadius:20,background:filter===s?'#1a5c1a':'white',color:filter===s?'white':'#424242',fontSize:12,fontWeight:700,cursor:'pointer'}}>{s||'All'}</button>
          ))}
        </div>
      </div>
      {loading?<div className="loading-center"><div className="spinner"/></div>:(
        <div style={{background:'white',borderRadius:14,overflow:'auto',boxShadow:'0 2px 8px rgba(0,0,0,0.07)'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
            <thead><tr style={{background:'#1a5c1a',color:'white'}}>{['Order#','Customer','Amount','Status','Date','Update Status'].map(h=><th key={h} style={{padding:'12px 14px',textAlign:'left',fontWeight:700,whiteSpace:'nowrap'}}>{h}</th>)}</tr></thead>
            <tbody>{filtered.map((o,i)=>(
              <tr key={o.id} style={{background:i%2===0?'white':'#fafafa',borderBottom:'1px solid #f5f5f5'}}>
                <td style={{padding:'11px 14px',fontWeight:900,color:'#1a5c1a',fontSize:12}}>{o.order_number||`#${o.id}`}</td>
                <td style={{padding:'11px 14px'}}><div style={{fontWeight:600}}>{o.user_name}</div><div style={{fontSize:11,color:'#9e9e9e'}}>{o.email}</div></td>
                <td style={{padding:'11px 14px',fontWeight:700}}>₹{parseFloat(o.total_amount).toLocaleString()}</td>
                <td style={{padding:'11px 14px'}}><span style={{background:`${SC[o.status]||'#424242'}18`,color:SC[o.status]||'#424242',fontWeight:700,fontSize:11,padding:'3px 10px',borderRadius:20}}>{o.status}</span></td>
                <td style={{padding:'11px 14px',color:'#9e9e9e',fontSize:12}}>{new Date(o.order_date).toLocaleDateString('en-IN')}</td>
                <td style={{padding:'11px 14px'}}>
                  <select value={o.status} onChange={e=>updateStatus(o.id,e.target.value)} style={{padding:'5px 8px',border:'2px solid #eee',borderRadius:7,fontSize:12,cursor:'pointer',background:'white'}}>
                    {['PENDING','CONFIRMED','PROCESSING','SHIPPED','OUT_FOR_DELIVERY','DELIVERED','CANCELLED'].map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── PARTS ──────────────────────────────────────────────── */
function AdminParts(){
  const [parts,setParts]=useState([]); const [loading,setL]=useState(true);
  const [search,setS]=useState(''); const [showAdd,setShowAdd]=useState(false);
  const [form,setF]=useState({part_number:'',part_name:'',description:'',category:'ENGINE',price:'',mrp:'',stock:'',warranty_months:'12',is_featured:false});
  const [saving,setSaving]=useState(false);
  const fileRef=useRef();

  useEffect(()=>{partsAPI.getAll({search}).then(r=>setParts(r.data.data)).catch(()=>{}).finally(()=>setL(false));}, [search]);

  const savePart=async e=>{
    e.preventDefault();
    try{setSaving(true);const fd=new FormData();Object.entries(form).forEach(([k,v])=>fd.append(k,v));if(fileRef.current?.files[0])fd.append('image',fileRef.current.files[0]);await partsAPI.create(fd);toast.success('Part created!');setShowAdd(false);partsAPI.getAll({}).then(r=>setParts(r.data.data));}
    catch(err){toast.error(err.response?.data?.message||'Failed.');}finally{setSaving(false);}
  };

  const downloadCSV=()=>{
    const hdr='Part Number,Part Name,Category,Price,MRP,Stock\n';
    const rows=parts.map(p=>`${p.part_number},${p.part_name},${p.category},${p.price},${p.mrp||''},${p.available_stock||p.stock}`).join('\n');
    const blob=new Blob([hdr+rows],{type:'text/csv'});const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download='parts_export.csv';a.click();URL.revokeObjectURL(url);
  };

  const inp={width:'100%',padding:'9px 12px',border:'2px solid #eee',borderRadius:8,fontSize:14,outline:'none',marginTop:4};
  return(
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24,flexWrap:'wrap',gap:12}}>
        <h1 style={{fontSize:24,fontWeight:900,color:'#1a5c1a'}}>Parts Management</h1>
        <div style={{display:'flex',gap:10}}>
          <button onClick={downloadCSV} className="btn btn-outline btn-sm"><FiDownload size={13}/>Export CSV</button>
          <button onClick={()=>setShowAdd(s=>!s)} className="btn btn-primary btn-sm"><FiPlus size={13}/>Add Part</button>
        </div>
      </div>

      {showAdd&&(
        <div style={{background:'white',borderRadius:14,padding:24,marginBottom:20,boxShadow:'0 2px 8px rgba(0,0,0,0.07)',border:'2px solid #1a5c1a'}}>
          <h3 style={{fontWeight:800,color:'#1a5c1a',marginBottom:16}}>Add New Part</h3>
          <form onSubmit={savePart}>
            <div className="grid grid-3" style={{gap:12,marginBottom:12}}>
              {[['Part Number','part_number'],['Part Name','part_name'],['Category','category'],['Price (₹)','price'],['MRP (₹)','mrp'],['Stock','stock'],['Warranty (months)','warranty_months']].map(([l,k])=>(
                k==='category'?(
                  <div key={k}><div style={{fontWeight:600,fontSize:13}}>{l}</div>
                    <select value={form[k]} onChange={e=>setF(f=>({...f,[k]:e.target.value}))} style={inp}>
                      {['ENGINE','HYDRAULIC','ELECTRICAL','STRUCTURAL','TRANSMISSION'].map(c=><option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                ):(
                  <div key={k}><div style={{fontWeight:600,fontSize:13}}>{l}</div><input required={['part_number','part_name','price'].includes(k)} value={form[k]} onChange={e=>setF(f=>({...f,[k]:e.target.value}))} style={inp}/></div>
                )
              ))}
            </div>
            <div style={{marginBottom:12}}><div style={{fontWeight:600,fontSize:13}}>Description</div><textarea value={form.description} onChange={e=>setF(f=>({...f,description:e.target.value}))} rows={2} style={{...inp,resize:'vertical'}}/></div>
            <div style={{marginBottom:16,display:'flex',gap:16,alignItems:'center'}}>
              <div><div style={{fontWeight:600,fontSize:13}}>Part Image</div><input type="file" ref={fileRef} accept=".jpg,.jpeg,.png" style={{marginTop:4}}/></div>
              <label style={{display:'flex',alignItems:'center',gap:8,fontSize:14,cursor:'pointer',marginTop:16}}>
                <input type="checkbox" checked={form.is_featured} onChange={e=>setF(f=>({...f,is_featured:e.target.checked}))} style={{width:16,height:16,accentColor:'#1a5c1a'}}/>
                <span style={{fontWeight:600}}>Featured Part</span>
              </label>
            </div>
            <div style={{display:'flex',gap:10}}>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving?'Saving…':'Save Part'}</button>
              <button type="button" className="btn btn-outline" onClick={()=>setShowAdd(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={{background:'white',borderRadius:12,padding:'12px 16px',marginBottom:16,display:'flex',gap:10,alignItems:'center',boxShadow:'0 1px 4px rgba(0,0,0,0.06)'}}>
        <FiSearch size={16} style={{color:'#bdbdbd'}}/>
        <input type="text" placeholder="Search parts..." value={search} onChange={e=>setS(e.target.value)} style={{border:'none',outline:'none',fontSize:15,flex:1,background:'transparent'}}/>
      </div>

      {loading?<div className="loading-center"><div className="spinner"/></div>:(
        <div style={{background:'white',borderRadius:14,overflow:'auto',boxShadow:'0 2px 8px rgba(0,0,0,0.07)'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
            <thead><tr style={{background:'#1a5c1a',color:'white'}}>{['Part #','Name','Category','Price','Stock','Featured','Status'].map(h=><th key={h} style={{padding:'12px 14px',textAlign:'left',fontWeight:700}}>{h}</th>)}</tr></thead>
            <tbody>{parts.map((p,i)=>(
              <tr key={p.id} style={{background:i%2===0?'white':'#fafafa',borderBottom:'1px solid #f5f5f5'}}>
                <td style={{padding:'11px 14px',fontWeight:700,color:'#1a5c1a',fontSize:12}}>{p.part_number}</td>
                <td style={{padding:'11px 14px',fontWeight:600}}>{p.part_name}</td>
                <td style={{padding:'11px 14px',color:'#757575'}}>{p.category}</td>
                <td style={{padding:'11px 14px',fontWeight:700}}>₹{parseFloat(p.price).toLocaleString()}</td>
                <td style={{padding:'11px 14px'}}>
                  <span style={{background:(p.available_stock||p.stock)>=(p.low_stock_alert||5)?'#e8f5e9':'#ffebee',color:(p.available_stock||p.stock)>=(p.low_stock_alert||5)?'#2e7d32':'#c62828',fontWeight:700,fontSize:12,padding:'2px 8px',borderRadius:20}}>{p.available_stock||p.stock}</span>
                </td>
                <td style={{padding:'11px 14px'}}>{p.is_featured?'⭐ Yes':'—'}</td>
                <td style={{padding:'11px 14px'}}><span style={{background:p.in_stock?'#e8f5e9':'#ffebee',color:p.in_stock?'#2e7d32':'#c62828',fontWeight:700,fontSize:11,padding:'2px 9px',borderRadius:20}}>{p.in_stock?'In Stock':'Out'}</span></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── USERS ──────────────────────────────────────────────── */
function AdminUsers(){
  const [users,setUsers]=useState([]); const [loading,setL]=useState(true);
  useEffect(()=>{adminAPI.getUsers().then(r=>setUsers(r.data.data)).catch(()=>{}).finally(()=>setL(false));}, []);
  const toggle=async(id)=>{ try{await adminAPI.toggleUser(id);setUsers(us=>us.map(u=>u.id===id?{...u,is_active:!u.is_active}:u));toast.success('User status updated.');}catch{toast.error('Failed.');} };
  const roleColor={admin:'#c62828',dealer:'#1565c0',customer:'#1a5c1a'};
  return(
    <div>
      <h1 style={{fontSize:24,fontWeight:900,color:'#1a5c1a',marginBottom:24}}>User Management</h1>
      {loading?<div className="loading-center"><div className="spinner"/></div>:(
        <div style={{background:'white',borderRadius:14,overflow:'auto',boxShadow:'0 2px 8px rgba(0,0,0,0.07)'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
            <thead><tr style={{background:'#1a5c1a',color:'white'}}>{['Name','Email','Role','Phone','Verified','Status','Action'].map(h=><th key={h} style={{padding:'12px 14px',textAlign:'left',fontWeight:700}}>{h}</th>)}</tr></thead>
            <tbody>{users.map((u,i)=>(
              <tr key={u.id} style={{background:i%2===0?'white':'#fafafa',borderBottom:'1px solid #f5f5f5'}}>
                <td style={{padding:'11px 14px',fontWeight:600}}>{u.name}</td>
                <td style={{padding:'11px 14px',color:'#757575',fontSize:12}}>{u.email}</td>
                <td style={{padding:'11px 14px'}}><span style={{background:`${roleColor[u.role]}18`,color:roleColor[u.role],fontWeight:700,fontSize:11,padding:'2px 9px',borderRadius:20,textTransform:'uppercase'}}>{u.role}</span></td>
                <td style={{padding:'11px 14px',color:'#757575',fontSize:12}}>{u.phone||'—'}</td>
                <td style={{padding:'11px 14px'}}>{u.email_verified?'✅':'⚠️'}</td>
                <td style={{padding:'11px 14px'}}><span style={{background:u.is_active?'#e8f5e9':'#ffebee',color:u.is_active?'#2e7d32':'#c62828',fontWeight:700,fontSize:11,padding:'2px 9px',borderRadius:20}}>{u.is_active?'Active':'Suspended'}</span></td>
                <td style={{padding:'11px 14px'}}>
                  {u.role!=='admin'&&<button onClick={()=>toggle(u.id)} style={{background:u.is_active?'#ffebee':'#e8f5e9',color:u.is_active?'#c62828':'#2e7d32',border:'none',borderRadius:6,padding:'5px 10px',fontSize:12,fontWeight:700,cursor:'pointer'}}>
                    {u.is_active?'Suspend':'Activate'}
                  </button>}
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── EQUIPMENT ──────────────────────────────────────────── */
function AdminEquipment(){
  const [equip,setEquip]=useState([]); const [loading,setL]=useState(true); const [showAdd,setShowAdd]=useState(false);
  const [form,setF]=useState({model_code:'',model_name:'',category:'Tractor',series:'',region:'ASIA_PACIFIC',description:'',horsepower:'',year_from:new Date().getFullYear(),image_url:''});
  const [saving,setSaving]=useState(false);
  useEffect(()=>{equipmentAPI.getAll({}).then(r=>setEquip(r.data.data)).catch(()=>{}).finally(()=>setL(false));}, []);
  const save=async e=>{ e.preventDefault(); try{setSaving(true);await equipmentAPI.create({...form});toast.success('Equipment created!');setShowAdd(false);equipmentAPI.getAll({}).then(r=>setEquip(r.data.data));}catch(err){toast.error(err.response?.data?.message||'Failed.');}finally{setSaving(false);} };
  const inp={width:'100%',padding:'9px 12px',border:'2px solid #eee',borderRadius:8,fontSize:14,outline:'none',marginTop:4};
  return(
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <h1 style={{fontSize:24,fontWeight:900,color:'#1a5c1a'}}>Equipment Models</h1>
        <button onClick={()=>setShowAdd(s=>!s)} className="btn btn-primary btn-sm"><FiPlus size={13}/>Add Model</button>
      </div>
      {showAdd&&(
        <div style={{background:'white',borderRadius:14,padding:24,marginBottom:20,boxShadow:'0 2px 8px rgba(0,0,0,0.07)',border:'2px solid #1a5c1a'}}>
          <h3 style={{fontWeight:800,color:'#1a5c1a',marginBottom:16}}>Add Equipment Model</h3>
          <form onSubmit={save}>
            <div className="grid grid-3" style={{gap:12,marginBottom:12}}>
              {[['Model Code','model_code'],['Model Name','model_name'],['Series','series'],['Horsepower','horsepower'],['Year From','year_from']].map(([l,k])=>(
                <div key={k}><div style={{fontWeight:600,fontSize:13}}>{l}</div><input required={['model_code','model_name'].includes(k)} value={form[k]} onChange={e=>setF(f=>({...f,[k]:e.target.value}))} style={inp}/></div>
              ))}
              {[['Category','category',['Tractor','Harvester','Combine','Sprayer','Planter']],['Region','region',['ASIA_PACIFIC','NORTH_AMERICA','EUROPE']]].map(([l,k,opts])=>(
                <div key={k}><div style={{fontWeight:600,fontSize:13}}>{l}</div><select value={form[k]} onChange={e=>setF(f=>({...f,[k]:e.target.value}))} style={inp}>{opts.map(o=><option key={o} value={o}>{o}</option>)}</select></div>
              ))}
            </div>
            <div style={{marginBottom:12}}><div style={{fontWeight:600,fontSize:13}}>Image URL (optional)</div><input value={form.image_url} onChange={e=>setF(f=>({...f,image_url:e.target.value}))} placeholder="https://..." style={inp}/></div>
            <div style={{marginBottom:16}}><div style={{fontWeight:600,fontSize:13}}>Description</div><textarea value={form.description} onChange={e=>setF(f=>({...f,description:e.target.value}))} rows={2} style={{...inp,resize:'vertical'}}/></div>
            <div style={{display:'flex',gap:10}}>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving?'Saving…':'Save'}</button>
              <button type="button" className="btn btn-outline" onClick={()=>setShowAdd(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      {loading?<div className="loading-center"><div className="spinner"/></div>:(
        <div style={{background:'white',borderRadius:14,overflow:'auto',boxShadow:'0 2px 8px rgba(0,0,0,0.07)'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
            <thead><tr style={{background:'#1a5c1a',color:'white'}}>{['Code','Model Name','Category','Series','HP','Region','Status'].map(h=><th key={h} style={{padding:'12px 14px',textAlign:'left',fontWeight:700}}>{h}</th>)}</tr></thead>
            <tbody>{equip.map((e,i)=>(
              <tr key={e.id} style={{background:i%2===0?'white':'#fafafa',borderBottom:'1px solid #f5f5f5'}}>
                <td style={{padding:'11px 14px',fontWeight:700,color:'#1a5c1a',fontSize:12}}>{e.model_code}</td>
                <td style={{padding:'11px 14px',fontWeight:600}}>{e.model_name}</td>
                <td style={{padding:'11px 14px'}}>{e.category}</td>
                <td style={{padding:'11px 14px',color:'#757575'}}>{e.series||'—'}</td>
                <td style={{padding:'11px 14px',color:'#757575'}}>{e.horsepower?`${e.horsepower}HP`:'—'}</td>
                <td style={{padding:'11px 14px',fontSize:12,color:'#757575'}}>{e.region?.replace(/_/g,' ')}</td>
                <td style={{padding:'11px 14px'}}><span style={{background:e.is_active?'#e8f5e9':'#ffebee',color:e.is_active?'#2e7d32':'#c62828',fontWeight:700,fontSize:11,padding:'2px 9px',borderRadius:20}}>{e.is_active?'Active':'Inactive'}</span></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── MAIN ADMIN PAGE ─────────────────────────────────────── */
export default function AdminPage(){
  return(
    <AdminLayout>
      <Routes>
        <Route index element={<Dashboard/>}/>
        <Route path="orders" element={<AdminOrders/>}/>
        <Route path="parts" element={<AdminParts/>}/>
        <Route path="equipment" element={<AdminEquipment/>}/>
        <Route path="users" element={<AdminUsers/>}/>
      </Routes>
    </AdminLayout>
  );
}
