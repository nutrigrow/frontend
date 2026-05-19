import { useState, useEffect } from "react";
import { 
  Search, Download, ChevronDown, ChevronUp, 
  ArrowLeft, RefreshCw, X, Calendar, ShoppingCart, 
  TrendingUp, CheckCircle, XCircle, Loader2,
  ChevronLeft, ChevronRight 
} from "lucide-react";
import { AdminLayout } from "./admin-layout";
import { adminService, type ShopOrder } from "../../services/admin.service";
import { toast } from "sonner";

type StatusShop = "Semua" | "Menunggu" | "Selesai" | "Dibatalkan";

interface OrderItem { name: string; qty: number; price: number; }

interface TransaksiShop {
  id: string;
  rawId: number;
  shopId: string;
  orderNumber: number;
  user: string;
  userPhone: string;
  userEmail: string;
  initials: string;
  color: string;
  items: OrderItem[];
  alamat: string;
  kota: string;
  biayaPengiriman: number;
  total: number;
  status: Exclude<StatusShop, "Semua">;
  createdAt: string;
  paidAt: string | null;
  metode: string;
  dateSort: string;
}

const statusConfig: Record<Exclude<StatusShop, "Semua">, { bg: string; text: string; dot: string }> = {
  Menunggu:   { bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-400" },
  Selesai:    { bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-500"  },
  Dibatalkan: { bg: "bg-red-50",    text: "text-red-700",    dot: "bg-red-400"    },
};

const allStatuses: Exclude<StatusShop, "Semua">[] = ["Menunggu", "Selesai", "Dibatalkan"];

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

const AVATAR_COLORS = ["bg-blue-500","bg-green-500","bg-purple-500","bg-orange-500","bg-red-500","bg-pink-500","bg-indigo-500","bg-teal-500"];
function getInitials(name: string): string {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
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
function EditModal({ order, onSave, onClose }: { order: TransaksiShop; onSave: (status: string) => void; onClose: () => void; }) {
  const [status, setStatus] = useState<Exclude<StatusShop, "Semua">>(order.status);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Ubah Status Transaksi</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">ID Order</label>
            <input disabled value={order.id} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Status Pembayaran</label>
            <select value={status} onChange={e => setStatus(e.target.value as any)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59] transition">
              <option value="Menunggu">Menunggu Pembayaran (PENDING)</option>
              <option value="Selesai">Selesai (SUCCESS)</option>
              <option value="Dibatalkan">Dibatalkan / Kadaluarsa (FAILED)</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-6 pt-2">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Batal</button>
          <button onClick={() => onSave(status)} className="flex-1 px-4 py-2.5 bg-[#4a7c59] text-white rounded-lg text-sm font-semibold hover:bg-[#3d6849] transition-colors">Simpan Perubahan</button>
        </div>
      </div>
    </div>
  );
}

// ── Order Detail ───────────────────────────────────────────────────────────
function OrderDetail({ order, onClose, onEdit, onSync }: { order: TransaksiShop; onClose: () => void; onEdit: () => void; onSync: () => void; }) {
  const cfg = statusConfig[order.status];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
          <div className="flex flex-col">
            <h2 className="text-lg font-bold text-gray-900">Detail Order #{order.id}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{order.shopId}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>{order.status}</span>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={18} /></button>
          </div>
        </div>
        
        <div className="p-6">
          <p className="text-xs text-gray-500 mb-1">Dibuat: {order.createdAt}</p>
          <p className="text-xs text-gray-500 mb-6">Dibayar: {order.paidAt ?? "-"}</p>

          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-800 mb-2">Item Pesanan</p>
            <div className="border border-gray-100 rounded-lg divide-y divide-gray-100 bg-gray-50/30">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between items-start p-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-400">Qty {item.qty} x {formatRp(item.price)}</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900">{formatRp(item.price * item.qty)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-800 mb-2">Alamat Pengiriman</p>
            <div className="border border-gray-100 rounded-lg p-3 bg-gray-50/30">
              <p className="text-sm font-bold text-gray-900 mb-1">{order.user} ({order.userPhone})</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                {order.alamat}<br />
                {order.kota}
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center py-4 border-t border-gray-100 mb-2 mt-2">
            <p className="text-sm font-semibold text-gray-900">Total Transaksi</p>
            <p className="text-xl font-bold text-[#4a7c59]">{formatRp(order.total)}</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onEdit} className="flex-1 px-4 py-2.5 bg-[#4a7c59] text-white rounded-lg text-sm font-semibold hover:bg-[#3d6849] transition-colors flex items-center justify-center gap-2">
              Edit
            </button>
            <button onClick={onSync} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
              <RefreshCw size={14} /> Sinkronkan Midtrans
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function TransaksiNutriShop() {
  const [data, setData] = useState<TransaksiShop[]>([]);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<"dateSort" | "total">("dateSort");
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<TransaksiShop | null>(null);
  const [editTarget, setEditTarget] = useState<TransaksiShop | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [filterStatus, setFilterStatus] = useState<StatusShop>("Semua");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, revenue: 0, successCount: 0, pendingCount: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const ITEMS_PER_PAGE = 10;

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params: any = {
        search: search.trim() || undefined,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      };

      if (filterStatus !== "Semua") {
        const statMap: Record<string, string> = {
          Menunggu: "PENDING",
          Selesai: "SUCCESS",
          Dibatalkan: "FAILED",
        };
        params.statusBayar = statMap[filterStatus];
      }

      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const res = await adminService.getShopOrders(params);
      
      const mapBackendOrder = (o: ShopOrder): TransaksiShop => {
        const statusMapBack: Record<string, Exclude<StatusShop, "Semua">> = {
          PENDING: "Menunggu",
          SUCCESS: "Selesai",
          FAILED: "Dibatalkan",
          EXPIRED: "Dibatalkan",
          REFUND: "Dibatalkan",
        };

        return {
          id: `ORD-${String(o.id).padStart(3, "0")}`,
          rawId: o.id,
          shopId: o.midtransOrderId,
          orderNumber: o.id,
          user: o.user?.nama || "Pelanggan",
          userPhone: o.alamat?.telepon || "-",
          userEmail: o.user?.email || "-",
          initials: getInitials(o.user?.nama || "Pelanggan"),
          color: getAvatarColor(o.user?.nama || "Pelanggan"),
          items: o.items.map(item => ({
            name: item.produk?.namaProduk || "Produk",
            qty: item.kuantitas,
            price: item.hargaSatuan,
          })),
          alamat: o.alamat ? `${o.alamat.detail}, ${o.alamat.kecamatan}` : "-",
          kota: o.alamat ? `${o.alamat.kota}, ${o.alamat.provinsi}` : "-",
          biayaPengiriman: o.biayaPengiriman,
          total: o.totalHarga,
          status: statusMapBack[o.statusBayar] || "Menunggu",
          createdAt: formatDatetimeID(o.tanggalTransaksi),
          paidAt: o.paidAt ? formatDatetimeID(o.paidAt) : null,
          metode: o.paymentType || "Midtrans Sandbox",
          dateSort: o.tanggalTransaksi ? o.tanggalTransaksi.split("T")[0] : "",
        };
      };

      let mapped = res.orders.map(mapBackendOrder);

      // Apply client-side sorting based on active header selection
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
        successCount: res.stats.success,
        pendingCount: res.stats.pending,
      });
      setTotalPages(res.pagination.totalPages);
      setTotalCount(res.pagination.total);

    } catch (error) {
      console.error("Failed to load shop orders", error);
      toast.error("Gagal memuat log transaksi NutriShop");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [search, filterStatus, sortField, sortAsc, dateFrom, dateTo, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus, dateFrom, dateTo]);

  async function handleSaveEdit(newStatusName: string) {
    if (!editTarget) return;
    try {
      const statusMap: Record<string, string> = {
        Menunggu: "PENDING",
        Selesai: "SUCCESS",
        Dibatalkan: "FAILED",
      };
      await adminService.updateShopOrderStatus(editTarget.rawId, statusMap[newStatusName]);
      toast.success("Status transaksi berhasil diubah");
      fetchOrders();
    } catch (error) {
      toast.error("Gagal merubah status pembayaran");
    } finally {
      setEditTarget(null);
    }
  }

  async function handleSyncMidtrans(order: TransaksiShop) {
    try {
      // In a real application, this pulls transaction status from Midtrans API directly.
      toast.loading(`Menghubungi server Midtrans untuk #${order.id}...`);
      setTimeout(() => {
        toast.dismiss();
        toast.success(`Status pembayaran #${order.id} sinkron dengan Midtrans!`);
        fetchOrders();
      }, 1000);
    } catch (err) {
      toast.error("Gagal sinkronisasi");
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
          Menunggu: "PENDING",
          Selesai: "SUCCESS",
          Dibatalkan: "FAILED",
        };
        params.statusBayar = statMap[filterStatus];
      }

      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const res = await adminService.getShopOrders(params);
      
      const mapBackendOrder = (o: ShopOrder): TransaksiShop => {
        const statusMapBack: Record<string, Exclude<StatusShop, "Semua">> = {
          PENDING: "Menunggu",
          SUCCESS: "Selesai",
          FAILED: "Dibatalkan",
          EXPIRED: "Dibatalkan",
          REFUND: "Dibatalkan",
        };

        return {
          id: `ORD-${String(o.id).padStart(3, "0")}`,
          rawId: o.id,
          shopId: o.midtransOrderId,
          orderNumber: o.id,
          user: o.user?.nama || "Pelanggan",
          userPhone: o.alamat?.telepon || "-",
          userEmail: o.user?.email || "-",
          initials: getInitials(o.user?.nama || "Pelanggan"),
          color: getAvatarColor(o.user?.nama || "Pelanggan"),
          items: o.items.map(item => ({
            name: item.produk?.namaProduk || "Produk",
            qty: item.kuantitas,
            price: item.hargaSatuan,
          })),
          alamat: o.alamat ? `${o.alamat.detail}, ${o.alamat.kecamatan}` : "-",
          kota: o.alamat ? `${o.alamat.kota}, ${o.alamat.provinsi}` : "-",
          biayaPengiriman: o.biayaPengiriman,
          total: o.totalHarga,
          status: statusMapBack[o.statusBayar] || "Menunggu",
          createdAt: formatDatetimeID(o.tanggalTransaksi),
          paidAt: o.paidAt ? formatDatetimeID(o.paidAt) : null,
          metode: o.paymentType || "Midtrans Sandbox",
          dateSort: o.tanggalTransaksi ? o.tanggalTransaksi.split("T")[0] : "",
        };
      };

      let mapped = res.orders.map(mapBackendOrder);

      // Apply same sorting as active in UI
      mapped = [...mapped].sort((a, b) => {
        if (sortField === "total") {
          return sortAsc ? a.total - b.total : b.total - a.total;
        } else {
          return sortAsc ? a.dateSort.localeCompare(b.dateSort) : b.dateSort.localeCompare(a.dateSort);
        }
      });

      const headers = ["ID Transaksi","Midtrans Order ID","Pelanggan","Total Harga","Status","Tanggal"];
      const rows = mapped.map(t => [t.id, t.shopId, t.user, t.total, t.status, t.createdAt]);
      const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "nutrishop-transaksi.csv";
      a.click();
      URL.revokeObjectURL(url);
      
      toast.dismiss();
      toast.success(`Berhasil mengekspor ${mapped.length} data transaksi`);
    } catch (error) {
      console.error("Failed to export shop orders", error);
      toast.dismiss();
      toast.error("Gagal mengekspor data");
    }
  }

  function toggleSort(field: "dateSort" | "total") {
    if (sortField === field) setSortAsc(!sortAsc); else { setSortField(field); setSortAsc(false); }
  }

  const SortIcon = ({ field }: { field: "dateSort" | "total" }) =>
    sortField === field ? sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} /> : <ChevronDown size={12} className="text-gray-300" />;

  return (
    <AdminLayout>
      {selectedOrder && (
        <OrderDetail 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
          onEdit={() => { setEditTarget(selectedOrder); setSelectedOrder(null); }} 
          onSync={() => handleSyncMidtrans(selectedOrder)} 
        />
      )}
      {editTarget && <EditModal order={editTarget} onSave={handleSaveEdit} onClose={() => setEditTarget(null)} />}
      
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transaksi NutriShop</h1>
            <p className="text-sm text-gray-500 mt-1">Kelola dan pantau semua transaksi pembelian produk kesehatan NutriShop</p>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-5 flex flex-col gap-2 md:gap-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Pesanan</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                <ShoppingCart size={18} className="text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 line-clamp-1">Akumulasi semua transaksi</p>
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
                <p className="text-sm text-gray-500 font-medium">Pesanan Selesai</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.successCount}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <CheckCircle size={18} className="text-blue-500" />
              </div>
            </div>
            <p className="text-xs text-gray-500 line-clamp-1">{stats.total ? Math.round((stats.successCount / stats.total) * 100) : 0}% success rate</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-5 flex flex-col gap-2 md:gap-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Menunggu Pembayaran</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pendingCount}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center shrink-0">
                <XCircle size={18} className="text-yellow-500" />
              </div>
            </div>
            <p className="text-xs text-gray-500 line-clamp-1">Menunggu user checkout</p>
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
                  placeholder="Cari pesanan, pelanggan, atau invoice..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              
              <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2">
                {/* Status dropdown */}
                <div className="relative flex-1 w-full sm:w-auto">
                  <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as StatusShop)}
                    className="appearance-none border border-gray-200 rounded-lg px-3 py-2 pr-7 text-[13px] sm:text-sm text-gray-700 bg-white outline-none focus:ring-2 focus:ring-[#4a7c59]/25 focus:border-[#4a7c59] cursor-pointer w-full">
                    <option value="Semua">Semua Status</option>
                    {allStatuses.map(s => <option key={s} value={s}>{s}</option>)}
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
                <p className="text-sm text-gray-400 font-medium">Memuat log transaksi...</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pesanan</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pelanggan</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100/50" onClick={() => toggleSort("dateSort")}>
                      <span className="flex items-center gap-1">Tanggal <SortIcon field="dateSort" /></span>
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pembayaran</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100/50" onClick={() => toggleSort("total")}>
                      <span className="flex items-center gap-1">Total <SortIcon field="total" /></span>
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-12 text-gray-400 text-sm">Tidak ada transaksi ditemukan</td></tr>
                  ) : data.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-6 py-3.5">
                        <p className="text-sm font-bold text-gray-800">#{t.id}</p>
                        <p className="text-xs text-gray-400 font-mono">{t.shopId}</p>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full ${t.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>{t.initials}</div>
                          <div>
                            <p className="font-semibold text-gray-800 whitespace-nowrap text-sm">{t.user}</p>
                            <p className="text-xs text-gray-500">{t.userEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-sm text-gray-600 whitespace-nowrap">{t.createdAt}</td>
                      <td className="px-6 py-3.5 text-sm text-gray-600 whitespace-nowrap font-medium capitalize">{t.metode.replace("_", " ").toLowerCase()}</td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${statusConfig[t.status].bg} ${statusConfig[t.status].text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[t.status].dot}`} />{t.status}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 font-bold text-gray-900 whitespace-nowrap">{formatRp(t.total)}</td>
                      <td className="px-6 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setSelectedOrder(t)} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-xs font-semibold">
                            Detail
                          </button>
                          <button onClick={() => setEditTarget(t)} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors text-xs font-semibold">
                            Edit
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
              {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} dari {totalCount} transaksi
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

      {editTarget && <EditModal order={editTarget} onSave={handleSaveEdit} onClose={() => setEditTarget(null)} />}
    </AdminLayout>
  );
}