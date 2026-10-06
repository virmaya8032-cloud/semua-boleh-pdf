import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {pythonPdf} from '../src/services/pythonPdf.js';
const python=process.env.PYTHON_BIN||'python3';
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'sbp-inline-'));
const source=path.join(dir,'original.pdf');
const generated=[];
execFileSync(python,['-c',`
import fitz,sys
from PIL import Image
from io import BytesIO
d=fitz.open()
for rotation in (0,90,180,270):
 p=d.new_page(width=500,height=600)
 p.draw_rect(fitz.Rect(20,40,400,140),fill=(0.9,0.95,0.8),color=None)
 p.insert_text((40,80),'Ali makan nasi',fontsize=14,fontname='helv')
 p.insert_text((40,105),'Baris bawah kekal',fontsize=14,fontname='helv')
 p.insert_text((40,170),'Mixed ',fontsize=14,fontname='helv')
 p.insert_text((82,170),'bold',fontsize=14,fontname='hebo')
 buf=BytesIO();Image.new('RGB',(50,50),'red').save(buf,format='PNG')
 p.insert_image(fitz.Rect(25,45,30,90),stream=buf.getvalue())
 p.set_rotation(rotation)
scan=fitz.open();r=scan.new_page(width=500,height=600);r.insert_text((40,80),'Ali makan nasi',fontsize=14)
p=d.new_page(width=500,height=600);p.insert_image(p.rect,stream=r.get_pixmap().tobytes('png'));p.insert_text((40,80),'Ali makan nasi',fontsize=14,render_mode=3)
p=d.new_page(width=500,height=600);p.insert_text((40,80),'Ali makan nasi',fontsize=14);p.set_cropbox(fitz.Rect(20,30,480,580))
d.save(sys.argv[1])
`,source]);
const originalBytes=fs.readFileSync(source);
async function layout(page=1){const out=await pythonPdf('inspect',[source],{halaman:page},'json');generated.push(out);return JSON.parse(fs.readFileSync(out,'utf8'));}
async function edit(items){const out=await pythonPdf('edit',[source],{anotasi:JSON.stringify(items)});generated.push(out);return out;}
function info(file){return JSON.parse(execFileSync(python,['-c',`import fitz,json,sys;d=fitz.open(sys.argv[1]);print(json.dumps([{'text':p.get_text(),'images':len(p.get_images()),'drawings':len(p.get_drawings()),'rotation':p.rotation} for p in d]))`,file],{encoding:'utf8'}));}
function delta(word,text,extra={}){return {...word,source_id:word.id,asal:word.teks,jenis:'replace-text',teks:text,...extra};}

test('editor teks asal PDF',async t=>{
 const first=await layout();
 await t.test('perkataan dan baris mempunyai ID, warna dan kedudukan sah',()=>{
  assert.equal(first.jumlah,6);assert.ok(first.words.some(w=>w.teks==='Ali'));assert.ok(first.lines.some(l=>l.teks==='Ali makan nasi'));
  assert.ok(first.words.every(w=>w.id&&w.lebar>0&&w.x>=0&&w.y>=0&&!('_rect'in w)));
 });
 await t.test('mengganti perkataan sebenar sambil mengekalkan jiran, imej dan latar',async()=>{
  const out=await edit([delta(first.words.find(w=>w.teks==='Ali'),'Abu')]);const pages=info(out);
  assert.match(pages[0].text,/Abu/);assert.ok(!pages[0].text.includes('Ali'));assert.match(pages[0].text,/makan nasi/);assert.match(pages[0].text,/Baris bawah kekal/);
  assert.equal(pages[0].images,info(source)[0].images);assert.equal(pages[0].drawings,info(source)[0].drawings);assert.match(pages[1].text,/Ali/);
 });
 await t.test('padam satu perkataan, bukan sorok dengan kotak putih',async()=>{
  const pages=info(await edit([delta(first.words.find(w=>w.teks==='makan'),'',{jenis:'delete-text'})]));
  assert.ok(!pages[0].text.includes('makan'));assert.match(pages[0].text,/Ali/);assert.match(pages[0].text,/nasi/);
 });
 await t.test('beberapa perkataan boleh diubah serentak pada baris sama',async()=>{
  const pages=info(await edit([delta(first.words.find(w=>w.teks==='Ali'),'Siti'),delta(first.words.find(w=>w.teks==='nasi'),'roti')]));
  assert.match(pages[0].text,/Siti/);assert.match(pages[0].text,/roti/);assert.match(pages[0].text,/makan/);assert.ok(!pages[0].text.includes('Ali'));
 });
 await t.test('gantikan seluruh baris dengan font dan warna pilihan',async()=>{
  const pages=info(await edit([delta(first.lines.find(l=>l.teks==='Ali makan nasi'),'Surat baharu',{bold:true,warna:'#123456'})]));
  assert.match(pages[0].text,/Surat baharu/);assert.ok(!pages[0].text.includes('makan'));assert.match(pages[0].text,/Baris bawah kekal/);
 });
 await t.test('baris berbilang font dipadam sepenuhnya',async()=>{
  const line=first.lines.find(l=>l.teks.includes('Mixed'));assert.ok(line);
  const pages=info(await edit([delta(line,'Satu baris')]));assert.match(pages[0].text,/Satu baris/);assert.ok(!pages[0].text.includes('Mixed'));assert.ok(!pages[0].text.includes('bold'));
 });
 for(const page of [2,3,4])await t.test(`sunting halaman diputar ${[0,90,180,270][page-1]} darjah`,async()=>{
  const word=(await layout(page)).words.find(w=>w.teks==='Ali');assert.equal(word.rotation,[0,90,180,270][page-1]);
  const pages=info(await edit([delta(word,'Abu')]));assert.match(pages[page-1].text,/Abu/);assert.ok(!pages[page-1].text.includes('Ali'));assert.equal(pages[page-1].rotation,word.rotation);
 });
 await t.test('teks panjang dimuatkan dalam kawasan asal',async()=>{
  const out=await edit([delta(first.lines.find(l=>l.teks==='Ali makan nasi'),'Ayat panjang baharu untuk diuji')]);assert.match(info(out)[0].text,/Ayat panjang baharu/);
 });
 await t.test('pilihan bertindih ditolak',async()=>{
  await assert.rejects(edit([delta(first.words[0],'Abu'),delta(first.lines[0],'Bertindih')]),/bertindih/);
 });
 await t.test('ID atau teks asal palsu ditolak',async()=>{
  await assert.rejects(edit([delta({...first.words[0],id:'palsu'},'Abu')]),/Teks asal berubah/);
  await assert.rejects(edit([delta(first.words[0],'Abu',{asal:'Palsu'})]),/Teks asal berubah/);
 });
 await t.test('teks terlalu panjang dan berbilang baris ditolak',async()=>{
  await assert.rejects(edit([delta(first.words[0],'A'.repeat(1000))]),/terlalu panjang/);
  await assert.rejects(edit([delta(first.words[0],'Abu\nAli')]),/satu baris/);
 });
 await t.test('teks OCR memadam piksel perkataan asal, bukan lapisan teks sahaja',async()=>{
  const word=(await layout(5)).words.find(w=>w.teks==='Ali');assert.equal(word.scan,true);
  const out=await edit([delta(word,'',{jenis:'delete-text'})]);assert.ok(!info(out)[4].text.includes('Ali'));assert.match(info(out)[4].text,/makan nasi/);
  const pixels=JSON.parse(execFileSync(python,['-c',`import fitz,sys,json;counts=[]
for f in sys.argv[1:]:
 d=fitz.open(f);p=d[4].get_pixmap(clip=fitz.Rect(40,65,57,82),alpha=False);counts.append(sum(1 for i in range(0,len(p.samples),3) if min(p.samples[i:i+3])<100))
print(json.dumps(counts))`,source,out],{encoding:'utf8'}));assert.ok(pixels[0]>0);assert.equal(pixels[1],0);
 });
 await t.test('suntingan pada halaman crop kekal tepat',async()=>{
  const word=(await layout(6)).words.find(w=>w.teks==='Ali');assert.ok(word.x>=0&&word.y>=0);
  const out=await edit([delta(word,'Abu')]);assert.match(info(out)[5].text,/Abu/);assert.ok(!info(out)[5].text.includes('Ali'));
 });
 await t.test('fail asal kekal sama',()=>assert.deepEqual(fs.readFileSync(source),originalBytes));
});
process.on('exit',()=>{for(const f of generated)fs.rmSync(f,{force:true});fs.rmSync(dir,{recursive:true,force:true});});
