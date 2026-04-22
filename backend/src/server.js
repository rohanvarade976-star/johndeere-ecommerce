
require('dotenv').config();
const express     = require('express');
const cors        = require('cors');
const helmet      = require('helmet');
const morgan      = require('morgan');
const rateLimit   = require('express-rate-limit');
const compression = require('compression');
const path        = require('path');

const app   = express();
const PORT  = process.env.PORT || 5000;
const FRONT = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use(compression());
app.use(helmet({ crossOriginResourcePolicy:{ policy:'cross-origin' } }));
app.use(rateLimit({ windowMs:60*1000, max:200, message:{ success:false, message:'Too many requests.' } }));
app.use(cors({ origin:FRONT, credentials:true, methods:['GET','POST','PUT','PATCH','DELETE','OPTIONS'] }));
app.use(express.json({ limit:'10mb' }));
app.use(express.urlencoded({ extended:true }));
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname,'../uploads')));
app.use('/api', require('./routes/index'));
app.get('/health', (_,res) => res.json({ success:true, message:'John Deere E-Commerce Parts System API v4.0', timestamp:new Date() }));
app.use((_,res) => res.status(404).json({ success:false, message:'Route not found.' }));
app.use((err,req,res,next) => { console.error(err); res.status(500).json({ success:false, message:'Server error.' }); });

app.listen(PORT, () => {
  console.log(`\n🚀 John Deere E-Commerce Parts System API`);
  console.log(`   Running at: http://localhost:${PORT}`);
  console.log(`   Health:     http://localhost:${PORT}/health\n`);
});
module.exports = app;
