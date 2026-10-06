import {useEffect,useRef,useState} from 'react';
import {Link} from 'react-router-dom';
import {api} from '../services/api.js';
export default function FormFields({file,value,onChange}) {
 const [fields,setFields]=useState(null),[error,setError]=useState('');
 const callback=useRef(onChange);callback.current=onChange;
 const initial=useRef(value);
 let values={};try{values=JSON.parse(value||'{}');}catch{}
 useEffect(()=>{
  const controller=new AbortController();setFields(null);setError('');
  api.periksaPdf(file,1,controller.signal,'forms').then(data=>{
   setFields(data.fields);
   if(!initial.current){const defaults={};for(const field of data.fields){if(field.readonly||![2,3,4,7].includes(field.type))continue;defaults[field.nama]=field.type===2?(field.value&&field.value!=='Off'?'ya':'tidak'):String(field.value||'');}callback.current(JSON.stringify(defaults));}
  }).catch(e=>{if(e.name!=='AbortError')setError(e.message);});
  return()=>controller.abort();
 },[file]);
 const update=(name,next)=>onChange(JSON.stringify({...values,[name]:next}));
 if(error)return <p role="alert" className="mt-4 text-red-700">{error}</p>;
 if(!fields)return <p className="mt-4 text-gray-500">Mengenal pasti medan borang…</p>;
 const editable=fields.filter(field=>!field.readonly&&[2,3,4,7].includes(field.type));
 if(!editable.length)return <p className="mt-4 rounded bg-amber-50 p-4 text-sm text-amber-800">PDF ini tiada medan borang boleh diisi. Gunakan <Link className="underline" to="/alat/edit-pdf">Edit PDF untuk tambah teks</Link> atau <Link className="underline" to="/alat/cipta-borang-pdf">Cipta Borang PDF</Link>.</p>;
 return <section className="mt-4 rounded-xl border p-4"><h2 className="font-bold">Isi borang anda</h2><p className="mt-1 text-sm text-gray-500">Medan dikesan secara automatik. Isi seperti borang biasa.</p><div className="mt-4 grid gap-4 sm:grid-cols-2">{editable.map(field=><label className="text-sm" key={field.nama}><span className="mb-1 block font-semibold">{field.nama} <span className="font-normal text-gray-400">· H{field.halaman}</span></span>{field.type===2?<span><input type="checkbox" checked={values[field.nama]==='ya'} onChange={e=>update(field.nama,e.target.checked?'ya':'tidak')}/> Tandakan</span>:field.choices.length?<select className="medan" value={values[field.nama]||''} onChange={e=>update(field.nama,e.target.value)}><option value="">Pilih…</option>{field.choices.map(choice=>{const label=Array.isArray(choice)?choice[1]:choice;const key=Array.isArray(choice)?choice[0]:choice;return <option key={key} value={label}>{label}</option>;})}</select>:<input className="medan" value={values[field.nama]||''} onChange={e=>update(field.nama,e.target.value)}/>}</label>)}</div></section>;
}
