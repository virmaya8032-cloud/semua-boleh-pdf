import { useMemo, useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { toolBySlug } from "../config/tools.js";
import { Dropzone, FileList } from "../components/Dropzone.jsx";
import { ProgressBar } from "../components/ui.jsx";
import { api } from "../services/api.js";
import { useToast } from "../components/Toast.jsx";
import { Download, RefreshCw, ArrowLeft, CheckCircle2, Settings2, Clock } from "lucide-react";
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
  const minFiles = tool.minFiles || (tool.op === "gabung" ? 2 : 1);

  const tambahFail = (baru) => {
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
    if (!fail.length) {
      setRalat("Sila pilih sekurang-kurangnya satu fail.");
      return;
    }
    if (fail.length < minFiles) {
      setRalat(`Alat ini memerlukan sekurang-kurangnya ${minFiles} fail.`);
      return;
    }
    // Gabungkan pilihan pengguna + medan 'extra' tetap daripada config.
    const hantaran = { ...(tool.extra || {}), ...pilihan };
    setPeringkat("proses");
    setKemajuan(0);
    setRalat("");
    try {
      const data = await api.proses(slug, fail, hantaran, setKemajuan);
      setHasil(data);
      setPeringkat("siap");
      toast.berjaya("Fail berjaya diproses!");
    } catch (e) {
      setRalat(e.message || "Ralat semasa memproses fail.");
      setPeringkat("pilih");
      toast.ralat(e.message || "Gagal memproses fail.");
    }
  };

  const muatTurun = () => {
    if (!hasil?.muat_turun) return;
    const a = document.createElement("a");
    a.href = api.fullUrl(hasil?.muat_turun);
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
  };

  const labelMuatTurun = (() => {
    const ext = (hasil?.nama_fail || "").split(".").pop()?.toUpperCase();
    if (ext && ext.length <= 4) return ext;
    return "Fail";
  })();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
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
            <Dropzone accept={tool.accept} multiple={tool.multiple} onFiles={tambahFail} />

            {fail.length > 0 && (
              <FileList fail={fail} onRemove={buangFail} onReorder={susunFail} bolehSusun={bolehSusun} />
            )}

            {tool.options?.length > 0 && fail.length > 0 && (
              <div className="mt-6 rounded-xl bg-kabus p-4">
                <p className="mb-3 flex items-center gap-2 text-sm font-bold text-arang">
                  <Settings2 size={16} /> Tetapan
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {tool.options.map((o) => (
                    <label key={o.key} className="block">
                      <span className="mb-1 block text-sm font-semibold text-gray-700">{o.label}</span>
                      {o.jenis === "select" ? (
                        <select
                          className="medan"
                          value={pilihan[o.key] ?? o.pilihan?.[0]?.nilai ?? ""}
                          onChange={(e) => ubahPilihan(o.key, e.target.value)}
                        >
                          {o.pilihan.map((p) => (
                            <option key={p.nilai} value={p.nilai}>{p.teks}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          className="medan"
                          type={o.jenis === "number" ? "number" : o.jenis === "password" ? "password" : "text"}
                          placeholder={o.placeholder || ""}
                          value={pilihan[o.key] ?? ""}
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

            <button onClick={proses} disabled={!fail.length} className="btn-utama mt-6 w-full text-base">
              Proses Fail
            </button>
          </>
        )}

        {peringkat === "proses" && (
          <div className="py-10 text-center">
            <p className="mb-4 font-papar text-lg font-bold">
              {kemajuan < 100 ? "Sedang Dimuat Naik…" : "Sedang Diproses…"}
            </p>
            <ProgressBar nilai={kemajuan} />
            <p className="mt-3 text-sm text-gray-500">Sila tunggu sebentar.</p>
          </div>
        )}

        {peringkat === "siap" && (
          <div className="py-8 text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={36} />
            </span>
            <h2 className="mt-4 font-papar text-xl font-bold">Fail berjaya diproses!</h2>
            <p className="mt-1 text-sm text-gray-500">
              Fail anda sedia untuk dimuat turun. Ia akan dipadam secara automatik selepas beberapa minit.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <button onClick={muatTurun} className="btn-utama">
                <Download size={18} /> Muat Turun {labelMuatTurun}
              </button>
              <button onClick={semula} className="btn-lembut">
                <RefreshCw size={18} /> Proses Fail Lain
              </button>
            </div>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
}
