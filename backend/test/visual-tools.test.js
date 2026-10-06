import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {PDFDocument} from 'pdf-lib';
import {pythonPdf} from '../src/services/pythonPdf.js';
import {ocr} from '../src/services/binary.js';
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'sbp-visual-')),source=path.join(dir,'source.pdf'),scan=path.join(dir,'scan.pdf'),second=path.join(dir,'second.pdf'),columns=path.join(dir,'columns.pdf'),picture=path.join(dir,'picture.png');const files=[];
execFileSync(process.env.PYTHON_BIN||'python3',['-c',`
import fitz,sys
p=sys.argv[1];d=fitz.open()
for rot in (0,90,180,270):
 page=d.new_page(width=600,height=800);page.insert_text((60,100),'Original words',fontsize=14);page.set_rotation(rot)
w=fitz.Widget();w.field_name='nama';w.field_type=fitz.PDF_WIDGET_TYPE_TEXT;w.rect=fitz.Rect(60,200,300,230);d[0].add_widget(w)
w=fitz.Widget();w.field_name='setuju';w.field_type=fitz.PDF_WIDGET_TYPE_CHECKBOX;w.rect=fitz.Rect(60,240,80,260);d[0].add_widget(w)
d.save(p)
r=fitz.open();page=r.new_page(width=600,height=800);page.insert_text((60,100),'CLEAR SCANNED DOCUMENT 12345',fontsize=22);page.insert_text((60,160),'This is a genuine image only PDF.',fontsize=20)
s=fitz.open();page=s.new_page(width=600,height=800);page.insert_image(page.rect,stream=r[0].get_pixmap(dpi=200).tobytes('png'));s.save(sys.argv[2])
r=fitz.open();page=r.new_page();page.insert_text((60,100),'Changed <script>alert(1)</script> words',fontsize=14);r.save(sys.argv[3])
c=fitz.open();page=c.new_page(width=600,height=800)
for y,a,b in [(70,'LEFT FIRST','RIGHT FIRST'),(100,'LEFT SECOND','RIGHT SECOND')]:
 page.insert_text((50,y),a,fontsize=12);page.insert_text((350,y),b,fontsize=12)
c.save(sys.argv[4])
from PIL import Image
im=Image.new('RGB',(40,20),'red');im.paste('blue',(20,0,40,20));im.save(sys.argv[5])
`,source,scan,second,columns,picture]);
async function run(op,opts={},inputs=[source],ext='pdf'){const out=await pythonPdf(op,inputs,opts,ext);files.push(out);return out;}
function text(file){return execFileSync(process.env.PYTHON_BIN||'python3',['-c','import fitz,sys;d=fitz.open(sys.argv[1]);print("\\n".join(p.get_text() for p in d))',file],{encoding:'utf8'});}
test('alat visual, laporan kemas dan OCR imbasan',async t=>{
 for(let page=1;page<=4;page++)await t.test(`crop pada putaran halaman ${page}`,async()=>{
  const out=await run('crop',{anotasi:JSON.stringify([{halaman:page,x:10,y:10,lebar:50,tinggi:50}])});
  const sizes=JSON.parse(execFileSync('python3',['-c','import fitz,json,sys;d=fitz.open(sys.argv[1]);print(json.dumps([[p.rect.width,p.rect.height] for p in d]))',out],{encoding:'utf8'}));
  assert.deepEqual(sizes[page-1],page%2===1?[300,400]:[400,300]);assert.deepEqual(sizes[(page)%4],page%2===1?[800,600]:[600,800]);
 });
 await t.test('crop berulang pada halaman sama ditolak',async()=>{await assert.rejects(run('crop',{anotasi:JSON.stringify([1,2].map(()=>({halaman:1,x:10,y:10,lebar:80,tinggi:80})))}),/satu kawasan crop/);});
 await t.test('crop semua halaman menggunakan peratus yang sama',async()=>{
  const out=await run('crop',{anotasi:JSON.stringify([{halaman:1,x:10,y:10,lebar:80,tinggi:80}]),semua_halaman:'ya'});
  const parsed=await PDFDocument.load(fs.readFileSync(out));assert.equal(parsed.getPageCount(),4);assert.equal(parsed.getPage(0).getCropBox().width,480);
 });
 await t.test('isi borang terus dan tambah teks pada simpanan sama',async()=>{
  const out=await run('fill-edit',{field_values:JSON.stringify({nama:'Ali',setuju:'ya'}),anotasi:JSON.stringify([{jenis:'text',halaman:1,x:10,y:40,lebar:60,tinggi:10,teks:'Catatan borang',saiz:14}]),flatten:'tidak'});
  const doc=await PDFDocument.load(fs.readFileSync(out));assert.equal(doc.getForm().getTextField('nama').getText(),'Ali');assert.equal(doc.getForm().getCheckBox('setuju').isChecked(),true);assert.match(text(out),/Catatan borang/);
 });
 await t.test('isi borang dan padam teks asal serta flatten',async()=>{
  const metadata=await run('inspect',{},[source],'json');const word=JSON.parse(fs.readFileSync(metadata)).words.find(w=>w.teks==='Original');
  const out=await run('fill-edit',{field_values:JSON.stringify({nama:'Abu'}),anotasi:JSON.stringify([{...word,source_id:word.id,asal:word.teks,teks:'',jenis:'delete-text'}])});
  assert.ok(!text(out).split('\n').slice(0,3).join(' ').includes('Original'));assert.match(text(out),/Abu/);assert.equal((await PDFDocument.load(fs.readFileSync(out))).getForm().getFields().length,0);
 });
 await t.test('teks mempunyai pemisah halaman dan baris',async()=>{
  const out=await run('teks-kemas',{},[source],'txt');const value=fs.readFileSync(out,'utf8');assert.match(value,/===== HALAMAN 1 =====\n\nOriginal words/);assert.match(value,/===== HALAMAN 4 =====/);
 });
 await t.test('teks dua lajur dibaca mengikut lajur, bukan bercampur baris',async()=>{
  const out=await run('teks-kemas',{},[columns],'txt');const value=fs.readFileSync(out,'utf8');assert.ok(value.indexOf('LEFT SECOND')<value.indexOf('RIGHT FIRST'));
 });
 await t.test('gambar kekal tegak pada semua putaran halaman',async()=>{
  const data='data:image/png;base64,'+fs.readFileSync(picture).toString('base64');
  const out=await run('edit',{anotasi:JSON.stringify([1,2,3,4].map(halaman=>({jenis:'image',halaman,x:10,y:40,lebar:40,tinggi:10,data})))});
  const colors=JSON.parse(execFileSync('python3',['-c',`import fitz,json,sys;d=fitz.open(sys.argv[1]);result=[]
for p in d:
 pix=p.get_pixmap(alpha=False);w,h=p.rect.width,p.rect.height
 result.append([pix.pixel(int(w*.3-h*.04),int(h*.45)),pix.pixel(int(w*.3+h*.04),int(h*.45))])
print(json.dumps(result))`,out],{encoding:'utf8'}));
  for(const[left,right]of colors){assert.ok(left[0]>200&&left[2]<50);assert.ok(right[2]>200&&right[0]<50);}
 });
 await t.test('laporan perbandingan dua lajur dan HTML pengguna di-escape',async()=>{
  const out=await run('banding',{},[source,second],'html');const value=fs.readFileSync(out,'utf8');assert.match(value,/<th>PDF asal<\/th><th>PDF kedua<\/th>/);assert.ok(!value.includes('<script>'));assert.match(value,/&lt;script&gt;/);assert.match(value,/<del>/);assert.match(value,/<ins>/);
 });
 await t.test('fail imbasan tanpa teks diminta menjalankan OCR',async()=>{await assert.rejects(run('teks-kemas',{},[scan],'txt'),/OCR/);});
 await t.test('OCR pada fail imej sebenar menghasilkan teks boleh dicari',async()=>{
  assert.ok(!text(scan).trim());const out=await ocr(scan,'eng');files.push(out);assert.match(text(out),/CLEAR SCANNED DOCUMENT 12345/);
 });
 await t.test('bahasa OCR tidak sah memberikan ralat jelas',async()=>{await assert.rejects(ocr(scan,'palsu'),/Bahasa OCR/);});
});
test.after(()=>{files.forEach(f=>fs.rmSync(f,{force:true}));fs.rmSync(dir,{recursive:true,force:true});});
