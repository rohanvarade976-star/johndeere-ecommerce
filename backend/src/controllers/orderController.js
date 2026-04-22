
const db = require('../config/db');
const { sendOrderConfirmation } = require('../utils/email');
const GEN = () => `JD${Date.now().toString().slice(-8)}`;

// ── CART ──────────────────────────────────────────────────────
const getCart = async (req,res) => {
  try {
    const [cart] = await db.query('SELECT id FROM carts WHERE user_id=?',[req.user.id]);
    if(!cart.length) return res.json({success:true,data:{items:[],total:0,tax:0,shipping:0,grand_total:0}});
    const [items] = await db.query(
      `SELECT ci.id,ci.quantity,ci.unit_price,p.id as part_id,p.part_name,p.part_number,
       p.image_url,p.price,p.mrp,i.available_stock,(ci.quantity*ci.unit_price) as subtotal
       FROM cart_items ci JOIN parts p ON p.id=ci.part_id LEFT JOIN inventory i ON i.part_id=p.id WHERE ci.cart_id=?`,
      [cart[0].id]
    );
    const total    = items.reduce((s,i)=>s+parseFloat(i.subtotal),0);
    const tax      = total * 0.18;
    const shipping = total > 5000 ? 0 : 150;
    res.json({success:true,data:{items,total,tax,shipping,grand_total:total+tax+shipping}});
  } catch(e){console.error(e);res.status(500).json({success:false,message:'Server error.'});}
};
const addToCart = async (req,res) => {
  try {
    const {part_id,quantity=1}=req.body;
    const [inv]=await db.query('SELECT available_stock FROM inventory WHERE part_id=?',[part_id]);
    if(!inv.length||inv[0].available_stock<quantity) return res.status(400).json({success:false,message:'Insufficient stock.'});
    const [p]=await db.query('SELECT price FROM parts WHERE id=? AND is_active=TRUE',[part_id]);
    if(!p.length) return res.status(404).json({success:false,message:'Part not found.'});
    const [cart]=await db.query('SELECT id FROM carts WHERE user_id=?',[req.user.id]);
    await db.query('INSERT INTO cart_items (cart_id,part_id,quantity,unit_price) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE quantity=quantity+VALUES(quantity)',
      [cart[0].id,part_id,quantity,p[0].price]);
    res.json({success:true,message:'Added to cart.'});
  }catch(e){console.error(e);res.status(500).json({success:false,message:'Server error.'});}
};
const updateCartItem = async (req,res)=>{
  try{
    if(parseInt(req.body.quantity)<=0){await db.query('DELETE FROM cart_items WHERE id=?',[req.params.item_id]);return res.json({success:true,message:'Removed.'});}
    await db.query('UPDATE cart_items SET quantity=? WHERE id=?',[req.body.quantity,req.params.item_id]);
    res.json({success:true});
  }catch{res.status(500).json({success:false,message:'Server error.'});}
};
const removeFromCart = async (req,res)=>{try{await db.query('DELETE FROM cart_items WHERE id=?',[req.params.item_id]);res.json({success:true});}catch{res.status(500).json({success:false,message:'Server error.'});}};
const clearCart = async (req,res)=>{
  try{const [c]=await db.query('SELECT id FROM carts WHERE user_id=?',[req.user.id]);await db.query('DELETE FROM cart_items WHERE cart_id=?',[c[0].id]);res.json({success:true});}
  catch{res.status(500).json({success:false,message:'Server error.'});}
};

// ── WISHLIST ──────────────────────────────────────────────────
const getWishlist = async (req,res)=>{
  try{
    const [items]=await db.query(`SELECT w.*,p.part_name,p.part_number,p.price,p.image_url,p.mrp,
      CASE WHEN i.available_stock>0 THEN TRUE ELSE FALSE END AS in_stock
      FROM wishlist w JOIN parts p ON p.id=w.part_id LEFT JOIN inventory i ON i.part_id=p.id WHERE w.user_id=? ORDER BY w.created_at DESC`,[req.user.id]);
    res.json({success:true,data:items});
  }catch{res.status(500).json({success:false,message:'Server error.'});}
};
const toggleWishlist = async (req,res)=>{
  try{
    const {part_id}=req.body;
    const [ex]=await db.query('SELECT id FROM wishlist WHERE user_id=? AND part_id=?',[req.user.id,part_id]);
    if(ex.length){await db.query('DELETE FROM wishlist WHERE user_id=? AND part_id=?',[req.user.id,part_id]);res.json({success:true,wishlisted:false,message:'Removed from wishlist.'});}
    else{await db.query('INSERT INTO wishlist (user_id,part_id) VALUES (?,?)',[req.user.id,part_id]);res.json({success:true,wishlisted:true,message:'Added to wishlist.'});}
  }catch{res.status(500).json({success:false,message:'Server error.'});}
};
const checkWishlist = async (req,res)=>{
  try{const [ex]=await db.query('SELECT id FROM wishlist WHERE user_id=? AND part_id=?',[req.user.id,req.params.part_id]);res.json({success:true,wishlisted:ex.length>0});}
  catch{res.status(500).json({success:false,message:'Server error.'});}
};

// ── ORDERS ────────────────────────────────────────────────────
const placeOrder = async (req,res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const {shipping_name,shipping_phone,shipping_address,shipping_city,shipping_state,shipping_pincode,payment_method,notes}=req.body;
    const [cart]=await conn.query('SELECT id FROM carts WHERE user_id=?',[req.user.id]);
    const [items]=await conn.query('SELECT ci.*,p.part_name,i.available_stock FROM cart_items ci JOIN parts p ON p.id=ci.part_id JOIN inventory i ON i.part_id=p.id WHERE ci.cart_id=?',[cart[0].id]);
    if(!items.length){await conn.rollback();return res.status(400).json({success:false,message:'Cart is empty.'});}
    for(const item of items) if(item.available_stock<item.quantity){await conn.rollback();return res.status(400).json({success:false,message:`Insufficient stock for ${item.part_name}.`});}
    const subtotal=items.reduce((s,i)=>s+i.quantity*parseFloat(i.unit_price),0);
    const tax=subtotal*0.18, shipping=subtotal>5000?0:150, total=subtotal+tax+shipping;
    const order_number=GEN();
    const est=new Date(Date.now()+5*24*60*60*1000);
    const [or]=await conn.query('INSERT INTO orders (order_number,user_id,status,subtotal,tax_amount,shipping_amount,total_amount,shipping_name,shipping_phone,shipping_address,shipping_city,shipping_state,shipping_pincode,estimated_delivery,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [order_number,req.user.id,'PENDING',subtotal,tax,shipping,total,shipping_name,shipping_phone,shipping_address,shipping_city,shipping_state,shipping_pincode,est,notes]);
    const order_id=or.insertId;
    for(const item of items){
      await conn.query('INSERT INTO order_items (order_id,part_id,quantity,unit_price,sub_total) VALUES (?,?,?,?,?)',[order_id,item.part_id,item.quantity,item.unit_price,item.quantity*item.unit_price]);
      await conn.query('UPDATE inventory SET available_stock=available_stock-? WHERE part_id=?',[item.quantity,item.part_id]);
      await conn.query('UPDATE parts SET sold_count=sold_count+? WHERE id=?',[item.quantity,item.part_id]);
    }
    await conn.query('INSERT INTO payments (order_id,amount,payment_method) VALUES (?,?,?)',[order_id,total,payment_method]);
    await conn.query('INSERT INTO order_timeline (order_id,status,message) VALUES (?,?,?)',[order_id,'PENDING','Order placed successfully. Awaiting confirmation.']);
    await conn.query('DELETE FROM cart_items WHERE cart_id=?',[cart[0].id]);
    await conn.commit();
    const [u]=await db.query('SELECT name,email FROM users WHERE id=?',[req.user.id]);
    sendOrderConfirmation(u[0].email,u[0].name,{order_number,total_amount:total},items).catch(()=>{});
    res.status(201).json({success:true,message:'Order placed!',data:{order_id,order_number,total,tax,shipping,estimated_delivery:est}});
  }catch(e){await conn.rollback();console.error(e);res.status(500).json({success:false,message:'Order placement failed.'});}
  finally{conn.release();}
};
const getUserOrders = async (req,res)=>{
  try{
    const [orders]=await db.query('SELECT o.*,p.payment_status,p.payment_method FROM orders o LEFT JOIN payments p ON p.order_id=o.id WHERE o.user_id=? ORDER BY o.order_date DESC',[req.user.id]);
    for(const o of orders){
      const [items]=await db.query('SELECT oi.*,p.part_name,p.part_number,p.image_url FROM order_items oi JOIN parts p ON p.id=oi.part_id WHERE oi.order_id=?',[o.id]);
      const [tl]=await db.query('SELECT * FROM order_timeline WHERE order_id=? ORDER BY created_at ASC',[o.id]);
      o.items=items; o.timeline=tl;
    }
    res.json({success:true,data:orders});
  }catch{res.status(500).json({success:false,message:'Server error.'});}
};
const getOrderById = async (req,res)=>{
  try{
    const [orders]=await db.query('SELECT o.*,p.payment_status,p.payment_method FROM orders o LEFT JOIN payments p ON p.order_id=o.id WHERE o.id=? AND o.user_id=?',[req.params.id,req.user.id]);
    if(!orders.length)return res.status(404).json({success:false,message:'Not found.'});
    const [items]=await db.query('SELECT oi.*,p.part_name,p.part_number,p.image_url FROM order_items oi JOIN parts p ON p.id=oi.part_id WHERE oi.order_id=?',[req.params.id]);
    const [tl]=await db.query('SELECT * FROM order_timeline WHERE order_id=? ORDER BY created_at ASC',[req.params.id]);
    res.json({success:true,data:{...orders[0],items,timeline:tl}});
  }catch{res.status(500).json({success:false,message:'Server error.'});}
};
const cancelOrder = async (req,res)=>{
  try{
    const [o]=await db.query('SELECT * FROM orders WHERE id=? AND user_id=?',[req.params.id,req.user.id]);
    if(!o.length)return res.status(404).json({success:false,message:'Not found.'});
    if(!['PENDING','CONFIRMED'].includes(o[0].status))return res.status(400).json({success:false,message:'Cannot cancel at this stage.'});
    await db.query("UPDATE orders SET status='CANCELLED' WHERE id=?",[req.params.id]);
    await db.query("UPDATE payments SET payment_status='REFUNDED' WHERE order_id=?",[req.params.id]);
    const [items]=await db.query('SELECT * FROM order_items WHERE order_id=?',[req.params.id]);
    for(const item of items) await db.query('UPDATE inventory SET available_stock=available_stock+? WHERE part_id=?',[item.quantity,item.part_id]);
    await db.query('INSERT INTO order_timeline (order_id,status,message) VALUES (?,?,?)',[req.params.id,'CANCELLED','Order cancelled by customer. Refund within 5–7 business days.']);
    res.json({success:true,message:'Order cancelled. Refund initiated.'});
  }catch{res.status(500).json({success:false,message:'Server error.'});}
};

// ── ADMIN ──────────────────────────────────────────────────────
const getAllOrders = async (req,res)=>{
  try{
    const {status}=req.query; let q='SELECT o.*,u.name as user_name,u.email,p.payment_status FROM orders o JOIN users u ON u.id=o.user_id LEFT JOIN payments p ON p.order_id=o.id',ps=[];
    if(status){q+=' WHERE o.status=?';ps.push(status);}
    q+=' ORDER BY o.order_date DESC';
    const [orders]=await db.query(q,ps);
    res.json({success:true,count:orders.length,data:orders});
  }catch{res.status(500).json({success:false,message:'Server error.'});}
};
const updateOrderStatus = async (req,res)=>{
  try{
    const {status,message,location,tracking_number}=req.body;
    await db.query('UPDATE orders SET status=? WHERE id=?',[status,req.params.id]);
    if(tracking_number) await db.query('UPDATE orders SET tracking_number=? WHERE id=?',[tracking_number,req.params.id]);
    await db.query('INSERT INTO order_timeline (order_id,status,message,location) VALUES (?,?,?,?)',[req.params.id,status,message||`Status updated to ${status}`,location||null]);
    res.json({success:true,message:'Status updated.'});
  }catch{res.status(500).json({success:false,message:'Server error.'});}
};
const getAdminStats = async (req,res)=>{
  try{
    const [[orders]]=await db.query("SELECT COUNT(*) as total,SUM(total_amount) as revenue FROM orders WHERE status!='CANCELLED'");
    const [[parts]]=await db.query('SELECT COUNT(*) as total FROM parts WHERE is_active=TRUE');
    const [[users]]=await db.query('SELECT COUNT(*) as total FROM users WHERE role="customer"');
    const [[pending]]=await db.query('SELECT COUNT(*) as total FROM orders WHERE status="PENDING"');
    const [lowStock]=await db.query('SELECT p.part_name,p.part_number,i.available_stock,i.low_stock_alert FROM inventory i JOIN parts p ON p.id=i.part_id WHERE i.available_stock<=i.low_stock_alert ORDER BY i.available_stock ASC');
    const [revenue]=await db.query("SELECT DATE_FORMAT(order_date,'%b %Y') as month,SUM(total_amount) as total FROM orders WHERE status!='CANCELLED' AND order_date>=DATE_SUB(NOW(),INTERVAL 6 MONTH) GROUP BY month ORDER BY order_date");
    const [topParts]=await db.query('SELECT part_name,part_number,sold_count,price FROM parts ORDER BY sold_count DESC LIMIT 5');
    res.json({success:true,data:{orders:orders.total,revenue:orders.revenue,parts:parts.total,customers:users.total,pending:pending.total,low_stock:lowStock,monthly_revenue:revenue,top_parts:topParts}});
  }catch(e){console.error(e);res.status(500).json({success:false,message:'Server error.'});}
};
const getUsers = async (req,res)=>{
  try{const [users]=await db.query('SELECT id,name,email,role,phone,is_active,email_verified,avatar_url,google_id,created_at FROM users ORDER BY created_at DESC');res.json({success:true,data:users});}
  catch{res.status(500).json({success:false,message:'Server error.'});}
};
const toggleUser = async (req,res)=>{
  try{await db.query('UPDATE users SET is_active=NOT is_active WHERE id=?',[req.params.id]);res.json({success:true});}
  catch{res.status(500).json({success:false,message:'Server error.'});}
};

module.exports={getCart,addToCart,updateCartItem,removeFromCart,clearCart,getWishlist,toggleWishlist,checkWishlist,placeOrder,getUserOrders,getOrderById,cancelOrder,getAllOrders,updateOrderStatus,getAdminStats,getUsers,toggleUser};
