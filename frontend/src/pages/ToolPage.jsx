import { useMemo, useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { toolBySlug } from "../config/tools.js";
import { Dropzone, FileList } from "../components/Dropzone.jsx";
import { ProgressBar } from "../components/ui.jsx";
import { api } from "../services/api.js";
import { useToast } from "../components/Toast.jsx";
import { Download, RefreshCw, ArrowLeft, CheckCircle2, Settings2, Clock } from "lucide-react";
import PdfEditor from "../components/PdfEditor.jsx";
import PdfPages from "../components/PdfPages.jsx";
import InvoiceItems from "../components/InvoiceItems.jsx";
import FormFields from "../components/FormFields.jsx";
import { ikonAlat } from "../config/icons.js";

export default function ToolPage() {
  const { slug } = useParams();
  const tool = toolBySlug(slug);
  const toast = useToast();

  const [fail, setFail] = useState([]);
  const [pilihan, setPilihan] = useState({});
  const [peringkat, setPeringkat] = useState("pilih"); // pilih | proses | siap
  const [kemajuan, setKemajuan] = useState(0);
  const [hasil, setHasil] = useState(null);
  const [ralat, setRalat] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [resultBytes, setResultBytes] = useState(0);
  const [textResult,setTextResult]=useState(''),[jobStatus,setJobStatus]=useState('proses'),[elapsed,setElapsed]=useState(0);
  const currentRequest=useRef(null);
  useEffect(()=>{
    if(peringkat!=='proses')return;
    const started=Date.now();setElapsed(0);
    const timer=setInterval(()=>setElapsed(Math.floor((Date.now()-started)/1000)),1000);
    return()=>clearInterval(timer);
  },[peringkat]);

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  const Icon = useMemo(() => (tool ? ikonAlat(tool.icon) : null), [tool]);
  const warna = tool?.warna || "#E12128";

  // SEO: kemas kini tajuk & penerangan halaman ikut alat
  useEffect(() => {
    if (tool) {
      document.title = `${tool.nama} — Semua Boleh PDF`;
      const desc = document.querySelector('meta[name="description"]');
      if (desc) desc.setAttribute("content", `${tool.penuh || tool.ringkas} Percuma dan mudah, dalam Bahasa Melayu.`);
    }
    return () => {
      document.title = "Semua Boleh PDF — Alat PDF Percuma Dalam Bahasa Melayu";
    };
  }, [tool]);

  useEffect(() => {
    setFail([]); setPilihan({}); setHasil(null); setRalat(""); setPeringkat("pilih"); setKemajuan(0); setPreviewUrl(null); setResultBytes(0); setTextResult('');
    return()=>currentRequest.current?.abort();
  }, [slug]);

  if (!tool) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="font-papar text-2xl font-bold">Alat tidak dijumpai</h1>
        <p className="mt-2 text-gray-500">Maaf, alat yang anda cari tidak wujud.</p>
        <Link to="/alat" className="btn-utama mt-6">Lihat Semua Alat</Link>
      </div>
    );
  }

  const bolehSusun = tool.multiple;
  const maxFiles = tool.maxFiles || (tool.multiple ? 30 : 1);
  const minFiles = tool.minFiles ?? (tool.op === "gabung" ? 2 : 1);
  const pageMode = ({ 'padam-halaman': 'delete', 'ekstrak-halaman': 'extract', 'susun-halaman': 'reorder', 'putar-pdf': 'rotate' })[slug];
  const pageKey = pageMode === 'reorder' ? 'susunan' : 'halaman';
  const shownOptions = (tool.options || []).filter(o => !(pageMode && o.key === pageKey) && !(slug === 'isi-borang-pdf' && o.key === 'data') && !(slug === 'cipta-invois' && o.key === 'item') && !(slug === 'pisah-pdf' && o.key === 'julat' && pilihan._split !== 'custom'));

  const tambahFail = (baru) => {
    setPreviewUrl(null); setHasil(null);
    setRalat("");
    setFail((sedia) => {
      const gabung = tool.multiple ? [...sedia, ...baru] : baru.slice(0, 1);
      return gabung.slice(0, maxFiles);
    });
  };
  const buangFail = (i) => setFail((s) => s.filter((_, idx) => idx !== i));
  const susunFail = (dari, ke) =>
    setFail((s) => {
      const salin = [...s];
      const [item] = salin.splice(dari, 1);
      salin.splice(ke, 0, item);
      return salin;
    });

  const ubahPilihan = (key, nilai) => setPilihan((p) => ({ ...p, [key]: nilai }));

  const proses = async () => {
    if (!fail.length && minFiles > 0) {
      setRalat("Sila pilih sekurang-kurangnya satu fail.");
      return;
    }
    if (fail.length < minFiles) {
      setRalat(`Alat ini memerlukan sekurang-kurangnya ${minFiles} fail.`);
      return;
    }
    // Gabungkan pilihan pengguna + medan 'extra' tetap daripada config.
    // Isi nilai lalai untuk menu pilihan (supaya sepadan dengan yang dipaparkan).
    const lalai = {};
    for (const o of tool.options || []) {
      if (o.default !== undefined) lalai[o.key] = o.default;
      else if (o.jenis === "select" && o.pilihan?.length) lalai[o.key] = o.pilihan[0].nilai;
    }
    const hantaran = { ...lalai, ...(tool.extra || {}), ...pilihan };
    delete hantaran._split;
    if (pageMode && !String(hantaran[pageKey] || '').trim()) { setRalat('Pilih sekurang-kurangnya satu halaman pada pratonton.'); return; }
    for (const o of tool.options || []) {
      if (o.required && !(slug==='isi-borang-pdf'&&o.key==='data') && !String(hantaran[o.key] ?? "").trim()) { setRalat(`Sila isi ${o.label}.`); return; }
    }
    if (tool.editor && JSON.parse(hantaran[tool.editor === "form" ? "medan" : "anotasi"] || "[]").length === 0 && !(tool.editor==='fill'&&Object.keys(JSON.parse(hantaran.field_values||'{}')).length)) {
      setRalat("Tambah sekurang-kurangnya satu kawasan, medan atau anotasi pada pratonton."); return;
    }
    setPeringkat("proses");
    setKemajuan(0);
    setJobStatus('proses');setTextResult('');
    setRalat("");
    const controller=new AbortController();currentRequest.current=controller;
    try {
      const data = await api.proses(slug, fail, hantaran, setKemajuan, status=>setJobStatus(status.status),controller.signal);
      if(controller.signal.aborted)return;
      setHasil(data);
      // Cache the result once: the server deletes outputs after their first download.
      setPreviewUrl(null);
      try {
        const response = await fetch(api.fullUrl(data.muat_turun),{signal:controller.signal});
        if (!response.ok) throw new Error('Muat turun hasil gagal.');
        const blob = await response.blob(); setResultBytes(blob.size);
        if(data.nama_fail?.endsWith('.txt'))setTextResult(await blob.text());
        setPreviewUrl(URL.createObjectURL(blob));
      } catch { if(controller.signal.aborted)return;setRalat('Pratonton hasil belum tersedia. Gunakan butang muat turun.'); }
      setPeringkat("siap");
      toast.berjaya("Fail berjaya diproses!");
    } catch (e) {
      if(controller.signal.aborted)return;
      setRalat(e.message || "Ralat semasa memproses fail.");
      setPeringkat("pilih");
      toast.ralat(e.message || "Gagal memproses fail.");
    }
  };

  const muatTurun = () => {
    if (!hasil?.muat_turun) return;
    const a = document.createElement("a");
    a.href = previewUrl || api.fullUrl(hasil?.muat_turun);
    a.download = hasil?.nama_fail || "hasil";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const semula = () => {
    setFail([]);
    setPilihan({});
    setHasil(null);
    setKemajuan(0);
    setRalat("");
    setPeringkat("pilih");
    setPreviewUrl(null); setResultBytes(0); setTextResult('');
  };

  const labelMuatTurun = (() => {
    const ext = (hasil?.nama_fail || "").split(".").pop()?.toUpperCase();
    if (ext && ext.length <= 4) return ext;
    return "Fail";
  })();

  return (
    <div className={`mx-auto ${tool.editor || pageMode ? 'max-w-6xl' : 'max-w-3xl'} px-4 py-10`}>
      <Link to="/alat" className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-merah">
        <ArrowLeft size={16} /> Semua Alat
      </Link>

      <div className="text-center">
        <span
          className="mx-auto grid h-16 w-16 place-items-center rounded-2xl"
          style={{ backgroundColor: `${warna}14`, color: warna }}
        >
          {Icon && <Icon size={32} />}
        </span>
        <h1 className="mt-4 font-papar text-3xl font-extrabold">{tool.nama}</h1>
        <p className="mx-auto mt-2 max-w-xl text-gray-500">{tool.penuh || tool.ringkas}</p>
      </div>

      <div className="kad mt-8 p-6">
        <ol className="mb-6 flex justify-center gap-5 text-xs sm:text-sm" aria-label="Langkah proses">
          {['Pilih fail / isi maklumat', 'Edit / tetapkan', 'Muat turun'].map((text,i)=><li key={i} className={peringkat==='siap'&&i===2||peringkat==='pilih'&&i===(fail.length||tool.noFile?1:0)?'font-bold text-merah':'text-gray-400'}>{i+1}. {text}</li>)}
        </ol>
        {tool.akanDatang ? (
          <div className="py-12 text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-amber-50 text-amber-600">
              <Clock size={34} />
            </span>
            <h2 className="mt-4 font-papar text-xl font-bold">Akan Datang</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              Alat ini sedang dalam pembangunan dan akan tersedia tidak lama lagi. Terima kasih atas
              kesabaran anda.
            </p>
            <Link to="/alat" className="btn-lembut mt-6 inline-flex">
              <ArrowLeft size={16} /> Lihat Alat Lain
            </Link>
          </div>
        ) : (
          <>
        {peringkat === "pilih" && (
          <>
            {!tool.noFile && <Dropzone compact={fail.length>0} accept={tool.accept} multiple={tool.multiple} onFiles={(files) => { tambahFail(files); if (tool.editor || pageMode || slug==='isi-borang-pdf') setPilihan({}); }} />}
            {tool.editor === "form" && <p className="mt-2 text-sm text-gray-500">Muat naik PDF sebagai templat, atau terus tambah medan pada halaman A4 kosong di bawah.</p>}
            {tool.editor && (fail.length > 0 || tool.editor === "form") && <PdfEditor key={`${slug}-${fail[0]?.name || "blank"}-${fail[0]?.lastModified || ''}`} file={fail[0]} mode={tool.editor} onSave={proses} initialKind={tool.initialKind} fieldValues={pilihan.field_values} onFieldChange={value=>ubahPilihan('field_values',value)} value={pilihan[tool.editor === "form" ? "medan" : "anotasi"]} onChange={(value) => ubahPilihan(tool.editor === "form" ? "medan" : "anotasi", value)} />}
            {pageMode && fail[0] && <PdfPages file={fail[0]} action={pageMode} value={pilihan[pageKey]} angle={pilihan.sudut||90} onChange={value=>ubahPilihan(pageKey,value)} />}

            {fail.length > 0 && (
              <FileList fail={fail} onRemove={buangFail} onReorder={susunFail} bolehSusun={bolehSusun} />
            )}

            {slug==='pisah-pdf' && fail.length>0 && <div className="mt-4 flex flex-wrap gap-2"><button type="button" className={pilihan._split!=='custom'?'btn-utama':'btn-lembut'} onClick={()=>setPilihan(p=>({...p,_split:'each',julat:''}))}>Setiap halaman menjadi satu PDF</button><button type="button" className={pilihan._split==='custom'?'btn-utama':'btn-lembut'} onClick={()=>ubahPilihan('_split','custom')}>Pilih kumpulan halaman</button></div>}
            {slug==='cipta-invois'&&<InvoiceItems value={pilihan.item} onChange={value=>ubahPilihan('item',value)}/>}
            {shownOptions.length > 0 && (fail.length > 0 || minFiles === 0) && (
              <div className="mt-6 rounded-xl bg-kabus p-4">
                <p className="mb-3 flex items-center gap-2 text-sm font-bold text-arang">
                  <Settings2 size={16} /> Tetapan
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {shownOptions.map((o) => (
                    <label key={o.key} className="block">
                      <span className="mb-1 block text-sm font-semibold text-gray-700">{o.label}</span>
                      {o.jenis === "select" ? (
                        <select
                          className="medan"
                          value={pilihan[o.key] ?? o.default ?? o.pilihan?.[0]?.nilai ?? ""}
                          onChange={(e) => ubahPilihan(o.key, e.target.value)}
                        >
                          {o.pilihan.map((p) => (
                            <option key={p.nilai} value={p.nilai}>{p.teks}</option>
                          ))}
                        </select>
                      ) : o.jenis === "textarea" ? (
                        <textarea className="medan" rows={5} placeholder={o.placeholder || ""} value={pilihan[o.key] ?? o.default ?? ""} onChange={(e) => ubahPilihan(o.key, e.target.value)} />
                      ) : (
                        <input
                          className="medan"
                          type={o.jenis === "number" ? "number" : o.jenis === "password" ? "password" : "text"}
                          placeholder={o.placeholder || ""}
                          value={pilihan[o.key] ?? o.default ?? ""}
                          min={o.min}
                          max={o.max}
                          onChange={(e) => ubahPilihan(o.key, e.target.value)}
                        />
                      )}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {ralat && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-merah">{ralat}</p>}

            <button onClick={proses} disabled={fail.length < minFiles} className="btn-utama mt-6 w-full text-base">
              {tool.editor ? 'Simpan & pratonton PDF' : tool.noFile ? "Cipta PDF" : tool.nama}
            </button>
          </>
        )}

        {peringkat === "proses" && (
          <div className="py-10 text-center">
            <p className="mb-4 font-papar text-lg font-bold">
              {kemajuan < 100 ? "Sedang Dimuat Naik…" : jobStatus==='menunggu' ? 'Menunggu giliran pelayan…' : "Sedang Diproses…"}
            </p>
            {kemajuan<100?<ProgressBar nilai={kemajuan}/>:<div className="mx-auto h-2 max-w-md overflow-hidden rounded bg-red-100" role="status" aria-label="Pemprosesan masih berjalan"><div className="process-indicator h-full w-1/3 rounded bg-merah"/></div>}
            <p className="mt-3 text-sm text-gray-500">Masa berlalu: {Math.floor(elapsed/60)} min {elapsed%60} saat.</p>
            <p className="mt-2 text-sm text-gray-500">{slug==='ocr-pdf'?'OCR membaca imej setiap halaman dan boleh mengambil beberapa minit. Untuk fail besar, pilih julat halaman.':'Fail besar dan penukaran dokumen boleh mengambil masa. Hasil akan dipaparkan apabila siap.'}</p>
          </div>
        )}

        {peringkat === "siap" && (
          <div className="py-8 text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={36} />
            </span>
            <h2 className="mt-4 font-papar text-xl font-bold">Fail berjaya diproses!</h2>
            <p className="mt-1 text-sm text-gray-500">Semak hasil dan klik Muat Turun untuk menyimpan ke komputer anda.</p>
            {resultBytes>0&&<p className="mt-2 text-sm font-semibold">Saiz hasil: {(resultBytes/1024).toFixed(1)} KB{['mampat-pdf','optimize-pdf'].includes(slug)&&fail[0]?.size>0&&` · ${resultBytes<fail[0].size?'Berkurang':'Bertambah'} ${Math.abs((1-resultBytes/fail[0].size)*100).toFixed(1)}%`}</p>}
            {ralat&&<p className="mt-2 text-sm text-amber-700">{ralat}</p>}
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <button onClick={muatTurun} className="btn-utama">
                <Download size={18} /> Muat Turun {labelMuatTurun}
              </button>
              <button onClick={semula} className="btn-lembut">
                <RefreshCw size={18} /> Proses Fail Lain
              </button>
              <button onClick={()=>{setRalat('');setPeringkat('pilih');}} className="btn-lembut">{tool.editor?'Sambung edit':'Ubah tetapan'}</button>
            </div>
            {previewUrl && labelMuatTurun==='PDF' && <iframe title="Pratonton PDF hasil" src={previewUrl} className="mt-6 h-[650px] w-full rounded-xl border bg-gray-100" />}
            {previewUrl&&labelMuatTurun==='HTML'&&<iframe title="Laporan perbandingan PDF" sandbox="" src={previewUrl} className="mt-6 h-[700px] w-full rounded-xl border bg-gray-100"/>}
            {textResult&&<section className="mt-6 text-left"><div className="mb-3 flex items-center justify-between"><h2 className="font-bold">Teks mengikut halaman</h2><button type="button" className="btn-lembut text-sm" onClick={async()=>{try{await navigator.clipboard.writeText(textResult);toast.berjaya('Teks disalin.');}catch{setRalat('Pilih dan salin teks dalam pratonton secara manual.');}}}>Salin teks</button></div><pre className="max-h-[650px] overflow-auto whitespace-pre-wrap rounded-xl border bg-gray-50 p-5 font-mono text-sm leading-relaxed">{textResult}</pre></section>}
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
}
