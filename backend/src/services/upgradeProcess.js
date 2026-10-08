import fs from 'node:fs';
import path from 'node:path';
import {ALAT} from '../config/tools.js';
import {mampat} from './binary.js';
import {laluanOutput} from '../utils/files.js';
export const batchSlugs=['mampat-pdf','pdf-ke-word','pdf-ke-excel','pdf-ke-powerpoint','pdf-ke-teks','pdf-ke-jpg','pdf-ke-png','putar-pdf','flatten-pdf'];
export const workflowSlugs=['ocr-pdf','putar-pdf','flatten-pdf','buang-metadata-pdf','nombor-halaman','tera-air','mampat-pdf'];
export async function compressTarget(input,opts){
 const target=Number(opts.sasaran_mb||1)*1024*1024;if(!Number.isFinite(target)||target<.1*1024*1024||target>50*1024*1024)throw new Error('Sasaran mesti antara 0.1 dan 50 MB.');
 let best=input;const candidates=[];
 try{
  if(fs.statSync(input).size>target){
   const levels=opts.kualiti==='tinggi'?['ringan']:opts.kualiti==='sederhana'?['ringan','sederhana']:['ringan','sederhana','kuat'];
   for(const level of levels){const out=await mampat(input,level);candidates.push(out);if(fs.statSync(out).size<fs.statSync(best).size)best=out;if(fs.statSync(best).size<=target)break;}
  }
  const output=laluanOutput('pdf');fs.copyFileSync(best,output);const bytes=fs.statSync(output).size;
  return {path:output,filename:'pdf-sasaran.pdf',mime:'application/pdf',nota:bytes<=target?'Sasaran saiz berjaya dicapai.':'Sasaran belum dicapai pada had kualiti ini. Hasil terkecil disediakan; cuba kualiti lebih rendah atau pisahkan PDF.'};
 }finally{for(const file of candidates)fs.rmSync(file,{force:true});}
}
export async function workflow(paths,opts,process){
 let steps;try{steps=JSON.parse(opts.langkah||'[]');}catch{throw new Error('Langkah aliran kerja tidak sah.');}
 if(!Array.isArray(steps)||steps.length<1||steps.length>6||steps.some(s=>!workflowSlugs.includes(s.slug)))throw new Error('Pilih 1 hingga 6 langkah aliran kerja yang disokong.');
 let current=paths[0];const temporary=[],started=Date.now();
 try{
  for(let i=0;i<steps.length;i++){if(Date.now()-started>20*60*1000)throw new Error("Aliran kerja melebihi 20 minit. Gunakan lebih sedikit langkah atau halaman.");const step=steps[i];let result;try{result=await process(ALAT[step.slug].op,[current],step.pilihan||{});}catch(error){throw new Error(`Langkah ${i+1} (${ALAT[step.slug].nama}): ${error.message}`);}temporary.push(result.path);current=result.path;}
  const out=laluanOutput('pdf');fs.copyFileSync(current,out);return {path:out,filename:'aliran-kerja.pdf',mime:'application/pdf',nota:`${steps.length} langkah selesai. Teruskan ke editor atau tandatangan melalui butang hasil.`};
 }finally{for(const file of temporary)fs.rmSync(file,{force:true});}
}
export async function batch(paths,opts,process,zip){
 const slug=opts.alat_batch||'mampat-pdf';if(!batchSlugs.includes(slug))throw new Error('Alat kelompok tidak disokong.');
 let options,names;try{options=JSON.parse(opts.pilihan_batch||'{}');names=JSON.parse(opts.nama_asal||'[]');}catch{throw new Error('Tetapan kelompok tidak sah.');}
 if(!options||typeof options!=='object'||Array.isArray(options))throw new Error('Tetapan kelompok tidak sah.');
 const results=[],report=[],temporary=[],started=Date.now();
 try{
  for(let i=0;i<paths.length;i++){
   const label=String(names[i]||`fail-${i+1}`).replace(/[\r\n]/g,' ');const base=path.basename(label,path.extname(label)).replace(/[^\p{L}\p{N} ._-]/gu,'-').slice(0,80)||'dokumen';
   if(Date.now()-started>20*60*1000){report.push(`${label}: BELUM DIPROSES — had masa kelompok 20 minit. Proses fail ini dalam kelompok baharu.`);continue;}
   try{const result=await process(ALAT[slug].op,[paths[i]],{...options,...(ALAT[slug].format?{_format:ALAT[slug].format}:{})});temporary.push(result.path);const name=`${String(i+1).padStart(3,'0')}-${base}${path.extname(result.filename)}`;results.push({laluan:result.path,nama:name});report.push(`${label}: BERJAYA → ${name}`);}catch(error){report.push(`${label}: GAGAL — ${error.message}`);}
  }
  if(!results.length)throw new Error(`Semua fail gagal. ${report.join('\n')}`);
  results.push({nama:'laporan-kelompok.txt',bytes:Buffer.from(report.join('\n'),'utf8')});const out=await zip(results);
  return {path:out,filename:'hasil-kelompok.zip',mime:'application/zip',nota:`${results.length-1}/${paths.length} fail berjaya. Lihat laporan-kelompok.txt dalam ZIP.`};
 }finally{for(const file of temporary)fs.rmSync(file,{force:true});}
}
