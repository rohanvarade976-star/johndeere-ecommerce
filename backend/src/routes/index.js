
const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const path    = require('path');
const { auth, adminOnly, optionalAuth } = require('../middleware/auth');
const authCtrl  = require('../controllers/authController');
const eqCtrl    = require('../controllers/equipmentController');
const partsCtrl = require('../controllers/partsController');
const orderCtrl = require('../controllers/orderController');

const mkUpload = dest => multer({
  storage: multer.diskStorage({
    destination: (req,file,cb) => cb(null, `uploads/${dest}/`),
    filename:    (req,file,cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s/g,'_')}`)
  }),
  limits: { fileSize: parseInt(process.env.UPLOAD_MAX_SIZE||10485760) },
  fileFilter: (req,file,cb) => cb(null, ['.jpg','.jpeg','.png','.webp'].includes(path.extname(file.originalname).toLowerCase()))
});
const upEq    = mkUpload('equipment');
const upParts = mkUpload('parts');
const upDiag  = mkUpload('diagrams');

// AUTH
router.post('/auth/register',   authCtrl.register);
router.post('/auth/google',     authCtrl.googleAuth);
router.post('/auth/login',      authCtrl.login);
router.post('/auth/verify-otp', auth, authCtrl.verifyOTP);
router.post('/auth/resend-otp', auth, authCtrl.resendOTP);
router.get ('/auth/profile',    auth, authCtrl.getProfile);
router.put ('/auth/profile',    auth, authCtrl.updateProfile);

// EQUIPMENT
router.get ('/equipment',            eqCtrl.getAll);
router.get ('/equipment/categories', eqCtrl.getCategories);
router.get ('/equipment/:id',        eqCtrl.getById);
router.post('/equipment',            auth, adminOnly, upEq.single('image'), eqCtrl.create);
router.put ('/equipment/:id',        auth, adminOnly, eqCtrl.update);

// PARTS
router.get ('/parts',               optionalAuth, partsCtrl.getAllParts);
router.get ('/parts/:id',           optionalAuth, partsCtrl.getPartById);
router.post('/parts',               auth, adminOnly, upParts.single('image'), partsCtrl.createPart);
router.put ('/parts/:id',           auth, adminOnly, partsCtrl.updatePart);
router.get ('/parts/:id/reviews',   partsCtrl.getReviews);
router.post('/parts/:id/reviews',   auth, partsCtrl.addReview);

// DIAGRAMS
router.get ('/diagrams/:id/hotspots', partsCtrl.getDiagramHotspots);
router.post('/diagrams/hotspots',     auth, adminOnly, partsCtrl.addHotspot);
router.post('/diagrams',              auth, adminOnly, upDiag.single('image'), async (req,res)=>{
  const db=require('../config/db');
  try{
    const {equipment_id,diagram_name,diagram_type}=req.body;
    const image_path=req.file?`/uploads/diagrams/${req.file.filename}`:req.body.image_path||'';
    const [r]=await db.query('INSERT INTO diagrams (equipment_id,diagram_name,diagram_type,image_path) VALUES (?,?,?,?)',[equipment_id,diagram_name,diagram_type,image_path]);
    res.status(201).json({success:true,id:r.insertId});
  }catch{res.status(500).json({success:false,message:'Server error.'});}
});

// CART
router.get   ('/cart',               auth, orderCtrl.getCart);
router.post  ('/cart',               auth, orderCtrl.addToCart);
router.put   ('/cart/items/:item_id',auth, orderCtrl.updateCartItem);
router.delete('/cart/items/:item_id',auth, orderCtrl.removeFromCart);
router.delete('/cart',               auth, orderCtrl.clearCart);

// WISHLIST
router.get ('/wishlist',              auth, orderCtrl.getWishlist);
router.post('/wishlist/toggle',       auth, orderCtrl.toggleWishlist);
router.get ('/wishlist/check/:part_id',auth,orderCtrl.checkWishlist);

// ORDERS
router.post  ('/orders',             auth, orderCtrl.placeOrder);
router.get   ('/orders',             auth, orderCtrl.getUserOrders);
router.get   ('/orders/:id',         auth, orderCtrl.getOrderById);
router.patch ('/orders/:id/cancel',  auth, orderCtrl.cancelOrder);

// ADMIN
router.get  ('/admin/stats',              auth, adminOnly, orderCtrl.getAdminStats);
router.get  ('/admin/orders',             auth, adminOnly, orderCtrl.getAllOrders);
router.patch('/admin/orders/:id/status',  auth, adminOnly, orderCtrl.updateOrderStatus);
router.get  ('/admin/users',              auth, adminOnly, orderCtrl.getUsers);
router.patch('/admin/users/:id/toggle',   auth, adminOnly, orderCtrl.toggleUser);

module.exports = router;
