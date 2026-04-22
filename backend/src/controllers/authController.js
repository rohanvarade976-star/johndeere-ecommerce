
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const db      = require('../config/db');
const { sendOTP } = require('../utils/email');
const { OAuth2Client } = require('google-auth-library');

const client  = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const sign    = (u) => jwt.sign({ id:u.id, email:u.email, role:u.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
const makeOTP = () => String(Math.floor(100000 + Math.random() * 900000));

const register = async (req, res) => {
  try {
    const { name, email, password, role='customer', phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success:false, message:'Name, email and password are required.' });
    if (password.length < 6) return res.status(400).json({ success:false, message:'Password must be at least 6 characters.' });

    const [ex] = await db.query('SELECT id FROM users WHERE email=?', [email]);
    if (ex.length) return res.status(409).json({ success:false, message:'Email already registered.' });

    const hashed = await bcrypt.hash(password, 12);
    const otp = makeOTP();
    const otpExp = new Date(Date.now() + 10*60*1000);

    const [r] = await db.query(
      'INSERT INTO users (name,email,password,role,phone,otp,otp_expires) VALUES (?,?,?,?,?,?,?)',
      [name, email, hashed, role, phone||null, otp, otpExp]
    );
    await db.query('INSERT INTO carts (user_id) VALUES (?)', [r.insertId]);
    await sendOTP(email, name, otp);

    const token = sign({ id:r.insertId, email, role });
    res.status(201).json({
      success: true,
      message: 'Account created! Please verify your email.',
      token,
      user: { id:r.insertId, name, email, role, email_verified:false, avatar_url:null }
    });
  } catch(err) { console.error(err); res.status(500).json({ success:false, message:'Registration failed.' }); }
};

const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    const ticket = await client.verifyIdToken({ idToken:credential, audience:process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    const { sub:google_id, email, name, picture } = payload;

    let [users] = await db.query('SELECT * FROM users WHERE email=? OR google_id=?', [email, google_id]);
    let user;

    if (users.length) {
      user = users[0];
      await db.query('UPDATE users SET google_id=?, avatar_url=?, email_verified=TRUE WHERE id=?', [google_id, picture, user.id]);
      user.avatar_url = picture;
    } else {
      const [r] = await db.query(
        'INSERT INTO users (name,email,google_id,avatar_url,role,email_verified) VALUES (?,?,?,?,?,?)',
        [name, email, google_id, picture, 'customer', true]
      );
      await db.query('INSERT INTO carts (user_id) VALUES (?)', [r.insertId]);
      user = { id:r.insertId, name, email, role:'customer', avatar_url:picture, email_verified:true };
    }

    const token = sign(user);
    res.json({
      success: true,
      message: 'Google sign-in successful.',
      token,
      user: { id:user.id, name:user.name, email:user.email, role:user.role, avatar_url:user.avatar_url, email_verified:true }
    });
  } catch(err) { console.error(err); res.status(400).json({ success:false, message:'Google authentication failed.' }); }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const [users] = await db.query(
      'SELECT id,name,email,password,role,email_verified,is_active,avatar_url FROM users WHERE email=?', [email]
    );
    if (!users.length) return res.status(401).json({ success:false, message:'Invalid email or password.' });
    const u = users[0];
    if (!u.is_active) return res.status(403).json({ success:false, message:'Account suspended. Contact support.' });
    if (!u.password) return res.status(401).json({ success:false, message:'Please use Google Sign-In for this account.' });
    const ok = await bcrypt.compare(password, u.password);
    if (!ok) return res.status(401).json({ success:false, message:'Invalid email or password.' });
    const token = sign(u);
    res.json({ success:true, token, user:{ id:u.id, name:u.name, email:u.email, role:u.role, email_verified:u.email_verified, avatar_url:u.avatar_url } });
  } catch(err) { console.error(err); res.status(500).json({ success:false, message:'Login failed.' }); }
};

const verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    const [u] = await db.query('SELECT id,otp,otp_expires FROM users WHERE id=?', [req.user.id]);
    if (!u.length || u[0].otp !== otp || new Date(u[0].otp_expires) < new Date())
      return res.status(400).json({ success:false, message:'Invalid or expired OTP.' });
    await db.query('UPDATE users SET email_verified=TRUE,otp=NULL,otp_expires=NULL WHERE id=?', [req.user.id]);
    res.json({ success:true, message:'Email verified successfully!' });
  } catch { res.status(500).json({ success:false, message:'Verification failed.' }); }
};

const resendOTP = async (req, res) => {
  try {
    const otp = makeOTP();
    const exp = new Date(Date.now() + 10*60*1000);
    const [u] = await db.query('SELECT name,email FROM users WHERE id=?', [req.user.id]);
    await db.query('UPDATE users SET otp=?,otp_expires=? WHERE id=?', [otp, exp, req.user.id]);
    await sendOTP(u[0].email, u[0].name, otp);
    res.json({ success:true, message:'OTP sent.' });
  } catch { res.status(500).json({ success:false, message:'Failed.' }); }
};

const getProfile = async (req, res) => {
  try {
    const [u] = await db.query(
      'SELECT id,name,email,role,phone,address,city,state,pincode,email_verified,avatar_url,created_at FROM users WHERE id=?',
      [req.user.id]
    );
    if (!u.length) return res.status(404).json({ success:false, message:'User not found.' });
    res.json({ success:true, user:u[0] });
  } catch { res.status(500).json({ success:false, message:'Server error.' }); }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, city, state, pincode } = req.body;
    await db.query('UPDATE users SET name=?,phone=?,address=?,city=?,state=?,pincode=? WHERE id=?',
      [name,phone,address,city,state,pincode,req.user.id]);
    res.json({ success:true, message:'Profile updated.' });
  } catch { res.status(500).json({ success:false, message:'Server error.' }); }
};

module.exports = { register, googleAuth, login, verifyOTP, resendOTP, getProfile, updateProfile };
