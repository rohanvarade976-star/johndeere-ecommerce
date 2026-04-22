const jwt = require('jsonwebtoken');
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success:false, message:'Authentication required.' });
  try { req.user = jwt.verify(token, process.env.JWT_SECRET); next(); }
  catch { res.status(403).json({ success:false, message:'Invalid or expired token.' }); }
};
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ success:false, message:'Admin access required.' });
  next();
};
const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) { try { req.user = jwt.verify(token, process.env.JWT_SECRET); } catch {} }
  next();
};
module.exports = { auth, adminOnly, optionalAuth };
