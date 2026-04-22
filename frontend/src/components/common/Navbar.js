
import React,{useState,useEffect,useRef} from 'react';
import {Link,NavLink,useNavigate,useLocation} from 'react-router-dom';
import {FiShoppingCart,FiMenu,FiX,FiHeart,FiBell,FiSearch,FiChevronDown,FiLogOut,FiUser,FiSettings,FiPackage} from 'react-icons/fi';
import {useAuth} from '../../context/AuthContext';
import {useCart} from '../../context/CartContext';
import './Navbar.css';

export default function Navbar() {
  const {user,isLoggedIn,isAdmin,logout}=useAuth();
  const {itemCount}=useCart();
  const navigate=useNavigate();
  const location=useLocation();
  const [menuOpen,setMenu]=useState(false);
  const [userOpen,setUser]=useState(false);
  const [searchOpen,setSearch]=useState(false);
  const [searchQ,setQ]=useState('');
  const [scrolled,setScrolled]=useState(false);
  const dropRef=useRef(null);

  useEffect(()=>{ setMenu(false); setUser(false); setSearch(false); },[location]);
  useEffect(()=>{ const h=()=>setScrolled(window.scrollY>10); window.addEventListener('scroll',h); return ()=>window.removeEventListener('scroll',h); },[]);
  useEffect(()=>{ const h=e=>{ if(dropRef.current&&!dropRef.current.contains(e.target))setUser(false); }; document.addEventListener('mousedown',h); return ()=>document.removeEventListener('mousedown',h); },[]);

  const handleSearch=e=>{ e.preventDefault(); if(searchQ.trim()){navigate(`/parts?search=${encodeURIComponent(searchQ)}`);setSearch(false);setQ('');} };

  const avatar = user?.avatar_url ? (
    <img src={user.avatar_url} alt={user.name} style={{width:30,height:30,borderRadius:'50%',objectFit:'cover'}}/>
  ) : (
    <div className="nav-avatar-letter">{user?.name?.charAt(0).toUpperCase()}</div>
  );

  return(
    <>
      <nav className={`navbar ${scrolled?'scrolled':''}`}>
        <div className="navbar-inner container">
          {/* Logo */}
          <Link to="/" className="nav-logo">
            <div className="logo-badge">
              <span className="logo-jd">JD</span>
            </div>
            <div className="logo-text">
              <span className="logo-title">John Deere</span>
              <span className="logo-sub">E-Commerce Parts Diagram System</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className={`nav-links ${menuOpen?'open':''}`}>
            {[['Equipment','/equipment'],['Parts Catalog','/parts']].map(([l,to])=>(
              <NavLink key={to} to={to} className={({isActive})=>`nav-link${isActive?' active':''}`} onClick={()=>setMenu(false)}>{l}</NavLink>
            ))}
            {isLoggedIn()&&<NavLink to="/orders" className={({isActive})=>`nav-link${isActive?' active':''}`} onClick={()=>setMenu(false)}>My Orders</NavLink>}
            {isAdmin()&&<NavLink to="/admin" className={({isActive})=>`nav-link nav-admin${isActive?' active':''}`} onClick={()=>setMenu(false)}>Admin</NavLink>}
          </div>

          {/* Actions */}
          <div className="nav-actions">
            <button className="nav-icon-btn" onClick={()=>setSearch(s=>!s)} title="Search"><FiSearch size={19}/></button>
            <Link to="/cart" className="nav-icon-btn cart-btn">
              <FiShoppingCart size={19}/>
              {itemCount>0&&<span className="nav-badge">{itemCount>9?'9+':itemCount}</span>}
            </Link>
            {isLoggedIn()&&<Link to="/wishlist" className="nav-icon-btn" title="Wishlist"><FiHeart size={19}/></Link>}

            {isLoggedIn()?(
              <div className="user-menu" ref={dropRef}>
                <button className="user-trigger" onClick={()=>setUser(o=>!o)}>
                  {avatar}
                  <span className="user-name-text">{user?.name?.split(' ')[0]}</span>
                  <FiChevronDown size={14} style={{transition:'transform 0.2s',transform:userOpen?'rotate(180deg)':'rotate(0deg)'}}/>
                </button>
                {userOpen&&(
                  <div className="user-dropdown">
                    <div className="dropdown-profile">
                      <div className="dp-avatar">{avatar}</div>
                      <div><div className="dp-name">{user?.name}</div><div className="dp-email">{user?.email}</div></div>
                    </div>
                    <div className="dropdown-divider"/>
                    <div className="dropdown-links">
                      {[['Profile','/profile',FiUser],['My Orders','/orders',FiPackage],['Wishlist','/wishlist',FiHeart]].map(([lbl,to,Icon])=>(
                        <Link key={to} to={to} className="dropdown-link"><Icon size={14}/>{lbl}</Link>
                      ))}
                      {isAdmin()&&<Link to="/admin" className="dropdown-link admin"><FiSettings size={14}/>Admin Panel</Link>}
                    </div>
                    <div className="dropdown-divider"/>
                    <button className="dropdown-logout" onClick={()=>{logout();navigate('/');}}>
                      <FiLogOut size={14}/>Sign Out
                    </button>
                  </div>
                )}
              </div>
            ):(
              <div className="auth-buttons">
                <Link to="/login"    className="btn btn-outline btn-sm" style={{borderColor:'rgba(255,255,255,0.4)',color:'white'}}>Sign In</Link>
                <Link to="/register" className="btn btn-secondary btn-sm">Get Started</Link>
              </div>
            )}
            <button className="mobile-toggle" onClick={()=>setMenu(m=>!m)}>
              {menuOpen?<FiX size={22}/>:<FiMenu size={22}/>}
            </button>
          </div>
        </div>
      </nav>

      {/* Search bar */}
      {searchOpen&&(
        <div className="search-bar-overlay">
          <form onSubmit={handleSearch} className="search-bar-form container">
            <FiSearch size={20} style={{color:'#9ca3af',flexShrink:0}}/>
            <input autoFocus type="text" placeholder="Search by part name, number (e.g. RE504836, Oil Filter, Alternator)..."
              value={searchQ} onChange={e=>setQ(e.target.value)} className="search-bar-input"/>
            <button type="submit" className="btn btn-primary btn-sm">Search</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={()=>setSearch(false)}><FiX size={16}/></button>
          </form>
        </div>
      )}
    </>
  );
}
