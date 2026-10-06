import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MousePointer2, Type, Highlighter, Square, PenLine, ImagePlus, Undo2, Redo2, Trash2, ZoomIn, ZoomOut } from 'lucide-react';
import { api } from '../services/api.js';
import { usePdfDocument } from './pdfPreview.js';

const labels = { select: 'Edit perkataan', fields: 'Isi medan borang', crop: 'Crop / potong', arrange: 'Alih / ubah saiz', text: 'Tambah teks', highlight: 'Sorotan', box: 'Kotak', pen: 'Lukis', image: 'Gambar', redact: 'Sensor', checkbox: 'Kotak semak' };
const icons = { select: MousePointer2, text: Type, highlight: Highlighter, box: Square, pen: PenLine, image: ImagePlus, redact: Square, checkbox: Square };
const originalChange = item => ['replace-text', 'delete-text'].includes(item.jenis);

export default function PdfEditor({ file, mode, value, onChange, initialKind, onSave, fieldValues, onFieldChange }) {
  const { doc, error: openError } = usePdfDocument(file);
  const canvas = useRef(null), surface = useRef(null), gesture = useRef(null);
  const history = useRef({ undo: [], redo: [] });
  const cache = useRef(new Map());
  const [page, setPage] = useState(1), [dims, setDims] = useState({ width: 595, height: 842 });
  const [ready, setReady] = useState(false), [error, setError] = useState('');
  const [kind, setKind] = useState(initialKind || (mode === 'crop' ? 'crop' : mode === 'fill' ? 'fields' : mode === 'form' ? 'text' : mode === 'redact' ? 'redact' : 'select'));
  const [label, setLabel] = useState(mode === 'form' ? 'nama' : 'Teks baharu');
  const [size, setSize] = useState(14), [color, setColor] = useState('#000000');
  const [picture, setPicture] = useState(''), [draft, setDraft] = useState(null);
  const [layout, setLayout] = useState(null), [checking, setChecking] = useState(false), [layoutError, setLayoutError] = useState('');
  const [selection, setSelection] = useState(null), [unit, setUnit] = useState('words');
  const [zoom, setZoom] = useState(100), [search, setSearch] = useState('');
  const [objects, setObjects] = useState(null), [widgets,setWidgets] = useState([]), [fields,setFields] = useState([]);
  const fieldsCallback=useRef(onFieldChange); fieldsCallback.current=onFieldChange;
  const initialFields=useRef(fieldValues);
  let filled={};try{filled=JSON.parse(fieldValues||'{}');}catch{}
  const fillField=(name,val)=>onFieldChange?.(JSON.stringify({...filled,[name]:val}));
  const [, refresh] = useState(0);
  const items = useMemo(() => { try { return JSON.parse(value || '[]'); } catch { return []; } }, [value]);
  const put = next => {
    const before = JSON.stringify(items), after = JSON.stringify(next);
    if (before === after) return;
    history.current.undo.push(before); history.current.undo = history.current.undo.slice(-100);
    history.current.redo = []; onChange(after); refresh(n => n+1);
  };
  const travel = direction => {
    const target = history.current[direction];
    if (!target.length) return;
    history.current[direction === 'undo' ? 'redo' : 'undo'].push(JSON.stringify(items));
    onChange(target.pop()); setSelection(null); setObjects(null); refresh(n => n+1);
  };
  const changeFor = source => items.find(i => i.source_id === source.id);
  const select = source => {
    const conflict = items.find(i => originalChange(i) && i.row === source.row && i.source_id !== source.id && (unit === 'lines' || i.source_id === source.row));
    if (conflict) { setError('Baris ini sudah mempunyai perubahan. Buang perubahan itu dahulu sebelum memilih seluruh baris/perkataan.'); return; }
    setError(''); setSelection(source); setKind('select');
  };
  const patchText = patch => {
    if (!selection) return;
    const existing = changeFor(selection);
    const next = { ...selection, source_id: selection.id, asal: selection.teks, jenis: 'replace-text', font_family: 'auto', ...existing, ...patch };
    delete next.id;
    put([...items.filter(i => i.source_id !== selection.id), next]);
  };
  const deleteText = () => { patchText({ jenis: 'delete-text', teks: '' }); setSelection(null); };

  useEffect(() => {
    let stopped = false, render;
    setReady(false); setError(''); setSelection(null); setObjects(null); setWidgets([]);
    if (file && !doc) return;
    (async () => {
      if (!doc) {
        canvas.current.width = 595; canvas.current.height = 842;
        const ctx = canvas.current.getContext('2d'); ctx.fillStyle = 'white'; ctx.fillRect(0,0,595,842);
        setDims({ width: 595, height: 842 }); setReady(true); return;
      }
      const pdfPage = await doc.getPage(page);
      if (stopped) return;
      const natural = pdfPage.getViewport({ scale: 1 });
      if(mode==='fill') {
        const annotations=await pdfPage.getAnnotations({intent:'display'});
        if(stopped)return;
        setWidgets(annotations.filter(a=>a.fieldName&&a.rect&&!a.readOnly).map(a=>{
          const [ax,ay,bx,by]=natural.convertToViewportRectangle(a.rect);
          return {name:a.fieldName,multiline:a.multiLine,x:Math.min(ax,bx)/natural.width*100,y:Math.min(ay,by)/natural.height*100,lebar:Math.abs(bx-ax)/natural.width*100,tinggi:Math.abs(by-ay)/natural.height*100};
        }));
      }
      const viewport = pdfPage.getViewport({ scale: Math.min(2,1200/natural.width) });
      canvas.current.width = viewport.width; canvas.current.height = viewport.height;
      setDims({ width: natural.width, height: natural.height });
      render = pdfPage.render({ canvasContext: canvas.current.getContext('2d'), viewport });
      await render.promise; if (!stopped) setReady(true);
    })().catch(e => { if (!stopped && e.name !== 'RenderingCancelledException') setError('Halaman tidak dapat dipratonton.'); });
    return () => { stopped = true; render?.cancel(); };
  }, [doc,page,file,mode]);

  useEffect(()=>{
    if(mode!=='fill'||!file)return;
    const controller=new AbortController();
    api.periksaPdf(file,1,controller.signal,'forms').then(data=>{
      setFields(data.fields||[]);
      if(!initialFields.current){const defaults={};for(const f of data.fields||[]){if(f.readonly||![2,3,4,7].includes(f.type))continue;defaults[f.nama]=f.type===2?(f.value&&f.value!=='Off'?'ya':'tidak'):String(f.value||'');}fieldsCallback.current?.(JSON.stringify(defaults));}
    }).catch(e=>{if(e.name!=='AbortError')setError(e.message);});
    return()=>controller.abort();
  },[mode,file]);

  useEffect(() => {
    setLayout(null); setLayoutError(''); setChecking(false);
    if (!file || !['edit','fill'].includes(mode) || kind!=='select') return;
    if (cache.current.has(page)) { setLayout(cache.current.get(page)); return; }
    const controller = new AbortController();
    setChecking(true);
    api.periksaPdf(file,page,controller.signal).then(data => {
      cache.current.set(page,data); setLayout(data);
    }).catch(e => { if (e.name !== 'AbortError') setLayoutError(e.message); }).finally(() => { if (!controller.signal.aborted) setChecking(false); });
    return () => controller.abort();
  }, [file,page,mode,kind]);

  useEffect(() => {
    const keydown = event => {
      if (['INPUT','TEXTAREA','SELECT'].includes(event.target.tagName) || event.target.isContentEditable) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') { event.preventDefault(); travel(event.shiftKey ? 'redo' : 'undo'); }
      if ((event.key === 'Delete' || event.key === 'Backspace') && selection) { event.preventDefault(); deleteText(); }
      if (event.key === 'Escape') setSelection(null);
    };
    window.addEventListener('keydown',keydown); return () => window.removeEventListener('keydown',keydown);
  });

  const point = event => {
    const rect = surface.current.getBoundingClientRect();
    return { x: Math.max(0,Math.min(100,(event.clientX-rect.left)/rect.width*100)), y: Math.max(0,Math.min(100,(event.clientY-rect.top)/rect.height*100)) };
  };
  const start = event => {
    if (!ready || openError || ['select','fields','arrange'].includes(kind)) return;
    if (kind === 'image' && !picture) { setError('Pilih gambar dahulu, kemudian seret pada PDF.'); return; }
    event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId);
    const p = point(event); gesture.current = { start: p, points: [p] }; setSelection(null); setError('');
  };
  const move = event => {
    if (!gesture.current) return;
    const p = point(event), g = gesture.current;
    if(g.object!==undefined){
      const dx=p.x-g.start.x,dy=p.y-g.start.y,o=g.original;
      const rect=g.resize?{...o,lebar:Math.max(1,Math.min(100-o.x,o.lebar+dx)),tinggi:Math.max(1,Math.min(100-o.y,o.tinggi+dy))}:{...o,x:Math.max(0,Math.min(100-o.lebar,o.x+dx)),y:Math.max(0,Math.min(100-o.tinggi,o.y+dy))};
      setDraft({...rect,_object:g.object});return;
    }
    if (kind === 'pen' && g.points.length < 5000) g.points.push(p);
    setDraft({ jenis: kind, halaman: page, x: Math.min(g.start.x,p.x), y: Math.min(g.start.y,p.y), lebar: Math.abs(p.x-g.start.x), tinggi: Math.abs(p.y-g.start.y), points: [...g.points] });
  };
  const end = event => {
    if (!gesture.current) return;
    const g = gesture.current, p = point(event); gesture.current = null; setDraft(null);
    if(g.object!==undefined){
      if(draft?._object===g.object)put(items.map((item,i)=>i===g.object?Object.fromEntries(Object.entries(draft).filter(([key])=>key!=='_object')):item));
      return;
    }
    const rect = { x: Math.min(g.start.x,p.x), y: Math.min(g.start.y,p.y), lebar: Math.abs(p.x-g.start.x), tinggi: Math.abs(p.y-g.start.y) };
    if (rect.lebar < 1 || rect.tinggi < 1) { rect.x=g.start.x; rect.y=g.start.y; rect.lebar=Math.min(mode==='redact'?40:35,100-rect.x); rect.tinggi=Math.min(kind==='image'?25:10,100-rect.y); }
    if (rect.lebar < 0.1 || rect.tinggi < 0.1) return;
    const item = { jenis: kind, halaman: page, ...rect, warna: color };
    if (kind === 'pen') { if (g.points.length < 2) return; item.points=g.points; }
    if (mode === 'form') { if (!label.trim()) return; item.nama=label.trim(); setLabel(`medan_${items.length+2}`); }
    else if (kind === 'text') { if (!label.trim()) return; item.teks=label; item.saiz=size; }
    else if (kind === 'image') item.data=picture;
    if(mode==='crop')put([...items.filter(i=>i.halaman!==page),item]);else put([...items,item]);
    setObjects(mode==='crop'?null:items.length);
  };
  const chooseImage = event => {
    const image = event.target.files?.[0]; if (!image) return;
    if (!['image/png','image/jpeg'].includes(image.type) || image.size > 3*1024*1024) { setError('Pilih PNG/JPG maksimum 3 MB.'); return; }
    const reader = new FileReader(); reader.onload=()=>{setPicture(reader.result);setError('');}; reader.readAsDataURL(image);
  };
  const objectStart=(event,index,resize=false)=>{
    event.stopPropagation();event.preventDefault();surface.current.setPointerCapture(event.pointerId);
    setObjects(index);setSelection(null);gesture.current={start:point(event),object:index,resize,original:items[index]};
  };
  const drawn = items.map((item,index)=>({...item,_index:index})).filter(i=>i.halaman===page&&draft?._object!==i._index); if (draft) drawn.push(draft);
  const active = selection ? { ...selection, ...changeFor(selection) } : null;
  const toolKinds = mode==='crop'?['crop']:mode==='redact' ? ['redact'] : mode==='form' ? ['text','checkbox'] : mode==='fill'?['fields','select','arrange','text','image','pen','highlight','box']:['select','arrange','text','image','pen','highlight','box'];
  const hits = (layout?.[unit] || []).filter(w=>!search || w.teks.toLocaleLowerCase().includes(search.toLocaleLowerCase()));
  const sourceStyle = source => ({ left:`${source.x}%`, top:`${source.y}%`, width:`${source.lebar}%`, height:`${source.tinggi}%` });
  return <section className="pdf-editor mt-5" aria-label="Editor PDF">
    <div className="editor-toolbar">
      <div className="flex flex-wrap gap-1">
        {toolKinds.map(tool=>{const Icon=icons[tool]||MousePointer2;return <button type="button" key={tool} title={labels[tool]} className={`editor-tool ${kind===tool?'active':''}`} onClick={()=>{setKind(tool);setSelection(null);setObjects(null);setError('');}}><Icon size={17}/><span>{mode==='form'&&tool==='text'?'Medan teks':labels[tool]}</span></button>;})}
      </div>
      <div className="flex gap-1">
        <button type="button" className="editor-tool" disabled={!history.current.undo.length} onClick={()=>travel('undo')} title="Undo (Ctrl+Z)"><Undo2 size={17}/>Undo</button>
        <button type="button" className="editor-tool" disabled={!history.current.redo.length} onClick={()=>travel('redo')} title="Redo"><Redo2 size={17}/>Redo</button>
        {onSave&&<button type="button" className="btn-utama !px-3 !py-2 text-sm" disabled={!items.length&&!Object.keys(filled).length} onClick={onSave}>Simpan PDF</button>}
      </div>
    </div>
    <div className="editor-controls">
      {kind==='select' ? <>
        <label>Pilih<select className="medan" value={unit} onChange={e=>{setUnit(e.target.value);setSelection(null);}}><option value="words">Perkataan</option><option value="lines">Seluruh baris</option></select></label>
        <label className="flex-1">Cari pada halaman<input className="medan" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari perkataan…"/></label>
      </> : <>
        {(kind==='text'||mode==='form')&&<label className="flex-1">{mode==='form'?'Nama medan':'Teks untuk ditambah'}<input className="medan" value={label} onChange={e=>setLabel(e.target.value)}/></label>}
        {kind==='text'&&mode!=='form'&&<><label>Saiz<input className="medan w-20" type="number" min="6" max="72" value={size} onChange={e=>setSize(Number(e.target.value))}/></label><label>Warna<input aria-label="Warna teks baharu" type="color" value={color} onChange={e=>setColor(e.target.value)}/></label></>}
        {kind==='image'&&<label>Muat naik gambar / tandatangan<input aria-label="Muat naik gambar atau tandatangan" type="file" accept="image/png,image/jpeg" onChange={chooseImage}/>{picture&&<span className="text-emerald-700">Gambar sedia — klik atau seret pada PDF, kemudian guna Alih / ubah saiz.</span>}</label>}
      </>}
    </div>
    <div className="flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2">
      <div className="flex items-center gap-2"><button type="button" className="editor-tool" disabled={page<=1} onClick={()=>setPage(page-1)}>‹</button><label className="text-sm">Halaman <select aria-label="Halaman editor" className="rounded border p-1" value={page} onChange={e=>setPage(Number(e.target.value))}>{Array.from({length:doc?.numPages||1},(_,i)=><option key={i} value={i+1}>{i+1}</option>)}</select> / {doc?.numPages||1}</label><button type="button" className="editor-tool" disabled={page>=(doc?.numPages||1)} onClick={()=>setPage(page+1)}>›</button></div>
      <div className="flex items-center gap-2"><button type="button" className="editor-tool" aria-label="Kecilkan" disabled={zoom<=75} onClick={()=>setZoom(zoom-25)}><ZoomOut size={16}/></button><span className="text-sm">{zoom}%</span><button type="button" className="editor-tool" aria-label="Besarkan" disabled={zoom>=200} onClick={()=>setZoom(zoom+25)}><ZoomIn size={16}/></button></div>
    </div>
    <p className="px-3 py-2 text-sm text-gray-600">{mode==='crop'?'Seret kotak kawasan yang mahu dikekalkan. Tarik kotak atau penjuru untuk melaras. Pilih halaman lain untuk crop berasingan.':kind==='fields'?'Klik medan pada borang dan isi terus. Gunakan Tambah teks atau Edit perkataan untuk PDF tanpa medan.':kind==='arrange'?'Seret gambar/kotak yang ditambah untuk mengalih. Tarik penjuru untuk mengubah saiz.':mode==='redact'?'Seret kawasan sulit untuk disensor.':mode==='form'?'Pilih jenis medan dan seret pada halaman.':kind==='select'?'Klik perkataan dalam PDF dan terus taip untuk menggantikannya. Pilih “Seluruh baris” untuk teks yang lebih panjang.':'Klik atau seret pada halaman untuk meletakkan kandungan.'}</p>
    {(error||openError)&&<p role="alert" className="mx-3 mb-2 rounded bg-red-50 p-2 text-sm text-red-700">{error||openError}</p>}
    {kind==='select'&&checking&&<p className="px-3 text-sm text-gray-500">Mengenal pasti perkataan pada halaman…</p>}
    {kind==='select'&&layoutError&&<p role="alert" className="px-3 pb-2 text-sm text-red-700">{layoutError} Anda masih boleh menggunakan Tambah teks.</p>}
    {kind==='select'&&layout&&!layout.words.length&&<p className="px-3 pb-3 text-sm text-amber-700">Tiada perkataan boleh dipilih. Jika PDF ialah gambar/imbasan, <Link className="underline" to="/alat/ocr-pdf">jalankan OCR dahulu</Link>. Perkataan dalam gambar dan teks bersudut tidak boleh disunting melalui mod ini.</p>}
    <div className="editor-body">
      <div className="editor-scroll">
        {!ready&&!openError&&<p className="p-5 text-gray-500">Memuatkan PDF…</p>}
        <div ref={surface} aria-label="Paparan PDF" className="editor-page" style={{ width:`${zoom}%`, aspectRatio:`${dims.width}/${dims.height}`, cursor:kind==='select'?'default':'crosshair', touchAction:kind==='select'?'auto':'none' }} onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={()=>{gesture.current=null;setDraft(null);}}>
          <canvas ref={canvas} className="block h-full w-full"/>
          <svg viewBox={`0 0 ${dims.width} ${dims.height}`} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
            {drawn.map((item,i)=>{
              const x=item.x*dims.width/100,y=item.y*dims.height/100,w=item.lebar*dims.width/100,h=item.tinggi*dims.height/100;
              if(item.jenis==='crop')return <g key={i}><path d={`M0 0H${dims.width}V${dims.height}H0Z M${x} ${y}V${y+h}H${x+w}V${y}Z`} fill="#111827" fillOpacity="0.45" fillRule="evenodd"/><rect x={x} y={y} width={w} height={h} fill="none" stroke="#22c55e" strokeWidth="2" strokeDasharray="6 3"/></g>;
              if(originalChange(item)) return <g key={i}><rect x={x} y={y} width={w} height={h} fill="white"/><rect x={x} y={y} width={w} height={h} fill={item.jenis==='delete-text'?'#fee2e2':'#dbeafe'} fillOpacity="0.25"/>{item.jenis==='replace-text'&&<text x={(item.origin_x??item.x)*dims.width/100} y={(item.origin_y??(item.y+item.tinggi*0.8))*dims.height/100} fill={item.warna} fontWeight={item.bold?'bold':'normal'} fontStyle={item.italic?'italic':'normal'} transform={`rotate(${item.rotation||0} ${(item.origin_x??item.x)*dims.width/100} ${(item.origin_y??(item.y+item.tinggi*0.8))*dims.height/100})`} fontSize={item.saiz} textLength={Math.min(item.rotation%180?h:w,item.teks.length*item.saiz*0.6)} lengthAdjust="spacingAndGlyphs">{item.teks}</text>}</g>;
              if(item.jenis==='pen') return <polyline key={i} points={item.points?.map(p=>`${p.x*dims.width/100},${p.y*dims.height/100}`).join(' ')} fill="none" stroke="black" strokeWidth="2"/>;
              if(item.jenis==='image') return <image key={i} href={item.data} x={x} y={y} width={w} height={h}/>;
              return <g key={i}><rect x={x} y={y} width={w} height={h} fill={mode==='redact'?'black':item.jenis==='highlight'?'#facc15':'#dbeafe'} fillOpacity={mode==='redact'?1:0.25} stroke={mode==='redact'?'black':'#2563eb'} strokeWidth="1"/>{(item.teks||item.nama)&&<text x={x+2} y={y+(item.saiz||12)} fontSize={item.saiz||12} fill={item.warna||'black'}>{item.teks||item.nama}</text>}</g>;
            })}
          </svg>
          {(kind==='arrange'||mode==='crop')&&items.map((item,index)=>item.halaman===page&&!originalChange(item)&&item.jenis!=='pen'&&<div key={index} className="pdf-object" style={sourceStyle(draft?._object===index?draft:item)} onPointerDown={e=>objectStart(e,index)} aria-label={`Alih ${labels[item.jenis]||'objek'}`}>
            <button type="button" className="pdf-resize" aria-label={`Ubah saiz ${labels[item.jenis]||'objek'}`} onPointerDown={e=>objectStart(e,index,true)}/>
          </div>)}
          {kind==='fields'&&widgets.map((widget,i)=>{
            const meta=fields.find(f=>f.nama===widget.name);if(!meta||meta.readonly||![2,3,4,7].includes(meta.type))return null;
            const style={...sourceStyle(widget),fontSize:'1.8cqw'};
            if(meta.type===2)return <input key={i} aria-label={`Borang: ${widget.name}`} className="pdf-form-field" style={style} type="checkbox" checked={filled[widget.name]==='ya'} onChange={e=>fillField(widget.name,e.target.checked?'ya':'tidak')}/>;
            if(meta.choices?.length)return <select key={i} aria-label={`Borang: ${widget.name}`} className="pdf-form-field" style={style} value={filled[widget.name]||''} onChange={e=>fillField(widget.name,e.target.value)}><option value="">Pilih…</option>{meta.choices.map(c=><option key={c} value={c}>{c}</option>)}</select>;
            const props={'aria-label':`Borang: ${widget.name}`,className:'pdf-form-field',style,value:filled[widget.name]||'',onChange:e=>fillField(widget.name,e.target.value)};
            return widget.multiline?<textarea key={i} {...props}/>:<input key={i} {...props}/>;
          })}
          {kind==='select'&&ready&&hits.map(source=><button type="button" key={source.id} className={`pdf-word ${selection?.id===source.id?'selected':''} ${search?'search-match':''}`} style={sourceStyle(source)} title={`Edit: ${source.teks}`} aria-label={`Edit ${source.teks}`} onClick={()=>select(source)}/>)}
          {selection&&kind==='select'&&!selection.rotation&&<input key={selection.id} aria-label="Edit teks terus pada PDF" className="pdf-inline-input" style={{...sourceStyle(active),height:`${Math.max(active.tinggi,active.saiz/dims.height*150)}%`,fontSize:`${active.saiz/dims.width*100}cqw`,color:active.warna}} value={active.teks} onChange={e=>patchText({teks:e.target.value,jenis:'replace-text'})} onKeyDown={e=>{if(e.key==='Enter'||e.key==='Escape')setSelection(null);}} autoFocus/>}
        </div>
      </div>
      {objects!==null&&items[objects]&&<aside className="editor-inspector"><h3 className="font-bold">{labels[items[objects].jenis]||'Objek dipilih'}</h3><p className="text-xs text-gray-500">Seret untuk alih; tarik penjuru untuk ubah saiz.</p>
        {['x','y','lebar','tinggi'].map(key=><label key={key}>{({x:'Dari kiri',y:'Dari atas',lebar:'Lebar',tinggi:'Tinggi'})[key]} (%)<input className="medan" type="number" step="0.5" min={key==='x'||key==='y'?0:1} max="100" value={Number(items[objects][key].toFixed(2))} onChange={e=>put(items.map((item,i)=>i===objects?{...item,[key]:Number(e.target.value)}:item))}/></label>)}
        <label>Halaman<select className="medan" value={items[objects].halaman} onChange={e=>{put(items.map((item,i)=>i===objects?{...item,halaman:Number(e.target.value)}:item));setPage(Number(e.target.value));}}>{Array.from({length:doc?.numPages||1},(_,i)=><option key={i} value={i+1} disabled={mode==='crop'&&items.some((item,n)=>n!==objects&&item.halaman===i+1)}>{i+1}</option>)}</select></label>
        {mode!=='crop'&&<button type="button" className="btn-lembut" onClick={()=>{put([...items,{...items[objects],x:Math.min(100-items[objects].lebar,items[objects].x+3),y:Math.min(100-items[objects].tinggi,items[objects].y+3)}]);setObjects(items.length);}}>Salin objek</button>}
        <button type="button" className="editor-tool text-red-700" onClick={()=>{put(items.filter((_,i)=>i!==objects));setObjects(null);}}>Padam objek</button>
      </aside>}
      {active&&<aside className="editor-inspector">
        <h3 className="font-bold">Edit teks dipilih</h3><p className="mt-1 break-words text-xs text-gray-500">Asal: {selection.teks}</p>
        {selection.scan&&<p className="rounded bg-amber-50 p-2 text-xs text-amber-800">Teks OCR: bahagian gambar perkataan ini akan diganti dengan latar putih. Semak hasil jika kertas asal berwarna.</p>}
        <label>Teks<input className="medan" value={active.teks} onChange={e=>patchText({teks:e.target.value,jenis:'replace-text'})}/></label>
        <label>Saiz huruf<input className="medan" type="number" min="4" max="144" value={active.saiz} onChange={e=>patchText({saiz:Number(e.target.value)})}/></label>
        {!selection.rotation&&<label>Lebar kawasan (%)<input className="medan" type="number" min="0.1" max="100" step="0.1" value={Number(active.lebar.toFixed(2))} onChange={e=>patchText({lebar:Number(e.target.value)})}/></label>}
        <label>Font<select className="medan" value={active.font_family||'auto'} onChange={e=>patchText({font_family:e.target.value})}><option value="auto">Hampir sama dengan asal</option><option value="sans">Arial / sans</option><option value="serif">Times / serif</option><option value="mono">Courier / mono</option></select></label>
        <div className="flex gap-3"><label><input type="checkbox" checked={active.bold} onChange={e=>patchText({bold:e.target.checked})}/> Tebal</label><label><input type="checkbox" checked={active.italic} onChange={e=>patchText({italic:e.target.checked})}/> Condong</label></div>
        <label>Warna<input type="color" value={active.warna} onChange={e=>patchText({warna:e.target.value})}/></label>
        <button type="button" className="editor-tool text-red-700" onClick={deleteText}><Trash2 size={16}/>Padam perkataan / baris</button>
        <button type="button" className="btn-lembut text-sm" onClick={()=>setSelection(null)}>Selesai edit teks</button>
        <p className="text-xs text-gray-500">Teks panjang dikecilkan supaya muat. Font asal mungkin diganti. Semak pratonton hasil sebelum muat turun.</p>
      </aside>}
    </div>
    <div className="border-t p-3">
      <p className="text-sm font-semibold">{items.length} perubahan · {drawn.length} pada halaman ini</p>
      {items.length>0&&<details className="mt-2"><summary className="cursor-pointer text-sm text-gray-600">Lihat / buang perubahan</summary><div className="mt-2 max-h-48 space-y-1 overflow-auto">{items.map((item,i)=><div key={i} className="flex items-center justify-between gap-2 rounded bg-gray-50 p-2 text-sm"><button type="button" className="truncate text-left" onClick={()=>setPage(item.halaman)}>H{item.halaman}: {item.jenis==='delete-text'?`Padam “${item.asal}”`:item.asal?`${item.asal} → ${item.teks}`:item.nama||item.teks||labels[item.jenis]}</button><button type="button" className="text-red-700" aria-label={`Buang perubahan ${i+1}`} onClick={()=>{put(items.filter((_,n)=>n!==i));setSelection(null);}}>Buang</button></div>)}</div></details>}
    </div>
  </section>;
}
