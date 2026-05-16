import { useState } from "react";
import { Search, Filter, Download, ChevronDown, ChevronUp, ArrowLeft, RefreshCw, X, Calendar, Users, TrendingUp, CheckCircle, XCircle } from "lucide-react";

type StatusTele = "Semua" | "Menunggu" | "Akan Datang" | "Berlangsung" | "Selesai" | "Dibatalkan";

interface TransaksiTele {
  id: string; user: string; userInitials: string; userColor: string;
  nutritionist: string; nutriInitials: string; nutriColor: string; spesialisasi: string;
  tanggal: string; waktu: string; metode: "Video Call" | "Voice Call" | "Chat";
  total: number; status: Exclude<StatusTele, "Semua">;
  createdAt: string; paidAt: string | null;
  dateSort: string;
}

const initialData: TransaksiTele[] = [
  { id: "TELE-001", user: "Amanda Sari",  userInitials: "AS", userColor: "bg-blue-500",   nutritionist: "Dr. Fatimah Azzahra", nutriInitials: "FA", nutriColor: "bg-green-600",  spesialisasi: "Kehamilan",      tanggal: "15 Mei 2026", waktu: "14.00 WIB", metode: "Video Call", total: 150000, status: "Akan Datang",  createdAt: "13 Mei 2026, 10.00", paidAt: null,                    dateSort: "2026-05-13" },
  { id: "TELE-002", user: "Andi Pratama", userInitials: "AP", userColor: "bg-purple-500", nutritionist: "Dr. Bima Saputra",   nutriInitials: "BS", nutriColor: "bg-teal-600",   spesialisasi: "Gizi Anak",      tanggal: "12 Mei 2026", waktu: "10.00 WIB", metode: "Video Call", total: 120000, status: "Selesai",      createdAt: "10 Mei 2026, 09.00", paidAt: "10 Mei 2026, 09.15",   dateSort: "2026-05-10" },
  { id: "TELE-003", user: "Anisa Putri",  userInitials: "AP", userColor: "bg-green-600",  nutritionist: "Dr. Rina Kusuma",    nutriInitials: "RK", nutriColor: "bg-orange-600", spesialisasi: "Gizi Ibu Hamil", tanggal: "13 Mei 2026", waktu: "13.00 WIB", metode: "Voice Call", total: 150000, status: "Menunggu",     createdAt: "12 Mei 2026, 15.00", paidAt: null,                    dateSort: "2026-05-12" },
  { id: "TELE-004", user: "Arif Rahman",  userInitials: "AR", userColor: "bg-orange-500", nutritionist: "Dr. Cita Arifin",   nutriInitials: "CA", nutriColor: "bg-pink-600",   spesialisasi: "Gizi Balita",    tanggal: "13 Mei 2026", waktu: "09.00 WIB", metode: "Chat",       total: 100000, status: "Berlangsung",  createdAt: "12 Mei 2026, 08.00", paidAt: "12 Mei 2026, 08.10",   dateSort: "2026-05-12" },
  { id: "TELE-005", user: "Budi Santoso", userInitials: "BS", userColor: "bg-red-500",    nutritionist: "Dr. Bima Saputra",  nutriInitials: "BS", nutriColor: "bg-teal-600",   spesialisasi: "Gizi Anak",      tanggal: "8 Mei 2026",  waktu: "11.00 WIB", metode: "Video Call", total: 120000, status: "Dibatalkan",   createdAt: "7 Mei 2026, 14.00",  paidAt: null,                    dateSort: "2026-05-07" },
];

const statusConfig: Record<Exclude<StatusTele, "Semua">, { bg: string; text: string; dot: string }> = {
  Menunggu:      { bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-400" },
  "Akan Datang": { bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-400"   },
  Berlangsung:   { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-400" },
  Selesai:       { bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-500"  },
  Dibatalkan:    { bg: "bg-red-50",    text: "text-red-700",    dot: "bg-red-400"    },
};

const allStatuses: Exclude<StatusTele, "Semua">[] = ["Menunggu", "Akan Datang", "Berlangsung", "Selesai", "Dibatalkan"];
const allMetodes = ["Semua Metode", "Video Call", "Voice Call", "Chat"];

function formatRp(n: number) { return "Rp" + n.toLocaleString("id-ID"); }

// ── Edit Modal ─────────────────────────────────────────────────────────────
function EditModal({ sesi, onSave, onClose }: { sesi: TransaksiTele; onSave: (u: TransaksiTele) => void; onClose: () => void; }) {
  const [status, setStatus] = useState(sesi.status);
  const [tanggal, setTanggal] = useState(sesi.tanggal);
  const [waktu, setWaktu] = useState(sesi.waktu);
  const [metode, setMetode] = useState(sesi.metode);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Edit Transaksi Tele</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">ID</label>
            <input disabled value={sesi.id} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value as typeof status)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59] transition">
                {allStatuses.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Metode</label>
              <select value={metode} onChange={e => setMetode(e.target.value as typeof metode)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59] transition">
                {["Video Call", "Voice Call", "Chat"].map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Tanggal</label>
              <input value={tanggal} onChange={e => setTanggal(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59] transition" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Waktu</label>
              <input value={waktu} onChange={e => setWaktu(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59] transition" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Total</label>
            <input disabled value={formatRp(sesi.total)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg py-2.5 hover:bg-gray-50 transition">Batal</button>
          <button onClick={() => onSave({ ...sesi, status, tanggal, waktu, metode })} className="flex-1 bg-[#4a7c59] hover:bg-[#2d5a38] text-white text-sm font-semibold rounded-lg py-2.5 transition">Simpan Perubahan</button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Modal ───────────────────────────────────────────────────────────
function DeleteModal({ sesi, onConfirm, onClose }: { sesi: TransaksiTele; onConfirm: () => void; onClose: () => void; }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 text-2xl">🗑️</div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Hapus Transaksi?</h2>
        <p className="text-sm text-gray-500 mb-6">
          Transaksi <span className="font-semibold text-gray-800">{sesi.id}</span> milik <span className="font-semibold text-gray-800">{sesi.user}</span> akan dihapus permanen.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg py-2.5 hover:bg-gray-50 transition">Batal</button>
          <button onClick={onConfirm} className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg py-2.5 transition">Hapus</button>
        </div>
      </div>
    </div>
  );
}

// ── Session Detail ─────────────────────────────────────────────────────────
function SessionDetail({ sesi, onBack, onEdit, onDelete }: { sesi: TransaksiTele; onBack: () => void; onEdit: () => void; onDelete: () => void; }) {
  const cfg = statusConfig[sesi.status];
  return (
    <div className="space-y-4 max-w-2xl">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition">
        <ArrowLeft size={15} /> Kembali ke daftar
      </button>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full border flex items-center gap-1.5 ${cfg.bg} ${cfg.text}`}>⏰ {sesi.status}</span>
          <p className="text-xs text-gray-400">ID: {sesi.id}</p>
        </div>
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
          <div className={`w-12 h-12 rounded-full ${sesi.nutriColor} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>{sesi.nutriInitials}</div>
          <div>
            <p className="font-bold text-gray-900">{sesi.nutritionist}</p>
            <p className="text-sm text-[#4a7c59]">{sesi.spesialisasi}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[{ label: "📅 Tanggal", value: sesi.tanggal }, { label: "🕐 Waktu", value: sesi.waktu }, { label: "📹 Metode", value: sesi.metode }].map(item => (
            <div key={item.label} className="bg-gray-50 rounded-xl p-3">
              <p className="text-[10px] text-gray-400 mb-1">{item.label}</p>
              <p className="text-sm font-bold text-gray-900">{item.value}</p>
            </div>
          ))}
        </div>
        <div className="border border-gray-100 rounded-lg p-3 mb-4">
          <p className="text-xs font-semibold text-gray-500 mb-1">Pengguna</p>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-full ${sesi.userColor} flex items-center justify-center text-white text-xs font-bold`}>{sesi.userInitials}</div>
            <div>
              <p className="text-sm font-medium text-gray-800">{sesi.user}</p>
              <p className="text-xs text-gray-400">Dibuat: {sesi.createdAt} · Dibayar: {sesi.paidAt ?? "-"}</p>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center py-3 border-t border-gray-100 mb-4">
          <p className="text-sm font-semibold text-gray-900">Total Biaya Konsultasi</p>
          <p className="text-lg font-bold text-[#4a7c59]">{formatRp(sesi.total)}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onEdit} className="flex-1 bg-[#4a7c59] hover:bg-[#2d5a38] text-white font-semibold text-sm rounded-lg py-2.5 transition">✏️ Edit</button>
          <button className="flex-1 border border-gray-200 text-gray-600 font-semibold text-sm rounded-lg py-2.5 hover:bg-gray-50 transition flex items-center justify-center gap-2">
            <RefreshCw size={14} /> Sinkronkan Status
          </button>
          <button onClick={onDelete} className="flex-1 border border-red-200 text-red-500 font-semibold text-sm rounded-lg py-2.5 hover:bg-red-50 transition">🗑️ Hapus</button>
        </div>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function TransaksiTeleNutri() {
  const [data, setData] = useState<TransaksiTele[]>(initialData);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<"dateSort" | "total">("dateSort");
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedSesi, setSelectedSesi] = useState<TransaksiTele | null>(null);
  const [editTarget, setEditTarget] = useState<TransaksiTele | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TransaksiTele | null>(null);
  const [dateFrom, setDateFrom] = useState("2026-05-01");
  const [dateTo, setDateTo] = useState("2026-05-31");
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [filterStatus, setFilterStatus] = useState<StatusTele>("Semua");
  const [filterMetode, setFilterMetode] = useState("Semua Metode");

  function handleSaveEdit(updated: TransaksiTele) {
    setData(prev => prev.map(t => t.id === updated.id ? updated : t));
    if (selectedSesi?.id === updated.id) setSelectedSesi(updated);
    setEditTarget(null);
  }

  function handleDelete(id: string) {
    setData(prev => prev.filter(t => t.id !== id));
    setDeleteTarget(null);
    setSelectedSesi(null);
  }

  const filtered = data
    .filter(t => {
      if (filterStatus !== "Semua" && t.status !== filterStatus) return false;
      if (filterMetode !== "Semua Metode" && t.metode !== filterMetode) return false;
      if (search && !t.user.toLowerCase().includes(search.toLowerCase()) && !t.id.toLowerCase().includes(search.toLowerCase()) && !t.nutritionist.toLowerCase().includes(search.toLowerCase())) return false;
      if (dateFrom && t.dateSort < dateFrom) return false;
      if (dateTo && t.dateSort > dateTo) return false;
      return true;
    })
    .sort((a, b) => sortField === "total" ? (sortAsc ? a.total - b.total : b.total - a.total) : (sortAsc ? a.dateSort.localeCompare(b.dateSort) : b.dateSort.localeCompare(a.dateSort)));

  function toggleSort(field: "dateSort" | "total") {
    if (sortField === field) setSortAsc(!sortAsc); else { setSortField(field); setSortAsc(false); }
  }

  const SortIcon = ({ field }: { field: "dateSort" | "total" }) =>
    sortField === field ? sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} /> : <ChevronDown size={12} className="text-gray-300" />;

  const totalPendapatan = data.filter(t => t.status === "Selesai").reduce((s, t) => s + t.total, 0);
  const selesaiCount    = data.filter(t => t.status === "Selesai").length;
  const dibatalkanCount = data.filter(t => t.status === "Dibatalkan").length;

  if (selectedSesi) {
    const current = data.find(t => t.id === selectedSesi.id) ?? selectedSesi;
    return (
      <div className="space-y-5">
        <div><h1 className="text-2xl font-bold text-gray-900">Transaksi Tele-Nutritionist</h1></div>
        <SessionDetail sesi={current} onBack={() => setSelectedSesi(null)} onEdit={() => setEditTarget(current)} onDelete={() => setDeleteTarget(current)} />
        {editTarget && <EditModal sesi={editTarget} onSave={handleSaveEdit} onClose={() => setEditTarget(null)} />}
        {deleteTarget && <DeleteModal sesi={deleteTarget} onConfirm={() => handleDelete(deleteTarget.id)} onClose={() => setDeleteTarget(null)} />}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transaksi Tele-Nutritionist</h1>
          <p className="text-sm text-gray-500 mt-0.5">Kelola semua transaksi sesi konsultasi Tele-Nutritionist</p>
        </div>
        <button className="flex items-center gap-2 text-sm font-medium border border-gray-200 rounded-lg px-4 py-2 bg-white hover:bg-gray-50 transition text-gray-600">
          <Download size={15} /> Ekspor
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Sesi</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{data.length}</p>
              <p className="text-xs text-green-500 mt-0.5 font-medium">↑ +8 minggu ini</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
              <Users size={18} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Pendapatan</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{formatRp(totalPendapatan)}</p>
              <p className="text-xs text-green-500 mt-0.5 font-medium">↑ +12,3% minggu ini</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-500 flex-shrink-0">
              <TrendingUp size={18} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Sesi Selesai</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{selesaiCount}</p>
              <p className="text-xs text-gray-400 mt-0.5">{data.length ? Math.round((selesaiCount / data.length) * 100) : 0}% dari total</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-500 flex-shrink-0">
              <CheckCircle size={18} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Dibatalkan</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{dibatalkanCount}</p>
              <p className="text-xs text-red-400 mt-0.5 font-medium">↑ +2 minggu ini</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-500 flex-shrink-0">
              <XCircle size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Search + filter */}
        <div className="flex items-center gap-3 px-4 py-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a7c59] transition"
              placeholder="Cari ID, nama pengguna, atau nutritionist..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {/* Date range toggle */}
          <div className="flex items-center gap-1 border border-gray-200 rounded-lg px-3 py-2 bg-white text-sm text-gray-600 cursor-pointer" onClick={() => setShowDateFilter(!showDateFilter)}>
            <Calendar size={14} className="text-gray-400 mr-1" />
            <span className="text-xs">{dateFrom ? dateFrom : "Dari"}</span>
            <span className="text-gray-300 mx-1">–</span>
            <span className="text-xs">{dateTo ? dateTo : "Sampai"}</span>
            {(dateFrom || dateTo) && <span className="w-1.5 h-1.5 rounded-full bg-[#4a7c59] ml-1" />}
          </div>

          {/* Status dropdown */}
          <div className="relative">
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as StatusTele)}
              className="appearance-none border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-[#4a7c59] transition cursor-pointer">
              <option value="Semua">Semua Status</option>
              {allStatuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Metode dropdown */}
          <div className="relative">
            <select value={filterMetode} onChange={e => setFilterMetode(e.target.value)}
              className="appearance-none border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-[#4a7c59] transition cursor-pointer">
              {allMetodes.map(m => <option key={m}>{m}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          <button className="flex items-center gap-2 text-sm font-medium border border-gray-200 rounded-lg px-3 py-2 bg-white hover:bg-gray-50 transition text-gray-600">
            <Filter size={14} /> Filter
          </button>
          <button className="flex items-center gap-2 text-sm font-medium border border-gray-200 rounded-lg px-3 py-2 bg-white hover:bg-gray-50 transition text-gray-600">
            <Download size={14} /> Ekspor
          </button>
        </div>

        {/* Date range inputs (expandable) */}
        {showDateFilter && (
          <div className="flex items-center gap-3 px-4 pb-3 flex-wrap">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
              <span className="text-xs text-gray-500 whitespace-nowrap">Dari</span>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                className="text-sm border-none bg-transparent focus:outline-none text-gray-700" />
            </div>
            <span className="text-gray-400 text-sm">—</span>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
              <span className="text-xs text-gray-500 whitespace-nowrap">Sampai</span>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                className="text-sm border-none bg-transparent focus:outline-none text-gray-700" />
            </div>
            {(dateFrom || dateTo) && (
              <button onClick={() => { setDateFrom(""); setDateTo(""); }} className="text-xs text-red-500 hover:underline">Reset</button>
            )}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pengguna</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nutritionist</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => toggleSort("dateSort")}>
                  <span className="flex items-center gap-1">Jadwal <SortIcon field="dateSort" /></span>
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Metode</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => toggleSort("total")}>
                  <span className="flex items-center gap-1">Total <SortIcon field="total" /></span>
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400 text-sm">Tidak ada transaksi ditemukan</td></tr>
              ) : filtered.map(t => (
                <tr key={t.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-xs font-mono text-gray-500">{t.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-full ${t.userColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>{t.userInitials}</div>
                      <span className="font-medium text-gray-800 whitespace-nowrap text-sm">{t.user}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full ${t.nutriColor} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>{t.nutriInitials}</div>
                      <div>
                        <p className="text-gray-800 font-medium whitespace-nowrap text-xs">{t.nutritionist}</p>
                        <p className="text-gray-400 text-[10px]">{t.spesialisasi}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{t.tanggal}, {t.waktu}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{t.metode}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${statusConfig[t.status].bg} ${statusConfig[t.status].text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[t.status].dot}`} />{t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{formatRp(t.total)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setSelectedSesi(t)} className="text-xs text-[#4a7c59] hover:text-[#2d5a38] font-medium transition">Detail</button>
                      <button onClick={() => setEditTarget(t)} className="text-gray-400 hover:text-blue-500 transition text-xs">✏️</button>
                      <button onClick={() => setDeleteTarget(t)} className="text-gray-400 hover:text-red-500 transition text-xs">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">Menampilkan {filtered.length} dari {data.length} transaksi</p>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition">Sebelumnya</button>
            <button className="px-3 py-1.5 text-xs bg-[#4a7c59] text-white rounded-lg">1</button>
            <button className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition">Berikutnya</button>
          </div>
        </div>
      </div>

      {editTarget && <EditModal sesi={editTarget} onSave={handleSaveEdit} onClose={() => setEditTarget(null)} />}
      {deleteTarget && <DeleteModal sesi={deleteTarget} onConfirm={() => handleDelete(deleteTarget.id)} onClose={() => setDeleteTarget(null)} />}
    </div>
  );
}