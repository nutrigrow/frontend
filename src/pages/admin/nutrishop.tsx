import { useState } from "react";
import { Search, Filter, Download, ChevronDown, ChevronUp, ArrowLeft, RefreshCw, X, Calendar, ShoppingCart, TrendingUp, CheckCircle, XCircle } from "lucide-react";

type StatusShop = "Semua" | "Menunggu" | "Diproses" | "Dikirim" | "Selesai" | "Dibatalkan";

interface OrderItem { name: string; qty: number; price: number; }

interface TransaksiShop {
  id: string; shopId: string; orderNumber: number;
  user: string; userPhone: string; userEmail: string; initials: string; color: string;
  items: OrderItem[];
  alamat: string; kota: string;
  biayaPengiriman: number; total: number;
  status: Exclude<StatusShop, "Semua">;
  createdAt: string; paidAt: string | null; metode: string;
  dateSort: string;
}

const initialData: TransaksiShop[] = [
  { id: "ORD-001", shopId: "SHOP-1778660568639-13", orderNumber: 29, user: "Sarah Johnson",  userPhone: "08569966999", userEmail: "sarah.johnson@email.com",  initials: "SJ", color: "bg-blue-500",   items: [{ name: "Paket 2 Box Susu UHT",   qty: 1, price: 99000  }],                                                     alamat: "Kos Aksara Sukawening",          kota: "Hegarmanah, Jatinangor, Sumedang 45363", biayaPengiriman: 5000,  total: 750000,  status: "Selesai",    createdAt: "22 Mei 2026, 10.30", paidAt: "22 Mei 2026, 10.45",   metode: "Kartu Kredit",       dateSort: "2026-05-22" },
  { id: "ORD-002", shopId: "SHOP-1778660568639-14", orderNumber: 30, user: "Michael Brown",  userPhone: "08523398078", userEmail: "michael.brown@email.com",  initials: "MB", color: "bg-green-500",  items: [{ name: "Prenatal Core+ Complex", qty: 1, price: 50000  }, { name: "Stage 1 Veggie Mix", qty: 2, price: 27000 }], alamat: "Jalan Damai 1 No. 65 RT 03/06",  kota: "Hegarmanah, Jatinangor, Sumedang 45363", biayaPengiriman: 5000,  total: 420000,  status: "Selesai",    createdAt: "21 Mei 2026, 09.15", paidAt: "21 Mei 2026, 09.30",   metode: "Transfer Bank BCA",  dateSort: "2026-05-21" },
  { id: "ORD-003", shopId: "SHOP-1778660568639-15", orderNumber: 31, user: "Emily Davis",    userPhone: "08512345678", userEmail: "emily.davis@email.com",    initials: "ED", color: "bg-purple-500", items: [{ name: "Kids Multivitamin",      qty: 2, price: 75000  }],                                                     alamat: "Jalan Sukajadi No. 1 RT 03/06",  kota: "Sukajadi, Bandung 40161",                biayaPengiriman: 10000, total: 320000,  status: "Diproses",   createdAt: "20 Mei 2026, 14.00", paidAt: "20 Mei 2026, 14.15",   metode: "E-Wallet",           dateSort: "2026-05-20" },
  { id: "ORD-004", shopId: "SHOP-1778660568639-16", orderNumber: 32, user: "David Wilson",   userPhone: "08598765432", userEmail: "david.wilson@email.com",   initials: "DW", color: "bg-orange-500", items: [{ name: "Organic Baby Puree",     qty: 3, price: 30000  }],                                                     alamat: "Jalan Merdeka No. 10",           kota: "Antapani, Bandung 40291",                biayaPengiriman: 8000,  total: 1250000, status: "Selesai",    createdAt: "19 Mei 2026, 07.30", paidAt: "19 Mei 2026, 07.45",   metode: "Kartu Kredit",       dateSort: "2026-05-19" },
  { id: "ORD-005", shopId: "SHOP-1778660568639-17", orderNumber: 33, user: "Jessica Taylor", userPhone: "08534567890", userEmail: "jessica.taylor@email.com", initials: "JT", color: "bg-red-500",    items: [{ name: "Suplemen Vit A",         qty: 1, price: 45000  }],                                                     alamat: "Perum Griya Indah Blok C No. 5", kota: "Cimahi, Bandung 40512",                  biayaPengiriman: 5000,  total: 180000,  status: "Dibatalkan", createdAt: "18 Mei 2026, 16.10", paidAt: null,                    metode: "Transfer Bank",      dateSort: "2026-05-18" },
];

const statusConfig: Record<Exclude<StatusShop, "Semua">, { bg: string; text: string; dot: string }> = {
  Menunggu:   { bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-400" },
  Diproses:   { bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-400"   },
  Dikirim:    { bg: "bg-teal-50",   text: "text-teal-700",   dot: "bg-teal-400"   },
  Selesai:    { bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-500"  },
  Dibatalkan: { bg: "bg-red-50",    text: "text-red-700",    dot: "bg-red-400"    },
};

const allStatuses: Exclude<StatusShop, "Semua">[] = ["Menunggu", "Diproses", "Dikirim", "Selesai", "Dibatalkan"];
const allMethods = ["Semua Metode", "Kartu Kredit", "Transfer Bank BCA", "Transfer Bank", "E-Wallet", "QRIS", "Virtual Account"];

function formatRp(n: number) { return "Rp" + n.toLocaleString("id-ID"); }

// ── Edit Modal ─────────────────────────────────────────────────────────────
function EditModal({ order, onSave, onClose }: { order: TransaksiShop; onSave: (u: TransaksiShop) => void; onClose: () => void; }) {
  const [status, setStatus] = useState(order.status);
  const [metode, setMetode] = useState(order.metode);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Edit Transaksi</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">ID Order</label>
            <input disabled value={order.id} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Pengguna</label>
            <input disabled value={order.user} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value as typeof status)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59] transition">
                {allStatuses.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Metode Bayar</label>
              <select value={metode} onChange={e => setMetode(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59] transition">
                {["QRIS", "Virtual Account", "E-Wallet", "Kartu Kredit", "Transfer Bank BCA", "Transfer Bank"].map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Total</label>
            <input disabled value={formatRp(order.total)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg py-2.5 hover:bg-gray-50 transition">Batal</button>
          <button onClick={() => onSave({ ...order, status, metode })} className="flex-1 bg-[#4a7c59] hover:bg-[#2d5a38] text-white text-sm font-semibold rounded-lg py-2.5 transition">Simpan Perubahan</button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Modal ───────────────────────────────────────────────────────────
function DeleteModal({ order, onConfirm, onClose }: { order: TransaksiShop; onConfirm: () => void; onClose: () => void; }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 text-2xl">🗑️</div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Hapus Transaksi?</h2>
        <p className="text-sm text-gray-500 mb-6">Transaksi <span className="font-semibold text-gray-800">{order.id}</span> milik <span className="font-semibold text-gray-800">{order.user}</span> akan dihapus permanen.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg py-2.5 hover:bg-gray-50 transition">Batal</button>
          <button onClick={onConfirm} className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg py-2.5 transition">Hapus</button>
        </div>
      </div>
    </div>
  );
}

// ── Order Detail ───────────────────────────────────────────────────────────
function OrderDetail({ order, onBack, onEdit, onDelete }: { order: TransaksiShop; onBack: () => void; onEdit: () => void; onDelete: () => void; }) {
  const cfg = statusConfig[order.status];
  return (
    <div className="space-y-4 max-w-2xl">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition">
        <ArrowLeft size={15} /> Kembali ke daftar
      </button>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-start justify-between mb-1">
          <p className="text-xs text-gray-400">{order.shopId}</p>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>{order.status}</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900">Order #{order.orderNumber}</h2>
        <p className="text-xs text-gray-400 mt-0.5">Dibuat: {order.createdAt}</p>
        <p className="text-xs text-gray-400">Dibayar: {order.paidAt ?? "-"}</p>

        <div className="mt-5">
          <p className="text-sm font-semibold text-gray-800 mb-2">Item Pesanan</p>
          <div className="border border-gray-100 rounded-lg divide-y divide-gray-100">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between items-start p-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">{item.name}</p>
                  <p className="text-xs text-gray-400">Qty {item.qty} x {formatRp(item.price)}</p>
                </div>
                <p className="text-sm font-semibold text-gray-900">{formatRp(item.price * item.qty)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm font-semibold text-gray-800 mb-2">Alamat Pengiriman</p>
          <div className="border border-gray-100 rounded-lg p-3">
            <p className="text-sm font-medium text-gray-800">{order.user} ({order.userPhone})</p>
            <p className="text-sm text-gray-500">{order.alamat}</p>
            <p className="text-sm text-gray-500">{order.kota}</p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-500"><span>Biaya Pengiriman</span><span>{formatRp(order.biayaPengiriman)}</span></div>
          <div className="flex justify-between text-sm font-bold pt-1 border-t border-gray-100">
            <span className="text-gray-900">Total</span><span className="text-[#4a7c59]">{formatRp(order.total)}</span>
          </div>
        </div>

        <div className="mt-5 flex gap-3">
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
export default function TransaksiNutriShop() {
  const [data, setData] = useState<TransaksiShop[]>(initialData);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<"dateSort" | "total">("dateSort");
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<TransaksiShop | null>(null);
  const [editTarget, setEditTarget] = useState<TransaksiShop | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TransaksiShop | null>(null);
  const [dateFrom, setDateFrom] = useState("2026-05-01");
  const [dateTo, setDateTo] = useState("2026-05-31");
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [filterStatus, setFilterStatus] = useState<StatusShop>("Semua");
  const [filterMetode, setFilterMetode] = useState("Semua Metode");

  function handleSaveEdit(updated: TransaksiShop) {
    setData(prev => prev.map(t => t.id === updated.id ? updated : t));
    if (selectedOrder?.id === updated.id) setSelectedOrder(updated);
    setEditTarget(null);
  }

  function handleDelete(id: string) {
    setData(prev => prev.filter(t => t.id !== id));
    setDeleteTarget(null);
    setSelectedOrder(null);
  }

  const filtered = data
    .filter(t => {
      if (filterStatus !== "Semua" && t.status !== filterStatus) return false;
      if (filterMetode !== "Semua Metode" && t.metode !== filterMetode) return false;
      if (search && !t.user.toLowerCase().includes(search.toLowerCase()) && !t.id.toLowerCase().includes(search.toLowerCase()) && !t.userEmail.toLowerCase().includes(search.toLowerCase()) && !t.items.some(i => i.name.toLowerCase().includes(search.toLowerCase()))) return false;
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

  if (selectedOrder) {
    const current = data.find(t => t.id === selectedOrder.id) ?? selectedOrder;
    return (
      <div className="space-y-5">
        <div><h1 className="text-2xl font-bold text-gray-900">Transaksi NutriShop</h1></div>
        <OrderDetail order={current} onBack={() => setSelectedOrder(null)} onEdit={() => setEditTarget(current)} onDelete={() => setDeleteTarget(current)} />
        {editTarget && <EditModal order={editTarget} onSave={handleSaveEdit} onClose={() => setEditTarget(null)} />}
        {deleteTarget && <DeleteModal order={deleteTarget} onConfirm={() => handleDelete(deleteTarget.id)} onClose={() => setDeleteTarget(null)} />}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transaksi NutriShop</h1>
          <p className="text-sm text-gray-500 mt-0.5">Kelola semua transaksi pembelian produk NutriShop</p>
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
              <p className="text-xs text-gray-500 font-medium">Total Pesanan</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{data.length}</p>
              <p className="text-xs text-green-500 mt-0.5 font-medium">↑ +12 minggu ini</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
              <ShoppingCart size={18} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Pendapatan</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{formatRp(totalPendapatan)}</p>
              <p className="text-xs text-green-500 mt-0.5 font-medium">↑ +15,8% minggu ini</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-500 flex-shrink-0">
              <TrendingUp size={18} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Pesanan Selesai</p>
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
              <p className="text-xs text-red-400 mt-0.5 font-medium">↑ +12 minggu ini</p>
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
              placeholder="Cari pesanan, pelanggan, atau invoice..." value={search} onChange={e => setSearch(e.target.value)} />
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
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as StatusShop)}
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
              {allMethods.map(m => <option key={m}>{m}</option>)}
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
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pesanan</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pelanggan</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => toggleSort("dateSort")}>
                  <span className="flex items-center gap-1">Tanggal <SortIcon field="dateSort" /></span>
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pembayaran</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => toggleSort("total")}>
                  <span className="flex items-center gap-1">Total <SortIcon field="total" /></span>
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400 text-sm">Tidak ada transaksi ditemukan</td></tr>
              ) : filtered.map(t => (
                <tr key={t.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-gray-800">#{t.id}</p>
                    <p className="text-xs text-gray-400 font-mono">{t.shopId}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full ${t.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>{t.initials}</div>
                      <div>
                        <p className="font-medium text-gray-800 whitespace-nowrap text-sm">{t.user}</p>
                        <p className="text-xs text-gray-400">{t.userEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{t.createdAt}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{t.metode}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${statusConfig[t.status].bg} ${statusConfig[t.status].text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[t.status].dot}`} />{t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{formatRp(t.total)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setSelectedOrder(t)} className="text-xs text-[#4a7c59] hover:text-[#2d5a38] font-medium transition">Detail</button>
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

      {editTarget && <EditModal order={editTarget} onSave={handleSaveEdit} onClose={() => setEditTarget(null)} />}
      {deleteTarget && <DeleteModal order={deleteTarget} onConfirm={() => handleDelete(deleteTarget.id)} onClose={() => setDeleteTarget(null)} />}
    </div>
  );
}