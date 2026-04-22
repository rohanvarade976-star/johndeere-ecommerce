
const db = require('../config/db');
const SEL = `SELECT p.*, i.available_stock, i.low_stock_alert,
  CASE WHEN i.available_stock>0 THEN TRUE ELSE FALSE END AS in_stock,
  COALESCE(AVG(r.rating),0) AS avg_rating, COUNT(DISTINCT r.id) AS review_count
  FROM parts p LEFT JOIN inventory i ON i.part_id=p.id
  LEFT JOIN reviews r ON r.part_id=p.id`;

const getAllParts = async (req,res)=>{
  try{
    const {category,search,min_price,max_price,in_stock,featured,sort='popular'}=req.query;
    let q=SEL+' WHERE p.is_active=TRUE', p=[];
    if(category){q+=' AND p.category=?';p.push(category);}
    if(min_price){q+=' AND p.price>=?';p.push(min_price);}
    if(max_price){q+=' AND p.price<=?';p.push(max_price);}
    if(in_stock==='true'){q+=' AND i.available_stock>0';}
    if(featured==='true'){q+=' AND p.is_featured=TRUE';}
    if(search){q+=' AND (p.part_name LIKE ? OR p.part_number LIKE ? OR p.description LIKE ?)';p.push(`%${search}%`,`%${search}%`,`%${search}%`);}
    q+=' GROUP BY p.id';
    const sorts={newest:'p.created_at DESC',price_asc:'p.price ASC',price_desc:'p.price DESC',popular:'p.sold_count DESC',rating:'avg_rating DESC'};
    q+=` ORDER BY ${sorts[sort]||'p.sold_count DESC'}`;
    const [rows]=await db.query(q,p);
    res.json({success:true,count:rows.length,data:rows});
  }catch(e){console.error(e);res.status(500).json({success:false,message:'Server error.'});}
};

const getPartById = async (req,res)=>{
  try{
    const [parts]=await db.query(SEL+' WHERE p.id=? AND p.is_active=TRUE GROUP BY p.id',[req.params.id]);
    if(!parts.length)return res.status(404).json({success:false,message:'Part not found.'});
    const [related]=await db.query(
      `SELECT p.id,p.part_name,p.part_number,p.price,p.image_url,p.mrp,
       CASE WHEN i.available_stock>0 THEN TRUE ELSE FALSE END AS in_stock
       FROM parts p LEFT JOIN inventory i ON i.part_id=p.id
       WHERE p.category=? AND p.id!=? AND p.is_active=TRUE LIMIT 4`,
      [parts[0].category,req.params.id]
    );
    res.json({success:true,data:{...parts[0],related}});
  }catch{res.status(500).json({success:false,message:'Server error.'});}
};

const getDiagramHotspots = async (req,res)=>{
  try{
    const [d]=await db.query('SELECT d.*,e.model_name,e.model_code FROM diagrams d JOIN equipment_models e ON e.id=d.equipment_id WHERE d.id=?',[req.params.id]);
    if(!d.length)return res.status(404).json({success:false,message:'Diagram not found.'});
    const [h]=await db.query(
      `SELECT h.*,p.part_name,p.part_number,p.price,p.description,p.image_url,p.mrp,p.discount_pct,
       i.available_stock, CASE WHEN i.available_stock>0 THEN TRUE ELSE FALSE END AS in_stock
       FROM diagram_hotspots h JOIN parts p ON p.id=h.part_id
       LEFT JOIN inventory i ON i.part_id=p.id WHERE h.diagram_id=?`,[req.params.id]);
    res.json({success:true,data:{...d[0],hotspots:h}});
  }catch{res.status(500).json({success:false,message:'Server error.'});}
};

const getReviews = async (req,res)=>{
  try{
    const [reviews]=await db.query('SELECT r.*,u.name as user_name,u.avatar_url FROM reviews r JOIN users u ON u.id=r.user_id WHERE r.part_id=? ORDER BY r.created_at DESC',[req.params.id]);
    const [s]=await db.query('SELECT COUNT(*) as total,AVG(rating) as avg,SUM(rating=5) as five,SUM(rating=4) as four,SUM(rating=3) as three,SUM(rating=2) as two,SUM(rating=1) as one FROM reviews WHERE part_id=?',[req.params.id]);
    res.json({success:true,data:reviews,stats:s[0]});
  }catch{res.status(500).json({success:false,message:'Server error.'});}
};

const addReview = async (req,res)=>{
  try{
    const {rating,title,body}=req.body;
    const [ex]=await db.query('SELECT id FROM reviews WHERE user_id=? AND part_id=?',[req.user.id,req.params.id]);
    if(ex.length)return res.status(409).json({success:false,message:'You already reviewed this part.'});
    const [ord]=await db.query('SELECT oi.id FROM order_items oi JOIN orders o ON o.id=oi.order_id WHERE o.user_id=? AND oi.part_id=? AND o.status="DELIVERED" LIMIT 1',[req.user.id,req.params.id]);
    await db.query('INSERT INTO reviews (user_id,part_id,rating,title,body,is_verified) VALUES (?,?,?,?,?,?)',[req.user.id,req.params.id,rating,title,body,ord.length>0]);
    res.status(201).json({success:true,message:'Review submitted!',is_verified:ord.length>0});
  }catch{res.status(500).json({success:false,message:'Server error.'});}
};

const createPart = async (req,res)=>{
  try{
    const {part_number,part_name,description,category,price,mrp,stock,warranty_months,is_featured}=req.body;
    const image_url=req.file?`/uploads/parts/${req.file.filename}`:req.body.image_url||null;
    const [r]=await db.query('INSERT INTO parts (part_number,part_name,description,category,price,mrp,stock,image_url,warranty_months,is_featured) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [part_number,part_name,description,category,price,mrp||null,stock||0,image_url,warranty_months||12,is_featured||false]);
    await db.query('INSERT INTO inventory (part_id,available_stock) VALUES (?,?)',[r.insertId,stock||0]);
    res.status(201).json({success:true,message:'Part created.',id:r.insertId});
  }catch(e){if(e.code==='ER_DUP_ENTRY')return res.status(409).json({success:false,message:'Part number exists.'});res.status(500).json({success:false,message:'Server error.'});}
};

const updatePart = async (req,res)=>{
  try{
    const {part_name,description,category,price,mrp,stock,warranty_months,is_featured,is_active}=req.body;
    await db.query('UPDATE parts SET part_name=?,description=?,category=?,price=?,mrp=?,stock=?,warranty_months=?,is_featured=?,is_active=? WHERE id=?',
      [part_name,description,category,price,mrp||null,stock,warranty_months||12,is_featured||false,is_active!==false,req.params.id]);
    await db.query('UPDATE inventory SET available_stock=? WHERE part_id=?',[stock,req.params.id]);
    res.json({success:true,message:'Part updated.'});
  }catch{res.status(500).json({success:false,message:'Server error.'});}
};

const addHotspot = async (req,res)=>{
  try{
    const {diagram_id,part_id,x_percent,y_percent,width_pct,height_pct,label}=req.body;
    const [r]=await db.query('INSERT INTO diagram_hotspots (diagram_id,part_id,x_percent,y_percent,width_pct,height_pct,label) VALUES (?,?,?,?,?,?,?)',
      [diagram_id,part_id,x_percent,y_percent,width_pct||4,height_pct||4,label]);
    res.status(201).json({success:true,id:r.insertId});
  }catch{res.status(500).json({success:false,message:'Server error.'});}
};

module.exports={getAllParts,getPartById,getDiagramHotspots,getReviews,addReview,createPart,updatePart,addHotspot};
