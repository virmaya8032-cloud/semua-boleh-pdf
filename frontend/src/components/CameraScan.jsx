import {useState,useEffect,useRef,useId} from 'react';
import {api} from '../services/api.js';
const defaults=()=>[{x:6,y:6},{x:94,y:6},{x:94,y:94},{x:6,y:94}];
const labels=['atas kiri','atas kanan','bawah kanan','bawah kiri'];
export function validCorners(points){
 if(!Array.isArray(points)||points.length!==4||points.some(p=>!Number.isFinite(p.x)||!Number.isFinite(p.y)||p.x<0||p.x>100||p.y<0||p.y>100))return false;
 for(let i=0;i<4;i++){const a=points[i],b=points[(i+1)%4],c=points[(i+2)%4];if((b.x-a.x)*(c.y-b.y)-(b.y-a.y)*(c.x-b.x)<=0)return false;}
 return points.reduce((sum,p,i)=>{const q=points[(i+1)%4];return sum+p.x*q.y-q.x*p.y;},0)/2>=100;
}
export default function CameraScan({files,onFiles,value,onChange,onBusy}){
 const [index,setIndex]=useState(0),[url,setUrl]=useState(''),[active,setActive]=useState(null),[busy,setBusy]=useState(''),[message,setMessage]=useState(''),[preview,setPreview]=useState(''),[aspect,setAspect]=useState(1);
 const box=useRef(null),drag=useRef(null),revision=useRef(0),request=useRef(null),latest=useRef({});const clip=useId().replace(/:/g,'');
 let corners;try{corners=JSON.parse(value||'{}');}catch{corners={};}
 if(!corners||typeof corners!=='object'||Array.isArray(corners))corners={};
 const points=validCorners(corners[index])?corners[index]:defaults(),file=files[index];latest.current={corners,index,onChange,points};
 const save=next=>{const state=latest.current;state.onChange(JSON.stringify({...state.corners,[state.index]:next}));latest.current={...state,points:next,corners:{...state.corners,[state.index]:next}};};
 const inspect=async(auto=false)=>{
  request.current?.abort();const controller=new AbortController();request.current=controller;const version=++revision.current;setBusy(auto?'auto':'preview');setPreview('');setMessage('');
  try{const data=await api.periksaPdf(file,1,controller.signal,'scan',auto?{}:{penjuru:JSON.stringify(latest.current.points)});
   if(controller.signal.aborted||version!==revision.current)return;
   if(auto){if(validCorners(data.penjuru)){save(data.penjuru);setMessage(data.dikesan?'Tepi kertas dikesan. Tarik penjuru untuk melaras.':'Tepi tidak jelas. Tarik empat penjuru ke tepi kertas.');}}else{setPreview(data.pratonton);setMessage('Pratonton sahaja. PDF akhir menggunakan tetapan warna yang dipilih.');}
  }catch(error){if(!controller.signal.aborted&&version===revision.current)setMessage(auto?'Tepi automatik tidak tersedia. Tarik penjuru secara manual.':error.message);}
  finally{if(request.current===controller)setBusy('');}
 };
 useEffect(()=>{onBusy?.(!!busy);},[busy,onBusy]);
 useEffect(()=>{if(index>=files.length)setIndex(Math.max(0,files.length-1));},[files.length,index]);
 useEffect(()=>{
  request.current?.abort();revision.current++;drag.current=null;setActive(null);setPreview('');setMessage('');setBusy('');
  if(!file){setUrl('');return;}
  const next=URL.createObjectURL(file);setUrl(next);
  if(!validCorners(latest.current.corners[index])){save(defaults());void inspect(true);}
  return()=>{request.current?.abort();revision.current++;URL.revokeObjectURL(next);};
 },[file,index]);
 const move=(corner,next)=>{const updated=latest.current.points.map((p,i)=>i===corner?next:p);if(!validCorners(updated))return;revision.current++;request.current?.abort();setBusy('');setPreview('');setMessage('');save(updated);};
 const pointer=e=>{
  if(!drag.current||e.pointerId!==drag.current.pointer)return;
  const rect=box.current.getBoundingClientRect();if(!rect.width||!rect.height)return;
  move(drag.current.corner,{x:Math.max(0,Math.min(100,(e.clientX-rect.left)/rect.width*100)),y:Math.max(0,Math.min(100,(e.clientY-rect.top)/rect.height*100))});
 };
 const end=e=>{if(drag.current?.pointer===e.pointerId){drag.current=null;setActive(null);}};
 const polygon=points.map(p=>`${p.x},${p.y}`).join(' '),point=active===null?null:points[active];
 return <section className="mt-4 rounded-xl border p-4"><label className="btn-lembut cursor-pointer">Ambil gambar dengan kamera<input className="sr-only" type="file" accept="image/jpeg,image/png" capture="environment" onChange={e=>{onFiles(Array.from(e.target.files||[]));e.target.value='';}}/></label><p className="mt-2 text-sm text-gray-500">Tarik empat bulatan ke penjuru kertas. Bahagian gelap dibuang, kemudian kertas diluruskan.</p>{file&&<><label className="mt-3 block">Gambar<select className="medan" value={index} onChange={e=>setIndex(Number(e.target.value))}>{files.map((f,i)=><option key={i} value={i}>{i+1}. {f.name}</option>)}</select></label>
 {url&&<div ref={box} data-testid="scan-crop" className="relative mx-auto mt-4 w-fit max-w-full select-none" onPointerMove={pointer} onPointerUp={end} onPointerCancel={end}>
 <img src={url} alt="Gambar untuk scan" draggable="false" onLoad={e=>setAspect(e.currentTarget.naturalWidth/e.currentTarget.naturalHeight||1)} className="block max-h-[600px] max-w-full"/>
 <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><defs><clipPath id={clip}><polygon points={polygon}/></clipPath></defs><path d={`M0 0H100V100H0Z M${points.map(p=>`${p.x} ${p.y}`).join('L')}Z`} fill="rgba(0,0,0,.6)" fillRule="evenodd"/><g clipPath={`url(#${clip})`} stroke="white" strokeOpacity=".35" strokeWidth=".15"><path d="M33 0V100 M66 0V100 M0 33H100 M0 66H100"/></g><polygon points={polygon} fill="none" stroke="#22d3ee" strokeWidth=".5"/></svg>
 {points.map((p,i)=><button key={i} type="button" aria-label={`Penjuru ${labels[i]}`} style={{left:`${p.x}%`,top:`${p.y}%`,transform:'translate(-50%,-50%)',touchAction:'none',width:44,height:44}} className="absolute flex items-center justify-center rounded-full cursor-grab focus:outline-none focus:ring-2 focus:ring-cyan-400" onPointerDown={e=>{if(e.button!==undefined&&e.button!==0)return;e.preventDefault();e.currentTarget.setPointerCapture?.(e.pointerId);drag.current={corner:i,pointer:e.pointerId};setActive(i);}} onLostPointerCapture={()=>{drag.current=null;setActive(null);}} onKeyDown={e=>{const directions={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};if(!directions[e.key])return;e.preventDefault();const [x,y]=directions[e.key],step=e.shiftKey?2:.5;move(i,{x:Math.max(0,Math.min(100,p.x+x*step)),y:Math.max(0,Math.min(100,p.y+y*step))});}}><span style={{width:20,height:20,boxShadow:'0 1px 6px #0008'}} className="rounded-full border-[3px] border-white bg-cyan-400"/></button>)}
 {point&&<svg role="img" aria-label="Kanta pembesar penjuru" className="pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-full border-4 border-white bg-gray-900 shadow-lg" style={{width:112,height:112,...(point.y<30?{bottom:8}:{top:8})}} viewBox={`${point.x-9} ${point.y-9*aspect} 18 ${18*aspect}`} preserveAspectRatio="none"><image href={url} x="0" y="0" width="100" height="100" preserveAspectRatio="none"/><path d={`M${point.x-3} ${point.y}h6 M${point.x} ${point.y-3}v6`} stroke="#22d3ee" strokeWidth=".3"/></svg>}
 </div>}
 <div className="mt-4 flex flex-wrap gap-2"><button type="button" className="btn-lembut" disabled={!!busy} onClick={()=>inspect(true)}>{busy==='auto'?'Mengesan tepi…':'Kesan tepi automatik'}</button><button type="button" className="btn-lembut" onClick={()=>{request.current?.abort();revision.current++;setBusy('');setPreview('');setMessage('');save(defaults());}}>Reset penjuru gambar ini</button><button type="button" className="btn-utama" disabled={!!busy} onClick={()=>inspect(false)}>{busy==='preview'?'Meluruskan…':'Pratonton crop'}</button></div>
 {message&&<p role="status" className="mt-3 text-sm">{message}</p>}{preview&&<figure className="mt-4 rounded-lg bg-gray-100 p-3"><figcaption className="mb-2 text-sm font-semibold">Hasil crop dan luruskan</figcaption><img src={preview} alt="Pratonton kertas selepas crop" className="mx-auto max-h-[500px] max-w-full"/></figure>}</>}</section>;
}
