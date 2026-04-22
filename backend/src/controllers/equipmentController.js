
const db = require('../config/db');
const getAll = async (req,res)=>{
  try{
    const {category,search,region}=req.query; let q='SELECT * FROM equipment_models WHERE is_active=TRUE',p=[];
    if(category){q+=' AND category=?';p.push(category);}
    if(region){q+=' AND region=?';p.push(region);}
    if(search){q+=' AND (model_name LIKE ? OR model_code LIKE ?)';p.push(`%${search}%`,`%${search}%`);}
    q+=' ORDER BY category,model_name';
    const [rows]=await db.query(q,p);
    res.json({success:true,count:rows.length,data:rows});
  }catch{res.status(500).json({success:false,message:'Server error.'});}
};
const getById = async (req,res)=>{
  try{
    await db.query('UPDATE equipment_models SET view_count=view_count+1 WHERE id=?',[req.params.id]);
    const [eq]=await db.query('SELECT * FROM equipment_models WHERE id=? AND is_active=TRUE',[req.params.id]);
    if(!eq.length)return res.status(404).json({success:false,message:'Equipment not found.'});
    const [diags]=await db.query('SELECT id,diagram_name,diagram_type,image_path,is_interactive FROM diagrams WHERE equipment_id=?',[req.params.id]);
    res.json({success:true,data:{...eq[0],diagrams:diags}});
  }catch{res.status(500).json({success:false,message:'Server error.'});}
};
const getCategories = async (req,res)=>{
  try{
    const [rows]=await db.query('SELECT category,COUNT(*) as count FROM equipment_models WHERE is_active=TRUE GROUP BY category');
    res.json({success:true,data:rows});
  }catch{res.status(500).json({success:false,message:'Server error.'});}
};
const create = async (req,res)=>{
  try{
    const {model_code,model_name,category,series,manufacturer,region,description,features,horsepower,engine_type,year_from}=req.body;
    const image_url=req.file?`/uploads/equipment/${req.file.filename}`:req.body.image_url||null;
    const [r]=await db.query('INSERT INTO equipment_models (model_code,model_name,category,series,manufacturer,region,description,features,image_url,horsepower,engine_type,year_from) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
      [model_code,model_name,category,series,manufacturer||'John Deere',region,description,features,image_url,horsepower||null,engine_type||null,year_from||null]);
    res.status(201).json({success:true,id:r.insertId});
  }catch(e){if(e.code==='ER_DUP_ENTRY')return res.status(409).json({success:false,message:'Model code exists.'});res.status(500).json({success:false,message:'Server error.'});}
};
const update = async (req,res)=>{
  try{
    const {model_name,category,series,region,description,features,horsepower,is_active}=req.body;
    await db.query('UPDATE equipment_models SET model_name=?,category=?,series=?,region=?,description=?,features=?,horsepower=?,is_active=? WHERE id=?',
      [model_name,category,series,region,description,features,horsepower||null,is_active!==false,req.params.id]);
    res.json({success:true,message:'Updated.'});
  }catch{res.status(500).json({success:false,message:'Server error.'});}
};
module.exports={getAll,getById,getCategories,create,update};
