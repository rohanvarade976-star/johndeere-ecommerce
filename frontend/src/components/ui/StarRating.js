import React from 'react';
export const StarRating=({rating=0,max=5,size=16,interactive=false,onRate=null})=>{
  const [hover,setHover]=React.useState(0);
  return(
    <div style={{display:'inline-flex',gap:1,cursor:interactive?'pointer':'default'}}>
      {Array.from({length:max},(_,i)=>{
        const v=i+1,filled=(interactive?(hover||rating):rating)>=v;
        return <span key={i} style={{fontSize:size,color:filled?'#f59e0b':'#d1d5db',transition:'color 0.1s',lineHeight:1}}
          onMouseEnter={()=>interactive&&setHover(v)} onMouseLeave={()=>interactive&&setHover(0)}
          onClick={()=>interactive&&onRate&&onRate(v)}>★</span>;
      })}
    </div>
  );
};
export const RatingDisplay=({rating,count,size=14})=>(
  <div style={{display:'flex',alignItems:'center',gap:5}}>
    <StarRating rating={Math.round(parseFloat(rating||0))} size={size}/>
    <span style={{fontSize:size,fontWeight:700,color:'#374151'}}>{parseFloat(rating||0).toFixed(1)}</span>
    {count!==undefined&&<span style={{fontSize:size-1,color:'#9ca3af'}}>({count})</span>}
  </div>
);
