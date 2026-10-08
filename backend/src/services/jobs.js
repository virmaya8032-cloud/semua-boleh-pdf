import crypto from 'node:crypto';
import {padamFail} from '../utils/files.js';
import {prosesFail} from '../controllers/toolController.js';
const jobs=new Map(),queue=[];
const running={heavy:0,light:0};
const limits={heavy:1,light:2};
const heavySlugs=new Set(["aliran-kerja","proses-kelompok","scan-kamera","mampat-sasaran","ai-pdf","automasi-dokumen","pdf-ke-word","ocr-pdf","word-ke-pdf","excel-ke-pdf","powerpoint-ke-pdf","html-ke-pdf","pdf-a","pdf-ke-powerpoint","pdf-ke-jpg","pdf-ke-png","mampat-pdf"]);
function drain(){
 while(queue.length){
  const index=queue.findIndex(entry=>running[entry.job.kind]<limits[entry.job.kind]);if(index<0)break;
  const {job,req}=queue.splice(index,1)[0];running[job.kind]++;job.status='proses';job.started=Date.now();
  const response={code:200,status(code){this.code=code;return this;},json(data){if(this.code>=400){job.status='gagal';job.ralat=data.ralat;}else{job.status='siap';job.result=data;}job.finished=Date.now();return this;}};
  Promise.resolve(prosesFail(req,response)).catch(error=>{job.status='gagal';job.ralat=error.message;padamFail((req.files||[]).map(f=>f.path));}).finally(()=>{running[job.kind]--;drain();});
 }
}
export function startJob(req,res){
 const kind=heavySlugs.has(req.params.slug)||(req.files||[]).reduce((sum,f)=>sum+f.size,0)>10*1024*1024?"heavy":"light";
 if(queue.filter(entry=>entry.job.kind===kind).length>=(kind==='heavy'?2:4)){padamFail((req.files||[]).map(f=>f.path));return res.status(429).json({ralat:'Pelayan sedang sibuk. Cuba sebentar lagi.'});}
 const id=crypto.randomBytes(24).toString('hex'),job={id,kind,status:'menunggu',created:Date.now()};
 jobs.set(id,job);queue.push({job,req});res.status(202).json({job:id,status:'menunggu'});drain();
 const timer=setTimeout(()=>jobs.delete(id),45*60*1000);timer.unref();
}
export function jobStatus(req,res){
 const job=jobs.get(req.params.id);
 if(!job)return res.status(404).json({ralat:'Kerja tidak dijumpai atau sesi pelayan telah dimulakan semula. Cuba proses semula fail.'});
 res.setHeader('Cache-Control','no-store');res.json({status:job.status,elapsed:Math.floor((Date.now()-job.created)/1000),result:job.result,ralat:job.ralat});
}
