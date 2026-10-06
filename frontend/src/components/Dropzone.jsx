import { useRef, useState } from "react";
import { UploadCloud, File as FileIcon, X, GripVertical, ArrowUp, ArrowDown } from "lucide-react";

function saizManusia(bait) {
  if (bait < 1024) return `${bait} B`;
  if (bait < 1024 * 1024) return `${(bait / 1024).toFixed(1)} KB`;
  return `${(bait / 1024 / 1024).toFixed(1)} MB`;
}

export function Dropzone({ accept, multiple, onFiles, compact = false }) {
  const input = useRef(null);
  const [seret, setSeret] = useState(false);
  const [error, setError] = useState('');

  const pilih = (senarai) => {
    const arr = Array.from(senarai || []);
    const types = String(accept || '').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean);
    const valid = arr.filter(file=>!types.length||types.some(type=>type.startsWith('.')?file.name.toLowerCase().endsWith(type):type.endsWith('/*')?file.type.startsWith(type.slice(0,-1)):file.type===type));
    setError(valid.length<arr.length?'Sebahagian fail tidak sesuai. Format diterima: '+accept:'');
    if (valid.length) onFiles(valid);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setSeret(true); }}
      onDragLeave={() => setSeret(false)}
      onDrop={(e) => { e.preventDefault(); setSeret(false); pilih(e.dataTransfer.files); }}
      onClick={() => input.current?.click()}
      role="button" tabIndex={0} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();input.current?.click();}}}
      aria-label="Pilih fail untuk alat ini"
      className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 ${compact?'py-3':'py-10'} text-center transition ${
        seret ? "border-merah bg-red-50" : "border-gray-300 bg-white hover:border-merah hover:bg-red-50/40"
      }`}
    >
      {!compact&&<span className="grid h-14 w-14 place-items-center rounded-full bg-red-50 text-merah">
        <UploadCloud size={28} />
      </span>}
      <div>
        <p className="font-papar font-bold text-arang">{compact?(multiple?'Tambah fail':'Tukar fail'):'Pilih fail'}</p>
        <p className="text-sm text-gray-500">{compact?'': 'atau lepaskan fail di sini · '}{accept}</p>
        {error&&<p role="alert" className="mt-1 text-sm text-red-700">{error}</p>}
      </div>
      <input
        ref={input}
        type="file"
        accept={accept}
        multiple={multiple}
        hidden
        onChange={(e) => { pilih(e.target.files); e.target.value = ""; }}
      />
    </div>
  );
}

export function FileList({ fail, onRemove, onReorder, bolehSusun }) {
  const [seretIdx, setSeretIdx] = useState(null);

  const jatuh = (ke) => {
    if (seretIdx === null || seretIdx === ke) return;
    onReorder(seretIdx, ke);
    setSeretIdx(null);
  };

  return (
    <ul className="mt-4 space-y-2">
      {fail.map((f, i) => (
        <li
          key={i}
          draggable={bolehSusun}
          onDragStart={() => setSeretIdx(i)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => jatuh(i)}
          className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-kad"
        >
          {bolehSusun && (
            <span className="cursor-grab text-gray-300" title="Seret untuk susun semula">
              <GripVertical size={18} />
            </span>
          )}
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-red-50 text-merah">
            <FileIcon size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-arang">{f.name}</p>
            <p className="text-xs text-gray-400">{saizManusia(f.size)}</p>
          </div>
          {bolehSusun&&<div className="flex gap-1"><button type="button" aria-label={`Alih ${f.name} ke atas`} disabled={i===0} onClick={()=>onReorder(i,i-1)} className="rounded p-1 disabled:opacity-25"><ArrowUp size={16}/></button><button type="button" aria-label={`Alih ${f.name} ke bawah`} disabled={i===fail.length-1} onClick={()=>onReorder(i,i+1)} className="rounded p-1 disabled:opacity-25"><ArrowDown size={16}/></button></div>}
          <button
            onClick={() => onRemove(i)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-50 hover:text-merah"
            aria-label="Buang fail"
          >
            <X size={18} />
          </button>
        </li>
      ))}
    </ul>
  );
}
