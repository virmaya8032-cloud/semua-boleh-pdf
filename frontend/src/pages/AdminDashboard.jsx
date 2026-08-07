import { useEffect, useState } from "react";
import { api } from "../services/api.js";
import { useToast } from "../components/Toast.jsx";
import { Loader } from "../components/ui.jsx";
import {
  Users, FileStack, CalendarDays, TrendingUp, Download, Search,
  Ban, CheckCircle2, Trash2, Server, Database, RefreshCw,
} from "lucide-react";

function saizManusia(bait) {
  if (!bait) return "0 B";
  if (bait < 1024) return `${bait} B`;
  if (bait < 1024 * 1024) return `${(bait / 1024).toFixed(1)} KB`;
  return `${(bait / 1024 / 1024).toFixed(1)} MB`;
}

function Stat({ Icon, label, nilai, warna = "#E12128" }) {
  return (
    <div className="kad flex items-center gap-4 p-5">
      <span className="grid h-11 w-11 place-items-center rounded-xl" style={{ backgroundColor: `${warna}14`, color: warna }}>
        <Icon size={20} />
      </span>
      <div>
        <p className="text-2xl font-extrabold text-arang">{nilai}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const toast = useToast();
  const [tab, setTab] = useState("gambaran");
  const [memuat, setMemuat] = useState(true);

  const [stat, setStat] = useState(null);
  const [pengguna, setPengguna] = useState([]);
  const [carian, setCarian] = useState("");
  const [aktiviti, setAktiviti] = useState([]);
  const [tapisAlat, setTapisAlat] = useState("");
  const [sistem, setSistem] = useState(null);

  const muatSemua = async () => {
    try {
      const [s, p, a, sys] = await Promise.all([
        api.get("/pentadbir/statistik"),
        api.get("/pentadbir/pengguna"),
        api.get("/pentadbir/aktiviti"),
        api.get("/pentadbir/status-sistem"),
      ]);
      setStat(s);
      setPengguna(p.pengguna || []);
      setAktiviti(a.aktiviti || []);
      setSistem(sys);
    } catch (e) {
      toast.ralat(e.message);
    } finally {
      setMemuat(false);
    }
  };

  useEffect(() => {
    muatSemua();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cariPengguna = async (e) => {
    e?.preventDefault();
    try {
      const p = await api.get(`/pentadbir/pengguna?carian=${encodeURIComponent(carian)}`);
      setPengguna(p.pengguna || []);
    } catch (err) {
      toast.ralat(err.message);
    }
  };

  const tapisAktiviti = async () => {
    try {
      const q = tapisAlat ? `?alat=${encodeURIComponent(tapisAlat)}` : "";
      const a = await api.get(`/pentadbir/aktiviti${q}`);
      setAktiviti(a.aktiviti || []);
    } catch (err) {
      toast.ralat(err.message);
    }
  };

  const tukarStatus = async (u) => {
    try {
      const data = await api.patch(`/pentadbir/pengguna/${u.id}/status`, { aktif: !u.aktif });
      setPengguna((list) => list.map((x) => (x.id === u.id ? { ...x, aktif: !u.aktif } : x)));
      toast.berjaya(data.mesej);
    } catch (err) {
      toast.ralat(err.message);
    }
  };

  const padamPengguna = async (u) => {
    if (!confirm(`Padam pengguna ${u.nama} (${u.emel})? Tindakan ini kekal.`)) return;
    try {
      await api.del(`/pentadbir/pengguna/${u.id}`);
      setPengguna((list) => list.filter((x) => x.id !== u.id));
      toast.berjaya("Pengguna dipadam.");
    } catch (err) {
      toast.ralat(err.message);
    }
  };

  const eksportCsv = async () => {
    try {
      const res = await fetch(api.fullUrl("/api/pentadbir/eksport-csv"), {
        headers: { Authorization: `Bearer ${localStorage.getItem("sbp_token")}` },
      });
      if (!res.ok) throw new Error("Gagal mengeksport CSV.");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "aktiviti-semua-boleh-pdf.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.berjaya("CSV dieksport.");
    } catch (err) {
      toast.ralat(err.message);
    }
  };

  if (memuat) return <Loader teks="Memuat panel pentadbir…" />;

  const tabs = [
    { id: "gambaran", label: "Gambaran Keseluruhan" },
    { id: "pengguna", label: "Pengguna" },
    { id: "aktiviti", label: "Aktiviti" },
    { id: "sistem", label: "Status Sistem" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-papar text-3xl font-extrabold">Panel Pentadbir</h1>
          <p className="mt-1 text-gray-500">Urus pengguna, pantau aktiviti dan status sistem.</p>
        </div>
        <button onClick={muatSemua} className="btn-lembut py-2">
          <RefreshCw size={16} /> Muat Semula
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-gray-100">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
              tab === t.id ? "border-merah text-merah" : "border-transparent text-gray-500 hover:text-arang"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Gambaran */}
      {tab === "gambaran" && stat && (
        <div className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat Icon={Users} label="Jumlah pengguna" nilai={stat.jumlah_pengguna} />
            <Stat Icon={FileStack} label="Jumlah fail diproses" nilai={stat.jumlah_fail} warna="#2563eb" />
            <Stat Icon={CalendarDays} label="Hari ini" nilai={stat.hari_ini} warna="#16a34a" />
            <Stat Icon={TrendingUp} label="30 hari" nilai={stat.bulan_ini} warna="#7c3aed" />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Stat Icon={CheckCircle2} label="Berjaya" nilai={stat.berjaya} warna="#16a34a" />
            <Stat Icon={Ban} label="Gagal" nilai={stat.gagal} warna="#E12128" />
            <Stat Icon={CalendarDays} label="7 hari" nilai={stat.minggu_ini} warna="#d97706" />
          </div>

          <div className="kad p-6">
            <h3 className="mb-4 font-papar font-bold">Alat Paling Popular</h3>
            {stat.alat_popular?.length ? (
              <div className="space-y-3">
                {stat.alat_popular.map((a, i) => {
                  const maks = stat.alat_popular[0].bilangan || 1;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-40 shrink-0 truncate text-sm font-semibold text-arang">{a.nama_alat}</span>
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                        <div className="h-full rounded-full bg-merah" style={{ width: `${(a.bilangan / maks) * 100}%` }} />
                      </div>
                      <span className="w-10 text-right text-sm text-gray-500">{a.bilangan}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Belum ada data.</p>
            )}
          </div>
        </div>
      )}

      {/* Pengguna */}
      {tab === "pengguna" && (
        <div className="mt-6">
          <form onSubmit={cariPengguna} className="mb-4 flex max-w-md items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2">
            <Search className="text-gray-400" size={18} />
            <input
              className="w-full bg-transparent py-1 outline-none"
              placeholder="Cari nama atau e-mel…"
              value={carian}
              onChange={(e) => setCarian(e.target.value)}
            />
            <button className="btn-utama py-1.5 text-sm">Cari</button>
          </form>

          <div className="kad overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Nama</th>
                  <th className="px-4 py-3 font-semibold">E-mel</th>
                  <th className="px-4 py-3 font-semibold">Peranan</th>
                  <th className="px-4 py-3 font-semibold">Guna</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pengguna.map((u) => (
                  <tr key={u.id}>
                    <td className="px-4 py-3 font-semibold text-arang">{u.nama}</td>
                    <td className="px-4 py-3 text-gray-600">{u.emel}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${u.peranan === "pentadbir" ? "bg-violet-50 text-violet-600" : "bg-gray-100 text-gray-600"}`}>
                        {u.peranan}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{u.jumlah_guna}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${u.aktif ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-merah"}`}>
                        {u.aktif ? "Aktif" : "Disekat"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.peranan !== "pentadbir" && (
                        <div className="flex gap-2">
                          <button onClick={() => tukarStatus(u)} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-50" title={u.aktif ? "Sekat" : "Aktifkan"}>
                            {u.aktif ? <Ban size={16} /> : <CheckCircle2 size={16} />}
                          </button>
                          <button onClick={() => padamPengguna(u)} className="rounded-lg p-1.5 text-merah hover:bg-red-50" title="Padam">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {pengguna.length === 0 && <p className="p-8 text-center text-sm text-gray-500">Tiada pengguna dijumpai.</p>}
          </div>
        </div>
      )}

      {/* Aktiviti */}
      {tab === "aktiviti" && (
        <div className="mt-6">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <input
              className="medan max-w-xs"
              placeholder="Tapis mengikut slug alat (cth: gabung-pdf)"
              value={tapisAlat}
              onChange={(e) => setTapisAlat(e.target.value)}
            />
            <button onClick={tapisAktiviti} className="btn-lembut py-2.5">Tapis</button>
            <button onClick={eksportCsv} className="btn-utama ml-auto py-2.5">
              <Download size={16} /> Eksport CSV
            </button>
          </div>

          <div className="kad overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Masa</th>
                  <th className="px-4 py-3 font-semibold">Pengguna</th>
                  <th className="px-4 py-3 font-semibold">Alat</th>
                  <th className="px-4 py-3 font-semibold">Saiz</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {aktiviti.map((a) => (
                  <tr key={a.id}>
                    <td className="px-4 py-3 text-gray-500">{new Date(a.dicipta_pada).toLocaleString("ms-MY")}</td>
                    <td className="px-4 py-3 text-gray-600">{a.nama_pengguna || "Tetamu"}</td>
                    <td className="px-4 py-3 font-semibold text-arang">{a.nama_alat}</td>
                    <td className="px-4 py-3 text-gray-500">{saizManusia(a.saiz_bait)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${a.status === "berjaya" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-merah"}`}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {aktiviti.length === 0 && <p className="p-8 text-center text-sm text-gray-500">Tiada aktiviti.</p>}
          </div>
        </div>
      )}

      {/* Sistem */}
      {tab === "sistem" && sistem && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="kad flex items-center gap-4 p-5">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><Server size={20} /></span>
            <div>
              <p className="font-papar font-bold text-arang">Backend</p>
              <p className="text-sm capitalize text-gray-500">{sistem.backend}</p>
            </div>
          </div>
          <div className="kad flex items-center gap-4 p-5">
            <span className={`grid h-11 w-11 place-items-center rounded-xl ${sistem.pangkalan_data === "tersambung" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-merah"}`}>
              <Database size={20} />
            </span>
            <div>
              <p className="font-papar font-bold text-arang">Pangkalan Data</p>
              <p className="text-sm capitalize text-gray-500">{sistem.pangkalan_data}</p>
            </div>
          </div>
          <div className="kad p-5 sm:col-span-2">
            <p className="text-sm text-gray-500">Masa pelayan</p>
            <p className="font-semibold text-arang">{new Date(sistem.masa_pelayan).toLocaleString("ms-MY")}</p>
            <p className="mt-3 text-sm text-gray-500">Kolam sambungan pangkalan data</p>
            <p className="font-semibold text-arang">
              Jumlah: {sistem.kolam_sambungan?.jumlah} · Melahu: {sistem.kolam_sambungan?.melahu} · Menunggu: {sistem.kolam_sambungan?.menunggu}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
