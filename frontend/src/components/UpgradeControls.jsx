import {useState,useEffect,useRef} from 'react';
import {api} from '../services/api.js';
import {toolBySlug} from '../config/tools.js';
export const workflowTools=['ocr-pdf','putar-pdf','flatten-pdf','buang-metadata-pdf','nombor-halaman','tera-air','mampat-pdf'];
export const batchTools=['mampat-pdf','pdf-ke-word','pdf-ke-excel','pdf-ke-powerpoint','pdf-ke-teks','pdf-ke-jpg','pdf-ke-png','putar-pdf','flatten-pdf'];
function defaults(tool){return Object.fromEntries((tool?.options||[]).map(o=>[o.key,o.default??o.pilihan?.[0]?.nilai??'']));}
export function ToolSettings({slug,value={},onChange}){
 const tool=toolBySlug(slug);
 return <div className="mt-3 grid gap-3 sm:grid-cols-2">{(tool?.options||[]).map(o=><label key={o.key} className="text-sm">{o.label}{o.jenis==='select'?<select className="medan" value={value[o.key]??o.default??o.pilihan[0].nilai} onChange={e=>onChange({...value,[o.key]:e.target.value})}>{o.pilihan.map(p=><option key={p.nilai} value={p.nilai}>{p.teks}</option>)}</select>:<input className="medan" type={o.jenis==='number'?'number':'text'} min={o.min} max={o.max} value={value[o.key]??o.default??''} placeholder={o.placeholder} onChange={e=>onChange({...value,[o.key]:e.target.value})}/>}</label>)}</div>;
}
export function WorkflowControls({value,onChange}){
 const steps=value?JSON.parse(value):[];const update=next=>onChange(JSON.stringify(next));
 const [saving,setSaving]=useState('');
 const add=slug=>update([...steps,{slug,pilihan:defaults(toolBySlug(slug))}]);
 const save=()=>{try{localStorage.setItem('sbp_workflow',JSON.stringify(steps));setSaving('Tetapan aliran kerja disimpan.');}catch{setSaving('Pelayar tidak dapat menyimpan tetapan.');}};
 return <section className="mt-4 rounded-xl border p-4" aria-label="Aliran kerja"><h2 className="font-bold">Susun langkah automatik</h2><p className="mt-1 text-sm text-gray-500">Setiap hasil menjadi input langkah seterusnya. Edit dan tandatangan boleh disambung selepas hasil siap.</p>
 <div className="mt-3 flex flex-wrap gap-2"><button className="btn-lembut" type="button" onClick={()=>update(['ocr-pdf','flatten-pdf','mampat-pdf'].map(slug=>({slug,pilihan:defaults(toolBySlug(slug))})))}>Preset OCR → Flatten → Mampat</button><button className="btn-lembut" type="button" onClick={save}>Simpan tetapan</button><button className="btn-lembut" type="button" onClick={()=>{try{const loaded=JSON.parse(localStorage.getItem('sbp_workflow')||'[]');if(!Array.isArray(loaded)||loaded.length>6||loaded.some(s=>!workflowTools.includes(s.slug)))throw Error();update(loaded);}catch{setSaving('Tetapan disimpan tidak sah.');}}}>Guna tetapan disimpan</button></div>
 {saving&&<p className="mt-2 text-sm" role="status">{saving}</p>}
 {steps.map((step,i)=><div key={i} className="mt-3 rounded-lg bg-gray-50 p-3"><div className="flex flex-wrap justify-between gap-2"><b>{i+1}. {toolBySlug(step.slug)?.nama}</b><span><button type="button" className="btn-lembut" disabled={i===0} aria-label={`Alih langkah ${i+1} ke atas`} onClick={()=>{const n=[...steps];[n[i-1],n[i]]=[n[i],n[i-1]];update(n);}}>↑</button><button type="button" className="btn-lembut" aria-label={`Buang langkah ${i+1}`} onClick={()=>update(steps.filter((_,j)=>j!==i))}>Buang</button></span></div><ToolSettings slug={step.slug} value={step.pilihan} onChange={pilihan=>update(steps.map((s,j)=>j===i?{...s,pilihan}:s))}/></div>)}
 <label className="mt-4 block text-sm">Tambah langkah<select aria-label="Tambah langkah" className="medan" value="" disabled={steps.length>=6} onChange={e=>{if(e.target.value)add(e.target.value);}}><option value="">Pilih alat…</option>{workflowTools.map(slug=><option key={slug} value={slug}>{toolBySlug(slug).nama}</option>)}</select></label><p className="mt-2 text-xs text-gray-500">Maksimum 6 langkah. Tetapan disimpan sahaja; fail tidak disimpan.</p></section>;
}
export function BatchControls({value,onChange}){
 const slug=value.alat_batch||'mampat-pdf';const options=JSON.parse(value.pilihan_batch||'{}');
 return <section className="mt-4 rounded-xl border p-4"><h2 className="font-bold">Satu alat untuk semua fail</h2><p className="text-sm text-gray-500">Maksimum 30 fail. Hasil ZIP mengandungi laporan fail berjaya/gagal.</p><label className="mt-3 block">Alat<select className="medan" value={slug} onChange={e=>onChange({alat_batch:e.target.value,pilihan_batch:JSON.stringify(defaults(toolBySlug(e.target.value)))})}>{batchTools.map(s=><option key={s} value={s}>{toolBySlug(s).nama}</option>)}</select></label><ToolSettings slug={slug} value={options} onChange={next=>onChange({alat_batch:slug,pilihan_batch:JSON.stringify(next)})}/></section>;
}
export function FindPreview({file,value}){
 const [result,setResult]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);const abort=useRef(null);
 useEffect(()=>{setResult(null);setError('');abort.current?.abort();setBusy(false);},[file,value.cari,value.huruf,value.seluruh]);
 useEffect(()=>()=>abort.current?.abort(),[]);
 const preview=async()=>{const controller=new AbortController();abort.current=controller;setBusy(true);setError('');try{const data=await api.periksaPdf(file,1,controller.signal,'find',value);if(!controller.signal.aborted)setResult(data);}catch(e){if(!controller.signal.aborted)setError(e.message);}finally{if(!controller.signal.aborted)setBusy(false);}};
 return <section className="mt-4 rounded-xl border p-4"><button className="btn-lembut" type="button" disabled={!value.cari||busy} onClick={preview}>{busy?'Mencari…':'Semak padanan sebelum ganti'}</button>{error&&<p role="alert" className="mt-2 text-red-700">{error}</p>}{result&&<><p className="mt-2 font-bold">{result.jumlah} padanan</p><ul className="mt-2 max-h-60 space-y-2 overflow-auto text-sm">{result.padanan.map((item,i)=><li key={i}>H{item.halaman}: {item.baris}</li>)}</ul></>}</section>;
}
