import axios from 'axios';
const API = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api', timeout:15000 });
API.interceptors.request.use(cfg => { const t=localStorage.getItem('jd_token'); if(t) cfg.headers.Authorization=`Bearer ${t}`; return cfg; });
API.interceptors.response.use(r=>r, err=>{
  if(err.response?.status===401){ localStorage.removeItem('jd_token'); localStorage.removeItem('jd_user'); window.location.href='/login'; }
  return Promise.reject(err);
});
export const authAPI     = { register:d=>API.post('/auth/register',d), googleAuth:d=>API.post('/auth/google',d), login:d=>API.post('/auth/login',d), verifyOTP:d=>API.post('/auth/verify-otp',d), resendOTP:()=>API.post('/auth/resend-otp'), profile:()=>API.get('/auth/profile'), update:d=>API.put('/auth/profile',d) };
export const equipmentAPI= { getAll:p=>API.get('/equipment',{params:p}), getById:id=>API.get(`/equipment/${id}`), getCategories:()=>API.get('/equipment/categories'), create:d=>API.post('/equipment',d,{headers:{'Content-Type':'multipart/form-data'}}), update:(id,d)=>API.put(`/equipment/${id}`,d) };
export const partsAPI    = { getAll:p=>API.get('/parts',{params:p}), getById:id=>API.get(`/parts/${id}`), getHotspots:id=>API.get(`/diagrams/${id}/hotspots`), getReviews:id=>API.get(`/parts/${id}/reviews`), addReview:(id,d)=>API.post(`/parts/${id}/reviews`,d), create:d=>API.post('/parts',d,{headers:{'Content-Type':'multipart/form-data'}}), update:(id,d)=>API.put(`/parts/${id}`,d), addHotspot:d=>API.post('/diagrams/hotspots',d) };
export const cartAPI     = { get:()=>API.get('/cart'), add:d=>API.post('/cart',d), update:(id,d)=>API.put(`/cart/items/${id}`,d), remove:id=>API.delete(`/cart/items/${id}`), clear:()=>API.delete('/cart') };
export const wishlistAPI = { get:()=>API.get('/wishlist'), toggle:d=>API.post('/wishlist/toggle',d), check:id=>API.get(`/wishlist/check/${id}`) };
export const orderAPI    = { place:d=>API.post('/orders',d), getAll:()=>API.get('/orders'), getById:id=>API.get(`/orders/${id}`), cancel:id=>API.patch(`/orders/${id}/cancel`) };
export const adminAPI    = { getStats:()=>API.get('/admin/stats'), getAllOrders:p=>API.get('/admin/orders',{params:p}), updateStatus:(id,d)=>API.patch(`/admin/orders/${id}/status`,d), getUsers:()=>API.get('/admin/users'), toggleUser:id=>API.patch(`/admin/users/${id}/toggle`) };
export default API;
