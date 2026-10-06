import {afterEach,beforeEach,describe,it,expect,vi} from 'vitest';
import {render,screen,fireEvent,waitFor,cleanup} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter,Routes,Route} from 'react-router-dom';
import {useState} from 'react';
import PdfEditor from './PdfEditor.jsx';
import PdfPages from './PdfPages.jsx';
import InvoiceItems from './InvoiceItems.jsx';
import FormFields from './FormFields.jsx';
import {Dropzone} from './Dropzone.jsx';
import ToolPage from '../pages/ToolPage.jsx';
import {api} from '../services/api.js';

const mocks=vi.hoisted(()=>({doc:{numPages:3,getPage:vi.fn(async()=>({rotate:0,getViewport:({scale})=>({width:600*scale,height:800*scale,convertToViewportRectangle:rect=>rect}),getAnnotations:async()=>[{fieldName:'nama',rect:[60,200,300,230]},{fieldName:'setuju',rect:[60,240,80,260]}],render:()=>({promise:Promise.resolve(),cancel:()=>{}})}))},toast:{berjaya:vi.fn(),ralat:vi.fn()}}));
vi.mock('./pdfPreview.js',()=>({usePdfDocument:()=>({doc:mocks.doc,error:''})}));
vi.mock('../services/api.js',()=>({api:{periksaPdf:vi.fn(),proses:vi.fn(),fullUrl:url=>url}}));
vi.mock('./Toast.jsx',()=>({useToast:()=>mocks.toast}));
const word={id:'1:0:0:0:0',row:'1:0:0',halaman:1,teks:'Ali',x:10,y:10,lebar:10,tinggi:3,saiz:14,warna:'#000000',font:'Helvetica',bold:false,italic:false,rotation:0};
const line={...word,id:word.row,teks:'Ali makan nasi',lebar:40};
const file=new File(['%PDF-fixture'],'contoh.pdf',{type:'application/pdf'});
function Editor(){const[value,setValue]=useState('[]');return <MemoryRouter><PdfEditor file={file} mode="edit" value={value} onChange={setValue}/><output data-testid="changes">{value}</output></MemoryRouter>;}
function Crop(){const[value,setValue]=useState('[]');return <MemoryRouter><PdfEditor file={file} mode="crop" value={value} onChange={setValue}/><output data-testid="changes">{value}</output></MemoryRouter>;}
function Picture(){const[value,setValue]=useState('[]');return <MemoryRouter><PdfEditor file={file} mode="edit" initialKind="image" value={value} onChange={setValue}/><output data-testid="changes">{value}</output></MemoryRouter>;}
function Filled(){const[value,setValue]=useState('[]');const[fields,setFields]=useState();return <MemoryRouter><PdfEditor file={file} mode="fill" value={value} onChange={setValue} fieldValues={fields} onFieldChange={setFields}/><output data-testid="fields">{fields}</output></MemoryRouter>;}
function Pages({action='delete',initial}){const[value,setValue]=useState(initial);return <><PdfPages file={file} action={action} value={value} onChange={setValue}/><output data-testid="pages">{value}</output></>;}
function Invoice(){const[value,setValue]=useState();return <><InvoiceItems value={value} onChange={setValue}/><output data-testid="items">{value}</output></>;}
function Form(){const[value,setValue]=useState();return <MemoryRouter><FormFields file={file} value={value} onChange={setValue}/><output data-testid="fields">{value}</output></MemoryRouter>;}
function pageAt(slug){return render(<MemoryRouter initialEntries={[`/alat/${slug}`]}><Routes><Route path="/alat/:slug" element={<ToolPage/>}/></Routes></MemoryRouter>);}
beforeEach(()=>{
 vi.stubGlobal('PointerEvent',MouseEvent);Element.prototype.setPointerCapture=vi.fn();
 vi.spyOn(HTMLElement.prototype,'getBoundingClientRect').mockReturnValue({left:0,top:0,width:600,height:800,right:600,bottom:800});
 vi.clearAllMocks();api.periksaPdf.mockResolvedValue({halaman:1,jumlah:3,words:[word],lines:[line]});
 vi.spyOn(HTMLCanvasElement.prototype,'getContext').mockReturnValue({fillStyle:'',fillRect:()=>{}});
 URL.createObjectURL=vi.fn(()=> 'blob:hasil');URL.revokeObjectURL=vi.fn();
});
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.unstubAllGlobals();});

describe('aliran editor dan alat mudah',()=>{
 it('klik perkataan dan menaip mengubah teks asal dalam payload',async()=>{
  render(<Editor/>);await userEvent.click(await screen.findByRole('button',{name:'Edit Ali'}));
  const input=screen.getByLabelText('Edit teks terus pada PDF');await userEvent.clear(input);await userEvent.type(input,'Abu');
  const changes=JSON.parse(screen.getByTestId('changes').textContent);expect(changes[0]).toMatchObject({jenis:'replace-text',source_id:word.id,asal:'Ali',teks:'Abu'});
 });
 it('padam teks dan undo/redo boleh digunakan',async()=>{
  render(<Editor/>);await userEvent.click(await screen.findByRole('button',{name:'Edit Ali'}));
  await userEvent.click(screen.getByRole('button',{name:'Padam perkataan / baris'}));expect(JSON.parse(screen.getByTestId('changes').textContent)[0].jenis).toBe('delete-text');
  await userEvent.click(screen.getByRole('button',{name:'Undo'}));expect(screen.getByTestId('changes').textContent).toBe('[]');
  await userEvent.click(screen.getByRole('button',{name:'Redo'}));expect(JSON.parse(screen.getByTestId('changes').textContent)[0].jenis).toBe('delete-text');
 });
 it('boleh memilih seluruh baris dan mengubah warna/font',async()=>{
  render(<Editor/>);await screen.findByRole('button',{name:'Edit Ali'});await userEvent.selectOptions(screen.getByLabelText('Pilih'),'lines');
  await userEvent.click(screen.getByRole('button',{name:'Edit Ali makan nasi'}));await userEvent.selectOptions(screen.getByLabelText('Font'),'serif');
  expect(JSON.parse(screen.getByTestId('changes').textContent)[0]).toMatchObject({source_id:line.id,font_family:'serif'});
 });
 it('halaman dipilih dengan klik tanpa menaip nombor',async()=>{
  render(<Pages/>);await userEvent.click(await screen.findByRole('button',{name:'Halaman 2 untuk dipadam'}));expect(screen.getByTestId('pages').textContent).toBe('2');
  await userEvent.click(screen.getByRole('button',{name:'Halaman 3 untuk dipadam'}));expect(screen.getByTestId('pages').textContent).toBe('2,3');
 });
 it('susunan halaman disimpan dan pilihan terdahulu dipulihkan',async()=>{
  render(<Pages action="reorder" initial="3,1,2"/>);await userEvent.click(await screen.findByRole('button',{name:'Alih halaman 1 ke kiri'}));expect(screen.getByTestId('pages').textContent).toBe('1,3,2');
 });
 it('invois menggunakan baris item dan mengira jumlah',async()=>{
  render(<Invoice/>);await userEvent.clear(screen.getByLabelText('Harga 1'));await userEvent.type(screen.getByLabelText('Harga 1'),'10.50');
  await userEvent.clear(screen.getByLabelText('Kuantiti 1'));await userEvent.type(screen.getByLabelText('Kuantiti 1'),'2');expect(screen.getByText('Jumlah: RM 21.00')).toBeTruthy();
  await userEvent.click(screen.getByRole('button',{name:'Tambah item'}));expect(screen.getByLabelText('Perkara 2')).toBeTruthy();expect(screen.getByTestId('items').textContent).toContain(' | 2 | 10.5');
 });
 it('medan borang dikenali automatik dan tidak memerlukan sintaks khas',async()=>{
  api.periksaPdf.mockResolvedValue({fields:[{nama:'nama',type:7,value:'',halaman:1,choices:[]},{nama:'setuju',type:2,value:'Off',halaman:1,choices:[]}]});
  render(<Form/>);await userEvent.type(await screen.findByRole('textbox'),'Ali; alamat=A');await userEvent.click(screen.getByRole('checkbox'));
  expect(JSON.parse(screen.getByTestId('fields').textContent)).toEqual({nama:'Ali; alamat=A',setuju:'ya'});
 });
 it('fail salah jenis yang dilepaskan ditolak',()=>{
  const callback=vi.fn();render(<Dropzone accept=".pdf" onFiles={callback}/>);
  fireEvent.drop(screen.getByRole('button'),{dataTransfer:{files:[new File(['abc'],'foto.png',{type:'image/png'})]}});expect(callback).not.toHaveBeenCalled();expect(screen.getByRole('alert').textContent).toContain('tidak sesuai');
 });
 it('simpan editor memaparkan PDF hasil dan boleh sambung edit',async()=>{
  api.proses.mockResolvedValue({muat_turun:'/hasil.pdf',nama_fail:'diedit.pdf'});
  vi.stubGlobal('fetch',vi.fn(async()=>({ok:true,blob:async()=>new Blob(['%PDF-hasil'],{type:'application/pdf'})})));
  const view=pageAt('edit-pdf');fireEvent.change(view.container.querySelector('input[type=file]'),{target:{files:[file]}});
  await userEvent.click(await screen.findByRole('button',{name:'Edit Ali'}));await userEvent.click(screen.getByRole('button',{name:'Padam perkataan / baris'}));
  await userEvent.click(screen.getByRole('button',{name:'Simpan & pratonton PDF'}));await screen.findByTitle('Pratonton PDF hasil');expect(api.proses.mock.calls[0][0]).toBe('edit-pdf');
  await userEvent.click(screen.getByRole('button',{name:'Sambung edit'}));await screen.findByText('1 perubahan · 1 pada halaman ini');
 });
 it('pisah setiap halaman tersedia sebagai pilihan terus',async()=>{
  const view=pageAt('pisah-pdf');fireEvent.change(view.container.querySelector('input[type=file]'),{target:{files:[file]}});
  expect(screen.getByRole('button',{name:'Setiap halaman menjadi satu PDF'})).toBeTruthy();await userEvent.click(screen.getByRole('button',{name:'Pilih kumpulan halaman'}));expect(screen.getByPlaceholderText('1-3, 5')).toBeTruthy();
 });
 it('crop boleh diseret dan diubah saiz dengan pemegang penjuru',async()=>{
  render(<Crop/>);await waitFor(()=>expect(screen.queryByText('Memuatkan PDF…')).toBeNull());const surface=screen.getByLabelText('Paparan PDF');
  fireEvent.pointerDown(surface,{clientX:60,clientY:80,pointerId:1});fireEvent.pointerMove(surface,{clientX:300,clientY:400,pointerId:1});fireEvent.pointerUp(surface,{clientX:300,clientY:400,pointerId:1});
  expect(JSON.parse(screen.getByTestId('changes').textContent)[0]).toMatchObject({jenis:'crop',x:10,y:10,lebar:40,tinggi:40});
  fireEvent.pointerDown(screen.getByRole('button',{name:'Ubah saiz Crop / potong'}),{clientX:300,clientY:400,pointerId:1});fireEvent.pointerMove(surface,{clientX:360,clientY:480,pointerId:1});fireEvent.pointerUp(surface,{clientX:360,clientY:480,pointerId:1});
  expect(JSON.parse(screen.getByTestId('changes').textContent)[0].lebar).toBe(50);
 });
 it('gambar atau tandatangan yang dimuat naik boleh diletak dan dialih',async()=>{
  render(<Picture/>);const png=new File([new Uint8Array([1,2,3])],'signature.png',{type:'image/png'});
  fireEvent.change(screen.getByLabelText('Muat naik gambar atau tandatangan'),{target:{files:[png]}});await screen.findByText(/Gambar sedia/);
  const surface=screen.getByLabelText('Paparan PDF');fireEvent.pointerDown(surface,{clientX:60,clientY:80,pointerId:1});fireEvent.pointerUp(surface,{clientX:60,clientY:80,pointerId:1});
  expect(JSON.parse(screen.getByTestId('changes').textContent)[0].jenis).toBe('image');
  await userEvent.click(screen.getByRole('button',{name:'Alih / ubah saiz'}));fireEvent.pointerDown(screen.getByLabelText('Alih Gambar'),{clientX:60,clientY:80,pointerId:1});fireEvent.pointerMove(surface,{clientX:120,clientY:160,pointerId:1});fireEvent.pointerUp(surface,{clientX:120,clientY:160,pointerId:1});
  expect(JSON.parse(screen.getByTestId('changes').textContent)[0]).toMatchObject({x:20,y:20});
 });
 it('isi medan borang pada PDF yang dipaparkan',async()=>{
  api.periksaPdf.mockResolvedValue({fields:[{nama:'nama',type:7,value:'',halaman:1,choices:[]},{nama:'setuju',type:2,value:'Off',halaman:1,choices:[]}]});
  render(<Filled/>);await userEvent.type(await screen.findByLabelText('Borang: nama'),'Ali');await userEvent.click(screen.getByLabelText('Borang: setuju'));
  expect(JSON.parse(screen.getByTestId('fields').textContent)).toEqual({nama:'Ali',setuju:'ya'});expect(screen.getByRole('button',{name:'Tambah teks'})).toBeTruthy();expect(screen.getByRole('button',{name:'Edit perkataan'})).toBeTruthy();
 });
 it('PDF kepada teks memaparkan baris dalam pratonton yang boleh disalin',async()=>{
  api.proses.mockResolvedValue({muat_turun:'/hasil.txt',nama_fail:'teks.txt'});
  vi.stubGlobal('fetch',vi.fn(async()=>({ok:true,blob:async()=>({size:22,text:async()=> '===== HALAMAN 1 =====\n\nAli makan nasi'})})));
  const view=pageAt('pdf-ke-teks');fireEvent.change(view.container.querySelector('input[type=file]'),{target:{files:[file]}});await userEvent.click(screen.getByRole('button',{name:'PDF kepada Teks'}));await screen.findByText('Teks mengikut halaman');expect(screen.getByRole('button',{name:'Salin teks'})).toBeTruthy();
 });

});
