import { useState } from "react";

// ── Types ──────────────────────────────────────────────────────────────────
type OrderStatus = "semua" | "dikemas" | "dikirim" | "selesai" | "dibatalkan";

interface OrderItem {
  name: string;
  variant: string;
  qty: number;
  price: number;
  originalPrice?: number;
  emoji: string;
}

interface Order {
  id: string;
  status: Exclude<OrderStatus, "semua">;
  items: OrderItem[];
  total: number;
  date: string;
}

// ── Static data ────────────────────────────────────────────────────────────
const orders: Order[] = [
  {
    id: "ORD-001",
    status: "selesai",
    date: "12 Mar 2026",
    total: 104000,
    items: [
      { name: "Prenatal Core+ Complex", variant: "60 Capsules", qty: 1, price: 50000, emoji: "💊" },
      { name: "Stage 1 Veggie Mix",     variant: "Pack of 12",  qty: 2, price: 40000, originalPrice: 45000, emoji: "🥦" },
    ],
  },
  {
    id: "ORD-002",
    status: "dikirim",
    date: "15 Apr 2026",
    total: 75000,
    items: [
      { name: "Kids Multivitamin",  variant: "30 Tablets", qty: 1, price: 75000, emoji: "🧴" },
    ],
  },
  {
    id: "ORD-003",
    status: "dikemas",
    date: "18 Apr 2026",
    total: 50000,
    items: [
      { name: "Suplemen Vit A", variant: "60 Capsules", qty: 2, price: 25000, emoji: "💊" },
    ],
  },
  {
    id: "ORD-004",
    status: "dibatalkan",
    date: "5 Mar 2026",
    total: 90000,
    items: [
      { name: "Organic Baby Puree", variant: "Pack of 6", qty: 3, price: 30000, emoji: "🥣" },
    ],
  },
];

const tabs: { key: OrderStatus; label: string }[] = [
  { key: "semua",      label: "Semua"      },
  { key: "dikemas",    label: "Dikemas"    },
  { key: "dikirim",    label: "Dikirim"    },
  { key: "selesai",    label: "Selesai"    },
  { key: "dibatalkan", label: "Dibatalkan" },
];

const statusConfig: Record<Exclude<OrderStatus, "semua">, { label: string; color: string; bg: string }> = {
  dikemas:    { label: "Dikemas",    color: "#f97316", bg: "#fff7ed" },
  dikirim:    { label: "Dikirim",    color: "#3b82f6", bg: "#eff6ff" },
  selesai:    { label: "Selesai",    color: "#22c55e", bg: "#f0fdf4" },
  dibatalkan: { label: "Dibatalkan", color: "#ef4444", bg: "#fef2f2" },
};

function formatRp(n: number) {
  return "Rp" + n.toLocaleString("id-ID");
}

// ── Order Card ─────────────────────────────────────────────────────────────
function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = statusConfig[order.status];
  const visibleItems = expanded ? order.items : order.items.slice(0, 1);
  const hasMore = order.items.length > 1;

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500">{order.id}</span>
          <span className="text-gray-300">·</span>
          <span className="text-xs text-gray-400">{order.date}</span>
        </div>
        <span
          className="text-xs font-bold px-3 py-1 rounded-full"
          style={{ color: cfg.color, backgroundColor: cfg.bg }}
        >
          {cfg.label}
        </span>
      </div>

      {/* Items */}
      <div className="px-5 py-4 space-y-4">
        {visibleItems.map((item, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-3xl flex-shrink-0">
              {item.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
              <p className="text-xs text-gray-400">{item.variant}</p>
              <p className="text-xs text-gray-400 mt-0.5">x{item.qty}</p>
            </div>
            <div className="text-right flex-shrink-0">
              {item.originalPrice && (
                <p className="text-xs text-gray-400 line-through">{formatRp(item.originalPrice)}</p>
              )}
              <p className="text-sm font-bold text-gray-900">{formatRp(item.price)}</p>
            </div>
          </div>
        ))}

        {/* Lihat semua toggle */}
        {hasMore && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs font-semibold text-[#4d7c0f] flex items-center gap-1 hover:underline"
          >
            {expanded ? "Sembunyikan ▲" : `Lihat Semua (${order.items.length} produk) ▼`}
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
        <div>
          <p className="text-xs text-gray-500">Total {order.items.reduce((s, i) => s + i.qty, 0)} produk</p>
          <p className="text-sm font-bold text-gray-900">{formatRp(order.total)}</p>
        </div>
        <div className="flex gap-2">
          {order.status === "selesai" && (
            <button className="text-sm font-semibold border-2 border-[#4d7c0f] text-[#4d7c0f] rounded-xl px-4 py-2 hover:bg-green-50 transition">
              Nilai
            </button>
          )}
          {order.status === "selesai" && (
            <button className="text-sm font-semibold bg-[#4d7c0f] text-white rounded-xl px-4 py-2 hover:bg-[#3a5a00] transition">
              Beli Lagi
            </button>
          )}
          {order.status === "dikirim" && (
            <button className="text-sm font-semibold bg-[#4d7c0f] text-white rounded-xl px-4 py-2 hover:bg-[#3a5a00] transition">
              Lacak Pesanan
            </button>
          )}
          {order.status === "dikemas" && (
            <button className="text-sm font-semibold border-2 border-gray-300 text-gray-500 rounded-xl px-4 py-2 hover:bg-gray-100 transition">
              Batalkan
            </button>
          )}
          {order.status === "dibatalkan" && (
            <button className="text-sm font-semibold bg-[#4d7c0f] text-white rounded-xl px-4 py-2 hover:bg-[#3a5a00] transition">
              Beli Lagi
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function PesananSaya() {
  const [activeTab, setActiveTab] = useState<OrderStatus>("semua");

  const filtered = orders.filter(o => activeTab === "semua" || o.status === activeTab);

  return (
    <div className="min-h-screen bg-[#f7f9f4] font-sans flex flex-col">

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Pesanan Saya</h1>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-2xl p-1.5 shadow-sm mb-6 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 min-w-fit text-sm font-semibold px-4 py-2.5 rounded-xl transition whitespace-nowrap ${
                activeTab === tab.key
                  ? "bg-[#4d7c0f] text-white"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">📦</p>
            <p className="font-semibold">Belum ada pesanan</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(order => <OrderCard key={order.id} order={order} />)}
          </div>
        )}
      </main>

    </div>
  );
}