
import React,{Suspense,lazy} from 'react';
import {BrowserRouter,Routes,Route,Navigate} from 'react-router-dom';
import {Toaster} from 'react-hot-toast';
import {AuthProvider,useAuth} from './context/AuthContext';
import {CartProvider} from './context/CartContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

const Loading = () => (
  <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh',flexDirection:'column',gap:16}}>
    <div style={{width:48,height:48,background:'var(--jd-yellow)',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:18,color:'var(--jd-green-dark)'}}>JD</div>
    <div className="spinner"/>
  </div>
);

const HomePage       = lazy(()=>import('./pages/HomePage'));
const LoginPage      = lazy(()=>import('./pages/LoginPage'));
const RegisterPage   = lazy(()=>import('./pages/RegisterPage'));
const VerifyPage     = lazy(()=>import('./pages/VerifyPage'));
const EquipmentPage  = lazy(()=>import('./pages/EquipmentPage'));
const DiagramPage    = lazy(()=>import('./pages/DiagramPage'));
const PartsPage      = lazy(()=>import('./pages/PartsPage'));
const PartDetailPage = lazy(()=>import('./pages/PartDetailPage'));
const CartPage       = lazy(()=>import('./pages/CartPage'));
const CheckoutPage   = lazy(()=>import('./pages/CheckoutPage'));
const OrdersPage     = lazy(()=>import('./pages/OrdersPage'));
const OrderDetailPage= lazy(()=>import('./pages/OrderDetailPage'));
const WishlistPage   = lazy(()=>import('./pages/WishlistPage'));
const ProfilePage    = lazy(()=>import('./pages/ProfilePage'));
const AdminPage      = lazy(()=>import('./pages/AdminPage'));
const NotFoundPage   = lazy(()=>import('./pages/NotFoundPage'));

const ProtectedRoute=({children,adminOnly=false})=>{
  const {isLoggedIn,isAdmin}=useAuth();
  if(!isLoggedIn()) return <Navigate to="/login" replace/>;
  if(adminOnly&&!isAdmin()) return <Navigate to="/" replace/>;
  return children;
};

function AppRoutes(){
  return(
    <BrowserRouter>
      <div style={{display:'flex',flexDirection:'column',minHeight:'100vh'}}>
        <Navbar/>
        <main style={{flex:1,paddingTop:72}}>
          <Suspense fallback={<Loading/>}>
            <Routes>
              <Route path="/"              element={<HomePage/>}/>
              <Route path="/login"         element={<LoginPage/>}/>
              <Route path="/register"      element={<RegisterPage/>}/>
              <Route path="/verify-email"  element={<VerifyPage/>}/>
              <Route path="/equipment"     element={<EquipmentPage/>}/>
              <Route path="/equipment/:id" element={<DiagramPage/>}/>
              <Route path="/parts"         element={<PartsPage/>}/>
              <Route path="/parts/:id"     element={<PartDetailPage/>}/>
              <Route path="/cart"          element={<ProtectedRoute><CartPage/></ProtectedRoute>}/>
              <Route path="/checkout"      element={<ProtectedRoute><CheckoutPage/></ProtectedRoute>}/>
              <Route path="/orders"        element={<ProtectedRoute><OrdersPage/></ProtectedRoute>}/>
              <Route path="/orders/:id"    element={<ProtectedRoute><OrderDetailPage/></ProtectedRoute>}/>
              <Route path="/wishlist"      element={<ProtectedRoute><WishlistPage/></ProtectedRoute>}/>
              <Route path="/profile"       element={<ProtectedRoute><ProfilePage/></ProtectedRoute>}/>
              <Route path="/admin/*"       element={<ProtectedRoute adminOnly><AdminPage/></ProtectedRoute>}/>
              <Route path="*"             element={<NotFoundPage/>}/>
            </Routes>
          </Suspense>
        </main>
        <Footer/>
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          duration:3500,
          style:{
            background:'white',
            color:'#111827',
            borderRadius:'10px',
            padding:'12px 16px',
            fontSize:'14px',
            fontWeight:'500',
            boxShadow:'0 10px 25px rgba(0,0,0,0.12)',
            border:'1px solid #e5e7eb',
            fontFamily:'inherit',
          },
          success:{ iconTheme:{ primary:'#367c2b', secondary:'white' } },
          error:{ iconTheme:{ primary:'#dc2626', secondary:'white' } },
        }}
      />
    </BrowserRouter>
  );
}

export default function App(){
  return(
    <AuthProvider>
      <CartProvider>
        <AppRoutes/>
      </CartProvider>
    </AuthProvider>
  );
}
