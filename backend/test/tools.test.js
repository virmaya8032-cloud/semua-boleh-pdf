import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { proses } from '../src/services/process.js';
import { ALAT } from '../src/config/tools.js';
import { jalan } from '../src/services/binary.js';
import { ekstrakTeks } from '../src/services/pdfText.js';

const python = process.env.PYTHON_BIN || 'python3';
const work = fs.mkdtempSync(path.join(os.tmpdir(),'sbp-test-'));
const input = path.join(work,'source.pdf');
const other = path.join(work,'overlay.pdf');
const image = path.join(work,'gambar.png');
const jpeg = path.join(work,'gambar.jpg');
const outputs = [];
let source;

test('pemprosesan PDF dan alat baharu', async (t) => {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for(let i=0;i<3;i++) {
    const p=doc.addPage([600,800]);
    p.drawText('SECRET-12345',{x:50,y:700,size:14,font});
    p.drawText(`PUBLIC-HALAMAN-${i+1}`,{x:50,y:500,size:14,font});
  }
  doc.setTitle('Tajuk lama'); doc.setAuthor('Pengarang lama');
  const form=doc.getForm();
  form.createTextField('nama').addToPage(doc.getPage(0),{x:50,y:100,width:200,height:30});
  form.createCheckBox('setuju').addToPage(doc.getPage(0),{x:300,y:100,width:20,height:20});
  execFileSync(python,['-c', 'from PIL import Image; import sys; Image.new("RGB",(40,20),"red").save(sys.argv[1])',image]);
  execFileSync(python,['-c','from PIL import Image; import sys; Image.open(sys.argv[1]).save(sys.argv[2])',image,jpeg]);
  const png=await doc.embedPng(fs.readFileSync(image));
  doc.getPage(0).drawImage(png,{x:350,y:300,width:80,height:40});
  fs.writeFileSync(input,await doc.save());
  const ov=await PDFDocument.create();
  ov.addPage([600,800]).drawText('OVERLAY',{x:50,y:300,font:await ov.embedFont(StandardFonts.Helvetica)});
  fs.writeFileSync(other,await ov.save());
  source=fs.readFileSync(input);
  const edit=[{jenis:'text',halaman:1,x:10,y:30,lebar:60,tinggi:10,teks:'Teks baharu',saiz:14},{jenis:'highlight',halaman:1,x:5,y:5,lebar:30,tinggi:5},{jenis:'box',halaman:2,x:10,y:40,lebar:40,tinggi:10},{jenis:'pen',halaman:1,x:10,y:60,lebar:20,tinggi:10,points:[{x:10,y:60},{x:20,y:62},{x:30,y:60}]},{jenis:'image',halaman:1,x:70,y:40,lebar:20,tinggi:10,data:'data:image/png;base64,'+fs.readFileSync(image).toString('base64')}];
  const cases = {
    'mampat-pdf': [[input],{tahap:'sederhana'}], 'ocr-pdf': [[input],{bahasa:'eng'}],
    'gabung-pdf': [[input,other],{}], 'pisah-pdf': [[input],{julat:'1-2,3'}],
    'padam-halaman': [[input],{halaman:'2'}], 'ekstrak-halaman': [[input],{halaman:'2-3'}],
    'susun-halaman': [[input],{susunan:'3,1,2'}], 'putar-pdf': [[input],{sudut:'90',halaman:'2'}],
    'nombor-halaman': [[input],{}], 'tera-air': [[input],{teks:'SALINAN'}], 'potong-pdf': [[input],{margin:'5'}],
    'jpg-ke-pdf': [[jpeg],{saiz_kertas:'a4',margin:20}], 'png-ke-pdf': [[image],{saiz_kertas:'letter'}],
    'pdf-ke-word': [[input],{}], 'pdf-ke-excel': [[input],{}], 'pdf-ke-powerpoint': [[input],{}],
    'pdf-ke-jpg': [[input],{dpi:72,_format:'jpg'}], 'pdf-ke-png': [[input],{dpi:72,_format:'png'}], 'pdf-ke-teks': [[input],{}],
    'tandatangan-pdf': [[input],{anotasi:JSON.stringify(edit)}], 'sensor-pdf': [[input],{anotasi:JSON.stringify([{halaman:1,x:0,y:9,lebar:100,tinggi:6}])}],
    'imbas-ke-pdf': [[image],{}], 'banding-pdf': [[input,other],{}], 'tambah-teks-pdf': [[input],{teks:'TAMBAHAN',halaman:1,x:10,y:20}],
    'tambah-gambar-pdf': [[image,input],{halaman:2,x:10,y:10,lebar:40}], 'edit-pdf': [[input],{anotasi:JSON.stringify(edit)}],
    'isi-borang-pdf': [[input],{data:'nama=Ali;setuju=ya',flatten:'tidak'}],
    'ekstrak-gambar-pdf': [[input],{}], 'overlay-pdf': [[input,other],{}],
    'halaman-per-helaian': [[input],{bilangan:2,saiz_kertas:'a4',orientasi:'landskap'}], 'saiz-halaman-pdf': [[input],{saiz_kertas:'a5'}],
    'edit-metadata-pdf': [[input],{title:'Tajuk baharu',author:'Ali',subject:'Ujian',keywords:'pdf'}], 'buang-metadata-pdf': [[input],{}],
    'flatten-pdf': [[input],{}], 'cipta-borang-pdf': [[],{medan:JSON.stringify([{nama:'nama_baru',jenis:'text',halaman:1,x:10,y:10,lebar:50,tinggi:5},{nama:'semak',jenis:'checkbox',halaman:1,x:10,y:30,lebar:5,tinggi:5}])}],
    'cipta-invois': [[],{penjual:'Syarikat Ali',pelanggan:'Ahmad',nombor:'INV-123',item:'Buku | 2 | 10.50\nPen | 3 | 2.00'}],
    'permohonan-kerja-pdf': [[],{nama:'Ali',jawatan:'Kerani',syarikat:'ABC',surat:'Saya ingin memohon jawatan ini. '.repeat(200)}]
  };
  for (const [slug,[paths,opts]] of Object.entries(cases)) {
    await t.test(slug,async () => {
      const result=await proses(ALAT[slug].op,paths,opts);
      outputs.push(result.path);
      assert.ok(fs.statSync(result.path).size > 10);
      if(result.filename.endsWith('.pdf')) {
        const parsed=await PDFDocument.load(fs.readFileSync(result.path));
        assert.ok(parsed.getPageCount()>0);
        if(slug==='gabung-pdf') assert.equal(parsed.getPageCount(),4);
        if(slug==='padam-halaman'||slug==='ekstrak-halaman') assert.equal(parsed.getPageCount(),2);
        if(slug==='putar-pdf') assert.deepEqual(parsed.getPages().map(p=>p.getRotation().angle),[0,90,0]);
        if(slug==='halaman-per-helaian') assert.equal(parsed.getPageCount(),2);
        if(slug==='saiz-halaman-pdf') assert.ok(Math.abs(parsed.getPage(0).getWidth()-419.528)<1);
        if(slug==='edit-metadata-pdf') assert.equal(parsed.getTitle(),'Tajuk baharu');
        if(slug==='buang-metadata-pdf') {
          const meta=JSON.parse(execFileSync(python,['-c','import fitz,json,sys; d=fitz.open(sys.argv[1]); print(json.dumps(d.metadata))',result.path],{encoding:'utf8'}));
          assert.equal(meta.title,''); assert.equal(meta.author,'');
        }
        if(slug==='flatten-pdf') assert.equal(parsed.getForm().getFields().length,0);
        if(slug==='cipta-borang-pdf') assert.equal(parsed.getForm().getFields().length,2);
        if(slug==='isi-borang-pdf') { assert.equal(parsed.getForm().getTextField('nama').getText(),'Ali'); assert.equal(parsed.getForm().getCheckBox('setuju').isChecked(),true); }
        if(slug==='sensor-pdf') {
          const content=JSON.parse(execFileSync(python,['-c','import fitz,json,sys; d=fitz.open(sys.argv[1]); print(json.dumps([p.get_text() for p in d]))',result.path],{encoding:'utf8'}));
          assert.ok(!content[0].includes('SECRET-12345'));
          assert.ok(content[0].includes('PUBLIC-HALAMAN-1'));
          assert.ok(content[1].includes('SECRET-12345'));
        }
        if(slug==='cipta-invois') assert.match((await ekstrakTeks(result.path)).toString(),/27\.00/);
        if(slug==='permohonan-kerja-pdf') assert.ok(parsed.getPageCount()>1);
      } else if(result.filename.endsWith('.zip')) {
        const entries=execFileSync(python,['-c','import zipfile,sys; z=zipfile.ZipFile(sys.argv[1]); print(len(z.namelist())); assert z.testzip() is None',result.path],{encoding:'utf8'});
        assert.ok(Number(entries.trim())>0);
      } else if(/\.(docx|xlsx|pptx)$/.test(result.filename)) {
        execFileSync(python,['-c', 'import sys; p=sys.argv[1]; ext=p.rsplit(".",1)[1];\nif ext=="docx":\n from docx import Document\n assert any("SECRET-12345" in q.text for q in Document(p).paragraphs)\nelif ext=="xlsx":\n from openpyxl import load_workbook\n assert len(load_workbook(p).sheetnames)==3\nelse:\n from pptx import Presentation\n assert len(Presentation(p).slides)==3',result.path]);
      }
    });
  }
  await t.test('tindak balas input tidak sah',async () => {
    await assert.rejects(proses('nup',[input],{bilangan:0}),/bilangan/);
    await assert.rejects(proses('sensor',[input],{halaman:99}),/halaman/);
    await assert.rejects(proses('edit',[input],{anotasi:'[]'}),/anotasi/);
    await assert.rejects(proses('invois',[],{penjual:'Ali',pelanggan:'B',item:'A | -1 | 5'}),/Kuantiti/);
    await assert.rejects(proses('cipta-borang',[],{medan:'[]'}),/medan/);
  });
  await t.test('argumen arahan dihantar sebagai teks literal',async () => {
    const value='kata laluan; $(printf unsafe) "quote" &';
    const result=await jalan(process.execPath,['-e','process.stdout.write(process.argv[1])',value]);
    assert.equal(result.out,value);
  });
  assert.deepEqual(fs.readFileSync(input),source,'Fail sumber kekal');
});

test.after(() => { for(const output of outputs) fs.rmSync(output,{force:true}); fs.rmSync(work,{recursive:true,force:true}); });
