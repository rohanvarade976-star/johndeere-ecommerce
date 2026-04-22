import React from 'react';
const S=({h=16,w='100%',r=8,style={}})=><div className="skeleton" style={{height:h,width:w,borderRadius:r,...style}}/>;
export const ProductCardSkeleton=()=>(
  <div className="card">
    <S h={168} r="14px 14px 0 0" w="100%"/>
    <div style={{padding:'14px 16px'}}>
      <S h={10} w="40%" style={{marginBottom:8}}/><S h={16} style={{marginBottom:6}}/><S h={12} w="70%" style={{marginBottom:12}}/>
      <div style={{display:'flex',justifyContent:'space-between'}}><S h={22} w="35%"/><S h={32} w="80px" r={6}/></div>
    </div>
  </div>
);
export const EquipmentCardSkeleton=()=>(
  <div className="card">
    <S h={220} r="14px 14px 0 0" w="100%"/>
    <div style={{padding:20}}><S h={12} w="30%" style={{marginBottom:8}}/><S h={18} style={{marginBottom:8}}/><S h={12} w="80%" style={{marginBottom:6}}/><S h={12} w="60%" style={{marginBottom:16}}/><S h={14} w="45%"/></div>
  </div>
);
