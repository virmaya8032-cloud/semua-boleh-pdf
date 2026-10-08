import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {proses} from '../src/services/process.js';
import {pythonPdf} from '../src/services/pythonPdf.js';
import {aiPdf} from '../src/services/aiPdf.js';
import {env} from '../src/config/env.js';
import {PDFDocument} from 'pdf-lib';
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'sbp-upgrade-')),pdf=path.join(dir,'source.pdf'),signature=path.join(dir,'sign.png'),photo=path.join(dir,'photo.jpg'),noise=path.join(dir,'noise.pdf'),scan=path.join(dir,'scan.pdf');const outputs=[];
execFileSync('python3',['-c',`
import fitz,sys,io
from PIL import Image,ImageDraw
import numpy as np
p,sign,photo,noise,scan=sys.argv[1:]
im=Image.new('RGB',(120,60),'white');ImageDraw.Draw(im).line((10,30,100,30),fill='black',width=5);im.save(sign)
a=Image.new('RGB',(500,650),(70,70,70));dr=ImageDraw.Draw(a);dr.polygon([(60,60),(420,30),(460,590),(40,620)],fill='white');dr.line((100,220,370,210),fill='black',width=5);a.save(photo)
d=fitz.open()
for i,ref in enumerate(['A100','A100','B200']):
 page=d.new_page(width=600,height=800);page.insert_text((50,60),'No. Rujukan: '+ref,fontsize=14);page.insert_text((50,95),'Ali ALI Alia',fontsize=14)
 if i==0:
  for x in (50,250,450):page.draw_line((x,160),(x,260))
  for y in (160,210,260):page.draw_line((50,y),(450,y))
  page.insert_text((60,190),'Nama');page.insert_text((260,190),'Jumlah');page.insert_text((60,240),'Produk');page.insert_text((260,240),'100')
  page.insert_image(fitz.Rect(60,350,180,410),filename=sign)
d.save(p)
n=fitz.open();page=n.new_page(width=600,height=800);im=Image.fromarray(np.random.default_rng(3).integers(0,256,(1000,800,3),dtype=np.uint8));buf=io.BytesIO();im.save(buf,format='PNG');page.insert_image(page.rect,stream=buf.getvalue());n.save(noise)
s=fitz.open();page=s.new_page();page.insert_image(page.rect,filename=photo);page.insert_text((50,90),'Ali',render_mode=3);s.save(scan)
`,pdf,signature,photo,noise,scan]);
async function run(op,paths=[pdf],opts={}){const r=await proses(op,paths,opts);outputs.push(r.path);return r;}
const extract=file=>execFileSync('python3',['-c','import fitz,sys;d=fitz.open(sys.argv[1]);print("\\n".join(p.get_text() for p in d))',file],{encoding:'utf8'});
function archive(file){return JSON.parse(execFileSync('python3',['-c','import zipfile,json,sys;z=zipfile.ZipFile(sys.argv[1]);print(json.dumps(z.namelist()))',file],{encoding:'utf8'}));}
test('sepuluh naik taraf berfungsi',async t=>{
 await t.test('urus beberapa PDF termasuk salin, putar dan susun',async()=>{const r=await run('urus-halaman',[pdf,pdf],{susunan_halaman:JSON.stringify([{fail:1,halaman:3,putaran:90},{fail:0,halaman:1,putaran:0},{fail:0,halaman:1,putaran:180}])});const d=await PDFDocument.load(fs.readFileSync(r.path));assert.equal(d.getPageCount(),3);assert.equal(d.getPage(0).getRotation().angle,90);assert.equal(d.getPage(2).getRotation().angle,180);assert.match(extract(r.path),/^No. Rujukan: B200/);});
 await t.test('urus halaman di luar dokumen ditolak',async()=>assert.rejects(run('urus-halaman',[pdf],{susunan_halaman:'[{"fail":0,"halaman":9}]'}),/halaman/));
 await t.test('kelompok mengekalkan hasil fail lain apabila satu rosak',async()=>{const bad=path.join(dir,'bad.pdf');fs.writeFileSync(bad,'invalid');const r=await run('batch',[pdf,bad],{alat_batch:'pdf-ke-teks',nama_asal:'["satu.pdf","rosak.pdf"]'});assert.match(r.nota,/1\/2/);assert.equal(archive(r.path).length,2);});
 await t.test('kelompok tidak membenarkan operasi sewenang-wenang',async()=>assert.rejects(run('batch',[pdf],{alat_batch:'ai-pdf'}),/tidak disokong/));
 await t.test('aliran hasil langkah pertama menjadi input langkah kedua',async()=>{const r=await run('workflow',[pdf],{langkah:JSON.stringify([{slug:'putar-pdf',pilihan:{sudut:90}},{slug:'tera-air',pilihan:{teks:'SULIT'}}])});const d=await PDFDocument.load(fs.readFileSync(r.path));assert.equal(d.getPage(0).getRotation().angle,90);assert.match(extract(r.path),/SULIT/);});
 await t.test('aliran kosong dan recursion ditolak',async()=>{await assert.rejects(run('workflow',[pdf],{langkah:'[]'}),/1 hingga 6/);await assert.rejects(run('workflow',[pdf],{langkah:'[{"slug":"aliran-kerja"}]'}),/disokong/);});
 await t.test('scan foto dengan tepi automatik menjadi PDF',async()=>{const r=await run('scan-kamera',[photo],{bersih:'bw'});const d=await PDFDocument.load(fs.readFileSync(r.path));assert.equal(d.getPageCount(),1);assert.ok(fs.statSync(r.path).size>1000);});
 await t.test('preview scan mengesan penjuru dan meluruskan kertas',async()=>{const out=await pythonPdf('scan-inspect',[photo],{},'json');outputs.push(out);const data=JSON.parse(fs.readFileSync(out));assert.equal(data.dikesan,true);assert.equal(data.penjuru.length,4);assert.ok(Math.abs(data.penjuru[0].x-12)<2);assert.match(data.pratonton,/^data:image\/jpeg;base64,/);const jpg=path.join(dir,'preview.jpg');fs.writeFileSync(jpg,Buffer.from(data.pratonton.split(',')[1],'base64'));const size=JSON.parse(execFileSync('python3',['-c','from PIL import Image;import json,sys;i=Image.open(sys.argv[1]);print(json.dumps(i.size))',jpg],{encoding:'utf8'}));assert.ok(size[0]<450);assert.ok(size[1]<610);});
 await t.test('preview manual menggunakan penjuru dan menolak kawasan bersilang',async()=>{const points=[{x:12,y:9},{x:84,y:5},{x:92,y:91},{x:8,y:95}];const out=await pythonPdf('scan-inspect',[photo],{penjuru:JSON.stringify(points)},'json');outputs.push(out);assert.deepEqual(JSON.parse(fs.readFileSync(out)).penjuru,points);await assert.rejects(pythonPdf('scan-inspect',[photo],{penjuru:'[{"x":10,"y":10},{"x":90,"y":90},{"x":90,"y":10},{"x":10,"y":90}]'},'json'),/bersilang/);});
 await t.test('foto tanpa tepi menggunakan empat penjuru lalai yang boleh dilaras',async()=>{const blank=path.join(dir,'blank.png');execFileSync('python3',['-c',"from PIL import Image;import sys;Image.new('RGB',(500,650),'white').save(sys.argv[1])",blank]);const out=await pythonPdf('scan-inspect',[blank],{},'json');outputs.push(out);const data=JSON.parse(fs.readFileSync(out));assert.equal(data.dikesan,false);assert.deepEqual(data.penjuru[0],{x:6,y:6});});
 await t.test('empat penjuru manual boleh membetulkan foto',async()=>{const r=await run('scan-kamera',[photo],{penjuru:JSON.stringify({0:[{x:12,y:9},{x:84,y:5},{x:92,y:91},{x:8,y:95}]})});assert.equal((await PDFDocument.load(fs.readFileSync(r.path))).getPageCount(),1);});
 await t.test('penjuru bersilang ditolak',async()=>assert.rejects(run('scan-kamera',[photo],{penjuru:JSON.stringify({0:[{x:10,y:10},{x:90,y:90},{x:90,y:10},{x:10,y:90}]})}),/bersilang/));
 await t.test('Word susun atur mempunyai jadual dan gambar',async()=>{const r=await run('pdf-ke-office',[pdf],{mod_word:'susun'});const names=archive(r.path);assert.ok(names.some(n=>n.startsWith('word/media/')));const doc=execFileSync('python3',['-c','from docx import Document;import sys;d=Document(sys.argv[1]);print(len(d.tables));print(" ".join(p.text for p in d.paragraphs))',r.path],{encoding:'utf8'});assert.ok(parseInt(doc)>0);assert.match(doc,/Rujukan/);});
 await t.test('Word teks sahaja masih tersedia',async()=>{const r=await run('pdf-ke-office',[pdf],{mod_word:'teks'});assert.ok(!archive(r.path).some(n=>n.startsWith('word/media/')));});
 await t.test('carian preview padanan penuh dan abaikan huruf',async()=>{const out=await pythonPdf('pratonton-ganti',[pdf],{cari:'Ali',seluruh:'ya'},'json');outputs.push(out);assert.equal(JSON.parse(fs.readFileSync(out)).jumlah,6);});
 await t.test('ganti semua membuang teks asal dan mengekalkan perkataan jiran',async()=>{const r=await run('cari-ganti',[pdf],{cari:'Ali',ganti:'Abu',seluruh:'ya'});const txt=extract(r.path);assert.match(txt,/Abu/);assert.match(txt,/Alia/);assert.ok(!/\bAli\b|\bALI\b/.test(txt));});
 await t.test('padam teks melalui gantian kosong',async()=>{const r=await run('cari-ganti',[pdf],{cari:'A100',ganti:''});assert.ok(!extract(r.path).includes('A100'));assert.match(extract(r.path),/B200/);});
 await t.test('ganti teks OCR tersembunyi ditolak untuk elak hasil palsu',async()=>assert.rejects(run('cari-ganti',[scan],{cari:'Ali',ganti:'Abu'}),/tersembunyi/));
 await t.test('latar putih alpha sifar dan dakwat gelap kekal',async()=>{const r=await run('tandatangan-telus',[signature],{ambang:220});const alpha=JSON.parse(execFileSync('python3',['-c','from PIL import Image;import sys,json;i=Image.open(sys.argv[1]);print(json.dumps([i.getpixel((0,0)),i.getpixel((50,30))]))',r.path],{encoding:'utf8'}));assert.equal(alpha[0][3],0);assert.equal(alpha[1][3],255);});
 await t.test('mampat sasaran yang sudah kecil mengekalkan input',async()=>{const r=await run('mampat-sasaran',[pdf],{sasaran_mb:1});assert.deepEqual(fs.readFileSync(r.path),fs.readFileSync(pdf));assert.match(r.nota,/berjaya/);});
 await t.test('mampat memberitahu sasaran tidak tercapai',async()=>{const r=await run('mampat-sasaran',[noise],{sasaran_mb:.1,kualiti:'tinggi'});assert.match(r.nota,/belum dicapai/);assert.ok(fs.statSync(r.path).size>104857);});
 await t.test('nama automatik dengan laporan',async()=>{const r=await run('automasi',[pdf],{cara:'nama',label:'No. Rujukan:'});assert.deepEqual(archive(r.path),['001-A100.pdf','senarai-hasil.csv']);});
 await t.test('pisah mengikut perubahan rujukan',async()=>{const r=await run('automasi',[pdf],{cara:'pisah',label:'No. Rujukan:'});assert.deepEqual(archive(r.path),['001-001-A100.pdf','001-002-B200.pdf','senarai-hasil.csv']);});
 await t.test('lampiran mempunyai muka pemisah',async()=>{const r=await run('automasi',[pdf],{cara:'lampiran',tajuk:'LAMPIRAN'});const count=execFileSync('python3',['-c','import zipfile,fitz,sys;z=zipfile.ZipFile(sys.argv[1]);d=fitz.open(stream=z.read("001-lampiran.pdf"),filetype="pdf");print(len(d));print(d[0].get_text())',r.path],{encoding:'utf8'});assert.match(count,/^4\nLAMPIRAN 1/);});
 await t.test('AI context menghormati julat halaman tanpa truncation',async()=>{const out=await pythonPdf('ai-context',[pdf],{halaman:'3'},'json');outputs.push(out);const data=JSON.parse(fs.readFileSync(out));assert.equal(data.pages.length,1);assert.equal(data.pages[0].halaman,3);});
<<<<<<< HEAD
 await t.test('AI tanpa konfigurasi menerangkan tetapan diperlukan',async()=>{const key=env.GEMINI_API_KEY;env.GEMINI_API_KEY='';try{await assert.rejects(aiPdf([pdf],{ai_setuju:'ya'}),/belum diaktifkan/);}finally{env.GEMINI_API_KEY=key;}});
 await t.test('AI payload sebenar dan petikan sumber disemak dengan mock',async()=>{const original=global.fetch,key=env.GEMINI_API_KEY,model=env.GEMINI_MODEL;let sent;env.GEMINI_API_KEY='test-not-a-real-key';env.GEMINI_MODEL='gemini-2.5-flash-lite';global.fetch=async(url,req)=>{sent=JSON.parse(req.body);assert.equal(url,'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent');assert.equal(req.headers['x-goog-api-key'],'test-not-a-real-key');return {ok:true,json:async()=>({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify({bahagian:[{teks:'Rujukan ialah A100.',rujukan:[{halaman:1,petikan:'No. Rujukan: A100'},{halaman:999,petikan:'Palsu'}]}]})}]}}]})};};try{const r=await aiPdf([pdf],{ai_setuju:'ya',ai_mod:'soalan',soalan:'Apa rujukan?',halaman:'1'});outputs.push(r.path);const txt=fs.readFileSync(r.path,'utf8');assert.match(txt,/Halaman 1/);assert.ok(!txt.includes('Halaman 999'));assert.equal(sent.generationConfig.responseMimeType,'application/json');assert.ok(sent.generationConfig.responseSchema.properties.bahagian);assert.match(sent.contents[0].parts[0].text,/A100/);}finally{global.fetch=original;env.GEMINI_API_KEY=key;env.GEMINI_MODEL=model;}});
 await t.test('AI memerlukan persetujuan sebelum menghantar teks',async()=>{const key=env.GEMINI_API_KEY,model=env.GEMINI_MODEL;env.GEMINI_API_KEY='test';env.GEMINI_MODEL='test';try{await assert.rejects(aiPdf([pdf],{}),/persetujuan/);}finally{env.GEMINI_API_KEY=key;env.GEMINI_MODEL=model;}});
=======
 await t.test('AI tanpa konfigurasi menerangkan tetapan diperlukan',async()=>{const key=env.OPENAI_API_KEY;env.OPENAI_API_KEY='';try{await assert.rejects(aiPdf([pdf],{ai_setuju:'ya'}),/belum diaktifkan/);}finally{env.OPENAI_API_KEY=key;}});
 await t.test('AI payload sebenar dan petikan sumber disemak dengan mock',async()=>{const original=global.fetch,key=env.OPENAI_API_KEY,model=env.OPENAI_MODEL;let sent;env.OPENAI_API_KEY='test-not-a-real-key';env.OPENAI_MODEL='configured-model';global.fetch=async(url,req)=>{sent=JSON.parse(req.body);assert.equal(url,'https://api.openai.com/v1/responses');return {ok:true,json:async()=>({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify({bahagian:[{teks:'Rujukan ialah A100.',rujukan:[{halaman:1,petikan:'No. Rujukan: A100'},{halaman:999,petikan:'Palsu'}]}]})}]}]})};};try{const r=await aiPdf([pdf],{ai_setuju:'ya',ai_mod:'soalan',soalan:'Apa rujukan?',halaman:'1'});outputs.push(r.path);const txt=fs.readFileSync(r.path,'utf8');assert.match(txt,/Halaman 1/);assert.ok(!txt.includes('Halaman 999'));assert.equal(sent.store,false);assert.equal(sent.text.format.strict,true);assert.match(sent.input,/A100/);}finally{global.fetch=original;env.OPENAI_API_KEY=key;env.OPENAI_MODEL=model;}});
 await t.test('AI memerlukan persetujuan sebelum menghantar teks',async()=>{const key=env.OPENAI_API_KEY,model=env.OPENAI_MODEL;env.OPENAI_API_KEY='test';env.OPENAI_MODEL='test';try{await assert.rejects(aiPdf([pdf],{}),/persetujuan/);}finally{env.OPENAI_API_KEY=key;env.OPENAI_MODEL=model;}});
>>>>>>> 9af48a51dc0c79c6aeea3f4f9e7166b4890f9ab2
});
test.after(()=>{for(const file of outputs)fs.rmSync(file,{force:true});fs.rmSync(dir,{recursive:true,force:true});});
