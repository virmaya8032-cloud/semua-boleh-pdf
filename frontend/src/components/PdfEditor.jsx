import { useEffect, useMemo, useRef, useState } from "react";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

export default function PdfEditor({ file, mode, value, onChange }) {
  const canvas = useRef(null);
  const surface = useRef(null);
  const gesture = useRef(null);
  const [doc, setDoc] = useState(null);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(1);
  const [dims, setDims] = useState({ width: 595, height: 842 });
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [kind, setKind] = useState(mode === "form" ? "text" : mode === "redact" ? "redact" : "text");
  const [label, setLabel] = useState(mode === "form" ? "nama" : "Teks anda");
  const [size, setSize] = useState(14);
  const [picture, setPicture] = useState("");
  const [draft, setDraft] = useState(null);
  const items = useMemo(() => { try { return JSON.parse(value || "[]"); } catch { return []; } }, [value]);
  const put = (next) => onChange(JSON.stringify(next));

  useEffect(() => {
    let stopped = false, task;
    setDoc(null); setPage(1); setCount(1); setError(""); setReady(false);
    if (!file) return () => { stopped = true; };
    (async () => {
      const pdf = await import("pdfjs-dist/build/pdf.mjs");
      pdf.GlobalWorkerOptions.workerSrc = workerUrl;
      const data = new Uint8Array(await file.arrayBuffer());
      if (stopped) return;
      task = pdf.getDocument({ data });
      const opened = await task.promise;
      if (stopped) { await opened.destroy(); return; }
      setDoc(opened); setCount(opened.numPages);
    })().catch(() => { if (!stopped) setError("Pratonton gagal. Gunakan PDF yang sah dan tidak berkunci."); });
    return () => { stopped = true; task?.destroy().catch(() => {}); };
  }, [file]);

  useEffect(() => {
    let stopped = false, render;
    setReady(false);
    if (file && !doc) return;
    (async () => {
      if (!doc) {
        canvas.current.width = 595; canvas.current.height = 842;
        const ctx = canvas.current.getContext("2d");
        ctx.fillStyle = "white"; ctx.fillRect(0, 0, 595, 842);
        setDims({ width: 595, height: 842 }); setReady(true);
        return;
      }
      const pdfPage = await doc.getPage(page);
      if (stopped) return;
      const natural = pdfPage.getViewport({ scale: 1 });
      const viewport = pdfPage.getViewport({ scale: Math.min(1.5, 900 / natural.width) });
      const ctx = canvas.current.getContext("2d");
      canvas.current.width = viewport.width; canvas.current.height = viewport.height;
      setDims({ width: natural.width, height: natural.height });
      render = pdfPage.render({ canvasContext: ctx, viewport });
      await render.promise;
      if (!stopped) setReady(true);
    })().catch((e) => { if (!stopped && e.name !== "RenderingCancelledException") setError("Halaman tidak dapat dipratonton."); });
    return () => { stopped = true; render?.cancel(); };
  }, [doc, page, file]);

  const point = (event) => {
    const rect = surface.current.getBoundingClientRect();
    return { x: Math.max(0, Math.min(100, (event.clientX - rect.left) / rect.width * 100)), y: Math.max(0, Math.min(100, (event.clientY - rect.top) / rect.height * 100)) };
  };
  const start = (event) => {
    if (!ready || error) return;
    event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId);
    const p = point(event);
    gesture.current = { start: p, points: [p] };
  };
  const move = (event) => {
    if (!gesture.current) return;
    const p = point(event), g = gesture.current;
    if (kind === "pen") g.points.push(p);
    setDraft({ jenis: kind, halaman: page, x: Math.min(g.start.x, p.x), y: Math.min(g.start.y, p.y), lebar: Math.abs(p.x - g.start.x), tinggi: Math.abs(p.y - g.start.y), points: [...g.points] });
  };
  const end = (event) => {
    if (!gesture.current) return;
    const g = gesture.current, p = point(event);
    gesture.current = null; setDraft(null);
    const rect = { x: Math.min(g.start.x, p.x), y: Math.min(g.start.y, p.y), lebar: Math.abs(p.x-g.start.x), tinggi: Math.abs(p.y-g.start.y) };
    if (rect.lebar < 1 || rect.tinggi < 1) {
      rect.x = g.start.x; rect.y = g.start.y;
      rect.lebar = Math.min(mode === "redact" ? 40 : 35, 100 - rect.x);
      rect.tinggi = Math.min(kind === "image" ? 25 : 10, 100 - rect.y);
    }
    if (rect.lebar < 0.1 || rect.tinggi < 0.1) return;
    const item = { jenis: kind, halaman: page, ...rect };
    if (kind === "pen") {
      if (g.points.length < 2) return;
      item.points = g.points.slice(0, 5000);
    }
    if (mode === "form") {
      if (!label.trim()) { setError("Isi nama medan dahulu."); return; }
      item.nama = label.trim();
      setLabel(`medan_${items.length + 2}`);
    } else if (kind === "text") {
      if (!label.trim()) return;
      item.teks = label; item.saiz = size;
    } else if (kind === "image") {
      if (!picture) { setError("Pilih gambar PNG/JPG dahulu."); return; }
      item.data = picture;
    }
    setError(""); put([...items, item]);
  };
  const chooseImage = async (event) => {
    const image = event.target.files?.[0];
    if (!image) return;
    if (!["image/png", "image/jpeg"].includes(image.type) || image.size > 3 * 1024 * 1024) { setError("Pilih PNG/JPG maksimum 3 MB."); return; }
    const reader = new FileReader();
    reader.onload = () => { setPicture(reader.result); setError(""); };
    reader.readAsDataURL(image);
  };
  const drawn = items.map((item, index) => ({ ...item, index })).filter((item) => item.halaman === page);
  if (draft) drawn.push(draft);
  return <div className="mt-5 rounded-xl border border-gray-200 p-4">
    <h2 className="font-bold">{mode === "form" ? "Letak medan borang" : mode === "redact" ? "Pilih kawasan untuk disensor" : "Editor PDF"}</h2>
    <p className="mt-1 text-sm text-gray-500">{mode === "redact" ? "Seret kotak pada kawasan sulit. Pemprosesan membuang kandungan di dalam kotak hitam." : "Pilih alat, kemudian klik atau seret pada halaman. Seret untuk menentukan saiz kotak."}</p>
    <div className="mt-3 flex flex-wrap items-end gap-3">
      {mode !== "redact" && <label className="text-sm">Alat<select className="medan mt-1" value={kind} onChange={(e) => setKind(e.target.value)}>
        {mode === "form" ? <><option value="text">Medan teks</option><option value="checkbox">Kotak semak</option></> : <><option value="text">Teks</option><option value="highlight">Sorotan</option><option value="box">Kotak</option><option value="pen">Lukisan / tandatangan</option><option value="image">Gambar</option></>}
      </select></label>}
      {(kind === "text" || mode === "form") && <label className="flex-1 text-sm">{mode === "form" ? "Nama medan (unik)" : "Teks"}<input className="medan mt-1" value={label} onChange={(e) => setLabel(e.target.value)} /></label>}
      {kind === "text" && mode !== "form" && <label className="text-sm">Saiz (pt)<input className="medan mt-1 w-20" type="number" min="6" max="72" value={size} onChange={(e) => setSize(Number(e.target.value))} /></label>}
      {kind === "image" && <input type="file" accept="image/png,image/jpeg" onChange={chooseImage} />}
    </div>
    <div className="my-3 flex items-center justify-between gap-2">
      <button type="button" className="btn-lembut" disabled={page <= 1} onClick={() => setPage(page-1)}>Sebelum</button>
      <span className="text-sm">Halaman {page} / {count}</span>
      <button type="button" className="btn-lembut" disabled={page >= count} onClick={() => setPage(page+1)}>Seterusnya</button>
    </div>
    {error && <p role="alert" className="my-2 text-sm text-red-600">{error}</p>}
    {!ready && !error && <p className="py-3 text-sm text-gray-500">Memuatkan pratonton…</p>}
    <div ref={surface} className="relative mx-auto border border-gray-300 bg-white" style={{ maxWidth: 650, aspectRatio: `${dims.width}/${dims.height}`, cursor: ready ? "crosshair" : "wait", touchAction: "none" }} onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={() => { gesture.current = null; setDraft(null); }}>
      <canvas ref={canvas} className="block h-full w-full" />
      <svg viewBox={`0 0 ${dims.width} ${dims.height}`} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
        {drawn.map((item,i) => {
          const x=item.x*dims.width/100, y=item.y*dims.height/100, w=item.lebar*dims.width/100, h=item.tinggi*dims.height/100;
          if (item.jenis === "pen") return <polyline key={i} points={item.points?.map(p => `${p.x*dims.width/100},${p.y*dims.height/100}`).join(" ")} fill="none" stroke="black" strokeWidth="2" />;
          if (item.jenis === "image") return <image key={i} href={item.data} x={x} y={y} width={w} height={h} />;
          return <g key={i}>
            <rect x={x} y={y} width={w} height={h} fill={mode === "redact" ? "black" : item.jenis === "highlight" ? "#facc15" : "#dbeafe"} fillOpacity={mode === "redact" ? 1 : 0.3} stroke={mode === "redact" ? "black" : "#2563eb"} strokeWidth="1" />
            {(item.teks || item.nama) && <text x={x+2} y={y+(item.saiz || 12)} fontSize={item.saiz || 12} fill="black">{item.teks || item.nama}</text>}
          </g>;
        })}
      </svg>
    </div>
    <p className="mt-2 text-xs text-gray-500">Pratonton kedudukan adalah anggaran; semak fail hasil selepas diproses.</p>
    {items.length > 0 && <div className="mt-3 space-y-2">
      {items.map((item,i) => <div key={i} className="flex items-center justify-between gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm"><span>{i+1}. Halaman {item.halaman}: {item.nama || item.teks || ({ redact: "Sensor", pen: "Lukisan", box: "Kotak", highlight: "Sorotan", image: "Gambar" }[item.jenis])}</span><button type="button" className="text-red-600" onClick={() => put(items.filter((_,n) => n !== i))}>Buang</button></div>)}
      <button type="button" className="btn-lembut" onClick={() => put([])}>Kosongkan semua</button>
    </div>}
  </div>;
}
