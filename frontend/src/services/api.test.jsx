import {afterEach,beforeEach,describe,it,expect,vi} from 'vitest';
import {api} from './api';
let xhr;
class FakeXHR {
 constructor(){xhr=this;this.upload={};}
 open(method,url){this.method=method;this.url=url;}
 setRequestHeader(){}
 send(body){this.body=body;}
 abort(){this.aborted=true;}
 accept(data,status=202){this.status=status;this.responseText=JSON.stringify(data);this.onload();}
}
const response=data=>({ok:true,headers:{get:()=> 'application/json'},json:async()=>data});
beforeEach(()=>{vi.useFakeTimers();vi.stubGlobal('XMLHttpRequest',FakeXHR);vi.stubGlobal('fetch',vi.fn());});
afterEach(()=>{vi.useRealTimers();vi.unstubAllGlobals();});
describe('pemprosesan API latar',()=>{
 it('menunggu kerja selesai dan memulangkan hasil sebenar',async()=>{
  fetch.mockResolvedValueOnce(response({status:'proses',elapsed:2})).mockResolvedValueOnce(response({status:'siap',result:{download:'/hasil.pdf'}}));
  const status=vi.fn();const done=api.proses('ocr-pdf',[new File(['pdf'],'contoh.pdf')],{},null,status);
  expect(xhr.url).toMatch(/\/alat\/kerja\/ocr-pdf$/);xhr.accept({job:'abc'});
  await vi.advanceTimersByTimeAsync(4000);
  expect(await done).toEqual({download:'/hasil.pdf'});expect(status).toHaveBeenCalledTimes(2);
 });
 it('memaparkan mesej kegagalan pemprosesan',async()=>{
  fetch.mockResolvedValue(response({status:'gagal',ralat:'Bahasa OCR belum dipasang.'}));
  const done=api.proses('ocr-pdf',[],{});const rejected=expect(done).rejects.toThrow('Bahasa OCR belum dipasang.');xhr.accept({job:'abc'});await rejected;
 });
 it('berhenti meminta status apabila halaman ditutup',async()=>{
  fetch.mockResolvedValue(response({status:'proses'}));const controller=new AbortController();
  const done=api.proses('ocr-pdf',[],{},null,null,controller.signal);const rejected=expect(done).rejects.toThrow('Sesi pelayar dibatalkan.');
  xhr.accept({job:'abc'});await vi.advanceTimersByTimeAsync(0);controller.abort();await rejected;await vi.advanceTimersByTimeAsync(20000);
  expect(fetch).toHaveBeenCalledTimes(1);expect(xhr.aborted).toBe(true);
 });
});
