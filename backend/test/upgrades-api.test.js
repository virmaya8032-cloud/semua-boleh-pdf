import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import {PDFDocument} from 'pdf-lib';
import routes from '../src/routes/tools.js';
import {execFileSync} from 'node:child_process';
import {env} from '../src/config/env.js';
import {pengendaliRalat} from '../src/middleware/error.js';
const app=express();app.use('/api/alat',routes);app.use(pengendaliRalat);const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));const base=`http://127.0.0.1:${server.address().port}`;
const doc=await PDFDocument.create();doc.addPage().drawText('Ali');const bytes=await doc.save();
function form(opts={},count=1,name='asal.pdf'){const body=new FormData();for(let i=0;i<count;i++)body.append('files',new Blob([bytes],{type:'application/pdf'}),name);for(const[k,v]of Object.entries(opts))body.append(k,v);return body;}
async function post(slug,opts={},count=1){return fetch(`${base}/api/alat/proses/${slug}`,{method:'POST',body:form(opts,count)});}
async function download(res){const data=await res.json();assert.equal(res.status,200,data.ralat);const file=await fetch(base+data.muat_turun);assert.equal(file.status,200);return {data,bytes:new Uint8Array(await file.arrayBuffer())};}
test('API naik taraf memproses multipart sebenar',async t=>{
 const database=env.DATABASE_URL,pub=env.AI_ALLOW_PUBLIC;env.DATABASE_URL='';env.AI_ALLOW_PUBLIC=false;
 try{
  await t.test('katalog alat mempunyai 56 alat',async()=>{const data=await(await fetch(base+'/api/alat/senarai')).json();assert.equal(data.alat.length,56);});
  await t.test('urus halaman melalui API',async()=>{const r=await download(await post('urus-halaman',{susunan_halaman:'[{"fail":1,"halaman":1,"putaran":90},{"fail":0,"halaman":1}]'},2));assert.equal((await PDFDocument.load(r.bytes)).getPageCount(),2);});
  await t.test('kerja latar aliran selesai dengan nota',async()=>{const res=await fetch(base+'/api/alat/kerja/aliran-kerja',{method:'POST',body:form({langkah:'[{"slug":"putar-pdf","pilihan":{"sudut":"90"}}]'})});assert.equal(res.status,202);const {job}=await res.json();let result;for(let n=0;n<80;n++){result=await(await fetch(base+'/api/alat/kerja/'+job)).json();if(result.status==='siap'||result.status==='gagal')break;await new Promise(r=>setTimeout(r,25));}assert.equal(result.status,'siap',result.ralat);assert.match(result.result.nota,/1 langkah/);const downloaded=await fetch(base+result.result.muat_turun);assert.equal(downloaded.status,200);await downloaded.arrayBuffer();});
  await t.test('batch menghasilkan ZIP dan laporan',async()=>{const r=await download(await post('proses-kelompok',{alat_batch:'pdf-ke-teks'},2));assert.equal(r.data.nama_fail,'hasil-kelompok.zip');assert.match(r.data.nota,/2\/2/);assert.equal(r.bytes[0],80);});
  await t.test('preview padanan melalui periksa',async()=>{const res=await fetch(base+'/api/alat/periksa',{method:'POST',body:form({mode:'find',cari:'Ali',seluruh:'ya'})});const data=await res.json();assert.equal(res.status,200,data.ralat);assert.equal(data.jumlah,1);});
  await t.test('preview scanner menerima gambar sebenar dan menolak PDF',async()=>{const photo=execFileSync('python3',['-c',"from PIL import Image;import sys;Image.new('RGB',(100,140),'white').save(sys.stdout.buffer,format='PNG')"]);const body=new FormData();body.append('files',new Blob([photo],{type:'image/png'}),'scan.png');body.append('mode','scan');const res=await fetch(base+'/api/alat/periksa',{method:'POST',body});const data=await res.json();assert.equal(res.status,200,data.ralat);assert.equal(data.penjuru.length,4);assert.match(data.pratonton,/^data:image\/jpeg;base64,/);const bad=await fetch(base+'/api/alat/periksa',{method:'POST',body:form({mode:'scan'})});assert.equal(bad.status,400);});
  await t.test('AI awam ditolak sebelum perkhidmatan berbayar',async()=>{const res=await post('ai-pdf',{ai_setuju:'ya'});assert.equal(res.status,401);assert.match((await res.json()).ralat,/Log masuk/);});
 }finally{env.DATABASE_URL=database;env.AI_ALLOW_PUBLIC=pub;}
});
test.after(()=>server.close());
