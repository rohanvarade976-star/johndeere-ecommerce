import React,{createContext,useContext,useState,useEffect,useCallback} from 'react';
import {cartAPI} from '../utils/api';
import {useAuth} from './AuthContext';
const C=createContext(null);
export const CartProvider=({children})=>{
  const {isLoggedIn}=useAuth();
  const [cart,setCart]=useState({items:[],total:0,tax:0,shipping:0,grand_total:0});
  const [loading,setL]=useState(false);
  const fetchCart=useCallback(async()=>{
    if(!isLoggedIn())return;
    try{setL(true);const r=await cartAPI.get();setCart(r.data.data);}
    catch{}finally{setL(false);}
  },[isLoggedIn]);
  useEffect(()=>{fetchCart();},[fetchCart]);
  const addToCart=async(part_id,qty=1)=>{await cartAPI.add({part_id,quantity:qty});await fetchCart();};
  const updateItem=async(id,qty)=>{await cartAPI.update(id,{quantity:qty});await fetchCart();};
  const removeItem=async(id)=>{await cartAPI.remove(id);await fetchCart();};
  const clearCart=async()=>{await cartAPI.clear();setCart({items:[],total:0,tax:0,shipping:0,grand_total:0});};
  const count=cart.items?.reduce((s,i)=>s+i.quantity,0)||0;
  return(
    <C.Provider value={{cart,loading,itemCount:count,fetchCart,addToCart,updateItem,removeItem,clearCart}}>
      {children}
    </C.Provider>
  );
};
export const useCart=()=>{const c=useContext(C);if(!c)throw new Error('useCart outside CartProvider');return c;};
