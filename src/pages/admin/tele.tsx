import { useState, useEffect } from "react";
import { 
  Search, Download, ChevronDown, ChevronUp, 
  ArrowLeft, X, Calendar, Users, 
  TrendingUp, CheckCircle, XCircle, Link2, FileText, Loader2,
  ChevronLeft, ChevronRight 
} from "lucide-react";
import { AdminLayout } from "./admin-layout";
import { adminService, type Consultation } from "../../services/admin.service";
import { toast } from "sonner";

type StatusTele = "Semua" | "Menunggu" | "Akan Datang" | "Berlangsung" | "Selesai" | "Dibatalkan";
type MetodeType = "Video Call" | "Chat";

interface TransaksiTele {
  id: string;
  rawId: number;
  user: string;
  userInitials: string;
  userColor: string;
  nutritionist: string;
  nutriInitials: string;
  nutriColor: string;
  spesialisasi: string;
  tanggal: string;
  waktu: string;
  jadwalSesiIso: string;
  metode: MetodeType;
  total: number;
  status: Exclude<StatusTele, "Semua">;
  createdAt: string;
  paidAt: string | null;
  dateSort: string;
  linkMeeting: string;
  catatan: string;
}

const statusConfig: Record<Exclude<StatusTele, "Semua">, { bg: string; text: string; dot: string }> = {
  Menunggu:      { bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-400" },
  "Akan Datang": { bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-400"   },
  Berlangsung:   { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-400" },
  Selesai:       { bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-500"  },
  Dibatalkan:    { bg: "bg-red-50",    text: "text-red-700",    dot: "bg-red-400"    },
};

const allStatuses: Exclude<StatusTele, "Semua">[] = ["Menunggu", "Akan Datang", "Berlangsung", "Selesai", "Dibatalkan"];
const allMetodes = ["Semua Metode", "Video Call", "Chat"];

function formatRp(n: number) { return "Rp" + n.toLocaleString("id-ID"); }

function formatDatetimeID(dtStr: string): string {
  if (!dtStr) return "-";
  const MONTHS = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
  const d = new Date(dtStr);
  if (isNaN(d.getTime())) return dtStr;
  const day = d.getDate();
  const month = MONTHS[d.getMonth()];
  const year = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${day} ${month} ${year}, ${hh}.${mm}`;
}

function formatDateOnly(dtStr: string): string {
  if (!dtStr) return "-";
  const MONTHS = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
  const d = new Date(dtStr);
  if (isNaN(d.getTime())) return dtStr;
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function formatTimeOnly(dtStr: string): string {
  if (!dtStr) return "-";
  const d = new Date(dtStr);
  if (isNaN(d.getTime())) return dtStr;
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}.${mm} WIB`;
}

function getLocalDatetimeString(dtStr: string): string {
  if (!dtStr) return "";
  const d = new Date(dtStr);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const AVATAR_COLORS = ["bg-blue-500","bg-green-500","bg-purple-500","bg-orange-500","bg-red-500","bg-pink-500","bg-indigo-500","bg-teal-500"];
function getInitials(name: string): string {
  return name.replace(/^Dr\.\s*/i, "").split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}
function getAvatarColor(name: string): string {
  const sum = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

function getPaginationPages(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

// ── Edit Modal ─────────────────────────────────────────────────────────────
function EditModal({ sesi, onSave, onClose }: { sesi: TransaksiTele; onSave: (body: any) => void; onClose: () => void; }) {
  const [status, setStatus] = useState<Exclude<StatusTele, "Semua">>(sesi.status);
  const [metode, setMetode] = useState<MetodeType>(sesi.metode);
  const [jadwalSesi, setJadwalSesi] = useState<string>(getLocalDatetimeString(sesi.jadwalSesiIso));
  const defaultJitsiLink = `https://meet.jit.si/NutriGrow-Consultation-${sesi.rawId}`;
  const [linkMeeting, setLinkMeeting] = useState<string>(sesi.linkMeeting || defaultJitsiLink);
  const [catatan, setCatatan] = useState<string>(sesi.catatan);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const statusMap: Record<string, string> = {
      Menunggu: "BOOKED",
      "Akan Datang": "CONFIRMED",
      Berlangsung: "IN_PROGRESS",
      Selesai: "DONE",
      Dibatalkan: "CANCELLED",
    };

    const payload: any = {
      status: statusMap[status],
      metode: metode === "Video Call" ? "VIDEO_CALL" : "CHAT",
      jadwalSesi: new Date(jadwalSesi).toISOString(),
      catatanKonsultasi: catatan || null,
      linkMeeting: metode === "Video Call" ? (linkMeeting || null) : null,
    };

    onSave(payload);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Ubah Detail & Jadwal Sesi</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Status Sesi</label>
              <select value={status} onChange={e => setStatus(e.target.value as any)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59] transition">
                {allStatuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Metode Sesi</label>
              <select value={metode} onChange={e => setMetode(e.target.value as any)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59] transition">
                <option value="Video Call">Video Call</option>
                <option value="Chat">WhatsApp Chat</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Jadwal Sesi Baru</label>
            <input 
              type="datetime-local" 
              value={jadwalSesi} 
              onChange={e => setJadwalSesi(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59] transition" 
              required
            />
          </div>

          {metode === "Video Call" && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Link Video Call (Zoom/Meet/Jitsi)</label>
              <input 
                type="url"
                value={linkMeeting} 
                onChange={e => setLinkMeeting(e.target.value)}
                placeholder="https://meet.jit.si/..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59] transition" 
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Catatan Konsultasi (Summary)</label>
            <textarea 
              value={catatan} 
              onChange={e => setCatatan(e.target.value)}
              rows={4}
              placeholder="Berikan ringkasan konsultasi untuk pasien..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59] transition resize-none" 
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100 mt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Batal</button>
            <button type="submit" className="flex-1 px-4 py-2.5 bg-[#4a7c59] text-white rounded-lg text-sm font-semibold hover:bg-[#3d6849] transition-colors">Simpan Perubahan</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Session Detail ─────────────────────────────────────────────────────────
function SessionDetail({ sesi, onBack, onEdit }: { sesi: TransaksiTele; onBack: () => void; onEdit: () => void; }) {
  const cfg = statusConfig[sesi.status];
  return (
    <div className="space-y-4 max-w-2xl">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition font-medium">
        <ArrowLeft size={15} /> Kembali ke daftar
      </button>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${cfg.bg} ${cfg.text}`}>{sesi.status}</span>
          <p className="text-xs text-gray-400">ID: {sesi.id}</p>
        </div>
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
          <div className={`w-12 h-12 rounded-full ${sesi.nutriColor} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>{sesi.nutriInitials}</div>
          <div>
            <p className="font-bold text-gray-900">{sesi.nutritionist}</p>
            <p className="text-sm text-[#4a7c59] font-medium">{sesi.spesialisasi}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[{ label: "📅 Tanggal Sesi", value: sesi.tanggal }, { label: "🕐 Waktu Sesi", value: sesi.waktu }, { label: "📹 Metode Sesi", value: sesi.metode }].map(item => (
            <div key={item.label} className="bg-gray-50 rounded-xl p-3">
              <p className="text-[10px] text-gray-400 mb-1 font-semibold">{item.label}</p>
              <p className="text-sm font-bold text-gray-900">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="border border-gray-100 rounded-lg p-4 mb-4 bg-gray-50/20">
          <p className="text-xs font-semibold text-gray-400 mb-2">PENGGUNA / PASIEN</p>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-full ${sesi.userColor} flex items-center justify-center text-white text-xs font-bold`}>{sesi.userInitials}</div>
            <div>
              <p className="text-sm font-bold text-gray-800">{sesi.user}</p>
              <p className="text-xs text-gray-500">Mendaftar: {sesi.createdAt} · Dibayar: {sesi.paidAt ?? "-"}</p>
            </div>
          </div>
        </div>

        {sesi.metode === "Video Call" && (
          <div className="border border-gray-100 rounded-lg p-4 mb-4 bg-blue-50/10">
            <p className="text-xs font-semibold text-blue-500 mb-1 flex items-center gap-1"><Link2 size={13} /> LINK VIDEO CALL SESSION</p>
            {(() => {
              const activeLink = sesi.linkMeeting || `https://meet.jit.si/NutriGrow-Consultation-${sesi.rawId}`;
              return (
                <div className="space-y-1">
                  <a href={activeLink} target="_blank" rel="noreferrer" className="text-sm text-blue-600 font-semibold hover:underline break-all block">
                    {activeLink}
                  </a>
                  {!sesi.linkMeeting && (
                    <span className="text-[10px] text-gray-400 font-medium italic block bg-gray-50 p-1.5 rounded border border-gray-100">
                      💡 Link default Jitsi di atas dapat digunakan langsung atau diubah ke Zoom/Meet melalui tombol Edit Sesi.
                    </span>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        <div className="border border-gray-100 rounded-lg p-4 mb-4 bg-orange-50/10">
          <p className="text-xs font-semibold text-orange-600 mb-1 flex items-center gap-1"><FileText size={13} /> CATATAN KONSULTASI</p>
          {sesi.catatan ? (
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{sesi.catatan}</p>
          ) : (
            <p className="text-xs text-gray-400 italic">Belum ada catatan yang ditulis untuk sesi ini.</p>
          )}
        </div>

        <div className="flex justify-between items-center py-4 border-t border-gray-100 mb-4 mt-2">
          <p className="text-sm font-semibold text-gray-900">Total Biaya Sesi</p>
          <p className="text-xl font-bold text-[#4a7c59]">{formatRp(sesi.total)}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onEdit} className="flex-1 px-4 py-2.5 bg-[#4a7c59] text-white rounded-lg text-sm font-semibold hover:bg-[#3d6849] transition-colors flex items-center justify-center gap-2">
            ✏️ Edit Sesi
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function TransaksiTeleNutri() {
  const [data, setData] = useState<TransaksiTele[]>([]);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<"dateSort" | "total">("dateSort");
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedSesi, setSelectedSesi] = useState<TransaksiTele | null>(null);
  const [editTarget, setEditTarget] = useState<TransaksiTele | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [filterStatus, setFilterStatus] = useState<StatusTele>("Semua");
  const [filterMetode, setFilterMetode] = useState("Semua Metode");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, revenue: 0, confirmed: 0, booked: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const ITEMS_PER_PAGE = 10;

  const fetchConsultations = async () => {
    setLoading(true);
    try {
      const params: any = {
        search: search.trim() || undefined,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      };

      if (filterStatus !== "Semua") {
        const statMap: Record<string, string> = {
          Menunggu: "BOOKED",
          "Akan Datang": "CONFIRMED",
          Berlangsung: "IN_PROGRESS",
          Selesai: "DONE",
          Dibatalkan: "CANCELLED",
        };
        params.status = statMap[filterStatus];
      }

      if (filterMetode !== "Semua Metode") {
        params.metode = filterMetode === "Video Call" ? "VIDEO_CALL" : "CHAT";
      }

      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const res = await adminService.getConsultations(params);
      
      const mapBackendConsultation = (c: Consultation): TransaksiTele => {
        const statusMapBack: Record<string, Exclude<StatusTele, "Semua">> = {
          BOOKED: "Menunggu",
          CONFIRMED: "Akan Datang",
          IN_PROGRESS: "Berlangsung",
          DONE: "Selesai",
          CANCELLED: "Dibatalkan",
        };

        const methodMapBack: Record<string, MetodeType> = {
          VIDEO_CALL: "Video Call",
          CHAT: "Chat",
        };

        return {
          id: `TELE-${String(c.id).padStart(3, "0")}`,
          rawId: c.id,
          user: c.user?.nama || "Pasien",
          userInitials: getInitials(c.user?.nama || "Pasien"),
          userColor: getAvatarColor(c.user?.nama || "Pasien"),
          nutritionist: c.ahliGizi?.nama || "Spesialis",
          nutriInitials: getInitials(c.ahliGizi?.nama || "Spesialis"),
          nutriColor: getAvatarColor(c.ahliGizi?.nama || "Spesialis"),
          spesialisasi: c.ahliGizi?.spesialisasi || "Ahli Gizi",
          tanggal: formatDateOnly(c.jadwalSesi),
          waktu: formatTimeOnly(c.jadwalSesi),
          jadwalSesiIso: c.jadwalSesi,
          metode: methodMapBack[c.metode] || "Video Call",
          total: c.transaksi?.totalHarga || 0,
          status: statusMapBack[c.status] || "Menunggu",
          createdAt: formatDatetimeID(c.createdAt),
          paidAt: c.transaksi?.statusBayar === "SUCCESS" ? formatDatetimeID(c.updatedAt) : null,
          dateSort: c.jadwalSesi ? c.jadwalSesi.split("T")[0] : "",
          linkMeeting: c.linkMeeting || "",
          catatan: c.catatanKonsultasi || "",
        };
      };

      let mapped = res.consultations.map(mapBackendConsultation);

      // Client-side sorting
      mapped = [...mapped].sort((a, b) => {
        if (sortField === "total") {
          return sortAsc ? a.total - b.total : b.total - a.total;
        } else {
          return sortAsc ? a.dateSort.localeCompare(b.dateSort) : b.dateSort.localeCompare(a.dateSort);
        }
      });

      setData(mapped);
      setStats({
        total: res.stats.total,
        revenue: res.stats.revenue,
        confirmed: res.stats.confirmed,
        booked: res.stats.booked,
      });
      setTotalPages(res.pagination.totalPages);
      setTotalCount(res.pagination.total);

    } catch (error) {
      console.error("Failed to load consultations", error);
      toast.error("Gagal memuat log tele-nutritionist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, [search, filterStatus, filterMetode, sortField, sortAsc, dateFrom, dateTo, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus, filterMetode, dateFrom, dateTo]);

  async function handleSaveEdit(payload: any) {
    if (!editTarget) return;
    try {
      await adminService.updateConsultation(editTarget.rawId, payload);
      toast.success("Jadwal & status sesi berhasil diperbarui!");
      fetchConsultations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal mengubah detail sesi");
    } finally {
      setEditTarget(null);
    }
  }

  async function handleExport() {
    toast.loading("Menyiapkan data ekspor...");
    try {
      const params: any = {
        search: search.trim() || undefined,
        page: 1,
        limit: 999999, // fetch all records that match the filters
      };

      if (filterStatus !== "Semua") {
        const statMap: Record<string, string> = {
          Menunggu: "BOOKED",
          "Akan Datang": "CONFIRMED",
          Berlangsung: "IN_PROGRESS",
          Selesai: "DONE",
          Dibatalkan: "CANCELLED",
        };
        params.status = statMap[filterStatus];
      }

      if (filterMetode !== "Semua Metode") {
        params.metode = filterMetode === "Video Call" ? "VIDEO_CALL" : "CHAT";
      }

      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const res = await adminService.getConsultations(params);
      
      const mapBackendConsultation = (c: Consultation): TransaksiTele => {
        const statusMapBack: Record<string, Exclude<StatusTele, "Semua">> = {
          BOOKED: "Menunggu",
          CONFIRMED: "Akan Datang",
          IN_PROGRESS: "Berlangsung",
          DONE: "Selesai",
          CANCELLED: "Dibatalkan",
        };

        const methodMapBack: Record<string, MetodeType> = {
          VIDEO_CALL: "Video Call",
          CHAT: "Chat",
        };

        return {
          id: `TELE-${String(c.id).padStart(3, "0")}`,
          rawId: c.id,
          user: c.user?.nama || "Pasien",
          userInitials: getInitials(c.user?.nama || "Pasien"),
          userColor: getAvatarColor(c.user?.nama || "Pasien"),
          nutritionist: c.ahliGizi?.nama || "Spesialis",
          nutriInitials: getInitials(c.ahliGizi?.nama || "Spesialis"),
          nutriColor: getAvatarColor(c.ahliGizi?.nama || "Spesialis"),
          spesialisasi: c.ahliGizi?.spesialisasi || "Ahli Gizi",
          tanggal: formatDateOnly(c.jadwalSesi),
          waktu: formatTimeOnly(c.jadwalSesi),
          jadwalSesiIso: c.jadwalSesi,
          metode: methodMapBack[c.metode] || "Video Call",
          total: c.transaksi?.totalHarga || 0,
          status: statusMapBack[c.status] || "Menunggu",
          createdAt: formatDatetimeID(c.createdAt),
          paidAt: c.transaksi?.statusBayar === "SUCCESS" ? formatDatetimeID(c.updatedAt) : null,
          dateSort: c.jadwalSesi ? c.jadwalSesi.split("T")[0] : "",
          linkMeeting: c.linkMeeting || "",
          catatan: c.catatanKonsultasi || "",
        };
      };

      let mapped = res.consultations.map(mapBackendConsultation);

      // Client-side sorting
      mapped = [...mapped].sort((a, b) => {
        if (sortField === "total") {
          return sortAsc ? a.total - b.total : b.total - a.total;
        } else {
          return sortAsc ? a.dateSort.localeCompare(b.dateSort) : b.dateSort.localeCompare(a.dateSort);
        }
      });

      const headers = ["ID Sesi","Nama Pasien","Nama Spesialis","Jadwal Sesi","Metode","Biaya","Status"];
      const rows = mapped.map(t => [t.id, t.user, t.nutritionist, `${t.tanggal} ${t.waktu}`, t.metode, t.total, t.status]);
      const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "telenutritionist-sessions.csv";
      a.click();
      URL.revokeObjectURL(url);
      
      toast.dismiss();
      toast.success(`Berhasil mengekspor ${mapped.length} data sesi konsultasi`);
    } catch (error) {
      console.error("Failed to export consultations", error);
      toast.dismiss();
      toast.error("Gagal mengekspor data");
    }
  }

  function toggleSort(field: "dateSort" | "total") {
    if (sortField === field) setSortAsc(!sortAsc); else { setSortField(field); setSortAsc(false); }
  }

  const SortIcon = ({ field }: { field: "dateSort" | "total" }) =>
    sortField === field ? sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} /> : <ChevronDown size={12} className="text-gray-300" />;

  if (selectedSesi) {
    const current = data.find(t => t.id === selectedSesi.id) ?? selectedSesi;
    return (
      <AdminLayout>
        <div className="space-y-5">
          <div><h1 className="text-2xl font-bold text-gray-900">Konsultasi Tele-Nutritionist</h1></div>
          <SessionDetail 
            sesi={current} 
            onBack={() => setSelectedSesi(null)} 
            onEdit={() => setEditTarget(current)} 
          />
          {editTarget && <EditModal sesi={editTarget} onSave={handleSaveEdit} onClose={() => setEditTarget(null)} />}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Konsultasi Tele-Nutritionist</h1>
            <p className="text-sm text-gray-500 mt-1">Pantau sesi konsultasi aktif, reschedule jadwal, update link, dan kelola resume medis</p>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-5 flex flex-col gap-2 md:gap-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Konsultasi</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                <Users size={18} className="text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 line-clamp-1">Akumulasi sesi teregistrasi</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-5 flex flex-col gap-2 md:gap-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Pendapatan</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatRp(stats.revenue)}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                <TrendingUp size={18} className="text-orange-500" />
              </div>
            </div>
            <p className="text-xs text-gray-500 line-clamp-1">Dari pembayaran SUCCESS</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-5 flex flex-col gap-2 md:gap-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Sesi Terkonfirmasi</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.confirmed}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <CheckCircle size={18} className="text-blue-500" />
              </div>
            </div>
            <p className="text-xs text-gray-500 line-clamp-1">{stats.total ? Math.round((stats.confirmed / stats.total) * 100) : 0}% success rate</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-5 flex flex-col gap-2 md:gap-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Menunggu Pembayaran</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.booked}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center shrink-0">
                <XCircle size={18} className="text-yellow-500" />
              </div>
            </div>
            <p className="text-xs text-gray-500 line-clamp-1">Sesi masih status BOOKED</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Search + filter */}
          <div className="p-4 border-b border-gray-100 bg-white">
            <div className="flex flex-col gap-3">
              <div className="relative w-full">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 pr-3 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#4a7c59]/25 focus:border-[#4a7c59] transition"
                  placeholder="Cari ID, nama pasien, atau nutritionist..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2">
                {/* Status dropdown */}
                <div className="relative flex-1 w-full sm:w-auto">
                  <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as StatusTele)}
                    className="appearance-none border border-gray-200 rounded-lg px-3 py-2 pr-7 text-[13px] sm:text-sm text-gray-700 bg-white outline-none focus:ring-2 focus:ring-[#4a7c59]/25 focus:border-[#4a7c59] cursor-pointer w-full">
                    <option value="Semua">Semua Status</option>
                    <option value="Menunggu">Menunggu Pembayaran</option>
                    <option value="Akan Datang">Akan Datang</option>
                    <option value="Berlangsung">Berlangsung</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Dibatalkan">Dibatalkan</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                {/* Metode dropdown */}
                <div className="relative flex-1 w-full sm:w-auto">
                  <select value={filterMetode} onChange={e => setFilterMetode(e.target.value)}
                    className="appearance-none border border-gray-200 rounded-lg px-3 py-2 pr-7 text-[13px] sm:text-sm text-gray-700 bg-white outline-none focus:ring-2 focus:ring-[#4a7c59]/25 focus:border-[#4a7c59] cursor-pointer w-full">
                    {allMetodes.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                {/* Date range toggle */}
                <div className="flex-1 w-full sm:w-auto flex items-center justify-between sm:justify-start gap-1 border border-gray-200 rounded-lg px-3 py-2 bg-white text-[13px] sm:text-sm text-gray-700 cursor-pointer hover:bg-gray-50 transition" onClick={() => setShowDateFilter(!showDateFilter)}>
                  <div className="flex items-center">
                    <Calendar size={14} className="text-gray-400 mr-2" />
                    <span>{dateFrom ? dateFrom : "Dari"}</span>
                    <span className="text-gray-300 mx-2">–</span>
                    <span>{dateTo ? dateTo : "Sampai"}</span>
                  </div>
                  {(dateFrom || dateTo) && <span className="w-1.5 h-1.5 rounded-full bg-[#4a7c59] ml-2" />}
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:ml-auto">
                  <button onClick={handleExport} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white hover:bg-gray-50 whitespace-nowrap font-medium transition">
                    <Download size={14} /> Export CSV
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Date range inputs (expandable) */}
          {showDateFilter && (
            <div className="flex items-center gap-3 px-4 pb-3 flex-wrap bg-gray-50/50 py-2 border-b border-gray-100">
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
                <span className="text-xs text-gray-500 whitespace-nowrap">Dari</span>
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                  className="text-xs border-none bg-transparent focus:outline-none text-gray-700 font-medium" />
              </div>
              <span className="text-gray-400 text-sm">—</span>
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
                <span className="text-xs text-gray-500 whitespace-nowrap">Sampai</span>
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                  className="text-xs border-none bg-transparent focus:outline-none text-gray-700 font-medium" />
              </div>
              {(dateFrom || dateTo) && (
                <button onClick={() => { setDateFrom(""); setDateTo(""); }} className="text-xs text-red-500 hover:underline font-semibold ml-2">Reset</button>
              )}
            </div>
          )}

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#4a7c59]" />
                <p className="text-sm text-gray-400 font-medium">Memuat log sesi tele-nutritionist...</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID Sesi</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pasien</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Spesialis</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100/50" onClick={() => toggleSort("dateSort")}>
                      <span className="flex items-center gap-1">Jadwal Sesi <SortIcon field="dateSort" /></span>
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Metode</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100/50" onClick={() => toggleSort("total")}>
                      <span className="flex items-center gap-1">Biaya <SortIcon field="total" /></span>
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.length === 0 ? (
                    <tr><td colSpan={8} className="text-center py-12 text-gray-400 text-sm">Tidak ada sesi konsultasi ditemukan</td></tr>
                  ) : data.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-6 py-3.5 text-xs font-mono font-bold text-gray-600">{t.id}</td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full ${t.userColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>{t.userInitials}</div>
                          <span className="font-semibold text-gray-800 whitespace-nowrap text-sm">{t.user}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-full ${t.nutriColor} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>{t.nutriInitials}</div>
                          <div>
                            <p className="text-gray-800 font-semibold whitespace-nowrap text-xs">{t.nutritionist}</p>
                            <p className="text-gray-500 text-[11px]">{t.spesialisasi}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-sm text-gray-700 whitespace-nowrap font-medium">{t.tanggal}, <span className="text-xs text-gray-500">{t.waktu}</span></td>
                      <td className="px-6 py-3.5 text-sm text-gray-600 whitespace-nowrap">{t.metode}</td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${statusConfig[t.status].bg} ${statusConfig[t.status].text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[t.status].dot}`} />{t.status}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 font-bold text-gray-900 whitespace-nowrap">{formatRp(t.total)}</td>
                      <td className="px-6 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setSelectedSesi(t)} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-xs font-semibold">
                            Detail
                          </button>
                          <button onClick={() => setEditTarget(t)} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors text-xs font-semibold">
                            Reschedule
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3.5 border-t border-gray-100 bg-white">
            <p className="text-sm text-gray-500 order-2 sm:order-1">
              Menampilkan {data.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}–
              {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} dari {totalCount} sesi konsultasi
            </p>
            <div className="flex items-center gap-1 order-1 sm:order-2">
              <button 
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} 
                disabled={currentPage === 1} 
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={15} />
              </button>
              {getPaginationPages(currentPage, totalPages).map((p, i) => 
                p === "..." ? (
                  <span key={`e${i}`} className="px-2 text-gray-400 text-sm">…</span>
                ) : (
                  <button 
                    key={p} 
                    onClick={() => setCurrentPage(p as number)} 
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === p 
                        ? "bg-[#4a7c59] text-white" 
                        : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
              <button 
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} 
                disabled={currentPage === totalPages || totalPages === 0} 
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {editTarget && <EditModal sesi={editTarget} onSave={handleSaveEdit} onClose={() => setEditTarget(null)} />}
    </AdminLayout>
  );
}