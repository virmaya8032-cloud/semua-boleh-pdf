import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {PDFDocument} from 'pdf-lib';
import {isiBorang,periksaBorang} from '../src/services/pdfLib.js';
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'sbp-form-'));
const input=path.join(dir,'borang.pdf');
let output;
test('borang automatik',async t=>{
 const doc=await PDFDocument.create();const page=doc.addPage([500,600]);const form=doc.getForm();
 form.createTextField('nama').addToPage(page,{x:40,y:400,width:300,height:30});
 form.createCheckBox('setuju').addToPage(page,{x:40,y:350,width:20,height:20});
 const combo=form.createDropdown('pilihan');combo.addOptions(['Ya','Tidak']);combo.select('Ya');combo.addToPage(page,{x:40,y:300,width:100,height:30});
 fs.writeFileSync(input,await doc.save());
 await t.test('pengesanan medan, nama, jenis dan pilihan',async()=>{
  const parsed=await periksaBorang(input);
  assert.equal(parsed.fields.length,3);assert.equal(parsed.fields.find(f=>f.nama==='nama').type,7);assert.deepEqual(parsed.fields.find(f=>f.nama==='pilihan').choices,['Ya','Tidak']);
 });
 await t.test('JSON mengekalkan titik koma, tanda sama dan kotak semak',async()=>{
  const bytes=await isiBorang(input,undefined,'tidak',JSON.stringify({nama:'Ali; alamat=A',setuju:'ya',pilihan:'Tidak'}));
  const result=(await PDFDocument.load(bytes)).getForm();assert.equal(result.getTextField('nama').getText(),'Ali; alamat=A');assert.equal(result.getCheckBox('setuju').isChecked(),true);assert.deepEqual(result.getDropdown('pilihan').getSelected(),['Tidak']);
  const cleared=(await PDFDocument.load(await isiBorang(input,undefined,'tidak',JSON.stringify({pilihan:''})))).getForm();assert.deepEqual(cleared.getDropdown('pilihan').getSelected(),[]);
 });
 await t.test('nilai borang JSON tidak sah ditolak',async()=>{
  await assert.rejects(isiBorang(input,undefined,'tidak','[]'),/tidak sah/);await assert.rejects(isiBorang(input,undefined,'tidak','bad json'),/tidak sah/);
 });
});
test.after(()=>{if(output)fs.rmSync(output,{force:true});fs.rmSync(dir,{recursive:true,force:true});});
