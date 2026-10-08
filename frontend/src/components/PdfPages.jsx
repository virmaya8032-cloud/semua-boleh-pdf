import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { usePdfDocument } from './pdfPreview.js';

export function Thumbnail({ doc, number, angle }) {
  const canvas = useRef(null);
  useEffect(() => {
    let stopped=false, task;
    (async()=>{
      const page=await doc.getPage(number); if(stopped)return;
      const base=page.getViewport({scale:1,rotation:(page.rotate+angle)%360});
      const viewport=page.getViewport({scale:Math.min(150/base.width,200/base.height),rotation:(page.rotate+angle)%360});
      canvas.current.width=viewport.width;canvas.current.height=viewport.height;
      task=page.render({canvasContext:canvas.current.getContext('2d'),viewport});await task.promise;
    })().catch(()=>{});
    return()=>{stopped=true;task?.cancel();};
  },[doc,number,angle]);
  return <canvas ref={canvas} className="max-h-48 max-w-full"/>;
}

export default function PdfPages({ file, action, angle=90, value, onChange }) {
  const {doc,error}=usePdfDocument(file);
  const [selected,setSelected]=useState([]),[order,setOrder]=useState([]),[batch,setBatch]=useState(0);
  const update=useRef(onChange);update.current=onChange;
  const initial=useRef(value);
  useEffect(()=>{
    if(!doc)return;
    const all=Array.from({length:doc.numPages},(_,i)=>i+1);
    const saved=initial.current===undefined?null:String(initial.current).split(',').map(Number).filter(n=>n>=1&&n<=doc.numPages);
    const selection=saved||(action==='delete'?[]:all);
    setOrder(action==='reorder'&&saved?.length?saved:all);setSelected(selection);setBatch(0);
    update.current((action==='reorder'?(saved?.length?saved:all):selection).join(','));
  },[doc,action]);
  const toggle=n=>{const next=selected.includes(n)?selected.filter(i=>i!==n):[...selected,n].sort((a,b)=>a-b);setSelected(next);update.current(next.join(','));};
  const all=()=>{const next=selected.length===order.length?[]:[...order];setSelected(next);update.current(next.join(','));};
  const reorder=(from,to)=>{
    if(to<0||to>=order.length)return;
    const next=[...order];next.splice(to,0,next.splice(from,1)[0]);setOrder(next);update.current(next.join(','));
  };
  const pageSize=20,totalBatches=Math.ceil(order.length/pageSize);
  const descriptions={delete:'Klik halaman yang hendak dipadam. Halaman bertanda merah akan dibuang.',extract:'Klik halaman yang hendak disimpan dalam PDF baharu.',rotate:'Pilih halaman untuk diputar. Pratonton menunjukkan arah putaran hasil.',reorder:'Gunakan anak panah atau seret kad untuk mengubah susunan.'};
  if(error)return <p role="alert" className="mt-4 text-red-700">{error}</p>;
  if(!doc)return <p className="mt-4 text-gray-500">Memuatkan halaman…</p>;
  return <section className="mt-4 rounded-xl border p-4" aria-label="Pilih halaman PDF">
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div><h2 className="font-bold">{action==='reorder'?'Susun halaman':'Pilih halaman'}</h2><p className="mt-1 text-sm text-gray-500">{descriptions[action]}</p></div>{action!=='reorder'&&<button type="button" className="btn-lembut text-sm" onClick={all}>{selected.length===order.length?'Nyahpilih semua':'Pilih semua'}</button>}</div>
    <p className="mb-3 text-sm font-semibold">{order.length} halaman{action!=='reorder'&&` · ${selected.length} dipilih`}</p>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {order.slice(batch*pageSize,(batch+1)*pageSize).map((n,i)=>{
        const index=batch*pageSize+i,checked=selected.includes(n);
        return <div key={n} draggable={action==='reorder'} onDragStart={e=>e.dataTransfer.setData('text/plain',String(index))} onDragOver={e=>{if(action==='reorder')e.preventDefault();}} onDrop={e=>{e.preventDefault();const from=Number(e.dataTransfer.getData('text/plain'));if(Number.isInteger(from))reorder(from,index);}} className="rounded-xl border bg-gray-50 p-2">
          <button type="button" aria-label={`Halaman ${n}${action==='delete'?' untuk dipadam':''}`} aria-pressed={action==='reorder'?undefined:checked} onClick={()=>{if(action!=='reorder')toggle(n);}} className={`relative flex h-52 w-full items-center justify-center rounded-lg border-2 bg-white ${checked&&action!=='reorder'?(action==='delete'?'border-red-500':'border-blue-500'):'border-transparent'}`}><Thumbnail doc={doc} number={n} angle={action==='rotate'&&checked?Number(angle):0}/>{checked&&action!=='reorder'&&<span className={`absolute right-1 top-1 rounded-full p-1 text-white ${action==='delete'?'bg-red-600':'bg-blue-600'}`}><Check size={14}/></span>}</button>
          <div className="mt-2 flex items-center justify-between gap-1"><span className="text-xs">{action==='reorder'?`${index+1}. H${n}`:`Halaman ${n}`}</span>{action==='reorder'&&<span className="flex"><button type="button" disabled={index===0} aria-label={`Alih halaman ${n} ke kiri`} onClick={()=>reorder(index,index-1)} className="rounded p-1 disabled:opacity-25"><ArrowLeft size={14}/></button><button type="button" disabled={index===order.length-1} aria-label={`Alih halaman ${n} ke kanan`} onClick={()=>reorder(index,index+1)} className="rounded p-1 disabled:opacity-25"><ArrowRight size={14}/></button></span>}</div>
        </div>;
      })}
    </div>
    {totalBatches>1&&<div className="mt-3 flex items-center justify-between"><button type="button" className="btn-lembut" disabled={batch===0} onClick={()=>setBatch(batch-1)}>Sebelum</button><span className="text-sm">{batch+1} / {totalBatches}</span><button type="button" className="btn-lembut" disabled={batch===totalBatches-1} onClick={()=>setBatch(batch+1)}>Seterusnya</button></div>}
  </section>;
}
