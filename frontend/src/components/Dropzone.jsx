import { useRef, useState } from "react";
import { UploadCloud, File as FileIcon, X, GripVertical } from "lucide-react";

function saizManusia(bait) {
  if (bait < 1024) return `${bait} B`;
  if (bait < 1024 * 1024) return `${(bait / 1024).toFixed(1)} KB`;
  return `${(bait / 1024 / 1024).toFixed(1)} MB`;
}

export function Dropzone({ accept, multiple, onFiles }) {
  const input = useRef(null);
  const [seret, setSeret] = useState(false);

  const pilih = (senarai) => {
    const arr = Array.from(senarai || []);
    if (arr.length) onFiles(arr);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setSeret(true); }}
      onDragLeave={() => setSeret(false)}
      onDrop={(e) => { e.preventDefault(); setSeret(false); pilih(e.dataTransfer.files); }}
      onClick={() => input.current?.click()}
      className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-14 text-center transition ${
        seret ? "border-merah bg-red-50" : "border-gray-300 bg-white hover:border-merah hover:bg-red-50/40"
      }`}
    >
      <span className="grid h-14 w-14 place-items-center rounded-full bg-red-50 text-merah">
        <UploadCloud size={28} />
      </span>
      <div>
        <p className="font-papar font-bold text-arang">Pilih Fail PDF</p>
        <p className="text-sm text-gray-500">atau lepaskan fail di sini</p>
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
